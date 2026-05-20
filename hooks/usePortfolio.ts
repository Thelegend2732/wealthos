import { usePortfolioStore } from '../stores/portfolioStore';
import { usePrices } from './usePrices';

export function usePortfolio() {
  const store = usePortfolioStore();
  const pricesQuery = usePrices();

  const totalValue = store.getTotalValue();
  const totalInvested = store.getTotalInvested();
  const pnl = store.getPnL();
  const todayChange = store.getTodayChange();
  const categoryBreakdown = store.getCategoryBreakdown();
  const filteredAssets = store.getFilteredAssets();

  return {
    assets: store.assets,
    filteredAssets,
    prices: store.prices,
    lastUpdated: store.lastUpdated,
    isLoading: store.isLoading || pricesQuery.isLoading,
    isError: pricesQuery.isError,
    totalValue,
    totalInvested,
    pnl,
    todayChange,
    categoryBreakdown,
    selectedCategory: store.selectedCategory,
    setSelectedCategory: store.setSelectedCategory,
    refresh: pricesQuery.refetch,
  };
}
