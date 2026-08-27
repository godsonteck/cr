'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="clean-footer">
      <div className="footer-container">
        
        {/* Brand Column */}
        <div className="footer-col brand-col">
          <div className="brand-logo">
            <span className="brand-name">CR COSMETICS &amp; ESSENTIALS</span>
          </div>
          <p className="brand-desc">
            Your neighbourhood store in Botwe, Accra for verified skincare, body lotions, fragrant rice, and daily groceries.
          </p>
          <div className="store-meta">
            <span>📍 Near Galaxy International School, Botwe</span>
            <span>📞 +233 59 215 3306</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <span className="col-heading">Shop</span>
          <ul className="links-list">
            <li><Link href="/shop">All Products</Link></li>
            <li><Link href="/shop?category=skincare">Skincare &amp; Beauty</Link></li>
            <li><Link href="/shop?category=groceries">Groceries &amp; Essentials</Link></li>
            <li><Link href="/shop?q=sale">Special Offers</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="footer-col">
          <span className="col-heading">Customer Care</span>
          <ul className="links-list">
            <li><Link href="/contact">Contact &amp; Map</Link></li>
            <li><Link href="/delivery">Delivery &amp; Shipping</Link></li>
            <li><Link href="/returns">Returns &amp; Refunds</Link></li>
            <li><Link href="/faqs">FAQs</Link></li>
          </ul>
        </div>

        {/* Direct WhatsApp Ordering */}
        <div className="footer-col wa-col">
          <span className="col-heading">Fast Order</span>
          <p className="wa-desc">Need immediate delivery or have a question? Order directly on WhatsApp.</p>
          <a
            href="https://wa.me/233592153306"
            target="_blank"
            rel="noopener noreferrer"
            className="wa-btn"
          >
            💬 Chat on WhatsApp (059 215 3306)
          </a>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="bottom-bar">
        <div className="footer-container bottom-flex">
          <span>&copy; {new Date().getFullYear()} CR Cosmetics &amp; Essentials. All rights reserved.</span>
          <span>MTN MoMo &bull; Telecel Cash &bull; Cash on Delivery</span>
        </div>
      </div>

      <style jsx>{`
        .clean-footer {
          background: #FAFAFA;
          border-top: 1px solid #EAEAEA;
          color: #333333;
          font-family: var(--font-primary, sans-serif);
          padding-top: 3.5rem;
        }

        .footer-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: grid;
          grid-template-columns: 1.4fr 0.8fr 0.8fr 1fr;
          gap: 2.5rem;
          padding-bottom: 3rem;
        }

        .brand-name {
          font-family: var(--font-display, serif);
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #111111;
          display: block;
          margin-bottom: 0.75rem;
        }
        .brand-desc {
          font-size: 0.85rem;
          line-height: 1.55;
          color: #666666;
          margin: 0 0 1rem;
          max-width: 320px;
        }
        .store-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 0.8rem;
          color: #555555;
          font-weight: 500;
        }

        .col-heading {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #111111;
          display: block;
          margin-bottom: 1rem;
        }

        .links-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .links-list a {
          font-size: 0.85rem;
          color: #666666;
          text-decoration: none;
          transition: color 0.15s;
        }
        .links-list a:hover {
          color: #111111;
        }

        .wa-desc {
          font-size: 0.85rem;
          color: #666666;
          margin: 0 0 1rem;
          line-height: 1.5;
        }
        .wa-btn {
          display: inline-flex;
          align-items: center;
          background: #25D366;
          color: #FFFFFF;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 10px 14px;
          border-radius: 6px;
          text-decoration: none;
          transition: background 0.15s;
        }
        .wa-btn:hover {
          background: #1EBE5B;
        }

        .bottom-bar {
          border-top: 1px solid #EAEAEA;
          padding: 1.25rem 0;
          font-size: 0.78rem;
          color: #888888;
        }
        .bottom-flex {
          display: flex;
          justify-content: space-between;
          padding-bottom: 0;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        @media (max-width: 860px) {
          .footer-container {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
        }
        @media (max-width: 500px) {
          .footer-container {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
      `}</style>
    </footer>
  );
}
