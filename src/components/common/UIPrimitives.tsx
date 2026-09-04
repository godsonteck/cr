import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'terracotta' | 'botanical' | 'espresso' | 'gold' | 'outline' | 'secondary';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'espresso',
  className = '',
  size = 'md'
}) => {
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  const variantStyles = {
    terracotta: 'bg-[#b85b40] text-white font-bold',
    botanical: 'bg-[#2e4c36] text-white font-bold',
    espresso: 'bg-[#181214] text-white dark:bg-[#d5e5fc] dark:text-slate-950 font-bold',
    gold: 'bg-[#d49e35] text-[#181214] font-bold',
    secondary: 'bg-[var(--bg-soft)] text-[var(--text-primary)] border border-[var(--border-color)] font-semibold',
    outline: 'border border-[var(--border-color)] text-[var(--text-primary)] font-semibold'
  };

  return (
    <span className={`inline-flex items-center rounded-full uppercase tracking-wider transition-all ${sizeStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'botanical' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'min-h-10 px-3.5 py-2 text-xs font-semibold',
    md: 'min-h-11 px-5 py-2.5 text-sm font-semibold',
    lg: 'min-h-12 px-7 py-3.5 text-base font-bold'
  };

  const variantStyles = {
    primary: 'bg-[#181214] text-white hover:bg-[#2d2125] dark:bg-[#4a85f6] dark:text-slate-950 dark:hover:bg-[#6398fb] font-bold shadow-sm',
    secondary: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] font-semibold shadow-sm',
    botanical: 'bg-[#2e4c36] text-white hover:bg-[#233b2a] font-semibold shadow-sm',
    outline: 'border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-soft)] font-semibold',
    ghost: 'text-[var(--text-primary)] hover:bg-[var(--bg-soft)] font-semibold',
    danger: 'bg-red-600 text-white hover:bg-red-700 font-semibold'
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
};
