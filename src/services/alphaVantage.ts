import type { PriceData } from '../types';

const CACHE_PREFIX = 'wealthos:price:';
const CACHE_TTL = 15 * 60 * 1000;
const ALPHA_KEY = (import.meta.env.VITE_ALPHA_VANTAGE_KEY as string) || 'demo';

interface Cached {
  data: PriceData;
  timestamp: number;
}

function getCached(symbol: string): PriceData | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${symbol}`);
    if (!raw) return null;
    const c: Cached = JSON.parse(raw);
    if (Date.now() - c.timestamp > CACHE_TTL) return null;
    return { ...c.data, lastUpdated: new Date(c.data.lastUpdated) };
  } catch {
    return null;
  }
}

function getStale(symbol: string): PriceData | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${symbol}`);
    if (!raw) return null;
    const c: Cached = JSON.parse(raw);
    return { ...c.data, lastUpdated: new Date(c.data.lastUpdated), isDelayed: true };
  } catch {
    return null;
  }
}

function setCached(symbol: string, data: PriceData) {
  try {
    localStorage.setItem(
      `${CACHE_PREFIX}${symbol}`,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    /* ignore quota */
  }
}

async function fetchAV(symbol: string): Promise<PriceData> {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`AV HTTP ${res.status}`);
  const json = await res.json();
  const q = json['Global Quote'];
  if (!q || !q['05. price']) throw new Error('AV rate limit');
  return {
    symbol,
    price: parseFloat(q['05. price']),
    change: parseFloat(q['09. change']),
    changePercent: parseFloat(q['10. change percent'].replace('%', '')),
    lastUpdated: new Date(),
  };
}

// Mock fallback so the UI always has SOMETHING to show even without API key.
// Prices are approximate USD values as of mid-2025.
const MOCK_PRICES: Record<string, { price: number; changePercent: number }> = {
  // Index ETFs
  VOO:  { price: 542.18, changePercent:  0.84 },
  VTI:  { price: 278.45, changePercent:  0.62 },
  VT:   { price: 118.32, changePercent:  0.41 },
  SPY:  { price: 540.10, changePercent:  0.77 },
  QQQ:  { price: 498.65, changePercent:  1.23 },
  IVV:  { price: 541.80, changePercent:  0.80 },
  // Sector / thematic ETFs
  SOXX: { price: 248.91, changePercent: -0.45 },
  SMH:  { price: 278.60, changePercent:  1.05 },
  XLK:  { price: 236.40, changePercent:  0.92 },
  ARKK: { price:  56.30, changePercent:  1.80 },
  // Large-cap stocks
  MSFT: { price: 430.50, changePercent:  0.75 },
  AAPL: { price: 215.40, changePercent:  0.52 },
  NVDA: { price: 942.50, changePercent:  2.18 },
  GOOGL:{ price: 175.20, changePercent:  0.88 },
  GOOG: { price: 176.10, changePercent:  0.87 },
  AMZN: { price: 195.30, changePercent:  1.12 },
  META: { price: 530.80, changePercent:  1.35 },
  TSLA: { price: 248.60, changePercent:  2.10 },
  ASML: { price: 894.32, changePercent: -1.12 },
  AMD:  { price: 168.90, changePercent:  1.65 },
  INTC: { price:  31.20, changePercent: -0.40 },
  TSM:  { price: 185.40, changePercent:  0.95 },
  // Financial / other
  BRK:  { price: 453.20, changePercent:  0.30 },
  JPM:  { price: 234.10, changePercent:  0.45 },
  V:    { price: 310.50, changePercent:  0.38 },
};

/** Symbols for which we have a curated mock price (not the generic 100 fallback). */
export const KNOWN_MOCK_SYMBOLS = new Set(Object.keys(MOCK_PRICES));

/**
 * Curated catalog of well-known instruments. Used by the AssetForm search.
 * Each entry is a real, tradable ticker — saving is blocked for anything not
 * found via this catalog (or via Alpha Vantage SYMBOL_SEARCH when available).
 */
export interface SymbolMatch {
  symbol: string;
  name: string;
  category: 'index-fund' | 'etf' | 'stock';
  currency: 'USD' | 'EUR';
  exchange?: string;
}

