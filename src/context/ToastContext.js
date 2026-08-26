'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 3500 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast = { id, title, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item toast-${toast.type}`}>
            <div className="toast-content">
              {toast.title && <div className="toast-title">{toast.title}</div>}
              {toast.message && <div className="toast-message">{toast.message}</div>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="toast-close"
              aria-label="Close notification"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <style jsx>{`
        .toast-container {
          position: fixed;
          bottom: var(--space-6);
          right: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          z-index: var(--z-toast);
          max-width: 380px;
          width: calc(100% - var(--space-8));
          pointer-events: none;
        }
        .toast-item {
          pointer-events: auto;
          background: var(--color-surface);
          color: var(--color-text);
          border: 1px solid var(--color-border);
          border-left: 4px solid var(--color-primary);
          border-radius: var(--radius-md);
          padding: var(--space-3) var(--space-4);
          box-shadow: var(--shadow-lg);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-3);
          animation: slideUp 0.25s var(--ease-out);
        }
        .toast-success {
          border-left-color: var(--color-success);
        }
        .toast-error {
          border-left-color: var(--color-error);
        }
        .toast-warning {
          border-left-color: var(--color-warning);
        }
        .toast-content {
          flex: 1;
        }
        .toast-title {
          font-weight: var(--weight-semibold);
          font-size: var(--text-sm);
          margin-bottom: 2px;
        }
        .toast-message {
          font-size: var(--text-xs);
          color: var(--color-text-secondary);
          line-height: 1.4;
        }
        .toast-close {
          background: none;
          border: none;
          font-size: 18px;
          line-height: 1;
          color: var(--color-text-tertiary);
          cursor: pointer;
          padding: 0 4px;
        }
        .toast-close:hover {
          color: var(--color-text);
        }
        @keyframes slideUp {
          from {
            transform: translateY(12px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
