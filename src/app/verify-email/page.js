'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState('VERIFYING'); // 'VERIFYING' | 'VERIFIED' | 'ALREADY_VERIFIED' | 'EXPIRED' | 'INVALID'
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    async function doVerify() {
      if (!token) {
        setState('INVALID');
        return;
      }
      try {
        const res = await fetch(`/api/auth/customer/verify-email?token=${encodeURIComponent(token)}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success && data.status === 'VERIFIED') {
          setState('VERIFIED');
          setCustomerName(data.customer?.fullName || '');
        } else if (data.status === 'ALREADY_VERIFIED') {
          setState('ALREADY_VERIFIED');
        } else if (data.status === 'EXPIRED') {
          setState('EXPIRED');
        } else {
          setState('INVALID');
        }
      } catch (e) {
        setState('INVALID');
      }
    }
    doVerify();
  }, [token]);

  return (
    <AuthLayout
      title="Email Verification"
      subtitle="Confirming your CR Cosmetics & Essentials account."
      imageSrc="/images/hero-pedestal.jpg"
      badgeText="Account Security"
    >
      <div className="verify-container">
        {state === 'VERIFYING' && (
          <div className="verify-card">
            <div className="verify-spinner" />
            <h3>Verifying your email...</h3>
            <p>Please wait while we confirm your account details.</p>
          </div>
        )}

        {state === 'VERIFIED' && (
          <div className="verify-card">
            <div className="verify-icon success">✓</div>
            <h3>Email Verified Successfully!</h3>
            <p>
              Thank you{customerName ? `, ${customerName}` : ''}! Your email address is now verified and your account is active.
            </p>
            <Link href="/account" className="btn-primary-action">
              Continue to My Account →
            </Link>
            <Link href="/shop" className="btn-secondary-link">
              Start Shopping Now
            </Link>
          </div>
        )}

        {state === 'ALREADY_VERIFIED' && (
          <div className="verify-card">
            <div className="verify-icon info">ℹ️</div>
            <h3>Already Verified</h3>
            <p>Your email has already been verified. You can sign in and manage your orders anytime.</p>
            <Link href="/signin" className="btn-primary-action">
              Sign In to Account →
            </Link>
          </div>
        )}

        {state === 'EXPIRED' && (
          <div className="verify-card">
            <div className="verify-icon warning">⌛</div>
            <h3>Verification Link Expired</h3>
            <p>This verification link has expired. Please sign in to request a fresh verification link.</p>
            <Link href="/signin" className="btn-primary-action">
              Sign In to Resend Link →
            </Link>
          </div>
        )}

        {state === 'INVALID' && (
          <div className="verify-card">
            <div className="verify-icon error">⚠</div>
            <h3>Invalid Verification Link</h3>
            <p>We could not find a matching account for this link. Please check your email or contact customer care.</p>
            <Link href="/signin" className="btn-primary-action">
              Go to Sign In →
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        .verify-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1rem 0;
        }

        .verify-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          width: 100%;
        }

        .verify-spinner {
          width: 44px;
          height: 44px;
          border: 3.5px solid #EBE4E8;
          border-top-color: #7B2347;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .verify-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          font-weight: 700;
        }
        .verify-icon.success {
          background: #E1F5E8;
          color: #2A7A4C;
        }
        .verify-icon.info {
          background: #EFF6FF;
          color: #2563EB;
        }
        .verify-icon.warning {
          background: #FEF3C7;
          color: #D97706;
        }
        .verify-icon.error {
          background: #FEE2E2;
          color: #DC2626;
        }

        .verify-card h3 {
          font-family: var(--font-display, serif);
          font-size: 1.4rem;
          color: #1A0D14;
          margin: 0;
        }

        .verify-card p {
          font-size: 0.88rem;
          color: #7A6E73;
          margin: 0;
          line-height: 1.5;
          max-width: 36ch;
        }

        .btn-primary-action {
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
          margin-top: 0.5rem;
        }

        .btn-primary-action:hover {
          background: #5E1734;
        }

        .btn-secondary-link {
          font-size: 0.85rem;
          color: #7B2347;
          text-decoration: none;
          font-weight: 600;
        }

        .btn-secondary-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}