import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  formatCurrency,
  formatPercent,
} from '../../constants/theme';
import type { Asset, PriceData } from '../../types';

interface Props {
  asset: Asset;
  price?: PriceData;
  index: number;
}

export function AssetCard({ asset, price, index }: Props) {
  const value = asset.currentPrice * asset.quantity;
  const invested = asset.avgPrice * asset.quantity;
  const pnl = value - invested;
  const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
  const pnlPos = pnl >= 0;

  const dayChange = price?.changePercent ?? 0;
  const dayPos = dayChange >= 0;
  const categoryColor = CATEGORY_COLORS[asset.category];

  return (
    <article
      className="card card-hover p-4 sm:p-5 flex items-start justify-between gap-4 animate-slide-up"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Left */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg font-bold tracking-wide text-text-primary">
            {asset.symbol}
          </span>
          {price?.isDelayed && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-accent bg-accent/15 px-1.5 py-0.5 rounded">
              Mock
            </span>
          )}
        </div>
        <p className="text-sm text-text-secondary truncate">{asset.name}</p>
        <div className="flex items-center gap-3 mt-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
            style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
          >
            {CATEGORY_LABELS[asset.category]}
          </span>
          <span className="text-xs text-text-muted">{asset.quantity} shares</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col items-end gap-1 shrink-0 tabular">
        <span className="text-base sm:text-lg font-bold text-text-primary">
          {formatCurrency(asset.currentPrice)}
        </span>
        <span
          className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${
            dayPos
              ? 'bg-success/15 text-success'
              : 'bg-danger/15 text-danger'
          }`}
        >
          {dayPos ? '▲' : '▼'} {formatPercent(dayChange)}
        </span>
        <div className="flex items-center gap-1.5 mt-1">
          <span
            className={`text-sm font-semibold ${pnlPos ? 'text-success' : 'text-danger'}`}
          >
            {pnlPos ? '+' : ''}
            {formatCurrency(pnl)}
          </span>
          <span
            className={`text-[11px] ${pnlPos ? 'text-success/80' : 'text-danger/80'}`}
          >
            {formatPercent(pnlPct)}
          </span>
        </div>
        <span className="text-[11px] text-text-muted">{formatCurrency(value)} total</span>
      </div>
    </article>
  );
}
