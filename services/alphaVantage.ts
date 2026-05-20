import { PriceData } from '../types';
import { getCachedPrice, getStalePrice, savePriceToCache } from './priceCache';

const ALPHA_VANTAGE_KEY = process.env.EXPO_PUBLIC_ALPHA_VANTAGE_KEY ?? 'demo';
const AV_BASE = 'https://www.alphavantage.co/query';
const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

async function fetchFromAlphaVantage(symbol: string): Promise<PriceData> {
  const url = `${AV_BASE}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`AV HTTP ${res.status}`);
  const json = await res.json();

  const quote = json['Global Quote'];
  if (!quote || !quote['05. price']) {
    throw new Error('AV rate limit or invalid response');
  }

  return {
    symbol,
    price: parseFloat(quote['05. price']),
    change: parseFloat(quote['09. change']),
    changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
    lastUpdated: new Date(),
  };
}

async function fetchFromYahoo(symbol: string): Promise<PriceData> {
  const url = `${YAHOO_BASE}/${symbol}?interval=1d&range=2d`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  if (!res.ok) throw new Error(`Yahoo HTTP ${res.status}`);
  const json = await res.json();

  const meta = json?.chart?.result?.[0]?.meta;
  if (!meta) throw new Error('Yahoo invalid response');

  const price: number = meta.regularMarketPrice ?? meta.previousClose;
  const prevClose: number = meta.previousClose ?? price;
  const change = price - prevClose;
  const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

  return {
    symbol,
    price,
    change,
    changePercent,
    lastUpdated: new Date(),
  };
}

export async function fetchPrice(symbol: string): Promise<PriceData & { isDelayed?: boolean }> {
  const cached = await getCachedPrice(symbol);
  if (cached) return cached;

  try {
    const data = await fetchFromAlphaVantage(symbol);
    await savePriceToCache(symbol, data);
    return data;
  } catch {
    // Alpha Vantage failed — try Yahoo
    try {
      const data = await fetchFromYahoo(symbol);
      await savePriceToCache(symbol, data);
      return data;
    } catch {
      // Both failed — return stale cache with delayed flag
      const stale = await getStalePrice(symbol);
      if (stale) return { ...stale, isDelayed: true };
      throw new Error(`Cannot fetch price for ${symbol}`);
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchMultiplePrices(
  symbols: string[]
): Promise<Record<string, PriceData & { isDelayed?: boolean }>> {
  const results: Record<string, PriceData & { isDelayed?: boolean }> = {};

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    try {
      results[symbol] = await fetchPrice(symbol);
    } catch (e) {
      console.warn(`Failed to fetch ${symbol}:`, e);
    }
    // Respect Alpha Vantage rate limit (except after last request)
    if (i < symbols.length - 1) {
      await delay(1500);
    }
  }

  return results;
}
