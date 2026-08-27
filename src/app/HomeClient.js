'use client';

import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';

const categories = [
  { title: 'Skincare', count: '80+ products', href: '/shop?category=skincare', image: '/images/categories/skincare.jpg', accent: '#8d3d59' },
  { title: 'Body Care', count: 'Oils & Butters', href: '/shop?category=skincare&subcategory=body', image: '/images/products/body-lotion.jpg', accent: '#6b1733' },
  { title: 'Fragrances', count: 'Imported', href: '/shop?category=skincare&subcategory=fragrances', image: '/images/products/3.jpeg', accent: '#c59b3f' },
  { title: 'Makeup', count: 'Lips & Eyes', href: '/shop?category=skincare&subcategory=makeup', image: '/images/products/lip-balm.jpg', accent: '#8d3d59' },
  { title: 'Face Care', count: 'Cleansers & Masks', href: '/shop?category=skincare', image: '/images/products/face-cleanser.jpg', accent: '#6b1733' },
  { title: 'Groceries', count: 'Everyday Essentials', href: '/shop?category=groceries', image: '/images/categories/groceries.jpg', accent: '#c59b3f' },
];

const TABS = [
  ['bestsellers', 'Bestsellers'],
  ['beauty', 'Beauty'],
  ['essentials', 'Essentials'],
  ['offers', 'On Offer'],
];

