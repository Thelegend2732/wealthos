import { create } from 'zustand';
import { Asset, AssetCategory, PriceData } from '../types';

interface PortfolioStore {
  assets: Asset[];
  prices: Record<string, PriceData>;
  lastUpdated: Date | null;
  isLoading: boolean;
  selectedCategory: AssetCategory | null;
  addAsset: (asset: Omit<Asset, 'id' | 'currentPrice'>) => void;
  removeAsset: (id: string) => void;
  updatePrice: (symbol: string, data: PriceData) => void;
  updatePrices: (prices: Record<string, PriceData>) => void;
  setLoading: (loading: boolean) => void;
  setSelectedCategory: (category: AssetCategory | null) => void;
  getTotalValue: () => number;
  getTotalInvested: () => number;
  getPnL: () => { amount: number; percentage: number };
  getTodayChange: () => { amount: number; percentage: number };
  getCategoryBreakdown: () => Record<AssetCategory, number>;
  getFilteredAssets: () => Asset[];
}

const INITIAL_ASSETS: Asset[] = [
  {
    id: '1',
    symbol: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    quantity: 10,
    avgPrice: 420,
    currentPrice: 420,
    category: 'index-fund',
    currency: 'USD',
  },
  {
    id: '2',
    symbol: 'QQQ',
    name: 'Invesco Nasdaq 100 ETF',
    quantity: 5,
    avgPrice: 380,
    currentPrice: 380,
    category: 'index-fund',
    currency: 'USD',
  },
  {
    id: '3',
    symbol: 'SOXX',
    name: 'iShares Semiconductor ETF',
    quantity: 8,
    avgPrice: 220,
    currentPrice: 220,
    category: 'etf',
    currency: 'USD',
  },
  {
    id: '4',
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    quantity: 15,
    avgPrice: 680,
    currentPrice: 680,
    category: 'stock',
    currency: 'USD',
  },
  {
    id: '5',
    symbol: 'ASML',
    name: 'ASML Holding',
    quantity: 3,
    avgPrice: 750,
    currentPrice: 750,
    category: 'stock',
    currency: 'USD',
  },
];

export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  assets: INITIAL_ASSETS,
  prices: {},
  lastUpdated: null,
  isLoading: false,
  selectedCategory: null,

  addAsset: (asset) => {
    const newAsset: Asset = {
      ...asset,
      id: Date.now().toString(),
      currentPrice: asset.avgPrice,
    };
    set((state) => ({ assets: [...state.assets, newAsset] }));
  },

  removeAsset: (id) => {
    set((state) => ({ assets: state.assets.filter((a) => a.id !== id) }));
  },

  updatePrice: (symbol, data) => {
    set((state) => ({
      prices: { ...state.prices, [symbol]: data },
      assets: state.assets.map((a) =>
        a.symbol === symbol ? { ...a, currentPrice: data.price } : a
      ),
      lastUpdated: new Date(),
    }));
  },

  updatePrices: (prices) => {
    set((state) => ({
      prices: { ...state.prices, ...prices },
      assets: state.assets.map((a) =>
        prices[a.symbol] ? { ...a, currentPrice: prices[a.symbol].price } : a
      ),
      lastUpdated: new Date(),
    }));
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  getTotalValue: () => {
    const { assets } = get();
    return assets.reduce((sum, a) => sum + a.currentPrice * a.quantity, 0);
  },

  getTotalInvested: () => {
    const { assets } = get();
    return assets.reduce((sum, a) => sum + a.avgPrice * a.quantity, 0);
  },

  getPnL: () => {
    const totalValue = get().getTotalValue();
    const totalInvested = get().getTotalInvested();
    const amount = totalValue - totalInvested;
    const percentage = totalInvested > 0 ? (amount / totalInvested) * 100 : 0;
    return { amount, percentage };
  },

  getTodayChange: () => {
    const { assets, prices } = get();
    let totalChange = 0;
    let totalPrev = 0;
    assets.forEach((a) => {
      const price = prices[a.symbol];
      if (price) {
        totalChange += price.change * a.quantity;
        totalPrev += (a.currentPrice - price.change) * a.quantity;
      }
    });
    const percentage = totalPrev > 0 ? (totalChange / totalPrev) * 100 : 0;
    return { amount: totalChange, percentage };
  },

  getCategoryBreakdown: () => {
    const { assets } = get();
    const breakdown: Record<AssetCategory, number> = {
      'index-fund': 0,
      etf: 0,
      stock: 0,
    };
    assets.forEach((a) => {
      breakdown[a.category] += a.currentPrice * a.quantity;
    });
    return breakdown;
  },

  getFilteredAssets: () => {
    const { assets, selectedCategory } = get();
    if (!selectedCategory) return assets;
    return assets.filter((a) => a.category === selectedCategory);
  },
}));
