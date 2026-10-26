import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastNotification({ type = 'success', message, onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md animate-bounce-in shadow-xl rounded-xl overflow-hidden border transition-all">
      <div
        className={`flex items-start gap-3 p-4 ${
          isSuccess
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : isError
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-blue-50 border-blue-200 text-blue-900'
        }`}
      >
        <div className="mt-0.5 flex-shrink-0">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
          {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-600" />}
        </div>
        <div className="flex-1 text-sm font-medium pr-2">
          {message}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 transition p-0.5 rounded-lg hover:bg-slate-200/50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
