import React from 'react';
import { Loader } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary', // primary, secondary, danger, outline
  size = 'md', // sm, md, lg
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-wide rounded-xl transition-all duration-300 transform active:scale-[0.97] hover:scale-[1.03] cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0B0B]';
  
  const variants = {
    primary: 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-slate-950 shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/35 focus:ring-brand-500 border border-transparent',
    secondary: 'bg-[#1F1F1F] hover:bg-[#2E2E2E] text-slate-200 border border-[#2E2E2E] focus:ring-slate-500',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 focus:ring-red-500 border border-transparent',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/35 focus:ring-emerald-500 border border-transparent',
    purple: 'bg-gradient-to-r from-purple-500 to-indigo-650 hover:from-purple-600 hover:to-indigo-750 text-white shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/35 focus:ring-purple-500 border border-transparent',
    info: 'bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/35 focus:ring-blue-500 border border-transparent',
    outline: 'bg-transparent hover:bg-brand-500/10 text-brand-400 border border-brand-500/25 focus:ring-brand-500'
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-[11px] gap-1.5',
    md: 'px-5 py-2.5 text-xs gap-2.5',
    lg: 'px-7 py-3.5 text-sm gap-3'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${isDisabled ? 'opacity-50 cursor-not-allowed shadow-none' : ''} 
        ${className}
      `}
      {...props}
    >
      {loading && <Loader className="h-4 w-4 animate-spin flex-shrink-0" />}
      
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className={`${size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} flex-shrink-0`} />
      )}
      
      <span>{children}</span>
      
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={`${size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} flex-shrink-0`} />
      )}
    </button>
  );
}
