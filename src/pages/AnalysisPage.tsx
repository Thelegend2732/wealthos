import { useEffect, useRef, useState } from 'react';
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

/**
 * Simply Wall St-inspired fundamental analysis page. Five dimensions are
 * scored 0–100; the radar chart visualises the snowflake, the weighted
 * average forms an aggregate "Snowflake Score", and per-dimension cards
 * explain what each axis means.
 *
 * Data is mocked for now (see MOCK_ANALYSIS) so the design can be iterated
 * before a real fundamentals API is wired in.
 */

interface Analysis {
  value: number;     // Valor: ¿cotiza por debajo de su valor intrínseco?
  future: number;    // Futuro: ¿se espera crecimiento sostenido?
  past: number;      // Pasado: ¿calidad del rendimiento histórico?
  health: number;    // Salud: ¿solvencia y balance financiero?
  dividend: number;  // Dividendo: ¿política de dividendos y rentabilidad?
}

interface CompanyMeta {
  symbol: string;
  name: string;
  currency: string;
  exchange?: string;
}

const MOCK_ANALYSIS: Record<string, Analysis> = {
  NVDA:  { value: 72, future: 85, past: 90, health: 65, dividend: 20 },
  AAPL:  { value: 55, future: 70, past: 88, health: 90, dividend: 60 },
  MSFT:  { value: 62, future: 80, past: 85, health: 88, dividend: 55 },
  ASML:  { value: 48, future: 78, past: 82, health: 75, dividend: 40 },
  GOOGL: { value: 68, future: 82, past: 80, health: 85, dividend: 25 },
};

const DEFAULT_TICKER = 'NVDA';

const DEFAULT_META: Record<string, CompanyMeta> = {
  NVDA:  { symbol: 'NVDA',  name: 'NVIDIA Corporation',  currency: 'USD', exchange: 'NASDAQ' },
  AAPL:  { symbol: 'AAPL',  name: 'Apple Inc.',          currency: 'USD', exchange: 'NASDAQ' },
  MSFT:  { symbol: 'MSFT',  name: 'Microsoft Corporation', currency: 'USD', exchange: 'NASDAQ' },
  ASML:  { symbol: 'ASML',  name: 'ASML Holding N.V.',   currency: 'USD', exchange: 'NASDAQ' },
  GOOGL: { symbol: 'GOOGL', name: 'Alphabet Inc.',       currency: 'USD', exchange: 'NASDAQ' },
};

/** Deterministic mock for tickers outside the curated table. */
function mockFor(symbol: string): Analysis {
  let h = 0;
  for (let i = 0; i < symbol.length; i++) h = (h * 31 + symbol.charCodeAt(i)) | 0;
  const r = (offset: number) => {
    const x = Math.sin(h + offset) * 10000;
    const f = x - Math.floor(x);
    return Math.round(30 + f * 60); // 30–90 range
  };
  return {
    value: r(1),
    future: r(2),
    past: r(3),
    health: r(4),
    dividend: r(5),
  };
}

interface Dimension {
  key: keyof Analysis;
  label: string;
  description: string;
}

const DIMENSIONS: Dimension[] = [
  { key: 'value',    label: 'Valor',     description: '¿Cotiza por debajo de su valor intrínseco según múltiplos y flujos descontados?' },
  { key: 'future',   label: 'Futuro',    description: '¿Se proyecta crecimiento sostenido en ingresos y beneficios?' },
  { key: 'past',     label: 'Pasado',    description: '¿Qué calidad ha tenido el rendimiento histórico de la compañía?' },
  { key: 'health',   label: 'Salud',     description: '¿Solvencia, balance limpio y capacidad de afrontar deuda a corto plazo?' },
  { key: 'dividend', label: 'Dividendo', description: '¿Rentabilidad por dividendo y sostenibilidad de la política de reparto?' },
];

function scoreColor(score: number): string {
  if (score >= 80) return '#10b981'; // emerald — excelente
  if (score >= 60) return '#84cc16'; // lime — bueno
  if (score >= 40) return '#f59e0b'; // amber — regular
  return '#ef4444';                   // red — débil
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Bueno';
  if (score >= 40) return 'Regular';
  return 'Débil';
}

export function AnalysisPage() {
  const [meta, setMeta] = useState<CompanyMeta>(DEFAULT_META[DEFAULT_TICKER]);
  const [analysis, setAnalysis] = useState<Analysis>(MOCK_ANALYSIS[DEFAULT_TICKER]);

  // Search UI
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SymbolMatch[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const symbol = m.symbol.toUpperCase();
    setMeta({
      symbol,
      name: m.name,
      currency: m.currency,
      exchange: m.exchange,
    });
    setAnalysis(MOCK_ANALYSIS[symbol] ?? mockFor(symbol));
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    setSearching(false);
  };

  // Snowflake aggregate — simple unweighted average across the five axes,
  // matching Simply Wall St's headline "Snowflake Score".
  const snowflake = Math.round(
    (analysis.value + analysis.future + analysis.past + analysis.health + analysis.dividend) / 5
  );

  const radarData = DIMENSIONS.map((d) => ({
    dimension: d.label,
    score: analysis[d.key],
    fullMark: 100,
  }));

  return (
    <div style={{ padding: '40px 20px 20px', color: '#f1f5f9' }}>
      {/* Header */}
      <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.025em', color: '#F8FAFC', margin: 0 }}>
        Análisis fundamental
      </h1>
      <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 24px' }}>
        Datos ficticios · Vista previa del diseño
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
        <div style={{ minWidth: 0 }}>
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
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {meta.name}
          </p>
        </div>
      </div>

      {/* Radar */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 24, padding: 20,
        marginBottom: 16,
      }}>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="78%">
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
        marginBottom: 24,
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
          const score = analysis[d.key];
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

      {/* Mock data disclaimer */}
      <p style={{
        marginTop: 18, fontSize: 11, color: '#475569', fontStyle: 'italic',
        textAlign: 'center', lineHeight: 1.5,
      }}>
        Los datos mostrados son ficticios. Conectaremos una fuente real de fundamentales en una próxima iteración.
      </p>
    </div>
  );
}
