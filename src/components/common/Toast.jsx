import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function Toast({
  message,
  type = 'info', // success, error, warning, info
  onClose,
  duration = 4000,
  className = '',
}) {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />,
    error: <AlertCircle className="h-4.5 w-4.5 text-red-400" />,
    warning: <AlertTriangle className="h-4.5 w-4.5 text-yellow-400" />,
    info: <Info className="h-4.5 w-4.5 text-brand-400" />
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-500/5',
    error: 'border-red-500/30 bg-red-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    info: 'border-brand-500/30 bg-brand-500/5'
  };

  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 border rounded-xl shadow-xl animate-slide-in text-xs font-semibold text-slate-700 select-none backdrop-blur-md
      ${borders[type]} ${className}
    `}>
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-grow text-left leading-relaxed">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-white/40 rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
