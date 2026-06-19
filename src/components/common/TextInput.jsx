import React from 'react';

export default function TextInput({
  label,
  error,
  icon: Icon = null,
  className = '',
  id,
  ...props
}) {
  return (
    <div className={`space-y-1.5 text-left w-full ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-xs font-semibold text-slate-400 uppercase tracking-wide"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <input
          id={id}
          className={`
            block w-full px-4 py-3 bg-[#111827]/80 text-slate-200 text-xs rounded-xl focus:outline-none transition-all duration-200
            ${Icon ? 'pl-10' : ''}
            ${error 
              ? 'border border-red-500/50 focus:ring-1 focus:ring-red-500 focus:border-red-500' 
              : 'border border-[#23324C] focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
            }
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[10px] font-semibold text-red-400 animate-fade-in">{error}</p>
      )}
    </div>
  );
}
