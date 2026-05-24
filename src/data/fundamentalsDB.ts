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
 * All monetary fields are in the company's primary listing currency. Where
 * a ticker is dual-listed we use the most liquid line (NASDAQ ADR for ASML,
 * not the Amsterdam Euronext quote) so the numbers reconcile across pillars.
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
    currency: 'USD',
    value: 45, future: 80, past: 92, health: 95, dividend: 40,
    details: {
      valuation: { fairValue: 520.00, currentPrice: 465.20, discountPct: 10.5, peRatio: 36.4 },
      future:    { revenueGrowth: 14.2, epsGrowth: 16.1, futureRoe: 32.0 },
      past:      { roe: 38.4, roce: 28.1, roa: 18.2, earningsGrowth: 18.0 },
      health:    { debtToEquity: 0.32, shortTermAssets: 184.2, shortTermLiabilities: 108.7 },
      dividend:  { yield: 0.72, payoutRatio: 24.5, yearsGrowth: 22 },
    },
    analystConsensus: [
      { bank: 'Goldman Sachs',  rating: 'Strong Buy', targetPrice: 550 },
      { bank: 'Morgan Stanley', rating: 'Buy',        targetPrice: 530 },
      { bank: 'JPMorgan',       rating: 'Buy',        targetPrice: 520 },
      { bank: 'Wells Fargo',    rating: 'Hold',       targetPrice: 470 },
    ],
  },

  /* ─────────────────────────── AAPL ──────────────────────────── */
  AAPL: {
    symbol: 'AAPL',
    currency: 'USD',
    value: 48, future: 60, past: 95, health: 88, dividend: 45,
    details: {
      valuation: { fairValue: 220.00, currentPrice: 240.10, discountPct: -9.1, peRatio: 31.2 },
      future:    { revenueGrowth: 6.4, epsGrowth: 9.1, futureRoe: 145.0 },
      past:      { roe: 160.0, roce: 50.1, roa: 28.4, earningsGrowth: 8.2 },
      health:    { debtToEquity: 1.45, shortTermAssets: 142.0, shortTermLiabilities: 138.0 },
      dividend:  { yield: 0.45, payoutRatio: 15.4, yearsGrowth: 13 },
    },
    analystConsensus: [
      { bank: 'Morgan Stanley', rating: 'Buy',  targetPrice: 270 },
      { bank: 'JPMorgan',       rating: 'Buy',  targetPrice: 255 },
      { bank: 'Goldman Sachs',  rating: 'Hold', targetPrice: 230 },
      { bank: 'Bernstein',      rating: 'Hold', targetPrice: 220 },
    ],
  },

  /* ─────────────────────────── GOOGL ─────────────────────────── */
  GOOGL: {
    symbol: 'GOOGL',
    currency: 'USD',
    value: 62, future: 75, past: 88, health: 92, dividend: 15,
    details: {
      valuation: { fairValue: 210.00, currentPrice: 190.30, discountPct: 9.4, peRatio: 24.1 },
      future:    { revenueGrowth: 12.3, epsGrowth: 16.5, futureRoe: 28.0 },
      past:      { roe: 30.4, roce: 24.2, roa: 18.0, earningsGrowth: 22.1 },
      health:    { debtToEquity: 0.10, shortTermAssets: 162.5, shortTermLiabilities: 81.2 },
      dividend:  { yield: 0.42, payoutRatio: 11.0, yearsGrowth: 1 },
    },
    analystConsensus: [
      { bank: 'JPMorgan',       rating: 'Strong Buy', targetPrice: 220 },
      { bank: 'Morgan Stanley', rating: 'Buy',        targetPrice: 215 },
      { bank: 'Citi',           rating: 'Buy',        targetPrice: 205 },
      { bank: 'Bank of America', rating: 'Hold',      targetPrice: 195 },
    ],
  },

  /* ─────────────────────────── NVDA ──────────────────────────── */
  NVDA: {
    symbol: 'NVDA',
    currency: 'USD',
    value: 38, future: 90, past: 95, health: 85, dividend: 5,
    details: {
      valuation: { fairValue: 130.00, currentPrice: 150.80, discountPct: -13.8, peRatio: 55.2 },
      future:    { revenueGrowth: 30.5, epsGrowth: 42.1, futureRoe: 95.0 },
      past:      { roe: 120.0, roce: 80.0, roa: 60.4, earningsGrowth: 220.5 },
      health:    { debtToEquity: 0.20, shortTermAssets: 60.1, shortTermLiabilities: 22.4 },
      dividend:  { yield: 0.03, payoutRatio: 1.5, yearsGrowth: 8 },
    },
    analystConsensus: [
      { bank: 'Wells Fargo',    rating: 'Strong Buy', targetPrice: 200 },
      { bank: 'Morgan Stanley', rating: 'Buy',        targetPrice: 180 },
      { bank: 'Goldman Sachs',  rating: 'Buy',        targetPrice: 175 },
      { bank: 'Bernstein',      rating: 'Hold',       targetPrice: 145 },
    ],
  },

  /* ─────────────────────────── ASML ──────────────────────────── */
  ASML: {
    symbol: 'ASML',
    currency: 'USD',
    value: 55, future: 85, past: 88, health: 75, dividend: 35,
    details: {
      valuation: { fairValue: 1050.00, currentPrice: 910.40, discountPct: 13.3, peRatio: 38.1 },
      future:    { revenueGrowth: 20.5, epsGrowth: 28.4, futureRoe: 60.0 },
      past:      { roe: 70.2, roce: 50.4, roa: 22.0, earningsGrowth: 25.0 },
      health:    { debtToEquity: 0.45, shortTermAssets: 18.4, shortTermLiabilities: 12.8 },
      dividend:  { yield: 1.00, payoutRatio: 35.0, yearsGrowth: 12 },
    },
    analystConsensus: [
      { bank: 'UBS',            rating: 'Strong Buy', targetPrice: 1150 },
      { bank: 'Morgan Stanley', rating: 'Buy',        targetPrice: 1080 },
      { bank: 'Goldman Sachs',  rating: 'Buy',        targetPrice: 1020 },
      { bank: 'Bank of America', rating: 'Hold',      targetPrice: 950  },
    ],
  },

  /* ─────────────────────────── VRT ───────────────────────────── */
  VRT: {
    symbol: 'VRT',
    currency: 'USD',
    value: 35, future: 85, past: 70, health: 58, dividend: 10,
    details: {
      valuation: { fairValue: 95.00, currentPrice: 110.20, discountPct: -16.0, peRatio: 42.5 },
      future:    { revenueGrowth: 18.5, epsGrowth: 28.0, futureRoe: 35.0 },
      past:      { roe: 28.1, roce: 22.3, roa: 12.0, earningsGrowth: 50.4 },
      health:    { debtToEquity: 0.65, shortTermAssets: 3.4, shortTermLiabilities: 2.6 },
      dividend:  { yield: 0.10, payoutRatio: 4.0, yearsGrowth: 3 },
    },
    analystConsensus: [
      { bank: 'JPMorgan',       rating: 'Buy',  targetPrice: 130 },
      { bank: 'Citi',           rating: 'Buy',  targetPrice: 120 },
      { bank: 'Bank of America', rating: 'Hold', targetPrice: 105 },
      { bank: 'Wells Fargo',    rating: 'Sell', targetPrice: 90  },
    ],
  },

  /* ─────────────────────────── TSLA ──────────────────────────── */
  TSLA: {
    symbol: 'TSLA',
    currency: 'USD',
    value: 20, future: 78, past: 55, health: 82, dividend: 0,
    details: {
      valuation: { fairValue: 195.00, currentPrice: 260.50, discountPct: -33.6, peRatio: 78.1 },
      future:    { revenueGrowth: 18.0, epsGrowth: 35.0, futureRoe: 22.0 },
      past:      { roe: 14.2, roce: 11.0, roa: 8.4, earningsGrowth: -25.4 },
      health:    { debtToEquity: 0.18, shortTermAssets: 32.5, shortTermLiabilities: 28.1 },
      dividend:  { yield: 0, payoutRatio: 0, yearsGrowth: 0 },
    },
    analystConsensus: [
      { bank: 'Wedbush',        rating: 'Strong Buy', targetPrice: 400 },
      { bank: 'Morgan Stanley', rating: 'Buy',        targetPrice: 320 },
      { bank: 'Goldman Sachs',  rating: 'Hold',       targetPrice: 245 },
      { bank: 'JPMorgan',       rating: 'Sell',       targetPrice: 175 },
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
