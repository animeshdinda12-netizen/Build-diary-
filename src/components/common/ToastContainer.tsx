import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ToastMessage } from '../../types';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, RotateCcw } from 'lucide-react';

const ToastItem: React.FC<{ toast: ToastMessage }> = ({ toast }) => {
  const { dismissToast } = useApp();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = toast.duration || 5000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          dismissToast(toast.id);
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [toast, dismissToast]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div 
      id={`toast-${toast.id}`}
      className="relative overflow-hidden flex items-center gap-3 px-4 py-3 bg-neutral-900/95 dark:bg-neutral-900/95 text-neutral-100 border border-neutral-800 rounded-xl shadow-2xl backdrop-blur-md min-w-[280px] max-w-md animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      {getIcon()}
      <div className="flex-1 text-sm font-medium pr-1 text-neutral-200">
        {toast.message}
      </div>

      {toast.undoAction && (
        <button
          id={`toast-undo-btn-${toast.id}`}
          onClick={() => {
            toast.undoAction?.();
            dismissToast(toast.id);
          }}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          {toast.undoLabel || 'Undo'}
        </button>
      )}

      <button
        id={`toast-close-btn-${toast.id}`}
        onClick={() => dismissToast(toast.id)}
        className="text-neutral-500 hover:text-neutral-300 p-1 rounded transition-colors cursor-pointer"
        title="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* 5-second progress bar */}
      <div 
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-400 transition-all ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div 
      id="build-diary-toasts-portal"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-auto"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};
