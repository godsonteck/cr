'use client';

import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';

const categories = [
  { title: 'Skincare', href: '/shop?category=skincare', image: '/images/categories/skincare.jpg' },
  { title: 'Makeup & Beauty', href: '/shop?category=skincare&subcategory=makeup', image: '/images/products/lip-balm.jpg' },
  { title: 'Fragrances', href: '/shop?category=skincare&subcategory=fragrances', image: '/images/products/3.jpeg' },
  { title: 'Body Care & Soaps', href: '/shop?category=skincare&subcategory=body', image: '/images/products/body-lotion.jpg' },
  { title: 'Facial Cleansers', href: '/shop?category=skincare', image: '/images/products/face-cleanser.jpg' },
  { title: 'Everyday Groceries', href: '/shop?category=groceries', image: '/images/categories/groceries.jpg' },
];

const promoCards = [
  { eyebrow: 'NEW ARRIVALS', title: 'Just In Beauty', copy: 'Fresh, 100% genuine skincare finds selected for your daily routine.', href: '/shop', image: '/images/products/face-moisturizer.jpg', tone: 'rose' },
  { eyebrow: 'GHANA FAVOURITES', title: 'Botwe Store Curations', copy: 'Best-selling serums, body oils, and personal care staples.', href: '/shop?category=skincare', image: '/images/categories/skincare.jpg', tone: 'cream' },
  { eyebrow: 'CR PROMISE', title: 'Curated with Care', copy: 'Only authentic products we test and trust for Ghanaian skin.', href: '/shop', image: '/images/hero-pedestal.jpg', tone: 'berry' },
];

