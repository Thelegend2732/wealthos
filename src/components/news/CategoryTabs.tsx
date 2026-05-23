import type { NewsItem } from '../../types';

interface Tab {
  key: NewsItem['category'];
  label: string;
  emoji: string;
}

const TABS: Tab[] = [
  { key: 'finance', label: 'Finance', emoji: '📈' },
  { key: 'tech', label: 'Tech & Semis', emoji: '🔬' },
  { key: 'lifestyle', label: 'Lifestyle', emoji: '⌚' },
];

interface Props {
  active: NewsItem['category'];
  onChange: (c: NewsItem['category']) => void;
}

export function CategoryTabs({ active, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap border ${
              isActive
                ? 'bg-primary/15 border-primary text-primary shadow-glow-primary'
                : 'bg-surface border-border text-text-secondary hover:border-border-strong hover:text-text-primary'
            }`}
          >
            <span className="text-base">{tab.emoji}</span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
