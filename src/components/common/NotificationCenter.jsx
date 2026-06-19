import React from 'react';
import { Bell, X, ShieldAlert, CheckCircle, Info, Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function NotificationCenter({ isOpen, onClose, notifications = [], onClear }) {
  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'alert':
        return <ShieldAlert className="h-4.5 w-4.5 text-red-400" />;
      case 'success':
        return <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />;
      default:
        return <Info className="h-4.5 w-4.5 text-brand-400" />;
    }
  };

  return (
    <>
      {/* Background layer click closure */}
      <div className="fixed inset-0 z-40" onClick={onClose}></div>

      {/* Floating Panel Box */}
      <div className="absolute right-6 top-16 w-80 sm:w-96 bg-[#161F30] border border-[#23324C] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-fade-in text-xs text-slate-300">
        
        {/* Header */}
        <div className="p-4 bg-[#0f1624]/60 border-b border-[#23324C]/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4 text-brand-400" />
            <h4 className="text-sm font-extrabold text-white">Platform System Feeds</h4>
          </div>
          <div className="flex items-center space-x-3">
            {notifications.length > 0 && (
              <button 
                onClick={onClear}
                className="text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Clear All
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* List of alerts */}
        <div className="max-h-[300px] overflow-y-auto divide-y divide-[#23324C]/40">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-medium space-y-1">
              <Bell className="h-6 w-6 mx-auto opacity-30 mb-1" />
              <p>All clean. No new feeds.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="p-4 hover:bg-slate-800/10 transition-colors flex items-start space-x-3 text-left">
                <div className="mt-0.5">{getIcon(n.type)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-extrabold text-white text-[11px] leading-tight">{n.title}</span>
                    <span className="text-[9px] text-slate-500 whitespace-nowrap flex items-center">
                      <Clock className="h-3 w-3 mr-0.5" />
                      {n.time}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 bg-[#0f1624]/20 border-t border-[#23324C]/40 text-center">
            <span className="text-[10px] font-bold text-brand-400 hover:text-brand-300 cursor-pointer">
              View All Logs
            </span>
          </div>
        )}

      </div>
    </>
  );
}
