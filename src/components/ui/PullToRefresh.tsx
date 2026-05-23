import { useRef, useState, useEffect } from 'react';

interface Props {
  /** Called when the user releases past the threshold. Should return a
      Promise so the spinner stays visible until the refresh completes. */
  onRefresh: () => Promise<unknown> | unknown;
  /** Distance in px the user must pull before the refresh fires. */
  threshold?: number;
  children: React.ReactNode;
}

/**
 * Native-feeling pull-to-refresh wrapper. Relies on raw touch events so we
 * don't need any external dependency, and only triggers when the inner
 * scroll container is at scrollTop === 0 (so swipes mid-list don't fire it).
 *
 * Designed to wrap a page section that already lives inside Layout's
 * scrollable <main>. The hook listens at the document level for finger
 * deltas — Layout's <main> handles the actual scroll.
 */
export function PullToRefresh({ onRefresh, threshold = 70, children }: Props) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // The scrollable parent is the closest ancestor with overflow-y: auto.
    // Layout's <main> matches this — we walk up to find it.
    let scroller: HTMLElement | null = el.parentElement;
    while (scroller && scroller !== document.body) {
      const style = window.getComputedStyle(scroller);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') break;
      scroller = scroller.parentElement;
    }
    if (!scroller) scroller = document.scrollingElement as HTMLElement | null;
    if (!scroller) return;

    const onTouchStart = (e: TouchEvent) => {
      if (refreshing) return;
      if (scroller!.scrollTop > 0) return;
      startY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (startY.current == null || refreshing) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) {
        setPull(0);
        return;
      }
      // Rubber-band: square-root damping so it slows down past threshold
      const damped = dy <= threshold ? dy : threshold + Math.sqrt(dy - threshold) * 6;
      setPull(damped);
      if (dy > 6) e.preventDefault();
    };

    const onTouchEnd = async () => {
      if (startY.current == null) return;
      startY.current = null;
      if (pull >= threshold && !refreshing) {
        setRefreshing(true);
        setPull(threshold);
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
          setPull(0);
        }
      } else {
        setPull(0);
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [onRefresh, threshold, pull, refreshing]);

  const progress = Math.min(pull / threshold, 1);
  const visible = pull > 4 || refreshing;

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Pull indicator */}
      <div
        style={{
          position: 'absolute',
          top: -50,
          left: 0,
          right: 0,
          height: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateY(${pull}px)`,
          transition: refreshing || pull === 0 ? 'transform 0.25s ease' : 'none',
          opacity: visible ? 1 : 0,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(12px)',
          }}
        >
          <svg
            width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="#10b981" strokeWidth="2.4"
            strokeLinecap="round" strokeLinejoin="round"
            style={{
              transform: refreshing ? 'none' : `rotate(${progress * 270}deg)`,
              animation: refreshing ? 'wos-spin 0.8s linear infinite' : 'none',
              transition: refreshing ? 'none' : 'transform 0.05s linear',
            }}
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </div>
      </div>
      <style>{`
        @keyframes wos-spin { to { transform: rotate(360deg); } }
      `}</style>
      <div
        style={{
          transform: `translateY(${pull * 0.6}px)`,
          transition: refreshing || pull === 0 ? 'transform 0.25s ease' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
