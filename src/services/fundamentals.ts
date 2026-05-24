const API_KEY = import.meta.env.VITE_FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/api/v3';

export interface AnalysisData {
  symbol: string;
  value: number;
  future: number;
  past: number;
  health: number;
  dividend: number;
}

export async function fetchFundamentalAnalysis(symbol: string): Promise<AnalysisData | null> {
  if (!API_KEY) {
    throw new Error("FMP API key not configured. Set VITE_FMP_API_KEY in your .env.local file.");
  }

  try {
    const [ratingRes, profileRes] = await Promise.all([
      fetch(`${BASE_URL}/rating/${symbol}?apikey=${API_KEY}`),
      fetch(`${BASE_URL}/profile/${symbol}?apikey=${API_KEY}`)
    ]);

    if (!ratingRes.ok || !profileRes.ok) return null;

    const ratingData = await ratingRes.json();
    const profileData = await profileRes.json();

    if (!ratingData || ratingData.length === 0) return null;

    const rating = ratingData[0];
    const profile = profileData && profileData.length > 0 ? profileData[0] : null;

    // Función matemática para convertir la nota de FMP (1 a 5) a un porcentaje (0 a 100)
    const norm = (score: number) => Math.min(Math.max((score / 5) * 100, 0), 100);
    const avg = (...scores: number[]) => {
      const valid = scores.filter(s => !isNaN(s) && s > 0);
      return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
    };

    // Mapeo de los 5 ejes del copo de nieve
    const value = norm(rating.ratingDetailsDCFScore || 0);
    const future = avg(norm(rating.ratingDetailsPEScore || 0), norm(rating.ratingDetailsPBScore || 0));
    const past = avg(norm(rating.ratingDetailsROEScore || 0), norm(rating.ratingDetailsROAScore || 0));
    const health = norm(rating.ratingDetailsDEScore || 0);

    // Si la empresa reparte dividendos, calculamos su fuerza. Si no, 0.
    let dividend = 0;
    if (profile && profile.lastDiv > 0 && profile.price > 0) {
      const divYield = (profile.lastDiv / profile.price) * 100;
      dividend = Math.min((divYield / 5) * 100, 100); // 5% de yield = 100 puntos
    }

    // Devolvemos el objeto. Si un valor es 0, le damos 10 puntos de suelo para que el gráfico no colapse visualmente.
    return {
      symbol,
      value: value || 10,
      future: future || 10,
      past: past || 10,
      health: health || 10,
      dividend: dividend
    };

  } catch (err) {
    console.error("[Fundamentals] Error al obtener datos de FMP:", err);
    return null;
  }
}