import { formatCompact } from '../../constants/theme';
import type { ProjectionPoint } from '../../types';

interface Props {
  finalPoint: ProjectionPoint | undefined;
  currency: 'USD' | 'EUR';
  initialCapital: number;
  monthlyContribution: number;
  years: number;
}

export function ScenarioSummary({
  finalPoint,
  currency,
  initialCapital,
  monthlyContribution,
  years,
}: Props) {
  if (!finalPoint) return null;

  const totalContributed = initialCapital + monthlyContribution * years * 12;
  const moderate = finalPoint.moderate;
  const interest = moderate - totalContributed;
  const multiplier = totalContributed > 0 ? moderate / totalContributed : 1;

  return (
    <section className="card p-8 animate-slide-up" style={{ animationDelay: '120ms' }}>
      <p className="overline mb-6">Projected Outcome · 10% scenario</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        <Stat
          label="Final Value"
          value={formatCompact(moderate, currency)}
          tone="success"
        />
        <Stat
          label="Contributed"
          value={formatCompact(totalContributed, currency)}
        />
        <Stat
          label="Interest Earned"
          value={formatCompact(interest, currency)}
        />
        <Stat
          label="Multiplier"
          value={`${multiplier.toFixed(1)}×`}
          sub={`Money worked ${multiplier.toFixed(1)}× harder`}
        />
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: 'success' | 'neutral';
}) {
  return (
    <div className="min-w-0">
      <p className="overline">{label}</p>
      <p
        className={`text-display-md tabular tracking-tight-2 mt-2 ${
          tone === 'success' ? 'text-success-text' : 'text-text-primary'
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-[11px] text-text-muted mt-2">{sub}</p>}
    </div>
  );
}
