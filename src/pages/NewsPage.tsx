import { useEffect, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useNews } from '../hooks/useNews';
import { PageHeader } from '../components/ui/PageHeader';
import { CategoryTabs } from '../components/news/CategoryTabs';
import { NewsCard } from '../components/news/NewsCard';
import { PullToRefresh } from '../components/ui/PullToRefresh';
import { relativeTime } from '../constants/theme';
import { useUIStore } from '../stores/uiStore';
import type { NewsItem } from '../types';

export function NewsPage() {
  const [active, setActive] = useState<NewsItem['category']>('finance');
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const { news, isLoading, refresh, markRead } = useNews(active);

  // Hide bottom nav while the article reader is open.
  const openModal = useUIStore((s) => s.openModal);
  const closeModal = useUIStore((s) => s.closeModal);
  useEffect(() => {
    if (!selectedArticle) return;
    openModal();
    return () => closeModal();
  }, [selectedArticle, openModal, closeModal]);

  const handleSelect = (item: NewsItem) => {
    setSelectedArticle(item);
  };

  const handleClose = () => {
    setSelectedArticle(null);
  };

  return (
    <PullToRefresh onRefresh={() => refresh()}>
    <div className="space-y-6" style={{ padding: '0 20px 0' }}>
      <PageHeader
        title="Noticias"
        subtitle="Actualidad financiera en directo"
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
            <NewsCard
              key={item.id}
              item={item}
              onRead={markRead}
              onSelect={handleSelect}
              index={i}
            />
          ))}
          {news.length === 0 && (
            <div className="card p-16 text-center">
              <p className="text-text-primary font-medium">No articles found</p>
              <p className="text-sm text-text-muted mt-1">Try refreshing or check your NewsAPI key</p>
            </div>
          )}
        </div>
      )}

      {/* Article bottom sheet modal */}
      {selectedArticle && (
        <div
          onClick={handleClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.80)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'flex-end',
            animation: 'slideIn 0.2s both',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 430,
              margin: '0 auto',
              maxHeight: '88dvh',
              background: 'linear-gradient(180deg, #111827 0%, #0a0f1e 100%)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '24px 24px 0 0',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
          >
            {/* Handle bar */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0', flexShrink: 0 }}>
              <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.15)' }} />
            </div>

            {/* Close button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px 0', flexShrink: 0 }}>
              <button
                onClick={handleClose}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={15} color="#94a3b8" />
              </button>
            </div>

            {/* Scrollable content */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{
                padding: '12px 20px 128px',
                WebkitOverflowScrolling: 'touch',
                minHeight: 0,
              }}
            >
              {/* Hero image */}
              {selectedArticle.imageUrl && (
                <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20, height: 180 }}>
                  <img
                    src={selectedArticle.imageUrl}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}

              {/* Source + date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: '#6366f1', background: 'rgba(99,102,241,0.12)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  borderRadius: 6, padding: '2px 8px',
                }}>
                  {selectedArticle.source}
                </span>
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  {relativeTime(selectedArticle.publishedAt)}
                </span>
              </div>

              {/* Title */}
              <h2 style={{
                fontSize: 20, fontWeight: 700, color: '#f1f5f9',
                lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 16,
              }}>
                {selectedArticle.title}
              </h2>

              {/* Description */}
              <p style={{
                fontSize: 15, color: '#cbd5e1', lineHeight: 1.75, marginBottom: 28,
                whiteSpace: 'pre-wrap',
              }}>
                {selectedArticle.description}
              </p>

              {/* CTA */}
              {selectedArticle.url && selectedArticle.url !== '#' && (
                <button
                  onClick={() => window.open(selectedArticle.url, '_blank', 'noopener,noreferrer')}
                  style={{
                    width: '100%', padding: '14px 20px',
                    background: 'rgba(99,102,241,0.15)',
                    border: '1px solid rgba(99,102,241,0.35)',
                    borderRadius: 14, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontSize: 14, fontWeight: 600, color: '#a78bfa',
                    transition: 'background 0.2s', marginBottom: 24,
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.25)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.15)'}
                >
                  <ExternalLink size={15} />
                  Abrir artículo completo
                </button>
              )}

              {/* Source anchor — always present at the end of the article */}
              {selectedArticle.url && selectedArticle.url !== '#' && (
                <div
                  style={{
                    paddingTop: 18,
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    fontSize: 12, color: '#64748b',
                  }}
                >
                  Fuente:{' '}
                  <a
                    href={selectedArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#a78bfa', textDecoration: 'underline',
                      textDecorationColor: 'rgba(167,139,250,0.4)',
                      textUnderlineOffset: 3,
                      wordBreak: 'break-all',
                    }}
                  >
                    {selectedArticle.source} — {(() => {
                      try { return new URL(selectedArticle.url).hostname.replace(/^www\./, ''); }
                      catch { return 'enlace original'; }
                    })()}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </PullToRefresh>
  );
}