export default function HomeClient({ allProducts = [], featuredProducts = [] }) {
  const [activeTab, setActiveTab] = React.useState('bestsellers');

  const bestSellers = React.useMemo(() => {
    const marked = allProducts.filter((p) => p.badge === 'bestseller');
    return (marked.length ? marked : featuredProducts).slice(0, 8);
  }, [allProducts, featuredProducts]);

  const products = React.useMemo(() => {
    if (activeTab === 'beauty') return allProducts.filter((p) => p.category !== 'groceries').slice(0, 8);
    if (activeTab === 'essentials') return allProducts.filter((p) => p.category === 'groceries').slice(0, 8);
    if (activeTab === 'offers') return allProducts.filter((p) => p.originalPrice > p.price || p.badge === 'sale').slice(0, 8);
    return bestSellers;
  }, [activeTab, allProducts, bestSellers]);

  return (
    <main className="cr-home">

      <section className="cr-hero" aria-label="Welcome to CR Cosmetics and Essentials">
        <div className="cr-hero-left">
          <div className="cr-hero-badge">
            <img src="/logo.jpeg" alt="CR Cosmetics and Essentials" className="cr-hero-badge-logo" />
            <span>Est. Botwe, Accra</span>
          </div>
          <h1 className="cr-hero-h1">
            <span className="cr-hero-line cr-hero-line--serif">Genuine Beauty.</span>
            <span className="cr-hero-line cr-hero-line--italic">Delivered to</span>
            <span className="cr-hero-line cr-hero-line--serif">Your Door.</span>
          </h1>
          <p className="cr-hero-sub">
            Accra&rsquo;s trusted destination for 100% authentic skincare, fragrances &amp; household essentials &mdash; near Galaxy International School, Botwe.
          </p>
          <div className="cr-hero-ctas">
            <Link href="/shop" className="cr-btn cr-btn--primary">Shop the Collection &rarr;</Link>
            <a href="https://wa.me/233592153306" target="_blank" rel="noopener noreferrer" className="cr-btn cr-btn--wa">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.28-.14-1.64-.81-1.9-.9-.25-.1-.44-.14-.62.14-.19.28-.72.9-.88 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.4-1.66-1.56-1.94-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.17.19-.28.28-.46.1-.19.05-.35-.02-.49-.07-.14-.62-1.5-.85-2.06-.22-.54-.45-.47-.62-.48-.16-.01-.35-.01-.53-.01-.19 0-.49.07-.74.35-.25.28-.97.95-.97 2.32 0 1.37 1 2.69 1.14 2.88.14.18 1.96 3 4.75 4.2.66.29 1.18.46 1.58.58.67.21 1.27.18 1.75.11.54-.08 1.64-.67 1.87-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.52-.32ZM12 2a10 10 0 0 0-8.65 14.97L2 22l5.18-1.35A10 10 0 1 0 12 2Z"/></svg>
              WhatsApp Us
            </a>
          </div>
          <div className="cr-hero-pills">
            <span>&#127468;&#127469; Same-day Accra</span>
            <span>&#10022; 100% Genuine</span>
            <span>&#9889; MTN MoMo</span>
          </div>
        </div>
        <div className="cr-hero-right">
          <div className="cr-hero-image-wrap">
            <img src="/images/categories/skincare.jpg" alt="CR Cosmetics skincare collection" className="cr-hero-img" />
            <div className="cr-hero-float-card">
              <span className="cr-hero-float-num">500+</span>
              <span className="cr-hero-float-text">Products in stock</span>
            </div>
            <div className="cr-hero-float-card cr-hero-float-card--br">
              <span className="cr-hero-float-num">&#9733; 4.9</span>
              <span className="cr-hero-float-text">Customer rating</span>
            </div>
          </div>
          <div className="cr-hero-scroller" aria-hidden="true">
            <span>SKINCARE &nbsp;&middot;&nbsp; FRAGRANCES &nbsp;&middot;&nbsp; BODY CARE &nbsp;&middot;&nbsp; GROCERIES &nbsp;&middot;&nbsp; MAKEUP &nbsp;&middot;&nbsp; SERUMS &nbsp;&middot;&nbsp; AUTHENTIC &nbsp;&middot;&nbsp; BOTWE ACCRA &nbsp;&middot;&nbsp; SKINCARE &nbsp;&middot;&nbsp; FRAGRANCES &nbsp;&middot;&nbsp; BODY CARE &nbsp;&middot;&nbsp; GROCERIES &nbsp;&middot;&nbsp; MAKEUP &nbsp;&middot;&nbsp; SERUMS &nbsp;&middot;&nbsp; AUTHENTIC &nbsp;&middot;&nbsp; BOTWE ACCRA &nbsp;&middot;&nbsp; </span>
          </div>
        </div>
      </section>

      <div className="cr-trust-strip">
        <div><span className="cr-ts-icon">&#127468;&#127469;</span><div><b>Same-Day Delivery</b><small>Botwe, Spintex, Madina &amp; more</small></div></div>
        <div><span className="cr-ts-icon">&#10022;</span><div><b>100% Authentic</b><small>Verified genuine brands</small></div></div>
        <div><span className="cr-ts-icon">&#128242;</span><div><b>MTN MoMo &amp; Telecel</b><small>Fast mobile money checkout</small></div></div>
        <div><span className="cr-ts-icon">&#127978;</span><div><b>In-Store Pickup</b><small>Near Galaxy Int. School, Botwe</small></div></div>
      </div>

      <section className="cr-categories-section">
        <header className="cr-section-head">
          <div>
            <p className="cr-overline">Shop by Category</p>
            <h2 className="cr-section-h2">Everything you need,<br /><em>curated for you.</em></h2>
          </div>
          <Link href="/shop" className="cr-link-more">Browse all &rarr;</Link>
        </header>
        <div className="cr-cat-mosaic">
          {categories.map((cat, i) => (
            <Link
              key={cat.title}
              href={cat.href}
              className={"cr-cat-tile" + (i === 0 ? " cr-cat-tile--hero" : i === 3 ? " cr-cat-tile--wide" : " cr-cat-tile--std")}
              style={{ "--cat-accent": cat.accent }}
            >
              <img src={cat.image} alt={cat.title} className="cr-cat-img" loading="lazy" />
              <div className="cr-cat-overlay" />
              <div className="cr-cat-content">
                <span className="cr-cat-count">{cat.count}</span>
                <h3 className="cr-cat-title">{cat.title}</h3>
                <span className="cr-cat-cta">Shop &#8599;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="cr-story-section">
        <div className="cr-story-visual">
          <img src="/images/products/face-moisturizer.jpg" alt="CR Cosmetics in Botwe Accra" className="cr-story-main-img" />
          <img src="/images/products/shea-butter.jpg" alt="Shea butter and natural beauty products" className="cr-story-side-img" />
          <div className="cr-story-badge">
            <img src="/logo.jpeg" alt="CR Cosmetics Logo" />
          </div>
        </div>
        <div className="cr-story-copy">
          <p className="cr-overline">Our Botwe Story</p>
          <h2 className="cr-story-h2">Born in Botwe.<br /><em>Trusted across Ghana.</em></h2>
          <p className="cr-story-body">
            CR Cosmetics &amp; Essentials was built around one belief: Ghanaian shoppers deserve access to genuine, premium beauty and household products &mdash; without compromise. Located right here near Galaxy International School in Botwe, Accra, we combine the warmth of a neighbourhood store with the quality of a premium beauty retailer.
          </p>
          <div className="cr-story-stats">
            <div><b>500+</b><span>Curated Products</span></div>
            <div><b>5 yrs+</b><span>Serving Accra</span></div>
            <div><b>100%</b><span>Authenticity</span></div>
          </div>
          <Link href="/about" className="cr-btn cr-btn--outline-light">Read Our Story &rarr;</Link>
        </div>
      </section>

      <section className="cr-products-section">
        <header className="cr-section-head">
          <div>
            <p className="cr-overline">The CR Edit</p>
            <h2 className="cr-section-h2">Beauty &amp; care,<br /><em>chosen well.</em></h2>
          </div>
          <Link href="/shop" className="cr-link-more">View all products &rarr;</Link>
        </header>
        <div className="cr-product-tabs-bar" role="tablist">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeTab === key}
              className={"cr-ptab" + (activeTab === key ? " cr-ptab--active" : "")}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        {products.length ? (
          <div className="cr-product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="cr-empty-state">
            <span>&#10022;</span>
            <p>No products in this collection yet &mdash; check back soon!</p>
          </div>
        )}
      </section>

      <section className="cr-promo-band">
        <div className="cr-promo-main">
          <img src="/images/hero-pedestal.jpg" alt="CR Cosmetics curated collection" className="cr-promo-main-img" />
          <div className="cr-promo-main-overlay" />
          <div className="cr-promo-main-copy">
            <p className="cr-overline cr-overline--light">Limited Offers</p>
            <h2>This Week&rsquo;s Best<br /><em>Deals in Botwe</em></h2>
            <Link href="/shop?badge=sale" className="cr-btn cr-btn--white">Shop Offers &rarr;</Link>
          </div>
        </div>
        <div className="cr-promo-side">
          <div className="cr-promo-card">
            <img src="/images/products/vitamin-c-serum.jpg" alt="Vitamin C Serum" />
            <div className="cr-promo-card-copy">
              <span>FEATURED</span>
              <h3>Vitamin C &amp; Glow Serums</h3>
              <Link href="/shop?category=skincare">Shop serums &rarr;</Link>
            </div>
          </div>
          <div className="cr-promo-card cr-promo-card--dark">
            <img src="/images/products/body-oil.jpg" alt="Body oils" />
            <div className="cr-promo-card-copy">
              <span>BESTSELLER</span>
              <h3>Natural Body Oils &amp; Butters</h3>
              <Link href="/shop?category=skincare&subcategory=body">Shop body care &rarr;</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="cr-wa-section">
        <div className="cr-wa-inner">
          <div className="cr-wa-copy">
            <p className="cr-overline cr-overline--wa">Need Help?</p>
            <h2 className="cr-wa-h2">Talk to Us on<br /><em>WhatsApp</em></h2>
            <p>Order directly, ask about products, check delivery times, or get beauty advice &mdash; we&rsquo;re always available.</p>
            <a href="https://wa.me/233592153306" target="_blank" rel="noopener noreferrer" className="cr-btn cr-btn--wa cr-btn--lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.28-.14-1.64-.81-1.9-.9-.25-.1-.44-.14-.62.14-.19.28-.72.9-.88 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.4-1.66-1.56-1.94-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.17.19-.28.28-.46.1-.19.05-.35-.02-.49-.07-.14-.62-1.5-.85-2.06-.22-.54-.45-.47-.62-.48-.16-.01-.35-.01-.53-.01-.19 0-.49.07-.74.35-.25.28-.97.95-.97 2.32 0 1.37 1 2.69 1.14 2.88.14.18 1.96 3 4.75 4.2.66.29 1.18.46 1.58.58.67.21 1.27.18 1.75.11.54-.08 1.64-.67 1.87-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.52-.32ZM12 2a10 10 0 0 0-8.65 14.97L2 22l5.18-1.35A10 10 0 1 0 12 2Z"/></svg>
              Chat on WhatsApp
            </a>
          </div>
          <div className="cr-wa-logo-wrap">
            <img src="/logo.jpeg" alt="CR Cosmetics and Essentials" className="cr-wa-logo" />
            <div className="cr-wa-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 22s8-4 8-10A8 8 0 0 0 4 12c0 6 8 10 8 10Z"/><circle cx="12" cy="12" r="3"/></svg>
              <span>Near Galaxy Int. School, Botwe, Accra</span>
            </div>
          </div>
        </div>
      </section>

      <section className="cr-newsletter-section">
        <div className="cr-newsletter-inner">
          <p className="cr-overline">Stay Glowing with CR</p>
          <h2 className="cr-nl-h2">Get exclusive deals &amp;<br />beauty tips in your inbox.</h2>
          <p className="cr-nl-sub">New arrivals, restock alerts, and special offers for Accra shoppers.</p>
          <form className="cr-newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email address" aria-label="Email address" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>

      <style jsx>{`
        .cr-home{background:var(--bg,#faf8f6);color:var(--text,#161114)}
        .cr-overline{font:700 .68rem/1 var(--font-primary,sans-serif);letter-spacing:.18em;text-transform:uppercase;color:var(--burgundy,#6b1733);margin:0 0 .7rem;display:block}
        .cr-overline--light{color:rgba(255,255,255,.65)}
        .cr-overline--wa{color:#25D366}
        .cr-section-h2{font-family:var(--font-display,serif);font-size:clamp(2rem,4vw,3.2rem);line-height:1.06;letter-spacing:-.03em;margin:0}
        .cr-section-h2 em{font-style:italic;color:var(--burgundy,#6b1733)}
        .cr-section-head{display:flex;justify-content:space-between;align-items:flex-end;gap:2rem;padding:0 0 2.5rem}
        .cr-link-more{font:700 .7rem/1 var(--font-primary);letter-spacing:.1em;text-transform:uppercase;color:var(--burgundy,#6b1733);text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:3px;white-space:nowrap;flex-shrink:0}
        .cr-link-more:hover{opacity:.75}
        .cr-btn{display:inline-flex;align-items:center;gap:.5rem;font:700 .72rem/1 var(--font-primary);letter-spacing:.12em;text-transform:uppercase;text-decoration:none;padding:.9rem 1.6rem;border:none;cursor:pointer;transition:all .25s ease;border-radius:3px}
        .cr-btn--primary{background:var(--burgundy,#6b1733);color:#fff}
        .cr-btn--primary:hover{background:#480e21;transform:translateY(-1px);box-shadow:0 6px 18px rgba(107,23,51,.22)}
        .cr-btn--wa{background:#25D366;color:#fff}
        .cr-btn--wa:hover{background:#1da851;transform:translateY(-1px);box-shadow:0 6px 18px rgba(37,211,102,.22)}
        .cr-btn--outline{background:transparent;color:var(--text,#161114);border:1.5px solid var(--text,#161114)}
        .cr-btn--outline:hover{background:var(--text,#161114);color:#fff}
        .cr-btn--outline-light{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.4)}
        .cr-btn--outline-light:hover{background:rgba(255,255,255,.1)}
        .cr-btn--white{background:#fff;color:var(--burgundy,#6b1733);border:none}
        .cr-btn--white:hover{background:#f8eff3}
        .cr-btn--lg{min-height:52px;padding:1rem 2rem;font-size:.78rem}

        .cr-hero{display:grid;grid-template-columns:1fr 1fr;min-height:clamp(540px,78vh,840px);background:#faf0f3;overflow:hidden;max-width:1600px;margin:0 auto}
        .cr-hero-left{display:flex;flex-direction:column;justify-content:center;padding:clamp(3rem,6vw,6rem) clamp(1.5rem,6vw,5.5rem);position:relative;z-index:2}
        .cr-hero-badge{display:flex;align-items:center;gap:.75rem;margin-bottom:2rem}
        .cr-hero-badge-logo{width:40px;height:40px;border-radius:50%;object-fit:cover;border:1.5px solid var(--gold,#c59b3f)}
        .cr-hero-badge span{font:700 .65rem/1 var(--font-primary);letter-spacing:.16em;text-transform:uppercase;color:var(--burgundy,#6b1733)}
        .cr-hero-h1{display:flex;flex-direction:column;gap:.05em;margin:0 0 1.5rem}
        .cr-hero-line{display:block}
        .cr-hero-line--serif{font:400 clamp(2.8rem,5.5vw,5.2rem)/.92 var(--font-display,serif);letter-spacing:-.04em;color:#1a0f14}
        .cr-hero-line--italic{font:400 clamp(2.8rem,5.5vw,5.2rem)/.92 var(--font-display,serif);letter-spacing:-.04em;color:var(--burgundy,#6b1733);font-style:italic}
        .cr-hero-sub{font:400 1rem/1.65 var(--font-primary);color:var(--text-secondary,#6b5b63);max-width:460px;margin:0 0 2rem}
        .cr-hero-ctas{display:flex;gap:.85rem;flex-wrap:wrap;margin-bottom:2rem}
        .cr-hero-pills{display:flex;flex-wrap:wrap;gap:.5rem}
        .cr-hero-pills span{font:600 .62rem/1 var(--font-primary);letter-spacing:.1em;text-transform:uppercase;background:rgba(107,23,51,.07);color:var(--burgundy,#6b1733);padding:.45rem .8rem;border-radius:20px;border:1px solid rgba(107,23,51,.12)}
        .cr-hero-right{position:relative;overflow:hidden;background:#f0e0e7}
        .cr-hero-image-wrap{position:relative;height:100%;min-height:400px}
        .cr-hero-img{display:block;width:100%;height:100%;object-fit:cover;transition:transform 1.2s cubic-bezier(.16,1,.3,1)}
        .cr-hero:hover .cr-hero-img{transform:scale(1.03)}
        .cr-hero-float-card{position:absolute;background:rgba(255,255,255,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:.9rem 1.1rem;border:1px solid rgba(197,155,63,.3);display:flex;flex-direction:column;gap:.2rem;border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,.1);top:1.5rem;left:1.5rem;min-width:110px}
        .cr-hero-float-card--br{top:auto;left:auto;bottom:3rem;right:1.5rem}
        .cr-hero-float-num{font:700 1.5rem/1 var(--font-display,serif);color:var(--burgundy,#6b1733)}
        .cr-hero-float-text{font:500 .65rem/1 var(--font-primary);letter-spacing:.08em;text-transform:uppercase;color:var(--text-secondary,#6b5b63)}
        .cr-hero-scroller{position:absolute;bottom:0;left:0;right:0;background:var(--burgundy,#6b1733);color:rgba(255,255,255,.85);padding:.7rem 0;white-space:nowrap;overflow:hidden;font:700 .6rem/1 var(--font-primary);letter-spacing:.16em;text-transform:uppercase;animation:cr-scroll 22s linear infinite}
        @keyframes cr-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}

        .cr-trust-strip{background:#fff;border-block:1px solid var(--border,#ebe2e6);display:grid;grid-template-columns:repeat(4,1fr);max-width:1600px;margin:0 auto}
        .cr-trust-strip>div{display:flex;align-items:center;gap:.85rem;padding:1.1rem 1.4rem;border-right:1px solid var(--border,#ebe2e6)}
        .cr-trust-strip>div:last-child{border-right:none}
        .cr-ts-icon{font-size:1.25rem;line-height:1;flex-shrink:0}
        .cr-trust-strip b{display:block;font:700 .72rem/1.2 var(--font-primary);letter-spacing:.06em;text-transform:uppercase;color:var(--text,#161114);margin-bottom:.25rem}
        .cr-trust-strip small{font:400 .72rem/1.2 var(--font-primary);color:var(--text-secondary,#6b5b63)}

        .cr-categories-section{max-width:1440px;margin:0 auto;padding:clamp(3.5rem,6vw,5rem) clamp(1.25rem,4vw,3.5rem)}
        .cr-cat-mosaic{display:grid;grid-template-columns:2fr 1fr 1fr;grid-template-rows:280px 200px;gap:10px}
        .cr-cat-tile{position:relative;overflow:hidden;border-radius:6px;display:block;text-decoration:none}
        .cr-cat-tile--hero{grid-row:1/3}
        .cr-cat-tile--wide{grid-column:span 2}
        .cr-cat-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .7s cubic-bezier(.16,1,.3,1)}
        .cr-cat-tile:hover .cr-cat-img{transform:scale(1.07)}
        .cr-cat-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(20,8,12,.78) 0%,rgba(20,8,12,.1) 55%,transparent 100%);transition:opacity .3s ease}
        .cr-cat-content{position:absolute;bottom:0;left:0;right:0;padding:1.4rem 1.4rem 1.6rem;color:#fff}
        .cr-cat-count{display:block;font:600 .6rem/1 var(--font-primary);letter-spacing:.14em;text-transform:uppercase;opacity:.7;margin-bottom:.4rem}
        .cr-cat-title{font:400 clamp(1.3rem,2.2vw,2rem)/1 var(--font-display,serif);margin:0 0 .6rem;color:#fff}
        .cr-cat-cta{display:inline-block;font:700 .65rem/1 var(--font-primary);letter-spacing:.1em;text-transform:uppercase;background:rgba(255,255,255,.15);padding:.35rem .75rem;border-radius:20px;border:1px solid rgba(255,255,255,.25);transition:background .2s ease,border-color .2s ease;color:#fff}
        .cr-cat-tile:hover .cr-cat-cta{background:var(--cat-accent,var(--burgundy,#6b1733));border-color:transparent}

        .cr-story-section{background:#24131B;color:#fff;display:grid;grid-template-columns:1fr 1fr;min-height:540px;max-width:1600px;margin:0 auto}
        .cr-story-visual{position:relative;overflow:hidden;min-height:400px}
        .cr-story-main-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.72}
        .cr-story-side-img{position:absolute;bottom:2rem;right:2rem;width:38%;aspect-ratio:3/4;object-fit:cover;border:3px solid rgba(197,155,63,.4);border-radius:4px;box-shadow:0 16px 40px rgba(0,0,0,.4)}
        .cr-story-badge{position:absolute;top:2rem;left:2rem;width:56px;height:56px;border-radius:50%;overflow:hidden;border:2px solid var(--gold,#c59b3f);box-shadow:0 4px 16px rgba(0,0,0,.4)}
        .cr-story-badge img{width:100%;height:100%;object-fit:cover}
        .cr-story-copy{display:flex;flex-direction:column;justify-content:center;padding:clamp(3rem,6vw,5.5rem)}
        .cr-story-copy .cr-overline{color:var(--gold,#c59b3f)}
        .cr-story-h2{font-family:var(--font-display,serif);font-size:clamp(2rem,3.5vw,3.2rem);line-height:1.08;letter-spacing:-.03em;margin:0 0 1.5rem;color:#fff}
        .cr-story-h2 em{font-style:italic;color:var(--gold,#c59b3f)}
        .cr-story-body{font:400 .95rem/1.72 var(--font-primary);color:#c8b9bf;margin:0 0 2rem;max-width:500px}
        .cr-story-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;padding:1.5rem 0 2rem;border-block:1px solid rgba(255,255,255,.1);margin-bottom:2rem}
        .cr-story-stats b{display:block;font:700 2rem/1 var(--font-display,serif);color:var(--gold,#c59b3f);margin-bottom:.4rem}
        .cr-story-stats span{font:500 .68rem/1.3 var(--font-primary);letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.5)}

        .cr-products-section{max-width:1440px;margin:0 auto;padding:clamp(3.5rem,6vw,5rem) clamp(1.25rem,4vw,3.5rem)}
        .cr-product-tabs-bar{display:flex;gap:0;border-bottom:1px solid var(--border,#ebe2e6);margin-bottom:2rem;flex-wrap:wrap}
        .cr-ptab{background:none;border:none;border-bottom:2px solid transparent;padding:.75rem 1.2rem;font:700 .68rem/1 var(--font-primary);letter-spacing:.1em;text-transform:uppercase;color:var(--text-secondary,#6b5b63);cursor:pointer;transition:color .2s,border-color .2s;margin-bottom:-1px}
        .cr-ptab:hover{color:var(--burgundy,#6b1733)}
        .cr-ptab--active{color:var(--burgundy,#6b1733);border-bottom-color:var(--burgundy,#6b1733)}
        .cr-product-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1.25rem}
        .cr-empty-state{text-align:center;padding:4rem;background:#fff;border:1px dashed var(--border,#ebe2e6);border-radius:8px}
        .cr-empty-state span{font-size:2rem;color:var(--gold,#c59b3f);display:block;margin-bottom:1rem}
        .cr-empty-state p{color:var(--text-secondary,#6b5b63)}

        .cr-promo-band{display:grid;grid-template-columns:1.4fr 1fr;gap:0;max-width:1600px;margin:0 auto}
        .cr-promo-main{position:relative;min-height:480px;overflow:hidden}
        .cr-promo-main-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .7s ease}
        .cr-promo-band:hover .cr-promo-main-img{transform:scale(1.03)}
        .cr-promo-main-overlay{position:absolute;inset:0;background:linear-gradient(160deg,rgba(24,8,16,.85) 0%,rgba(24,8,16,.35) 60%,transparent 100%)}
        .cr-promo-main-copy{position:relative;z-index:2;padding:3rem;color:#fff}
        .cr-promo-main-copy h2{font:400 clamp(2.2rem,4vw,3.2rem)/1.05 var(--font-display,serif);letter-spacing:-.03em;margin:.5rem 0 1.8rem;color:#fff}
        .cr-promo-main-copy h2 em{font-style:italic;color:var(--gold,#c59b3f)}
        .cr-promo-side{display:flex;flex-direction:column}
        .cr-promo-card{position:relative;flex:1;overflow:hidden;min-height:240px}
        .cr-promo-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .6s ease;filter:brightness(.85)}
        .cr-promo-card:hover img{transform:scale(1.06)}
        .cr-promo-card--dark img{filter:brightness(.55)}
        .cr-promo-card-copy{position:absolute;inset:0;z-index:2;padding:1.6rem;color:#fff;display:flex;flex-direction:column;justify-content:flex-end;background:linear-gradient(to top,rgba(20,8,12,.8) 0%,transparent 100%)}
        .cr-promo-card-copy span{font:700 .6rem/1 var(--font-primary);letter-spacing:.16em;text-transform:uppercase;color:var(--gold,#c59b3f);margin-bottom:.4rem;display:block}
        .cr-promo-card-copy h3{font:400 1.4rem/1.1 var(--font-display,serif);margin:0 0 .7rem;color:#fff}
        .cr-promo-card-copy a{font:700 .65rem/1 var(--font-primary);letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.8);text-decoration:none;border-bottom:1px solid rgba(255,255,255,.35);padding-bottom:2px;transition:color .2s,border-color .2s;width:fit-content}
        .cr-promo-card-copy a:hover{color:#fff;border-color:#fff}

        .cr-wa-section{background:linear-gradient(135deg,#1a0e14 0%,#2e1620 100%);padding:clamp(3.5rem,6vw,6rem) clamp(1.25rem,4vw,3.5rem)}
        .cr-wa-inner{max-width:1440px;margin:0 auto;display:grid;grid-template-columns:1fr auto;gap:4rem;align-items:center}
        .cr-wa-h2{font:400 clamp(2rem,4vw,3.2rem)/1.05 var(--font-display,serif);letter-spacing:-.03em;margin:.5rem 0 1rem;color:#fff}
        .cr-wa-h2 em{font-style:italic;color:#25D366}
        .cr-wa-copy p{font:400 .95rem/1.65 var(--font-primary);color:rgba(255,255,255,.6);max-width:500px;margin:0 0 2rem}
        .cr-wa-logo-wrap{display:flex;flex-direction:column;align-items:center;gap:1rem}
        .cr-wa-logo{width:110px;height:110px;border-radius:50%;object-fit:cover;border:3px solid rgba(197,155,63,.5);box-shadow:0 12px 32px rgba(0,0,0,.4)}
        .cr-wa-location{display:flex;align-items:flex-start;gap:.5rem;font:500 .7rem/1.4 var(--font-primary);color:rgba(255,255,255,.45);text-align:center;max-width:150px}

        .cr-newsletter-section{background:var(--blush,#f8eff3);border-top:1px solid var(--border,#ebe2e6);padding:clamp(3.5rem,6vw,5rem) clamp(1.25rem,4vw,3.5rem);text-align:center}
        .cr-newsletter-inner{max-width:580px;margin:0 auto}
        .cr-nl-h2{font:400 clamp(1.9rem,3.5vw,2.8rem)/1.1 var(--font-display,serif);letter-spacing:-.03em;margin:.5rem 0 .75rem}
        .cr-nl-sub{font:400 .95rem/1.65 var(--font-primary);color:var(--text-secondary,#6b5b63);margin:0 0 2rem}
        .cr-newsletter-form{display:flex;border:1.5px solid var(--border,#ebe2e6);border-radius:4px;overflow:hidden;background:#fff}
        .cr-newsletter-form input{flex:1;min-width:0;border:none;padding:.9rem 1rem;font:400 .95rem var(--font-primary);outline:none;background:transparent}
        .cr-newsletter-form button{background:var(--burgundy,#6b1733);color:#fff;border:none;padding:0 1.4rem;font:700 .68rem/1 var(--font-primary);letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:background .2s}
        .cr-newsletter-form button:hover{background:#480e21}

        @media(max-width:1100px){
          .cr-cat-mosaic{grid-template-columns:1fr 1fr 1fr;grid-template-rows:250px 190px}
          .cr-cat-tile--hero{grid-row:auto}
          .cr-product-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
          .cr-promo-band{grid-template-columns:1fr 1fr}
          .cr-trust-strip{grid-template-columns:repeat(2,1fr)}
          .cr-trust-strip>div:nth-child(2){border-right:none}
          .cr-trust-strip>div{border-bottom:1px solid var(--border,#ebe2e6)}
          .cr-trust-strip>div:nth-child(3),.cr-trust-strip>div:nth-child(4){border-bottom:none}
        }
        @media(max-width:860px){
          .cr-hero{grid-template-columns:1fr;min-height:auto}
          .cr-hero-right{min-height:360px}
          .cr-story-section{grid-template-columns:1fr}
          .cr-story-visual{min-height:320px}
          .cr-cat-mosaic{grid-template-columns:1fr 1fr;grid-template-rows:230px 190px}
          .cr-cat-tile--wide{grid-column:span 2}
          .cr-product-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
          .cr-promo-band{grid-template-columns:1fr}
          .cr-wa-inner{grid-template-columns:1fr;text-align:center}
          .cr-wa-logo-wrap{flex-direction:row;justify-content:center}
          .cr-wa-copy h2,.cr-wa-copy p{text-align:center}
          .cr-section-head{flex-direction:column;align-items:flex-start;gap:1rem;padding-bottom:2rem}
        }
        @media(max-width:540px){
          .cr-hero-left{padding:2.5rem 1.25rem}
          .cr-hero-ctas{flex-direction:column;align-items:flex-start}
          .cr-cat-mosaic{grid-template-columns:1fr 1fr;grid-template-rows:180px 180px}
          .cr-cat-tile--hero,.cr-cat-tile--wide{grid-column:auto;grid-row:auto}
          .cr-trust-strip{grid-template-columns:1fr}
          .cr-trust-strip>div{border-right:none;border-bottom:1px solid var(--border,#ebe2e6)}
          .cr-trust-strip>div:last-child{border-bottom:none}
          .cr-newsletter-form{flex-direction:column}
          .cr-newsletter-form button{min-height:44px}
        }
        @media(prefers-reduced-motion:reduce){
          .cr-hero-scroller{animation:none}
          .cr-hero:hover .cr-hero-img{transform:none}
          .cr-cat-tile:hover .cr-cat-img{transform:none}
        }
      `}</style>
    </main>
  );
}
