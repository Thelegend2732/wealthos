import { useQuery } from '@tanstack/react-query';
import { fetchEurRates, type EurRates } from '../services/fxService';

/**
 * Live EUR-base FX rates. Auto-refreshes every 30 minutes in the background.
 * Consumers can read `rates` directly (returns undefined while loading) and
 * pass it to `toEur(...)` for conversion.
 */
export function useEurFx() {
  const q = useQuery<EurRates>({
    queryKey: ['fx', 'eur'],
    queryFn: fetchEurRates,
    staleTime: 30 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
    retry: 1,
  });

  return {
    rates: q.data,
    isLoading: q.isLoading,
    isError: q.isError,
    refresh: q.refetch,
  };
}
