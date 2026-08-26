'use client';

import React, { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    type = 'text',
    id,
    name,
    required = false,
    className = '',
    containerClassName = '',
    icon,
    ...props
  },
  ref
) {
  const inputId = id || name;

  return (
    <div className={`form-group ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label} {required && <span className="required-star">*</span>}
        </label>
      )}
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          required={required}
          className={`form-input ${icon ? 'has-icon' : ''} ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      {!error && helperText && <p className="form-helper">{helperText}</p>}
    </div>
  );
});

export default Input;
