'use client';

import React from 'react';
import Link from 'next/link';

export default function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="breadcrumb-nav">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <Link href="/" className="breadcrumb-link">Home</Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="breadcrumb-item">
              <span className="breadcrumb-separator">/</span>
              {isLast || !item.href ? (
                <span className="breadcrumb-current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="breadcrumb-link">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      <style jsx>{`
        .breadcrumb-nav {
          padding: var(--space-4) 0;
        }
        .breadcrumb-list {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--space-2);
          font-size: var(--text-sm);
        }
        .breadcrumb-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .breadcrumb-link {
          color: var(--color-text-secondary);
          transition: color var(--duration-fast);
        }
        .breadcrumb-link:hover {
          color: var(--color-primary);
        }
        .breadcrumb-separator {
          color: var(--color-text-tertiary);
          font-size: var(--text-xs);
        }
        .breadcrumb-current {
          color: var(--color-text);
          font-weight: var(--weight-medium);
        }
      `}</style>
    </nav>
  );
}
