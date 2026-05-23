import { useState } from 'react';
import { usePortfolioStore } from '../stores/portfolioStore';
import { PageHeader } from '../components/ui/PageHeader';
import { AssetForm } from '../components/settings/AssetForm';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  formatCurrency,
} from '../constants/theme';
import type { Asset } from '../types';

export function SettingsPage() {
  const assets = usePortfolioStore((s) => s.assets);
  const addAsset = usePortfolioStore((s) => s.addAsset);
  const updateAsset = usePortfolioStore((s) => s.updateAsset);
  const removeAsset = usePortfolioStore((s) => s.removeAsset);
  const resetToDefaults = usePortfolioStore((s) => s.resetToDefaults);
  const clearAll = usePortfolioStore((s) => s.clearAll);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | undefined>();
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const openNew = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEdit = (asset: Asset) => {
    setEditing(asset);
    setFormOpen(true);
  };

  const handleSave = (data: Omit<Asset, 'id' | 'currentPrice'>) => {
    if (editing) {
      updateAsset(editing.id, data);
    } else {
      addAsset(data);
    }
  };

  return (
    <div className="space-y-2" style={{ padding: '0 20px' }}>
      <PageHeader
        title="Perfil"
        subtitle="Gestiona tus posiciones"
        right={
          <button
            onClick={openNew}
            className="h-9 px-4 rounded-lg bg-text-primary text-bg font-medium text-sm hover:bg-text-secondary transition-colors flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Position
          </button>
        }
      />

      {/* Asset list */}
      <section className="card animate-slide-up">
        {assets.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl border border-border mx-auto flex items-center justify-center mb-5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-text-primary font-medium">No positions yet</p>
            <p className="text-sm text-text-muted mt-1">
              Add your first investment to start tracking
            </p>
            <button
              onClick={openNew}
              className="mt-6 h-10 px-5 rounded-lg bg-text-primary text-bg font-medium text-sm hover:bg-text-secondary transition-colors"
            >
              Add Position
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {assets.map((asset, i) => (
              <AssetRow
                key={asset.id}
                asset={asset}
                index={i}
                onEdit={() => openEdit(asset)}
                onDelete={() => removeAsset(asset.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Danger zone */}
      <section className="card p-8 mt-8 animate-slide-up" style={{ animationDelay: '120ms' }}>
        <p className="overline mb-2">Data</p>
        <h3 className="text-base font-semibold text-text-primary mb-1">Portfolio data</h3>
        <p className="text-sm text-text-muted mb-6">
          Reset to the default example positions, or clear everything and start blank.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setConfirmReset(true)}
            className="flex-1 h-11 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-border-strong font-medium text-sm transition-colors"
          >
            Reset to defaults
          </button>
          <button
            onClick={() => setConfirmClear(true)}
            className="flex-1 h-11 rounded-lg border border-danger/30 text-danger-text hover:border-danger/60 hover:bg-danger-subtle font-medium text-sm transition-colors"
          >
            Clear all positions
          </button>
        </div>
      </section>

      <AssetForm
        open={formOpen}
        asset={editing}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />

      {confirmReset && (
        <ConfirmDialog
          title="Reset to defaults?"
          message="This will replace all your current positions with the example portfolio (VOO, QQQ, SOXX, NVDA, ASML)."
          confirmLabel="Reset"
          onCancel={() => setConfirmReset(false)}
          onConfirm={() => {
            resetToDefaults();
            setConfirmReset(false);
          }}
        />
      )}

      {confirmClear && (
        <ConfirmDialog
          title="Clear all positions?"
          message="This permanently removes every position from your portfolio. You can add new ones afterwards."
          confirmLabel="Clear everything"
          danger
          onCancel={() => setConfirmClear(false)}
          onConfirm={() => {
            clearAll();
            setConfirmClear(false);
          }}
        />
      )}
    </div>
  );
}

function AssetRow({
  asset,
  index,
  onEdit,
  onDelete,
}: {
  asset: Asset;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const value = asset.avgPrice * asset.quantity;

  return (
    <div
      className="px-6 py-5 flex items-center justify-between gap-4 group transition-colors hover:bg-surface-hover"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-center gap-5 min-w-0 flex-1">
        <span
          className="w-0.5 h-10 rounded-full shrink-0"
          style={{ backgroundColor: CATEGORY_COLORS[asset.category] }}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-text-primary">{asset.symbol}</span>
            <span className="text-[10px] uppercase tracking-overline text-text-muted">
              {CATEGORY_LABELS[asset.category]}
            </span>
          </div>
          <p className="text-xs text-text-muted truncate">{asset.name}</p>
        </div>
      </div>

      <div className="hidden sm:flex flex-col items-end shrink-0 tabular min-w-[120px]">
        <span className="text-sm text-text-primary font-medium">
          {asset.quantity} ×{' '}
          <span className="text-text-secondary">
            {formatCurrency(asset.avgPrice, asset.currency)}
          </span>
        </span>
        <span className="text-xs text-text-muted mt-0.5">
          {formatCurrency(value, asset.currency)} invested
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={onEdit} className="icon-btn" aria-label="Edit">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={() => setConfirm(true)}
          className="icon-btn hover:!text-danger-text hover:!border-danger/30"
          aria-label="Delete"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>

      {confirm && (
        <ConfirmDialog
          title={`Remove ${asset.symbol}?`}
          message={`This deletes your ${asset.quantity} shares of ${asset.name} from the portfolio.`}
          confirmLabel="Remove"
          danger
          onCancel={() => setConfirm(false)}
          onConfirm={() => {
            onDelete();
            setConfirm(false);
          }}
        />
      )}
    </div>
  );
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  danger,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-surface border border-border rounded-2xl max-w-md w-full p-8 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="text-lg font-semibold text-text-primary tracking-tight-2">
          {title}
        </h4>
        <p className="text-sm text-text-secondary mt-2 leading-relaxed">{message}</p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 h-10 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-border-strong font-medium text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 h-10 rounded-lg font-medium text-sm transition-colors ${
              danger
                ? 'bg-danger text-bg hover:bg-danger-text'
                : 'bg-text-primary text-bg hover:bg-text-secondary'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
