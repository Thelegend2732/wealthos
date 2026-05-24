import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useNews } from '../hooks/useNews';
import { PageHeader } from '../components/ui/PageHeader';
import { PullToRefresh } from '../components/ui/PullToRefresh';
import { relativeTime } from '../constants/theme';
import { useUIStore } from '../stores/uiStore';
import type { NewsItem } from '../types';

/**
 * Market Intelligence feed, single editorial stream — no category filters.
 * Wide translucent cards, generous line-clamp on the body so readers can
 * absorb the context without leaving the app, and a discreet "Leer
 * artículo completo ↗" affordance at the bottom of each card that opens
 * the original source in a new tab.
 */
export function NewsPage() {
  const { news, isLoading, refresh, markRead } = useNews();
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  // Hide bottom nav while the article reader is open.
  const openModal = useUIStore((s) => s.openModal);
  const closeModal = useUIStore((s) => s.closeModal);
  useEffect(() => {
    if (!selectedArticle) return;
    openModal();
    return () => closeModal();
  }, [selectedArticle, openModal, closeModal]);

  const handleSelect = (item: NewsItem) => {
    markRead(item.id);
    setSelectedArticle(item);
  };

  return (
    <PullToRefresh onRefresh={refresh}>
      <div style={{ padding: '0 20px 0' }}>
        <PageHeader
          title="Market Intelligence"
          subtitle="Actualidad financiera en directo"
          right={
            <button onClick={refresh} className="icon-btn" aria-label="Actualizar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
          }
        />

        {isLoading ? (
          <LoadingSkeleton />
        ) : news.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 24 }}>
            {news.map((item, i) => (
              <ArticleCard
                key={item.id}
                item={item}
                index={i}
                onOpen={() => handleSelect(item)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedArticle && (
        <ArticleReader article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}

      <style>{`
        @keyframes wos-news-fadein {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes wos-news-skel {
          0%, 100% { opacity: 0.45; }
          50%      { opacity: 1; }
        }
        .wos-clamp-5 {
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </PullToRefresh>
  );
}

/* ─── Article card ───────────────────────────────────────────────────── */

function ArticleCard({
  item, index, onOpen,
}: {
  item: NewsItem;
  index: number;
  onOpen: () => void;
}) {
  return (
    <article
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20,
        padding: '18px 20px 16px',
        display: 'flex', flexDirection: 'column', gap: 12,
        animation: `wos-news-fadein 0.4s ${Math.min(index * 50, 250)}ms both`,
        opacity: item.isRead ? 0.68 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Source · time strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: '#a78bfa', background: 'rgba(167,139,250,0.10)',
          border: '1px solid rgba(167,139,250,0.25)',
          borderRadius: 6, padding: '2px 8px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180,
        }}>
          {item.source}
        </span>
        <span style={{ fontSize: 11, color: '#64748b' }}>·</span>
        <span style={{ fontSize: 11, color: '#64748b' }}>
          {relativeTime(item.publishedAt)}
        </span>
      </div>

      {/* Title — also opens the reader */}
      <button
        onClick={onOpen}
        style={{
          textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer',
          padding: 0, color: '#F8FAFC',
          fontSize: 16, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.35,
        }}
      >
        {item.title}
      </button>

      {/* Hero image (if present) */}
      {item.imageUrl && (
        <button
          onClick={onOpen}
          style={{
            padding: 0, background: 'transparent', border: 'none', cursor: 'pointer',
            borderRadius: 14, overflow: 'hidden', height: 160,
          }}
        >
          <img
            src={item.imageUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => {
              const parent = (e.currentTarget as HTMLImageElement).parentElement as HTMLElement | null;
              if (parent) parent.style.display = 'none';
            }}
            loading="lazy"
          />
        </button>
      )}

      {/* Body excerpt — line-clamp 5 lines */}
      {item.description && (
        <p
          className="wos-clamp-5"
          style={{
            margin: 0, fontSize: 13.5, lineHeight: 1.65,
            color: '#cbd5e1',
          }}
        >
          {item.description}
        </p>
      )}

      {/* Footer: discreet source link */}
      {item.url && item.url !== '#' && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginTop: 4,
            fontSize: 12, fontWeight: 600,
            color: '#10b981', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 4,
            alignSelf: 'flex-start',
            letterSpacing: '0.01em',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#34d399')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#10b981')}
        >
          Leer artículo completo
          <span style={{ fontSize: 12, transform: 'translate(1px, -1px)' }}>↗</span>
        </a>
      )}
    </article>
  );
}

/* ─── Empty / loading states ─────────────────────────────────────────── */

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20, padding: 20,
            animation: 'wos-news-skel 1.6s ease-in-out infinite',
            animationDelay: `${i * 90}ms`,
            height: 220,
          }}
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 20, padding: '40px 24px',
      textAlign: 'center',
    }}>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
        No hay noticias disponibles ahora mismo
      </p>
      <p style={{ fontSize: 12, color: '#64748b', margin: '8px 0 0', lineHeight: 1.55 }}>
        Tira hacia abajo para volver a intentarlo. El feed se reconecta
        automáticamente cada 3 minutos.
      </p>
    </div>
  );
}

/* ─── Article reader (bottom-sheet) ──────────────────────────────────── */

function ArticleReader({
  article, onClose,
}: {
  article: NewsItem;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
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
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 430, margin: '0 auto',
          maxHeight: '88dvh',
          background: 'linear-gradient(180deg, #111827 0%, #0a0f1e 100%)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '24px 24px 0 0',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.15)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px 0', flexShrink: 0 }}>
          <button
            onClick={onClose}
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

        <div
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{
            padding: '12px 20px 128px',
            WebkitOverflowScrolling: 'touch',
            minHeight: 0,
          }}
        >
          {article.imageUrl && (
            <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20, height: 180 }}>
              <img
                src={article.imageUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: '#6366f1', background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: 6, padding: '2px 8px',
            }}>
              {article.source}
            </span>
            <span style={{ fontSize: 11, color: '#64748b' }}>
              {relativeTime(article.publishedAt)}
            </span>
          </div>

          <h2 style={{
            fontSize: 20, fontWeight: 700, color: '#f1f5f9',
            lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 16,
          }}>
            {article.title}
          </h2>

          <p style={{
            fontSize: 15, color: '#cbd5e1', lineHeight: 1.75, marginBottom: 16,
            whiteSpace: 'pre-wrap',
          }}>
            {article.description ||
              'Resumen no disponible. Abre el artículo completo en la fuente original para leer la noticia entera.'}
          </p>

          <p style={{
            fontSize: 12, color: '#64748b', fontStyle: 'italic', marginBottom: 28,
            lineHeight: 1.6,
          }}>
            Las APIs de noticias devuelven solo el resumen por motivos de copyright.
            Abre la fuente original para leer el artículo completo.
          </p>

          {article.url && article.url !== '#' && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                width: '100%', padding: '16px 20px',
                background: 'rgba(16,185,129,0.12)',
                border: '1.5px solid rgba(16,185,129,0.40)',
                borderRadius: 16,
                textAlign: 'center',
                fontSize: 15, fontWeight: 700,
                color: '#10b981', letterSpacing: '-0.005em',
                textDecoration: 'none',
                marginTop: 8, marginBottom: 16,
                boxShadow: '0 8px 24px rgba(16,185,129,0.18)',
              }}
            >
              Leer artículo completo ↗
            </a>
          )}

          {article.url && article.url !== '#' && (
            <p style={{ fontSize: 11, color: '#475569', textAlign: 'center', margin: 0 }}>
              {article.source} · {(() => {
                try { return new URL(article.url).hostname.replace(/^www\./, ''); }
                catch { return 'enlace original'; }
              })()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
