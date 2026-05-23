import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../constants/theme';
import type { AssetCategory } from '../../types';

interface Props {
  breakdown: Record<AssetCategory, number>;
  totalValue: number;
}

const ORDER: AssetCategory[] = ['index-fund', 'etf', 'stock'];

export function AllocationChart({ breakdown, totalValue }: Props) {
  if (totalValue === 0) return null;

  const segments = ORDER.filter((c) => breakdown[c] > 0).map((c) => ({
    cat: c,
    value: breakdown[c],
    pct: (breakdown[c] / totalValue) * 100,
    color: CATEGORY_COLORS[c],
  }));

  // Thin, refined donut
  const size = 160;
  const radius = 70;
  const strokeWidth = 10; // thin & modern
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const gap = 2; // visual breathing room between segments
  let offset = 0;

  return (
    <section className="card p-8 animate-slide-up" style={{ animationDelay: '60ms' }}>
      <p className="overline">Allocation</p>
      <div className="flex items-center gap-8 mt-6">
        <div className="relative shrink-0">
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="rgba(148, 163, 184, 0.06)"
              strokeWidth={strokeWidth}
            />
            {segments.map((s) => {
              const length = (s.pct / 100) * circumference - gap;
              const dasharray = `${Math.max(length, 0.1)} ${circumference}`;
              const el = (
                <circle
                  key={s.cat}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dasharray}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
                />
              );
              offset += (s.pct / 100) * circumference;
              return el;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold tabular text-text-primary tracking-tight-2">
              {segments.length}
            </span>
            <span className="text-[10px] uppercase tracking-overline text-text-muted mt-0.5">
              types
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          {ORDER.map((cat) => {
            const value = breakdown[cat];
            if (value === 0) return null;
            const pct = (value / totalValue) * 100;
            const color = CATEGORY_COLORS[cat];
            return (
              <div key={cat} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-text-secondary truncate">
                    {CATEGORY_LABELS[cat]}
                  </span>
                </div>
                <span className="text-sm font-medium tabular text-text-primary">
                  {pct.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
