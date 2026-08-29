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
    terracotta: 'bg-[#C86D51] text-white font-medium',
    botanical: 'bg-[#4A5D4E] text-white font-medium',
    espresso: 'bg-[#1C1817] text-white font-medium dark:bg-amber-100 dark:text-gray-950',
    gold: 'bg-[#D4AF37] text-gray-950 font-semibold',
    secondary: 'bg-[#F5F0EB] text-[#1C1817] dark:bg-stone-800 dark:text-stone-200 font-medium',
    outline: 'border border-[#E6DFD7] text-[#6E6763] dark:border-stone-700 dark:text-stone-300 font-medium'
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
    primary: 'bg-[#1C1817] text-white hover:bg-[#342F2D] dark:bg-[#F5F0EB] dark:text-[#1C1817] dark:hover:bg-white shadow-sm',
    secondary: 'bg-[#C86D51] text-white hover:bg-[#b05d43] shadow-sm',
    botanical: 'bg-[#4A5D4E] text-white hover:bg-[#3b4b3e] shadow-sm',
    outline: 'border border-[#E6DFD7] text-[#1C1817] hover:bg-[#F5F0EB] dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800',
    ghost: 'text-[#1C1817] hover:bg-[#F5F0EB] dark:text-stone-200 dark:hover:bg-stone-800',
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
