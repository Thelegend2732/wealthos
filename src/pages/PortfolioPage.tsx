import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Bell, ChevronRight } from 'lucide-react';
import { usePortfolioStore } from '../stores/portfolioStore';
import { usePrices } from '../hooks/usePrices';
import { PortfolioChart } from '../components/portfolio/PortfolioChart';
import type { Asset } from '../types';

const PALETTE = ['#10b981', '#6366f1', '#22d3ee', '#f59e0b', '#a78bfa', '#34d399', '#f87171', '#60a5fa'];

const CATEGORY_ICONS: Record<string, string> = {
  'index-fund': '📈',
  etf: '💹',
  stock: '🔷',
};

const CATEGORY_LABELS_ES: Record<string, string> = {
  'index-fund': 'Índice',
  etf: 'ETF',
  stock: 'Acción',
};

function useCountUp(target: number, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 4)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return val;
}

interface SliceData { id: string; color: string; weight: number; }

function DonutChart({ slices }: { slices: SliceData[] }) {
  const size = 200, cx = 100, cy = 100, r = 72, sw = 18;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const arcs = slices.map((s) => {
    const dash = (s.weight / 100) * circ;
    const arc = { ...s, dash, gap: circ - dash, offset };
    offset += dash;
    return arc;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
      {arcs.map((a) => (
        <circle
          key={a.id} cx={cx} cy={cy} r={r} fill="none"
          stroke={a.color} strokeWidth={sw - 2}
          strokeDasharray={`${Math.max(a.dash - 1.5, 0)} ${a.gap + 1.5}`}
          strokeDashoffset={-a.offset}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${a.color}80)` }}
        />
      ))}
    </svg>
  );
}

interface CardData { asset: Asset; color: string; weight: number; value: number; cost: number; }

function PositionCard({ data, delay }: { data: CardData; delay: number }) {
  const { asset, color, weight, value, cost } = data;
  const gain = value - cost;
  const pct = cost > 0 ? ((gain / cost) * 100).toFixed(2) : '0.00';
  const isPos = gain >= 0;

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 14,
        marginBottom: 10, backdropFilter: 'blur(12px)',
        animation: `slideIn 0.4s ${delay}s both`,
        cursor: 'pointer', transition: 'background 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.07)'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: `${color}22`, border: `1px solid ${color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0, boxShadow: `0 0 12px ${color}33`,
      }}>
        {CATEGORY_ICONS[asset.category] ?? '📊'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#f1f5f9', letterSpacing: '0.01em' }}>{asset.name}</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>
            {value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <span style={{ fontSize: 11, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {asset.symbol} · {CATEGORY_LABELS_ES[asset.category] ?? asset.category}
          </span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            background: isPos ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            border: `1px solid ${isPos ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            borderRadius: 8, padding: '2px 8px',
            boxShadow: isPos ? '0 0 8px rgba(16,185,129,0.2)' : '0 0 8px rgba(239,68,68,0.2)',
          }}>
            {isPos
              ? <TrendingUp size={11} color="#10b981" />
              : <TrendingDown size={11} color="#ef4444" />}
            <span style={{ fontSize: 12, fontWeight: 700, color: isPos ? '#10b981' : '#ef4444', letterSpacing: '0.02em' }}>
              {isPos ? '+' : ''}{pct}%
            </span>
          </div>
        </div>
        <div style={{ marginTop: 6, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
          <div style={{
            height: '100%', width: `${Math.min(weight, 100)}%`, background: color,
            borderRadius: 99, boxShadow: `0 0 6px ${color}80`,
            transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }} />
        </div>
      </div>
    </div>
  );
}

export function PortfolioPage() {
  const assets = usePortfolioStore((s) => s.assets);
  const { isLoading } = usePrices();

  const totalValue = assets.reduce((sum, a) => sum + a.currentPrice * a.quantity, 0);
  const totalCost  = assets.reduce((sum, a) => sum + a.avgPrice  * a.quantity, 0);
  const totalGain  = totalValue - totalCost;
  const totalPct   = totalCost > 0 ? ((totalGain / totalCost) * 100).toFixed(2) : '0.00';
  const isGain     = totalGain >= 0;

  const animatedTotal = useCountUp(totalValue);

  const cardData: CardData[] = assets.map((asset, i) => {
    const value  = asset.currentPrice * asset.quantity;
    const cost   = asset.avgPrice     * asset.quantity;
    const weight = totalValue > 0 ? (value / totalValue) * 100 : 0;
    return { asset, color: PALETTE[i % PALETTE.length], weight, value, cost };
  });

  const slices: SliceData[] = cardData.map((d) => ({
    id: d.asset.id, color: d.color, weight: d.weight,
  }));

  return (
    <div style={{ color: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ padding: '48px 20px 20px', animation: 'slideIn 0.4s both' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 11, color: '#64748b', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>
              Patrimonio total
            </div>
            <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: isLoading ? '#f59e0b' : '#10b981',
                display: 'inline-block', animation: 'pulse 2s infinite',
              }} />
              {isLoading ? 'Actualizando…' : 'Actualizado ahora'}
            </div>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bell size={16} color="#94a3b8" />
          </div>
        </div>

        <div style={{ marginBottom: 6 }}>
          <span style={{ fontSize: 52, fontWeight: 200, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1 }}>
            {animatedTotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: isGain ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            border: `1px solid ${isGain ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
            borderRadius: 8, padding: '4px 10px',
            boxShadow: isGain ? '0 0 12px rgba(16,185,129,0.15)' : '0 0 12px rgba(239,68,68,0.15)',
          }}>
            {isGain ? <TrendingUp size={13} color="#10b981" /> : <TrendingDown size={13} color="#ef4444" />}
            <span style={{ fontSize: 13, fontWeight: 700, color: isGain ? '#10b981' : '#ef4444' }}>
              {isGain ? '+' : ''}{totalPct}%
            </span>
          </div>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            {isGain ? '+' : ''}{totalGain.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })} total
          </span>
        </div>
      </div>

      {/* Portfolio chart — recharts area, ready for live tick stream */}
      <PortfolioChart
        currentValue={totalValue}
        costBasis={totalCost}
        isLoading={isLoading}
      />

      {/* Donut + legend */}
      <div style={{
        margin: '0 20px 20px',
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 24, padding: 20,
        display: 'flex', alignItems: 'center', gap: 20,
        backdropFilter: 'blur(16px)', animation: 'slideIn 0.4s 0.1s both',
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <DonutChart slices={slices} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 11, color: '#64748b' }}>Activos</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{assets.length}</div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {cardData.map((d) => (
            <div key={d.asset.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0, boxShadow: `0 0 6px ${d.color}` }} />
              <span style={{ fontSize: 12, color: '#94a3b8', flex: 1 }}>{d.asset.symbol}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{d.weight.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Positions */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, animation: 'slideIn 0.4s 0.15s both' }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#475569' }}>
            Posiciones
          </span>
          <span style={{ fontSize: 12, color: '#6366f1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
            Ver todo <ChevronRight size={12} />
          </span>
        </div>

        {cardData.length > 0
          ? cardData.map((d, i) => (
              <PositionCard key={d.asset.id} data={d} delay={0.2 + i * 0.07} />
            ))
          : (
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: '48px 20px', textAlign: 'center',
            }}>
              <p style={{ color: '#f1f5f9', fontWeight: 600 }}>Sin posiciones</p>
              <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Ve a Perfil para añadir tu primera inversión</p>
            </div>
          )
        }
      </div>
    </div>
  );
}
