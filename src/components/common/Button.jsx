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
  const baseStyles = 'inline-flex items-center justify-center font-extrabold rounded-xl transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F19]';
  
  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/20 hover:shadow-brand-500/35 focus:ring-brand-500 border border-transparent',
    secondary: 'bg-[#1F2937]/80 hover:bg-[#1F2937] text-slate-200 border border-[#23324C] focus:ring-slate-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/35 focus:ring-red-500 border border-transparent',
    outline: 'bg-transparent hover:bg-brand-500/10 text-brand-400 border border-brand-500/25 focus:ring-brand-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[11px] gap-1.5',
    md: 'px-4.5 py-2.5 text-xs gap-2',
    lg: 'px-6 py-3.5 text-sm gap-2.5'
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
