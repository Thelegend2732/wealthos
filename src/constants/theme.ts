import type { AssetCategory } from '../types';

export const CATEGORY_COLORS: Record<AssetCategory, string> = {
  'index-fund': '#6C63FF',
  etf: '#00D4AA',
  stock: '#FF8C42',
};

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  'index-fund': 'Index Funds',
  etf: 'ETFs',
  stock: 'Stocks',
};

export const CATEGORY_GRADIENTS: Record<AssetCategory, string> = {
  'index-fund': 'from-[#6C63FF] to-[#8B83FF]',
  etf: 'from-[#00D4AA] to-[#26E5BD]',
  stock: 'from-[#FF8C42] to-[#FFA666]',
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
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d === 1) return 'Yesterday';
  return `${d}d ago`;
}
