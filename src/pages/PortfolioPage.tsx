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
  const totalAssets = usePortfolioStore((s) => s.assets.length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="WealthOS"
        subtitle={lastUpdated ? `Updated ${relativeTime(new Date(lastUpdated))}` : 'Loading prices…'}
        right={
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="icon-btn disabled:opacity-50"
            aria-label="Refresh prices"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
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

      <div className="grid lg:grid-cols-2 gap-6">
        <AllocationChart breakdown={breakdown} totalValue={totalValue} />
        <CategoryBreakdown
          breakdown={breakdown}
          totalValue={totalValue}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between pt-4 pb-3">
          <p className="overline">
            {selectedCategory ? 'Filtered positions' : 'All positions'}
          </p>
          <span className="text-xs text-text-muted tabular">
            {filtered.length} {filtered.length !== totalAssets ? `of ${totalAssets}` : ''}
          </span>
        </div>
        <div className="space-y-2">
          {filtered.map((asset, i) => (
            <AssetCard key={asset.id} asset={asset} price={prices[asset.symbol]} index={i} />
          ))}
          {filtered.length === 0 && totalAssets > 0 && (
            <div className="card p-12 text-center">
              <p className="text-text-muted text-sm">No positions match this filter</p>
            </div>
          )}
          {totalAssets === 0 && (
            <div className="card p-12 text-center">
              <p className="text-text-primary font-medium">No positions yet</p>
              <p className="text-text-muted text-sm mt-1">
                Head to Settings to add your first investment
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
