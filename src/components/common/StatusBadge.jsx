import React from 'react';

export default function StatusBadge({ status = '' }) {
  const getBadgeStyle = (str) => {
    const raw = (str || '').toLowerCase();
    
    // Emerald / Success States
    if (['delivered', 'completed', 'active', 'online', 'paid', 'verified', 'docked'].includes(raw)) {
      return 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400';
    }
    
    // Blue / Action States
    if (['transit', 'in transit', 'dispatched', 'loaded', 'shipping', 'scheduled', 'demo scheduled', 'accepted'].includes(raw)) {
      return 'bg-brand-500/10 border-brand-500/25 text-brand-400';
    }
    
    // Yellow / Warning States
    if (['pending', 'requested', 'hold', 'on hold', 'unassigned', 'under inspection', 'trial'].includes(raw)) {
      return 'bg-amber-500/10 border-amber-500/25 text-amber-400';
    }
    
    // Red / Alert States
    if (['delayed', 'cancelled', 'offline', 'overdue', 'failed', 'alert'].includes(raw)) {
      return 'bg-red-500/10 border-red-500/25 text-red-400';
    }
    
    // Default Gray
    return 'bg-slate-500/10 border-slate-500/25 text-slate-400';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border leading-none ${getBadgeStyle(status)}`}>
      {status}
    </span>
  );
}
