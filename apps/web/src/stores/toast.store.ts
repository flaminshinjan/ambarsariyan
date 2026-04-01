import { create } from 'zustand';

export type ToastVariant = 'info' | 'success' | 'error' | 'warning';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  icon?: string;
}

interface ToastState {
  toasts: Toast[];
  add: (message: string, variant?: ToastVariant, icon?: string) => void;
  remove: (id: string) => void;
}

let counter = 0;

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],

  add: (message, variant = 'info', icon) => {
    const id = `toast-${++counter}-${Date.now()}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, variant, icon }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },

  remove: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
