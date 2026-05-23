import { useMemo, useState } from 'react';
import { useDCAStore } from '../stores/dcaStore';
import { PageHeader } from '../components/ui/PageHeader';
import { ContributionForm } from '../components/dca/ContributionForm';
import { ProjectionChart } from '../components/dca/ProjectionChart';
import { ScenarioSummary } from '../components/dca/ScenarioSummary';
import { formatCompact, formatCurrency } from '../constants/theme';
import type { ProjectionPoint } from '../types';

function computeProjections(initial: number, monthly: number, years: number): ProjectionPoint[] {
  const totalMonths = years * 12;
  const rates = {
    conservative: 0.06 / 12,
    moderate: 0.1 / 12,
    optimistic: 0.15 / 12,
  };
  const points: ProjectionPoint[] = [];
  for (let n = 1; n <= totalMonths; n++) {
    const calc = (r: number) => {
      const fv = initial * Math.pow(1 + r, n);
      const pmt = r > 0 ? monthly * ((Math.pow(1 + r, n) - 1) / r) : monthly * n;
      return fv + pmt;
    };
    points.push({
      month: n,
      conservative: calc(rates.conservative),
      moderate: calc(rates.moderate),
      optimistic: calc(rates.optimistic),
      totalContributed: initial + monthly * n,
    });
  }
  return points;
}

export function DCAPage() {
  const config = useDCAStore((s) => s.config);
  const contributions = useDCAStore((s) => s.contributions);
  const years = useDCAStore((s) => s.years);
  const currency = useDCAStore((s) => s.currency);
  const updateConfig = useDCAStore((s) => s.updateConfig);
  const setYears = useDCAStore((s) => s.setYears);
  const setCurrency = useDCAStore((s) => s.setCurrency);
  const addContribution = useDCAStore((s) => s.addContribution);
  const removeContribution = useDCAStore((s) => s.removeContribution);
  const getTotalContributed = useDCAStore((s) => s.getTotalContributed);

  const [showModal, setShowModal] = useState(false);
  const [modalAmount, setModalAmount] = useState('');
  const [modalNote, setModalNote] = useState('');

  const projections = useMemo(
    () => computeProjections(config.initialCapital, config.monthlyContribution, years),
    [config.initialCapital, config.monthlyContribution, years]
  );

  const finalPoint = projections[projections.length - 1];

  const handleAdd = () => {
    const amount = parseFloat(modalAmount);
    if (!isNaN(amount) && amount > 0) {
      addContribution(amount, new Date(), modalNote || undefined);
      setModalAmount('');
      setModalNote('');
      setShowModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="DCA Planner" subtitle="Compound interest projections" />

      <ContributionForm
        initialCapital={config.initialCapital}
        monthlyContribution={config.monthlyContribution}
        years={years}
        currency={currency}
        onCapital={(v) => updateConfig({ initialCapital: v })}
        onMonthly={(v) => updateConfig({ monthlyContribution: v })}
        onYears={setYears}
        onCurrency={() => setCurrency(currency === 'USD' ? 'EUR' : 'USD')}
      />

      <ProjectionChart projections={projections} currency={currency} />

      <ScenarioSummary
        finalPoint={finalPoint}
        currency={currency}
        initialCapital={config.initialCapital}
        monthlyContribution={config.monthlyContribution}
        years={years}
      />

      {/* Contribution log */}
      <section className="card p-8 animate-slide-up" style={{ animationDelay: '180ms' }}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="overline">Contribution Log</p>
            <p className="text-sm text-text-secondary mt-2">
              Total recorded:{' '}
              <span className="tabular text-text-primary font-medium">
                {formatCompact(getTotalContributed(), currency)}
              </span>
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="h-9 px-4 rounded-lg bg-text-primary text-bg font-medium text-sm hover:bg-text-secondary transition-colors flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add
          </button>
        </div>

        {contributions.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-border rounded-xl">
            <p className="text-text-primary font-medium text-sm">No contributions logged yet</p>
            <p className="text-xs text-text-muted mt-1">
              Tap "Add" to record a real investment
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {contributions.map((c) => (
              <div key={c.id} className="py-4 flex items-center justify-between gap-4 group">
                <div className="min-w-0">
                  <p className="text-success-text font-medium tabular">
                    {formatCurrency(c.amount, currency)}
                  </p>
                  {c.note && (
                    <p className="text-xs text-text-muted mt-0.5 truncate">{c.note}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-text-muted tabular">
                    {new Date(c.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <button
                    onClick={() => removeContribution(c.id)}
                    className="icon-btn opacity-0 group-hover:opacity-100 hover:!text-danger-text"
                    aria-label="Delete contribution"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-8 space-y-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-text-primary tracking-tight-2">
                Add Contribution
              </h3>
              <button onClick={() => setShowModal(false)} className="icon-btn" aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div>
              <label className="overline">Amount</label>
              <div className="flex items-baseline gap-2 mt-2 border-b border-border focus-within:border-border-strong pb-2 transition-colors">
                <span className="text-text-muted text-xl font-medium">
                  {currency === 'USD' ? '$' : '€'}
                </span>
                <input
                  type="number"
                  autoFocus
                  value={modalAmount}
                  onChange={(e) => setModalAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent outline-none text-text-primary font-semibold text-3xl tabular tracking-tight-2 placeholder:text-text-faint"
                />
              </div>
            </div>

            <div>
              <label className="overline">Note</label>
              <input
                type="text"
                value={modalNote}
                onChange={(e) => setModalNote(e.target.value)}
                placeholder="e.g. January DCA"
                className="w-full mt-2 bg-transparent border-b border-border focus:border-border-strong outline-none text-text-primary py-2 transition-colors placeholder:text-text-faint"
              />
            </div>

            <button
              onClick={handleAdd}
              className="w-full h-11 rounded-lg bg-text-primary text-bg font-medium text-sm hover:bg-text-secondary transition-colors"
            >
              Save contribution
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
