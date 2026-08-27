'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';

export default function HomeClient({ allProducts = [], featuredProducts = [] }) {
  const [activeTab, setActiveTab] = useState('all');

  const displayedProducts = useMemo(() => {
    const list = featuredProducts.length ? featuredProducts : allProducts;
    if (activeTab === 'skincare') return list.filter((p) => p.category === 'skincare').slice(0, 8);
    if (activeTab === 'groceries') return list.filter((p) => p.category === 'groceries').slice(0, 8);
    if (activeTab === 'sale') return list.filter((p) => p.originalPrice > p.price).slice(0, 8);
    return list.slice(0, 8);
  }, [activeTab, allProducts, featuredProducts]);

  return (
    <div className="home-page">

      {/* ── 1. Hero Section (Clean & Simple) ── */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-text">
            <h1 className="hero-title">
              Authentic skincare &amp;<br />
              everyday groceries.
            </h1>
            <p className="hero-desc">
              Your neighbourhood store in Botwe, Accra for verified beauty, body care, and pantry essentials. Same-day delivery across Accra.
            </p>
            <div className="hero-btns">
              <Link href="/shop?category=skincare" className="btn btn-dark">
                Shop Skincare
              </Link>
              <Link href="/shop?category=groceries" className="btn btn-outline">
                Shop Groceries
              </Link>
            </div>
          </div>

          <div className="hero-image-wrap">
            <img
              src="/images/hero-campaign.jpg"
              alt="CR Cosmetics & Essentials"
              className="hero-image"
            />
          </div>
        </div>
      </section>

      {/* ── 2. Two Main Departments (Simple 2-Column Cards) ── */}
      <section className="departments-section">
        <div className="container">
          <div className="dept-grid">
            
            {/* Skincare Card */}
            <div className="dept-card">
              <div className="dept-img-box">
                <img src="/images/categories/skincare.jpg" alt="Skincare and Beauty" />
              </div>
              <div className="dept-content">
                <h2>Skincare &amp; Body Care</h2>
                <p>Authentic cleansers, hydrating serums, face creams, and glow body lotions.</p>
                <Link href="/shop?category=skincare" className="dept-link">
                  Browse Skincare &rarr;
                </Link>
              </div>
            </div>

            {/* Groceries Card */}
            <div className="dept-card">
              <div className="dept-img-box">
                <img src="/images/categories/groceries.jpg" alt="Groceries and Essentials" />
              </div>
              <div className="dept-content">
                <h2>Groceries &amp; Essentials</h2>
                <p>Fragrant jasmine rice, extra virgin olive oil, pure honey &amp; raw shea butter.</p>
                <Link href="/shop?category=groceries" className="dept-link">
                  Browse Groceries &rarr;
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. Featured Products Grid ── */}
      <section className="featured-section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-sub">Popular picks available right now in store.</p>
            </div>

            {/* Simple Filter Tabs */}
            <div className="simple-tabs">
              <button
                type="button"
                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Items
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'skincare' ? 'active' : ''}`}
                onClick={() => setActiveTab('skincare')}
              >
                Skincare
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'groceries' ? 'active' : ''}`}
                onClick={() => setActiveTab('groceries')}
              >
                Groceries
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'sale' ? 'active' : ''}`}
                onClick={() => setActiveTab('sale')}
              >
                On Sale
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="products-grid">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="view-all-wrap">
            <Link href="/shop" className="btn btn-outline btn-lg">
              View All Products ({allProducts.length})
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. Simple Store & Contact Strip ── */}
      <section className="contact-strip">
        <div className="container contact-box">
          <div>
            <h3>Visit Us in Botwe or Order on WhatsApp</h3>
            <p>Location: Near Galaxy International School, Botwe, Accra &bull; Mon–Sat 9am–8pm</p>
          </div>
          <div className="contact-actions">
            <a
              href="https://wa.me/233592153306"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              💬 WhatsApp Order (059 215 3306)
            </a>
            <Link href="/contact" className="btn btn-outline-white">
              Contact &amp; Map
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .home-page {
          background: #FFFFFF;
          color: #111111;
          font-family: var(--font-primary, sans-serif);
        }

        .container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        /* ── Hero ── */
        .hero-section {
          padding: 3.5rem 0 4rem;
          background: #FAFAFA;
          border-bottom: 1px solid #EAEAEA;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 3rem;
          align-items: center;
        }
        .hero-title {
          font-family: var(--font-display, serif);
          font-size: clamp(2.2rem, 4.5vw, 3.8rem);
          font-weight: 700;
          line-height: 1.1;
          color: #111111;
          margin: 0 0 1rem;
          letter-spacing: -0.02em;
        }
        .hero-desc {
          font-size: 1rem;
          line-height: 1.6;
          color: #555555;
          margin: 0 0 2rem;
          max-width: 480px;
        }
        .hero-btns {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .hero-image-wrap {
          border-radius: 10px;
          overflow: hidden;
          aspect-ratio: 4 / 3;
          background: #EAEAEA;
        }
        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* ── Buttons ── */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 24px;
          font-size: 0.88rem;
          font-weight: 600;
          border-radius: 6px;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.15s ease;
          border: 1.5px solid transparent;
        }
        .btn-dark {
          background: #111111;
          color: #FFFFFF;
          border-color: #111111;
        }
        .btn-dark:hover {
          background: #333333;
        }
        .btn-outline {
          background: transparent;
          color: #111111;
          border-color: #CCCCCC;
        }
        .btn-outline:hover {
          border-color: #111111;
          background: #F5F5F5;
        }
        .btn-lg {
          padding: 14px 32px;
          font-size: 0.95rem;
        }
        .btn-whatsapp {
          background: #25D366;
          color: #FFFFFF;
        }
        .btn-whatsapp:hover {
          background: #1EBE5B;
        }
        .btn-outline-white {
          background: transparent;
          color: #FFFFFF;
          border-color: rgba(255, 255, 255, 0.4);
        }
        .btn-outline-white:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #FFFFFF;
        }

        /* ── Departments ── */
        .departments-section {
          padding: 4rem 0 3rem;
        }
        .dept-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        .dept-card {
          background: #FAFAFA;
          border: 1px solid #EAEAEA;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .dept-img-box {
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: #EEEEEE;
        }
        .dept-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .dept-card:hover .dept-img-box img {
          transform: scale(1.02);
        }
        .dept-content {
          padding: 1.5rem;
        }
        .dept-content h2 {
          font-family: var(--font-display, serif);
          font-size: 1.4rem;
          font-weight: 700;
          color: #111111;
          margin: 0 0 0.5rem;
        }
        .dept-content p {
          font-size: 0.88rem;
          color: #555555;
          margin: 0 0 1rem;
          line-height: 1.5;
        }
        .dept-link {
          font-size: 0.85rem;
          font-weight: 600;
          color: #111111;
          text-decoration: none;
        }
        .dept-link:hover {
          text-decoration: underline;
        }

        /* ── Featured Products ── */
        .featured-section {
          padding: 3rem 0 5rem;
        }
        .section-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 2rem;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .section-title {
          font-family: var(--font-display, serif);
          font-size: 1.8rem;
          font-weight: 700;
          color: #111111;
          margin: 0 0 0.25rem;
        }
        .section-sub {
          font-size: 0.88rem;
          color: #666666;
          margin: 0;
        }

        .simple-tabs {
          display: flex;
          gap: 6px;
          background: #F5F5F5;
          padding: 4px;
          border-radius: 6px;
        }
        .tab-btn {
          background: none;
          border: none;
          padding: 6px 14px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #555555;
          border-radius: 4px;
          cursor: pointer;
        }
        .tab-btn.active {
          background: #111111;
          color: #FFFFFF;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        .view-all-wrap {
          text-align: center;
        }

        /* ── Contact Strip ── */
        .contact-strip {
          padding: 0 0 4rem;
        }
        .contact-box {
          background: #111111;
          color: #FFFFFF;
          border-radius: 8px;
          padding: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
        }
        .contact-box h3 {
          font-family: var(--font-display, serif);
          font-size: 1.4rem;
          font-weight: 700;
          margin: 0 0 0.4rem;
        }
        .contact-box p {
          font-size: 0.88rem;
          color: #BBBBBB;
          margin: 0;
        }
        .contact-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        /* ── Responsive ── */
        @media (max-width: 960px) {
          .hero-grid { grid-template-columns: 1fr; gap: 2rem; }
          .dept-grid { grid-template-columns: 1fr; }
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        }

        @media (max-width: 500px) {
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
          .contact-box { padding: 1.5rem; }
        }
      `}</style>
    </div>
  );
}
