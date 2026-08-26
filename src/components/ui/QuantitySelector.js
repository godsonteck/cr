'use client';

import React from 'react';

export default function QuantitySelector({
  value = 1,
  min = 1,
  max = 99,
  onChange,
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
}) {
  const handleDecrement = () => {
    if (value > min && !disabled) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max && !disabled) {
      onChange(value + 1);
    }
  };

  const handleDirectChange = (e) => {
    const parsed = parseInt(e.target.value, 10);
    if (isNaN(parsed)) return;
    const clamped = Math.max(min, Math.min(max, parsed));
    onChange(clamped);
  };

  return (
    <div className={`qty-selector qty-${size} ${disabled ? 'qty-disabled' : ''}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="qty-btn qty-minus"
        aria-label="Decrease quantity"
      >
        <svg width="12" height="2" viewBox="0 0 12 2" fill="currentColor">
          <rect width="12" height="2" rx="1" />
        </svg>
      </button>
      <input
        type="number"
        value={value}
        onChange={handleDirectChange}
        min={min}
        max={max}
        disabled={disabled}
        className="qty-input"
        aria-label="Quantity"
      />
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="qty-btn qty-plus"
        aria-label="Increase quantity"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M5 5V1a1 1 0 012 0v4h4a1 1 0 110 2H7v4a1 1 0 11-2 0V7H1a1 1 0 110-2h4z" />
        </svg>
      </button>
      <style jsx>{`
        .qty-selector {
          display: inline-flex;
          align-items: center;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-surface);
          overflow: hidden;
        }
        .qty-sm {
          height: 32px;
        }
        .qty-md {
          height: 42px;
        }
        .qty-lg {
          height: 48px;
        }
        .qty-btn {
          width: 36px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text);
          background: transparent;
          border: none;
          transition: background-color var(--duration-fast), color var(--duration-fast);
        }
        .qty-btn:hover:not(:disabled) {
          background-color: var(--color-bg-alt);
          color: var(--color-primary);
        }
        .qty-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .qty-input {
          width: 44px;
          height: 100%;
          text-align: center;
          border: none;
          background: transparent;
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
          -moz-appearance: textfield;
        }
        .qty-input::-webkit-outer-spin-button,
        .qty-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .qty-disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
