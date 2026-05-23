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
    <section className="card p-6 space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-[0.15em] text-text-secondary font-semibold">
          Configuration
        </h3>
        <button
          onClick={onCurrency}
          className="px-3 py-1.5 rounded-lg bg-border hover:bg-border-strong text-text-primary text-sm font-semibold transition-colors flex items-center gap-1.5"
        >
          <span>{currency === 'USD' ? '🇺🇸' : '🇪🇺'}</span>
          {currency}
        </button>
      </div>

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

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-text-secondary font-semibold">
            Projection Period
          </label>
          <span className="text-base font-bold text-primary tabular">{years} years</span>
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
        <div className="flex justify-between text-[11px] text-text-muted mt-2">
          <span>1 yr</span>
          <span>20 yrs</span>
          <span>40 yrs</span>
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
      <label className="block text-sm text-text-secondary font-semibold mb-2">
        {label}
      </label>
      <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-4 h-12 focus-within:border-primary transition-colors">
        <span className="text-text-secondary font-semibold">{symbol}</span>
        <input
          type="number"
          value={value || ''}
          onChange={(e) => {
            const n = parseFloat(e.target.value.replace(/[^0-9.]/g, ''));
            onChange(isNaN(n) ? 0 : n);
          }}
          className="flex-1 bg-transparent outline-none text-text-primary font-semibold tabular text-base placeholder:text-text-muted"
          placeholder="0"
        />
      </div>
    </div>
  );
}
