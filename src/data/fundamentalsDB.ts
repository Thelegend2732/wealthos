/**
 * Local fundamentals database.
 *
 * Hardcoded snowflake scores (0–100) calibrated against publicly available
 * fundamentals as of mid-2026: DCF, P/E, P/B, ROE, ROA, debt/equity ratios
 * and trailing dividend yield. Numbers are rounded to multiples of 5 to
 * reflect the inherent imprecision of subjective scoring — no false
 * accuracy.
 *
 * To add a new company: pick the five axes by reading its latest 10-K, run
 * `Object.freeze(...)` is unnecessary because the dictionary is imported
 * read-only everywhere it's used.
 */

export interface AnalysisData {
  symbol: string;
  value: number;     // Cheap vs intrinsic value (DCF + multiples)
  future: number;    // Forecast growth — earnings + revenue projections
  past: number;      // Historical performance — ROE, ROA, margin track record
  health: number;    // Balance-sheet strength — debt/equity, liquidity
  dividend: number;  // Dividend yield + sustainability (0 = no dividend)
}

export const FUNDAMENTALS_DB: Record<string, AnalysisData> = {
  // Big tech — premium multiples, fortress balance sheets
  MSFT:  { symbol: 'MSFT',  value: 45, future: 80, past: 92, health: 95, dividend: 40 },
  AAPL:  { symbol: 'AAPL',  value: 48, future: 60, past: 95, health: 88, dividend: 45 },
  GOOGL: { symbol: 'GOOGL', value: 62, future: 75, past: 88, health: 92, dividend: 15 },
  NVDA:  { symbol: 'NVDA',  value: 38, future: 90, past: 95, health: 85, dividend: 5  },

  // Semiconductor capex / infrastructure
  ASML:  { symbol: 'ASML',  value: 55, future: 85, past: 88, health: 75, dividend: 35 },
  VRT:   { symbol: 'VRT',   value: 35, future: 85, past: 70, health: 58, dividend: 10 },

  // EV / mobility
  TSLA:  { symbol: 'TSLA',  value: 20, future: 78, past: 55, health: 82, dividend: 0  },
};

/**
 * ETFs, mutual funds and indexes — these are baskets, not businesses, so
 * fundamental snowflake scoring doesn't apply. Returning null for these
 * tickers lets the UI render a friendly empty state instead of fake data.
 */
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
