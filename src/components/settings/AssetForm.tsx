import { useState, useEffect, useRef } from 'react';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../constants/theme';
import {
  searchSymbols,
  fetchQuote,
  type SymbolMatch,
} from '../../services/yahooFinance';
import { toEur } from '../../services/fxService';
import { useEurFx } from '../../hooks/useEurFx';
import { useUIStore } from '../../stores/uiStore';
import type { Asset, AssetCategory } from '../../types';

interface Props {
  open: boolean;
  asset?: Asset;
  onClose: () => void;
  onSave: (data: Omit<Asset, 'id' | 'currentPrice'> & { currentPrice?: number }) => void;
}

const CATEGORIES: AssetCategory[] = ['index-fund', 'etf', 'stock'];

export function AssetForm({ open, asset, onClose, onSave }: Props) {
  // Validated ticker from Yahoo search. Save is blocked unless this is set.
  const [match, setMatch] = useState<SymbolMatch | null>(null);

  // Search UI state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SymbolMatch[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Live price (native currency) + EUR equivalent
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  // Position fields (avgPrice is ALWAYS EUR — the user's cost basis in €)
  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [category, setCategory] = useState<AssetCategory>('stock');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { rates } = useEurFx();

  // Hide bottom nav while modal is mounted
  const openModal = useUIStore((s) => s.openModal);
  const closeModal = useUIStore((s) => s.closeModal);
  useEffect(() => {
    if (!open) return;
    openModal();
    return () => closeModal();
  }, [open, openModal, closeModal]);

  // Reset/hydrate on open
  useEffect(() => {
    if (!open) return;
    if (asset) {
      const known: SymbolMatch = {
        symbol: asset.symbol,
        name: asset.name,
        category: asset.category,
        currency: asset.currency,
      };
      setMatch(known);
      setQuery(`${known.symbol} — ${known.name}`);
      setQuantity(asset.quantity.toString());
      setAvgPrice(asset.avgPrice.toString());
      setCategory(asset.category);
      setLivePrice(asset.currentPrice);
    } else {
      setMatch(null);
      setQuery('');
      setResults([]);
      setShowDropdown(false);
      setLivePrice(null);
      setQuantity('');
      setAvgPrice('');
      setCategory('stock');
    }
  }, [asset, open]);

  // Debounced Yahoo search
  useEffect(() => {
    if (!open) return;
    if (match && query === `${match.symbol} — ${match.name}`) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      setSearching(false);
      return;
    }
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
  }, [query, open, match]);

  const handleSelect = async (m: SymbolMatch) => {
    setMatch(m);
    setQuery(`${m.symbol} — ${m.name}`);
    setCategory(m.category);
    setShowDropdown(false);
    setPriceLoading(true);
    try {
      const q = await fetchQuote(m.symbol);
      if (q && q.price > 0) {
        setLivePrice(q.price);
        // Sync currency from the actual quote (Yahoo's search currency is
        // sometimes stale on cross-listed tickers).
        setMatch({ ...m, currency: q.currency || m.currency });
        // Pre-fill avgPrice in EUR if empty
        if (!avgPrice) {
          const eur = toEur(q.price, q.currency || m.currency, rates);
          setAvgPrice(eur.toFixed(2));
        }
      } else {
        setLivePrice(null);
      }
    } catch {
      setLivePrice(null);
    } finally {
      setPriceLoading(false);
    }
  };

  const handleSave = () => {
    if (!match) return;
    const q = parseFloat(quantity);
    const p = parseFloat(avgPrice);
    if (isNaN(q) || q <= 0 || isNaN(p) || p <= 0) return;
    onSave({
      symbol: match.symbol,
      name: match.name,
      quantity: q,
      avgPrice: p, // EUR cost basis
      category,
      currency: match.currency, // native ticker currency
      currentPrice: livePrice ?? undefined,
    });
    onClose();
  };

  if (!open) return null;

  const canSave =
    !!match &&
    !isNaN(parseFloat(quantity)) &&
    parseFloat(quantity) > 0 &&
    !isNaN(parseFloat(avgPrice)) &&
    parseFloat(avgPrice) > 0;

  const livePriceEur =
    livePrice != null && match ? toEur(livePrice, match.currency, rates) : null;

  return (
    <>
      <style>{`
        .af-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 14px 16px;
          color: #F8FAFC;
          font-size: 16px;
          font-weight: 500;
          outline: none;
          transition: border-color 200ms, background 200ms;
          box-sizing: border-box;
        }
        .af-input:focus {
          border-color: rgba(16,185,129,0.5);
          background: rgba(16,185,129,0.04);
        }
        .af-input::placeholder { color: #334155; font-weight: 400; }
        .af-input[type=number]::-webkit-inner-spin-button,
        .af-input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
      `}</style>

      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.80)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'flex-end',
          animation: 'slideIn 0.2s both',
        }}
        onClick={onClose}
      >
        <div
          style={{
            width: '100%', maxWidth: 480, margin: '0 auto',
            maxHeight: '92dvh',
            background: 'linear-gradient(180deg, #141c2e 0%, #0d1520 100%)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '28px 28px 0 0',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0', flexShrink: 0 }}>
            <div style={{ width: 40, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.18)' }} />
          </div>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 24px 12px', flexShrink: 0,
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.025em' }}>
                {asset ? 'Editar posición' : 'Nueva posición'}
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: 13, color: '#64748b' }}>
                {asset ? 'Modifica los datos de tu activo' : 'Busca cualquier activo (acciones, ETFs, fondos…)'}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div style={{
            overflowY: 'auto', flex: 1, padding: '8px 24px 32px',
            WebkitOverflowScrolling: 'touch',
          }}>
            {/* Search */}
            <div style={{ marginBottom: 14, position: 'relative' }}>
              <Label text="Activo" hint="ISIN, ticker o nombre completo" />
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (match) setMatch(null);
                  }}
                  onFocus={() => results.length > 0 && setShowDropdown(true)}
                  placeholder="Fidelity S&P 500, SK Hynix, MSFT, ASML.AS…"
                  className="af-input"
                  style={{ paddingLeft: 42 }}
                  autoFocus={!asset}
                  disabled={!!asset}
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
                {match && !searching && (
                  <span style={{
                    position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}

                {/* Dropdown */}
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
                          display: 'flex', alignItems: 'center', gap: 12,
                          color: '#e2e8f0',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(16,185,129,0.08)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span style={{
                          fontFamily: 'ui-monospace, SF Mono, monospace',
                          fontSize: 13, fontWeight: 700, color: '#10b981',
                          minWidth: 72,
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

                {showDropdown && !searching && query.trim().length > 1 && results.length === 0 && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                    background: 'rgba(20, 28, 46, 0.98)',
                    border: '1px solid rgba(239,68,68,0.30)',
                    borderRadius: 14, padding: '14px 16px',
                    fontSize: 13, color: '#fca5a5', zIndex: 5,
                  }}>
                    No se encontró ningún activo. Comprueba el nombre o prueba con el ISIN.
                  </div>
                )}
              </div>

              {/* Live price chip (native + EUR) */}
              {match && (
                <div style={{
                  marginTop: 10,
                  background: 'rgba(16,185,129,0.07)',
                  border: '1px solid rgba(16,185,129,0.22)',
                  borderRadius: 12, padding: '10px 14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 8,
                }}>
                  <span style={{ fontSize: 11, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Cotización
                  </span>
                  <span style={{
                    fontSize: 14, fontWeight: 700, color: '#10b981',
                    fontFamily: 'ui-monospace, SF Mono, monospace',
                    textAlign: 'right',
                  }}>
                    {priceLoading
                      ? 'Cargando…'
                      : livePrice && livePriceEur != null
                        ? `${formatNative(livePrice, match.currency)} · ${formatEur(livePriceEur)}`
                        : '—'}
                  </span>
                </div>
              )}
            </div>

            {/* Quantity + Avg price */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <Label text="Cantidad" hint="Participaciones" />
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  className="af-input"
                  step="any"
                  min="0"
                  disabled={!match}
                />
              </div>
              <div>
                <Label text="Precio medio" hint="Coste por unidad (€)" />
                <input
                  type="number"
                  value={avgPrice}
                  onChange={(e) => setAvgPrice(e.target.value)}
                  placeholder="0.00"
                  className="af-input"
                  step="any"
                  min="0"
                  disabled={!match}
                />
              </div>
            </div>

            {/* Category */}
            <div style={{ marginBottom: 28 }}>
              <Label text="Categoría" />
              <div style={{ display: 'flex', gap: 8 }}>
                {CATEGORIES.map((c) => {
                  const isActive = category === c;
                  return (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      style={{
                        flex: 1, padding: '12px 8px', borderRadius: 14,
                        background: isActive ? 'rgba(16,185,129,0.10)' : 'rgba(255,255,255,0.03)',
                        border: isActive ? '1.5px solid rgba(16,185,129,0.40)' : '1.5px solid rgba(255,255,255,0.07)',
                        color: isActive ? '#e2fef4' : '#64748b',
                        fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        transition: 'all 0.18s',
                      }}
                    >
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: CATEGORY_COLORS[c],
                        boxShadow: isActive ? `0 0 8px ${CATEGORY_COLORS[c]}80` : 'none',
                      }} />
                      {CATEGORY_LABELS[c]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save + cancel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 32 }}>
              <button
                onClick={handleSave}
                disabled={!canSave}
                style={{
                  width: '100%', padding: '18px 0',
                  background: canSave
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'rgba(255,255,255,0.05)',
                  border: 'none', borderRadius: 20,
                  color: canSave ? '#fff' : '#475569',
                  fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em',
                  cursor: canSave ? 'pointer' : 'not-allowed',
                  transition: 'opacity 0.18s',
                  boxShadow: canSave ? '0 8px 24px rgba(16,185,129,0.30)' : 'none',
                }}
                onMouseEnter={e => canSave && (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => canSave && (e.currentTarget.style.opacity = '1')}
              >
                {asset ? 'Guardar cambios' : 'Guardar posición'}
              </button>
              <button
                onClick={onClose}
                style={{
                  width: '100%', padding: '15px 0',
                  background: 'transparent',
                  border: '1.5px solid rgba(255,255,255,0.10)', borderRadius: 20,
                  color: '#64748b', fontSize: 15, fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function formatNative(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'GBp' ? 'GBP' : currency,
      maximumFractionDigits: 2,
    }).format(currency === 'GBp' ? price / 100 : price);
  } catch {
    return `${price.toFixed(2)} ${currency}`;
  }
}

function formatEur(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(amount);
}

function Label({ text, hint }: { text: string; hint?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#475569' }}>
        {text}
      </span>
      {hint && <span style={{ fontSize: 10, color: '#334155' }}>{hint}</span>}
    </div>
  );
}
