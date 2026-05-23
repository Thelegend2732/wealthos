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
    <div className="space-y-6">
      <PageHeader
        title="Markets"
        subtitle="Curated financial news"
        right={
          <button onClick={() => refresh()} className="icon-btn" aria-label="Refresh news">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        }
      />

      <CategoryTabs active={active} onChange={setActive} />

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-7">
              <div className="skeleton h-3 w-32 mb-4" />
              <div className="skeleton h-5 w-3/4 mb-3" />
              <div className="skeleton h-4 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {news.map((item, i) => (
            <NewsCard key={item.id} item={item} onRead={markRead} index={i} />
          ))}
          {news.length === 0 && (
            <div className="card p-16 text-center">
              <p className="text-text-primary font-medium">No articles found</p>
              <p className="text-sm text-text-muted mt-1">Try refreshing or check your NewsAPI key</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
