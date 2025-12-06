import { createContext, useContext } from 'react';

export interface ToastState {
  message: string;
  type: 'error' | 'success';
}

export interface ToastContextValue {
  toast: ToastState | null;
  showToast: (message: string, type: 'error' | 'success') => void;
  hideToast: () => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
