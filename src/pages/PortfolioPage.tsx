import { usePrices } from '../hooks/usePrices';
import { usePortfolioStore } from '../stores/portfolioStore';
import { PageHeader } from '../components/ui/PageHeader';
import { PortfolioSummary } from '../components/portfolio/PortfolioSummary';
import { AllocationChart } from '../components/portfolio/AllocationChart';
import { CategoryBreakdown } from '../components/portfolio/CategoryBreakdown';
import { AssetCard } from '../components/portfolio/AssetCard';
import { relativeTime } from '../constants/theme';

export function PortfolioPage() {
  const { isLoading, refetch, isFetching } = usePrices();
  const totalValue = usePortfolioStore((s) => s.getTotalValue());
  const totalInvested = usePortfolioStore((s) => s.getTotalInvested());
  const pnl = usePortfolioStore((s) => s.getPnL());
  const todayChange = usePortfolioStore((s) => s.getTodayChange());
  const breakdown = usePortfolioStore((s) => s.getCategoryBreakdown());
  const filtered = usePortfolioStore((s) => s.getFilteredAssets());
  const selectedCategory = usePortfolioStore((s) => s.selectedCategory);
  const setSelectedCategory = usePortfolioStore((s) => s.setSelectedCategory);
  const prices = usePortfolioStore((s) => s.prices);
  const lastUpdated = usePortfolioStore((s) => s.lastUpdated);

  return (
    <div className="space-y-5">
      <PageHeader
        title="WealthOS"
        subtitle={lastUpdated ? `Updated ${relativeTime(new Date(lastUpdated))}` : 'Loading prices…'}
        right={
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="w-10 h-10 rounded-full bg-primary/15 hover:bg-primary/25 text-primary flex items-center justify-center transition-all disabled:opacity-50"
            aria-label="Refresh prices"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isFetching ? 'animate-spin' : ''}
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        }
      />

      <PortfolioSummary
        totalValue={totalValue}
        totalInvested={totalInvested}
        pnl={pnl}
        todayChange={todayChange}
        isLoading={isLoading}
      />

      <div className="grid lg:grid-cols-2 gap-5">
        <AllocationChart breakdown={breakdown} totalValue={totalValue} />
        <CategoryBreakdown
          breakdown={breakdown}
          totalValue={totalValue}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      <div className="pt-2">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-xs uppercase tracking-[0.15em] text-text-secondary font-semibold">
            {selectedCategory ? `${filtered.length} filtered position${filtered.length !== 1 ? 's' : ''}` : 'All Positions'}
          </h2>
          <span className="text-xs text-text-muted">{filtered.length} of {usePortfolioStore.getState().assets.length}</span>
        </div>
        <div className="grid gap-3">
          {filtered.map((asset, i) => (
            <AssetCard key={asset.id} asset={asset} price={prices[asset.symbol]} index={i} />
          ))}
          {filtered.length === 0 && (
            <div className="card p-12 text-center">
              <p className="text-text-muted">No positions match this filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
