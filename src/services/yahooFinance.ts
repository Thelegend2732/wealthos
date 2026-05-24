import type { AssetCategory } from '../types';

export interface SymbolMatch {
  symbol: string;
  name: string;
  category: AssetCategory;
  currency: string;
  exchange?: string;
  quoteType?: string;
}

export interface QuoteData {
  symbol: string;
  price: number;
  currency: string;
  change: number;
  changePercent: number;
  marketState?: string;
  lastUpdated: Date;
}

const API_KEY = import.meta.env.VITE_TWELVEDATA_API_KEY || 'fe868355490048b6952e278a7a58ead6';
const BASE_URL = 'https://api.twelvedata.com';

function classifyInstrumentType(type?: string): AssetCategory {
  const t = (type ?? '').toUpperCase();
  if (t.includes('ETF')) return 'etf';
  if (t.includes('MUTUAL FUND') || t.includes('INDEX')) return 'index-fund';
  return 'stock';
}

export async function searchSymbols(query: string): Promise<SymbolMatch[]> {
  const q = query.trim();
  if (!q) return [];

  const url = `${BASE_URL}/symbol_search?symbol=${encodeURIComponent(q)}&apikey=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    
    const json = await res.json();
    const data = json.data ?? [];

    return data
      .map((item: any): SymbolMatch => ({
        symbol: item.symbol,
        name: item.instrument_name || item.symbol,
        category: classifyInstrumentType(item.instrument_type),
        currency: (item.currency || 'EUR').toUpperCase(),
        exchange: item.exchange,
        quoteType: item.instrument_type,
      }))
      .slice(0, 10);
  } catch (err) {
    console.error('[TwelveData:Search] Error buscando activo:', err);
    return [];
  }
}

export async function fetchQuote(symbol: string): Promise<QuoteData | null> {
  const url = `${BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&apikey=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    
    const data = await res.json();
    
    if (data.code || (!data.close && !data.price)) {
      console.warn(`[TwelveData:Quote] Sin datos para: ${symbol}`, data);
      return null;
    }

    const price = parseFloat(data.close || data.price);
    const change = parseFloat(data.change || '0');
    const changePercent = parseFloat(data.percent_change || '0');

    return {
      symbol: data.symbol,
      price,
      currency: (data.currency || 'USD').toUpperCase(),
      change,
      changePercent,
      lastUpdated: new Date(),
    };
  } catch (err) {
    console.error(`[TwelveData:Quote] Fallo al obtener precio para ${symbol}:`, err);
    return null;
  }
}

export async function fetchQuotes(symbols: string[]): Promise<Record<string, QuoteData>> {
  const out: Record<string, QuoteData> = {};
  if (symbols.length === 0) return out;
  
  const results = await Promise.all(symbols.map((s) => fetchQuote(s)));
  symbols.forEach((s, i) => {
    const r = results[i];
    if (r) out[s] = r;
  });
  return out;
}