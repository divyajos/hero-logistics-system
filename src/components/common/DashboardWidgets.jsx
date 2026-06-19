import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ArrowUpRight, ArrowDownRight, Activity, Calendar, Clock, DollarSign, UserPlus, FilePlus } from 'lucide-react';
import { KPITrendChart } from './DashboardCharts';

// 1. ActivityTimeline Component
export function ActivityTimeline({ items = [], className = '' }) {
  const { isDark } = useTheme();

  return (
    <div className={`space-y-4 text-left ${className}`}>
      {items.map((item, idx) => {
        const Icon = item.icon || Clock;
        const isLast = idx === items.length - 1;
        
        return (
          <div key={idx} className="relative flex gap-4">
            {/* Connecting Line */}
            {!isLast && (
              <span 
                className="absolute left-4.5 top-9 bottom-0 w-0.5 bg-slate-200 dark:bg-darkbg-border"
                style={{ height: 'calc(100% - 16px)' }}
              />
            )}
            
            {/* Circle Node */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0 z-10 ${
              item.status === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : item.status === 'warning'
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : item.status === 'danger'
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-brand-500/10 border-brand-500/20 text-brand-400'
            }`}>
              <Icon className="h-4 w-4" />
            </div>

            {/* Content Details */}
            <div className="flex-1 pb-4.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{item.title}</h4>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 font-mono">{item.time}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 2. RecentActivityFeed Component
export function RecentActivityFeed({ logs = [], className = '' }) {
  return (
    <div className={`divide-y divide-slate-100 dark:divide-darkbg-border/40 text-left ${className}`}>
      {logs.map((log, idx) => {
        const Icon = log.icon || Activity;
        return (
          <div key={idx} className="py-3 flex items-start gap-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 px-2 transition-all rounded-xl">
            <div className="p-2 bg-slate-100 dark:bg-slate-800/40 rounded-lg text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0">
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block leading-tight">
                {log.message}
              </span>
              <div className="flex items-center gap-1.5 text-[9px] text-slate-400 dark:text-slate-500 font-bold font-mono">
                <span>{log.user}</span>
                <span>•</span>
                <span>{log.time}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 3. QuickActionsPanel Component
export function QuickActionsPanel({ actions = [], className = '' }) {
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {actions.map((act, idx) => {
        const Icon = act.icon || FilePlus;
        return (
          <button
            key={idx}
            onClick={act.onClick}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 dark:bg-[#161F30]/40 dark:hover:bg-brand-500/10 border border-slate-200 dark:border-[#23324C]/60 hover:border-brand-500/40 rounded-2xl cursor-pointer transition-all duration-300 select-none group text-center gap-2.5 shadow-sm"
          >
            <div className="p-3 bg-brand-500/10 group-hover:bg-brand-500 group-hover:text-white rounded-xl text-brand-400 transition-colors">
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-brand-500 dark:group-hover:text-brand-400">
              {act.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// 4. KpiTrendCards Component
export function KpiTrendCard({ title, value, previousValue, trendValue, trendDirection = 'up', sparklineData = [] }) {
  const isUp = trendDirection === 'up';
  
  return (
    <div className="glass rounded-2xl p-5 border border-slate-200 dark:border-darkbg-border/60 flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative overflow-hidden">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">{title}</span>
          <strong className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white leading-tight">{value}</strong>
        </div>
        <div className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-[10px] font-bold ${
          isUp 
            ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' 
            : 'text-red-500 bg-red-500/10 border-red-500/20'
        }`}>
          {isUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
          {trendValue}
        </div>
      </div>

      {sparklineData.length > 0 && (
        <div className="my-2">
          <KPITrendChart data={sparklineData} positive={isUp} />
        </div>
      )}

      <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-darkbg-border/30 pt-2 font-mono">
        <span>Prev: {previousValue}</span>
        <span>Current Month</span>
      </div>
    </div>
  );
}

// 5. StatisticsGrid Component
export function StatisticsGrid({ children, className = '' }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {children}
    </div>
  );
}
