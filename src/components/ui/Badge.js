'use client';

import React from 'react';

export default function Badge({
  children,
  variant = 'default', // 'default' | 'sale' | 'new' | 'outOfStock' | 'success' | 'warning' | 'info'
  size = 'md', // 'sm' | 'md'
  className = '',
}) {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`}>
      {children}
    </span>
  );
}
