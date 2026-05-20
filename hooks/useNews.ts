import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchNews, markAsRead } from '../services/newsService';
import { NewsItem } from '../types';

export function useNews(category: NewsItem['category']) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['news', category],
    queryFn: () => fetchNews(category),
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    queryClient.setQueryData<NewsItem[]>(['news', category], (old) =>
      old?.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
  };

  return {
    news: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refresh: query.refetch,
    markAsRead: handleMarkAsRead,
  };
}
