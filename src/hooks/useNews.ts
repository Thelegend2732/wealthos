import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchNews, markRead } from '../services/newsService';
import type { NewsItem } from '../types';

/**
 * Single unified market-intelligence feed. No category filter — Strategy&
 * style: one editorial stream, sorted by date, refreshed every 3 minutes.
 */
export function useNews() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['news'],
    queryFn: fetchNews,
    staleTime: 3 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    retry: 0,
  });

  const handleMarkRead = (id: string) => {
    markRead(id);
    qc.setQueryData<NewsItem[]>(['news'], (old) =>
      old?.map((i) => (i.id === id ? { ...i, isRead: true } : i))
    );
  };

  const handleInvalidate = () =>
    qc.invalidateQueries({ queryKey: ['news'] });

  return {
    news: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    /** Hard refetch — used by pull-to-refresh and the refresh button. */
    refresh: handleInvalidate,
    markRead: handleMarkRead,
  };
}
