import { useQuery } from '@tanstack/react-query';
import { fetchMultiplePrices } from '../services/alphaVantage';
import { usePortfolioStore } from '../stores/portfolioStore';
import { PriceData } from '../types';

export function usePrices() {
  const { assets, updatePrices, setLoading } = usePortfolioStore();
  const symbols = assets.map((a) => a.symbol);

  const query = useQuery({
    queryKey: ['prices', symbols],
    queryFn: async () => {
      setLoading(true);
      try {
        const prices = await fetchMultiplePrices(symbols);
        const normalized: Record<string, PriceData> = {};
        for (const [sym, data] of Object.entries(prices)) {
          normalized[sym] = data;
        }
        updatePrices(normalized);
        return normalized;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 15 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    retry: 2,
  });

  return query;
}
