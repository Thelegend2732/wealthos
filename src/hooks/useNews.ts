import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchNews, markRead } from '../services/newsService';
import { usePortfolioStore } from '../stores/portfolioStore';
import type { NewsItem } from '../types';

export type NewsTab = 'general' | 'personal';

/**
 * Market intelligence feed. Drives two distinct streams keyed by tab:
 *
 *   • "general"  — single editorial wire, no symbol filter.
 *   • "personal" — FMP /stock_news with ?tickers=… derived dynamically
 *                  from the user's portfolio. When the portfolio changes,
 *                  the query key changes, so React Query refetches.
 *
 * Each tab maintains its own cache slot so switching is instantaneous.
 */
export function useNews(tab: NewsTab = 'general') {
  const qc = useQueryClient();

  // Pull tickers from the portfolio store. Subscribing to `assets`
  // means a buy/sell in the portfolio automatically invalidates the
  // Personal feed via the changing query key.
  const tickers = usePortfolioStore((s) =>
    s.assets.map((a) => a.symbol.toUpperCase())
  );

  // Stable cache key for the personal feed: a sorted, comma-joined list.
  // Sorting prevents key churn when assets are re-ordered in-place.
  const personalKey = [...tickers].sort().join(',');

  const queryKey =
    tab === 'personal' ? ['news', 'personal', personalKey] : ['news', 'general'];

  const query = useQuery<NewsItem[]>({
    queryKey,
    queryFn: () =>
      tab === 'personal' ? fetchNews(tickers) : fetchNews(),
    staleTime: 3 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    retry: 0,
    // No point hitting the wire with no tickers — show the onboarding
    // empty state instead.
    enabled: tab !== 'personal' || tickers.length > 0,
  });

  const handleMarkRead = (id: string) => {
    markRead(id);
    qc.setQueryData<NewsItem[]>(queryKey, (old) =>
      old?.map((i) => (i.id === id ? { ...i, isRead: true } : i))
    );
  };

  /** Hard refetch — only invalidates the CURRENT tab so pull-to-refresh
      stays scoped to whichever feed the user is looking at. */
  const handleInvalidate = () =>
    qc.invalidateQueries({ queryKey });

  return {
    news: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refresh: handleInvalidate,
    markRead: handleMarkRead,
    /** True when the Personal feed has at least one ticker to query. */
    hasTickers: tickers.length > 0,
    tickers,
  };
}
