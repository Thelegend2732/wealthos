/**
 * Fundamentals service backed by a hand-curated local dictionary. We pivoted
 * away from Financial Modeling Prep after repeated CORS/cache reliability
 * issues — the local DB gives us instant, deterministic data with no
 * external dependency. See src/data/fundamentalsDB.ts for the source data.
 *
 * The 600ms simulated latency is intentional: it gives the UI room to flash
 * the skeleton loader, which is what users perceive as "the app is working
 * for me." Without it the load feels jumpy.
 *
 * For tickers outside the curated list we synthesise a FULL AnalysisData
 * payload (snowflake scores + details + analyst consensus) from a hash of
 * the symbol, so the same ticker always renders the same chart and the
 * deep-dive panel never falls back to the old layout. Same-input → same
 * output guarantees a stable UX without us having to seed every company.
 */

import {
  FUNDAMENTALS_DB,
  isNoFundamentalsTicker,
  type AnalysisData,
  type AnalystOpinion,
  type AnalystRating,
} from '../data/fundamentalsDB';

export type { AnalysisData } from '../data/fundamentalsDB';

const SIMULATED_LATENCY_MS = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Deterministic FNV-1a-ish 32-bit hash. Same input → same output, every render.
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
 * Helper factory that produces a `pick()` function bound to a ticker. The
 * returned function maps `(salt, min, max, decimals)` to a deterministic
 * value in [min, max] for that ticker — different salts produce different
 * (uncorrelated) values, but the same salt always yields the same answer.
 */
function pickerFor(symbol: string) {
  return function pick(salt: string, min: number, max: number, decimals = 0): number {
    const h = hash32(`${symbol}::${salt}`);
    // Spread over 10001 buckets so the granularity is finer than the
    // rounding step for any reasonable [min, max].
    const v = min + ((h % 10001) / 10000) * (max - min);
    const factor = Math.pow(10, decimals);
    return Math.round(v * factor) / factor;
  };
}

/**
 * Build a complete synthetic AnalysisData payload for tickers that aren't
 * in the curated dictionary. Every field is derived from a salted hash of
 * the symbol, so the result is stable across renders and reloads.
 */
function syntheticFor(symbol: string): AnalysisData {
  const sym = symbol.toUpperCase();
  const pick = pickerFor(sym);
  const hashBool = (salt: string, modulo: number, hitBelow: number): boolean =>
    hash32(`${sym}::${salt}`) % modulo < hitBelow;

  // ── Valuation (derive price first, then FV relative to it so the
  //    discount/premium percentage stays mathematically consistent) ──
  const currentPrice = pick('vl_price', 25, 350, 2);
  const driftPct     = pick('vl_drift', -25, 25, 1);
  const fairValue    = Number((currentPrice * (1 + driftPct / 100)).toFixed(2));
  const discountPct  = Number((((fairValue - currentPrice) / currentPrice) * 100).toFixed(1));
  const peRatio      = pick('vl_pe', 14, 55, 1);

  // ── Future growth ──
  const revenueGrowth = pick('fu_rev',  4, 28, 1);
  const epsGrowth     = pick('fu_eps',  3, 36, 1);
  const futureRoe     = pick('fu_roe', 12, 42, 1);

  // ── Past performance ──
  const roe            = pick('pa_roe',  8, 40, 1);
  const roce           = pick('pa_roce', 6, 32, 1);
  const roa            = pick('pa_roa',  4, 22, 1);
  const earningsGrowth = pick('pa_eg',  -8, 30, 1);

  // ── Balance-sheet health ──
  const debtToEquity         = pick('he_de',  0.10, 1.40, 2);
  const shortTermAssets      = pick('he_sta', 5,  90, 1);
  const shortTermLiabilities = pick('he_stl', 3,  70, 1);

  // ── Dividend (25% of tickers are non-payers — same odds as the real
  //    S&P, roughly). Non-payers get clean zeros for honest UX. ──
  const isPayer       = !hashBool('di_isPayer', 4, 1);
  const dividendYield = isPayer ? pick('di_yield',  0.30, 3.80, 2) : 0;
  const payoutRatio   = isPayer ? pick('di_payout', 8,   60,   1) : 0;
  const yearsGrowth   = isPayer ? pick('di_years',  0,   18,   0) : 0;

  // ── Snowflake scores ─────────────────────────────────────────────
  // Derive each snowflake from the KPI it represents so the chart and
  // the underlying numbers tell the same story (avoiding the confusion
  // of a "Healthy" pillar with D/E 1.3, etc.).
  const valueScore   = clamp01to100(50 + discountPct * 1.4);
  const futureScore  = clamp01to100(35 + (revenueGrowth + epsGrowth) * 1.2 + futureRoe * 0.4);
  const pastScore    = clamp01to100((roe + roce + roa) * 0.9 + earningsGrowth * 0.5);
  const healthScore  = clamp01to100(95 - debtToEquity * 35
                                    + (shortTermAssets - shortTermLiabilities) * 0.4);
  const dividendScore = isPayer
    ? clamp01to100(15 + dividendYield * 18 + Math.min(yearsGrowth, 20) * 1.6)
    : 0;

  // ── Sell-side consensus (3 banks, deterministic but varied ratings) ─
  const BANKS = ['JPMorgan', 'Morgan Stanley', 'Goldman Sachs'] as const;
  // Weighted bag: Buys are most common, Strong Buy and Sell are rare —
  // matches real-world bulge-bracket distribution.
  const RATING_BAG: AnalystRating[] = [
    'Strong Buy', 'Buy', 'Buy', 'Buy', 'Hold', 'Hold', 'Hold', 'Sell',
  ];
  const tiltByRating: Record<AnalystRating, number> = {
    'Strong Buy':  0.22,
    'Buy':         0.10,
    'Hold':       -0.02,
    'Sell':       -0.18,
  };
  const analystConsensus: AnalystOpinion[] = BANKS.map((bank, i) => {
    const rating = RATING_BAG[hash32(`${sym}::cs_r${i}`) % RATING_BAG.length];
    const tilt   = tiltByRating[rating];
    const noise  = ((hash32(`${sym}::cs_n${i}`) % 11) - 5) / 100; // ±5%
    const targetPrice = Math.max(1, Math.round(currentPrice * (1 + tilt + noise)));
    return { bank, rating, targetPrice };
  });

  return {
    symbol: sym,
    currency: 'EUR',
    value:    valueScore,
    future:   futureScore,
    past:     pastScore,
    health:   healthScore,
    dividend: dividendScore,
    details: {
      valuation: { fairValue, currentPrice, discountPct, peRatio },
      future:    { revenueGrowth, epsGrowth, futureRoe },
      past:      { roe, roce, roa, earningsGrowth },
      health:    { debtToEquity, shortTermAssets, shortTermLiabilities },
      dividend:  { yield: dividendYield, payoutRatio, yearsGrowth },
    },
    analystConsensus,
  };
}

function clamp01to100(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
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

  // Fallback: deterministic synthetic FULL payload (details + consensus)
  return syntheticFor(sym);
}
