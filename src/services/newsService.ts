import type { NewsItem } from '../types';

const NEWS_KEY = (import.meta.env.VITE_NEWS_API_KEY as string) || '';
const CACHE_PREFIX = 'wealthos:news:';
const CACHE_TTL = 60 * 60 * 1000;
const READ_KEY = 'wealthos:news-read';

const QUERIES: Record<NewsItem['category'], string> = {
  finance: 'NVDA OR ASML OR VOO OR semiconductor stocks',
  tech: 'semiconductor AI chips NVIDIA ASML Taiwan',
  lifestyle: 'luxury watches mechanical horology Rolex Patek',
};

function getReadSet(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function markRead(id: string) {
  const set = getReadSet();
  set.add(id);
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

function mockNews(category: NewsItem['category']): NewsItem[] {
  const base: { title: string; description: string; source: string; img?: string }[] =
    category === 'finance'
      ? [
          { title: 'NVIDIA Surges 5% on Record Data Center Earnings', description: 'NVIDIA Corporation posted record quarterly revenue driven by surging demand for H200 and Blackwell AI accelerators from hyperscale cloud providers.', source: 'Bloomberg', img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80' },
          { title: 'S&P 500 Closes at All-Time High Above 6,000', description: 'US equity benchmark crossed the 6,000 threshold for the first time as investors priced in continued Fed rate cuts and resilient corporate earnings.', source: 'Reuters', img: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80' },
          { title: 'VOO ETF Sees $4.2B Weekly Inflows — Record Pace', description: 'Vanguard S&P 500 ETF recorded its largest weekly net inflow ever, signaling strong retail and institutional confidence in passive index strategies.', source: 'WSJ', img: 'https://images.unsplash.com/photo-1554260570-e9689a3418b8?w=800&q=80' },
          { title: 'ASML Reports Backlog Hits €40B on EUV Demand', description: 'Dutch chip-equipment maker ASML disclosed a record order book for its extreme ultraviolet lithography systems as TSMC and Samsung accelerate capacity buildouts.', source: 'Financial Times', img: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&q=80' },
          { title: 'Semiconductor Index Up 38% YTD', description: 'The PHLX Semiconductor Index outpaces every major sector benchmark this year, led by AI-exposed names like NVIDIA, Broadcom and Marvell.', source: 'CNBC', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80' },
        ]
      : category === 'tech'
      ? [
          { title: 'TSMC Begins Mass Production of 2nm Chips', description: 'Taiwan Semiconductor Manufacturing Company officially started high-volume manufacturing of its N2 process node at the Hsinchu Fab 20 facility.', source: 'AnandTech', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80' },
          { title: 'AMD Unveils MI400 — Targets NVIDIA Blackwell', description: 'AMD revealed its next-generation Instinct MI400 GPU, claiming 1.4x performance per watt over the Blackwell B200 in MLPerf training benchmarks.', source: 'The Verge', img: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80' },
          { title: 'Intel 18A Yields Hit 70% — On Track for 2026 Launch', description: 'Intel reported that its 18A process node has reached commercial-grade defect density, with Panther Lake and Clearwater Forest set for late 2025 ramp.', source: 'Tom\'s Hardware', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80' },
          { title: 'ASML High-NA EUV Ships to TSMC and Intel', description: 'ASML\'s next-generation High-NA EUV lithography systems, priced at $380M each, are now operational at TSMC R&D and Intel Oregon facilities.', source: 'IEEE Spectrum', img: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&q=80' },
          { title: 'AI Inference Costs Drop 95% in 18 Months', description: 'Industry analysts report that the cost to serve a billion tokens via leading AI models has collapsed from $30 to under $1.50 since early 2024.', source: 'Stratechery', img: 'https://images.unsplash.com/photo-1488229297570-58520851e868?w=800&q=80' },
        ]
      : [
          { title: 'Rolex Daytona "Paul Newman" Sets $19.2M Auction Record', description: 'A rare 1968 Rolex Daytona reference 6263 owned by actor Paul Newman shattered horological auction records at Phillips Geneva.', source: 'Hodinkee', img: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800&q=80' },
          { title: 'Patek Philippe Releases Limited Calatrava 6119G', description: 'The Geneva manufacture unveiled a 200-piece limited edition Calatrava with a hand-engraved guilloché dial and the new caliber 30-255 PS movement.', source: 'WatchTime', img: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80' },
          { title: 'The 2025 Guide to Investment-Grade Timepieces', description: 'Which watches actually appreciate? A data-driven analysis of secondary market trends for Rolex Sports, Patek Nautilus and AP Royal Oak references.', source: 'Bloomberg Pursuits', img: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80' },
          { title: 'A. Lange & Söhne Lange 1 Turns 30', description: 'The asymmetric dial that redefined German watchmaking celebrates its 30th anniversary with a platinum honey-gold limited edition.', source: 'Revolution', img: 'https://images.unsplash.com/photo-1509048191080-d2e2678e67b6?w=800&q=80' },
          { title: 'Vintage Submariners Outpace Modern Releases', description: 'Pre-1980 Rolex Submariner 5513 references have appreciated 142% over five years, outperforming most current production models.', source: 'Phillips Watches', img: 'https://images.unsplash.com/photo-1495856458515-0637185db551?w=800&q=80' },
        ];

  const readSet = getReadSet();
  return base.map((item, i) => ({
    id: `${category}-${i}`,
    title: item.title,
    description: item.description,
    url: '#',
    imageUrl: item.img,
    source: item.source,
    publishedAt: new Date(Date.now() - (i + 1) * 3 * 60 * 60 * 1000),
    category,
    isRead: readSet.has(`${category}-${i}`),
  }));
}

interface CachedNews {
  items: Array<Omit<NewsItem, 'isRead'>>;
  timestamp: number;
}

async function fetchFromAPI(category: NewsItem['category']): Promise<NewsItem[]> {
  if (!NEWS_KEY || NEWS_KEY === 'your_key_here') return mockNews(category);

  const q = encodeURIComponent(QUERIES[category]);
  const url = `https://newsapi.org/v2/everything?q=${q}&sortBy=publishedAt&pageSize=20&language=en&apiKey=${NEWS_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NewsAPI ${res.status}`);
    const json = await res.json();
    if (json.status !== 'ok') throw new Error(json.message ?? 'API error');

    const readSet = getReadSet();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = (json.articles as any[]).map((a, i) => ({
      id: `${category}-api-${i}-${Date.now()}`,
      title: a.title ?? 'Untitled',
      description: a.description ?? '',
      url: a.url ?? '#',
      imageUrl: a.urlToImage ?? undefined,
      source: a.source?.name ?? 'Unknown',
      publishedAt: new Date(a.publishedAt),
      category,
    }));
    try {
      localStorage.setItem(
        `${CACHE_PREFIX}${category}`,
        JSON.stringify({ items, timestamp: Date.now() } satisfies CachedNews)
      );
    } catch {
      /* ignore */
    }
    return items.map((i) => ({ ...i, isRead: readSet.has(i.id) }));
  } catch {
    return mockNews(category);
  }
}

export async function fetchNews(category: NewsItem['category']): Promise<NewsItem[]> {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${category}`);
    if (raw) {
      const cached: CachedNews = JSON.parse(raw);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        const readSet = getReadSet();
        return cached.items.map((i) => ({
          ...i,
          publishedAt: new Date(i.publishedAt),
          isRead: readSet.has(i.id),
        }));
      }
    }
  } catch {
    /* ignore */
  }
  return fetchFromAPI(category);
}
