'use client';

import React from 'react';
import Link from 'next/link';

export default function BrandLogo({ size = 'md', className = '' }) {
  const scale = size === 'sm' ? 0.85 : size === 'lg' ? 1.25 : 1;

  return (
    <Link href="/" className={`brand-logo-link ${className}`} aria-label="CR Cosmetics & Essentials">
      <div className="brand-logo-wrapper" style={{ transform: `scale(${scale})` }}>
        {/* Monogram / Mark */}
        <div className="brand-logo-mark">
          <span className="brand-mark-text">CR</span>
        </div>

        {/* Brand Name */}
        <div className="brand-title">CR COSMETICS</div>
        <div className="brand-subtitle">& ESSENTIALS • BOTWE</div>
      </div>

      <style jsx>{`
        .brand-logo-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          user-select: none;
        }
        .brand-logo-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transform-origin: center;
          transition: opacity 0.2s ease;
        }
        .brand-logo-link:hover .brand-logo-wrapper {
          opacity: 0.88;
        }
        .brand-logo-mark {
          width: 32px;
          height: 32px;
          background: var(--burgundy);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .brand-mark-text {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 700;
          color: var(--warm-white);
          letter-spacing: -0.5px;
        }
        .brand-title {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--warm-white);
          line-height: 1.1;
        }
        .brand-subtitle {
          font-family: var(--font-mono);
          font-size: 8px;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          color: var(--text-dim);
          line-height: 1;
          margin-top: 2px;
        }
      `}</style>
    </Link>
  );
}