export default function HomeClient({ allProducts = [], featuredProducts = [] }) {
  const [activeTab, setActiveTab] = React.useState('bestsellers');
  const bestSellers = React.useMemo(() => {
    const marked = allProducts.filter((p) => p.badge === 'bestseller');
    return (marked.length ? marked : featuredProducts).slice(0, 6);
  }, [allProducts, featuredProducts]);

  const products = React.useMemo(() => {
    if (activeTab === 'beauty') return allProducts.filter((p) => p.category !== 'groceries').slice(0, 6);
    if (activeTab === 'essentials') return allProducts.filter((p) => p.category === 'groceries').slice(0, 6);
    if (activeTab === 'offers') return allProducts.filter((p) => p.originalPrice || p.badge === 'sale').slice(0, 6);
    return bestSellers;
  }, [activeTab, allProducts, bestSellers]);

  return (
    <main className="cr-reference-home">
      {/* ─── Hero Section ─── */}
      <section className="cr-home-hero">
        <div className="cr-home-hero-copy">
          <span className="cr-home-overline">CR COSMETICS &amp; ESSENTIALS · BOTWE, ACCRA</span>
          <h1>Everyday Luxury.<br />Authentic Beauty.<br /><em>Delivered in Ghana.</em></h1>
          <p>Your trusted Ghanaian store for 100% genuine skincare, luxury fragrances, personal care, and everyday household essentials.</p>
          <div className="cr-home-actions">
            <Link href="/shop" className="cr-home-primary">Shop Collection <span>→</span></Link>
            <Link href="/shop?category=groceries" className="cr-home-secondary">Everyday Essentials</Link>
          </div>
          <div className="cr-home-benefits">
            <span><b>🇬🇭</b><strong>SAME-DAY ACCRA</strong><small>Botwe &amp; environs</small></span>
            <span><b>✦</b><strong>100% GENUINE</strong><small>Original brands</small></span>
            <span><b>⚡</b><strong>PAY VIA MOMO</strong><small>MTN &amp; Telecel Cash</small></span>
          </div>
        </div>
        <div className="cr-home-hero-image">
          <img src="/images/hero-pedestal.jpg" alt="Curated CR Cosmetics beauty collection in Accra Ghana" />
          <div className="cr-hero-corner">EST. BOTWE · ACCRA<br />GALAXY INT. SCHOOL ROAD</div>
        </div>
      </section>

      {/* ─── Brand Heritage Banner ─── */}
      <section className="cr-brand-identity-banner">
        <div className="cr-brand-banner-inner">
          <div className="cr-brand-emblem-badge">
            <img src="/logo.jpeg" alt="CR Emblem Logo" className="cr-brand-banner-logo" />
          </div>
          <div className="cr-brand-banner-text">
            <span className="cr-brand-badge-pill">OUR BOTWE STORE PROMISE</span>
            <h2>Authentic Skincare &amp; Daily Essentials Brought Close To Home.</h2>
            <p>
              Located near Galaxy International School in Botwe, Accra, <strong>CR Cosmetics &amp; Essentials</strong> bridges luxury beauty and household convenience. We source 100% original skincare, sunscreens, fragrances, and groceries with fast local delivery and seamless Mobile Money payments across Ghana.
            </p>
          </div>
          <div className="cr-brand-banner-features">
            <div className="cr-bfeature"><span>✦</span> 100% Authentic Product Guarantee</div>
            <div className="cr-bfeature"><span>🇬🇭</span> Fast Accra &amp; Nationwide Delivery</div>
            <div className="cr-bfeature"><span>📱</span> Easy MoMo &amp; Cash Payment</div>
            <div className="cr-bfeature"><span>🏬</span> In-Store Pickup in Botwe</div>
          </div>
        </div>
      </section>

      {/* ─── Categories Strip ─── */}
      <section className="cr-home-categories">
        <div className="cr-home-section-heading">
          <span>CURATED COLLECTIONS</span>
          <h2>Shop by category</h2>
          <i />
        </div>
        <div className="cr-category-strip">
          {categories.map((category) => (
            <Link href={category.href} key={category.title} className="cr-category-tile">
              <div><img src={category.image} alt={category.title} /></div>
              <strong>{category.title}</strong>
              <span>Shop ↗</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Promo Highlights ─── */}
      <section className="cr-home-promos">
        <div className="cr-promo-grid">
          {promoCards.map((card) => (
            <Link href={card.href} key={card.title} className={`cr-promo-card cr-promo-card--${card.tone}`}>
              <img src={card.image} alt={card.title} />
              <div className="cr-promo-wash" />
              <div className="cr-promo-content">
                <span>{card.eyebrow}</span>
                <h3>{card.title}</h3>
                <p>{card.copy}</p>
                <b>Explore <i>→</i></b>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Products Feed ─── */}
      <section className="cr-home-products">
        <div className="cr-products-heading">
          <div>
            <span>THE CR EDIT</span>
            <h2>Beauty &amp; Care, chosen well.</h2>
          </div>
          <Link href="/shop">View all products →</Link>
        </div>
        <div className="cr-product-tabs" role="tablist">
          {[['bestsellers','Best sellers'],['beauty','Beauty'],['essentials','Essentials'],['offers','Offers']].map(([key,label]) => (
            <button key={key} role="tab" aria-selected={activeTab === key} className={activeTab === key ? 'active' : ''} onClick={() => setActiveTab(key)}>
              {label}
            </button>
          ))}
        </div>
        {products.length ? (
          <div className="cr-reference-product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="cr-home-empty">No products in this collection yet.</div>
        )}
      </section>

      {/* ─── Trust Bar ─── */}
      <section className="cr-home-trust">
        <div><span>🇬🇭</span><strong>ACCRA &amp; BOTWE STORE</strong><small>Visit us near Galaxy Int. School</small></div>
        <div><span>✦</span><strong>100% ORIGINAL GUARANTEE</strong><small>Verified authentic products</small></div>
        <div><span>⚡</span><strong>MOBILE MONEY &amp; CASH</strong><small>MTN MoMo &amp; Telecel Cash</small></div>
        <div><span>🚚</span><strong>FAST DELIVERY GHANA</strong><small>Direct to your doorstep</small></div>
      </section>

      {/* ─── Newsletter ─── */}
      <section className="cr-home-newsletter">
        <div className="cr-newsletter-copy">
          <span>STAY GLOWING WITH CR</span>
          <h2>Be the first to know.</h2>
          <p>Subscribe for restock updates, local beauty tips, and exclusive CR store offers in Accra.</p>
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Enter your email address" aria-label="Email address" />
          <button>Subscribe <span>→</span></button>
        </form>
      </section>
    </main>
  );
}
