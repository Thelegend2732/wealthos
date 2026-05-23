import { formatCurrency, formatPercent } from '../../constants/theme';

interface Props {
  totalValue: number;
  totalInvested: number;
  pnl: { amount: number; percentage: number };
  todayChange: { amount: number; percentage: number };
  isLoading: boolean;
}

export function PortfolioSummary({
  totalValue,
  totalInvested,
  pnl,
  todayChange,
  isLoading,
}: Props) {
  const pnlPos = pnl.amount >= 0;
  const todayPos = todayChange.amount >= 0;

  return (
    <section className="card relative overflow-hidden p-6 sm:p-8 animate-slide-up">
      {/* Decorative gradient */}
      <div
        className="absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #6C63FF 0%, transparent 70%)',
        }}
      />

      <div className="relative">
        <p className="text-xs uppercase tracking-[0.15em] text-text-secondary font-semibold">
          Total Portfolio Value
        </p>
        {isLoading && totalValue === 0 ? (
          <div className="skeleton h-12 w-64 rounded mt-2" />
        ) : (
          <h2 className="text-5xl sm:text-6xl font-bold tracking-tight mt-2 tabular bg-gradient-to-br from-white to-text-secondary bg-clip-text text-transparent">
            {formatCurrency(totalValue)}
          </h2>
        )}

        <div className="mt-6 grid grid-cols-3 gap-4 sm:gap-6">
          <Metric label="Invested" value={formatCurrency(totalInvested)} />
          <Metric
            label="Total P&L"
            value={`${pnlPos ? '+' : ''}${formatCurrency(pnl.amount)}`}
            badge={formatPercent(pnl.percentage)}
            positive={pnlPos}
          />
          <Metric
            label="Today"
            value={`${todayPos ? '+' : ''}${formatCurrency(todayChange.amount)}`}
            badge={formatPercent(todayChange.percentage)}
            positive={todayPos}
          />
        </div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  badge,
  positive,
}: {
  label: string;
  value: string;
  badge?: string;
  positive?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold">{label}</p>
      <p
        className={`text-base sm:text-lg font-semibold tabular truncate ${
          badge === undefined
            ? 'text-text-primary'
            : positive
            ? 'text-success'
            : 'text-danger'
        }`}
      >
        {value}
      </p>
      {badge && (
        <span
          className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
            positive
              ? 'bg-success/15 text-success'
              : 'bg-danger/15 text-danger'
          }`}
        >
          {badge}
        </span>
      )}
    </div>
  );
}
