'use client';

import React, { useState } from 'react';

export default function GoogleAuthButton({
  onSuccess,
  onError,
  text = 'Continue with Google',
  disabled = false,
  signInWithGoogle,
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || loading) return;
    setLoading(true);
    try {
      if (signInWithGoogle) {
        const user = await signInWithGoogle();
        if (onSuccess) onSuccess(user);
      }
    } catch (err) {
      if (onError) onError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="btn-google-auth"
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={text}
    >
      {loading ? (
        <span className="google-spinner" aria-hidden="true" />
      ) : (
        <svg className="google-icon" width="18" height="18" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.35 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
      )}
      <span className="google-btn-text">{loading ? 'Connecting with Google...' : text}</span>

      <style jsx>{`
        .btn-google-auth {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.8rem 1.25rem;
          background: #ffffff;
          border: 1.5px solid #D8CAD0;
          border-radius: 8px;
          color: #2D1E24;
          font-family: inherit;
          font-size: 0.92rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .btn-google-auth:hover:not(:disabled) {
          background: #FAF8F9;
          border-color: #7B2347;
          box-shadow: 0 2px 6px rgba(123, 35, 71, 0.1);
        }

        .btn-google-auth:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .google-icon {
          flex-shrink: 0;
        }

        .google-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #EBE4E8;
          border-top-color: #4285F4;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </button>
  );
}
