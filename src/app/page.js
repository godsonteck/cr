'use client';

import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { getAllProducts } from '@/services/productService';

/* ─── Scroll reveal ─── */
function useReveal(threshold = 0.1) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold }
    );
    targets.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

/* ─── Categories (each uses a unique verified image) ─── */
const CATEGORIES = [
  {
    name: 'Skincare',
    image: '/images/categories/skincare.jpg',
    href: '/shop?category=skincare',
  },
  {
    name: 'Face Care',
    image: '/images/products/1.jpeg',
    href: '/shop?category=skincare&subcategory=Face',
  },
  {
    name: 'Body Lotions',
    image: '/images/products/5.jpeg',
    href: '/shop?category=skincare&subcategory=Body',
  },
  {
    name: 'Body Oils',
    image: '/images/products/4.jpeg',
    href: '/shop?category=skincare&subcategory=Body',
  },
  {
    name: 'Body Treatments',
    image: '/images/products/9.jpeg',
    href: '/shop?category=skincare&subcategory=Body',
  },
  {
    name: 'Intimate Care',
    image: '/images/products/t.jpeg',
    href: '/shop?category=skincare&subcategory=Body',
  },
  {
    name: 'Groceries',
    image: '/images/categories/groceries.jpg',
    href: '/shop?category=groceries',
  },
];

const TRUST_ITEMS = [
  { icon: '🛡', title: '100% Authentic', sub: 'Original products sourced directly' },
  { icon: '🔒', title: 'Safe & Secure', sub: 'Mobile Money & Cash on Delivery' },
  { icon: '🚚', title: 'Fast Delivery', sub: 'Delivering to Botwe & across Accra' },
  { icon: '💬', title: 'Customer Care', sub: 'Dedicated support via WhatsApp & phone' },
];

