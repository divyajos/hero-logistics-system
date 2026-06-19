import React from 'react';

export default function SelectInput({
  label,
  error,
  options = [], // [{ value, label }]
  className = '',
  id,
  placeholder,
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
      <select
        id={id}
        className={`
          block w-full px-4 py-3 bg-[#111827] text-slate-200 text-xs rounded-xl focus:outline-none cursor-pointer transition-all duration-200
          ${error 
            ? 'border border-red-500/50 focus:ring-1 focus:ring-red-500 focus:border-red-500' 
            : 'border border-[#23324C] focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
          }
        `}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-[10px] font-semibold text-red-400 animate-fade-in">{error}</p>
      )}
    </div>
  );
}
