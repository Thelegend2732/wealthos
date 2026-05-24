/**
 * Yahoo Finance integration (search + spot quotes) plus EUR FX conversion.
 *
 * Yahoo's endpoints don't send CORS headers, so all browser calls go through
 * a proxy. We try a chain of free proxies in order; the first that returns
 * a 200 wins. Override the priority list via `VITE_CORS_PROXY` in `.env`
 * (comma-separated). All proxy URLs MUST end with the part where the target
 * URL is appended (e.g. `https://corsproxy.io/?url=`).
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

// Priority list of CORS proxies. corsproxy.io is the primary (most reliable
// for Yahoo as of mid-2026); allorigins is the fallback. Override via env.
const ENV_PROXY = (import.meta.env.VITE_CORS_PROXY as string | undefined) || '';
const PROXIES: string[] = ENV_PROXY
  ? ENV_PROXY.split(',').map((s) => s.trim()).filter(Boolean)
  : [
      'https://corsproxy.io/?url=',
      'https://api.allorigins.win/raw?url=',
    ];

function classifyQuoteType(qt?: string): AssetCategory {
  const t = (qt ?? '').toUpperCase();
  if (t === 'ETF') return 'etf';
  if (t === 'MUTUALFUND' || t === 'INDEX') return 'index-fund';
  return 'stock';
}

const CACHE_PREFIX = 'wealthos:yfquote:';
const CACHE_TTL = 60 * 1000; // 1 minute

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

/**
 * Fetches a URL through whichever CORS proxy responds first. Logs the proxy
 * name and HTTP status on failure so production debugging is possible from
 * the browser console.
 */
async function proxiedFetchJSON<T>(targetUrl: string, label: string): Promise<T> {
  let lastError: unknown = null;
  for (const proxy of PROXIES) {
    const url = `${proxy}${encodeURIComponent(targetUrl)}`;
    try {
      const res = await fetch(url, {
        // Force the BROWSER cache off — proxies sometimes set Cache-Control
        // headers that pin stale Yahoo responses for hours.
        cache: 'no-store',
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) {
        console.error(`[yahoo:${label}] proxy ${proxy} → HTTP ${res.status}`);
        lastError = new Error(`HTTP ${res.status}`);
        continue;
      }
      const text = await res.text();
      try {
        return JSON.parse(text) as T;
      } catch (parseErr) {
        // allorigins sometimes wraps the response — try .contents
        try {
          const wrapped = JSON.parse(text) as { contents?: string };
          if (wrapped.contents) return JSON.parse(wrapped.contents) as T;
        } catch {
          /* fallthrough */
        }
        console.error(`[yahoo:${label}] proxy ${proxy} → invalid JSON`, parseErr);
        lastError = parseErr;
        continue;
      }
    } catch (err) {
      console.error(`[yahoo:${label}] proxy ${proxy} → fetch error`, err);
      lastError = err;
    }
  }
  throw lastError ?? new Error('All CORS proxies failed');
}

/**
 * Search the global Yahoo Finance universe. Returns [] on failure — never
 * throws, so callers can render an empty state instead of crashing.
 */
export async function searchSymbols(query: string): Promise<SymbolMatch[]> {
  const q = query.trim();
  if (!q) return [];

  // Cache-bust the underlying Yahoo call so the proxy never serves a stale
  // result keyed on the URL.
  const target = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0&lang=es-ES&region=ES&_=${Date.now()}`;

  try {
    const json = await proxiedFetchJSON<{
      quotes?: Array<{
        symbol: string;
        shortname?: string;
        longname?: string;
        quoteType?: string;
        exchDisp?: string;
        exchange?: string;
        currency?: string;
      }>;
    }>(target, 'search');

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
  } catch (err) {
    console.error('[yahoo:search] giving up after all proxies failed', err);
    return [];
  }
}

/**
 * Fetch a single quote in the asset's NATIVE currency.
 */
export async function fetchQuote(symbol: string): Promise<QuoteData | null> {
  const cached = getCachedQuote(symbol);
  if (cached) return cached;

  const target = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d&_=${Date.now()}`;

  try {
    const json = await proxiedFetchJSON<{
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
    }>(target, `quote:${symbol}`);

    const r = json.chart?.result?.[0];
    const m = r?.meta;
    if (!m || typeof m.regularMarketPrice !== 'number') {
      console.error(`[yahoo:quote:${symbol}] no regularMarketPrice in payload`, json);
      return null;
    }

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
  } catch (err) {
    console.error(`[yahoo:quote:${symbol}] all proxies failed`, err);
    return null;
  }
}

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
