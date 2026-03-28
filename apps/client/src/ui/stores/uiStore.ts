import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

export interface DialogConfig {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export type UIPanel = 'none' | 'inventory' | 'shop' | 'map' | 'quest' | 'settings';

interface UIState {
  activePanel: UIPanel;
  toasts: Toast[];
  dialog: DialogConfig | null;
  isPaused: boolean;
  showMinimap: boolean;
  showFPS: boolean;
  uiScale: number;

  openPanel: (panel: UIPanel) => void;
  closePanel: () => void;
  togglePanel: (panel: UIPanel) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  showDialog: (config: DialogConfig) => void;
  hideDialog: () => void;
  setPaused: (paused: boolean) => void;
  togglePause: () => void;
  toggleMinimap: () => void;
  toggleFPS: () => void;
  setUIScale: (scale: number) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  activePanel: 'none',
  toasts: [],
  dialog: null,
  isPaused: false,
  showMinimap: true,
  showFPS: false,
  uiScale: 1,

  openPanel: panel => set({ activePanel: panel }),
  closePanel: () => set({ activePanel: 'none' }),
  togglePanel: panel => {
    const current = get().activePanel;
    set({ activePanel: current === panel ? 'none' : panel });
  },

  addToast: toast => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = { ...toast, id };
    set(state => ({ toasts: [...state.toasts, newToast] }));

    const duration = toast.duration ?? 3000;
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },

  removeToast: id =>
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== id),
    })),

  showDialog: config => set({ dialog: config }),
  hideDialog: () => set({ dialog: null }),

  setPaused: isPaused => set({ isPaused }),
  togglePause: () => set(state => ({ isPaused: !state.isPaused })),

  toggleMinimap: () => set(state => ({ showMinimap: !state.showMinimap })),
  toggleFPS: () => set(state => ({ showFPS: !state.showFPS })),
  setUIScale: uiScale => set({ uiScale }),
}));
