'use client';

import React from 'react';

export default function AuthDivider({ text = 'or continue with' }) {
  return (
    <div className="auth-divider">
      <div className="divider-line" />
      <span className="divider-text">{text}</span>
      <div className="divider-line" />

      <style jsx>{`
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 0.25rem 0;
          user-select: none;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #EBE4E8;
        }

        .divider-text {
          font-size: 0.78rem;
          color: #8C7E84;
          font-weight: 500;
          text-transform: lowercase;
        }
      `}</style>
    </div>
  );
}
