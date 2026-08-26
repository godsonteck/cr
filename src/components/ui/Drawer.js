'use client';

import React, { useEffect } from 'react';

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'right', // 'right' | 'left'
  maxWidth = '420px',
  footer,
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
    <div className="drawer-root" role="dialog" aria-modal="true" aria-label={title}>
      <div className="drawer-backdrop" onClick={onClose} />
      <div
        className={`drawer-panel drawer-${position}`}
        style={{ maxWidth }}
      >
        <div className="drawer-header">
          {title && <h3 className="drawer-title">{title}</h3>}
          <button
            onClick={onClose}
            className="drawer-close-btn"
            aria-label="Close drawer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-footer">{footer}</div>}
      </div>

      <style jsx>{`
        .drawer-root {
          position: fixed;
          inset: 0;
          z-index: var(--z-modal);
          display: flex;
        }
        .drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          animation: fadeIn var(--duration-fast) var(--ease-out);
        }
        .drawer-panel {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
          background: var(--color-surface);
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-overlay);
        }
        .drawer-right {
          margin-left: auto;
          animation: slideInRight var(--duration-normal) var(--ease-out);
        }
        .drawer-left {
          margin-right: auto;
          animation: slideInLeft var(--duration-normal) var(--ease-out);
        }
        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-6);
          border-bottom: 1px solid var(--color-border-light);
        }
        .drawer-title {
          font-size: var(--text-lg);
          font-weight: var(--weight-semibold);
          color: var(--color-text);
          margin: 0;
        }
        .drawer-close-btn {
          background: none;
          border: none;
          color: var(--color-text-secondary);
          padding: var(--space-1);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color var(--duration-fast), background-color var(--duration-fast);
        }
        .drawer-close-btn:hover {
          color: var(--color-text);
          background-color: var(--color-bg-alt);
        }
        .drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-6);
        }
        .drawer-footer {
          padding: var(--space-4) var(--space-6);
          border-top: 1px solid var(--color-border-light);
          background: var(--color-bg-alt);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
