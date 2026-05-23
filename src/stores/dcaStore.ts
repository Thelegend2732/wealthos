import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DCAConfig, DCAContribution } from '../types';

interface DCAStore {
  config: DCAConfig;
  contributions: DCAContribution[];
  years: number;
  currency: 'USD' | 'EUR';
  setYears: (y: number) => void;
  setCurrency: (c: 'USD' | 'EUR') => void;
  updateConfig: (c: Partial<DCAConfig>) => void;
  addContribution: (amount: number, date: Date, note?: string) => void;
  removeContribution: (id: string) => void;
  getTotalContributed: () => number;
}

export const useDCAStore = create<DCAStore>()(
  persist(
    (set, get) => ({
      config: {
        initialCapital: 10000,
        monthlyContribution: 500,
        startDate: new Date(),
      },
      contributions: [],
      years: 20,
      currency: 'USD',

      setYears: (y) => set({ years: y }),
      setCurrency: (c) => set({ currency: c }),

      updateConfig: (c) => set((s) => ({ config: { ...s.config, ...c } })),

      addContribution: (amount, date, note) =>
        set((s) => ({
          contributions: [
            { id: crypto.randomUUID(), amount, date, note },
            ...s.contributions,
          ],
        })),

      removeContribution: (id) =>
        set((s) => ({ contributions: s.contributions.filter((c) => c.id !== id) })),

      getTotalContributed: () => {
        const { contributions, config } = get();
        return (
          config.initialCapital + contributions.reduce((sum, c) => sum + c.amount, 0)
        );
      },
    }),
    {
      name: 'wealthos-dca',
      partialize: (s) => ({
        config: s.config,
        contributions: s.contributions,
        years: s.years,
        currency: s.currency,
      }),
    }
  )
);
