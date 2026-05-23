import { useQuery } from '@tanstack/react-query';
import { fetchQuotes } from '../services/yahooFinance';
import { usePortfolioStore } from '../stores/portfolioStore';
import type { PriceData } from '../types';

/**
 * Polls Yahoo Finance for every symbol currently in the portfolio. Refreshes
 * every 60 seconds in the background; React Query also re-fetches on window
 * focus, giving a near-live feel without any explicit subscription.
 *
 * Prices are stored in each asset's NATIVE currency. Conversion to EUR is
 * applied at the UI/selector layer via `useEurFx + toEur`.
 */
export function usePrices() {
  const assets = usePortfolioStore((s) => s.assets);
  const updatePrices = usePortfolioStore((s) => s.updatePrices);
  const symbols = assets.map((a) => a.symbol);

  return useQuery({
    queryKey: ['prices', ...symbols],
    queryFn: async () => {
      if (symbols.length === 0) return {};
      const quotes = await fetchQuotes(symbols);

      const priceMap: Record<string, PriceData> = {};
      Object.entries(quotes).forEach(([symbol, q]) => {
        priceMap[symbol] = {
          symbol,
          price: q.price,
          change: q.change,
          changePercent: q.changePercent,
          lastUpdated: q.lastUpdated,
        };
      });
      updatePrices(priceMap);
      return priceMap;
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}
