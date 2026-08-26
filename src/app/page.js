'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { getAllProducts } from '@/services/productService';

/* ─── Scroll Reveal Hook ─── */
function useReveal() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      targets.forEach((t) => t.classList.add('visible'));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '100px 0px 100px 0px' }
    );
    targets.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, []);
  return ref;
}

const CATEGORIES = [
  { name: 'Skincare',       count: '18 Items', image: '/images/products/face-moisturizer.jpg', href: '/shop?category=skincare' },
  { name: 'Face Care',      count: '8 Items',  image: '/images/products/1.jpeg',               href: '/shop?category=skincare&subcategory=Face' },
  { name: 'Body Lotions',   count: '6 Items',  image: '/images/products/body-lotion.jpg',       href: '/shop?category=skincare&subcategory=Body' },
  { name: 'Body Oils',      count: '5 Items',  image: '/images/products/body-oil.jpg',          href: '/shop?category=skincare&subcategory=Body' },
  { name: 'Scrubs & Soaps', count: '4 Items',  image: '/images/products/body-scrub.jpg',        href: '/shop?category=skincare&subcategory=Body' },
  { name: 'Groceries',     count: '8 Items',  image: '/images/products/jasmine-rice.jpg',      href: '/shop?category=groceries' },
];

const ROUTINE_STEPS = [
  {
    step: '01',
    title: 'Cleanse & Purify',
    desc: 'Gentle clarifying face washes & raw black soaps that cleanse without stripping natural skin moisture.',
    badge: 'Step 1',
    image: '/images/products/face-cleanser.jpg',
    link: '/shop?category=skincare&subcategory=Face',
  },
  {
    step: '02',
    title: 'Tone & Treat',
    desc: 'Vitamin C serums & corrective treatments formulated to fade dark spots and boost youthful radiance.',
    badge: 'Step 2',
    image: '/images/products/vitamin-c-serum.jpg',
    link: '/shop?category=skincare&subcategory=Face',
  },
  {
    step: '03',
    title: 'Nourish & Seal',
    desc: 'Deep-penetrating shea butters, botanical body lotions and luminous oils for a 24-hour sunlit glow.',
    badge: 'Step 3',
    image: '/images/products/shea-butter.jpg',
    link: '/shop?category=skincare&subcategory=Body',
  },
];

