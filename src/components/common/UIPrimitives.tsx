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
    terracotta: 'bg-[var(--accent)] text-white font-medium',
    botanical: 'bg-[var(--olive)] text-white font-medium',
    espresso: 'bg-[var(--text-primary)] text-[var(--bg-card)] font-medium',
    gold: 'bg-[#d9b26d] text-[#2a1d20] font-semibold',
    secondary: 'bg-[var(--bg-soft)] text-[var(--text-primary)] font-medium',
    outline: 'border border-[var(--border-color)] text-[var(--text-muted)] dark:text-[var(--text-primary)] font-medium'
  };

  return (
    <span className={`inline-flex items-center rounded-full uppercase tracking-wider font-semibold transition-all ${sizeStyles} ${variantStyles[variant]} ${className}`}>
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
    sm: 'px-3 py-1.5 text-xs font-semibold',
    md: 'px-5 py-2.5 text-sm font-semibold',
    lg: 'px-7 py-3.5 text-base font-bold'
  };

  const variantStyles = {
    primary: 'bg-[var(--text-primary)] text-[var(--bg-card)] hover:opacity-90 shadow-sm',
    secondary: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] shadow-sm',
    botanical: 'bg-[var(--olive)] text-white hover:bg-[var(--olive-strong)] shadow-sm',
    outline: 'border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-soft)]',
    ghost: 'text-[var(--text-primary)] hover:bg-[var(--bg-soft)]',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
};
