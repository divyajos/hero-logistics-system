import React from 'react';

// Single KPI Card skeleton
export function KpiSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 border border-[#23324C]/60 flex items-center justify-between animate-pulse">
      <div className="space-y-3 flex-1">
        <div className="h-3.5 bg-slate-800 rounded-full w-24" />
        <div className="h-7 bg-slate-800 rounded-full w-16" />
        <div className="h-3 bg-slate-800 rounded-full w-32" />
      </div>
      <div className="h-10 w-10 bg-slate-800 rounded-xl" />
    </div>
  );
}

// Grid of KPI Cards skeleton
export function KpiGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <KpiSkeleton key={i} />
      ))}
    </div>
  );
}

// Table rows loading skeleton
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="w-full space-y-4 animate-pulse">
      {/* Table search filter mock */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="h-10 bg-slate-800 rounded-xl w-full sm:w-64" />
        <div className="h-10 bg-slate-800 rounded-xl w-full sm:w-40" />
      </div>
      
      {/* Table Headers */}
      <div className="border border-[#23324C]/40 rounded-xl overflow-hidden">
        <div className="bg-[#111827] px-6 py-4 flex gap-4 border-b border-[#23324C]/40">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-800 rounded-full flex-1" />
          ))}
        </div>
        {/* Table Rows */}
        <div className="divide-y divide-[#23324C]/40 bg-[#0B0F19]/40">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="px-6 py-5 flex gap-4">
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div key={colIndex} className="h-3.5 bg-slate-800 rounded-full flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Chart loading skeleton
export function ChartSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 border border-[#23324C]/60 space-y-4 animate-pulse">
      <div className="h-4 bg-slate-800 rounded-full w-48" />
      <div className="h-48 bg-slate-800/40 rounded-xl flex items-end justify-between p-4 gap-2">
        <div className="h-12 bg-slate-800 rounded-lg flex-1" />
        <div className="h-28 bg-slate-800 rounded-lg flex-1" />
        <div className="h-20 bg-slate-800 rounded-lg flex-1" />
        <div className="h-36 bg-slate-800 rounded-lg flex-1" />
        <div className="h-24 bg-slate-800 rounded-lg flex-1" />
        <div className="h-40 bg-slate-800 rounded-lg flex-1" />
      </div>
    </div>
  );
}

// List skeleton (notifications, routes etc)
export function ListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/10 rounded-xl border border-slate-800/20">
          <div className="h-8 w-8 bg-slate-800 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-800 rounded-full w-1/3" />
            <div className="h-2.5 bg-slate-800 rounded-full w-2/3" />
          </div>
          <div className="h-2 bg-slate-800 rounded-full w-12" />
        </div>
      ))}
    </div>
  );
}
