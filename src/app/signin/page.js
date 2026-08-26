'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import PasswordInput from '@/components/auth/PasswordInput';
import AuthButton from '@/components/auth/AuthButton';
import AuthAlert from '@/components/auth/AuthAlert';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import AuthDivider from '@/components/auth/AuthDivider';
import { useAuth } from '@/context/AuthContext';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/account';

  const { customer, signInCustomer, signInWithGoogle } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  // If already authenticated as customer, redirect to target
  useEffect(() => {
    if (customer && !loading) {
      router.replace(redirectTarget);
    }
  }, [customer, loading, redirectTarget, router]);

  const handleGoogleSuccess = () => {
    setSuccess(true);
    setTimeout(() => {
      router.push(redirectTarget);
    }, 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Please enter your email address or phone number.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      await signInCustomer({
        identifier: identifier.trim(),
        password,
        rememberMe,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push(redirectTarget);
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || 'We could not sign you in. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to track orders, manage your wishlist, and checkout faster."
      imageSrc="/images/hero-pedestal.jpg"
      badgeText="CR Customer Portal"
      quote="“Self-care is a daily luxury you deserve. Verified skincare made accessible right here in Ghana.”"
      quoteAuthor="CR Cosmetics & Essentials"
      footerPrompt="New to CR Cosmetics?"
      footerLinkText="Create an account"
      footerLinkHref={`/signup${redirectTarget !== '/account' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
    >
      <div className="auth-form-stack">
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
            message="Sign in successful! Redirecting you now..."
          />
        )}

        {/* ── Google Sign In ── */}
        <GoogleAuthButton
          signInWithGoogle={signInWithGoogle}
          onSuccess={handleGoogleSuccess}
          onError={(err) => setErrorMsg(err)}
          disabled={loading || success}
          text="Sign in with Google"
        />

        <AuthDivider text="or sign in with email/phone" />

        <form onSubmit={handleSubmit} className="auth-form-stack" noValidate>
          <AuthInput
            id="auth-identifier"
            label="Email or Phone Number"
            type="text"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="e.g. 0592153306 or name@gmail.com"
            required
            autoComplete="username"
            disabled={loading || success}
            icon="👤"
          />

          <PasswordInput
            id="auth-password"
            label="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            disabled={loading || success}
            rightAction={
              <Link href="/forgot-password" className="auth-inline-link">
                Forgot password?
              </Link>
            }
          />

          <div className="auth-remember-row">
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading || success}
              />
              <span>Keep me signed in</span>
            </label>
          </div>

          <AuthButton
            type="submit"
            loading={loading}
            loadingText="Signing in..."
            success={success}
            successText="Signed in!"
            disabled={loading || success}
          >
            Sign In
          </AuthButton>
        </form>

        
      </div>

      <style jsx>{`
        .auth-form-stack {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .auth-remember-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .auth-checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #55484E;
          cursor: pointer;
          user-select: none;
        }

        .auth-checkbox-label input[type='checkbox'] {
          accent-color: #7B2347;
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .auth-inline-link {
          color: #7B2347;
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 600;
        }

        .auth-inline-link:hover {
          text-decoration: underline;
        }

        .auth-demo-card {
          margin-top: 0.5rem;
          background: #FAF8F9;
          border: 1px dashed #D8CAD0;
          border-radius: 8px;
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .demo-header {
          font-size: 0.78rem;
          font-weight: 700;
          color: #7B2347;
        }

        .demo-desc {
          font-size: 0.75rem;
          color: #7A6E73;
          margin: 0;
        }

        .demo-autofill-btn {
          background: #fff;
          border: 1px solid #D8CAD0;
          padding: 0.4rem 0.65rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #55484E;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
        }

        .demo-autofill-btn:hover {
          background: #FDF5F8;
          border-color: #7B2347;
          color: #7B2347;
        }
      `}</style>
    </AuthLayout>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
