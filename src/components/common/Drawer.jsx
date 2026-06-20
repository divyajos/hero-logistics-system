import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Drawer({ isOpen, onClose, title, children }) {
  // Prevent page body scrolling when drawer is slide-open
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0B0F19]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      ></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        {/* Sliding Panel */}
        <div className="w-screen max-w-md bg-[#161F30] border-l border-[#23324C] shadow-2xl flex flex-col justify-between animate-slide-in-right relative">
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#23324C]/60 bg-[#0f1624]/40 h-16">
            <h3 className="text-sm sm:text-base font-extrabold text-white">{title}</h3>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800/40 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 p-5 overflow-y-auto">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
}
