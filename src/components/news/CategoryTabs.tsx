import type { NewsItem } from '../../types';

interface Tab {
  key: NewsItem['category'];
  label: string;
}

const TABS: Tab[] = [
  { key: 'finance', label: 'Finance' },
  { key: 'tech', label: 'Tech & Semis' },
  { key: 'lifestyle', label: 'Lifestyle' },
];

interface Props {
  active: NewsItem['category'];
  onChange: (c: NewsItem['category']) => void;
}

export function CategoryTabs({ active, onChange }: Props) {
  return (
    <div className="border-b border-border flex gap-8">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`relative pb-3 text-sm font-medium transition-colors ${
              isActive
                ? 'text-text-primary'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab.label}
            {isActive && (
              <span className="absolute -bottom-px left-0 right-0 h-px bg-text-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
