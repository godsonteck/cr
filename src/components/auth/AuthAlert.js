'use client';

import React from 'react';

export default function AuthAlert({ type = 'error', message, onDismiss }) {
  if (!message) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';
  const isWarning = type === 'warning';

  return (
    <div
      className={`auth-alert auth-alert--${type}`}
      role={isError ? 'alert' : 'status'}
    >
      <span className="auth-alert-icon">
        {isError && '⚠️'}
        {isSuccess && '✅'}
        {isWarning && '⏳'}
      </span>
      <div className="auth-alert-content">
        <p>{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="auth-alert-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss alert"
        >
          ×
        </button>
      )}

      <style jsx>{`
        .auth-alert {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          line-height: 1.45;
          animation: alert-slide 0.25s ease-out;
        }

        .auth-alert--error {
          background: #FEF2F2;
          border: 1px solid #FCA5A5;
          color: #991B1B;
        }

        .auth-alert--success {
          background: #F0FDF4;
          border: 1px solid #86EFAC;
          color: #166534;
        }

        .auth-alert--warning {
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          color: #92400E;
        }

        .auth-alert-icon {
          font-size: 1rem;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .auth-alert-content {
          flex: 1;
        }

        .auth-alert-content p {
          margin: 0;
          color: inherit;
          font-size: inherit;
        }

        .auth-alert-dismiss {
          background: none;
          border: none;
          font-size: 1.25rem;
          color: inherit;
          opacity: 0.6;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          margin-left: 0.25rem;
        }

        .auth-alert-dismiss:hover {
          opacity: 1;
        }

        @keyframes alert-slide {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
