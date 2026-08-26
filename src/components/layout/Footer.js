'use client';

import React from 'react';
import Link from 'next/link';
import { BUSINESS } from '@/utils/constants';

const SHOP_NAV = [
  { label: 'Shop All', href: '/shop' },
  { label: 'Skincare', href: '/shop?category=skincare' },
  { label: 'Body Care', href: '/shop?category=skincare&subcategory=Body' },
  { label: 'Groceries', href: '/shop?category=groceries' },
];

const COMPANY_NAV = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Delivery Info', href: '/contact#delivery' },
  { label: 'Returns', href: '/contact#returns' },
];

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer__inner">
        {/* ── Brand Col ── */}
        <div className="site-footer__brand">
          <div className="footer-brand__head">
            <span className="footer-brand__crown" aria-hidden="true">♛</span>
            <div>
              <span className="footer-brand__name">CR Cosmetics</span>
              <span className="footer-brand__tagline">& Essential • Botwe</span>
            </div>
          </div>
          <p className="footer-brand__text">
            Quality cosmetics, authentic skincare, and everyday essentials delivered across Botwe and Accra.
          </p>
          <div className="footer-social" aria-label="Social media links">
            <a href="https://instagram.com" className="footer-social__link" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r=".5" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="https://facebook.com" className="footer-social__link" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="https://wa.me/233592153306" className="footer-social__link" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
            </a>
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div className="site-footer__nav-grid">
          <div>
            <h3 className="footer-col__heading">Explore</h3>
            <ul className="footer-col__links" role="list">
              {SHOP_NAV.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="footer-col__link">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="footer-col__heading">Help & Care</h3>
            <ul className="footer-col__links" role="list">
              {COMPANY_NAV.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="footer-col__link">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Contact Info ── */}
        <div className="site-footer__contact">
          <h3 className="footer-col__heading">Store Location</h3>
          <p className="footer-contact__text">
            📍 Botwe School Junction, Accra, Ghana
          </p>
          <p className="footer-contact__text">
            📞 <a href="tel:+233592153306" className="footer-col__link">059 215 3306</a>
          </p>
          <p className="footer-contact__text">
            🕐 Mon – Sat: 9:00am – 8:00pm
          </p>
        </div>
      </div>

      {/* ── Slim Bottom Bar ── */}
      <div className="site-footer__bottom">
        <p className="footer-bottom__copy">
          © {new Date().getFullYear()} {BUSINESS.name} • Botwe, Accra • All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
