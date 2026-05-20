import AsyncStorage from '@react-native-async-storage/async-storage';
import { PriceData } from '../types';

const CACHE_PREFIX = 'price_cache_';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface CachedEntry {
  data: PriceData;
  timestamp: number;
}

export async function getCachedPrice(symbol: string): Promise<PriceData | null> {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${symbol}`);
    if (!raw) return null;
    const entry: CachedEntry = JSON.parse(raw);
    const isExpired = Date.now() - entry.timestamp > CACHE_TTL_MS;
    if (isExpired) return null;
    return { ...entry.data, lastUpdated: new Date(entry.data.lastUpdated) };
  } catch {
    return null;
  }
}

export async function savePriceToCache(symbol: string, data: PriceData): Promise<void> {
  try {
    const entry: CachedEntry = { data, timestamp: Date.now() };
    await AsyncStorage.setItem(`${CACHE_PREFIX}${symbol}`, JSON.stringify(entry));
  } catch {
    // Silent fail — cache is best-effort
  }
}

export async function getStalePrice(symbol: string): Promise<PriceData | null> {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${symbol}`);
    if (!raw) return null;
    const entry: CachedEntry = JSON.parse(raw);
    return { ...entry.data, lastUpdated: new Date(entry.data.lastUpdated) };
  } catch {
    return null;
  }
}
