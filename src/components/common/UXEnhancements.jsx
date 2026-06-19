import React, { useEffect } from 'react';
import { ChevronRight, AlertTriangle, X } from 'lucide-react';
import Button from './Button';

// 1. Breadcrumbs Component
export function Breadcrumbs({ crumbs = [] }) {
  if (crumbs.length === 0) return null;

  return (
    <nav className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono select-none">
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-300 dark:text-slate-600 flex-shrink-0" />}
            {isLast ? (
              <span className="text-slate-800 dark:text-slate-300 font-black truncate max-w-xs">{crumb}</span>
            ) : (
              <span className="truncate max-w-[120px]">{crumb}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// 2. PageHeader Component
export function PageHeader({ title, crumbs = [], actions = null, className = '' }) {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-darkbg-border/60 pb-5.5 mb-6 text-left ${className}`}>
      <div className="space-y-1.5 flex-1 min-w-0">
        <Breadcrumbs crumbs={crumbs} />
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight truncate">
          {title}
        </h2>
      </div>
      {actions && (
        <div className="flex items-center gap-3.5 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

// 3. ConfirmationDialog Component
export function ConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Are you sure?', 
  message = 'This action cannot be undone. Please confirm to proceed.',
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  danger = true
}) {
  // Prevent body scrolling when dialog open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 dark:bg-[#0B0F19]/80 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Dialog Body */}
      <div className="bg-white dark:bg-[#161F30] border border-slate-200 dark:border-[#23324C] rounded-2xl w-full max-w-sm shadow-2xl relative z-10 animate-fade-in overflow-hidden p-6 text-center">
        {/* Warning Icon Banner */}
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
          danger 
            ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
            : 'bg-brand-500/10 text-brand-500 border border-brand-500/20'
        }`}>
          <AlertTriangle className="h-6 w-6" />
        </div>

        {/* Text descriptions */}
        <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-2">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{message}</p>

        {/* Buttons footer */}
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            className="flex-1" 
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
          <Button 
            variant={danger ? 'danger' : 'primary'} 
            className="flex-1" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
