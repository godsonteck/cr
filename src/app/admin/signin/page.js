'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import PasswordInput from '@/components/auth/PasswordInput';
import AuthButton from '@/components/auth/AuthButton';
import AuthAlert from '@/components/auth/AuthAlert';
import { useAuth } from '@/context/AuthContext';
import { getAllStaffUsers } from '@/services/staffService';

function AdminSignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/admin';

  const { admin, signInAdmin } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const staffList = getAllStaffUsers();

  useEffect(() => {
    if (admin && !loading) {
      router.replace(redirectTarget);
    }
  }, [admin, loading, redirectTarget, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Please enter your staff email or username.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your staff password.');
      return;
    }

    setLoading(true);

    try {
      await signInAdmin({
        identifier: identifier.trim(),
        password,
        rememberMe,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push(redirectTarget);
      }, 600);
    } catch (err) {
      setErrorMsg(err.message || 'Staff authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Admin & Staff Portal"
      subtitle="Sign in with your authorized staff credentials to manage products, orders, and store inventory."
      imageSrc="/images/hero-pedestal.jpg"
      badgeText="Authorized Personnel Only"
      quote="“Internal management console for CR Cosmetics & Essentials operations, fulfillment, and retail analytics.”"
      quoteAuthor="CR Operational Security"
      isAdmin={true}
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
            message="Authenticated! Launching Admin Console..."
          />
        )}

        <AuthInput
          id="admin-auth-user"
          label="Staff Email or Username"
          type="text"
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            if (errorMsg) setErrorMsg('');
          }}
          placeholder="e.g. akosua@crcosmetics.gh or admin"
          required
          autoComplete="username"
          disabled={loading || success}
          icon="🛡️"
        />

        <PasswordInput
          id="admin-auth-pwd"
          label="Staff Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errorMsg) setErrorMsg('');
          }}
          placeholder="Enter staff security password"
          required
          autoComplete="current-password"
          disabled={loading || success}
        />

        <div className="admin-sec-note">
          <span>🔒</span>
          <span>Access is monitored and restricted to authorized personnel.</span>
        </div>

        <AuthButton
          type="submit"
          loading={loading}
          loadingText="Authenticating staff..."
          success={success}
          successText="Authorized!"
          disabled={loading || success}
          variant="primary"
        >
          Sign In to Admin Portal
        </AuthButton>

        {/* Demo Fast Login Selector */}
        <div className="admin-demo-box">
          <div className="demo-box-head">
            <span>👑 Quick Staff Login (Demo Environment)</span>
          </div>
          <p className="demo-box-sub">Select any staff member to test role-based access:</p>
          <div className="demo-staff-list">
            {staffList.slice(0, 3).map((st) => (
              <button
                key={st.id}
                type="button"
                className="btn-demo-staff"
                onClick={() => {
                  setIdentifier(st.email);
                  setPassword('Admin12345!');
                }}
              >
                <div className="staff-btn-name">{st.name}</div>
                <div className="staff-btn-role">{st.role.replace('_', ' ')} • {st.email}</div>
              </button>
            ))}
          </div>
        </div>
      </form>

      <style jsx>{`
        .auth-form-stack {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .admin-sec-note {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #7A6E73;
          background: #FAF8F9;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          border: 1px solid #EBE4E8;
        }

        .admin-demo-box {
          margin-top: 0.5rem;
          background: #FAF8F9;
          border: 1px solid #EAE3E6;
          border-radius: 8px;
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .demo-box-head {
          font-size: 0.78rem;
          font-weight: 700;
          color: #7B2347;
        }

        .demo-box-sub {
          font-size: 0.75rem;
          color: #7A6E73;
          margin: 0;
        }

        .demo-staff-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-top: 0.2rem;
        }

        .btn-demo-staff {
          background: #fff;
          border: 1px solid #D8CAD0;
          padding: 0.45rem 0.75rem;
          border-radius: 6px;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-demo-staff:hover {
          background: #FDF5F8;
          border-color: #7B2347;
        }

        .staff-btn-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: #1A0D14;
        }

        .staff-btn-role {
          font-size: 0.7rem;
          color: #7A6E73;
        }
      `}</style>
    </AuthLayout>
  );
}

export default function AdminSignInPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1A0D14', color: '#fff' }}>Loading portal...</div>}>
      <AdminSignInForm />
    </Suspense>
  );
}
