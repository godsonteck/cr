'use client';

import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';

export default function HomeClient({ allProducts, featuredProducts }) {
  const [activeTab, setActiveTab] = React.useState('all');

  const displayedProducts = React.useMemo(() => {
    if (activeTab === 'face') {
      return allProducts
        .filter((p) => p.subcategory?.toLowerCase() === 'face')
        .slice(0, 8);
    }
    if (activeTab === 'body') {
      return allProducts
        .filter((p) => p.subcategory?.toLowerCase() === 'body')
        .slice(0, 8);
    }
    if (activeTab === 'groceries') {
      return allProducts.filter((p) => p.category === 'groceries').slice(0, 8);
    }
    if (activeTab === 'deals') {
      return allProducts.filter(
        (p) => p.badge === 'sale' || p.originalPrice
      ).slice(0, 8);
    }
    // Default: Top Curated Best Sellers
    return allProducts.filter(
      (p) =>
        p.badge === 'bestseller' ||
        ['prod-001', 'prod-002', 'prod-004', 'prod-005', 'prod-006', 'prod-008', 'prod-010', 'prod-014'].includes(p.id)
    ).slice(0, 8);
  }, [allProducts, activeTab]);

  return (
    <div className="cr-home-root">
      {/* ══════════════════════════════════════
          01 — MARQUEE TICKER TAPE
          ══════════════════════════════════════ */}
      <div className="cr-ticker" aria-hidden="true">
        <div className="cr-ticker-rail">
          {[...Array(4)].map((_, i) => (
            <React.Fragment key={i}>
              <span>{['New Arrival', 'Best Seller', 'Limited Edition', 'Seasonal'][i]}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          02 — HERO SECTION
          ══════════════════════════════════════ */}
      <section className="cr-hero">
        <div className="cr-hero-bg"></div>
        <div className="cr-hero-content">
          <h1>CR Cosmetics & Essentials</h1>
          <p>Ghana's trusted beauty and wellness destination</p>
          <div className="cr-hero-buttons">
            <Link href="/shop" className="btn-primary">
              Shop All Products
            </Link>
            <Link href="/account" className="btn-secondary">
              My Account
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          03 — FEATURED PRODUCTS
          ══════════════════════════════════════ */}
      {featuredProducts.length > 0 && (
        <section className="cr-section cr-section-padded">
          <div className="cr-section-header">
            <h2>Featured Picks</h2>
            <Link href="/shop" className="view-all">
              View All →
            </Link>
          </div>
          <div className="cr-grid cr-grid-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          04 — POPULAR CATEGORIES
          ══════════════════════════════════════ */}
      <section className="cr-section cr-section-padded">
        <div className="cr-section-header">
          <h2>Popular Categories</h2>
        </div>
        <div className="cr-grid cr-grid-6">
          {['Skincare', 'Face Care', 'Body Care', 'Haircare', 'Groceries'].map(
            (category, index) => (
              <Link
                key={index}
                href={`/shop?category=${category.toLowerCase().replace(/\s+/g, '-')}`}
                className="cr-category-card"
              >
                <div className="cr-category-image" style={{ backgroundImage: `/images/products/${category.toLowerCase().replace(/\s+/g, '-')}.jpg` }} />
                <div className="cr-category-caption">
                  <h3>{category}</h3>
                </div>
              </Link>
            )
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          05 — ROUTINE STEPS
          ══════════════════════════════════════ */}
      <section className="cr-section cr-section-padded">
        <div className="cr-section-header">
          <h2>Beauty Routine</h2>
          <p>Step-by-step guidance for your skin</p>
        </div>
        <div className="cr-grid cr-grid-3">
          {['Cleanse & Purify', 'Tone & Treat', 'Nourish & Seal'].map(
            (step, index) => (
              <Link
                key={index}
                href={`/shop?category=skincare&subcategory=${step.toLowerCase().replace(/\s+/g, '-')}`}
                className="cr-routine-step"
              >
                <div className="cr-routine-step-inner">
                  <div className="cr-routine-step-number">{index + 1}</div>
                  <div className="cr-routine-step-icon">{'123'[index]}</div>
                  <h3>{step}</h3>
                </div>
              </Link>
            )
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          06 — TRUST BADGES
          ══════════════════════════════════════ */}
      <section className="cr-section cr-section-padded">
        <div className="cr-section-header">
          <h2>Why Shop With Us</h2>
        </div>
        <div className="cr-trust-badges">
          <div className="cr-trust-badge">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v8c0 6 8 10 8 10z" />
              <circle cx="12" cy="7" r="3" />
            </svg>
            Authenticated Store
          </div>
          <div className="cr-trust-badge">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 2v4m0 10v4M4.93 4.93l2.83 2.83a8 8 0 1 1-11.31 0L4.93 4.93" />
            </svg>
            Secure Payments
          </div>
          <div className="cr-trust-badge">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v8c0 6 8 10 8 10z" />
              <path d="M2 4h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
            </svg>
            Fast Delivery
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          07 — BEST SELLERS SECTION
          ══════════════════════════════════════ */}
      <section className="cr-section cr-section-padded">
        <div className="cr-section-header">
          <h2>Best Sellers</h2>
        </div>
        <div className="cr-grid cr-grid-3">
          {allProducts
            .filter(
              (p) =>
                p.badge === 'bestseller' ||
                ['prod-001', 'prod-002', 'prod-004', 'prod-005', 'prod-006', 'prod-008', 'prod-010', 'prod-014'].includes(p.id)
            )
            .slice(0, 8)
            .map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
      </section>
    </div>
  );
}