import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Asset, AssetCategory, PriceData } from '../types';
import { KNOWN_MOCK_SYMBOLS } from '../services/alphaVantage';

interface PortfolioStore {
  assets: Asset[];
  prices: Record<string, PriceData>;
  lastUpdated: number | null;
  selectedCategory: AssetCategory | null;
  setSelectedCategory: (c: AssetCategory | null) => void;
  updatePrices: (prices: Record<string, PriceData>) => void;
  addAsset: (a: Omit<Asset, 'id' | 'currentPrice'>) => void;
  updateAsset: (id: string, patch: Partial<Omit<Asset, 'id' | 'currentPrice'>>) => void;
  removeAsset: (id: string) => void;
  resetToDefaults: () => void;
  clearAll: () => void;
  getTotalValue: () => number;
  getTotalInvested: () => number;
  getPnL: () => { amount: number; percentage: number };
  getTodayChange: () => { amount: number; percentage: number };
  getCategoryBreakdown: () => Record<AssetCategory, number>;
  getFilteredAssets: () => Asset[];
}

const INITIAL_ASSETS: Asset[] = [
  { id: '1', symbol: 'VOO', name: 'Vanguard S&P 500 ETF', quantity: 10, avgPrice: 420, currentPrice: 420, category: 'index-fund', currency: 'USD' },
  { id: '2', symbol: 'QQQ', name: 'Invesco Nasdaq 100 ETF', quantity: 5, avgPrice: 380, currentPrice: 380, category: 'index-fund', currency: 'USD' },
  { id: '3', symbol: 'SOXX', name: 'iShares Semiconductor ETF', quantity: 8, avgPrice: 220, currentPrice: 220, category: 'etf', currency: 'USD' },
  { id: '4', symbol: 'NVDA', name: 'NVIDIA Corporation', quantity: 15, avgPrice: 680, currentPrice: 680, category: 'stock', currency: 'USD' },
  { id: '5', symbol: 'ASML', name: 'ASML Holding', quantity: 3, avgPrice: 750, currentPrice: 750, category: 'stock', currency: 'USD' },
];

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      assets: INITIAL_ASSETS,
      prices: {},
      lastUpdated: null,
      selectedCategory: null,

      setSelectedCategory: (c) => set({ selectedCategory: c }),

      updatePrices: (prices) =>
        set((s) => ({
          prices: { ...s.prices, ...prices },
          assets: s.assets.map((a) => {
            const p = prices[a.symbol];
            if (!p || p.price <= 0) return a;
            // If the price is from the mock/delayed fallback and we don't have
            // a curated mock for this symbol, keep the user-entered avgPrice
            // rather than overwriting with the generic 0 sentinel.
            if (p.isDelayed && !KNOWN_MOCK_SYMBOLS.has(a.symbol)) return a;
            return { ...a, currentPrice: p.price };
          }),
          lastUpdated: Date.now(),
        })),

      addAsset: (a) =>
        set((s) => ({
          assets: [
            ...s.assets,
            { ...a, id: crypto.randomUUID(), currentPrice: a.avgPrice },
          ],
        })),

      updateAsset: (id, patch) =>
        set((s) => ({
          assets: s.assets.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),

      removeAsset: (id) =>
        set((s) => ({ assets: s.assets.filter((a) => a.id !== id) })),

      resetToDefaults: () => set({ assets: INITIAL_ASSETS, prices: {}, lastUpdated: null }),

      clearAll: () => set({ assets: [], prices: {}, lastUpdated: null }),

      getTotalValue: () =>
        get().assets.reduce((sum, a) => sum + a.currentPrice * a.quantity, 0),

      getTotalInvested: () =>
        get().assets.reduce((sum, a) => sum + a.avgPrice * a.quantity, 0),

      getPnL: () => {
        const value = get().getTotalValue();
        const invested = get().getTotalInvested();
        const amount = value - invested;
        const percentage = invested > 0 ? (amount / invested) * 100 : 0;
        return { amount, percentage };
      },

      getTodayChange: () => {
        const { assets, prices } = get();
        let totalChange = 0;
        let totalPrev = 0;
        assets.forEach((a) => {
          const p = prices[a.symbol];
          if (p) {
            totalChange += p.change * a.quantity;
            totalPrev += (a.currentPrice - p.change) * a.quantity;
          }
        });
        const percentage = totalPrev > 0 ? (totalChange / totalPrev) * 100 : 0;
        return { amount: totalChange, percentage };
      },

      getCategoryBreakdown: () => {
        const breakdown: Record<AssetCategory, number> = {
          'index-fund': 0,
          etf: 0,
          stock: 0,
        };
        get().assets.forEach((a) => {
          breakdown[a.category] += a.currentPrice * a.quantity;
        });
        return breakdown;
      },

      getFilteredAssets: () => {
        const { assets, selectedCategory } = get();
        return selectedCategory ? assets.filter((a) => a.category === selectedCategory) : assets;
      },
    }),
    {
      name: 'wealthos-portfolio',
      partialize: (s) => ({ assets: s.assets }),
    }
  )
);
