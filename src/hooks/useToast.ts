import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  show: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  hide: () => void;
}

export const useToast = create<ToastState>((set) => ({
  visible: false,
  message: '',
  type: 'info',

  show: (message, type = 'info') => set({ visible: true, message, type }),
  success: (message) => set({ visible: true, message, type: 'success' }),
  error: (message) => set({ visible: true, message, type: 'error' }),
  warning: (message) => set({ visible: true, message, type: 'warning' }),
  info: (message) => set({ visible: true, message, type: 'info' }),
  hide: () => set({ visible: false }),
}));
