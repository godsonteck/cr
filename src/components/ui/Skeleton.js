'use client';

import React from 'react';

export default function Skeleton({
  variant = 'rect', // 'rect' | 'circle' | 'text'
  width,
  height,
  borderRadius,
  className = '',
  style = {},
}) {
  const inlineStyles = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '100%'),
    borderRadius:
      borderRadius ||
      (variant === 'circle'
        ? '50%'
        : variant === 'text'
        ? 'var(--radius-sm)'
        : 'var(--radius-md)'),
    ...style,
  };

  return (
    <div
      className={`skeleton-base skeleton-${variant} ${className}`}
      style={inlineStyles}
      aria-hidden="true"
    >
      <style jsx>{`
        .skeleton-base {
          background: linear-gradient(
            90deg,
            var(--color-bg-alt) 25%,
            var(--color-border-light) 37%,
            var(--color-bg-alt) 63%
          );
          background-size: 400% 100%;
          animation: skeletonShimmer 1.4s ease infinite;
        }
        @keyframes skeletonShimmer {
          0% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0 50%;
          }
        }
      `}</style>
    </div>
  );
}
