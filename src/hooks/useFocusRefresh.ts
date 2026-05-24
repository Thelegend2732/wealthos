import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Global "tab came back to the foreground" listener. The moment the user
 * brings the WealthOS tab back into focus (or unhides it from a background
 * state), every live data source — prices, FX, news — is invalidated and
 * re-fetched. This is what gives the app a Bloomberg-feel: open the app
 * and the numbers are already updated, no manual refresh required.
 *
 * Listens to BOTH `focus` and `visibilitychange` because mobile browsers
 * (especially Safari) fire one or the other depending on how the user
 * brought the tab forward.
 */
export function useFocusRefresh() {
  const qc = useQueryClient();

  useEffect(() => {
    const invalidateAll = () => {
      // Fire-and-forget — React Query handles dedupe + the rest of the app
      // re-renders automatically when results arrive.
      qc.invalidateQueries({ queryKey: ['prices'] });
      qc.invalidateQueries({ queryKey: ['news'] });
      qc.invalidateQueries({ queryKey: ['fx'] });
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') invalidateAll();
    };

    window.addEventListener('focus', invalidateAll);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', invalidateAll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [qc]);
}
