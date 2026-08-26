'use client';

import React from 'react';
import Link from 'next/link';
import { BUSINESS } from '@/utils/constants';

export default function ReturnsPolicyPage() {
  return (
    <div className="cr-policy-page">
      <div className="cr-policy-container">
        <nav className="cr-policy-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span className="cr-crumb-active">Returns & Refunds</span>
        </nav>

        <header className="cr-policy-header">
          <span className="cr-policy-tag">CUSTOMER ASSURANCE</span>
          <h1 className="cr-policy-title">Returns, Exchanges & Refund Policy</h1>
          <p className="cr-policy-updated">Last Updated: August 2026 • CR Cosmetics & Essentials, Botwe</p>
        </header>

        <div className="cr-policy-content">
          <section className="cr-policy-block">
            <h2>1. Our Quality & Authenticity Guarantee</h2>
            <p>
              At CR Cosmetics & Essentials, we guarantee that 100% of our skincare, haircare, and grocery items are genuine and sourced from authorized brand distributors. Your peace of mind and satisfaction are central to our service.
            </p>
          </section>

          <section className="cr-policy-block">
            <h2>2. Eligible Returns & 48-Hour Return Window</h2>
            <p>
              Due to hygiene, health, and cosmetic safety standards, products eligible for return or exchange must meet the following criteria:
            </p>
            <ul>
              <li><strong>Notification Window:</strong> Contact our team within <strong>48 hours</strong> of receiving your delivery.</li>
              <li><strong>Condition:</strong> Items must be unused, unopened, with all original factory safety seals and packaging intact.</li>
              <li><strong>Wrong Item Received:</strong> If we mistakenly delivered an item different from your order, we will replace it immediately at zero additional delivery charge.</li>
              <li><strong>Damaged in Transit:</strong> If a bottle, jar, or package arrived leaking or broken, please take a clear photograph upon opening and message our WhatsApp desk for an instant exchange.</li>
            </ul>
          </section>

          <section className="cr-policy-block">
            <h2>3. Non-Returnable Items</h2>
            <p>
              For public health reasons, we cannot accept returns on opened cosmetics, tested skincare serums, body lotions with broken safety seals, intimate hygiene products, or perishable food items.
            </p>
          </section>

          <section className="cr-policy-block">
            <h2>4. Refund Process</h2>
            <p>
              Once your returned item is received and inspected at our Botwe storefront:
            </p>
            <ul>
              <li><strong>Mobile Money Refunds:</strong> Processed directly to your MTN MoMo, Telecel Cash, or AT Money wallet within <strong>2 to 4 business hours</strong>.</li>
              <li><strong>Store Credit / Exchange:</strong> Available immediately for in-store pickup or applied toward your next delivery.</li>
            </ul>
          </section>

          <section className="cr-policy-block">
            <h2>5. How to Initiate a Return</h2>
            <p>
              Simply send a WhatsApp message to our customer desk at <a href="https://wa.me/233592153306" className="cr-policy-link">059 215 3306</a> with your <strong>Order Number (e.g. CR-2026-XXXXX)</strong> and a quick photo/description. Our team will resolve your request promptly.
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
