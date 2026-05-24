/**
 * Financial Modeling Prep — fundamental analysis fetcher.
 *
 * Pulls /rating and /profile concurrently, then normalises FMP's 1–5 score
 * scale onto our 0–100 snowflake scale. ETFs, indices and mutual funds do
 * not have fundamentals on FMP and will throw `NO_FUNDAMENTALS` so the UI
 * can render an empty-state message instead of bogus zeros.
 *
 * The API key is read from `VITE_FMP_API_KEY`. FMP supports CORS for
 * browser calls — no proxy required.
 */

const FMP_KEY = (import.meta.env.VITE_FMP_API_KEY as string | undefined) || '';

/** Subset of FMP's /v3/rating response. Score fields use a 1–5 scale. */
interface FmpRating {
  symbol: string;
  rating?: string;
  ratingScore?: number;
  ratingRecommendation?: string;
  ratingDetailsDCFScore?: number;
  ratingDetailsROEScore?: number;
  ratingDetailsROAScore?: number;
  ratingDetailsDEScore?: number;
  ratingDetailsPEScore?: number;
  ratingDetailsPBScore?: number;
}

/** Subset of FMP's /v3/profile response — only the fields we actually read. */
interface FmpProfile {
  symbol: string;
  price?: number;
  lastDiv?: number;
  companyName?: string;
  industry?: string;
  currency?: string;
  isEtf?: boolean;
  isFund?: boolean;
  exchangeShortName?: string;
}

export interface FundamentalAnalysis {
  /** 0–100 score for each dimension of the snowflake. */
  value: number;
  future: number;
  past: number;
  health: number;
  dividend: number;
  /** Aggregated rating letter (e.g. "S+", "A-") when available. */
  rating?: string;
  recommendation?: string;
  companyName?: string;
  industry?: string;
}

/** Thrown when FMP returns no rating data — typical for ETFs, indices,
    mutual funds, or freshly IPO'd companies. */
export class NoFundamentalsError extends Error {
  constructor(symbol: string) {
    super(`No fundamentals available for ${symbol}`);
    this.name = 'NoFundamentalsError';
  }
}

async function fetchJSON<T>(url: string, label: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    console.error(`[fmp:${label}] HTTP ${res.status}`);
    throw new Error(`FMP HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** Clamp a 1–5 FMP score onto our 0–100 axis. Treats null/undefined as 0. */
function norm(score: number | undefined): number {
  if (typeof score !== 'number' || !Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round((score / 5) * 100)));
}

/** Average two normalised axes — used when two FMP sub-scores map to a
    single snowflake dimension. */
function avg(a: number, b: number): number {
  return Math.round((a + b) / 2);
}

export async function fetchFundamentalAnalysis(
  symbol: string
): Promise<FundamentalAnalysis> {
  if (!FMP_KEY) {
    throw new Error(
      'FMP API key not configured. Set VITE_FMP_API_KEY in your .env file.'
    );
  }

  const sym = encodeURIComponent(symbol.toUpperCase());
  const ratingUrl = `https://financialmodelingprep.com/api/v3/rating/${sym}?apikey=${FMP_KEY}`;
  const profileUrl = `https://financialmodelingprep.com/api/v3/profile/${sym}?apikey=${FMP_KEY}`;

  let ratingArr: FmpRating[] = [];
  let profileArr: FmpProfile[] = [];
  try {
    [ratingArr, profileArr] = await Promise.all([
      fetchJSON<FmpRating[]>(ratingUrl, `rating:${symbol}`),
      fetchJSON<FmpProfile[]>(profileUrl, `profile:${symbol}`),
    ]);
  } catch (err) {
    console.error(`[fmp] fundamentals fetch failed for ${symbol}`, err);
    throw new NoFundamentalsError(symbol);
  }

  const rating = ratingArr[0];
  const profile = profileArr[0];

  // FMP returns an empty array for ETFs, indices and funds. Surface a
  // typed error so the UI can show the right empty-state message.
  if (!rating || profile?.isEtf || profile?.isFund) {
    throw new NoFundamentalsError(symbol);
  }

  // Snowflake normalisation
  //   Valor     ← DCF score
  //   Futuro    ← average of P/E and P/B (forward-looking multiples)
  //   Pasado    ← average of ROE and ROA (capital efficiency track record)
  //   Salud     ← Debt-to-Equity score
  //   Dividendo ← derived from profile.lastDiv / profile.price (annual yield)
  const value  = norm(rating.ratingDetailsDCFScore);
  const future = avg(norm(rating.ratingDetailsPEScore), norm(rating.ratingDetailsPBScore));
  const past   = avg(norm(rating.ratingDetailsROEScore), norm(rating.ratingDetailsROAScore));
  const health = norm(rating.ratingDetailsDEScore);

  let dividend = 0;
  if (profile?.lastDiv && profile.lastDiv > 0 && profile.price && profile.price > 0) {
    // FMP's lastDiv is the trailing annual dividend per share. Map yield
    // 0–8% onto 0–100 (8%+ is exceptional → max score).
    const yieldPct = (profile.lastDiv / profile.price) * 100;
    dividend = Math.max(0, Math.min(100, Math.round((yieldPct / 8) * 100)));
  }

  return {
    value,
    future,
    past,
    health,
    dividend,
    rating: rating.rating,
    recommendation: rating.ratingRecommendation,
    companyName: profile?.companyName,
    industry: profile?.industry,
  };
}
