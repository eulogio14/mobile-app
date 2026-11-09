import React, { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import Toast from '../components/common/Toast';

type ToastState = { message: string; type: 'success' | 'error' } | null;

type ToastContextType = { showToast: (message: string, type?: 'success' | 'error') => void };

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
