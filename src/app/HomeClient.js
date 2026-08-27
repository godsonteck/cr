'use client';

import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';

const categories = [
  { title: 'Makeup', href: '/shop?category=skincare&subcategory=makeup', image: '/images/products/lip-balm.jpg' },
  { title: 'Skincare', href: '/shop?category=skincare', image: '/images/categories/skincare.jpg' },
  { title: 'Fragrances', href: '/shop?category=skincare&subcategory=fragrances', image: '/images/products/3.jpeg' },
  { title: 'Body Care', href: '/shop?category=skincare&subcategory=body', image: '/images/products/body-lotion.jpg' },
  { title: 'Beauty Essentials', href: '/shop?category=skincare', image: '/images/products/face-cleanser.jpg' },
  { title: 'Everyday Essentials', href: '/shop?category=groceries', image: '/images/categories/groceries.jpg' },
];

const promoCards = [
  { eyebrow: 'NEW ARRIVALS', title: 'Just In!', copy: 'Fresh beauty finds selected for your routine.', href: '/shop', image: '/images/products/face-moisturizer.jpg', tone: 'rose' },
  { eyebrow: 'YOUR ROUTINE', title: 'Find your perfect match.', copy: 'Explore skincare by what your skin needs.', href: '/shop?category=skincare', image: '/images/categories/skincare.jpg', tone: 'cream' },
  { eyebrow: 'CR EDIT', title: 'Curated with care.', copy: 'Only the products we would recommend ourselves.', href: '/shop', image: '/images/hero-pedestal.jpg', tone: 'berry' },
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
      <section className="cr-home-hero">
        <div className="cr-home-hero-copy">
          <span className="cr-home-overline">CR COSMETICS & ESSENTIALS · BOTWE</span>
          <h1>Your Beauty.<br />Your Essentials.<br /><em>Your Glow.</em></h1>
          <p>Carefully selected beauty and everyday essentials just for you.</p>
          <div className="cr-home-actions"><Link href="/shop" className="cr-home-primary">Shop now <span>→</span></Link><Link href="/shop?category=groceries" className="cr-home-secondary">Explore essentials</Link></div>
          <div className="cr-home-benefits"><span><b>✦</b><strong>100% AUTHENTIC</strong><small>Original products</small></span><span><b>▣</b><strong>SAFE PAYMENT</strong><small>Secure checkout</small></span><span><b>▱</b><strong>FAST DELIVERY</strong><small>Across Ghana</small></span></div>
        </div>
        <div className="cr-home-hero-image"><img src="/images/hero-pedestal.jpg" alt="Curated CR Cosmetics beauty collection" /><div className="cr-hero-corner">EST. · BOTWE<br />ACCRA, GH</div></div>
      </section>

      <section className="cr-home-categories"><div className="cr-home-section-heading"><span>DISCOVER</span><h2>Shop by category</h2><i /></div><div className="cr-category-strip">{categories.map((category) => <Link href={category.href} key={category.title} className="cr-category-tile"><div><img src={category.image} alt="" /></div><strong>{category.title}</strong><span>Shop ↗</span></Link>)}</div></section>

      <section className="cr-home-promos"><div className="cr-promo-grid">{promoCards.map((card) => <Link href={card.href} key={card.title} className={`cr-promo-card cr-promo-card--${card.tone}`}><img src={card.image} alt="" /><div className="cr-promo-wash" /><div className="cr-promo-content"><span>{card.eyebrow}</span><h3>{card.title}</h3><p>{card.copy}</p><b>Explore <i>→</i></b></div></Link>)}</div></section>

      <section className="cr-home-products"><div className="cr-products-heading"><div><span>THE CR EDIT</span><h2>Beauty, chosen well.</h2></div><Link href="/shop">View all products →</Link></div><div className="cr-product-tabs" role="tablist">{[['bestsellers','Best sellers'],['beauty','Beauty'],['essentials','Essentials'],['offers','Offers']].map(([key,label]) => <button key={key} role="tab" aria-selected={activeTab === key} className={activeTab === key ? 'active' : ''} onClick={() => setActiveTab(key)}>{label}</button>)}</div>{products.length ? <div className="cr-reference-product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="cr-home-empty">No products in this collection yet.</div>}</section>

      <section className="cr-home-trust"><div><span>◌</span><strong>AUTHENTIC PRODUCTS</strong><small>We sell 100% original products</small></div><div><span>▣</span><strong>SECURE PAYMENT</strong><small>Multiple payment options</small></div><div><span>▱</span><strong>FAST & RELIABLE DELIVERY</strong><small>Delivered to your door</small></div><div><span>♙</span><strong>CUSTOMER CARE</strong><small>We are here to help you</small></div></section>

      <section className="cr-home-newsletter"><div className="cr-newsletter-copy"><span>STAY GLOWING</span><h2>Good things are worth knowing about.</h2><p>Get updates on new arrivals, special offers and beauty tips from CR.</p></div><form onSubmit={(e) => e.preventDefault()}><input type="email" placeholder="Enter your email address" aria-label="Email address" /><button>Subscribe <span>→</span></button></form></section>
    </main>
  );
}
