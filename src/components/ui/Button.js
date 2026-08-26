'use client';

import React from 'react';
import Link from 'next/link';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  fullWidth = false,
  href,
  onClick,
  disabled = false,
  type = 'button',
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) {
  const baseClasses = `btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClasses} {...props}>
        {icon && iconPosition === 'left' && <span className="btn-icon">{icon}</span>}
        <span>{children}</span>
        {icon && iconPosition === 'right' && <span className="btn-icon">{icon}</span>}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="btn-icon">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="btn-icon">{icon}</span>}
    </button>
  );
}
