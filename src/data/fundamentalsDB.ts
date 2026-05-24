/**
 * Local fundamentals database — deep-dive edition.
 *
 * Each entry carries:
 *   • Five snowflake scores (0-100) used by the radar.
 *   • A `details` payload with the raw KPIs that justify each score so the
 *     UI can render a quantitative breakdown per pillar.
 *   • An `analystConsensus` array with mainstream Wall Street ratings and
 *     price targets, calibrated against bulge-bracket sell-side notes from
 *     mid-2026.
 *
 * All monetary fields are denominated in EUR — WealthOS enforces a single
 * currency across the whole product. Values were converted from the native
 * USD reporting using the mid-2026 EUR/USD ≈ 1.075 spot rate and rounded
 * sensibly. Balance-sheet billions are kept consistent with the price
 * conversion so cross-pillar math reconciles.
 */

export interface ValuationDetails {
  /** DCF / multiples-derived intrinsic value per share. */
  fairValue: number;
  /** Latest market quote per share. */
  currentPrice: number;
  /** Positive = undervalued (price below FV), negative = overvalued. */
  discountPct: number;
  /** Trailing twelve-month P/E. */
  peRatio: number;
}

export interface FutureDetails {
  /** Forward 3-year compound annual revenue growth, %. */
  revenueGrowth: number;
  /** Forward 3-year EPS growth, %. */
  epsGrowth: number;
  /** Forecast return on equity at year +3, %. */
  futureRoe: number;
}

export interface PastDetails {
  /** Trailing return on equity, %. */
  roe: number;
  /** Return on capital employed, %. */
  roce: number;
  /** Return on assets, %. */
  roa: number;
  /** Trailing 5-year earnings CAGR, %. */
  earningsGrowth: number;
}

export interface HealthDetails {
  /** Debt-to-equity ratio (raw multiple, not %). */
  debtToEquity: number;
  /** Short-term assets in billions of the listing currency. */
  shortTermAssets: number;
  /** Short-term liabilities in billions of the listing currency. */
  shortTermLiabilities: number;
}

export interface DividendDetails {
  /** Trailing 12-month dividend yield, %. */
  yield: number;
  /** Earnings payout ratio, %. */
  payoutRatio: number;
  /** Consecutive years of dividend growth. */
  yearsGrowth: number;
}

export interface Details {
  valuation: ValuationDetails;
  future: FutureDetails;
  past: PastDetails;
  health: HealthDetails;
  dividend: DividendDetails;
}

export type AnalystRating = 'Strong Buy' | 'Buy' | 'Hold' | 'Sell';

export interface AnalystOpinion {
  bank: string;
  rating: AnalystRating;
  targetPrice: number;
}

export interface AnalysisData {
  symbol: string;
  /** Listing currency for monetary fields ("USD", "EUR"...). Defaults to USD. */
  currency?: string;
  // ── Snowflake axes (0-100) ─────────────────────────────────────
  value: number;
  future: number;
  past: number;
  health: number;
  dividend: number;
  // ── Raw KPIs and sell-side consensus ───────────────────────────
  details?: Details;
  analystConsensus?: AnalystOpinion[];
}

