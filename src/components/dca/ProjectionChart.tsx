import { useMemo, useState } from 'react';
import { formatCompact } from '../../constants/theme';
import type { ProjectionPoint } from '../../types';

interface Props {
  projections: ProjectionPoint[];
  currency: 'USD' | 'EUR';
}

type Scenario = 'conservative' | 'moderate' | 'optimistic' | 'totalContributed';

const SCENARIOS: { key: Scenario; label: string; color: string; weight: number }[] = [
  { key: 'optimistic', label: 'Optimistic · 15%', color: '#34D399', weight: 1.5 },
  { key: 'moderate', label: 'Moderate · 10%', color: '#F8FAFC', weight: 1.5 },
  { key: 'conservative', label: 'Conservative · 6%', color: '#94A3B8', weight: 1.25 },
  { key: 'totalContributed', label: 'Contributed', color: '#475569', weight: 1 },
];

export function ProjectionChart({ projections, currency }: Props) {
  const [hovered, setHovered] = useState<Scenario | null>(null);

  const yearly = useMemo(
    () =>
      projections.filter((_, i) => i % 12 === 11 || i === projections.length - 1),
    [projections]
  );

  if (yearly.length === 0) return null;

  const W = 800;
  const H = 280;
  const padding = { top: 24, right: 24, bottom: 36, left: 64 };
  const innerW = W - padding.left - padding.right;
  const innerH = H - padding.top - padding.bottom;

  const maxVal = Math.max(...yearly.map((p) => p.optimistic));
  const xStep = innerW / Math.max(yearly.length - 1, 1);
  const yScale = (v: number) => padding.top + innerH - (v / maxVal) * innerH;
  const xPos = (i: number) => padding.left + i * xStep;

  // Smooth catmull-rom-ish path using bezier curves
  const buildPath = (key: keyof Omit<ProjectionPoint, 'month'>) => {
    const pts = yearly.map((p, i) => [xPos(i), yScale(p[key])] as [number, number]);
    if (pts.length < 2) return '';
    let path = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [px, py] = pts[i - 1];
      const [x, y] = pts[i];
      const cx = (px + x) / 2;
      path += ` C ${cx} ${py}, ${cx} ${y}, ${x} ${y}`;
    }
    return path;
  };

  // Y reference lines (minimal)
  const yTicks = 3;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => (maxVal * i) / yTicks);

  // X label stride
  const stride = Math.max(1, Math.floor(yearly.length / 5));

  return (
    <section className="card p-8 animate-slide-up" style={{ animationDelay: '60ms' }}>
      <div className="flex items-start justify-between mb-6 gap-6 flex-wrap">
        <p className="overline">Growth Projection</p>
        <div className="flex items-center gap-5 flex-wrap">
          {SCENARIOS.map((s) => {
            const active = hovered === null || hovered === s.key;
            return (
              <button
                key={s.key}
                onMouseEnter={() => setHovered(s.key)}
                onMouseLeave={() => setHovered(null)}
                className={`flex items-center gap-2 text-[11px] transition-opacity ${
                  active ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <span
                  className="w-3 h-px"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-text-secondary font-medium">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full overflow-x-auto -mx-2">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto block px-2"
          style={{ minWidth: 320, maxHeight: 320 }}
        >
          {/* Subtle horizontal reference lines */}
          {yLabels.map((val, i) => {
            const y = yScale(val);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  x2={W - padding.right}
                  y1={y}
                  y2={y}
                  stroke="rgba(148, 163, 184, 0.06)"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 12}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#475569"
                  fontFamily="JetBrains Mono, monospace"
                  letterSpacing="0.5"
                >
                  {i === 0 ? '' : formatCompact(val, currency)}
                </text>
              </g>
            );
          })}

          {/* All four lines — thin and clean, no fills */}
          {SCENARIOS.map((s) => {
            const isDimmed = hovered !== null && hovered !== s.key;
            const isContrib = s.key === 'totalContributed';
            return (
              <path
                key={s.key}
                d={buildPath(s.key)}
                fill="none"
                stroke={s.color}
                strokeWidth={s.weight}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={isContrib ? '2 4' : undefined}
                opacity={isDimmed ? 0.2 : 1}
                style={{ transition: 'opacity 200ms ease' }}
              />
            );
          })}

          {/* X axis labels */}
          {yearly.map((p, i) => {
            if (i % stride !== 0 && i !== yearly.length - 1) return null;
            return (
              <text
                key={i}
                x={xPos(i)}
                y={H - 12}
                textAnchor="middle"
                fontSize="10"
                fill="#475569"
                fontFamily="JetBrains Mono, monospace"
                letterSpacing="0.5"
              >
                Y{Math.floor(p.month / 12)}
              </text>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
