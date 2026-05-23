import { useMemo } from 'react';
import { formatCompact } from '../../constants/theme';
import type { ProjectionPoint } from '../../types';

interface Props {
  projections: ProjectionPoint[];
  currency: 'USD' | 'EUR';
}

export function ProjectionChart({ projections, currency }: Props) {
  const yearly = useMemo(
    () => projections.filter((_, i) => i % 12 === 11 || i === projections.length - 1),
    [projections]
  );

  if (yearly.length === 0) return null;

  const W = 600;
  const H = 240;
  const padding = { top: 16, right: 16, bottom: 28, left: 56 };
  const innerW = W - padding.left - padding.right;
  const innerH = H - padding.top - padding.bottom;

  const maxVal = Math.max(...yearly.map((p) => p.optimistic));
  const xStep = innerW / Math.max(yearly.length - 1, 1);
  const yScale = (v: number) => padding.top + innerH - (v / maxVal) * innerH;
  const xPos = (i: number) => padding.left + i * xStep;

  const buildPath = (key: keyof Omit<ProjectionPoint, 'month'>) =>
    yearly
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i)} ${yScale(p[key])}`)
      .join(' ');

  // Area between contributed and optimistic for visual depth
  const areaPath = `${buildPath('optimistic')} L ${xPos(yearly.length - 1)} ${yScale(0)} L ${xPos(0)} ${yScale(0)} Z`;

  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => (maxVal * i) / yTicks);

  const xLabelStride = Math.max(1, Math.floor(yearly.length / 6));

  return (
    <section className="card p-6 animate-slide-up" style={{ animationDelay: '60ms' }}>
      <h3 className="text-xs uppercase tracking-[0.15em] text-text-secondary font-semibold mb-3">
        Growth Projection
      </h3>

      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        <Legend color="#00D4AA" label="Optimistic (15%)" />
        <Legend color="#6C63FF" label="Moderate (10%)" />
        <Legend color="#8B8FA8" label="Conservative (6%)" dashed />
        <Legend color="#4A4A6A" label="Contributed" dotted />
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto block"
          style={{ minWidth: 320, maxHeight: 280 }}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#00D4AA" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#00D4AA" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="modGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6C63FF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yLabels.map((val, i) => {
            const y = yScale(val);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  x2={W - padding.right}
                  y1={y}
                  y2={y}
                  stroke="#1E1E2E"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#4A4A6A"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {formatCompact(val, currency)}
                </text>
              </g>
            );
          })}

          {/* Optimistic area */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Optimistic line */}
          <path
            d={buildPath('optimistic')}
            fill="none"
            stroke="#00D4AA"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Moderate line */}
          <path
            d={buildPath('moderate')}
            fill="none"
            stroke="#6C63FF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Conservative line (dashed) */}
          <path
            d={buildPath('conservative')}
            fill="none"
            stroke="#8B8FA8"
            strokeWidth="2"
            strokeDasharray="5 4"
            strokeLinecap="round"
          />

          {/* Contributed baseline (dotted) */}
          <path
            d={buildPath('totalContributed')}
            fill="none"
            stroke="#4A4A6A"
            strokeWidth="1.5"
            strokeDasharray="2 3"
          />

          {/* X axis labels */}
          {yearly.map((p, i) => {
            if (i % xLabelStride !== 0 && i !== yearly.length - 1) return null;
            return (
              <text
                key={i}
                x={xPos(i)}
                y={H - 8}
                textAnchor="middle"
                fontSize="10"
                fill="#4A4A6A"
                fontFamily="JetBrains Mono, monospace"
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

function Legend({ color, label, dashed, dotted }: { color: string; label: string; dashed?: boolean; dotted?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <svg width="20" height="8" className="shrink-0">
        <line
          x1="0"
          x2="20"
          y1="4"
          y2="4"
          stroke={color}
          strokeWidth="2.5"
          strokeDasharray={dashed ? '4 3' : dotted ? '2 2' : undefined}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-text-secondary">{label}</span>
    </div>
  );
}
