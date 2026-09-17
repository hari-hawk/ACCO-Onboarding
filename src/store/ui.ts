import { create } from 'zustand';

/* Transient UI state that should not survive a reload: the toast. */
export interface UiState {
  toast: { text: string; icon: string } | null;
  showToast: (text: string, icon?: string) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export const useUi = create<UiState>((set) => ({
  toast: null,
  showToast: (text, icon = 'info') => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toast: { text, icon } });
    toastTimer = setTimeout(() => set({ toast: null }), 3500);
  },
}));