export const FUNDAMENTALS_DB: Record<string, AnalysisData> = {
  /* ─────────────────────────── MSFT ──────────────────────────── */
  MSFT: {
    symbol: 'MSFT',
    currency: 'EUR',
    value: 45, future: 80, past: 92, health: 95, dividend: 40,
    details: {
      valuation: { fairValue: 484.00, currentPrice: 432.65, discountPct: 11.9, peRatio: 36.4 },
      future:    { revenueGrowth: 14.2, epsGrowth: 16.1, futureRoe: 32.0 },
      past:      { roe: 38.4, roce: 28.1, roa: 18.2, earningsGrowth: 18.0 },
      health:    { debtToEquity: 0.32, shortTermAssets: 171.3, shortTermLiabilities: 101.1 },
      dividend:  { yield: 0.72, payoutRatio: 24.5, yearsGrowth: 22 },
    },
    analystConsensus: [
      { bank: 'Goldman Sachs',  rating: 'Strong Buy', targetPrice: 512 },
      { bank: 'Morgan Stanley', rating: 'Buy',        targetPrice: 493 },
      { bank: 'JPMorgan',       rating: 'Buy',        targetPrice: 484 },
      { bank: 'Wells Fargo',    rating: 'Hold',       targetPrice: 437 },
    ],
  },

  /* ─────────────────────────── AAPL ──────────────────────────── */
  AAPL: {
    symbol: 'AAPL',
    currency: 'EUR',
    value: 48, future: 60, past: 95, health: 88, dividend: 45,
    details: {
      valuation: { fairValue: 204.60, currentPrice: 223.30, discountPct: -8.4, peRatio: 31.2 },
      future:    { revenueGrowth: 6.4, epsGrowth: 9.1, futureRoe: 145.0 },
      past:      { roe: 160.0, roce: 50.1, roa: 28.4, earningsGrowth: 8.2 },
      health:    { debtToEquity: 1.45, shortTermAssets: 132.1, shortTermLiabilities: 128.3 },
      dividend:  { yield: 0.45, payoutRatio: 15.4, yearsGrowth: 13 },
    },
    analystConsensus: [
      { bank: 'Morgan Stanley', rating: 'Buy',  targetPrice: 251 },
      { bank: 'JPMorgan',       rating: 'Buy',  targetPrice: 237 },
      { bank: 'Goldman Sachs',  rating: 'Hold', targetPrice: 214 },
      { bank: 'Bernstein',      rating: 'Hold', targetPrice: 205 },
    ],
  },

  /* ─────────────────────────── GOOGL ─────────────────────────── */
  GOOGL: {
    symbol: 'GOOGL',
    currency: 'EUR',
    value: 62, future: 75, past: 88, health: 92, dividend: 15,
    details: {
      valuation: { fairValue: 195.30, currentPrice: 176.98, discountPct: 10.4, peRatio: 24.1 },
      future:    { revenueGrowth: 12.3, epsGrowth: 16.5, futureRoe: 28.0 },
      past:      { roe: 30.4, roce: 24.2, roa: 18.0, earningsGrowth: 22.1 },
      health:    { debtToEquity: 0.10, shortTermAssets: 151.1, shortTermLiabilities: 75.5 },
      dividend:  { yield: 0.42, payoutRatio: 11.0, yearsGrowth: 1 },
    },
    analystConsensus: [
      { bank: 'JPMorgan',        rating: 'Strong Buy', targetPrice: 205 },
      { bank: 'Morgan Stanley',  rating: 'Buy',        targetPrice: 200 },
      { bank: 'Citi',            rating: 'Buy',        targetPrice: 191 },
      { bank: 'Bank of America', rating: 'Hold',       targetPrice: 181 },
    ],
  },

  /* ─────────────────────────── NVDA ──────────────────────────── */
  NVDA: {
    symbol: 'NVDA',
    currency: 'EUR',
    value: 38, future: 90, past: 95, health: 85, dividend: 5,
    details: {
      valuation: { fairValue: 120.90, currentPrice: 140.24, discountPct: -13.8, peRatio: 55.2 },
      future:    { revenueGrowth: 30.5, epsGrowth: 42.1, futureRoe: 95.0 },
      past:      { roe: 120.0, roce: 80.0, roa: 60.4, earningsGrowth: 220.5 },
      health:    { debtToEquity: 0.20, shortTermAssets: 55.9, shortTermLiabilities: 20.8 },
      dividend:  { yield: 0.03, payoutRatio: 1.5, yearsGrowth: 8 },
    },
    analystConsensus: [
      { bank: 'Wells Fargo',    rating: 'Strong Buy', targetPrice: 186 },
      { bank: 'Morgan Stanley', rating: 'Buy',        targetPrice: 167 },
      { bank: 'Goldman Sachs',  rating: 'Buy',        targetPrice: 163 },
      { bank: 'Bernstein',      rating: 'Hold',       targetPrice: 135 },
    ],
  },

  /* ─────────────────────────── ASML ──────────────────────────── */
  ASML: {
    symbol: 'ASML',
    currency: 'EUR',
    value: 55, future: 85, past: 88, health: 75, dividend: 35,
    details: {
      valuation: { fairValue: 976.50, currentPrice: 846.67, discountPct: 15.3, peRatio: 38.1 },
      future:    { revenueGrowth: 20.5, epsGrowth: 28.4, futureRoe: 60.0 },
      past:      { roe: 70.2, roce: 50.4, roa: 22.0, earningsGrowth: 25.0 },
      health:    { debtToEquity: 0.45, shortTermAssets: 17.1, shortTermLiabilities: 11.9 },
      dividend:  { yield: 1.00, payoutRatio: 35.0, yearsGrowth: 12 },
    },
    analystConsensus: [
      { bank: 'UBS',             rating: 'Strong Buy', targetPrice: 1070 },
      { bank: 'Morgan Stanley',  rating: 'Buy',        targetPrice: 1004 },
      { bank: 'Goldman Sachs',   rating: 'Buy',        targetPrice: 949  },
      { bank: 'Bank of America', rating: 'Hold',       targetPrice: 883  },
    ],
  },

  /* ─────────────────────────── VRT ───────────────────────────── */
  VRT: {
    symbol: 'VRT',
    currency: 'EUR',
    value: 35, future: 85, past: 70, health: 58, dividend: 10,
    details: {
      valuation: { fairValue: 88.35, currentPrice: 102.49, discountPct: -13.8, peRatio: 42.5 },
      future:    { revenueGrowth: 18.5, epsGrowth: 28.0, futureRoe: 35.0 },
      past:      { roe: 28.1, roce: 22.3, roa: 12.0, earningsGrowth: 50.4 },
      health:    { debtToEquity: 0.65, shortTermAssets: 3.2, shortTermLiabilities: 2.4 },
      dividend:  { yield: 0.10, payoutRatio: 4.0, yearsGrowth: 3 },
    },
    analystConsensus: [
      { bank: 'JPMorgan',        rating: 'Buy',  targetPrice: 121 },
      { bank: 'Citi',            rating: 'Buy',  targetPrice: 112 },
      { bank: 'Bank of America', rating: 'Hold', targetPrice: 98  },
      { bank: 'Wells Fargo',     rating: 'Sell', targetPrice: 84  },
    ],
  },

  /* ─────────────────────────── TSLA ──────────────────────────── */
  TSLA: {
    symbol: 'TSLA',
    currency: 'EUR',
    value: 20, future: 78, past: 55, health: 82, dividend: 0,
    details: {
      valuation: { fairValue: 181.35, currentPrice: 242.27, discountPct: -25.1, peRatio: 78.1 },
      future:    { revenueGrowth: 18.0, epsGrowth: 35.0, futureRoe: 22.0 },
      past:      { roe: 14.2, roce: 11.0, roa: 8.4, earningsGrowth: -25.4 },
      health:    { debtToEquity: 0.18, shortTermAssets: 30.2, shortTermLiabilities: 26.1 },
      dividend:  { yield: 0, payoutRatio: 0, yearsGrowth: 0 },
    },
    analystConsensus: [
      { bank: 'Wedbush',        rating: 'Strong Buy', targetPrice: 372 },
      { bank: 'Morgan Stanley', rating: 'Buy',        targetPrice: 298 },
      { bank: 'Goldman Sachs',  rating: 'Hold',       targetPrice: 228 },
      { bank: 'JPMorgan',       rating: 'Sell',       targetPrice: 163 },
    ],
  },
};

export const NO_FUNDAMENTALS_TICKERS: ReadonlySet<string> = new Set([
  // US S&P 500 trackers
  'SPY', 'VOO', 'IVV',
  // Nasdaq trackers
  'QQQ', 'QQQM',
  // Total market / world
  'VTI', 'VT', 'VWRL', 'VWCE',
  // EU UCITS S&P / world variants
  'CSSPX', 'SXR8', 'IUSA', 'IWDA', 'EUNL',
  // Thematic / sector ETFs
  'SOXX', 'SMH', 'XLK', 'ARKK',
]);

export function isNoFundamentalsTicker(symbol: string): boolean {
  return NO_FUNDAMENTALS_TICKERS.has(symbol.toUpperCase());
}
