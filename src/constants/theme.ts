import type { AssetCategory } from '../types';

// Cohesive muted category palette — none of these clash with
// emerald (positive P&L) or soft red (negative P&L)
export const CATEGORY_COLORS: Record<AssetCategory, string> = {
  'index-fund': '#A78BFA', // violet-400
  etf: '#22D3EE',          // cyan-400
  stock: '#FBBF24',        // amber-400
};

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  'index-fund': 'Index Funds',
  etf: 'ETFs',
  stock: 'Stocks',
};

export function formatCurrency(value: number, currency: 'USD' | 'EUR' = 'USD'): string {
  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'de-DE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCompact(value: number, currency: 'USD' | 'EUR' = 'USD'): string {
  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'de-DE', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPercent(value: number, withSign = true): string {
  const sign = withSign && value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d === 1) return 'yesterday';
  return `${d}d ago`;
}
