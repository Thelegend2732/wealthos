import { useState } from 'react';
import { relativeTime } from '../../constants/theme';
import type { NewsItem } from '../../types';

interface Props {
  item: NewsItem;
  onRead: (id: string) => void;
  index: number;
}

export function NewsCard({ item, onRead, index }: Props) {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    onRead(item.id);
    if (item.url && item.url !== '#') {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <article
      className={`card card-hover p-7 cursor-pointer animate-slide-up transition-opacity ${
        item.isRead ? 'opacity-50' : ''
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={handleClick}
    >
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-text-secondary font-medium">{item.source}</span>
            <span className="w-0.5 h-0.5 rounded-full bg-text-muted" />
            <span className="text-xs text-text-muted">{relativeTime(item.publishedAt)}</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-text-primary leading-snug mb-2 tracking-tight-2 line-clamp-2">
            {item.title}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>
        {item.imageUrl && !imageError && (
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0">
            <img
              src={item.imageUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          </div>
        )}
      </div>
    </article>
  );
}
