'use client';

import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';

const categoryCards = [
  { title: 'Skincare', href: '/shop?category=skincare', image: '/images/categories/skincare.jpg', tone: 'light' },
  { title: 'Face Care', href: '/shop?subcategory=face', image: '/images/products/face-cleanser.jpg', tone: 'soft' },
  { title: 'Body Care', href: '/shop?subcategory=body', image: '/images/products/body-lotion.jpg', tone: 'warm' },
  { title: 'Groceries', href: '/shop?category=groceries', image: '/images/categories/groceries.jpg', tone: 'cream' },
];

export default function HomeClient({ allProducts = [], featuredProducts = [] }) {
  const [activeTab, setActiveTab] = React.useState('featured');

  const bestSellers = React.useMemo(() => {
    const marked = allProducts.filter((p) => p.badge === 'bestseller');
    return (marked.length ? marked : featuredProducts).slice(0, 8);
  }, [allProducts, featuredProducts]);

  const filteredProducts = React.useMemo(() => {
    if (activeTab === 'beauty') {
      return allProducts.filter((p) => p.category !== 'groceries').slice(0, 8);
    }
    if (activeTab === 'essentials') {
      return allProducts.filter((p) => p.category === 'groceries').slice(0, 8);
    }
    if (activeTab === 'offers') {
      return allProducts.filter((p) => p.originalPrice || p.badge === 'sale').slice(0, 8);
    }
    return bestSellers;
  }, [activeTab, allProducts, bestSellers]);

  return (
    <main className="cr-redesign-home">
      <section className="cr-editorial-hero">
        <div className="cr-editorial-hero__copy">
          <span className="cr-eyebrow">CR COSMETICS &amp; ESSENTIALS · BOTWE</span>
          <h1>Beauty, care &amp; everyday essentials — <em>beautifully simple.</em></h1>
          <p>
            Thoughtfully selected beauty products and everyday essentials, available in-store and online from Botwe, Accra.
          </p>
          <div className="cr-hero-actions">
            <Link href="/shop" className="cr-redesign-btn cr-redesign-btn--dark">Shop the collection</Link>
            <Link href="/shop?category=groceries" className="cr-redesign-btn cr-redesign-btn--quiet">Explore essentials</Link>
          </div>
          <div className="cr-hero-note">
            <span>Near Galaxy International School</span>
            <span aria-hidden="true">•</span>
            <span>Botwe, Accra</span>
          </div>
        </div>
        <div className="cr-editorial-hero__visual">
          <div className="cr-hero-image-frame">
            <img src="/images/hero-pedestal.jpg" alt="CR Cosmetics beauty collection" />
          </div>
          <div className="cr-hero-stamp">BEAUTY<br />ESSENTIALS</div>
        </div>
      </section>

      <section className="cr-trust-row" aria-label="Shopping benefits">
        <div><strong>Curated products</strong><span>Beauty &amp; everyday essentials</span></div>
        <div><strong>Easy ordering</strong><span>Shop online or message us</span></div>
        <div><strong>Local pickup</strong><span>Conveniently located in Botwe</span></div>
        <div><strong>WhatsApp support</strong><span>Help when you need it</span></div>
      </section>

      <section className="cr-redesign-section cr-redesign-section--categories">
        <div className="cr-section-intro">
          <div>
            <span className="cr-eyebrow">SHOP YOUR WAY</span>
            <h2>Start with what you need.</h2>
          </div>
          <p>From everyday skincare to practical essentials, find your next favourite in a few taps.</p>
        </div>
        <div className="cr-category-editorial-grid">
          {categoryCards.map((category) => (
            <Link key={category.title} href={category.href} className={`cr-category-editorial-card cr-category-editorial-card--${category.tone}`}>
              <img src={category.image} alt="" />
              <div className="cr-category-editorial-card__overlay" />
              <div className="cr-category-editorial-card__content">
                <span>SHOP</span>
                <h3>{category.title}</h3>
                <span className="cr-category-link">Discover <b>↗</b></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="cr-redesign-section cr-product-section">
        <div className="cr-section-intro cr-section-intro--products">
          <div>
            <span className="cr-eyebrow">THE CR EDIT</span>
            <h2>Products worth coming back for.</h2>
          </div>
          <Link href="/shop" className="cr-text-link">View all products <span>→</span></Link>
        </div>
        <div className="cr-product-tabs" role="tablist" aria-label="Product collections">
          {[['featured', 'Featured'], ['beauty', 'Beauty'], ['essentials', 'Essentials'], ['offers', 'Offers']].map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={activeTab === key} className={activeTab === key ? 'is-active' : ''} onClick={() => setActiveTab(key)}>
              {label}
            </button>
          ))}
        </div>
        {filteredProducts.length > 0 ? (
          <div className="cr-redesign-product-grid">
            {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="cr-home-empty">There are no products in this collection yet.</div>
        )}
      </section>

      <section className="cr-story-band">
        <div className="cr-story-band__image"><img src="/images/categories/skincare.jpg" alt="Skincare products at CR Cosmetics" /></div>
        <div className="cr-story-band__copy">
          <span className="cr-eyebrow">A STORE MADE FOR REAL LIFE</span>
          <h2>Beauty should feel personal. Shopping should feel easy.</h2>
          <p>CR Cosmetics &amp; Essentials brings beauty care and practical everyday products together, so you can find what you need without the noise.</p>
          <div className="cr-story-points">
            <div><span>01</span><strong>Explore</strong><p>Browse by category, need or product.</p></div>
            <div><span>02</span><strong>Choose</strong><p>See clear prices and product details.</p></div>
            <div><span>03</span><strong>Order</strong><p>Checkout online or get help on WhatsApp.</p></div>
          </div>
          <Link href="/about" className="cr-redesign-btn cr-redesign-btn--outline">Discover CR Cosmetics</Link>
        </div>
      </section>

      <section className="cr-redesign-section cr-visit-section">
        <div className="cr-visit-card">
          <div>
            <span className="cr-eyebrow">COME SAY HELLO</span>
            <h2>Visit us in Botwe.</h2>
            <p>Find CR Cosmetics &amp; Essentials near Galaxy International School, Botwe, Accra.</p>
            <div className="cr-visit-actions">
              <Link href="/contact" className="cr-redesign-btn cr-redesign-btn--dark">Contact us</Link>
              <Link href="https://wa.me/233000000000" className="cr-text-link" target="_blank">Chat on WhatsApp ↗</Link>
            </div>
          </div>
          <div className="cr-visit-card__mark">CR<span>+</span></div>
        </div>
      </section>

      <section className="cr-final-cta">
        <span className="cr-eyebrow">READY WHEN YOU ARE</span>
        <h2>Find something you’ll love.</h2>
        <p>Explore the latest beauty products and everyday essentials from CR Cosmetics.</p>
        <Link href="/shop" className="cr-redesign-btn cr-redesign-btn--cream">Shop now</Link>
      </section>
    </main>
  );
}
