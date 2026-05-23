import { useState, useEffect } from 'react';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../constants/theme';
import type { Asset, AssetCategory } from '../../types';

interface Props {
  open: boolean;
  asset?: Asset;
  onClose: () => void;
  onSave: (data: Omit<Asset, 'id' | 'currentPrice'>) => void;
}

const CATEGORIES: AssetCategory[] = ['index-fund', 'etf', 'stock'];
const CURRENCIES: Array<'USD' | 'EUR'> = ['USD', 'EUR'];

export function AssetForm({ open, asset, onClose, onSave }: Props) {
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [category, setCategory] = useState<AssetCategory>('stock');
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');

  useEffect(() => {
    if (asset) {
      setSymbol(asset.symbol);
      setName(asset.name);
      setQuantity(asset.quantity.toString());
      setAvgPrice(asset.avgPrice.toString());
      setCategory(asset.category);
      setCurrency(asset.currency);
    } else {
      setSymbol('');
      setName('');
      setQuantity('');
      setAvgPrice('');
      setCategory('stock');
      setCurrency('USD');
    }
  }, [asset, open]);

  const handleSave = () => {
    const q = parseFloat(quantity);
    const p = parseFloat(avgPrice);
    if (!symbol.trim() || !name.trim() || isNaN(q) || q <= 0 || isNaN(p) || p <= 0) return;
    onSave({
      symbol: symbol.trim().toUpperCase(),
      name: name.trim(),
      quantity: q,
      avgPrice: p,
      category,
      currency,
    });
    onClose();
  };

  if (!open) return null;

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
        .af-input::placeholder {
          color: #334155;
          font-weight: 400;
        }
        .af-input[type=number]::-webkit-inner-spin-button,
        .af-input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
        }
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
          <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
            <div style={{ width: 40, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.18)' }} />
          </div>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.025em' }}>
                {asset ? 'Editar posición' : 'Nueva posición'}
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: 13, color: '#64748b' }}>
                {asset ? 'Modifica los datos de tu activo' : 'Añade un activo a tu cartera'}
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

          {/* Scrollable form body */}
          <div style={{
            overflowY: 'auto', flex: 1, padding: '8px 24px 32px',
            WebkitOverflowScrolling: 'touch',
          }}>
            {/* Row 1: Symbol + Currency */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <Label text="Símbolo" hint="Ticker" />
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="NVDA"
                  className="af-input"
                  autoFocus
                  maxLength={8}
                />
              </div>
              <div>
                <Label text="Divisa" />
                <div style={{
                  display: 'flex', gap: 6,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1.5px solid rgba(255,255,255,0.08)',
                  borderRadius: 14, padding: 5,
                }}>
                  {CURRENCIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      style={{
                        flex: 1, padding: '9px 0', borderRadius: 10,
                        background: currency === c ? 'rgba(16,185,129,0.15)' : 'transparent',
                        border: currency === c ? '1px solid rgba(16,185,129,0.35)' : '1px solid transparent',
                        color: currency === c ? '#10b981' : '#64748b',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.18s',
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Name */}
            <div style={{ marginBottom: 14 }}>
              <Label text="Nombre completo" hint="Nombre del activo" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="NVIDIA Corporation"
                className="af-input"
              />
            </div>

            {/* Row 2: Quantity + Avg Price */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <Label text="Cantidad" hint="Acciones" />
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  className="af-input"
                  step="any"
                  min="0"
                />
              </div>
              <div>
                <Label text="Precio medio" hint={`Por acción (${currency})`} />
                <input
                  type="number"
                  value={avgPrice}
                  onChange={(e) => setAvgPrice(e.target.value)}
                  placeholder="0.00"
                  className="af-input"
                  step="any"
                  min="0"
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
                        display: 'block',
                        boxShadow: isActive ? `0 0 8px ${CATEGORY_COLORS[c]}80` : 'none',
                      }} />
                      {CATEGORY_LABELS[c]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cancel + Save */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 32 }}>
              <button
                onClick={handleSave}
                style={{
                  width: '100%', padding: '18px 0',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none', borderRadius: 20,
                  color: '#fff', fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em',
                  cursor: 'pointer', transition: 'opacity 0.18s',
                  boxShadow: '0 8px 24px rgba(16,185,129,0.30)',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
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
                  cursor: 'pointer', transition: 'border-color 0.18s, color 0.18s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
                  e.currentTarget.style.color = '#94a3b8';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
                  e.currentTarget.style.color = '#64748b';
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
