import React from 'react';
import { Database } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  title = 'No records resolved',
  description = 'There are currently no active logs on this system node.',
  icon: Icon = Database,
  actionLabel = null,
  onAction = null,
  className = '',
}) {
  return (
    <div className={`glass rounded-2xl p-10 border border-[#23324C]/60 text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto ${className}`}>
      <div className="p-4 bg-slate-800/10 rounded-2xl border border-[#23324C]/60 text-slate-500">
        <Icon className="h-7 w-7" />
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-extrabold text-white">{title}</h4>
        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
