'use client';

import React, { useEffect } from 'react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '500px',
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('scroll-locked');
    } else {
      document.body.classList.remove('scroll-locked');
    }
    return () => {
      document.body.classList.remove('scroll-locked');
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-root" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-container">
        <div className="modal-panel" style={{ maxWidth }}>
          <div className="modal-header">
            {title && <h3 className="modal-title">{title}</h3>}
            <button
              onClick={onClose}
              className="modal-close-btn"
              aria-label="Close modal"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>

      <style jsx>{`
        .modal-root {
          position: fixed;
          inset: 0;
          z-index: var(--z-modal);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
        }
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          animation: fadeIn var(--duration-fast) var(--ease-out);
        }
        .modal-container {
          position: relative;
          z-index: 1;
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .modal-panel {
          width: 100%;
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-overlay);
          overflow: hidden;
          animation: scaleIn var(--duration-normal) var(--ease-out);
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-6);
          border-bottom: 1px solid var(--color-border-light);
        }
        .modal-title {
          font-size: var(--text-lg);
          font-weight: var(--weight-semibold);
          color: var(--color-text);
          margin: 0;
        }
        .modal-close-btn {
          background: none;
          border: none;
          color: var(--color-text-secondary);
          padding: var(--space-1);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .modal-close-btn:hover {
          color: var(--color-text);
          background-color: var(--color-bg-alt);
        }
        .modal-body {
          padding: var(--space-6);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
