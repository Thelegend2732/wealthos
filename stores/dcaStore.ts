import { create } from 'zustand';
import { DCAConfig, DCAContribution } from '../types';

interface DCAStore {
  config: DCAConfig;
  contributions: DCAContribution[];
  updateConfig: (config: Partial<DCAConfig>) => void;
  addContribution: (amount: number, date: Date, note?: string) => void;
  removeContribution: (id: string) => void;
  getTotalContributed: () => number;
}

const DEFAULT_CONFIG: DCAConfig = {
  initialCapital: 10000,
  monthlyContribution: 500,
  startDate: new Date(),
  allocations: [
    { symbol: 'VOO', percentage: 40 },
    { symbol: 'QQQ', percentage: 30 },
    { symbol: 'NVDA', percentage: 20 },
    { symbol: 'SOXX', percentage: 10 },
  ],
};

export const useDCAStore = create<DCAStore>((set, get) => ({
  config: DEFAULT_CONFIG,
  contributions: [],

  updateConfig: (config) => {
    set((state) => ({ config: { ...state.config, ...config } }));
  },

  addContribution: (amount, date, note) => {
    const contribution: DCAContribution = {
      id: Date.now().toString(),
      amount,
      date,
      note,
    };
    set((state) => ({
      contributions: [contribution, ...state.contributions],
    }));
  },

  removeContribution: (id) => {
    set((state) => ({
      contributions: state.contributions.filter((c) => c.id !== id),
    }));
  },

  getTotalContributed: () => {
    const { contributions, config } = get();
    const loggedTotal = contributions.reduce((sum, c) => sum + c.amount, 0);
    return loggedTotal + config.initialCapital;
  },
}));
