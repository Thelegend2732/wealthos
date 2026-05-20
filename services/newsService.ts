import AsyncStorage from '@react-native-async-storage/async-storage';
import { NewsItem } from '../types';

const NEWS_API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY ?? '';
const NEWS_BASE = 'https://newsapi.org/v2/everything';
const CACHE_PREFIX = 'news_cache_';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const READ_STATE_KEY = 'news_read_state';

const QUERIES: Record<NewsItem['category'], string> = {
  finance: 'NVDA OR ASML OR VOO OR semiconductor stocks',
  tech: 'semiconductor AI chips NVIDIA ASML Taiwan',
  lifestyle: 'luxury watches mechanical horology Rolex Patek',
};

interface CachedNews {
  items: Omit<NewsItem, 'isRead'>[];
  timestamp: number;
}

async function getReadState(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(READ_STATE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export async function markAsRead(id: string): Promise<void> {
  try {
    const state = await getReadState();
    state.add(id);
    await AsyncStorage.setItem(READ_STATE_KEY, JSON.stringify([...state]));
  } catch {
    // Silent fail
  }
}

async function fetchFromAPI(
  category: NewsItem['category']
): Promise<Omit<NewsItem, 'isRead'>[]> {
  const query = encodeURIComponent(QUERIES[category]);
  const url = `${NEWS_BASE}?q=${query}&sortBy=publishedAt&pageSize=20&language=en&apiKey=${NEWS_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NewsAPI HTTP ${res.status}`);
  const json = await res.json();

  if (json.status !== 'ok') throw new Error(json.message ?? 'NewsAPI error');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (json.articles as any[]).map((article, idx) => ({
    id: `${category}_${idx}_${Date.now()}`,
    title: article.title ?? 'No title',
    description: article.description ?? '',
    url: article.url ?? '',
    imageUrl: article.urlToImage ?? undefined,
    source: article.source?.name ?? 'Unknown',
    publishedAt: new Date(article.publishedAt),
    category,
  }));
}

export async function fetchNews(category: NewsItem['category']): Promise<NewsItem[]> {
  const cacheKey = `${CACHE_PREFIX}${category}`;

  // Try cache first
  try {
    const raw = await AsyncStorage.getItem(cacheKey);
    if (raw) {
      const cached: CachedNews = JSON.parse(raw);
      const isExpired = Date.now() - cached.timestamp > CACHE_TTL_MS;
      if (!isExpired) {
        const readState = await getReadState();
        return cached.items.map((item) => ({
          ...item,
          publishedAt: new Date(item.publishedAt),
          isRead: readState.has(item.id),
        }));
      }
    }
  } catch {
    // Cache miss — continue to API
  }

  // Fetch from API
  try {
    const items = await fetchFromAPI(category);
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({ items, timestamp: Date.now() })
    );
    const readState = await getReadState();
    return items.map((item) => ({
      ...item,
      isRead: readState.has(item.id),
    }));
  } catch (e) {
    // API failed — try stale cache
    try {
      const raw = await AsyncStorage.getItem(cacheKey);
      if (raw) {
        const cached: CachedNews = JSON.parse(raw);
        const readState = await getReadState();
        return cached.items.map((item) => ({
          ...item,
          publishedAt: new Date(item.publishedAt),
          isRead: readState.has(item.id),
        }));
      }
    } catch {
      // Nothing to show
    }

    // Return mock items when no API key configured
    if (!NEWS_API_KEY || NEWS_API_KEY === 'your_key_here') {
      return getMockNews(category);
    }

    throw e;
  }
}

function getMockNews(category: NewsItem['category']): NewsItem[] {
  const mockData: Omit<NewsItem, 'isRead'>[] = [
    {
      id: `mock_${category}_1`,
      title: category === 'finance' ? 'NVIDIA Surges 5% on Strong Earnings Beat' :
             category === 'tech' ? 'ASML Reports Record Chip Equipment Orders' :
             'Rolex Daytona Sets New Auction Record at Sothebys',
      description: category === 'finance'
        ? 'NVIDIA Corporation reported quarterly earnings that exceeded analyst expectations, driven by surging AI chip demand from data center operators worldwide.'
        : category === 'tech'
        ? 'ASML Holding, the Dutch semiconductor equipment maker, reported record orders driven by demand for EUV lithography machines from leading chip manufacturers.'
        : 'A vintage Rolex Daytona Paul Newman sold for $17.8 million at auction, setting a new record for the iconic timepiece.',
      url: 'https://example.com/news/1',
      source: category === 'finance' ? 'Bloomberg' : category === 'tech' ? 'Reuters' : 'WatchTime',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      category,
    },
    {
      id: `mock_${category}_2`,
      title: category === 'finance' ? 'S&P 500 Hits New All-Time High on Fed Optimism' :
             category === 'tech' ? 'Taiwan Semiconductor Expands US Production Capacity' :
             'Patek Philippe Releases Limited Edition Annual Calendar',
      description: category === 'finance'
        ? 'US equity markets rallied to record highs as investors interpreted Federal Reserve commentary as signaling a potential pause in rate hikes heading into year-end.'
        : category === 'tech'
        ? 'Taiwan Semiconductor Manufacturing Company announced plans to double its Arizona facility output capacity, a move cheered by US government officials focused on domestic chip production.'
        : 'Patek Philippe unveiled a new limited edition Annual Calendar reference at Geneva Watch Days, with only 200 pieces available globally.',
      url: 'https://example.com/news/2',
      source: category === 'finance' ? 'CNBC' : category === 'tech' ? 'The Verge' : 'Hodinkee',
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      category,
    },
    {
      id: `mock_${category}_3`,
      title: category === 'finance' ? 'VOO ETF Sees Record Weekly Inflows of $4.2B' :
             category === 'tech' ? 'Intel vs AMD: Next-Gen GPU Architecture Comparison' :
             'The Complete Guide to Watch Investment in 2025',
      description: 'Add your NewsAPI key to .env.local to see real news articles. This is a placeholder article shown when the API key is not configured.',
      url: 'https://newsapi.org',
      source: 'WealthOS Demo',
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      category,
    },
  ];

  return mockData.map((item) => ({ ...item, isRead: false }));
}
