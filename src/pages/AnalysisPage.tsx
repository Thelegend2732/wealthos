import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
} from 'recharts';
import { searchSymbols, type SymbolMatch } from '../services/yahooFinance';
import {
  fetchFundamentalAnalysis,
  type AnalysisData,
} from '../services/fundamentals';
import type {
  AnalystOpinion,
  AnalystRating,
  ValuationDetails,
  FutureDetails,
  PastDetails,
  HealthDetails,
  DividendDetails,
} from '../data/fundamentalsDB';

/**
 * Simply Wall St-inspired fundamental analysis page. Real data comes from
 * Financial Modeling Prep (see services/fundamentals.ts); the five axes are
 * normalised onto a 0–100 snowflake scale.
 *
 * fetchFundamentalAnalysis resolves to `null` when FMP has no data for the
 * ticker (ETFs, indices, funds, freshly listed). The UI treats that as a
 * dedicated empty state separate from network errors.
 */

interface CompanyMeta {
  symbol: string;
  name: string;
  currency: string;
  exchange?: string;
}

const DEFAULT_META: CompanyMeta = {
  symbol: 'NVDA',
  name: 'NVIDIA Corporation',
  currency: 'USD',
  exchange: 'NASDAQ',
};

interface Dimension {
  key: keyof Pick<AnalysisData, 'value' | 'future' | 'past' | 'health' | 'dividend'>;
  label: string;
  description: string;
}

const DIMENSIONS: Dimension[] = [
  { key: 'value',    label: 'Valor',     description: '¿Cotiza por debajo de su valor intrínseco según DCF y múltiplos?' },
  { key: 'future',   label: 'Futuro',    description: '¿Se proyecta crecimiento sostenido? (P/E y P/B prospectivos)' },
  { key: 'past',     label: 'Pasado',    description: '¿Calidad histórica del retorno sobre capital? (ROE + ROA)' },
  { key: 'health',   label: 'Salud',     description: '¿Solvencia y balance? Basado en ratio deuda/equity.' },
  { key: 'dividend', label: 'Dividendo', description: '¿Rentabilidad por dividendo sobre el precio actual?' },
];

function scoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#84cc16';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Bueno';
  if (score >= 40) return 'Regular';
  return 'Débil';
}

