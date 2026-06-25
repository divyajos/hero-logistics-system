import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  // Prevent body scroll when modal is open
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

  return createPortal(
    <div className="fixed inset-0 h-screen max-h-screen z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0B0F19]/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
 
      {/* Modal Dialog Content */}
      <div className="bg-[#161F30] border border-[#23324C] rounded-2xl w-full max-w-lg shadow-2xl relative z-10 animate-fade-in overflow-hidden flex flex-col max-h-full md:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#23324C]/60 bg-[#0f1624]/40 flex-shrink-0">
          <h3 className="text-sm sm:text-base font-extrabold text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800/40 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
 
        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
