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

  // Donut chart geometry
  const size = 180;
  const radius = 72;
  const strokeWidth = 28;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <section className="card p-6 animate-slide-up" style={{ animationDelay: '60ms' }}>
      <h3 className="text-xs uppercase tracking-[0.15em] text-text-secondary font-semibold mb-5">
        Allocation
      </h3>
      <div className="flex items-center gap-6 sm:gap-8">
        <div className="relative shrink-0">
          <svg width={size} height={size} className="-rotate-90">
            {/* Background ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#1E1E2E"
              strokeWidth={strokeWidth}
            />
            {segments.map((s) => {
              const length = (s.pct / 100) * circumference;
              const dasharray = `${length} ${circumference}`;
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
                  strokeLinecap="butt"
                  style={{ transition: 'stroke-dasharray 0.8s ease-out' }}
                />
              );
              offset += length;
              return el;
            })}
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular leading-none">{segments.length}</span>
            <span className="text-[10px] text-text-secondary uppercase tracking-wider mt-1">
              types
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {ORDER.map((cat) => {
            const value = breakdown[cat];
            if (value === 0) return null;
            const pct = (value / totalValue) * 100;
            const color = CATEGORY_COLORS[cat];
            return (
              <div key={cat} className="flex items-center gap-3">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
                />
                <span className="text-sm text-text-primary font-medium flex-1 truncate">
                  {CATEGORY_LABELS[cat]}
                </span>
                <span className="text-sm font-bold tabular" style={{ color }}>
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
