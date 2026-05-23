/**
 * EUR-base FX rates. Returns "1 EUR = N units of foreign currency", so to
 * convert a foreign amount into EUR you divide:  eur = amount / rates[ccy].
 *
 * Source: open.er-api.com — free, no key, CORS-enabled. We cache for 30 min
 * via React Query; FX rarely moves enough to matter at shorter intervals.
 */

export interface EurRates {
  base: 'EUR';
  rates: Record<string, number>; // e.g. { USD: 1.085, GBP: 0.86, JPY: 169.4 }
  fetchedAt: number;
}

const FALLBACK_RATES: EurRates = {
  base: 'EUR',
  rates: {
    EUR: 1,
    USD: 1.08,
    GBP: 0.86,
    JPY: 168.0,
    CHF: 0.95,
    CAD: 1.47,
    AUD: 1.65,
    HKD: 8.45,
    KRW: 1490,
    CNY: 7.85,
    INR: 90.5,
    SGD: 1.46,
    SEK: 11.4,
    NOK: 11.9,
    DKK: 7.46,
    PLN: 4.32,
    MXN: 21.5,
    BRL: 5.85,
  },
  fetchedAt: 0,
};

export async function fetchEurRates(): Promise<EurRates> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/EUR');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { result?: string; rates?: Record<string, number> };
    if (json.result !== 'success' || !json.rates) throw new Error('FX unavailable');
    // Make sure EUR is present (some endpoints omit the base itself).
    const rates = { ...json.rates, EUR: 1 };
    return { base: 'EUR', rates, fetchedAt: Date.now() };
  } catch {
    return FALLBACK_RATES;
  }
}

/**
 * Convert an amount in `currency` to EUR using the supplied rate table.
 * Returns the original amount unchanged for unknown currencies (safe default
 * — better than zero, which would silently wipe out values on screen).
 */
export function toEur(
  amount: number,
  currency: string,
  rates: EurRates | undefined
): number {
  if (!Number.isFinite(amount)) return 0;
  const ccy = (currency || 'EUR').toUpperCase();
  if (ccy === 'EUR') return amount;
  // GBp = British pence (1/100 of GBP) — Yahoo returns London-listed shares in pence
  if (ccy === 'GBP' || ccy === 'GBX' || ccy === 'GBP_PENCE') {
    const gbp = ccy === 'GBP' ? amount : amount / 100;
    const rate = rates?.rates['GBP'];
    return rate && rate > 0 ? gbp / rate : gbp;
  }
  const rate = rates?.rates[ccy];
  if (!rate || rate <= 0) return amount;
  return amount / rate;
}
