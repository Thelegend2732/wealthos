/**
 * Yahoo Finance integration (search + spot quotes) plus EUR FX conversion.
 *
 * Yahoo's endpoints don't send CORS headers, so all browser calls go through
 * a configurable proxy. Override the proxy via `VITE_CORS_PROXY` in `.env`
 * (default: api.allorigins.win — free, no key, works from anywhere).
 *
 * If both Yahoo and the proxy fail, callers should treat the result as an
 * empty list / unknown price rather than crashing the UI.
 */

import type { AssetCategory } from '../types';

export interface SymbolMatch {
  symbol: string;
  name: string;
  category: AssetCategory;
  currency: string;       // native ticker currency, e.g. "USD", "EUR", "GBP"
  exchange?: string;
  quoteType?: string;
}

export interface QuoteData {
  symbol: string;
  price: number;          // in the ticker's NATIVE currency
  currency: string;
  change: number;
  changePercent: number;
  marketState?: string;
  lastUpdated: Date;
}

const PROXY =
  (import.meta.env.VITE_CORS_PROXY as string | undefined) ??
  'https://api.allorigins.win/raw?url=';

function proxied(url: string): string {
  if (!PROXY) return url;
  return `${PROXY}${encodeURIComponent(url)}`;
}

function classifyQuoteType(qt?: string): AssetCategory {
  const t = (qt ?? '').toUpperCase();
  if (t === 'ETF') return 'etf';
  if (t === 'MUTUALFUND' || t === 'INDEX') return 'index-fund';
  return 'stock';
}

const CACHE_PREFIX = 'wealthos:yfquote:';
const CACHE_TTL = 60 * 1000; // 1 minute — quotes feel "live" but we don't spam

interface Cached { data: QuoteData; ts: number; }

function getCachedQuote(symbol: string): QuoteData | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${symbol}`);
    if (!raw) return null;
    const c: Cached = JSON.parse(raw);
    if (Date.now() - c.ts > CACHE_TTL) return null;
    return { ...c.data, lastUpdated: new Date(c.data.lastUpdated) };
  } catch {
    return null;
  }
}

function setCachedQuote(symbol: string, data: QuoteData) {
  try {
    localStorage.setItem(
      `${CACHE_PREFIX}${symbol}`,
      JSON.stringify({ data, ts: Date.now() })
    );
  } catch {
    /* quota */
  }
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

/**
 * Search the global Yahoo Finance universe. Matches stocks, ETFs, mutual funds
 * and indexes across every exchange Yahoo covers (US, EU, Asia, etc.) — so it
 * happily resolves "Fidelity S&P 500 Index P EUR" or "SK Hynix" as well as
 * plain tickers like "NVDA".
 */
export async function searchSymbols(query: string): Promise<SymbolMatch[]> {
  const q = query.trim();
  if (!q) return [];

  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0&lang=es-ES&region=ES`;

  try {
    const json = await fetchJSON<{
      quotes?: Array<{
        symbol: string;
        shortname?: string;
        longname?: string;
        quoteType?: string;
        exchDisp?: string;
        exchange?: string;
        currency?: string;
      }>;
    }>(proxied(url));

    const quotes = json.quotes ?? [];
    return quotes
      .filter((q) => q.symbol && (q.shortname || q.longname))
      .map<SymbolMatch>((q) => ({
        symbol: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        category: classifyQuoteType(q.quoteType),
        currency: (q.currency || 'USD').toUpperCase(),
        exchange: q.exchDisp || q.exchange,
        quoteType: q.quoteType,
      }))
      .slice(0, 10);
  } catch {
    return [];
  }
}

/**
 * Fetch a single quote in the asset's NATIVE currency. Conversion to EUR is
 * handled separately by the FX layer so this function stays pure.
 */
export async function fetchQuote(symbol: string): Promise<QuoteData | null> {
  const cached = getCachedQuote(symbol);
  if (cached) return cached;

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;

  try {
    const json = await fetchJSON<{
      chart?: {
        result?: Array<{
          meta?: {
            regularMarketPrice?: number;
            chartPreviousClose?: number;
            previousClose?: number;
            currency?: string;
            marketState?: string;
          };
        }>;
        error?: unknown;
      };
    }>(proxied(url));

    const r = json.chart?.result?.[0];
    const m = r?.meta;
    if (!m || typeof m.regularMarketPrice !== 'number') return null;

    const price = m.regularMarketPrice;
    const prev = m.chartPreviousClose ?? m.previousClose ?? price;
    const change = price - prev;
    const changePercent = prev > 0 ? (change / prev) * 100 : 0;

    const data: QuoteData = {
      symbol,
      price,
      currency: (m.currency || 'USD').toUpperCase(),
      change,
      changePercent,
      marketState: m.marketState,
      lastUpdated: new Date(),
    };
    setCachedQuote(symbol, data);
    return data;
  } catch {
    return null;
  }
}

/** Fetch many quotes in parallel — Yahoo's chart endpoint doesn't rate-limit
    aggressively for small batches, so this is safe for typical portfolios. */
export async function fetchQuotes(
  symbols: string[]
): Promise<Record<string, QuoteData>> {
  const out: Record<string, QuoteData> = {};
  const results = await Promise.all(symbols.map((s) => fetchQuote(s)));
  symbols.forEach((s, i) => {
    const r = results[i];
    if (r) out[s] = r;
  });
  return out;
}
