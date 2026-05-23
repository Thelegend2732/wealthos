import { useState } from 'react';
import { useNews } from '../hooks/useNews';
import { PageHeader } from '../components/ui/PageHeader';
import { CategoryTabs } from '../components/news/CategoryTabs';
import { NewsCard } from '../components/news/NewsCard';
import type { NewsItem } from '../types';

export function NewsPage() {
  const [active, setActive] = useState<NewsItem['category']>('finance');
  const { news, isLoading, refresh, markRead } = useNews(active);

  return (
    <div className="space-y-5">
      <PageHeader title="Markets" subtitle="Your financial news feed" right={
        <button
          onClick={() => refresh()}
          className="w-10 h-10 rounded-full bg-primary/15 hover:bg-primary/25 text-primary flex items-center justify-center transition-all"
          aria-label="Refresh news"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      } />

      <CategoryTabs active={active} onChange={setActive} />

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5">
              <div className="skeleton h-4 w-32 rounded mb-3" />
              <div className="skeleton h-5 w-full rounded mb-2" />
              <div className="skeleton h-4 w-3/4 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {news.map((item, i) => (
            <NewsCard key={item.id} item={item} onRead={markRead} index={i} />
          ))}
          {news.length === 0 && (
            <div className="card p-12 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-text-secondary font-semibold">No articles found</p>
              <p className="text-sm text-text-muted mt-1">Try refreshing or check your NewsAPI key</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
