export type AssetCategory = 'index-fund' | 'etf' | 'stock';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  /** Cost basis per share, always stored in EUR (user enters in €). */
  avgPrice: number;
  /** Last known market price in the asset's NATIVE currency (see `currency`).
      UI converts to EUR via `useEurFx` + `toEur()` for all displayed math. */
  currentPrice: number;
  category: AssetCategory;
  /** Native currency reported by Yahoo for this ticker. */
  currency: string;
}

export interface PriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
  isDelayed?: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  source: string;
  publishedAt: Date;
  category: 'finance' | 'tech' | 'lifestyle';
  isRead: boolean;
}

export interface DCAConfig {
  initialCapital: number;
  monthlyContribution: number;
  startDate: Date;
}

export interface ProjectionPoint {
  month: number;
  conservative: number;
  moderate: number;
  optimistic: number;
  totalContributed: number;
}

export interface DCAContribution {
  id: string;
  date: Date;
  amount: number;
  note?: string;
}
