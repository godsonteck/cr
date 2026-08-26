'use client';

import React, { useState } from 'react';

export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder = '••••••••',
  required = false,
  error,
  helperText,
  autoComplete = 'current-password',
  disabled = false,
  rightAction,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-field-group">
      <div className="auth-field-label-row">
        {label && (
          <label htmlFor={id} className="auth-field-label">
            {label}
            {required && <span className="auth-req-dot">*</span>}
          </label>
        )}
        {rightAction && <div className="auth-label-action">{rightAction}</div>}
      </div>

      <div className={`auth-input-wrapper ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''}`}>
        <span className="auth-input-icon">🔒</span>

        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          className="auth-input-control"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        />

        <button
          type="button"
          className="auth-toggle-pwd-btn"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>

      {error && (
        <div id={`${id}-error`} className="auth-field-error" role="alert">
          <span className="error-icon">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {!error && helperText && (
        <div id={`${id}-helper`} className="auth-field-helper">
          {helperText}
        </div>
      )}

      <style jsx>{`
        .auth-field-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          width: 100%;
        }

        .auth-field-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .auth-field-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #3F3338;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .auth-req-dot {
          color: #BE4D6E;
        }

        .auth-label-action {
          font-size: 0.78rem;
        }

        .auth-input-wrapper {
          display: flex;
          align-items: center;
          background: #fff;
          border: 1.5px solid #D8CAD0;
          border-radius: 8px;
          padding: 0 0.85rem;
          transition: all 0.2s ease;
        }

        .auth-input-wrapper:focus-within {
          border-color: #7B2347;
          box-shadow: 0 0 0 3px rgba(123, 35, 71, 0.12);
        }

        .auth-input-wrapper.has-error {
          border-color: #E05666;
          background: #FFF9FA;
        }

        .auth-input-wrapper.has-error:focus-within {
          box-shadow: 0 0 0 3px rgba(224, 86, 102, 0.15);
        }

        .auth-input-wrapper.is-disabled {
          background: #F5F2F4;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .auth-input-icon {
          font-size: 0.95rem;
          margin-right: 0.5rem;
          opacity: 0.6;
          display: flex;
          align-items: center;
        }

        .auth-input-control {
          flex: 1;
          border: none;
          background: transparent;
          padding: 0.75rem 0;
          font-size: 0.92rem;
          color: #1A0D14;
          font-family: inherit;
          outline: none;
          width: 100%;
        }

        .auth-input-control::placeholder {
          color: #A89CA2;
          font-size: 0.88rem;
        }

        .auth-toggle-pwd-btn {
          background: none;
          border: none;
          font-size: 0.95rem;
          padding: 0.25rem;
          cursor: pointer;
          opacity: 0.65;
          transition: opacity 0.15s;
          display: flex;
          align-items: center;
        }

        .auth-toggle-pwd-btn:hover {
          opacity: 1;
        }

        .auth-field-error {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          color: #C81E1E;
          font-weight: 500;
          margin-top: 0.15rem;
        }

        .error-icon {
          font-size: 0.8rem;
        }

        .auth-field-helper {
          font-size: 0.75rem;
          color: #8C7E84;
          margin-top: 0.15rem;
        }
      `}</style>
    </div>
  );
}
