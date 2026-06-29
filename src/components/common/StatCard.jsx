import React from 'react';

export default function StatCard({
  title,
  value,
  description,
  progress = null, // number 0-100
  trend = null, // string
  trendDirection = 'up', // up, down, neutral
  className = '',
}) {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-slate-500'
  };

  return (
    <div className={`glass-light card-3d hover-lift rounded-2xl p-5 border border-slate-200 text-left relative overflow-hidden flex flex-col justify-between bg-white ${className}`}>
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
          {title}
        </span>
        <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {value}
        </h4>
      </div>

      <div className="mt-4 space-y-2">
        {progress !== null && (
          <div className="space-y-1">
            <div className="w-full bg-slate-200 rounded-full h-1">
              <div 
                className="bg-brand-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-500 font-semibold font-mono">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
          <span className="truncate">{description}</span>
          {trend && (
            <span className={`font-bold font-mono ${trendColors[trendDirection]}`}>
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
