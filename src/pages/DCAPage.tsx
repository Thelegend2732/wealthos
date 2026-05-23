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
    <div className="space-y-5">
      <PageHeader title="DCA Planner" subtitle="Dollar-Cost Averaging Tracker" />

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
      <section className="space-y-3 animate-slide-up" style={{ animationDelay: '180ms' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-text-primary">Contribution Log</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Total recorded: <span className="tabular text-text-primary font-semibold">
                {formatCompact(getTotalContributed(), currency)}
              </span>
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white text-sm font-bold flex items-center gap-1.5 hover:shadow-glow-primary transition-shadow"
          >
            <span className="text-base leading-none">+</span>
            Add
          </button>
        </div>

        {contributions.length === 0 ? (
          <div className="card p-10 text-center border-dashed">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-text-primary font-semibold">No contributions logged yet</p>
            <p className="text-sm text-text-muted mt-1">Tap "Add" to record a real investment</p>
          </div>
        ) : (
          <div className="space-y-2">
            {contributions.map((c) => (
              <div key={c.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="text-success font-bold tabular">
                    {formatCurrency(c.amount, currency)}
                  </p>
                  {c.note && <p className="text-sm text-text-secondary mt-0.5">{c.note}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-text-muted tabular">
                    {new Date(c.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <button
                    onClick={() => removeContribution(c.id)}
                    className="text-text-muted hover:text-danger transition-colors w-7 h-7 rounded-md hover:bg-danger/10 flex items-center justify-center"
                    aria-label="Delete contribution"
                  >
                    ×
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
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="glass rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 space-y-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary">Add Contribution</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-full hover:bg-border flex items-center justify-center text-text-secondary text-xl transition-colors"
              >
                ×
              </button>
            </div>

            <div>
              <label className="block text-sm text-text-secondary font-semibold mb-2">
                Amount ({currency})
              </label>
              <div className="flex items-center gap-2 bg-bg border border-border focus-within:border-primary rounded-xl px-4 h-14 transition-colors">
                <span className="text-text-secondary font-semibold text-lg">
                  {currency === 'USD' ? '$' : '€'}
                </span>
                <input
                  type="number"
                  autoFocus
                  value={modalAmount}
                  onChange={(e) => setModalAmount(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-text-primary font-bold text-2xl tabular placeholder:text-text-muted"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-secondary font-semibold mb-2">
                Note (optional)
              </label>
              <input
                type="text"
                value={modalNote}
                onChange={(e) => setModalNote(e.target.value)}
                placeholder="e.g. January DCA"
                className="w-full bg-bg border border-border focus:border-primary rounded-xl px-4 h-12 outline-none text-text-primary placeholder:text-text-muted transition-colors"
              />
            </div>

            <button
              onClick={handleAdd}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-bold hover:shadow-glow-primary transition-shadow"
            >
              Save Contribution
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
