'use client';

import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';

const CATEGORIES = [
  { label: 'Skincare',    href: '/shop?category=skincare',   img: '/images/categories/skincare.jpg' },
  { label: 'Body Care',   href: '/shop?category=skincare',   img: '/images/products/body-lotion.jpg' },
  { label: 'Fragrances',  href: '/shop?category=skincare',   img: '/images/products/3.jpeg' },
  { label: 'Makeup',      href: '/shop?category=skincare',   img: '/images/products/lip-balm.jpg' },
  { label: 'Face Care',   href: '/shop?category=skincare',   img: '/images/products/face-cleanser.jpg' },
  { label: 'Groceries',   href: '/shop?category=groceries',  img: '/images/categories/groceries.jpg' },
];

const TABS = [['all','All'],['beauty','Beauty'],['essentials','Essentials'],['offers','Offers']];

export default function HomeClient({ allProducts = [], featuredProducts = [] }) {
  const [tab, setTab] = React.useState('all');

  const shown = React.useMemo(() => {
    const base = featuredProducts.length ? featuredProducts : allProducts;
    if (tab === 'beauty')     return allProducts.filter(p => p.category !== 'groceries').slice(0,8);
    if (tab === 'essentials') return allProducts.filter(p => p.category === 'groceries').slice(0,8);
    if (tab === 'offers')     return allProducts.filter(p => p.originalPrice > p.price).slice(0,8);
    return base.slice(0,8);
  }, [tab, allProducts, featuredProducts]);

  return (
    <main className="h">

      {/* Hero */}
      <section className="h-hero">
        <div className="h-hero-text">
          <p className="h-label">CR Cosmetics &amp; Essentials &nbsp;&bull;&nbsp; Botwe, Accra</p>
          <h1>Beauty you can trust,<br />delivered across Ghana.</h1>
          <p className="h-sub">100% authentic skincare, fragrances &amp; everyday essentials. Near Galaxy International School, Botwe.</p>
          <div className="h-hero-btns">
            <Link href="/shop" className="h-btn h-btn-primary">Shop now</Link>
            <a href="https://wa.me/233592153306" className="h-btn h-btn-wa" target="_blank" rel="noopener noreferrer">WhatsApp us</a>
          </div>
        </div>
        <div className="h-hero-img">
          <img src="/images/categories/skincare.jpg" alt="Skincare collection" />
          <div className="h-hero-badge">
            <img src="/logo.jpeg" alt="CR Cosmetics" />
            <span>Est. Botwe, Accra</span>
          </div>
        </div>
      </section>

      {/* Trust */}
      <div className="h-trust">
        <span>🇬🇭 Same-day Accra delivery</span>
        <span>✓ 100% authentic products</span>
        <span>📱 MTN MoMo &amp; Telecel Cash</span>
        <span>🏬 In-store pickup, Botwe</span>
      </div>

      {/* Categories */}
      <section className="h-section">
        <h2 className="h-heading">Shop by category</h2>
        <div className="h-cats">
          {CATEGORIES.map(c => (
            <Link key={c.label} href={c.href} className="h-cat">
              <img src={c.img} alt={c.label} />
              <span>{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="h-section h-section-alt">
        <div className="h-products-head">
          <h2 className="h-heading">Featured products</h2>
          <div className="h-tabs">
            {TABS.map(([k,l]) => (
              <button key={k} className={'h-tab' + (tab===k?' h-tab-on':'')} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>
        </div>
        {shown.length ? (
          <div className="h-grid">
            {shown.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <p className="h-empty">No products here yet — check back soon.</p>
        )}
        <div className="h-center"><Link href="/shop" className="h-btn h-btn-outline">View all products</Link></div>
      </section>

      {/* Story */}
      <section className="h-story">
        <div className="h-story-img">
          <img src="/images/hero-pedestal.jpg" alt="CR Cosmetics store" />
        </div>
        <div className="h-story-text">
          <p className="h-label">About us</p>
          <h2>Your neighbourhood beauty store in Botwe.</h2>
          <p>We stock only genuine, verified products — skincare, fragrances, body care, and household essentials. Visit us near Galaxy International School, Botwe, Accra, or order online for fast delivery.</p>
          <div className="h-story-facts">
            <div><b>500+</b><small>Products</small></div>
            <div><b>100%</b><small>Authentic</small></div>
            <div><b>Fast</b><small>Delivery</small></div>
          </div>
          <Link href="/about" className="h-btn h-btn-outline">Learn more</Link>
        </div>
      </section>

      {/* WhatsApp */}
      <section className="h-wa">
        <img src="/logo.jpeg" alt="CR Cosmetics" className="h-wa-logo" />
        <div>
          <h2>Order directly on WhatsApp</h2>
          <p>Message us to place an order, ask about products, or check delivery times.</p>
          <a href="https://wa.me/233592153306" className="h-btn h-btn-wa h-btn-lg" target="_blank" rel="noopener noreferrer">
            Chat on WhatsApp
          </a>
        </div>
      </section>

      <style jsx>{`
        .h { background: #faf9f7; color: #1a1117; font-family: var(--font-primary, 'Outfit', sans-serif); }
        
        /* buttons */
        .h-btn { display: inline-flex; align-items: center; gap: 6px; padding: 12px 24px; font: 600 13px/1 var(--font-primary); text-decoration: none; border-radius: 6px; border: none; cursor: pointer; transition: all .2s; letter-spacing: .01em; }
        .h-btn-primary { background: #6b1733; color: #fff; }
        .h-btn-primary:hover { background: #4a0f24; }
        .h-btn-wa { background: #25d366; color: #fff; }
        .h-btn-wa:hover { background: #1db954; }
        .h-btn-outline { background: transparent; color: #1a1117; border: 1.5px solid #d4c8cc; }
        .h-btn-outline:hover { border-color: #6b1733; color: #6b1733; }
        .h-btn-lg { padding: 15px 32px; font-size: 14px; }

        /* hero */
        .h-hero { display: grid; grid-template-columns: 1fr 1fr; min-height: 520px; max-width: 1320px; margin: 0 auto; gap: 0; }
        .h-hero-text { display: flex; flex-direction: column; justify-content: center; padding: 60px 56px; }
        .h-label { font: 600 11px/1 var(--font-primary); letter-spacing: .14em; text-transform: uppercase; color: #9b6879; margin: 0 0 18px; }
        .h-hero-text h1 { font-family: var(--font-display, 'DM Serif Display', serif); font-size: clamp(32px, 4vw, 52px); line-height: 1.1; letter-spacing: -.02em; margin: 0 0 18px; color: #1a1117; font-weight: 400; }
        .h-sub { font: 400 15px/1.65 var(--font-primary); color: #7a6570; max-width: 420px; margin: 0 0 32px; }
        .h-hero-btns { display: flex; gap: 10px; flex-wrap: wrap; }
        .h-hero-img { position: relative; overflow: hidden; background: #f0e4e9; }
        .h-hero-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .h-hero-badge { position: absolute; bottom: 24px; left: 24px; background: rgba(255,255,255,.94); display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,.1); }
        .h-hero-badge img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1.5px solid #c59b3f; }
        .h-hero-badge span { font: 600 10px/1 var(--font-primary); letter-spacing: .1em; text-transform: uppercase; color: #7a6570; }

        /* trust */
        .h-trust { background: #fff; border-block: 1px solid #ece5e8; display: flex; justify-content: center; align-items: center; gap: 0; flex-wrap: wrap; }
        .h-trust span { font: 500 12px/1 var(--font-primary); color: #5a4850; padding: 14px 24px; border-right: 1px solid #ece5e8; }
        .h-trust span:last-child { border-right: none; }

        /* sections */
        .h-section { max-width: 1320px; margin: 0 auto; padding: 72px 40px; }
        .h-section-alt { background: #fff; max-width: none; padding: 72px 0; }
        .h-section-alt > * { max-width: 1320px; margin-left: auto; margin-right: auto; padding-inline: 40px; }
        .h-section-alt > .h-grid { max-width: 1320px; padding-inline: 40px; }
        .h-heading { font-family: var(--font-display, 'DM Serif Display', serif); font-size: clamp(24px, 3vw, 36px); font-weight: 400; letter-spacing: -.02em; color: #1a1117; margin: 0 0 36px; }

        /* categories */
        .h-cats { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
        .h-cat { display: flex; flex-direction: column; gap: 10px; text-decoration: none; }
        .h-cat img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 8px; transition: transform .3s ease; display: block; }
        .h-cat:hover img { transform: scale(1.04); }
        .h-cat span { font: 600 12px/1 var(--font-primary); letter-spacing: .04em; color: #1a1117; text-align: center; }

        /* products */
        .h-products-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
        .h-products-head .h-heading { margin: 0; }
        .h-tabs { display: flex; gap: 4px; background: #f3edf0; border-radius: 8px; padding: 4px; }
        .h-tab { background: transparent; border: none; padding: 8px 16px; font: 600 12px/1 var(--font-primary); letter-spacing: .04em; color: #7a6570; border-radius: 5px; cursor: pointer; transition: all .2s; }
        .h-tab-on { background: #fff; color: #6b1733; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
        .h-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
        .h-center { text-align: center; }
        .h-empty { color: #9a8590; padding: 48px 0; text-align: center; font-size: 14px; }

        /* story */
        .h-story { display: grid; grid-template-columns: 1fr 1fr; max-width: 1320px; margin: 0 auto; gap: 80px; padding: 80px 40px; align-items: center; }
        .h-story-img img { width: 100%; aspect-ratio: 4/5; object-fit: cover; border-radius: 8px; display: block; }
        .h-story-text h2 { font-family: var(--font-display, 'DM Serif Display', serif); font-size: clamp(26px, 3vw, 38px); font-weight: 400; letter-spacing: -.02em; margin: 0 0 16px; line-height: 1.2; }
        .h-story-text p { font: 400 15px/1.7 var(--font-primary); color: #7a6570; margin: 0 0 32px; }
        .h-story-facts { display: flex; gap: 40px; margin-bottom: 32px; padding: 24px 0; border-block: 1px solid #ece5e8; }
        .h-story-facts b { display: block; font-family: var(--font-display, serif); font-size: 28px; font-weight: 400; color: #6b1733; margin-bottom: 4px; }
        .h-story-facts small { font: 500 11px/1 var(--font-primary); letter-spacing: .08em; text-transform: uppercase; color: #9a8590; }

        /* whatsapp */
        .h-wa { background: #1a1117; color: #fff; display: flex; gap: 48px; align-items: center; padding: 72px 40px; max-width: none; }
        .h-wa > div { max-width: 500px; }
        .h-wa-logo { width: 96px; height: 96px; border-radius: 50%; object-fit: cover; border: 2px solid #c59b3f; flex-shrink: 0; margin: 0 auto; }
        .h-wa h2 { font-family: var(--font-display, 'DM Serif Display', serif); font-size: clamp(24px, 3vw, 36px); font-weight: 400; margin: 0 0 12px; }
        .h-wa p { font: 400 15px/1.65 var(--font-primary); color: rgba(255,255,255,.6); margin: 0 0 28px; }
        .h-wa { justify-content: center; }

        /* responsive */
        @media (max-width: 1024px) {
          .h-cats { grid-template-columns: repeat(3, 1fr); }
          .h-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .h-hero { grid-template-columns: 1fr; }
          .h-hero-text { padding: 48px 24px 36px; }
          .h-hero-img { min-height: 300px; }
          .h-story { grid-template-columns: 1fr; gap: 40px; padding: 60px 24px; }
          .h-cats { grid-template-columns: repeat(2, 1fr); }
          .h-grid { grid-template-columns: repeat(2, 1fr); }
          .h-section { padding: 60px 24px; }
          .h-section-alt > *, .h-section-alt > .h-grid { padding-inline: 24px; }
          .h-trust span { font-size: 11px; padding: 12px 14px; }
          .h-wa { flex-direction: column; text-align: center; padding: 60px 24px; gap: 28px; }
          .h-products-head { flex-direction: column; align-items: flex-start; }
        }
        @media (max-width: 480px) {
          .h-hero-text h1 { font-size: 30px; }
          .h-trust { flex-direction: column; gap: 0; }
          .h-trust span { border-right: none; border-bottom: 1px solid #ece5e8; width: 100%; text-align: center; }
          .h-trust span:last-child { border-bottom: none; }
        }
      `}</style>
    </main>
  );
}
