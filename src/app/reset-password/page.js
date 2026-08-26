'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import PasswordInput from '@/components/auth/PasswordInput';
import PasswordStrength from '@/components/auth/PasswordStrength';
import AuthButton from '@/components/auth/AuthButton';
import AuthAlert from '@/components/auth/AuthAlert';
import { validateResetToken, resetPasswordWithToken } from '@/services/authService';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [tokenStatus, setTokenStatus] = useState('CHECKING'); // 'CHECKING' | 'VALID' | 'INVALID' | 'EXPIRED'
  const [userEmail, setUserEmail] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setTokenStatus('INVALID');
        return;
      }
      const res = await validateResetToken(token);
      if (res.valid) {
        setTokenStatus('VALID');
        setUserEmail(res.email);
      } else {
        setTokenStatus(res.reason || 'INVALID');
      }
    }
    verify();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!password || password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      await resetPasswordWithToken({ token, newPassword: password });
      setSuccess(true);
      setTimeout(() => {
        router.push('/signin');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password. Please request a new link.');
    } finally {
      setLoading(false);
    }
  };

  // ── Expired / Invalid Token State ──
  if (tokenStatus === 'INVALID' || tokenStatus === 'EXPIRED') {
    const isExpired = tokenStatus === 'EXPIRED';
    return (
      <AuthLayout
        title={isExpired ? 'Reset link expired' : 'Invalid reset link'}
        subtitle={
          isExpired
            ? 'For security reasons, password reset links expire after 2 hours.'
            : 'This password reset link is invalid or has already been used.'
        }
        imageSrc="/images/hero-pedestal.jpg"
        badgeText="Account Recovery"
      >
        <div className="token-error-card">
          <div className="token-error-icon">⌛</div>
          <p>
            {isExpired
              ? 'Please request a new reset link to choose a new password.'
              : 'Please make sure you copied the complete link or request a fresh one.'}
          </p>

          <Link href="/forgot-password" className="btn-req-new">
            Request New Reset Link →
          </Link>

          <Link href="/signin" className="btn-back-link">
            Return to Sign In
          </Link>
        </div>

        <style jsx>{`
          .token-error-card {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
            align-items: center;
            text-align: center;
          }
          .token-error-icon {
            font-size: 2.5rem;
          }
          .token-error-card p {
            font-size: 0.88rem;
            color: #7A6E73;
            margin: 0;
            line-height: 1.5;
          }
          .btn-req-new {
            width: 100%;
            padding: 0.85rem;
            background: #7B2347;
            color: #fff;
            border-radius: 8px;
            font-size: 0.95rem;
            font-weight: 600;
            text-decoration: none;
            text-align: center;
            transition: background 0.15s;
          }
          .btn-req-new:hover {
            background: #5E1734;
          }
          .btn-back-link {
            font-size: 0.85rem;
            color: #7B2347;
            text-decoration: none;
            font-weight: 600;
          }
          .btn-back-link:hover {
            text-decoration: underline;
          }
        `}</style>
      </AuthLayout>
    );
  }

  // ── Checking state ──
  if (tokenStatus === 'CHECKING') {
    return (
      <AuthLayout
        title="Verifying security link..."
        subtitle="Please wait while we validate your one-time recovery token."
        imageSrc="/images/hero-pedestal.jpg"
      >
        <div style={{ textAlign: 'center', padding: '2rem', color: '#7A6E73' }}>
          <div className="auth-spinner-loader" />
          <p style={{ marginTop: '1rem', fontSize: '0.88rem' }}>Validating reset token...</p>
        </div>
        <style jsx>{`
          .auth-spinner-loader {
            width: 32px;
            height: 32px;
            border: 3px solid #EBE4E8;
            border-top-color: #7B2347;
            border-radius: 50%;
            margin: 0 auto;
            animation: spin 0.7s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create new password"
      subtitle={`Choose a strong new password for ${userEmail || 'your account'}.`}
      imageSrc="/images/hero-pedestal.jpg"
      badgeText="Secure Password Update"
      quote="“Your new password will take effect immediately across all your shopping devices.”"
      quoteAuthor="CR Security"
    >
      <form onSubmit={handleSubmit} className="auth-form-stack" noValidate>
        {errorMsg && (
          <AuthAlert
            type="error"
            message={errorMsg}
            onDismiss={() => setErrorMsg('')}
          />
        )}

        {success && (
          <AuthAlert
            type="success"
            message="Password reset successfully! Redirecting you to sign in..."
          />
        )}

        <PasswordInput
          id="auth-reset-new"
          label="New Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errorMsg) setErrorMsg('');
          }}
          placeholder="At least 8 characters"
          required
          autoComplete="new-password"
          disabled={loading || success}
        />

        {password && <PasswordStrength password={password} />}

        <PasswordInput
          id="auth-reset-confirm"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errorMsg) setErrorMsg('');
          }}
          placeholder="Re-enter new password"
          required
          autoComplete="new-password"
          disabled={loading || success}
        />

        <AuthButton
          type="submit"
          loading={loading}
          loadingText="Updating password..."
          success={success}
          successText="Password updated!"
          disabled={loading || success}
        >
          Reset Password
        </AuthButton>
      </form>

      <style jsx>{`
        .auth-form-stack {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
      `}</style>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
