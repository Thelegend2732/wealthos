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
      className="card card-hover px-6 py-5 flex items-center justify-between gap-6 animate-slide-up"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Category accent line on the left */}
      <div className="flex items-center gap-5 min-w-0 flex-1">
        <div
          className="w-0.5 h-12 rounded-full shrink-0"
          style={{ backgroundColor: categoryColor }}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-base font-semibold tracking-wide text-text-primary">
              {asset.symbol}
            </span>
            {price?.isDelayed && (
              <span className="text-[9px] uppercase tracking-overline text-text-muted">
                · mock
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted truncate">{asset.name}</p>
          <p className="text-[11px] text-text-faint mt-1 tabular">
            {asset.quantity} shares · {CATEGORY_LABELS[asset.category]}
          </p>
        </div>
      </div>

      {/* Middle: current price + day change */}
      <div className="hidden sm:flex flex-col items-end shrink-0 tabular min-w-[100px]">
        <span className="text-sm font-medium text-text-primary">
          {formatCurrency(asset.currentPrice)}
        </span>
        <span
          className={`text-[11px] mt-0.5 ${
            dayPos ? 'text-success-text' : 'text-danger-text'
          }`}
        >
          {dayPos ? '↑' : '↓'} {formatPercent(dayChange)}
        </span>
      </div>

      {/* Right: position value + P&L */}
      <div className="flex flex-col items-end shrink-0 tabular min-w-[110px]">
        <span className="text-base font-semibold text-text-primary">
          {formatCurrency(value)}
        </span>
        <span
          className={`text-[11px] mt-0.5 ${
            pnlPos ? 'text-success-text' : 'text-danger-text'
          }`}
        >
          {pnlPos ? '+' : ''}
          {formatCurrency(pnl)} · {formatPercent(pnlPct)}
        </span>
      </div>
    </article>
  );
}
