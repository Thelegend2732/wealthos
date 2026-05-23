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
    <section className="card p-6 animate-slide-up" style={{ animationDelay: '120ms' }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs uppercase tracking-[0.15em] text-text-secondary font-semibold">
          Category Breakdown
        </h3>
        {selectedCategory && (
          <button
            onClick={() => onSelect(null)}
            className="text-xs text-primary hover:text-primary-light font-semibold transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="space-y-3">
        {ORDER.map((cat) => {
          const value = breakdown[cat];
          const pct = totalValue > 0 ? (value / totalValue) * 100 : 0;
          const isSelected = selectedCategory === cat;
          const color = CATEGORY_COLORS[cat];

          return (
            <button
              key={cat}
              onClick={() => onSelect(isSelected ? null : cat)}
              className={`w-full text-left group transition-all rounded-xl p-3 -mx-3 ${
                isSelected ? 'bg-border/40' : 'hover:bg-border/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span
                    className={`text-sm font-semibold ${
                      isSelected ? '' : 'text-text-primary'
                    }`}
                    style={isSelected ? { color } : undefined}
                  >
                    {CATEGORY_LABELS[cat]}
                  </span>
                </div>
                <div className="flex items-center gap-2 tabular text-sm">
                  <span className="text-text-secondary">{formatCompact(value)}</span>
                  <span className="font-bold" style={{ color }}>
                    {pct.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                    boxShadow: isSelected ? `0 0 12px ${color}80` : undefined,
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
