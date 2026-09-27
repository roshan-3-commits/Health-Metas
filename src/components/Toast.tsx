import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, Copy, Utensils, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'copy' | 'meal';
  title: string;
  message?: string;
}

interface ToastContextType {
  toastSuccess: (title: string, message?: string) => void;
  toastError: (title: string, message?: string) => void;
  toastInfo: (title: string, message?: string) => void;
  toastCopy: (title?: string, message?: string) => void;
  toastMeal: (title: string, message?: string | number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastItem['type'], title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toastSuccess = useCallback((title: string, message?: string) => {
    addToast('success', title, message);
  }, [addToast]);

  const toastError = useCallback((title: string, message?: string) => {
    addToast('error', title, message);
  }, [addToast]);

  const toastInfo = useCallback((title: string, message?: string) => {
    addToast('info', title, message);
  }, [addToast]);

  const toastCopy = useCallback((title = 'Link Copied!', message?: string) => {
    addToast('copy', title, message || 'Copied to clipboard');
  }, [addToast]);

  const toastMeal = useCallback((title: string, message?: string | number) => {
    const msg = typeof message === 'number' ? `+${message} kcal logged` : message;
    addToast('meal', title, msg);
  }, [addToast]);

  return (
    <ToastContext.Provider
      value={{
        toastSuccess,
        toastError,
        toastInfo,
        toastCopy,
        toastMeal,
        removeToast,
      }}
    >
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          let bgClasses = 'bg-slate-900 border-slate-700 text-white';
          let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;

          if (t.type === 'success') {
            bgClasses = 'bg-[#0f1d15] border-emerald-500/40 text-emerald-100 shadow-lg shadow-emerald-950/40';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
          } else if (t.type === 'error') {
            bgClasses = 'bg-[#211114] border-red-500/40 text-red-100 shadow-lg shadow-red-950/40';
            icon = <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />;
          } else if (t.type === 'copy') {
            bgClasses = 'bg-[#141b2b] border-cyan-500/40 text-cyan-100 shadow-lg shadow-cyan-950/40';
            icon = <Copy className="w-5 h-5 text-cyan-400 shrink-0" />;
          } else if (t.type === 'meal') {
            bgClasses = 'bg-[#231a0e] border-amber-500/40 text-amber-100 shadow-lg shadow-amber-950/40';
            icon = <Utensils className="w-5 h-5 text-amber-400 shrink-0" />;
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border backdrop-blur-md transition-all animate-fadeIn ${bgClasses}`}
            >
              {icon}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs leading-tight">{t.title}</div>
                {t.message && (
                  <div className="text-[11px] opacity-80 mt-0.5 leading-snug line-clamp-2">
                    {t.message}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="opacity-60 hover:opacity-100 p-0.5 rounded-md hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
