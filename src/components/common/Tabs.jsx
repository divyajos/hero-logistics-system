import React from 'react';

export default function Tabs({
  tabs = [], // [{ id, label, icon: Icon }]
  activeTab,
  onChange,
  className = '',
}) {
  return (
    <div className={`border-b border-slate-200 flex items-center gap-1 overflow-x-auto scrollbar-none py-1 ${className}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon || null;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 border-b-2 font-extrabold text-xs transition-all whitespace-nowrap cursor-pointer select-none
              ${isActive 
                ? 'border-brand-500 text-brand-400 font-black' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-800'
              }
            `}
          >
            {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
