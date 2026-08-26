'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BUSINESS } from '@/utils/constants';

const FAQ_ITEMS = [
  {
    q: 'Where is CR Cosmetics & Essentials physically located?',
    a: 'Our flagship retail store is located in Botwe, near Galaxy International School, Greater Accra, Ghana. You are welcome to visit in person during store hours to shop or pick up orders.'
  },
  {
    q: 'How do I place an order via WhatsApp?',
    a: 'You can tap the "WhatsApp: 059 215 3306" button on any product page or in your shopping cart. This automatically prepares a structured message with your product selections, quantities, and total for fast dispatch.'
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept Mobile Money (MTN MoMo, Telecel Cash, AT Money) and Cash on Delivery for approved delivery areas across Greater Accra.'
  },
  {
    q: 'How fast is delivery to my location in Accra?',
    a: 'For Botwe, Madina, Adenta, East Legon, and central Accra, we provide same-day delivery within 2 to 4 hours. Regional courier dispatch across Ghana takes 1 to 2 business days.'
  },
  {
    q: 'Are your skincare and cosmetics genuine?',
    a: 'Yes, 100%. We source our inventory directly from verified brand manufacturers and authorized distributors. We guarantee the authenticity and quality of every bottle, serum, lotion, and grocery item.'
  },
  {
    q: 'What should I do if I receive a wrong or damaged item?',
    a: 'Please send a quick photograph and your order number to our WhatsApp support at 059 215 3306 within 48 hours of delivery. We will arrange an immediate replacement or full Mobile Money refund.'
  }
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="cr-faq-page">
      <div className="cr-faq-container">
        <nav className="cr-faq-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span className="cr-crumb-active">Frequently Asked Questions</span>
        </nav>

        <header className="cr-faq-header">
          <span className="cr-faq-tag">HELP & SUPPORT</span>
          <h1 className="cr-faq-title">Frequently Asked Questions</h1>
          <p className="cr-faq-sub">Common questions about ordering, deliveries, authentic products, and store pickup.</p>
        </header>

        <div className="cr-faq-list">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className={`cr-faq-item${openIdx === i ? ' cr-faq-item--open' : ''}`}>
              <button
                type="button"
                className="cr-faq-question"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                aria-expanded={openIdx === i}
              >
                <span>{item.q}</span>
                <span className="cr-faq-icon">{openIdx === i ? '−' : '+'}</span>
              </button>
              {openIdx === i && (
                <div className="cr-faq-answer">
                  <p>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* WhatsApp Help Callout */}
        <div className="cr-faq-help-box">
          <h3>Still have questions?</h3>
          <p>Our Botwe store customer care team is available on WhatsApp to help with product recommendations and delivery inquiries.</p>
          <a
            href="https://wa.me/233592153306"
            className="cr-btn-wa-help"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>💬</span> Chat on WhatsApp (059 215 3306)
          </a>
        </div>
      </div>

      <style jsx>{`
        .cr-faq-page {
          padding-top: calc(var(--header-h, 74px) + 2rem);
          padding-bottom: 5rem;
          background: #FAF8F6;
          min-height: 100vh;
          font-family: var(--font-primary, sans-serif);
        }

        .cr-faq-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 clamp(1.25rem, 4vw, 2.5rem);
        }

        .cr-faq-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: #8C7C84;
          margin-bottom: 1.5rem;
        }

        .cr-faq-breadcrumb a {
          color: #63545B;
          text-decoration: none;
        }

        .cr-faq-breadcrumb a:hover {
          color: #7B2347;
        }

        .cr-crumb-active {
          color: #1A0D14;
          font-weight: 600;
        }

        .cr-faq-header {
          padding-bottom: 2rem;
          border-bottom: 1px solid #EAE0E5;
          margin-bottom: 2rem;
        }

        .cr-faq-tag {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #BE4D6E;
          display: block;
          margin-bottom: 0.5rem;
        }

        .cr-faq-title {
          font-family: var(--font-display, serif);
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          color: #161114;
          line-height: 1.15;
          margin-bottom: 0.5rem;
        }

        .cr-faq-sub {
          font-size: 0.95rem;
          color: #6B5B63;
        }

        .cr-faq-list {
          background: #FFFFFF;
          border: 1px solid #EAE0E5;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(107, 23, 51, 0.03);
          margin-bottom: 2.5rem;
        }

        .cr-faq-item {
          border-bottom: 1px solid #F0E8EC;
        }

        .cr-faq-item:last-child {
          border-bottom: none;
        }

        .cr-faq-question {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.35rem 1.5rem;
          background: none;
          border: none;
          font-family: inherit;
          font-size: 1rem;
          font-weight: 700;
          color: #161114;
          cursor: pointer;
          text-align: left;
          gap: 1rem;
        }

        .cr-faq-question:hover {
          color: #7B2347;
          background: #FAF8F6;
        }

        .cr-faq-icon {
          font-size: 1.3rem;
          color: #7B2347;
          font-weight: 400;
        }

        .cr-faq-answer {
          padding: 0 1.5rem 1.35rem;
        }

        .cr-faq-answer p {
          font-size: 0.92rem;
          color: #55454C;
          line-height: 1.65;
        }

        .cr-faq-help-box {
          background: #FFFFFF;
          border: 1px solid #EAE0E5;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .cr-faq-help-box h3 {
          font-family: var(--font-display, serif);
          font-size: 1.35rem;
          font-weight: 700;
          color: #161114;
        }

        .cr-faq-help-box p {
          font-size: 0.9rem;
          color: #6B5B63;
          max-width: 45ch;
        }

        .cr-btn-wa-help {
          margin-top: 0.5rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #1E8E49;
          color: #FFFFFF;
          font-weight: 700;
          font-size: 0.88rem;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          text-decoration: none;
          transition: background 0.2s;
        }

        .cr-btn-wa-help:hover {
          background: #176F39;
        }
      `}</style>
    </div>
  );
}
