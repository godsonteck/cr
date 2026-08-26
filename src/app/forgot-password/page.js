'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';
import AuthAlert from '@/components/auth/AuthAlert';
import { requestPasswordReset, isValidEmail } from '@/services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [simulatedToken, setSimulatedToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await requestPasswordReset(email.trim());
      setSubmitted(true);
      if (res.simulatedToken) {
        setSimulatedToken(res.simulatedToken);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Unable to process your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter the email associated with your account and we’ll send you a password reset link."
      imageSrc="/images/hero-pedestal.jpg"
      badgeText="Account Recovery"
      quote="“Security and peace of mind. We protect your personal data with verified privacy standards.”"
      quoteAuthor="CR Cosmetics Security Team"
      footerPrompt="Remember your password?"
      footerLinkText="Sign in instead"
      footerLinkHref="/signin"
    >
      {submitted ? (
        <div className="reset-sent-card">
          <div className="reset-icon-badge">📬</div>
          <h3>Check your inbox</h3>
          <p>
            If an account exists for <strong>{email}</strong>, we have sent instructions to reset your password.
          </p>

          <div className="recovery-tip-box">
            <span>💡</span>
            <div>
              <strong>Didn’t receive the email?</strong>
              <p>Check your spam/junk folder or wait a couple of minutes before requesting another link.</p>
            </div>
          </div>

          {/* Development / Demo Quick Reset Link */}
          {simulatedToken && (
            <div className="dev-token-box">
              <span className="dev-token-badge">Demo Fast-Track</span>
              <p>For instant testing without email delivery:</p>
              <Link
                href={`/reset-password?token=${simulatedToken}`}
                className="btn-dev-reset"
              >
                Open Password Reset Page →
              </Link>
            </div>
          )}

          <div className="reset-actions">
            <button
              type="button"
              className="btn-resend"
              onClick={() => {
                setSubmitted(false);
                setSimulatedToken(null);
              }}
            >
              Try another email
            </button>
            <Link href="/signin" className="btn-back-signin">
              ← Return to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form-stack" noValidate>
          {errorMsg && (
            <AuthAlert
              type="error"
              message={errorMsg}
              onDismiss={() => setErrorMsg('')}
            />
          )}

          <AuthInput
            id="auth-forgot-email"
            label="Your Email Address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="e.g. nana.ama@gmail.com"
            required
            autoComplete="email"
            disabled={loading}
            icon="✉️"
            helperText="We will send a secure one-time reset link valid for 2 hours."
          />

          <AuthButton
            type="submit"
            loading={loading}
            loadingText="Sending reset link..."
            disabled={loading}
          >
            Send Reset Link
          </AuthButton>
        </form>
      )}

      <style jsx>{`
        .auth-form-stack {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .reset-sent-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          text-align: center;
          align-items: center;
        }

        .reset-icon-badge {
          width: 56px;
          height: 56px;
          background: #FDF5F8;
          color: #7B2347;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
        }

        .reset-sent-card h3 {
          font-family: var(--font-display, serif);
          font-size: 1.4rem;
          color: #1A0D14;
          margin: 0;
        }

        .reset-sent-card p {
          font-size: 0.88rem;
          color: #7A6E73;
          margin: 0;
          line-height: 1.5;
        }

        .recovery-tip-box {
          background: #FAF8F9;
          border: 1px solid #EBE4E8;
          border-radius: 8px;
          padding: 0.85rem 1rem;
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          text-align: left;
          width: 100%;
          font-size: 0.8rem;
        }

        .recovery-tip-box strong {
          color: #1A0D14;
          display: block;
        }

        .recovery-tip-box p {
          font-size: 0.75rem;
          color: #7A6E73;
          margin: 0.15rem 0 0 0;
        }

        .dev-token-box {
          background: #EFF6FF;
          border: 1px dashed #93C5FD;
          border-radius: 8px;
          padding: 0.85rem;
          width: 100%;
          text-align: left;
        }

        .dev-token-badge {
          display: inline-block;
          background: #2563EB;
          color: #fff;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .dev-token-box p {
          font-size: 0.75rem;
          color: #1E40AF;
          margin: 0.35rem 0 0.5rem 0;
        }

        .btn-dev-reset {
          display: inline-block;
          background: #2563EB;
          color: #fff;
          padding: 0.4rem 0.85rem;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          text-decoration: none;
        }

        .btn-dev-reset:hover {
          background: #1D4ED8;
        }

        .reset-actions {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          width: 100%;
          margin-top: 0.5rem;
        }

        .btn-resend {
          background: #fff;
          border: 1.5px solid #D8CAD0;
          padding: 0.65rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #55484E;
          cursor: pointer;
        }

        .btn-resend:hover {
          border-color: #7B2347;
          color: #7B2347;
        }

        .btn-back-signin {
          font-size: 0.85rem;
          color: #7B2347;
          text-decoration: none;
          font-weight: 600;
        }

        .btn-back-signin:hover {
          text-decoration: underline;
        }
      `}</style>
    </AuthLayout>
  );
}
