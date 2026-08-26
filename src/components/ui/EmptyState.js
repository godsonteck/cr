'use client';

import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = '',
}) {
  return (
    <div className={`empty-state ${className}`}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
      {(actionLabel && (actionHref || onAction)) && (
        <div className="empty-state-action">
          {actionHref ? (
            <Button href={actionHref} variant="primary">
              {actionLabel}
            </Button>
          ) : (
            <Button onClick={onAction} variant="primary">
              {actionLabel}
            </Button>
          )}
        </div>
      )}
      <style jsx>{`
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: var(--space-12) var(--space-4);
          max-width: 440px;
          margin: 0 auto;
        }
        .empty-state-icon {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-full);
          background-color: var(--color-bg-alt);
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--space-4);
        }
        .empty-state-title {
          font-size: var(--text-xl);
          font-weight: var(--weight-semibold);
          color: var(--color-text);
          margin-bottom: var(--space-2);
        }
        .empty-state-desc {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
          line-height: var(--leading-relaxed);
          margin-bottom: var(--space-6);
        }
        .empty-state-action {
          margin-top: var(--space-2);
        }
      `}</style>
    </div>
  );
}
