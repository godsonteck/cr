'use client';

import React from 'react';
import Link from 'next/link';

export default function AuthLayout({
  children,
  title,
  subtitle,
  badgeText = 'Authentic Skincare & Essentials',
  imageSrc = '/images/hero-pedestal.jpg',
  quote = '“Everyday luxury and verified skincare essentials, delivered right to your doorstep in Ghana.”',
  quoteAuthor = 'CR Cosmetics & Essentials, Botwe',
  footerPrompt,
  footerLinkText,
  footerLinkHref,
  isAdmin = false,
}) {
  return (
    <div className={`auth-page-container ${isAdmin ? 'admin-auth-theme' : ''}`}>
      {/* ── Brand Split Visual Panel (Desktop) ── */}
      <div className="auth-visual-panel">
        <div
          className="auth-visual-bg"
          style={{ backgroundImage: `url(${imageSrc})` }}
        />
        <div className="auth-visual-overlay" />

        <div className="auth-visual-content">
          <Link href="/" className="auth-brand-logo-link">
            <img src="/logo.jpeg" alt="CR Cosmetics & Essentials" className="auth-brand-logo-img" />
            <div className="auth-brand-text">
              <span className="auth-brand-name">CR COSMETICS</span>
              <span className="auth-brand-sub">AND ESSENTIALS</span>
            </div>
          </Link>

          <div className="auth-visual-footer">
            <div className="auth-brand-badge">{badgeText}</div>
            <blockquote className="auth-visual-quote">
              <p>{quote}</p>
              <cite>— {quoteAuthor}</cite>
            </blockquote>

            <div className="auth-visual-features">
              <div className="auth-feature-pill">✓ 100% Genuine Brands</div>
              <div className="auth-feature-pill">✓ Fast Ghana Delivery</div>
              <div className="auth-feature-pill">✓ Mobile Money & Cash</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form Container Panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          {/* Mobile Brand Header */}
          <div className="auth-mobile-header">
            <Link href="/" className="auth-mobile-brand">
              <span className="auth-brand-crown">♛</span>
              <span className="auth-brand-name">CR Cosmetics & Essentials</span>
            </Link>
          </div>

          <div className="auth-header-block">
            {isAdmin && <span className="auth-admin-pill">STAFF & ADMIN PORTAL</span>}
            <h1 className="auth-heading">{title}</h1>
            {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          </div>

          <div className="auth-body-content">{children}</div>

          {footerPrompt && footerLinkText && footerLinkHref && (
            <div className="auth-bottom-nav">
              <span>{footerPrompt} </span>
              <Link href={footerLinkHref} className="auth-bottom-link">
                {footerLinkText}
              </Link>
            </div>
          )}

          <div className="auth-micro-footer">
            <span>Botwe, near Galaxy Int. School, Accra • 059 215 3306</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .auth-page-container {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background: #FAF8F9;
          font-family: var(--font-primary, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
          color: #2D1E24;
        }

        /* ─── Visual Side ─── */
        .auth-visual-panel {
          flex: 1.1;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3.5rem;
          color: #fff;
          overflow: hidden;
          background: #1A0D14;
        }

        .auth-visual-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          filter: brightness(0.65) saturate(1.1);
          transform: scale(1.02);
          transition: transform 10s ease;
        }

        .auth-visual-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(26, 13, 20, 0.4) 0%,
            rgba(26, 13, 20, 0.75) 60%,
            rgba(123, 35, 71, 0.85) 100%
          );
        }

        .auth-visual-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          gap: 2rem;
        }

        .auth-brand-logo-link {
          display: inline-flex;
          align-items: center;
          gap: 0.85rem;
          text-decoration: none;
          color: #fff;
        }

        .auth-brand-crown {
          font-size: 1.75rem;
          color: #C5A059;
          line-height: 1;
        }

        .auth-brand-text {
          display: flex;
          flex-direction: column;
        }

        .auth-brand-name {
          font-family: var(--font-display, serif);
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #fff;
        }

        .auth-brand-sub {
          font-size: 0.65rem;
          letter-spacing: 0.22em;
          color: #E6C885;
          font-weight: 600;
        }

        .auth-visual-footer {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .auth-brand-badge {
          display: inline-block;
          background: rgba(197, 160, 89, 0.2);
          color: #F3E6C8;
          border: 1px solid rgba(197, 160, 89, 0.4);
          padding: 0.35rem 0.85rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          align-self: flex-start;
          backdrop-filter: blur(4px);
        }

        .auth-visual-quote p {
          font-family: var(--font-display, serif);
          font-size: 1.35rem;
          line-height: 1.5;
          color: #fff;
          font-style: italic;
          margin: 0 0 0.5rem 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .auth-visual-quote cite {
          font-size: 0.82rem;
          color: #E2D7DC;
          font-style: normal;
          font-weight: 500;
        }

        .auth-visual-features {
          display: flex;
          gap: 0.85rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }

        .auth-feature-pill {
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(8px);
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        /* ─── Form Side ─── */
        .auth-form-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3.5rem 2.5rem;
          background: #fff;
          overflow-y: auto;
        }

        .auth-form-inner {
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .auth-mobile-header {
          display: none;
        }

        .auth-mobile-brand {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
          color: #1A0D14;
        }

        .auth-admin-pill {
          display: inline-block;
          background: #1A0D14;
          color: #C5A059;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          letter-spacing: 0.08em;
          margin-bottom: 0.6rem;
        }

        .auth-heading {
          font-family: var(--font-display, serif);
          font-size: 2rem;
          font-weight: 700;
          color: #1A0D14;
          line-height: 1.2;
          margin: 0 0 0.4rem 0;
        }

        .auth-subtitle {
          font-size: 0.9rem;
          color: #7A6E73;
          margin: 0;
          line-height: 1.5;
        }

        .auth-body-content {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .auth-bottom-nav {
          text-align: center;
          font-size: 0.88rem;
          color: #7A6E73;
          padding-top: 0.75rem;
          border-top: 1px solid #F0EAEF;
        }

        .auth-bottom-link {
          color: #7B2347;
          font-weight: 600;
          text-decoration: none;
          margin-left: 0.25rem;
        }

        .auth-bottom-link:hover {
          text-decoration: underline;
        }

        .auth-micro-footer {
          text-align: center;
          font-size: 0.72rem;
          color: #A3969C;
          line-height: 1.4;
        }

        /* ─── Admin Dark Variant ─── */
        .admin-auth-theme .auth-visual-panel {
          background: #0E070B;
        }
        .admin-auth-theme .auth-visual-overlay {
          background: linear-gradient(
            180deg,
            rgba(14, 7, 11, 0.7) 0%,
            rgba(26, 13, 20, 0.88) 100%
          );
        }

        /* ─── Mobile Responsiveness ─── */
        @media (max-width: 960px) {
          .auth-page-container {
            flex-direction: column;
          }
          .auth-visual-panel {
            display: none;
          }
          .auth-mobile-header {
            display: block;
            margin-bottom: 0.5rem;
          }
          .auth-form-panel {
            padding: 2.5rem 1.5rem;
            min-height: 100vh;
            align-items: flex-start;
          }
          .auth-heading {
            font-size: 1.7rem;
          }
        }
      `}</style>
    </div>
  );
}
