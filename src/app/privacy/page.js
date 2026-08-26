'use client';

import React from 'react';
import Link from 'next/link';
import { BUSINESS } from '@/utils/constants';

export default function PrivacyPolicyPage() {
  return (
    <div className="cr-policy-page">
      <div className="cr-policy-container">
        <nav className="cr-policy-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span className="cr-crumb-active">Privacy Policy</span>
        </nav>

        <header className="cr-policy-header">
          <span className="cr-policy-tag">CUSTOMER DATA PROTECTION</span>
          <h1 className="cr-policy-title">Privacy Policy</h1>
          <p className="cr-policy-updated">Effective Date: August 2026 • CR Cosmetics & Essentials</p>
        </header>

        <div className="cr-policy-content">
          <section className="cr-policy-block">
            <h2>1. Information We Collect</h2>
            <p>
              CR Cosmetics & Essentials collects basic information necessary to fulfill your online and WhatsApp orders:
            </p>
            <ul>
              <li><strong>Contact Information:</strong> Full name, Ghanaian telephone/WhatsApp number, and delivery street address or landmark.</li>
              <li><strong>Order History:</strong> Product items ordered, quantities, delivery fees, and order timestamps.</li>
              <li><strong>Payment Reference:</strong> Mobile Money transaction references (we never store private PINs or bank card secrets).</li>
            </ul>
          </section>

          <section className="cr-policy-block">
            <h2>2. How We Use Your Information</h2>
            <p>Your details are used solely for legitimate business and fulfillment purposes:</p>
            <ul>
              <li>Processing and delivering your skincare and grocery orders.</li>
              <li>Providing SMS and WhatsApp dispatch updates and delivery rider coordination.</li>
              <li>Responding to customer service inquiries and return requests.</li>
            </ul>
          </section>

          <section className="cr-policy-block">
            <h2>3. Data Protection & Non-Disclosure</h2>
            <p>
              We do not sell, rent, or trade your personal information to third parties. Information is only shared with trusted delivery riders and payment network operators (MTN MoMo, Telecel Cash, AT Money) strictly to fulfill your requested transactions.
            </p>
          </section>

          <section className="cr-policy-block">
            <h2>4. Contact Our Data Desk</h2>
            <p>
              If you wish to update your saved delivery details or request deletion of your customer profile, message our team at <a href="https://wa.me/233592153306" className="cr-policy-link">059 215 3306</a> or email us at <a href="mailto:hello@crcosmetics.gh" className="cr-policy-link">hello@crcosmetics.gh</a>.
            </p>
          </section>
        </div>
      </div>

      <style jsx>{`
        .cr-policy-page {
          padding-top: calc(var(--header-h, 74px) + 2rem);
          padding-bottom: 5rem;
          background: #FAF8F6;
          min-height: 100vh;
          font-family: var(--font-primary, sans-serif);
        }

        .cr-policy-container {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 clamp(1.25rem, 4vw, 2.5rem);
        }

        .cr-policy-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: #8C7C84;
          margin-bottom: 1.5rem;
        }

        .cr-policy-breadcrumb a {
          color: #63545B;
          text-decoration: none;
        }

        .cr-policy-breadcrumb a:hover {
          color: #7B2347;
        }

        .cr-crumb-active {
          color: #1A0D14;
          font-weight: 600;
        }

        .cr-policy-header {
          padding-bottom: 2rem;
          border-bottom: 1px solid #EAE0E5;
          margin-bottom: 2.5rem;
        }

        .cr-policy-tag {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #BE4D6E;
          display: block;
          margin-bottom: 0.5rem;
        }

        .cr-policy-title {
          font-family: var(--font-display, serif);
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          color: #161114;
          line-height: 1.15;
          margin-bottom: 0.5rem;
        }

        .cr-policy-updated {
          font-size: 0.85rem;
          color: #7A6A72;
        }

        .cr-policy-content {
          background: #FFFFFF;
          border: 1px solid #EAE0E5;
          border-radius: 12px;
          padding: clamp(1.75rem, 4vw, 3rem);
          display: flex;
          flex-direction: column;
          gap: 2rem;
          box-shadow: 0 2px 12px rgba(107, 23, 51, 0.03);
        }

        .cr-policy-block h2 {
          font-family: var(--font-display, serif);
          font-size: 1.35rem;
          font-weight: 700;
          color: #161114;
          margin-bottom: 0.75rem;
        }

        .cr-policy-block p,
        .cr-policy-block li {
          font-size: 0.92rem;
          color: #55454C;
          line-height: 1.65;
        }

        .cr-policy-block ul {
          margin-top: 0.5rem;
          padding-left: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .cr-policy-link {
          color: #7B2347;
          font-weight: 600;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
