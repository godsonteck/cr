'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import PasswordInput from '@/components/auth/PasswordInput';
import PasswordStrength from '@/components/auth/PasswordStrength';
import AuthButton from '@/components/auth/AuthButton';
import AuthAlert from '@/components/auth/AuthAlert';
import { useAuth } from '@/context/AuthContext';
import { isValidEmail, isValidGhanaPhone } from '@/services/authService';

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/account';

  const { signUpCustomer } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true,
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  // Field validation
  const validateField = (field, value) => {
    let err = '';
    switch (field) {
      case 'fullName':
        if (!value.trim()) err = 'Full name is required.';
        else if (value.trim().length < 2) err = 'Please enter your full name.';
        break;
      case 'email':
        if (!value.trim()) err = 'Email address is required.';
        else if (!isValidEmail(value)) err = 'Please enter a valid email address.';
        break;
      case 'phone':
        if (value.trim() && !isValidGhanaPhone(value)) {
          err = 'Please enter a valid Ghanaian phone number (e.g. 0592153306).';
        }
        break;
      case 'password':
        if (!value) err = 'Password is required.';
        else if (value.length < 8) err = 'Password must be at least 8 characters long.';
        break;
      case 'confirmPassword':
        if (!value) err = 'Please confirm your password.';
        else if (value !== formData.password) err = 'Passwords do not match.';
        break;
      default:
        break;
    }
    return err;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (serverError) setServerError('');

    if (touched[field]) {
      const err = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }

    // Auto update confirm password check
    if (field === 'password' && touched.confirmPassword) {
      const confirmErr = formData.confirmPassword !== value ? 'Passwords do not match.' : '';
      setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Mark all as touched and validate
    const fields = ['fullName', 'email', 'phone', 'password', 'confirmPassword'];
    const newTouched = {};
    const newErrors = {};
    let hasError = false;

    fields.forEach((f) => {
      newTouched[f] = true;
      const err = validateField(f, formData[f]);
      if (err) {
        newErrors[f] = err;
        hasError = true;
      }
    });

    setTouched(newTouched);
    setErrors(newErrors);

    if (hasError) return;

    if (!formData.agreeTerms) {
      setServerError('Please accept the Terms of Service to create your account.');
      return;
    }

    setLoading(true);

    try {
      const res = await signUpCustomer({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      setRegisteredUser(res.user);
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If successfully registered, show clear success / verification guidance
  if (registeredUser) {
    return (
      <AuthLayout
        title="Welcome to CR Cosmetics!"
        subtitle="Your account has been created successfully."
        imageSrc="/images/hero-pedestal.jpg"
        badgeText="Account Created"
        quote="“Thank you for joining our beauty family. We’re excited to bring you verified, radiant skincare.”"
        quoteAuthor="Akosua, Founder"
      >
        <div className="auth-success-screen">
          <div className="success-icon-badge">✨</div>

          <div className="success-text-card">
            <h3>Hello, {registeredUser.fullName}!</h3>
            <p>
              We’ve created your CR Cosmetics & Essentials account linked to <strong>{registeredUser.email}</strong>.
            </p>
            <div className="verification-hint-box">
              <span className="hint-icon">📧</span>
              <div>
                <strong>Verify your email for order updates</strong>
                <p>A verification link has been sent to your inbox. You can verify anytime to enable fast 1-click reordering.</p>
              </div>
            </div>
          </div>

          <div className="success-action-stack">
            <button
              type="button"
              className="btn-continue-shopping"
              onClick={() => router.push(redirectTarget)}
            >
              Continue to {redirectTarget === '/account' ? 'My Account' : 'Shopping'} →
            </button>

            <Link href="/shop" className="btn-secondary-link">
              Explore Skincare Catalog
            </Link>
          </div>
        </div>

        <style jsx>{`
          .auth-success-screen {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            align-items: center;
            text-align: center;
          }
          .success-icon-badge {
            width: 60px;
            height: 60px;
            background: #E1F5E8;
            color: #2A7A4C;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
          }
          .success-text-card h3 {
            font-family: var(--font-display, serif);
            font-size: 1.4rem;
            color: #1A0D14;
            margin: 0 0 0.5rem 0;
          }
          .success-text-card p {
            font-size: 0.88rem;
            color: #7A6E73;
            margin: 0;
            line-height: 1.5;
          }
          .verification-hint-box {
            margin-top: 1.25rem;
            background: #FAF8F9;
            border: 1px solid #EBE4E8;
            border-radius: 8px;
            padding: 1rem;
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            text-align: left;
          }
          .hint-icon {
            font-size: 1.4rem;
          }
          .verification-hint-box strong {
            font-size: 0.85rem;
            color: #1A0D14;
            display: block;
          }
          .verification-hint-box p {
            font-size: 0.78rem;
            color: #7A6E73;
            margin-top: 0.2rem;
          }
          .success-action-stack {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-top: 0.5rem;
          }
          .btn-continue-shopping {
            width: 100%;
            padding: 0.85rem;
            background: #7B2347;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.15s;
          }
          .btn-continue-shopping:hover {
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

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join CR Cosmetics & Essentials for faster checkout, order tracking, and exclusive beauty offers."
      imageSrc="/images/hero-pedestal.jpg"
      badgeText="Join the Community"
      quote="“Join thousands of glowing customers across Accra who trust us for 100% authentic beauty and grocery staples.”"
      quoteAuthor="CR Cosmetics Team"
      footerPrompt="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref={`/signin${redirectTarget !== '/account' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
    >
      <form onSubmit={handleSubmit} className="auth-form-stack" noValidate>
        {serverError && (
          <AuthAlert
            type="error"
            message={serverError}
            onDismiss={() => setServerError('')}
          />
        )}

        <AuthInput
          id="auth-signup-name"
          label="Full Name"
          value={formData.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          onBlur={() => handleBlur('fullName')}
          placeholder="e.g. Nana Ama Osei"
          required
          error={touched.fullName ? errors.fullName : ''}
          autoComplete="name"
          disabled={loading}
          icon="👤"
        />

        <AuthInput
          id="auth-signup-email"
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="name@example.com"
          required
          error={touched.email ? errors.email : ''}
          autoComplete="email"
          disabled={loading}
          icon="✉️"
        />

        <AuthInput
          id="auth-signup-phone"
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          onBlur={() => handleBlur('phone')}
          placeholder="059 215 3306"
          prefix="+233"
          error={touched.phone ? errors.phone : ''}
          helperText="Used for order confirmation & delivery rider contact."
          autoComplete="tel"
          disabled={loading}
        />

        <PasswordInput
          id="auth-signup-password"
          label="Create Password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
          placeholder="At least 8 characters"
          required
          error={touched.password ? errors.password : ''}
          autoComplete="new-password"
          disabled={loading}
        />

        {formData.password && (
          <PasswordStrength password={formData.password} />
        )}

        <PasswordInput
          id="auth-signup-confirm"
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          onBlur={() => handleBlur('confirmPassword')}
          placeholder="Re-enter your password"
          required
          error={touched.confirmPassword ? errors.confirmPassword : ''}
          autoComplete="new-password"
          disabled={loading}
        />

        <div className="auth-terms-row">
          <label className="auth-checkbox-label">
            <input
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={(e) => handleChange('agreeTerms', e.target.checked)}
              disabled={loading}
            />
            <span>
              I agree to the{' '}
              <Link href="/about" className="auth-inline-link" target="_blank">
                Terms of Service
              </Link>{' '}
              and Privacy Policy.
            </span>
          </label>
        </div>

        <AuthButton
          type="submit"
          loading={loading}
          loadingText="Creating account..."
          disabled={loading}
        >
          Create Account
        </AuthButton>
      </form>

      <style jsx>{`
        .auth-form-stack {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
        }

        .auth-terms-row {
          margin-top: 0.15rem;
        }

        .auth-checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #55484E;
          cursor: pointer;
          line-height: 1.4;
          user-select: none;
        }

        .auth-checkbox-label input[type='checkbox'] {
          accent-color: #7B2347;
          width: 16px;
          height: 16px;
          margin-top: 2px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .auth-inline-link {
          color: #7B2347;
          text-decoration: none;
          font-weight: 600;
        }

        .auth-inline-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </AuthLayout>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
