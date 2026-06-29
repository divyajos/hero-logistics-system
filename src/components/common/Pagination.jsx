import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-[#0f1624]/20 rounded-b-xl gap-4 ${className}`}>
      <span className="text-[10px] text-slate-500 font-semibold font-mono">
        PAGE {currentPage} OF {totalPages}
      </span>
      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          icon={ChevronLeft}
        />
        
        {Array.from({ length: totalPages }).map((_, i) => {
          const pageNum = i + 1;
          const isActive = currentPage === pageNum;
          
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`
                h-7 w-7 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer
                ${isActive 
                  ? 'bg-brand-500 text-slate-900 shadow-md shadow-brand-500/10' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-[#1F2937]/50 border border-slate-200'
                }
              `}
            >
              {pageNum}
            </button>
          );
        })}

        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          icon={ChevronRight}
          iconPosition="right"
        />
      </div>
    </div>
  );
}
