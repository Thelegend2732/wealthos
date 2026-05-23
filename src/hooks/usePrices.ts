import { useQuery } from '@tanstack/react-query';
import { fetchMultiplePrices } from '../services/alphaVantage';
import { usePortfolioStore } from '../stores/portfolioStore';

export function usePrices() {
  const assets = usePortfolioStore((s) => s.assets);
  const updatePrices = usePortfolioStore((s) => s.updatePrices);
  const symbols = assets.map((a) => a.symbol);

  return useQuery({
    queryKey: ['prices', ...symbols],
    queryFn: async () => {
      const prices = await fetchMultiplePrices(symbols);
      updatePrices(prices);
      return prices;
    },
    staleTime: 15 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    retry: 1,
  });
}
