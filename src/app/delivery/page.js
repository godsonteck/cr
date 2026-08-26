'use client';

import React from 'react';
import Link from 'next/link';
import { BUSINESS } from '@/utils/constants';

export default function DeliveryPolicyPage() {
  return (
    <div className="cr-policy-page">
      <div className="cr-policy-container">
        <nav className="cr-policy-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span className="cr-crumb-active">Delivery Policy</span>
        </nav>

        <header className="cr-policy-header">
          <span className="cr-policy-tag">SHIPPING & DISPATCH</span>
          <h1 className="cr-policy-title">Delivery & Pickup Policy</h1>
          <p className="cr-policy-updated">Last Updated: August 2026 • Effective for all orders across Greater Accra & Ghana</p>
        </header>

        <div className="cr-policy-content">
          <section className="cr-policy-block">
            <h2>1. Delivery Areas & Turnaround Times</h2>
            <p>
              CR Cosmetics & Essentials is situated in <strong>Botwe, near Galaxy International School, Accra</strong>. We offer fast, reliable delivery throughout Greater Accra and standard regional dispatch to other regions across Ghana.
            </p>
            <div className="cr-rates-table">
              <div className="cr-rate-row cr-rate-header">
                <span>Delivery Zone</span>
                <span>Coverage</span>
                <span>Estimated Time</span>
                <span>Delivery Fee</span>
              </div>
              <div className="cr-rate-row">
                <span><strong>Zone 1: Immediate Local</strong></span>
                <span>Botwe, Madina, Adenta, Ashaley Botwe, Agbogba</span>
                <span>Same-Day (2 – 4 Hours)</span>
                <span>GHS 15.00 – GHS 25.00</span>
              </div>
              <div className="cr-rate-row">
                <span><strong>Zone 2: Greater Accra Central</strong></span>
                <span>East Legon, Airport, Spintex, Osu, Cantonments, Dzorwulu</span>
                <span>Same-Day (within 6 Hours)</span>
                <span>GHS 25.00 – GHS 35.00</span>
              </div>
              <div className="cr-rate-row">
                <span><strong>Zone 3: Outer Greater Accra</strong></span>
                <span>Tema, Weija, Kasoa, Pokuase, Amasaman, Dawhenya</span>
                <span>Same-Day / Next-Day</span>
                <span>GHS 35.00 – GHS 45.00</span>
              </div>
              <div className="cr-rate-row">
                <span><strong>Zone 4: Regional Ghana</strong></span>
                <span>Kumasi, Takoradi, Cape Coast, Tamale, Sunyani, Ho</span>
                <span>1 – 2 Business Days (VIP/Courier)</span>
                <span>GHS 40.00 – GHS 60.00</span>
              </div>
            </div>
          </section>

          <section className="cr-policy-block">
            <h2>2. Free Delivery Promotion</h2>
            <p>
              Orders with a subtotal of <strong>GHS 300.00 or higher</strong> qualify for <strong>FREE Doorstep Delivery</strong> within Greater Accra (Zones 1 & 2).
            </p>
          </section>

          <section className="cr-policy-block">
            <h2>3. Free In-Store Pickup</h2>
            <p>
              Customers are welcome to select <strong>In-Store Pickup</strong> at checkout with <strong>GHS 0.00 delivery fee</strong>. Your order will be carefully packaged and ready for collection within 1 hour during store working hours:
            </p>
            <ul>
              <li><strong>Pickup Location:</strong> CR Cosmetics & Essentials, Near Galaxy International School, Botwe, Accra.</li>
              <li><strong>Store Working Hours:</strong> Monday – Saturday: 8:00 AM – 8:00 PM | Sunday: 10:00 AM – 6:00 PM.</li>
            </ul>
          </section>

          <section className="cr-policy-block">
            <h2>4. Dispatch Notification & Rider Tracking</h2>
            <p>
              Once your order has been packed and handed over to our dispatch courier, you will receive a confirmation message via SMS or WhatsApp containing your rider details and estimated arrival time.
            </p>
          </section>

          <section className="cr-policy-block">
            <h2>5. Contact Customer Support</h2>
            <p>
              For instant delivery inquiries or special scheduling, please reach our store desk directly via WhatsApp at <a href="https://wa.me/233592153306" className="cr-policy-link">+233 59 215 3306 (059 215 3306)</a> or visit our <Link href="/contact" className="cr-policy-link">Contact Page</Link>.
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

        .cr-rates-table {
          margin-top: 1rem;
          border: 1px solid #EAE0E5;
          border-radius: 8px;
          overflow: hidden;
        }

        .cr-rate-row {
          display: grid;
          grid-template-columns: 1.2fr 1.8fr 1.2fr 1fr;
          padding: 0.85rem 1rem;
          border-bottom: 1px solid #F0E8EC;
          font-size: 0.85rem;
          align-items: center;
        }

        .cr-rate-row:last-child {
          border-bottom: none;
        }

        .cr-rate-header {
          background: #FAF2F5;
          font-weight: 700;
          color: #161114;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }

        .cr-policy-link {
          color: #7B2347;
          font-weight: 600;
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .cr-rate-row {
            grid-template-columns: 1fr;
            gap: 0.35rem;
            padding: 1rem;
          }
          .cr-rate-header {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
