import { CATEGORY_COLORS, CATEGORY_LABELS, formatCompact } from '../../constants/theme';
import type { AssetCategory } from '../../types';

interface Props {
  breakdown: Record<AssetCategory, number>;
  totalValue: number;
  selectedCategory: AssetCategory | null;
  onSelect: (cat: AssetCategory | null) => void;
}

const ORDER: AssetCategory[] = ['index-fund', 'etf', 'stock'];

export function CategoryBreakdown({ breakdown, totalValue, selectedCategory, onSelect }: Props) {
  return (
    <section className="card p-8 animate-slide-up" style={{ animationDelay: '120ms' }}>
      <div className="flex items-center justify-between mb-6">
        <p className="overline">Category Breakdown</p>
        {selectedCategory && (
          <button
            onClick={() => onSelect(null)}
            className="text-xs text-text-secondary hover:text-text-primary font-medium transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-5">
        {ORDER.map((cat) => {
          const value = breakdown[cat];
          const pct = totalValue > 0 ? (value / totalValue) * 100 : 0;
          const isSelected = selectedCategory === cat;
          const color = CATEGORY_COLORS[cat];

          return (
            <button
              key={cat}
              onClick={() => onSelect(isSelected ? null : cat)}
              className="w-full text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span
                    className={`text-sm transition-colors ${
                      isSelected
                        ? 'text-text-primary font-medium'
                        : 'text-text-secondary group-hover:text-text-primary'
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </span>
                </div>
                <div className="flex items-center gap-3 tabular text-sm">
                  <span className="text-text-muted">{formatCompact(value)}</span>
                  <span className="font-medium text-text-primary w-12 text-right">
                    {pct.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="h-px bg-border overflow-hidden">
                <div
                  className="h-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: color,
                    opacity: isSelected ? 1 : 0.5,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
