import { create } from 'zustand';

type CaptureState = {
  open: boolean;
  toggle: () => void;
  show: () => void;
  hide: () => void;
};

export const useCaptureStore = create<CaptureState>((set) => ({
  open: false,
  toggle: () => set((s) => ({ open: !s.open })),
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}));
