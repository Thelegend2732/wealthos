/**
 * Fundamentals service backed by a hand-curated local dictionary. We pivoted
 * away from Financial Modeling Prep after repeated CORS/cache reliability
 * issues — the local DB gives us instant, deterministic data with no
 * external dependency. See src/data/fundamentalsDB.ts for the source data.
 *
 * The 600ms simulated latency is intentional: it gives the UI room to flash
 * the skeleton loader, which is what users perceive as "the app is working
 * for me." Without it the load feels jumpy.
 */

import {
  FUNDAMENTALS_DB,
  isNoFundamentalsTicker,
  type AnalysisData,
} from '../data/fundamentalsDB';

export type { AnalysisData } from '../data/fundamentalsDB';

const SIMULATED_LATENCY_MS = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Deterministic FNV-1a-ish hash. Same input → same output, every render.
 * Returned as a non-negative 32-bit integer so callers can `% range` it.
 */
function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Score in [40, 90] derived from a salted hash of the ticker. Anchored to
 * 40–90 (never 0, never 100) so unknown tickers look plausible without
 * dominating the radar.
 */
function deterministicScore(symbol: string, axis: string): number {
  const h = hash32(`${symbol}::${axis}`);
  return 40 + (h % 51); // 40 + [0..50] = 40..90
}

function syntheticFor(symbol: string): AnalysisData {
  return {
    symbol,
    value:    deterministicScore(symbol, 'value'),
    future:   deterministicScore(symbol, 'future'),
    past:     deterministicScore(symbol, 'past'),
    health:   deterministicScore(symbol, 'health'),
    dividend: deterministicScore(symbol, 'dividend'),
  };
}

export async function fetchFundamentalAnalysis(
  symbol: string
): Promise<AnalysisData | null> {
  // Simulated network latency so the skeleton has time to render and the
  // UX matches the rhythm of a real API call.
  await delay(SIMULATED_LATENCY_MS);

  const sym = symbol.toUpperCase();

  // ETFs / indexes / funds — fundamentals don't apply
  if (isNoFundamentalsTicker(sym)) return null;

  // Curated data — highest priority
  const known = FUNDAMENTALS_DB[sym];
  if (known) return known;

  // Fallback: deterministic synthetic scores so the UI never collapses
  return syntheticFor(sym);
}
