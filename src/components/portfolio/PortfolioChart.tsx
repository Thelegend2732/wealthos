import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  YAxis,
  XAxis,
  CartesianGrid,
} from 'recharts';

interface Props {
  /** Current portfolio market value (anchors the right edge of the curve). */
  currentValue: number;
  /** Total cost basis (used as a sensible starting point for the synthetic
      historical series until a real backend feed is wired in). */
  costBasis: number;
  /** Whether the market data is still loading — drives the loading shimmer. */
  isLoading?: boolean;
}

type Range = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

interface Point { t: number; v: number; label: string; }

/**
 * Synthetic, deterministic time series so the curve is stable across renders
 * (no jitter on every paint). When a live tick feed is wired in, replace
 * `buildSeries` with a subscription that pushes new points onto the array.
 */
function buildSeries(range: Range, current: number, cost: number): Point[] {
  const stepsByRange: Record<Range, number> = {
    '1D': 24,   // hourly
    '1W': 7,    // daily
    '1M': 30,
    '3M': 90,
    '1Y': 52,
    'ALL': 60,
  };
  const steps = stepsByRange[range];
  // Anchor the start of the series so the visible PnL trend matches the user's
  // real cost vs market position.
  const start =
    range === 'ALL' ? cost * 0.65 :
    range === '1Y'  ? cost * 0.85 :
    range === '3M'  ? current * 0.92 :
    range === '1M'  ? current * 0.96 :
    range === '1W'  ? current * 0.985 :
                      current * 0.997;
  // Deterministic pseudo-noise (sin) so the chart doesn't flicker between renders.
  const points: Point[] = [];
  for (let i = 0; i < steps; i++) {
    const progress = i / (steps - 1);
    const drift = start + (current - start) * progress;
    const wave = Math.sin(i * 0.7) * (current * 0.006);
    const wave2 = Math.cos(i * 0.31) * (current * 0.004);
    const noise = wave + wave2;
    const v = i === steps - 1 ? current : Math.max(0, drift + noise);
    const label = labelFor(range, i, steps);
    points.push({ t: i, v, label });
  }
  return points;
}

function labelFor(range: Range, i: number, steps: number): string {
  const now = new Date();
  const d = new Date(now);
  if (range === '1D') {
    d.setHours(now.getHours() - (steps - 1 - i));
    return d.toLocaleTimeString('es-ES', { hour: '2-digit' });
  }
  if (range === '1W') {
    d.setDate(now.getDate() - (steps - 1 - i));
    return d.toLocaleDateString('es-ES', { weekday: 'short' });
  }
  if (range === '1M' || range === '3M') {
    d.setDate(now.getDate() - (steps - 1 - i));
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
  if (range === '1Y') {
    d.setDate(now.getDate() - (steps - 1 - i) * 7);
    return d.toLocaleDateString('es-ES', { month: 'short' });
  }
  d.setMonth(now.getMonth() - (steps - 1 - i));
  return d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
}

const RANGES: Range[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

export function PortfolioChart({ currentValue, costBasis, isLoading }: Props) {
  const [range, setRange] = useState<Range>('1M');

  const data = useMemo(
    () => buildSeries(range, currentValue, costBasis),
    [range, currentValue, costBasis]
  );

  const first = data[0]?.v ?? 0;
  const last = data[data.length - 1]?.v ?? 0;
  const delta = last - first;
  const pct = first > 0 ? (delta / first) * 100 : 0;
  const isUp = delta >= 0;
  const stroke = isUp ? '#10b981' : '#ef4444';

  // YAxis padding for visual breathing room
  const values = data.map((d) => d.v);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.18 || max * 0.04;

  return (
    <div
      style={{
        margin: '0 20px 20px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 24,
        padding: '20px 16px 14px',
        backdropFilter: 'blur(16px)',
        animation: 'slideIn 0.4s 0.05s both',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 4px 12px' }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#475569' }}>
          Evolución
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: stroke }}>
            {isUp ? '+' : ''}{delta.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700, color: stroke,
            background: isUp ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            border: `1px solid ${isUp ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            borderRadius: 6, padding: '2px 6px',
          }}>
            {isUp ? '+' : ''}{pct.toFixed(2)}%
          </span>
        </div>
      </div>

      <div style={{ height: 180, marginLeft: -8, opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 6, left: 6, bottom: 0 }}>
            <defs>
              <linearGradient id="wos-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.32} />
                <stop offset="60%" stopColor={stroke} stopOpacity={0.08} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="label" hide />
            <YAxis hide domain={[min - padding, max + padding]} />
            <Tooltip
              cursor={{ stroke: 'rgba(255,255,255,0.12)', strokeWidth: 1 }}
              contentStyle={{
                background: 'rgba(10, 15, 30, 0.95)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 12,
                fontSize: 12,
                padding: '8px 12px',
                color: '#e2e8f0',
              }}
              labelStyle={{ color: '#64748b', fontSize: 10, marginBottom: 4 }}
              formatter={(v: number) => [
                v.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }),
                'Valor',
              ]}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke={stroke}
              strokeWidth={2.4}
              fill="url(#wos-area)"
              dot={false}
              activeDot={{ r: 5, fill: stroke, stroke: '#0a0f1e', strokeWidth: 2 }}
              isAnimationActive
              animationDuration={650}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginTop: 6, padding: '0 4px',
      }}>
        {RANGES.map((r) => {
          const active = r === range;
          return (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                flex: 1, padding: '8px 0', margin: '0 2px',
                background: active ? 'rgba(16,185,129,0.10)' : 'transparent',
                border: active ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
                borderRadius: 10, cursor: 'pointer',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                color: active ? '#10b981' : '#64748b',
                transition: 'all 0.18s',
              }}
            >
              {r}
            </button>
          );
        })}
      </div>
    </div>
  );
}
