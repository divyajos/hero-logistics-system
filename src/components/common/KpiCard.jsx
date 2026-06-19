import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function KpiCard({ title, value, icon: Icon, trend, trendDirection = 'neutral', description }) {
  const getTrendColor = (dir) => {
    if (dir === 'up') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (dir === 'down') return 'text-red-400 bg-red-500/10 border-red-500/20';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  };

  const getTrendIcon = (dir) => {
    if (dir === 'up') return <ArrowUpRight className="h-3 w-3 mr-0.5" />;
    if (dir === 'down') return <ArrowDownRight className="h-3 w-3 mr-0.5" />;
    return <Minus className="h-3 w-3 mr-0.5" />;
  };

  return (
    <div className="glass-light hover:border-brand-500/30 rounded-2xl p-5 border border-[#23324C]/60 transition-all duration-300 flex flex-col justify-between hover:shadow-lg shadow-black/10">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            {title}
          </span>
          <strong className="text-xl sm:text-2xl font-black text-white leading-tight">
            {value}
          </strong>
        </div>
        
        {Icon && (
          <div className="p-2.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-xl">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs">
        {trend && (
          <span className={`inline-flex items-center px-2 py-0.5 font-bold rounded-lg border text-[10px] ${getTrendColor(trendDirection)}`}>
            {getTrendIcon(trendDirection)}
            {trend}
          </span>
        )}
        {description && (
          <span className="text-slate-400 text-[10px] sm:text-xs font-medium truncate">
            {description}
          </span>
        )}
      </div>
    </div>
  );
}
