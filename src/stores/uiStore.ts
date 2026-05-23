import { create } from 'zustand';

interface UIStore {
  modalCount: number;
  openModal: () => void;
  closeModal: () => void;
}

/**
 * Tracks how many blocking modals are currently mounted. The bottom nav is
 * unmounted whenever modalCount > 0, which is far more reliable than fighting
 * CSS stacking contexts with z-index.
 */
export const useUIStore = create<UIStore>((set) => ({
  modalCount: 0,
  openModal: () => set((s) => ({ modalCount: s.modalCount + 1 })),
  closeModal: () => set((s) => ({ modalCount: Math.max(0, s.modalCount - 1) })),
}));

export const useIsModalOpen = () =>
  useUIStore((s) => s.modalCount > 0);
