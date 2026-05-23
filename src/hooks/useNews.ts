import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchNews, markRead } from '../services/newsService';
import type { NewsItem } from '../types';

export function useNews(category: NewsItem['category']) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['news', category],
    queryFn: () => fetchNews(category),
    staleTime: 60 * 60 * 1000,
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
