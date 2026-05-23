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
    <section className="card p-8 sm:p-10 animate-slide-up">
      <p className="overline">Total Portfolio Value</p>
      {isLoading && totalValue === 0 ? (
        <div className="skeleton h-14 w-72 mt-3" />
      ) : (
        <h2 className="text-display-xl text-text-primary tabular mt-3">
          {formatCurrency(totalValue)}
        </h2>
      )}

      {/* Subtle divider */}
      <div className="h-px bg-border mt-8" />

      <div className="grid grid-cols-3 gap-6 sm:gap-10 mt-6">
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
  const valueColor =
    badge === undefined
      ? 'text-text-primary'
      : positive
      ? 'text-success-text'
      : 'text-danger-text';

  return (
    <div className="min-w-0">
      <p className="overline">{label}</p>
      <p className={`text-base sm:text-lg font-semibold tabular truncate mt-2 ${valueColor}`}>
        {value}
      </p>
      {badge && (
        <span
          className={`inline-block mt-1.5 text-[11px] font-medium tabular ${
            positive ? 'text-success-text' : 'text-danger-text'
          }`}
        >
          {badge}
        </span>
      )}
    </div>
  );
}
