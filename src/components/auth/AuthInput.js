'use client';

import React from 'react';

export default function AuthInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error,
  helperText,
  icon,
  prefix,
  autoComplete,
  disabled = false,
}) {
  return (
    <div className="auth-field-group">
      {label && (
        <div className="auth-field-label-row">
          <label htmlFor={id} className="auth-field-label">
            {label}
            {required && <span className="auth-req-dot">*</span>}
          </label>
        </div>
      )}

      <div className={`auth-input-wrapper ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''}`}>
        {prefix && <span className="auth-input-prefix">{prefix}</span>}
        {icon && !prefix && <span className="auth-input-icon">{icon}</span>}

        <input
          id={id}
          type={type}
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

        .auth-input-prefix {
          font-size: 0.88rem;
          font-weight: 600;
          color: #7B2347;
          padding-right: 0.5rem;
          border-right: 1px solid #EBE4E8;
          margin-right: 0.5rem;
          user-select: none;
        }

        .auth-input-icon {
          font-size: 1rem;
          color: #9C8E94;
          margin-right: 0.5rem;
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
