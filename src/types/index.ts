export type AssetCategory = 'index-fund' | 'etf' | 'stock';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  category: AssetCategory;
  currency: 'USD' | 'EUR';
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
