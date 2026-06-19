import React, { useState, useEffect, useMemo } from 'react';
import { Eye, EyeOff, Download, Layers, CheckSquare, Square, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';
import { useTheme } from '../../context/ThemeContext';

export default function DataTable({ 
  columns = [], 
  data = [], 
  loading = false,
  tableName = 'data_table'
}) {
  const { isDark } = useTheme();

  // 1. Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // 2. Density State ('compact', 'default', 'relaxed')
  const [density, setDensity] = useState(() => {
    return localStorage.getItem(`${tableName}_density`) || 'default';
  });

  useEffect(() => {
    localStorage.setItem(`${tableName}_density`, density);
  }, [density, tableName]);

  // 3. Column Visibility State
  const [visibleKeys, setVisibleKeys] = useState(() => {
    const saved = localStorage.getItem(`${tableName}_columns`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return columns.map(c => c.key);
  });

  useEffect(() => {
    localStorage.setItem(`${tableName}_columns`, JSON.stringify(visibleKeys));
  }, [visibleKeys, tableName]);

  const [colDropdownOpen, setColDropdownOpen] = useState(false);

  const toggleColumn = (key) => {
    setVisibleKeys(prev => {
      if (prev.includes(key)) {
        // Keep at least one column visible
        if (prev.length <= 1) return prev;
        return prev.filter(k => k !== key);
      }
      return [...prev, key];
    });
  };

  // Filter columns based on visibility list
  const activeColumns = useMemo(() => {
    return columns.filter(col => visibleKeys.includes(col.key));
  }, [columns, visibleKeys]);

  // 4. Bulk Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Clear selections when data changes
  useEffect(() => {
    setSelectedIds([]);
  }, [data]);

  // Get current page rows
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const isAllSelected = useMemo(() => {
    if (paginatedData.length === 0) return false;
    return paginatedData.every((row, idx) => selectedIds.includes(row.id || idx));
  }, [paginatedData, selectedIds]);

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const pageIds = paginatedData.map((row, idx) => row.id || idx);
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      const pageIds = paginatedData.map((row, idx) => row.id || idx);
      setSelectedIds(prev => [...new Set([...prev, ...pageIds])]);
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      return [...prev, id];
    });
  };

  // 5. CSV Export Utility
  const handleExportCSV = () => {
    const targetData = selectedIds.length > 0
      ? data.filter((row, idx) => selectedIds.includes(row.id || idx))
      : data;

    if (targetData.length === 0) return;

    // Generate Headers
    const headers = activeColumns.map(col => `"${col.label}"`).join(',');
    
    // Generate Rows
    const rows = targetData.map(row => 
      activeColumns.map(col => {
        const val = col.render ? 'Custom Cell' : row[col.key];
        return `"${String(val || '').replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${tableName}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Density row padding mapping
  const densityStyles = {
    compact: 'p-2 text-[11px]',
    default: 'p-4 text-xs sm:text-sm',
    relaxed: 'p-5.5 text-sm sm:text-base'
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div className="space-y-4 text-left">
      {/* Table Actions Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Bulk Action Controls */}
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <div className="animate-fade-in flex items-center gap-2 bg-brand-500/10 border border-brand-500/35 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider font-mono">
                {selectedIds.length} Selected
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                icon={Download} 
                onClick={handleExportCSV}
                className="!py-1 !px-2 text-[10px]"
              >
                CSV Export
              </Button>
            </div>
          )}
        </div>

        {/* Visibility / Density Filters */}
        <div className="flex items-center gap-3 ml-auto relative">
          
          {/* Density Toggle */}
          <div className="flex bg-slate-100 dark:bg-[#111827] rounded-lg p-0.5 border border-slate-200 dark:border-[#23324C]/60 text-[10px] font-bold">
            {['compact', 'default', 'relaxed'].map(d => (
              <button
                key={d}
                onClick={() => setDensity(d)}
                className={`px-2.5 py-1 rounded-md uppercase tracking-wide cursor-pointer transition-all ${
                  density === d 
                    ? 'bg-brand-500 text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Columns Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setColDropdownOpen(!colDropdownOpen)}
              className="p-2 bg-slate-100 dark:bg-[#161F30] border border-slate-200 dark:border-[#23324C] hover:border-brand-500/30 text-slate-500 dark:text-slate-300 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              title="Configure Columns"
            >
              <Settings className="h-4.5 w-4.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Columns</span>
            </button>

            {colDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setColDropdownOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#161F30] border border-slate-200 dark:border-[#23324C] rounded-2xl shadow-2xl py-3 px-4 z-50 animate-fade-in text-xs">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Column Visibility</span>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {columns.map(col => {
                      const isVisible = visibleKeys.includes(col.key);
                      return (
                        <label 
                          key={col.key}
                          className="flex items-center gap-2.5 p-1.5 hover:bg-slate-50 dark:hover:bg-[#0b0f19]/40 rounded-lg cursor-pointer text-slate-600 dark:text-slate-300 font-semibold"
                        >
                          <input 
                            type="checkbox"
                            checked={isVisible}
                            onChange={() => toggleColumn(col.key)}
                            className="h-3.5 w-3.5 rounded text-brand-500 focus:ring-brand-500 border-slate-300 dark:border-[#23324C] bg-transparent cursor-pointer"
                          />
                          <span>{col.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Main Table Container (Sticky Header and Height Caps) */}
      <div className="border border-slate-200 dark:border-[#23324C] rounded-2xl overflow-hidden bg-white dark:bg-[#161F30]/30 shadow-sm dark:shadow-inner max-h-[500px] overflow-y-auto relative">
        <table className="min-w-full text-left border-collapse text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-100 dark:bg-[#161F30] border-b border-slate-200 dark:border-[#23324C] text-[10px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 sticky top-0 z-20">
            <tr>
              {/* Select All Checkbox Header */}
              <th className="p-4 w-10 text-center">
                <button 
                  onClick={toggleSelectAll}
                  className="text-slate-400 hover:text-brand-500 transition-colors cursor-pointer"
                >
                  {isAllSelected ? (
                    <CheckSquare className="h-4.5 w-4.5 text-brand-500" />
                  ) : (
                    <Square className="h-4.5 w-4.5" />
                  )}
                </button>
              </th>

              {activeColumns.map((col) => (
                <th key={col.key} className="p-4 font-extrabold">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 dark:divide-[#23324C]/40">
            {loading ? (
              <tr>
                <td colSpan={activeColumns.length + 1} className="p-10 text-center text-slate-400">
                  <div className="w-7 h-7 border-t-2 border-brand-500 rounded-full animate-spin mx-auto mb-3"></div>
                  <span className="text-xs font-bold uppercase tracking-wider">Syncing database node...</span>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={activeColumns.length + 1} className="p-10 text-center text-slate-400 font-bold uppercase tracking-wide text-xs">
                  No records resolved.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rIdx) => {
                const rowId = row.id || rIdx;
                const isSelected = selectedIds.includes(rowId);
                
                return (
                  <tr 
                    key={rIdx} 
                    className={`transition-colors border-slate-200 dark:border-[#23324C]/30 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 ${
                      isSelected ? 'bg-brand-500/5 dark:bg-brand-500/5' : ''
                    }`}
                  >
                    {/* Row Select Checkbox */}
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => toggleSelectRow(rowId)}
                        className="text-slate-400 hover:text-brand-500 transition-colors cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4.5 w-4.5 text-brand-500" />
                        ) : (
                          <Square className="h-4.5 w-4.5" />
                        )}
                      </button>
                    </td>

                    {activeColumns.map((col) => (
                      <td key={col.key} className={`${densityStyles[density]} font-semibold text-slate-700 dark:text-slate-300`}>
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="border-t border-slate-200 dark:border-[#23324C] bg-slate-50 dark:bg-[#161F30]/50 p-4 flex items-center justify-between gap-4 text-xs font-semibold rounded-b-2xl">
          <span className="text-slate-500 dark:text-slate-400 font-semibold font-mono">
            Showing <strong className="text-slate-700 dark:text-slate-200">{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
            <strong className="text-slate-700 dark:text-slate-200">{Math.min(currentPage * itemsPerPage, data.length)}</strong> of{' '}
            <strong className="text-slate-700 dark:text-slate-200">{data.length}</strong> items
          </span>

          <div className="flex items-center space-x-1.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              icon={ChevronLeft}
            />
            
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-7 w-7 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-brand-500 text-white shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-200 border border-slate-200 dark:border-[#23324C]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              icon={ChevronRight}
              iconPosition="right"
            />
          </div>
        </div>
      )}
    </div>
  );
}
