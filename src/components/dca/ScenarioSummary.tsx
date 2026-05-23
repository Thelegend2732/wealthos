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
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-slide-up" style={{ animationDelay: '120ms' }}>
      <Card
        label="Final Value (10%)"
        value={formatCompact(moderate, currency)}
        color="#00D4AA"
        primary
      />
      <Card
        label="Total Contributed"
        value={formatCompact(totalContributed, currency)}
        color="#8B8FA8"
      />
      <Card
        label="Interest Generated"
        value={formatCompact(interest, currency)}
        color="#6C63FF"
      />
      <Card
        label="Money Multiplier"
        value={`${multiplier.toFixed(1)}×`}
        color="#FF8C42"
        sub={`Worked ${multiplier.toFixed(1)}× harder`}
      />
    </section>
  );
}

function Card({
  label,
  value,
  color,
  sub,
  primary,
}: {
  label: string;
  value: string;
  color: string;
  sub?: string;
  primary?: boolean;
}) {
  return (
    <div
      className="card p-4 relative overflow-hidden"
      style={primary ? { boxShadow: `0 0 32px -16px ${color}` } : undefined}
    >
      {primary && (
        <div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
        />
      )}
      <p className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">{label}</p>
      <p className="text-2xl font-bold mt-1 tabular" style={{ color }}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-text-muted mt-1">{sub}</p>}
    </div>
  );
}