export function AnalysisPage() {
  const [meta, setMeta] = useState<CompanyMeta>(DEFAULT_META);

  // Search UI
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SymbolMatch[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Real fundamentals via React Query. The service returns `null` for
  // tickers without fundamentals (ETFs/indices/funds), which becomes the
  // "no fundamentals" empty state below.
  const {
    data: analysisData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery<AnalysisData | null, Error>({
    queryKey: ['fundamentals', meta.symbol],
    queryFn: () => fetchFundamentalAnalysis(meta.symbol),
    staleTime: 60 * 60 * 1000,   // 1 hour
    retry: 0,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      setSearching(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const r = await searchSymbols(query);
      setResults(r);
      setShowDropdown(true);
      setSearching(false);
    }, 280);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (m: SymbolMatch) => {
    setMeta({
      symbol: m.symbol.toUpperCase(),
      name: m.name,
      currency: m.currency,
      exchange: m.exchange,
    });
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    setSearching(false);
  };

  // Treat `data === null` as the "no fundamentals" empty state (the service
  // returns null for ETFs/indices/funds). Genuine fetch errors keep their
  // own dedicated ErrorState branch.
  const loading = isLoading || isFetching;
  const noFundamentals = !loading && !isError && analysisData === null;

  return (
    <div style={{ padding: '40px 20px 20px', color: '#f1f5f9' }}>
      {/* Header */}
      <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.025em', color: '#F8FAFC', margin: 0 }}>
        Análisis fundamental
      </h1>
      <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 24px' }}>
        Scoring fundamental · Escala 0–100
      </p>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            placeholder="Busca otro activo (NVDA, AAPL, MSFT, ASML…)"
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: '1.5px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              padding: '14px 16px 14px 42px',
              color: '#F8FAFC',
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#64748b" strokeWidth="2" strokeLinecap="round"
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          {searching && (
            <span style={{
              position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
              fontSize: 11, color: '#64748b',
            }}>Buscando…</span>
          )}
        </div>

        {showDropdown && results.length > 0 && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
            background: 'rgba(20, 28, 46, 0.98)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 14, padding: 6,
            boxShadow: '0 16px 40px rgba(0,0,0,0.55)',
            zIndex: 5, maxHeight: 300, overflowY: 'auto',
          }}>
            {results.map((r) => (
              <button
                key={r.symbol}
                onClick={() => handleSelect(r)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '10px 12px', background: 'transparent',
                  border: 'none', borderRadius: 10, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12, color: '#e2e8f0',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(16,185,129,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{
                  fontFamily: 'ui-monospace, SF Mono, monospace',
                  fontSize: 13, fontWeight: 700, color: '#10b981', minWidth: 72,
                }}>
                  {r.symbol}
                </span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.name}
                </span>
                <span style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {r.exchange || r.currency}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Company chip */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 18, padding: '16px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        marginBottom: 16,
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{
              fontFamily: 'ui-monospace, SF Mono, monospace',
              fontSize: 18, fontWeight: 700, color: '#10b981',
            }}>
              {meta.symbol}
            </span>
            <span style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {meta.exchange || meta.currency}
            </span>
          </div>
          <p style={{
            margin: '4px 0 0', fontSize: 13, color: '#94a3b8',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {meta.name}
          </p>
        </div>
      </div>

      {/* States: loading / no fundamentals / error / data */}
      {loading && <LoadingState />}
      {noFundamentals && <NoFundamentalsState />}
      {!loading && isError && (
        <ErrorState message={error instanceof Error ? error.message : 'Error desconocido'} />
      )}
      {!loading && !isError && analysisData && (
        <DataView meta={meta} data={analysisData} />
      )}

      {/* Disclaimer */}
      <p style={{
        marginTop: 18, fontSize: 11, color: '#475569', fontStyle: 'italic',
        textAlign: 'center', lineHeight: 1.5,
      }}>
        Snowflake scoring calibrado a partir de DCF, múltiplos, ROE/ROA, deuda/equity y rentabilidad por dividendo.
      </p>

      <style>{`
        @keyframes wos-fadein {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes wos-pulse-skel {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────────────────── */

function LoadingState() {
  return (
    <div
      style={{
        animation: 'wos-fadein 0.3s ease',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}
    >
      {/* Radar skeleton */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 24, padding: 20,
        height: 280 + 40,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 14,
      }}>
        <div style={{
          width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
          border: '1px dashed rgba(16,185,129,0.25)',
          animation: 'wos-pulse-skel 1.6s ease-in-out infinite',
        }} />
        <span style={{ fontSize: 12, color: '#64748b', letterSpacing: '0.02em' }}>
          Analizando estados financieros y proyecciones…
        </span>
      </div>

      {/* Score skeleton */}
      <Skeleton height={76} />

      {/* Cards skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={120} />
        ))}
      </div>
    </div>
  );
}

function Skeleton({ height }: { height: number }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16, height,
      animation: 'wos-pulse-skel 1.6s ease-in-out infinite',
    }} />
  );
}

function NoFundamentalsState() {
  return (
    <div style={{
      animation: 'wos-fadein 0.35s ease',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 20, padding: '40px 24px',
      textAlign: 'center',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: 'rgba(245,158,11,0.10)',
        border: '1px solid rgba(245,158,11,0.30)',
        margin: '0 auto 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="13" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
        Datos fundamentales no disponibles para este tipo de activo
      </p>
      <p style={{ fontSize: 12, color: '#64748b', margin: '8px 0 0', lineHeight: 1.55 }}>
        ETFs, índices y fondos no se evalúan con métricas fundamentales.
        Busca una acción individual para ver su análisis.
      </p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div style={{
      animation: 'wos-fadein 0.35s ease',
      background: 'rgba(239,68,68,0.05)',
      border: '1px solid rgba(239,68,68,0.30)',
      borderRadius: 16, padding: '22px 20px',
      textAlign: 'center',
    }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#fca5a5', margin: 0 }}>
        Error al cargar los fundamentales
      </p>
      <p style={{ fontSize: 11, color: '#94a3b8', margin: '6px 0 0' }}>
        {message}
      </p>
    </div>
  );
}

function DataView({ meta, data }: { meta: CompanyMeta; data: AnalysisData }) {
  const snowflake = Math.round(
    (data.value + data.future + data.past + data.health + data.dividend) / 5
  );

  const radarData = DIMENSIONS.map((d) => ({
    dimension: d.label,
    score: data[d.key],
    fullMark: 100,
  }));

  return (
    <div style={{ animation: 'wos-fadein 0.4s ease', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Radar */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 24, padding: 20,
      }}>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            {/* outerRadius 70% leaves room for axis labels so values at 100
                don't clip against the card border. */}
            <RadarChart data={radarData} outerRadius="70%">
              <defs>
                <radialGradient id="snowflake-fill">
                  <stop offset="0%"  stopColor="#10b981" stopOpacity={0.55} />
                  <stop offset="80%" stopColor="#10b981" stopOpacity={0.20} />
                </radialGradient>
              </defs>
              <PolarGrid stroke="rgba(255,255,255,0.10)" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name={meta.symbol}
                dataKey="score"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#snowflake-fill)"
                isAnimationActive
                animationDuration={650}
              />
              <Tooltip
                cursor={{ stroke: 'rgba(255,255,255,0.12)' }}
                contentStyle={{
                  background: 'rgba(10, 15, 30, 0.95)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 12, fontSize: 12, padding: '8px 12px', color: '#e2e8f0',
                }}
                formatter={(v: any) => [`${v} / 100`, 'Score']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Snowflake Score */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20, padding: '20px 22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#475569', margin: 0 }}>
            Snowflake Score
          </p>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>
            Promedio agregado de las 5 dimensiones
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em',
            color: scoreColor(snowflake), fontVariantNumeric: 'tabular-nums',
          }}>
            {snowflake}
          </span>
          <span style={{ fontSize: 14, color: '#475569', fontWeight: 600 }}>/ 100</span>
        </div>
      </div>

      {/* Wall Street consensus — sell-side ratings + price targets */}
      {data.analystConsensus && data.analystConsensus.length > 0 && (
        <ConsensusSection
          opinions={data.analystConsensus}
          currentPrice={data.details?.valuation.currentPrice}
          currency={data.currency ?? 'USD'}
        />
      )}

      {/* Deep-dive pillars — one per snowflake axis */}
      {data.details ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionTitle>Desglose por pilares</SectionTitle>
          <ValuationPillar score={data.value} details={data.details.valuation} currency={data.currency ?? 'USD'} />
          <FuturePillar    score={data.future}   details={data.details.future} />
          <PastPillar      score={data.past}     details={data.details.past} />
          <HealthPillar    score={data.health}   details={data.details.health} currency={data.currency ?? 'USD'} />
          <DividendPillar  score={data.dividend} details={data.details.dividend} />
        </div>
      ) : (
        <FallbackBreakdown data={data} />
      )}
    </div>
  );
}

/* ─── Wall Street consensus ──────────────────────────────────────────── */

function ratingColor(rating: AnalystRating): { fg: string; bg: string; border: string } {
  switch (rating) {
    case 'Strong Buy': return { fg: '#10b981', bg: 'rgba(16,185,129,0.14)', border: 'rgba(16,185,129,0.40)' };
    case 'Buy':        return { fg: '#34d399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.28)' };
    case 'Hold':       return { fg: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.25)' };
    case 'Sell':       return { fg: '#f87171', bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.30)'  };
  }
}

/**
 * WealthOS enforces a single-currency UX (EUR). Both helpers ignore the
 * legacy `currency` argument so any stale callers that still pass "USD"
 * still render in euros — there is no path that can produce a "$" in the
 * Analysis tab.
 */
function formatMoney(amount: number, _currency: string = 'EUR', fractionDigits = 2): string {
  void _currency;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

/** Billions formatter, always in EUR ("€184.2B"). */
function formatBillions(amountBillions: number, _currency: string = 'EUR'): string {
  void _currency;
  return `€${amountBillions.toFixed(1)}B`;
}

function ConsensusSection({
  opinions, currentPrice, currency,
}: {
  opinions: AnalystOpinion[];
  currentPrice: number | undefined;
  currency: string;
}) {
  const avgTarget = opinions.reduce((s, o) => s + o.targetPrice, 0) / opinions.length;
  const upsidePct = currentPrice && currentPrice > 0
    ? ((avgTarget - currentPrice) / currentPrice) * 100
    : null;
  const upsidePos = (upsidePct ?? 0) >= 0;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 24, padding: 20,
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#475569', margin: 0 }}>
            Consenso Wall Street
          </p>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>
            Precio objetivo medio de {opinions.length} bancos de inversión
          </p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{
            fontSize: 22, fontWeight: 700, color: '#F8FAFC',
            letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
          }}>
            {formatMoney(avgTarget, currency, 2)}
          </div>
          {upsidePct !== null && (
            <div style={{
              display: 'inline-block', marginTop: 4,
              fontSize: 11, fontWeight: 700,
              color: upsidePos ? '#10b981' : '#f87171',
              background: upsidePos ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.10)',
              border: `1px solid ${upsidePos ? 'rgba(16,185,129,0.30)' : 'rgba(239,68,68,0.30)'}`,
              borderRadius: 6, padding: '2px 7px',
            }}>
              {upsidePos ? '+' : ''}{upsidePct.toFixed(1)}% potencial
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {opinions.map((o) => {
          const c = ratingColor(o.rating);
          return (
            <div
              key={o.bank}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12, padding: '10px 12px',
                display: 'flex', flexDirection: 'column', gap: 6,
              }}
            >
              <span style={{
                fontSize: 11, fontWeight: 600, color: '#cbd5e1',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {o.bank}
              </span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
                  color: c.fg, background: c.bg, border: `1px solid ${c.border}`,
                  borderRadius: 6, padding: '2px 7px',
                  textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}>
                  {o.rating}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: '#e2e8f0',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {formatMoney(o.targetPrice, currency, 0)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Pillar primitives ──────────────────────────────────────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
      color: '#475569', margin: '6px 4px 0', display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ width: 16, height: 1, background: 'rgba(148,163,184,0.25)' }} />
      {children}
    </p>
  );
}

function PillarShell({
  title, score, children,
}: {
  title: string;
  score: number;
  children: React.ReactNode;
}) {
  const color = scoreColor(score);
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 18, padding: '18px 18px 20px',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.01em' }}>
          {title}
        </span>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 4,
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${color}40`,
          borderRadius: 8, padding: '4px 10px',
        }}>
          <span style={{
            fontSize: 14, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums',
          }}>
            {score}
          </span>
          <span style={{ fontSize: 10, color: '#475569', fontWeight: 600 }}>/100</span>
        </div>
      </div>
      {children}
    </div>
  );
}

function KpiTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 12, padding: '10px 12px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: '#475569',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 16, fontWeight: 700, color: '#F8FAFC',
        fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
      }}>
        {value}
      </span>
      {hint && (
        <span style={{ fontSize: 10, color: '#64748b' }}>{hint}</span>
      )}
    </div>
  );
}

function pct(n: number, digits = 1): string {
  return `${n >= 0 ? '' : ''}${n.toFixed(digits)}%`;
}

/* ─── Pillars ────────────────────────────────────────────────────────── */

function ValuationPillar({ score, details, currency }: {
  score: number;
  details: ValuationDetails;
  currency: string;
}) {
  const { fairValue, currentPrice, discountPct, peRatio } = details;
  const undervalued = discountPct >= 0;
  const barFill = Math.min(Math.abs(discountPct), 50);
  const barColor = undervalued ? '#10b981' : '#f87171';

  return (
    <PillarShell title="Valoración" score={score}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#475569' }}>
            Fair Value
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700, color: '#F8FAFC', fontVariantNumeric: 'tabular-nums' }}>
            {formatMoney(fairValue, currency, 2)}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#475569' }}>
            Cotización
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700, color: '#cbd5e1', fontVariantNumeric: 'tabular-nums' }}>
            {formatMoney(currentPrice, currency, 2)}
          </p>
        </div>
      </div>

      {/* Discount / premium bar — centred at 0, fills outward to ±50% */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{
          position: 'relative', height: 6, background: 'rgba(255,255,255,0.05)',
          borderRadius: 99, overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: undervalued ? '50%' : `${50 - barFill}%`,
            width: `${barFill}%`,
            background: barColor,
            boxShadow: `0 0 6px ${barColor}80`,
            transition: 'width 0.6s ease, left 0.6s ease',
          }} />
          <div style={{
            position: 'absolute', top: -2, bottom: -2, left: '50%',
            width: 1, background: 'rgba(255,255,255,0.20)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#64748b' }}>
            {undervalued ? 'Cotiza por debajo de su valor intrínseco' : 'Cotiza con prima sobre su valor intrínseco'}
          </span>
          <span style={{
            fontSize: 12, fontWeight: 700, color: barColor,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {undervalued ? '−' : '+'}{Math.abs(discountPct).toFixed(1)}%
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
        <KpiTile label="P/E (TTM)" value={peRatio.toFixed(1)} hint="Múltiplo precio/beneficio sobre 12 meses" />
      </div>
    </PillarShell>
  );
}