export default function HomePage() {
  const heroRef = useReveal();
  const catRef = useReveal();
  const filterRef = useReveal();
  const routineRef = useReveal();
  const bentoRef = useReveal();
  const trustRef = useReveal();

  const [activeTab, setActiveTab] = useState('all');

  const allProducts = getAllProducts();

  // Dynamic filter tab products
  const displayedProducts = React.useMemo(() => {
    if (activeTab === 'face') {
      return allProducts.filter((p) => p.subcategory?.toLowerCase() === 'face').slice(0, 8);
    }
    if (activeTab === 'body') {
      return allProducts.filter((p) => p.subcategory?.toLowerCase() === 'body').slice(0, 8);
    }
    if (activeTab === 'groceries') {
      return allProducts.filter((p) => p.category === 'groceries').slice(0, 8);
    }
    if (activeTab === 'deals') {
      return allProducts.filter((p) => p.badge === 'sale' || p.originalPrice).slice(0, 8);
    }
    // Default: Top Curated Best Sellers
    return allProducts.filter((p) => p.badge === 'bestseller' || ['prod-001', 'prod-002', 'prod-004', 'prod-005', 'prod-006', 'prod-008', 'prod-010', 'prod-014'].includes(p.id)).slice(0, 8);
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
              <span className="cr-ticker-node">✨ 100% Verified Authentic Cosmetics</span>
              <span className="cr-ticker-node">✦ Swift Accra & Botwe Doorstep Delivery</span>
              <span className="cr-ticker-node">💳 Pay with MoMo or Cash on Delivery</span>
              <span className="cr-ticker-node">📍 Near Galaxy International School, Botwe</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          02 — ULTRA LUXURY HERO EXPERIENCE
          ══════════════════════════════════════ */}
      <section className="cr-hero-wrap" ref={heroRef} aria-label="Hero Showcase">
        {/* Luminous background glow */}
        <div className="cr-hero-glow-left" aria-hidden="true" />
        <div className="cr-hero-glow-right" aria-hidden="true" />

        <div className="cr-page-container">
          <div className="cr-hero-layout">
            {/* Left Content */}
            <div className="cr-hero-copy">
              <div className="cr-hero-tag reveal">
                <span className="cr-tag-spark">✦</span>
                <span>BOTWE'S PREMIER BEAUTY & ESSENTIALS DESTINATION</span>
              </div>

              <h1 className="cr-hero-heading reveal reveal-delay-1">
                Radiant Skin.<br />
                Pure Formulas.<br />
                <span className="cr-heading-accent">Everyday Luxury.</span>
              </h1>

              <p className="cr-hero-description reveal reveal-delay-2">
                Discover verified dermatologist-approved skincare, luxurious body butters, and high-quality daily essentials crafted to nourish your skin in the Ghanaian weather.
              </p>

              <div className="cr-hero-buttons reveal reveal-delay-3">
                <Link href="/shop" className="cr-btn-glow" id="hero-shop-all-btn">
                  <span>Explore Catalogue</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <a
                  href="https://wa.me/233592153306"
                  className="cr-btn-wa"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="hero-wa-btn"
                >
                  <span className="cr-wa-icon">💬</span>
                  <span>WhatsApp: 059 215 3306</span>
                </a>
              </div>

              {/* Authentic Value Proposition Strip */}
              <div className="cr-hero-social-proof reveal reveal-delay-3">
                <div className="cr-hero-badges-list">
                  <span className="cr-hero-pill-badge">📍 Botwe Physical Store</span>
                  <span className="cr-hero-pill-badge">🚚 Accra Same-Day Delivery</span>
                  <span className="cr-hero-pill-badge">💳 MoMo & Cash Accepted</span>
                </div>
              </div>
            </div>

            {/* Right Hero Presentation Card */}
            <div className="cr-hero-media-wrap reveal reveal-delay-2">
              <div className="cr-hero-media-card">
                <img
                  src="/images/hero-pedestal.jpg"
                  alt="CR Cosmetics Luxury Pedestal Collection"
                  className="cr-hero-main-img"
                  priority="true"
                />
                <div className="cr-hero-floating-glass">
                  <div className="cr-glass-badge">★ BESTSELLER OF THE WEEK</div>
                  <h3 className="cr-glass-title">Fairest Glow Illuminating Oil</h3>
                  <div className="cr-glass-meta">
                    <span className="cr-glass-price">GHS 140.00</span>
                    <Link href="/shop" className="cr-glass-cta">
                      Order Now →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          03 — LUXURY CATEGORY CIRCLES
          ══════════════════════════════════════ */}
      <section className="cr-cat-bar" ref={catRef} aria-labelledby="cat-browser-title">
        <div className="cr-page-container">
          <div className="cr-cat-header reveal">
            <div>
              <span className="cr-sub-eyebrow">CURATED AISLES</span>
              <h2 id="cat-browser-title" className="cr-main-title">Shop by Category</h2>
            </div>
            <Link href="/shop" className="cr-view-all-link">Browse Full Store →</Link>
          </div>

          <div className="cr-cat-carousel reveal">
            {CATEGORIES.map(({ name, count, image, href }) => (
              <Link key={name} href={href} className="cr-cat-bubble" aria-label={`Browse ${name}`}>
                <div className="cr-cat-bubble__frame">
                  <img src={image} alt={name} loading="lazy" />
                  <div className="cr-cat-bubble__overlay" />
                </div>
                <span className="cr-cat-bubble__name">{name}</span>
                <span className="cr-cat-bubble__count">{count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          04 — INTERACTIVE NEED / TAB FILTER
          ══════════════════════════════════════ */}
      <section className="cr-curation-section" ref={filterRef} aria-labelledby="curation-heading">
        <div className="cr-page-container">
          <div className="cr-curation-top reveal">
            <div className="cr-curation-titles">
              <span className="cr-sub-eyebrow">SPECIALLY CURATED FOR YOU</span>
              <h2 id="curation-heading" className="cr-main-title">Explore Trending Favorites</h2>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="cr-tab-row" role="tablist" aria-label="Product Highlights">
              <button
                type="button"
                className={`cr-tab-pill${activeTab === 'all' ? ' cr-tab-pill--active' : ''}`}
                onClick={() => setActiveTab('all')}
                role="tab"
                aria-selected={activeTab === 'all'}
              >
                🌟 Best Sellers
              </button>
              <button
                type="button"
                className={`cr-tab-pill${activeTab === 'face' ? ' cr-tab-pill--active' : ''}`}
                onClick={() => setActiveTab('face')}
                role="tab"
                aria-selected={activeTab === 'face'}
              >
                ✨ Face Care & Glow
              </button>
              <button
                type="button"
                className={`cr-tab-pill${activeTab === 'body' ? ' cr-tab-pill--active' : ''}`}
                onClick={() => setActiveTab('body')}
                role="tab"
                aria-selected={activeTab === 'body'}
              >
                🧴 Body & Nourish
              </button>
              <button
                type="button"
                className={`cr-tab-pill${activeTab === 'groceries' ? ' cr-tab-pill--active' : ''}`}
                onClick={() => setActiveTab('groceries')}
                role="tab"
                aria-selected={activeTab === 'groceries'}
              >
                🍯 Groceries
              </button>
              <button
                type="button"
                className={`cr-tab-pill${activeTab === 'deals' ? ' cr-tab-pill--active' : ''}`}
                onClick={() => setActiveTab('deals')}
                role="tab"
                aria-selected={activeTab === 'deals'}
              >
                🔥 Special Deals
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="cr-showcase-grid reveal">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="cr-center-cta reveal">
            <Link href="/shop" className="cr-btn-outline-large">
              View All {allProducts.length} Items in Catalog →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          05 — 3-STEP BEAUTY ROUTINE SHOWCASE
          ══════════════════════════════════════ */}
      <section className="cr-routine-section" ref={routineRef} aria-labelledby="routine-heading">
        <div className="cr-page-container">
          <div className="cr-routine-header reveal">
            <span className="cr-sub-eyebrow">YOUR DAILY REGIMEN</span>
            <h2 id="routine-heading" className="cr-main-title">The 3-Step Ghanaian Glow Ritual</h2>
            <p className="cr-routine-sub">
              Carefully structured for deep hydration, sun defense, and radiant rejuvenation.
            </p>
          </div>

          <div className="cr-routine-grid">
            {ROUTINE_STEPS.map(({ step, title, desc, badge, image, link }) => (
              <Link key={step} href={link} className="cr-routine-card reveal" aria-label={`Explore ${title}`}>
                <div className="cr-routine-media">
                  <img src={image} alt={title} loading="lazy" />
                  <span className="cr-routine-badge">{badge}</span>
                </div>
                <div className="cr-routine-body">
                  <span className="cr-routine-num">{step}</span>
                  <h3 className="cr-routine-title">{title}</h3>
                  <p className="cr-routine-desc">{desc}</p>
                  <span className="cr-routine-link">Shop Products →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          06 — BENTO PROMOTIONAL BANNER GRID
          ══════════════════════════════════════ */}
      <section className="cr-bento-section" ref={bentoRef} aria-label="Curated Specials">
        <div className="cr-page-container">
          <div className="cr-bento-grid">
            {/* Large Card */}
            <Link href="/shop?category=skincare" className="cr-bento-card cr-bento-card--large reveal">
              <img src="/images/products/shea-butter.jpg" alt="African Shea Butter Treatment" className="cr-bento-bg" />
              <div className="cr-bento-grad" />
              <div className="cr-bento-content">
                <span className="cr-bento-pill">HERITAGE SKINCARE</span>
                <h3 className="cr-bento-h">Pure African Shea Butter & Body Therapies</h3>
                <p className="cr-bento-p">Raw, unrefined organic shea infused with calming herbal essential oils for all-day radiance.</p>
                <span className="cr-bento-action">Shop Shea Collection →</span>
              </div>
            </Link>

            {/* Split Stack */}
            <div className="cr-bento-stack">
              <Link href="/shop?category=skincare&subcategory=Face" className="cr-bento-card cr-bento-card--mini cr-bento-card--wine reveal reveal-delay-1">
                <img src="/images/products/vitamin-c-serum.jpg" alt="Vitamin C Brightening Shield" className="cr-bento-bg" />
                <div className="cr-bento-grad cr-bento-grad--wine" />
                <div className="cr-bento-content">
                  <span className="cr-bento-pill cr-bento-pill--gold">FACE RADIANCE</span>
                  <h4 className="cr-bento-h-sm">Clinical Brightening Serums</h4>
                  <span className="cr-bento-action-sm">Explore Face Care →</span>
                </div>
              </Link>

              <Link href="/shop?category=groceries" className="cr-bento-card cr-bento-card--mini cr-bento-card--sand reveal reveal-delay-2">
                <img src="/images/products/honey.jpg" alt="Pantry & Everyday Essentials" className="cr-bento-bg" />
                <div className="cr-bento-grad cr-bento-grad--sand" />
                <div className="cr-bento-content">
                  <span className="cr-bento-pill cr-bento-pill--dark">PANTRY STAPLES</span>
                  <h4 className="cr-bento-h-sm cr-bento-h-sm--dark">Everyday Groceries & Honey</h4>
                  <span className="cr-bento-action-sm cr-bento-action-sm--dark">Browse Essentials →</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          07 — TRUST PILLARS
          ══════════════════════════════════════ */}
      <section className="cr-trust-strip" ref={trustRef} aria-label="Why Shop With CR Cosmetics">
        <div className="cr-page-container">
          <div className="cr-trust-row">
            <div className="cr-trust-unit reveal">
              <span className="cr-trust-emoji">🛡️</span>
              <div>
                <h4 className="cr-trust-h">100% Authentic Products</h4>
                <p className="cr-trust-p">Directly imported & verified genuine beauty brands.</p>
              </div>
            </div>
            <div className="cr-trust-unit reveal reveal-delay-1">
              <span className="cr-trust-emoji">🚚</span>
              <div>
                <h4 className="cr-trust-h">Accra Same-Day Delivery</h4>
                <p className="cr-trust-p">Prompt dispatch to Botwe, Legon, Tema and beyond.</p>
              </div>
            </div>
            <div className="cr-trust-unit reveal reveal-delay-2">
              <span className="cr-trust-emoji">💳</span>
              <div>
                <h4 className="cr-trust-h">MoMo & Cash on Delivery</h4>
                <p className="cr-trust-p">Safe and flexible Ghanaian payment methods.</p>
              </div>
            </div>
            <div className="cr-trust-unit reveal reveal-delay-3">
              <span className="cr-trust-emoji">💬</span>
              <div>
                <h4 className="cr-trust-h">Direct WhatsApp Care</h4>
                <p className="cr-trust-p">Live support and custom orders at 059 215 3306.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          08 — BOTWE PHYSICAL STORE & HOURS
          ══════════════════════════════════════ */}
      <section className="cr-home-store-section" aria-labelledby="store-section-title">
        <div className="cr-page-container">
          <div className="cr-home-store-card">
            <div className="cr-home-store-info">
              <span className="cr-sub-eyebrow" style={{ color: '#C59B3F' }}>PHYSICAL STORE IN ACCRA</span>
              <h2 id="store-section-title" className="cr-store-main-h">Visit Us in Botwe</h2>
              <p className="cr-store-lead">
                Prefer to shop in person or inspect skincare textures before purchasing? Stop by our retail shop near Galaxy International School in Botwe.
              </p>
              <div className="cr-store-meta-grid">
                <div className="cr-store-meta-item">
                  <span className="cr-meta-icon">📍</span>
                  <div>
                    <strong>Store Address</strong>
                    <p>Near Galaxy International School, Botwe, Greater Accra</p>
                  </div>
                </div>
                <div className="cr-store-meta-item">
                  <span className="cr-meta-icon">🕒</span>
                  <div>
                    <strong>Working Hours</strong>
                    <p>Mon–Sat: 8:00 AM – 8:00 PM • Sun: 10:00 AM – 6:00 PM</p>
                  </div>
                </div>
              </div>
              <div className="cr-store-btn-row">
                <Link href="/shop" className="cr-btn-primary">
                  Shop Online Catalogue
                </Link>
                <a
                  href="https://wa.me/233592153306"
                  className="cr-btn-outline-wa"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💬 Chat on WhatsApp: 059 215 3306
                </a>
              </div>
            </div>
            <div className="cr-home-store-media">
              <img
                src="/images/hero-pedestal.jpg"
                alt="CR Cosmetics & Essentials Storefront Botwe"
                className="cr-store-feature-img"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          09 — WHATSAPP CONSULTATION CALLOUT
          ══════════════════════════════════════ */}
      <section className="cr-home-wa-callout" aria-label="WhatsApp Skincare Consultation">
        <div className="cr-page-container">
          <div className="cr-wa-callout-box">
            <div className="cr-wa-callout-text">
              <span className="cr-wa-badge">INSTANT SKINCARE HELP</span>
              <h3 className="cr-wa-title">Need help choosing the right skincare routine?</h3>
              <p className="cr-wa-desc">
                Tell us your skin concern (hydration, acne defense, glow restoration, or daily nourishment) and our Botwe team will recommend the ideal verified formulations directly on WhatsApp.
              </p>
            </div>
            <a
              href="https://wa.me/233592153306?text=Hello%20CR%20Cosmetics%2C%20I%20need%20skincare%20recommendations%20for%20my%20routine."
              className="cr-btn-wa-action"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>💬</span>
              <span>Chat With Our Team</span>
            </a>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* ─── Global Base ─── */
        .cr-home-root {
          padding-top: var(--header-h, 74px);
          background: #FAF8F6;
          overflow-x: hidden;
          font-family: var(--font-primary, sans-serif);
        }

        .cr-page-container {
          max-width: 1320px;
          margin: 0 auto;
          padding: 0 clamp(1.25rem, 4vw, 2.5rem);
        }

        .cr-sub-eyebrow {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #BE4D6E;
          display: block;
          margin-bottom: 0.35rem;
        }

        .cr-main-title {
          font-family: var(--font-display, serif);
          font-size: clamp(1.8rem, 3.2vw, 2.5rem);
          font-weight: 700;
          color: #161114;
          line-height: 1.15;
          letter-spacing: -0.01em;
        }

        /* ─── 01. Ticker ─── */
        .cr-ticker {
          background: #6B1733;
          color: #FFFFFF;
          height: 38px;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .cr-ticker-rail {
          display: flex;
          gap: 3rem;
          white-space: nowrap;
          animation: crTickerAnimation 35s linear infinite;
        }

        .cr-ticker-node {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
        }

        @keyframes crTickerAnimation {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* ─── 02. Hero Experience ─── */
        .cr-hero-wrap {
          position: relative;
          padding: clamp(3rem, 5.5vw, 5.5rem) 0 clamp(3.5rem, 6vw, 5.5rem);
          background: radial-gradient(circle at 10% 20%, rgba(248, 239, 243, 0.9) 0%, #FAF8F6 60%);
          border-bottom: 1px solid #EBE2E6;
          overflow: hidden;
        }

        .cr-hero-glow-left {
          position: absolute;
          top: -20%;
          left: -10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(197, 82, 114, 0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .cr-hero-glow-right {
          position: absolute;
          bottom: -15%;
          right: -5%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(197, 155, 63, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .cr-hero-layout {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: clamp(2.5rem, 5vw, 4.5rem);
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .cr-hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.35rem 0.85rem;
          background: #F8EFF3;
          border: 1px solid #F0E0E7;
          border-radius: 20px;
          color: #6B1733;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          margin-bottom: 1.25rem;
        }

        .cr-tag-spark {
          color: #C59B3F;
        }

        .cr-hero-heading {
          font-family: var(--font-display, serif);
          font-size: clamp(2.5rem, 4.8vw, 4.2rem);
          font-weight: 700;
          color: #161114;
          line-height: 1.08;
          letter-spacing: -0.02em;
          margin-bottom: 1.25rem;
        }

        .cr-heading-accent {
          font-family: var(--font-script, serif);
          font-style: italic;
          font-weight: 400;
          color: #C55272;
        }

        .cr-hero-description {
          font-size: clamp(0.95rem, 1.3vw, 1.12rem);
          color: #55454C;
          line-height: 1.65;
          max-width: 52ch;
          margin-bottom: 2rem;
        }

        .cr-hero-buttons {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 2.5rem;
        }

        .cr-btn-glow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.95rem 2rem;
          background: linear-gradient(135deg, #6B1733 0%, #480E21 100%);
          color: #FFFFFF;
          font-family: inherit;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 6px;
          box-shadow: 0 8px 24px -4px rgba(107, 23, 51, 0.35);
          transition: all 0.25s ease;
        }

        .cr-btn-glow:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px -4px rgba(107, 23, 51, 0.45);
        }

        .cr-btn-wa {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.95rem 1.6rem;
          background: #FFFFFF;
          border: 1.5px solid #D6CAD1;
          color: #161114;
          font-family: inherit;
          font-size: 0.88rem;
          font-weight: 700;
          text-decoration: none;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .cr-btn-wa:hover {
          border-color: #25D366;
          color: #1E8E49;
          background: #F0FDF4;
        }

        .cr-hero-social-proof {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid #EBE2E6;
        }

        .cr-avatar-stack {
          display: flex;
          align-items: center;
        }

        .cr-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid #FFFFFF;
          background: #F8EFF3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          margin-left: -8px;
        }

        .cr-avatar:first-child { margin-left: 0; }

        .cr-proof-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .cr-proof-stars {
          color: #C59B3F;
          font-size: 0.88rem;
          letter-spacing: 1px;
        }

        .cr-proof-text p {
          font-size: 0.78rem;
          color: #55454C;
          margin: 0;
        }

        /* ── Hero Presentation Card ── */
        .cr-hero-media-wrap {
          position: relative;
        }

        .cr-hero-media-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background: #FFFFFF;
          border: 1px solid #EBE2E6;
          box-shadow: 0 20px 48px rgba(107, 23, 51, 0.12), 0 4px 16px rgba(0, 0, 0, 0.04);
          aspect-ratio: 4 / 3.7;
        }

        .cr-hero-main-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .cr-hero-floating-glass {
          position: absolute;
          bottom: 16px;
          left: 16px;
          right: 16px;
          padding: 1rem 1.25rem;
          background: rgba(22, 17, 20, 0.88);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          color: #FFFFFF;
        }

        .cr-glass-badge {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #C59B3F;
          margin-bottom: 2px;
        }

        .cr-glass-title {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 0.4rem;
        }

        .cr-glass-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .cr-glass-price {
          font-size: 1rem;
          font-weight: 700;
          color: #FFFFFF;
        }

        .cr-glass-cta {
          font-size: 0.78rem;
          font-weight: 700;
          color: #C59B3F;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* ─── 03. Category Circles Carousel ─── */
        .cr-cat-bar {
          padding: clamp(3rem, 5vw, 4.5rem) 0;
          background: #FFFFFF;
          border-bottom: 1px solid #EBE2E6;
        }

        .cr-cat-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #F3ECF0;
        }

        .cr-view-all-link {
          font-size: 0.85rem;
          font-weight: 700;
          color: #6B1733;
          text-decoration: none;
        }

        .cr-cat-carousel {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 1.5rem;
        }

        .cr-cat-bubble {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          text-decoration: none;
          gap: 0.5rem;
        }

        .cr-cat-bubble__frame {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          background: #FAF8F6;
          border: 1.5px solid #EBE2E6;
          position: relative;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cr-cat-bubble:hover .cr-cat-bubble__frame {
          transform: translateY(-5px);
          border-color: #6B1733;
          box-shadow: 0 10px 24px rgba(107, 23, 51, 0.12);
        }

        .cr-cat-bubble__frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cr-cat-bubble:hover .cr-cat-bubble__frame img {
          transform: scale(1.08);
        }

        .cr-cat-bubble__name {
          font-size: 0.82rem;
          font-weight: 700;
          color: #161114;
          margin-top: 0.25rem;
          transition: color 0.2s;
        }

        .cr-cat-bubble:hover .cr-cat-bubble__name {
          color: #6B1733;
        }

        .cr-cat-bubble__count {
          font-size: 0.72rem;
          color: #96878F;
        }

        /* ─── 04. Interactive Curation & Tabs ─── */
        .cr-curation-section {
          padding: clamp(3.5rem, 6vw, 5rem) 0;
          background: #FAF8F6;
        }

        .cr-curation-top {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }

        .cr-tab-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .cr-tab-pill {
          padding: 0.6rem 1.15rem;
          background: #FFFFFF;
          border: 1px solid #EBE2E6;
          border-radius: 24px;
          font-family: inherit;
          font-size: 0.85rem;
          font-weight: 600;
          color: #55454C;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cr-tab-pill:hover {
          border-color: #6B1733;
          color: #6B1733;
        }

        .cr-tab-pill--active {
          background: #6B1733 !important;
          color: #FFFFFF !important;
          border-color: #6B1733 !important;
          box-shadow: 0 4px 14px rgba(107, 23, 51, 0.2);
        }

        .cr-showcase-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .cr-center-cta {
          display: flex;
          justify-content: center;
          margin-top: 3rem;
        }

        .cr-btn-outline-large {
          padding: 0.95rem 2.25rem;
          background: #FFFFFF;
          border: 1.5px solid #6B1733;
          border-radius: 6px;
          color: #6B1733;
          font-weight: 700;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-size: 0.85rem;
          transition: all 0.2s ease;
        }

        .cr-btn-outline-large:hover {
          background: #6B1733;
          color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(107, 23, 51, 0.2);
        }

        /* ─── 05. 3-Step Routine ─── */
        .cr-routine-section {
          padding: clamp(3.5rem, 6vw, 5rem) 0;
          background: #FFFFFF;
          border-top: 1px solid #EBE2E6;
          border-bottom: 1px solid #EBE2E6;
        }

        .cr-routine-header {
          text-align: center;
          max-width: 620px;
          margin: 0 auto 3rem;
        }

        .cr-routine-sub {
          font-size: 0.95rem;
          color: #6B5B63;
          margin-top: 0.5rem;
        }

        .cr-routine-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .cr-routine-card {
          background: #FAF8F6;
          border: 1px solid #EBE2E6;
          border-radius: 12px;
          overflow: hidden;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .cr-routine-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(107, 23, 51, 0.08);
          border-color: #C55272;
        }

        .cr-routine-media {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 2.8;
          overflow: hidden;
          background: #F8EFF3;
        }

        .cr-routine-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .cr-routine-card:hover .cr-routine-media img {
          transform: scale(1.05);
        }

        .cr-routine-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: #6B1733;
          color: #FFFFFF;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
        }

        .cr-routine-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .cr-routine-num {
          font-family: var(--font-display, serif);
          font-size: 1.5rem;
          font-weight: 700;
          color: #C59B3F;
          line-height: 1;
          margin-bottom: 0.25rem;
        }

        .cr-routine-title {
          font-family: var(--font-display, serif);
          font-size: 1.3rem;
          font-weight: 700;
          color: #161114;
          margin-bottom: 0.5rem;
        }

        .cr-routine-desc {
          font-size: 0.85rem;
          color: #55454C;
          line-height: 1.55;
          margin-bottom: 1.25rem;
          flex: 1;
        }

        .cr-routine-link {
          font-size: 0.82rem;
          font-weight: 700;
          color: #6B1733;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* ─── 06. Bento Specials ─── */
        .cr-bento-section {
          padding: clamp(3rem, 5vw, 4.5rem) 0;
          background: #FAF8F6;
        }

        .cr-bento-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 1.5rem;
        }

        .cr-bento-card {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          text-decoration: none;
          display: flex;
          align-items: flex-end;
          min-height: 440px;
        }

        .cr-bento-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cr-bento-card:hover .cr-bento-bg {
          transform: scale(1.04);
        }

        .cr-bento-grad {
          position: absolute;
          inset: 0;
          background: linear-gradient(0deg, rgba(22, 17, 20, 0.92) 0%, rgba(22, 17, 20, 0.4) 50%, transparent 100%);
        }

        .cr-bento-grad--wine {
          background: linear-gradient(0deg, rgba(107, 23, 51, 0.92) 0%, rgba(72, 14, 33, 0.5) 60%, transparent 100%);
        }

        .cr-bento-grad--sand {
          background: linear-gradient(0deg, rgba(250, 245, 235, 0.96) 0%, rgba(250, 245, 235, 0.7) 60%, transparent 100%);
        }

        .cr-bento-content {
          position: relative;
          z-index: 2;
          padding: clamp(1.5rem, 3vw, 2.5rem);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .cr-bento-pill {
          align-self: flex-start;
          padding: 0.25rem 0.6rem;
          background: #6B1733;
          color: #FFFFFF;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          border-radius: 4px;
        }

        .cr-bento-pill--gold {
          background: #C59B3F;
          color: #161114;
        }

        .cr-bento-pill--dark {
          background: #161114;
          color: #FFFFFF;
        }

        .cr-bento-h {
          font-family: var(--font-display, serif);
          font-size: clamp(1.6rem, 2.8vw, 2.2rem);
          font-weight: 700;
          color: #FFFFFF;
          line-height: 1.15;
        }

        .cr-bento-p {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.5;
          max-width: 44ch;
        }

        .cr-bento-action {
          font-size: 0.85rem;
          font-weight: 700;
          color: #C59B3F;
          margin-top: 0.5rem;
        }

        .cr-bento-stack {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .cr-bento-card--mini {
          min-height: 210px;
          flex: 1;
        }

        .cr-bento-h-sm {
          font-family: var(--font-display, serif);
          font-size: 1.35rem;
          font-weight: 700;
          color: #FFFFFF;
        }

        .cr-bento-h-sm--dark {
          color: #161114;
        }

        .cr-bento-action-sm {
          font-size: 0.78rem;
          font-weight: 700;
          color: #FFFFFF;
        }

        .cr-bento-action-sm--dark {
          color: #6B1733;
        }

        /* ─── 07. Trust Strip ─── */
        .cr-trust-strip {
          padding: 3rem 0;
          background: #FAF2F5;
          border-top: 1px solid #EBE2E6;
        }

        .cr-trust-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .cr-trust-unit {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .cr-trust-emoji {
          font-size: 1.75rem;
          line-height: 1;
        }

        .cr-trust-h {
          font-size: 0.88rem;
          font-weight: 700;
          color: #161114;
          margin-bottom: 0.2rem;
        }

        .cr-trust-p {
          font-size: 0.78rem;
          color: #6B5B63;
          line-height: 1.45;
        }

        /* ── Hero Authentic Badges ── */
        .cr-hero-badges-list {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .cr-hero-pill-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.35rem 0.75rem;
          background: #FFFFFF;
          border: 1px solid #EBE2E6;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #55454C;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
        }

        /* ── 08. Physical Store ── */
        .cr-home-store-section {
          padding: 4rem 0 2rem;
        }

        .cr-home-store-card {
          background: #140A0F;
          color: #FFFFFF;
          border-radius: 16px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1.25fr 0.85fr;
          align-items: center;
        }

        .cr-home-store-info {
          padding: clamp(2rem, 4vw, 3.5rem);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .cr-store-main-h {
          font-family: var(--font-display, serif);
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          font-weight: 700;
          color: #FFFFFF;
          line-height: 1.1;
        }

        .cr-store-lead {
          font-size: 0.95rem;
          color: #D6CAD1;
          line-height: 1.6;
        }

        .cr-store-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          padding: 1.25rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .cr-store-meta-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .cr-meta-icon {
          font-size: 1.25rem;
        }

        .cr-store-meta-item strong {
          display: block;
          font-size: 0.85rem;
          color: #FFFFFF;
          margin-bottom: 2px;
        }

        .cr-store-meta-item p {
          font-size: 0.8rem;
          color: #A3939B;
          line-height: 1.4;
          margin: 0;
        }

        .cr-store-btn-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .cr-btn-primary {
          padding: 0.85rem 1.6rem;
          background: #7B2347;
          color: #FFFFFF;
          font-weight: 700;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 0.82rem;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .cr-btn-primary:hover {
          background: #5E1734;
        }

        .cr-btn-outline-wa {
          padding: 0.85rem 1.6rem;
          background: transparent;
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          color: #FFFFFF;
          font-weight: 700;
          text-decoration: none;
          font-size: 0.82rem;
          border-radius: 6px;
          transition: border-color 0.2s, background 0.2s;
        }

        .cr-btn-outline-wa:hover {
          border-color: #25D366;
          background: rgba(37, 211, 102, 0.1);
        }

        .cr-home-store-media {
          height: 100%;
          min-height: 380px;
        }

        .cr-store-feature-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* ── 09. WhatsApp Callout ── */
        .cr-home-wa-callout {
          padding: 2.5rem 0 4.5rem;
        }

        .cr-wa-callout-box {
          background: #FFFFFF;
          border: 1.5px solid #EBE2E6;
          border-radius: 12px;
          padding: clamp(1.75rem, 3.5vw, 2.5rem);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          box-shadow: 0 4px 20px rgba(107, 23, 51, 0.04);
        }

        .cr-wa-badge {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #BE4D6E;
          text-transform: uppercase;
          display: block;
          margin-bottom: 0.35rem;
        }

        .cr-wa-title {
          font-family: var(--font-display, serif);
          font-size: 1.45rem;
          font-weight: 700;
          color: #161114;
          margin-bottom: 0.35rem;
        }

        .cr-wa-desc {
          font-size: 0.88rem;
          color: #6B5B63;
          line-height: 1.55;
          max-width: 58ch;
          margin: 0;
        }

        .cr-btn-wa-action {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: #1E8E49;
          color: #FFFFFF;
          padding: 0.9rem 1.6rem;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.88rem;
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.2s;
          flex-shrink: 0;
        }

        .cr-btn-wa-action:hover {
          background: #176F39;
        }

        /* ─── Responsive ─── */
        @media (max-width: 1024px) {
          .cr-hero-layout {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .cr-cat-carousel {
            grid-template-columns: repeat(3, 1fr);
          }
          .cr-showcase-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .cr-routine-grid {
            grid-template-columns: 1fr;
          }
          .cr-bento-grid {
            grid-template-columns: 1fr;
          }
          .cr-trust-row {
            grid-template-columns: repeat(2, 1fr);
          }
          .cr-home-store-card {
            grid-template-columns: 1fr;
          }
          .cr-home-store-media {
            height: 240px;
          }
          .cr-wa-callout-box {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 640px) {
          .cr-cat-carousel {
            grid-template-columns: repeat(2, 1fr);
          }
          .cr-showcase-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.85rem;
          }
          .cr-hero-buttons {
            flex-direction: column;
            align-items: stretch;
          }
          .cr-btn-glow, .cr-btn-wa {
            justify-content: center;
          }
          .cr-trust-row {
            grid-template-columns: 1fr;
          }
          .cr-store-meta-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
