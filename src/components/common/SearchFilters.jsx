import React from 'react';
import { Search } from 'lucide-react';

export default function SearchFilters({ onSearchChange, onFilterChange, filters = [], searchPlaceholder = "Search records..." }) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-5">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="search"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9.5 pr-4 py-2.5 bg-[#161F30]/40 border border-[#23324C] focus:border-brand-500 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-slate-500"
        />
      </div>

      {/* Select Filter Dropdowns */}
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {filters.map((f) => (
            <select
              key={f.key}
              onChange={(e) => onFilterChange(f.key, e.target.value)}
              className="px-3.5 py-2.5 bg-[#161F30] border border-[#23324C] hover:border-brand-500/30 text-slate-300 hover:text-white text-xs rounded-xl focus:outline-none cursor-pointer transition-all"
            >
              <option value="">{f.placeholder || `Filter by ${f.key}`}</option>
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#161F30]">
                  {opt.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}
    </div>
  );
}
