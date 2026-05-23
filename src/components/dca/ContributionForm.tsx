interface Props {
  initialCapital: number;
  monthlyContribution: number;
  years: number;
  currency: 'USD' | 'EUR';
  onCapital: (v: number) => void;
  onMonthly: (v: number) => void;
  onYears: (v: number) => void;
  onCurrency: () => void;
}

const SYMBOLS = { USD: '$', EUR: '€' };

export function ContributionForm({
  initialCapital,
  monthlyContribution,
  years,
  currency,
  onCapital,
  onMonthly,
  onYears,
  onCurrency,
}: Props) {
  const yearsPct = ((years - 1) / 39) * 100;

  return (
    <section className="card p-8 animate-slide-up">
      <div className="flex items-center justify-between mb-8">
        <p className="overline">Configuration</p>
        <button
          onClick={onCurrency}
          className="text-xs text-text-secondary hover:text-text-primary font-medium transition-colors flex items-center gap-1.5"
        >
          {currency}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <Field
          label="Initial Capital"
          symbol={SYMBOLS[currency]}
          value={initialCapital}
          onChange={onCapital}
        />
        <Field
          label="Monthly Contribution"
          symbol={SYMBOLS[currency]}
          value={monthlyContribution}
          onChange={onMonthly}
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-4">
          <label className="overline">Projection Period</label>
          <span className="text-lg font-semibold text-text-primary tabular tracking-tight-2">
            {years}
            <span className="text-sm font-normal text-text-muted ml-1">years</span>
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={40}
          step={1}
          value={years}
          onChange={(e) => onYears(Number(e.target.value))}
          className="w-full"
          style={{ ['--range-pct' as string]: `${yearsPct}%` }}
        />
        <div className="flex justify-between text-[11px] text-text-faint mt-2 tabular">
          <span>1y</span>
          <span>10y</span>
          <span>20y</span>
          <span>30y</span>
          <span>40y</span>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  symbol,
  value,
  onChange,
}: {
  label: string;
  symbol: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="overline">{label}</label>
      <div className="flex items-center gap-2 mt-2 border-b border-border focus-within:border-border-strong transition-colors pb-2">
        <span className="text-text-muted font-medium">{symbol}</span>
        <input
          type="number"
          value={value || ''}
          onChange={(e) => {
            const n = parseFloat(e.target.value.replace(/[^0-9.]/g, ''));
            onChange(isNaN(n) ? 0 : n);
          }}
          className="flex-1 bg-transparent outline-none text-text-primary font-medium tabular text-xl tracking-tight-2 placeholder:text-text-faint"
          placeholder="0"
        />
      </div>
    </div>
  );
}