export default function HomePage() {
  const heroRef    = useReveal();
  const catRef     = useReveal();
  const promoRef   = useReveal();
  const bsRef      = useReveal();
  const newRef     = useReveal();
  const trustRef   = useReveal();

  const allProducts = getAllProducts();
  // Distribute products into non-overlapping unique groups
  const bestSellerIds = ['prod-001', 'prod-002', 'prod-004', 'prod-005', 'prod-009', 'prod-015'];
  const bestSellers = allProducts.filter((p) => bestSellerIds.includes(p.id) || p.badge === 'bestseller').slice(0, 6);

  const trendingIds = ['prod-006', 'prod-008', 'prod-010', 'prod-011', 'prod-014', 'prod-016'];
  const trendingProducts = allProducts.filter((p) => (trendingIds.includes(p.id) || p.badge === 'new') && !bestSellers.some(b => b.id === p.id)).slice(0, 6);

  return (
    <div style={{ paddingTop: 'var(--total-header-h)' }}>

      {/* ════════════════════════════════════════
          01 — HERO
          ════════════════════════════════════════ */}
      <section className="hero" ref={heroRef} aria-label="Hero Showcase">
        <div className="hero__inner">
          {/* Content */}
          <div>
            <h1 className="hero__heading reveal">
              Your Beauty.<br />
              Your Essentials.<br />
              <span className="hero-rose">Your Glow.</span>{' '}
              <span className="hero-gold" aria-hidden="true">✦</span>
            </h1>

            <p className="hero__body reveal reveal-delay-1">
              Carefully selected beauty, body care, and everyday essentials brought right to you in Botwe.
            </p>

            <div className="hero__ctas reveal reveal-delay-2">
              <Link href="/shop" className="btn btn-primary" id="hero-shop-cta">
                Shop Now
              </Link>
              <Link href="/about" className="btn btn-outline" id="hero-explore-cta">
                Explore Story
              </Link>
            </div>

            {/* Trust badges strip */}
            <div className="hero__trust reveal reveal-delay-3">
              <div className="hero__trust-item">
                <div className="hero__trust-icon" aria-hidden="true">🛡</div>
                <div className="hero__trust-text">
                  <span className="hero__trust-label">100% Authentic</span>
                  <span className="hero__trust-sub">Original Products</span>
                </div>
              </div>
              <div className="hero__trust-item">
                <div className="hero__trust-icon" aria-hidden="true">🔒</div>
                <div className="hero__trust-text">
                  <span className="hero__trust-label">Safe Payment</span>
                  <span className="hero__trust-sub">MoMo & Cash</span>
                </div>
              </div>
              <div className="hero__trust-item">
                <div className="hero__trust-icon" aria-hidden="true">🚚</div>
                <div className="hero__trust-text">
                  <span className="hero__trust-label">Fast Delivery</span>
                  <span className="hero__trust-sub">Accra & Beyond</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual — Luxury Hero Pedestal Image */}
          <div className="hero__visual reveal reveal-delay-1">
            <div className="hero__main-image-wrap">
              <img
                src="/images/hero-pedestal.jpg"
                alt="CR Cosmetics Luxury Beauty Pedestal Collection"
                className="hero__main-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          02 — SHOP BY CATEGORY
          ════════════════════════════════════════ */}
      <section className="category-section" ref={catRef} aria-labelledby="categories-heading">
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', paddingInline: 'var(--container-pad)' }}>
          <div className="category-section__header">
            <h2
              id="categories-heading"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--text)',
                marginBottom: 'var(--space-2)',
              }}
            >
              Shop by Category
            </h2>
            <div className="section-divider reveal">
              <div className="section-divider__diamond" />
            </div>
          </div>
        </div>

        <div className="category-grid" role="list" aria-label="Product categories">
          {CATEGORIES.map(({ name, image, href }) => (
            <Link
              key={name}
              href={href}
              className="category-tile reveal"
              role="listitem"
              aria-label={`Browse ${name}`}
            >
              <div className="category-tile__img-wrap">
                <img
                  src={image}
                  alt={name}
                  loading="lazy"
                />
              </div>
              <span className="category-tile__name">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          03 — 3-PANEL PROMOTIONAL BANNERS
          ════════════════════════════════════════ */}
      <div ref={promoRef} aria-label="Featured Collections">
        <div className="promo-banners">
          {/* Panel 1: New Arrivals (Blush Pink) */}
          <Link href="/shop?sort=newest" className="promo-banner promo-banner--pink reveal" id="promo-new-arrivals">
            <div className="promo-banner__content">
              <p className="promo-banner__label">New Arrivals</p>
              <h2 className="promo-banner__heading">
                Just<br />In!
              </h2>
              <p className="promo-banner__desc">
                Discover the latest skin renewal and body care must-haves.
              </p>
              <span className="btn btn-primary btn-sm" style={{ display: 'inline-flex' }}>
                Shop Now
              </span>
            </div>
          </Link>

          {/* Panel 2: Find Your Match (White with real product photo) */}
          <Link href="/shop" className="promo-banner promo-banner--white reveal reveal-delay-1" id="promo-match">
            <div className="promo-banner__content" style={{ maxWidth: '55%' }}>
              <p className="promo-banner__label">Curated For You</p>
              <h2 className="promo-banner__heading">
                Find Your<br />Perfect Match
              </h2>
              <p className="promo-banner__desc">
                From hydration to brightening treatments, find the exact care your skin needs.
              </p>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--burgundy)',
                borderBottom: '1px solid var(--burgundy)',
                paddingBottom: '2px',
              }}>
                Find Now →
              </span>
            </div>
            {/* Real product showcase images */}
            <div className="promo-products">
              <div className="promo-products__img">
                <img src="/images/products/h.jpeg" alt="Fairest Body Oil" />
              </div>
              <div className="promo-products__img">
                <img src="/images/products/s.jpeg" alt="Brighter Face Cream" />
              </div>
            </div>
          </Link>

          {/* Panel 3: CR Exclusive (Burgundy) */}
          <Link href="/shop" className="promo-banner promo-banner--burgundy reveal reveal-delay-2" id="promo-exclusive">
            <div className="promo-banner__content">
              <p className="promo-banner__label">CR Exclusive</p>
              <h2 className="promo-banner__heading">
                Curated with love,<br />only for you.
              </h2>
              <p className="promo-banner__desc">
                Clinical strength formulas crafted for glowing results.
              </p>
              <span className="btn btn-outline-white btn-sm" style={{ display: 'inline-flex' }}>
                Discover
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* ════════════════════════════════════════
          04 — BEST SELLERS (No Duplicates)
          ════════════════════════════════════════ */}
      <section className="bestsellers-section" ref={bsRef} aria-labelledby="bestsellers-heading">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 0 }}>
            <h2
              id="bestsellers-heading"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--text)',
                marginBottom: 'var(--space-2)',
              }}
            >
              Best Sellers
            </h2>
            <div className="section-divider reveal">
              <div className="section-divider__diamond" />
            </div>
          </div>

          <div className="bestsellers-grid reveal">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
            <Link href="/shop" className="btn btn-outline-bur">
              View All Catalogue
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          05 — NEW & TRENDING (Distinct Products)
          ════════════════════════════════════════ */}
      <section style={{ paddingBlock: 'clamp(2.5rem, 5vw, 4.5rem)', background: 'var(--bg-soft)' }} ref={newRef} aria-labelledby="trending-heading">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 0 }}>
            <h2
              id="trending-heading"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--text)',
                marginBottom: 'var(--space-2)',
              }}
            >
              New & Trending
            </h2>
            <div className="section-divider reveal">
              <div className="section-divider__diamond" />
            </div>
          </div>

          <div className="bestsellers-grid reveal">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          06 — TRUST STRIP
          ════════════════════════════════════════ */}
      <div className="trust-strip" ref={trustRef} role="region" aria-label="Why shop with us">
        <div className="trust-strip__inner">
          {TRUST_ITEMS.map(({ icon, title, sub }) => (
            <div key={title} className="trust-item">
              <div className="trust-item__icon" aria-hidden="true">{icon}</div>
              <div>
                <div className="trust-item__title">{title}</div>
                <div className="trust-item__sub">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
