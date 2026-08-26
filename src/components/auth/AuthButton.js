'use client';

import React from 'react';

export default function AuthButton({
  children,
  type = 'submit',
  loading = false,
  loadingText = 'Please wait...',
  success = false,
  successText = 'Success!',
  disabled = false,
  onClick,
  variant = 'primary', // 'primary' | 'secondary' | 'dark'
}) {
  const isDisabled = disabled || loading || success;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`auth-btn auth-btn--${variant} ${loading ? 'is-loading' : ''} ${success ? 'is-success' : ''}`}
    >
      {loading && (
        <span className="auth-btn-spinner" aria-hidden="true" />
      )}
      {success && <span className="auth-btn-check">✓</span>}
      <span className="auth-btn-text">
        {loading ? loadingText : success ? successText : children}
      </span>

      <style jsx>{`
        .auth-btn {
          width: 100%;
          padding: 0.85rem 1.5rem;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          font-family: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          position: relative;
          outline: none;
          user-select: none;
        }

        .auth-btn:focus-visible {
          box-shadow: 0 0 0 3px rgba(123, 35, 71, 0.35);
        }

        /* ── Primary ── */
        .auth-btn--primary {
          background: #7B2347;
          color: #fff;
          box-shadow: 0 2px 8px rgba(123, 35, 71, 0.25);
        }
        .auth-btn--primary:hover:not(:disabled) {
          background: #5E1734;
          box-shadow: 0 4px 12px rgba(123, 35, 71, 0.35);
          transform: translateY(-1px);
        }
        .auth-btn--primary:active:not(:disabled) {
          transform: translateY(0);
        }

        /* ── Dark (Admin) ── */
        .auth-btn--dark {
          background: #1A0D14;
          color: #fff;
          border: 1px solid rgba(197, 160, 89, 0.3);
        }
        .auth-btn--dark:hover:not(:disabled) {
          background: #2D1723;
          border-color: rgba(197, 160, 89, 0.6);
        }

        /* ── Secondary ── */
        .auth-btn--secondary {
          background: #fff;
          color: #1A0D14;
          border: 1.5px solid #D8CAD0;
        }
        .auth-btn--secondary:hover:not(:disabled) {
          background: #FAF8F9;
          border-color: #7B2347;
        }

        /* ── Disabled / Loading ── */
        .auth-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none !important;
        }

        .auth-btn.is-success {
          background: #2A7A4C !important;
          color: #fff !important;
        }

        .auth-btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: btn-spin 0.6s linear infinite;
        }

        .auth-btn--secondary .auth-btn-spinner {
          border-color: rgba(123, 35, 71, 0.2);
          border-top-color: #7B2347;
        }

        @keyframes btn-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .auth-btn-check {
          font-weight: 800;
        }
      `}</style>
    </button>
  );
}
