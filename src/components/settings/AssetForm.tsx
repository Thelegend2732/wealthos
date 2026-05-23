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
    <div
      className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg flex flex-col animate-slide-up"
        style={{ maxHeight: '90dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed header — never scrolls away */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4 shrink-0">
          <h3 className="text-xl font-semibold text-text-primary tracking-tight-2">
            {asset ? 'Editar posición' : 'Nueva posición'}
          </h3>
          <button onClick={onClose} className="icon-btn" aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="overflow-y-auto flex-1 px-8 pb-10 space-y-5" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="grid grid-cols-2 gap-5">
            <FormField label="Símbolo" hint="Ticker (ej. NVDA)">
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="NVDA"
                className="input"
                autoFocus
                maxLength={8}
              />
            </FormField>
            <FormField label="Divisa">
              <div className="flex gap-1 bg-bg rounded-lg p-1 border border-border">
                {CURRENCIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      currency === c
                        ? 'bg-surface-elevated text-text-primary'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </FormField>
          </div>

          <FormField label="Nombre" hint="Nombre completo del activo">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="NVIDIA Corporation"
              className="input"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-5">
            <FormField label="Cantidad" hint="Acciones en cartera">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="input tabular"
                step="any"
                min="0"
              />
            </FormField>
            <FormField label="Precio medio" hint={`Por acción (${currency})`}>
              <input
                type="number"
                value={avgPrice}
                onChange={(e) => setAvgPrice(e.target.value)}
                placeholder="0.00"
                className="input tabular"
                step="any"
                min="0"
              />
            </FormField>
          </div>

          <FormField label="Categoría">
            <div className="flex gap-2">
              {CATEGORIES.map((c) => {
                const isActive = category === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`flex-1 py-3 px-3 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                      isActive
                        ? 'border-border-active bg-surface-elevated text-text-primary'
                        : 'border-border text-text-secondary hover:border-border-strong'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[c] }} />
                    {CATEGORY_LABELS[c]}
                  </button>
                );
              })}
            </div>
          </FormField>

          {/* Action buttons — inside scroll area so they're always reachable */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 h-11 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-border-strong font-medium text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 h-11 rounded-lg bg-text-primary text-bg font-medium text-sm hover:bg-text-secondary transition-colors"
            >
              {asset ? 'Guardar cambios' : 'Añadir posición'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(148, 163, 184, 0.08);
          padding: 8px 0;
          color: #F8FAFC;
          font-size: 15px;
          font-weight: 500;
          outline: none;
          transition: border-color 200ms;
        }
        .input:focus {
          border-color: rgba(148, 163, 184, 0.32);
        }
        .input::placeholder {
          color: #475569;
        }
      `}</style>
    </div>
  );
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="overline">{label}</label>
        {hint && <span className="text-[10px] text-text-faint">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
