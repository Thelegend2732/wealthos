import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchNews, markRead } from '../services/newsService';
import type { NewsItem } from '../types';

export function useNews(category: NewsItem['category']) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['news', category],
    queryFn: () => fetchNews(category),
    // Poll every 3 minutes in the background so headlines stay fresh
    // without forcing the user to refresh manually. Combined with the
    // service's cache-busting fetch, the wire always wins.
    staleTime: 3 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    retry: 0,
  });

  const handleMarkRead = (id: string) => {
    markRead(id);
    qc.setQueryData<NewsItem[]>(['news', category], (old) =>
      old?.map((i) => (i.id === id ? { ...i, isRead: true } : i))
    );
  };

  return {
    news: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refresh: query.refetch,
    markRead: handleMarkRead,
  };
}