function FuturePillar({ score, details }: { score: number; details: FutureDetails }) {
  return (
    <PillarShell title="Crecimiento futuro" score={score}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <KpiTile label="Ingresos" value={pct(details.revenueGrowth)} hint="CAGR 3 años" />
        <KpiTile label="BPA" value={pct(details.epsGrowth)} hint="Beneficio por acción" />
        <KpiTile label="ROE futuro" value={pct(details.futureRoe)} hint="Año +3" />
      </div>
    </PillarShell>
  );
}

function PastPillar({ score, details }: { score: number; details: PastDetails }) {
  return (
    <PillarShell title="Rendimiento pasado" score={score}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        <KpiTile label="ROE" value={pct(details.roe)} hint="Return on equity" />
        <KpiTile label="ROCE" value={pct(details.roce)} hint="Return on capital employed" />
        <KpiTile label="ROA" value={pct(details.roa)} hint="Return on assets" />
        <KpiTile
          label="BPA · CAGR 5y"
          value={pct(details.earningsGrowth)}
          hint={details.earningsGrowth >= 0 ? 'Crecimiento histórico' : 'Decrecimiento'}
        />
      </div>
    </PillarShell>
  );
}

function HealthPillar({ score, details, currency }: {
  score: number;
  details: HealthDetails;
  currency: string;
}) {
  const { debtToEquity, shortTermAssets, shortTermLiabilities } = details;
  // D/E severity bar: 0 = pristine, 1 = neutral, 2+ = elevated
  const dePercent = Math.min(debtToEquity / 2, 1) * 100;
  const deColor = debtToEquity <= 0.5 ? '#10b981' : debtToEquity <= 1.0 ? '#f59e0b' : '#f87171';
  const solvencyRatio = shortTermLiabilities > 0 ? shortTermAssets / shortTermLiabilities : 0;
  const solvent = solvencyRatio >= 1;

  return (
    <PillarShell title="Salud financiera" score={score}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#475569' }}>
            Deuda / Equity
          </span>
          <span style={{
            fontSize: 16, fontWeight: 700, color: deColor,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {debtToEquity.toFixed(2)}×
          </span>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${dePercent}%`, background: deColor,
            boxShadow: `0 0 6px ${deColor}80`,
            transition: 'width 0.6s ease',
          }} />
        </div>
        <span style={{ fontSize: 10, color: '#64748b' }}>
          {debtToEquity <= 0.5
            ? 'Apalancamiento bajo · balance limpio'
            : debtToEquity <= 1.0
              ? 'Apalancamiento moderado'
              : 'Apalancamiento elevado — revisar'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <KpiTile
          label="Activos CP"
          value={formatBillions(shortTermAssets, currency)}
          hint="Corto plazo"
        />
        <KpiTile
          label="Pasivos CP"
          value={formatBillions(shortTermLiabilities, currency)}
          hint="Corto plazo"
        />
      </div>
      <div style={{
        background: solvent ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
        border: `1px solid ${solvent ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
        borderRadius: 10, padding: '8px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>
          Cobertura de pasivos a corto plazo
        </span>
        <span style={{
          fontSize: 12, fontWeight: 700, color: solvent ? '#10b981' : '#f87171',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {solvencyRatio.toFixed(2)}×
        </span>
      </div>
    </PillarShell>
  );
}

function DividendPillar({ score, details }: { score: number; details: DividendDetails }) {
  if (details.yield === 0) {
    return (
      <PillarShell title="Dividendo" score={score}>
        <div style={{
          padding: '16px 14px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 10,
          textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: 13, color: '#cbd5e1', fontWeight: 600 }}>
            No reparte dividendos
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 11, color: '#64748b' }}>
            La compañía reinvierte todo el beneficio en crecimiento.
          </p>
        </div>
      </PillarShell>
    );
  }
  return (
    <PillarShell title="Dividendo" score={score}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <KpiTile label="Yield" value={`${details.yield.toFixed(2)}%`} hint="TTM" />
        <KpiTile label="Payout" value={`${details.payoutRatio.toFixed(1)}%`} hint="Sobre BPA" />
        <KpiTile
          label="Años creciendo"
          value={`${details.yearsGrowth}`}
          hint={details.yearsGrowth >= 10 ? 'Aristócrata potencial' : 'Histórico'}
        />
      </div>
    </PillarShell>
  );
}

/* ─── Fallback for tickers without details ───────────────────────────── */

function FallbackBreakdown({ data }: { data: AnalysisData }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {DIMENSIONS.map((d) => {
        const score = data[d.key];
        const color = scoreColor(score);
        return (
          <div
            key={d.key}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: '14px 14px 16px',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
                {d.label}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                color, textTransform: 'uppercase',
              }}>
                {scoreLabel(score)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{
                fontSize: 22, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em',
              }}>
                {score}
              </span>
              <span style={{ fontSize: 10, color: '#475569', fontWeight: 600 }}>/100</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
              <div style={{
                height: '100%', width: `${score}%`, background: color,
                borderRadius: 99, boxShadow: `0 0 6px ${color}80`,
                transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
              }} />
            </div>
            <p style={{ margin: 0, fontSize: 11, lineHeight: 1.5, color: '#64748b' }}>
              {d.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
