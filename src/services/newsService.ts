/**
 * Market intelligence feed.
 *
 * Primary source: Financial Modeling Prep /stock_news (clean JSON with
 *   { title, text, image, publishedDate, url, site, symbol }).
 * Fallback:       Yahoo Finance global RSS, routed through the same CORS
 *                 proxy chain used by yahooFinance.ts, parsed via DOMParser.
 *
 * Mocks have been purged from this file — if both upstream sources fail
 * the consumer will receive an empty array and the UI shows an empty
 * state. That's intentional: stale mock headlines from 2024 hurt the
 * product more than an honest "no data" message.
 */

import type { NewsItem } from '../types';

const FMP_KEY =
  (import.meta.env.VITE_FMP_API_KEY as string | undefined) ||
  'jvtZ85g8uI5Yx5noeU6g8bewtoFt8UrY';

const READ_KEY = 'wealthos:news-read';

const CORS_PROXIES: string[] = (
  (import.meta.env.VITE_CORS_PROXY as string | undefined) ||
  'https://api.allorigins.win/raw?url=,https://corsproxy.io/?url='
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * Sources we'll surface on the General feed. Matched case-insensitively
 * against FMP's `site` field as a substring, so "bloomberg.com",
 * "Bloomberg" and "www.bloomberg.com" all qualify.
 */
const PREMIUM_SOURCES: readonly string[] = [
  'bloomberg',
  'reuters',
  'wall street journal',
  'wsj',
  'financial times',
  'ft.com',
  'cnbc',
  'yahoo',          // Yahoo Finance
  'marketwatch',
  'forbes',
  'barron',         // Barron's
  'seeking alpha',
  'investing.com',
  'benzinga',
  'morningstar',
  'business insider',
];

function isPremiumSource(site: string | undefined | null): boolean {
  if (!site) return false;
  const s = site.toLowerCase();
  return PREMIUM_SOURCES.some((p) => s.includes(p));
}

/**
 * Strip Yahoo-style exchange suffixes so the ticker is something FMP can
 * actually look up (ASML.AS -> ASML, MC.PA -> MC, 005930.KS -> 005930).
 * Cross-listed equities are usually findable under their US root, which
 * is what FMP indexes.
 */
function normalizeTickerForFMP(symbol: string): string {
  return symbol.toUpperCase().split('.')[0];
}

/* ─── read-state persistence (unchanged from the previous service) ──── */

function getReadSet(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function markRead(id: string) {
  const set = getReadSet();
  set.add(id);
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

/* ─── FMP primary fetcher ───────────────────────────────────────────── */

interface FmpNewsItem {
  symbol?: string;
  publishedDate?: string;
  title?: string;
  image?: string;
  site?: string;
  text?: string;
  url?: string;
}

async function fetchFromFMP(tickers?: string[]): Promise<NewsItem[]> {
  // Cache-bust on every call so neither the browser nor any CDN can pin
  // a stale wire feed. When tickers are supplied we hit FMP's native
  // per-symbol filter (?tickers=AAPL,MSFT,…) so the response is already
  // restricted to the user's portfolio — no client-side filtering needed.
  // FMP filters happen on the bare US root ticker. Normalising here means
  // a portfolio holding "ASML.AS" still returns ASML headlines.
  const normalised = (tickers ?? [])
    .map(normalizeTickerForFMP)
    .filter(Boolean);
  // Dedupe in case the user holds two share classes of the same root
  const unique = Array.from(new Set(normalised));

  // FMP's news endpoint only accepts up to ~50 tickers per call; cap to
  // 25 so the URL stays well under any proxy length limit.
  const limited = unique.slice(0, 25);

  const params = new URLSearchParams({ limit: '25', apikey: FMP_KEY });
  if (limited.length > 0) {
    params.set('tickers', limited.join(','));
  }
  params.set('_', String(Date.now()));
  const url = `https://financialmodelingprep.com/api/v3/stock_news?${params.toString()}`;
  const res = await fetch(url, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    console.error(`[news:fmp] HTTP ${res.status}`);
    throw new Error(`FMP news HTTP ${res.status}`);
  }
  const json = (await res.json()) as FmpNewsItem[];
  if (!Array.isArray(json)) {
    console.error('[news:fmp] unexpected payload shape', json);
    throw new Error('FMP news payload not an array');
  }

  const readSet = getReadSet();
  return json
    .filter((n) => n.title && n.url)
    .slice(0, 25)
    .map<NewsItem>((n, i) => {
      const id = `fmp-${n.url ?? i}-${n.publishedDate ?? ''}`;
      return {
        id,
        title: n.title!,
        description: n.text ?? '',
        url: n.url ?? '#',
        imageUrl: n.image || undefined,
        source: n.site || n.symbol || 'Mercado',
        publishedAt: n.publishedDate ? new Date(n.publishedDate) : new Date(),
        category: 'finance',
        isRead: readSet.has(id),
      };
    });
}

/* ─── Yahoo Finance RSS fallback ────────────────────────────────────── */

async function fetchYahooRSSThroughProxy(): Promise<string> {
  const target = `https://finance.yahoo.com/news/rssindex?_=${Date.now()}`;
  let lastError: unknown = null;
  for (const proxy of CORS_PROXIES) {
    try {
      const res = await fetch(`${proxy}${encodeURIComponent(target)}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        console.error(`[news:yahoo-rss] proxy ${proxy} → HTTP ${res.status}`);
        lastError = new Error(`HTTP ${res.status}`);
        continue;
      }
      return await res.text();
    } catch (err) {
      console.error(`[news:yahoo-rss] proxy ${proxy} → error`, err);
      lastError = err;
    }
  }
  throw lastError ?? new Error('No proxy returned a Yahoo RSS body');
}

function parseRSS(xml: string): NewsItem[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) {
    console.error('[news:yahoo-rss] DOMParser parsererror');
    return [];
  }
  const items = Array.from(doc.querySelectorAll('item'));
  const readSet = getReadSet();
  return items.slice(0, 25).map<NewsItem>((el, i) => {
    const title       = el.querySelector('title')?.textContent?.trim() || 'Sin título';
    const link        = el.querySelector('link')?.textContent?.trim()  || '#';
    const description = el.querySelector('description')?.textContent?.trim() || '';
    const pubDate     = el.querySelector('pubDate')?.textContent?.trim();
    const source      =
      el.querySelector('source')?.textContent?.trim() ||
      (() => { try { return new URL(link).hostname.replace(/^www\./, ''); } catch { return 'Yahoo Finance'; } })();
    const id = `yrss-${link}-${i}`;
    return {
      id,
      title,
      description: stripHtml(description),
      url: link,
      source,
      publishedAt: pubDate ? new Date(pubDate) : new Date(),
      category: 'finance',
      isRead: readSet.has(id),
    };
  });
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/* ─── Public entry point ────────────────────────────────────────────── */

/** Strict chronological ordering — most recent first. Applied to every
    returned array so the UI never has to re-sort. */
function sortByRecency(items: NewsItem[]): NewsItem[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/**
 * Fetch the market intelligence feed.
 *
 * @param tickers When non-empty, hits FMP's per-symbol filter so the
 *   result is restricted to those companies. Used by the "Para ti"
 *   personalised feed driven by the user's portfolio.
 *
 * When tickers are supplied the Yahoo RSS fallback is skipped — that
 * feed is generic, so falling back to it for a personalised request
 * would silently break the contract and show unrelated headlines.
 */
export async function fetchNews(tickers?: string[]): Promise<NewsItem[]> {
  const personalised = !!tickers && tickers.length > 0;

  // FMP first — clean JSON, fastest, supports per-symbol filtering
  try {
    const items = await fetchFromFMP(tickers);
    if (items.length > 0) {
      // Premium whitelist applies only to the General feed. On the
      // Personal feed every headline that mentions the user's ticker
      // is signal, regardless of publisher.
      const filtered = personalised
        ? items
        : items.filter((it) => isPremiumSource(it.source));
      // Safety net: if the whitelist would empty the feed entirely
      // (FMP's free tier sometimes returns zero premium sources in a
      // batch), fall back to the unfiltered set so users never see an
      // empty General page.
      const out = filtered.length >= 3 ? filtered : items;
      return sortByRecency(out);
    }
    console.warn(
      `[news] FMP returned an empty list${personalised ? ' for personalised feed' : ''}`,
    );
  } catch (err) {
    console.error('[news] FMP failed', err);
  }

  // Yahoo RSS fallback ONLY for the global feed — RSS is unfiltered, so
  // serving it on a personalised request would mislead the user.
  if (personalised) return [];

  try {
    const xml = await fetchYahooRSSThroughProxy();
    return sortByRecency(parseRSS(xml));
  } catch (err) {
    console.error('[news] Yahoo RSS fallback also failed', err);
    return [];
  }
}
