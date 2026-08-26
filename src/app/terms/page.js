'use client';

import React from 'react';
import Link from 'next/link';
import { BUSINESS } from '@/utils/constants';

export default function TermsPage() {
  return (
    <div className="cr-policy-page">
      <div className="cr-policy-container">
        <nav className="cr-policy-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span className="cr-crumb-active">Terms & Conditions</span>
        </nav>

        <header className="cr-policy-header">
          <span className="cr-policy-tag">STORE TERMS</span>
          <h1 className="cr-policy-title">Terms & Conditions</h1>
          <p className="cr-policy-updated">Last Updated: August 2026 • CR Cosmetics & Essentials, Botwe, Ghana</p>
        </header>

        <div className="cr-policy-content">
          <section className="cr-policy-block">
            <h2>1. Overview & Acceptance</h2>
            <p>
              By accessing our store website or placing an order via our online checkout or WhatsApp desk, you agree to comply with the terms and operational conditions outlined herein.
            </p>
          </section>

          <section className="cr-policy-block">
            <h2>2. Product Pricing & Availability</h2>
            <p>
              All prices are quoted in <strong>Ghana Cedi (GH₵ / GHS)</strong>. We strive to ensure stock levels and pricing are accurate in real-time. In the rare event an ordered item is out of stock before dispatch, our team will contact you immediately to offer an alternative or issue an instant refund.
            </p>
          </section>

          <section className="cr-policy-block">
            <h2>3. Order Confirmation & Payment</h2>
            <p>
              Orders placed online or through WhatsApp are confirmed upon receipt of valid delivery details. Accepted payment options include <strong>MTN MoMo, Telecel Cash, AT Money, and Cash on Delivery</strong> for approved Greater Accra areas.
            </p>
          </section>

          <section className="cr-policy-block">
            <h2>4. Governing Law</h2>
            <p>
              These terms are governed by the laws and commercial regulations of the Republic of Ghana. For any inquiries, please contact our Botwe store desk at <a href="https://wa.me/233592153306" className="cr-policy-link">059 215 3306</a>.
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

        .cr-policy-block p {
          font-size: 0.92rem;
          color: #55454C;
          line-height: 1.65;
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
