import { useState } from 'react';
import { relativeTime } from '../../constants/theme';
import type { NewsItem } from '../../types';

const META: Record<NewsItem['category'], { label: string; color: string; emoji: string }> = {
  finance: { label: 'Finance', color: '#6C63FF', emoji: '📈' },
  tech: { label: 'Tech', color: '#00D4AA', emoji: '🔬' },
  lifestyle: { label: 'Lifestyle', color: '#FF8C42', emoji: '⌚' },
};

interface Props {
  item: NewsItem;
  onRead: (id: string) => void;
  index: number;
}

export function NewsCard({ item, onRead, index }: Props) {
  const [imageError, setImageError] = useState(false);
  const meta = META[item.category];

  const handleClick = () => {
    onRead(item.id);
    if (item.url && item.url !== '#') {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <article
      className={`card card-hover p-4 sm:p-5 cursor-pointer animate-slide-up transition-opacity ${
        item.isRead ? 'opacity-55' : ''
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
        >
          {meta.label}
        </span>
        <span className="text-xs text-text-secondary font-semibold flex-1 min-w-0 truncate">
          {item.source}
        </span>
        <span className="text-xs text-text-muted">{relativeTime(item.publishedAt)}</span>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-text-primary leading-snug mb-2 line-clamp-2">
            {item.title}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
            {item.description}
          </p>
        </div>
        <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-border flex items-center justify-center">
          {item.imageUrl && !imageError ? (
            <img
              src={item.imageUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <span className="text-3xl">{meta.emoji}</span>
          )}
        </div>
      </div>
    </article>
  );
}
