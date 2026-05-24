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
  NoFundamentalsError,
  type FundamentalAnalysis,
} from '../services/fundamentals';

/**
 * Simply Wall St-inspired fundamental analysis page. Real data comes from
 * Financial Modeling Prep (see services/fundamentals.ts); the five axes are
 * normalised onto a 0–100 snowflake scale. ETFs and other instruments
 * without fundamentals trigger a typed NoFundamentalsError, which the UI
 * surfaces as a friendly empty state.
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
  key: keyof Pick<FundamentalAnalysis, 'value' | 'future' | 'past' | 'health' | 'dividend'>;
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

  // Real fundamentals via React Query — caching + retries handled automatically.
  const {
    data: analysisData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery<FundamentalAnalysis, Error>({
    queryKey: ['fundamentals', meta.symbol],
    queryFn: () => fetchFundamentalAnalysis(meta.symbol),
    staleTime: 60 * 60 * 1000,   // 1 hour
    retry: 0,                     // FMP errors are usually deterministic (ETF, missing data)
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

  const noFundamentals = isError && error instanceof NoFundamentalsError;
  const loading = isLoading || isFetching;

  return (
    <div style={{ padding: '40px 20px 20px', color: '#f1f5f9' }}>
      {/* Header */}
      <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.025em', color: '#F8FAFC', margin: 0 }}>
        Análisis fundamental
      </h1>
      <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 24px' }}>
        Datos en directo · Financial Modeling Prep
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
            {analysisData?.companyName || meta.name}
          </p>
        </div>
        {analysisData?.rating && !loading && (
          <div style={{
            background: 'rgba(16,185,129,0.10)',
            border: '1px solid rgba(16,185,129,0.30)',
            borderRadius: 10, padding: '6px 10px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0,
          }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#10b981', lineHeight: 1 }}>
              {analysisData.rating}
            </span>
            <span style={{ fontSize: 9, color: '#94a3b8', marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {analysisData.recommendation || 'Rating'}
            </span>
          </div>
        )}
      </div>

      {/* States: loading / error / data */}
      {loading && <LoadingState />}
      {!loading && noFundamentals && <NoFundamentalsState />}
      {!loading && isError && !noFundamentals && (
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
        Fuente: Financial Modeling Prep · Los ratings se normalizan a una escala 0–100.
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

function DataView({ meta, data }: { meta: CompanyMeta; data: FundamentalAnalysis }) {
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
                formatter={(v: number) => [`${v} / 100`, 'Score']}
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

      {/* Dimension cards */}
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
    </div>
  );
}