const CATALOG: SymbolMatch[] = [
  // Index ETFs
  { symbol: 'VOO',  name: 'Vanguard S&P 500 ETF',            category: 'index-fund', currency: 'USD', exchange: 'NYSE Arca' },
  { symbol: 'VTI',  name: 'Vanguard Total Stock Market ETF', category: 'index-fund', currency: 'USD', exchange: 'NYSE Arca' },
  { symbol: 'VT',   name: 'Vanguard Total World Stock ETF',  category: 'index-fund', currency: 'USD', exchange: 'NYSE Arca' },
  { symbol: 'SPY',  name: 'SPDR S&P 500 ETF Trust',          category: 'index-fund', currency: 'USD', exchange: 'NYSE Arca' },
  { symbol: 'QQQ',  name: 'Invesco QQQ Trust (Nasdaq 100)',  category: 'index-fund', currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'IVV',  name: 'iShares Core S&P 500 ETF',        category: 'index-fund', currency: 'USD', exchange: 'NYSE Arca' },
  // Thematic / sector ETFs
  { symbol: 'SOXX', name: 'iShares Semiconductor ETF',                 category: 'etf', currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'SMH',  name: 'VanEck Semiconductor ETF',                  category: 'etf', currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'XLK',  name: 'Technology Select Sector SPDR Fund',        category: 'etf', currency: 'USD', exchange: 'NYSE Arca' },
  { symbol: 'ARKK', name: 'ARK Innovation ETF',                        category: 'etf', currency: 'USD', exchange: 'NYSE Arca' },
  { symbol: 'WSMG', name: 'iShares MSCI Global Semiconductors UCITS',  category: 'etf', currency: 'USD', exchange: 'LSE' },
  // Mega-cap stocks
  { symbol: 'AAPL', name: 'Apple Inc.',                       category: 'stock', currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation',            category: 'stock', currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation',               category: 'stock', currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'GOOGL',name: 'Alphabet Inc. Class A',            category: 'stock', currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'GOOG', name: 'Alphabet Inc. Class C',            category: 'stock', currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.',                  category: 'stock', currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms Inc.',              category: 'stock', currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.',                       category: 'stock', currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'ASML', name: 'ASML Holding N.V.',                category: 'stock', currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'AMD',  name: 'Advanced Micro Devices Inc.',      category: 'stock', currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'INTC', name: 'Intel Corporation',                category: 'stock', currency: 'USD', exchange: 'NASDAQ' },
  { symbol: 'TSM',  name: 'Taiwan Semiconductor Manufacturing', category: 'stock', currency: 'USD', exchange: 'NYSE' },
  { symbol: 'JPM',  name: 'JPMorgan Chase & Co.',             category: 'stock', currency: 'USD', exchange: 'NYSE' },
  { symbol: 'V',    name: 'Visa Inc.',                        category: 'stock', currency: 'USD', exchange: 'NYSE' },
];

const CATALOG_MAP = new Map(CATALOG.map((c) => [c.symbol, c]));

/** Get an exact catalog match for a ticker symbol, or null. */
export function findSymbol(symbol: string): SymbolMatch | null {
  return CATALOG_MAP.get(symbol.toUpperCase()) ?? null;
}

/**
 * Fuzzy-search the catalog by ticker or company name. Falls back to Alpha
 * Vantage SYMBOL_SEARCH when the local catalog has no good match (the API
 * call is rate-limited, so we only fire it for queries ≥ 2 chars and when
 * the local result set is empty).
 */
export async function searchSymbols(query: string): Promise<SymbolMatch[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const local = CATALOG.filter(
    (c) =>
      c.symbol.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q)
  ).slice(0, 8);

  if (local.length > 0) return local;

  // Remote fallback — best-effort, swallow rate-limit errors silently
  try {
    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(q)}&apikey=${ALPHA_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    const matches = (json.bestMatches ?? []) as Array<Record<string, string>>;
    return matches.slice(0, 8).map((m) => {
      const type = (m['3. type'] ?? '').toLowerCase();
      return {
        symbol: m['1. symbol'] ?? '',
        name: m['2. name'] ?? '',
        category: type.includes('etf')
          ? 'etf'
          : type.includes('fund')
            ? 'index-fund'
            : 'stock',
        currency: (m['8. currency'] === 'EUR' ? 'EUR' : 'USD') as 'USD' | 'EUR',
        exchange: m['4. region'],
      } satisfies SymbolMatch;
    }).filter((m) => m.symbol);
  } catch {
    return [];
  }
}

function mockPrice(symbol: string): PriceData {
  const m = MOCK_PRICES[symbol] ?? { price: 0, changePercent: 0 };
  const change = (m.price * m.changePercent) / 100;
  return {
    symbol,
    price: m.price,
    change,
    changePercent: m.changePercent,
    lastUpdated: new Date(),
    isDelayed: true,
  };
}

export async function fetchPrice(symbol: string): Promise<PriceData> {
  const cached = getCached(symbol);
  if (cached) return cached;

  try {
    const data = await fetchAV(symbol);
    setCached(symbol, data);
    return data;
  } catch {
    const stale = getStale(symbol);
    if (stale) return stale;
    return mockPrice(symbol);
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchMultiplePrices(
  symbols: string[]
): Promise<Record<string, PriceData>> {
  const out: Record<string, PriceData> = {};
  // Always serve cached/mock immediately for instant UX
  symbols.forEach((s) => {
    const c = getCached(s);
    if (c) out[s] = c;
    else out[s] = mockPrice(s);
  });

  // Fire-and-attempt real fetches with rate limiting in the background
  for (let i = 0; i < symbols.length; i++) {
    try {
      const data = await fetchAV(symbols[i]);
      setCached(symbols[i], data);
      out[symbols[i]] = data;
    } catch {
      /* keep mock */
    }
    if (i < symbols.length - 1) await delay(1500);
  }

  return out;
}
