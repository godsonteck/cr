'use client';

import React from 'react';
import Link from 'next/link';
import { BUSINESS } from '@/utils/constants';

export default function Footer() {
  return (
    <footer className="cr-footer" role="contentinfo">
      <div className="cr-footer-container">
        {/* ── Main 4-Column Footer Grid ── */}
        <div className="cr-footer-grid">
          {/* Col 1: Brand & Store Identity */}
          <div className="cr-footer-col cr-footer-col--brand">
            <Link href="/" className="cr-footer-logo" aria-label="CR Cosmetics & Essentials — Home">
              <span className="cr-footer-brand-name">CR</span>
              <span className="cr-footer-brand-tag">Cosmetics & Essentials</span>
            </Link>
            <p className="cr-footer-desc">
              Your trusted Ghanaian destination for authentic skincare, glowing body care, and everyday household essentials.
            </p>
            <div className="cr-footer-location-block">
              <p className="cr-footer-loc-heading">📍 FLAGSHIP STORE</p>
              <p className="cr-footer-loc-text">Near Galaxy International School, Botwe, Greater Accra, Ghana</p>
              <p className="cr-footer-hours">Mon–Sat: 8:00 AM – 8:00 PM • Sun: 10:00 AM – 6:00 PM</p>
            </div>
          </div>

          {/* Col 2: Shop Categories */}
          <div className="cr-footer-col">
            <h4 className="cr-footer-heading">Shop Catalogue</h4>
            <ul className="cr-footer-list">
              <li><Link href="/shop">All Products</Link></li>
              <li><Link href="/shop?category=skincare">Skincare & Face Care</Link></li>
              <li><Link href="/shop?category=skincare&subcategory=Body">Body Lotions & Oils</Link></li>
              <li><Link href="/shop?category=groceries">Groceries & Pantry</Link></li>
              <li><Link href="/shop?category=skincare&subcategory=Face">Brightening Serums</Link></li>
              <li><Link href="/shop">Popular Picks</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Services */}
          <div className="cr-footer-col">
            <h4 className="cr-footer-heading">Customer Care</h4>
            <ul className="cr-footer-list">
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/delivery">Delivery & Dispatch Rates</Link></li>
              <li><Link href="/returns">Returns & Refunds</Link></li>
              <li><Link href="/faqs">Frequently Asked Questions</Link></li>
              <li><Link href="/account/orders">Track My Order</Link></li>
              <li><Link href="/account">My Customer Account</Link></li>
            </ul>
          </div>

          {/* Col 4: Direct WhatsApp & Communication */}
          <div className="cr-footer-col cr-footer-col--contact">
            <h4 className="cr-footer-heading">Instant Support</h4>
            <p className="cr-footer-contact-p">
              Need personal skincare advice or fast delivery tracking? Chat with our Botwe team.
            </p>

            <a
              href="https://wa.me/233592153306"
              className="cr-footer-wa-btn"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Order via WhatsApp 059 215 3306"
            >
              <span>💬</span>
              <span>WhatsApp: 059 215 3306</span>
            </a>

            <div className="cr-footer-contact-meta">
              <p>📞 Phone: <strong>059 215 3306</strong></p>
              <p>✉️ Email: <strong>hello@crcosmetics.gh</strong></p>
            </div>
          </div>
        </div>

        {/* ── Sub Footer & Legal ── */}
        <div className="cr-footer-bottom">
          <span className="cr-footer-copy">
            © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved. Botwe, Accra, Ghana.
          </span>
          <div className="cr-footer-legal">
            <Link href="/privacy" className="cr-footer-mini-link">Privacy Policy</Link>
            <span className="cr-footer-dot">•</span>
            <Link href="/terms" className="cr-footer-mini-link">Terms & Conditions</Link>
            <span className="cr-footer-dot">•</span>
            <Link href="/returns" className="cr-footer-mini-link">Returns Policy</Link>
            <span className="cr-footer-dot">•</span>
            <Link href="/delivery" className="cr-footer-mini-link">Delivery Rates</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cr-footer {
          background: #140A0F;
          color: #D6CAD1;
          font-family: var(--font-primary, sans-serif);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: clamp(3rem, 6vw, 4.5rem);
        }

        .cr-footer-container {
          max-width: 1320px;
          margin: 0 auto;
          padding: 0 clamp(1.25rem, 4vw, 2.5rem);
        }

        .cr-footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
          gap: clamp(2rem, 4vw, 3.5rem);
          padding-bottom: 3.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        /* ── Col 1: Brand ── */
        .cr-footer-logo {
          display: inline-flex;
          flex-direction: column;
          text-decoration: none;
          gap: 2px;
          margin-bottom: 1rem;
        }

        .cr-footer-brand-name {
          font-family: var(--font-display, serif);
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #FFFFFF;
          line-height: 1;
        }

        .cr-footer-brand-tag {
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #C59B3F;
        }

        .cr-footer-desc {
          font-size: 0.88rem;
          color: #A898A1;
          line-height: 1.6;
          margin-bottom: 1.25rem;
          max-width: 32ch;
        }

        .cr-footer-location-block {
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .cr-footer-loc-heading {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #C59B3F;
          margin-bottom: 0.25rem;
        }

        .cr-footer-loc-text {
          font-size: 0.85rem;
          color: #FFFFFF;
          line-height: 1.4;
          margin-bottom: 0.25rem;
        }

        .cr-footer-hours {
          font-size: 0.78rem;
          color: #8C7C84;
        }

        /* ── Col Lists ── */
        .cr-footer-heading {
          font-family: var(--font-display, serif);
          font-size: 1.15rem;
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 1.25rem;
          letter-spacing: 0.02em;
        }

        .cr-footer-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }

        .cr-footer-list li :global(a) {
          color: #C2B3BB;
          text-decoration: none;
          font-size: 0.88rem;
          transition: color 0.15s ease;
        }

        .cr-footer-list li :global(a:hover) {
          color: #FFFFFF;
          text-decoration: underline;
        }

        /* ── Col 4: Contact ── */
        .cr-footer-contact-p {
          font-size: 0.88rem;
          color: #A898A1;
          line-height: 1.5;
          margin-bottom: 1.25rem;
        }

        .cr-footer-wa-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: #1E8E49;
          color: #FFFFFF;
          padding: 0.75rem 1.25rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.2s;
          margin-bottom: 1.25rem;
        }

        .cr-footer-wa-btn:hover {
          background: #176F39;
        }

        .cr-footer-contact-meta {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-size: 0.82rem;
          color: #A898A1;
        }

        .cr-footer-contact-meta strong {
          color: #FFFFFF;
        }

        /* ── Sub Footer ── */
        .cr-footer-bottom {
          padding: 1.5rem 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .cr-footer-copy {
          font-size: 0.8rem;
          color: #7A6A72;
        }

        .cr-footer-legal {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .cr-footer-mini-link {
          font-size: 0.8rem;
          color: #8C7C84;
          text-decoration: none;
          transition: color 0.15s;
        }

        .cr-footer-mini-link:hover {
          color: #FFFFFF;
        }

        .cr-footer-dot {
          color: #4A3A42;
          font-size: 0.8rem;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .cr-footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2.5rem;
          }
        }

        @media (max-width: 640px) {
          .cr-footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .cr-footer-bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </footer>
  );
}
