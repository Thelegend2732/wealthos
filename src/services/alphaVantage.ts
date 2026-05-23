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

// Mock fallback so the UI always has SOMETHING to show even without API key
const MOCK_PRICES: Record<string, { price: number; changePercent: number }> = {
  VOO: { price: 542.18, changePercent: 0.84 },
  QQQ: { price: 498.65, changePercent: 1.23 },
  SOXX: { price: 248.91, changePercent: -0.45 },
  NVDA: { price: 942.50, changePercent: 2.18 },
  ASML: { price: 894.32, changePercent: -1.12 },
};

function mockPrice(symbol: string): PriceData {
  const m = MOCK_PRICES[symbol] ?? { price: 100, changePercent: 0 };
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
