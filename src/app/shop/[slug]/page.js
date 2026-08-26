'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { getProductBySlug, getRelatedProducts } from '@/services/productService';
import { formatPrice, getDiscountPercent } from '@/utils/formatPrice';

/* ─── Accordion ───────────────────────────────────────── */
function Accordion({ items }) {
  const [open, setOpen] = useState(null);

  return (
    <div className="accordion">
      {items.map(({ title, content }, i) => (
        <div key={i} className={`accordion__item${open === i ? ' open' : ''}`}>
          <button
            className="accordion__trigger"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            id={`accordion-trigger-${i}`}
            aria-controls={`accordion-content-${i}`}
          >
            {title}
            <span className="accordion__icon" aria-hidden="true">+</span>
          </button>
          <div
            className="accordion__content"
            id={`accordion-content-${i}`}
            role="region"
            aria-labelledby={`accordion-trigger-${i}`}
          >
            <div className="accordion__body">{content}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Star rating ─────────────────────────────────────── */
function Stars({ rating }) {
  return (
    <span className="product-info__stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} aria-hidden="true">
          {n <= Math.floor(rating) ? '★' : n - 0.5 <= rating ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}

/* ─── Main page ───────────────────────────────────────── */
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;

  const product = getProductBySlug(slug);
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div style={{
        paddingTop: 'calc(var(--header-h) + var(--space-16))',
        paddingBottom: 'var(--space-16)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-5)',
        minHeight: '100vh',
      }}>
        <p style={{ fontSize: '4rem', opacity: 0.2 }}>🔍</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--warm-white)' }}>
          Product Not Found
        </h1>
        <p style={{ color: 'var(--text-dim)', maxWidth: '36ch' }}>
          This product doesn't exist or may have been removed from our catalogue.
        </p>
        <Link href="/shop" className="btn btn-primary">
          Browse All Products
        </Link>
      </div>
    );
  }

  const {
    name, brand, price, originalPrice, image, images,
    rating, reviewCount, badge, inStock, stockCount,
    description, details, category, subcategory, currency,
  } = product;

  const isWishlisted = isInWishlist(product.id);
  const relatedProducts = getRelatedProducts(product, 4);
  const discount = getDiscountPercent(originalPrice, price);

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem(product, quantity);
    addToast({
      title: 'Added to cart',
      message: `${name} × ${quantity}`,
      type: 'success',
      duration: 3000,
    });
  };

  const handleWishlist = () => {
    toggleWishlist(product);
    addToast({
      message: isWishlisted ? `Removed from wishlist` : `Added to wishlist`,
      type: isWishlisted ? 'info' : 'success',
      duration: 2000,
    });
  };

  /* ─── Build accordion items ── */
  const accordionItems = [
    {
      title: 'Details',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {details?.size && <p><strong style={{ color: 'var(--warm-white)' }}>Size:</strong> {details.size}</p>}
          {details?.weight && <p><strong style={{ color: 'var(--warm-white)' }}>Weight:</strong> {details.weight}</p>}
          {details?.volume && <p><strong style={{ color: 'var(--warm-white)' }}>Volume:</strong> {details.volume}</p>}
          {details?.skinType && <p><strong style={{ color: 'var(--warm-white)' }}>Skin Type:</strong> {details.skinType}</p>}
          {details?.hairType && <p><strong style={{ color: 'var(--warm-white)' }}>Hair Type:</strong> {details.hairType}</p>}
          {details?.origin && <p><strong style={{ color: 'var(--warm-white)' }}>Origin:</strong> {details.origin}</p>}
        </div>
      ),
    },
    details?.usage && {
      title: 'How to Use',
      content: <p>{details.usage}</p>,
    },
    details?.ingredients && {
      title: 'Ingredients',
      content: <p style={{ wordBreak: 'break-word' }}>{details.ingredients}</p>,
    },
    details?.storage && {
      title: 'Storage & Packaging',
      content: (
        <p>
          {details.storage}
          {details.packaging && ` — Packaging: ${details.packaging}`}
        </p>
      ),
    },
  ].filter(Boolean);

  return (
    <div className="product-page">
      {/* ── Breadcrumb ── */}
      <div style={{
        padding: 'var(--space-5) var(--container-pad)',
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
      }}>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/" className="breadcrumb__link">Home</Link>
          <span className="breadcrumb__sep" aria-hidden="true">/</span>
          <Link href="/shop" className="breadcrumb__link">Shop</Link>
          <span className="breadcrumb__sep" aria-hidden="true">/</span>
          <Link
            href={`/shop?category=${category}`}
            className="breadcrumb__link"
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Link>
          {subcategory && (
            <>
              <span className="breadcrumb__sep" aria-hidden="true">/</span>
              <Link
                href={`/shop?category=${category}&subcategory=${subcategory}`}
                className="breadcrumb__link"
              >
                {subcategory}
              </Link>
            </>
          )}
          <span className="breadcrumb__sep" aria-hidden="true">/</span>
          <span className="breadcrumb__current">{name}</span>
        </nav>
      </div>

      {/* ── Product layout ── */}
      <div className="product-layout">
        {/* Left: Gallery */}
        <div className="product-gallery">
          <div className="product-gallery__main">
            {image ? (
              <img
                src={image}
                alt={name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.style.background = 'var(--mist)';
                }}
              />
            ) : (
              <div className="product-gallery__placeholder" aria-hidden="true">🧴</div>
            )}

            {/* Badge overlay */}
            {badge && (
              <div style={{ position: 'absolute', top: 'var(--space-5)', left: 'var(--space-5)', zIndex: 10 }}>
                <span className={`badge badge-${badge}`}>
                  {badge === 'sale' ? `−${discount}%` : badge.toUpperCase()}
                </span>
              </div>
            )}

            {/* Out of stock overlay */}
            {!inStock && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(15,13,11,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 5,
              }}>
                <span className="badge badge-out" style={{ fontSize: 'var(--text-sm)', padding: '0.5rem 1.25rem' }}>
                  Out of Stock
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Info panel */}
        <div className="product-info-panel">
          {/* Brand */}
          {brand && <p className="product-info__brand">{brand}</p>}

          {/* Name */}
          <h1 className="product-info__name">{name}</h1>

          {/* Rating */}
          {rating && (
            <div className="product-info__rating">
              <Stars rating={rating} />
              {reviewCount && (
                <span className="product-info__review-count">
                  {rating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
                </span>
              )}
            </div>
          )}

          {/* Pricing */}
          <div className="product-info__pricing">
            <span className="product-info__price">{formatPrice(price)}</span>
            {originalPrice && originalPrice > price && (
              <span className="product-info__original">{formatPrice(originalPrice)}</span>
            )}
            {discount > 0 && (
              <span className="badge badge-sale" style={{ marginLeft: 'auto' }}>−{discount}%</span>
            )}
          </div>

          {/* Description */}
          <p className="product-info__desc">{description}</p>

          {/* Quantity + CTA */}
          {inStock ? (
            <>
              {/* Quantity selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', color: 'var(--text-dim)' }}>
                  Qty
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="qty-num" style={{ minWidth: 32 }}>{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(q => Math.min(stockCount || 99, q + 1))}
                    aria-label="Increase quantity"
                    disabled={stockCount && quantity >= stockCount}
                  >
                    +
                  </button>
                </div>
                {stockCount && stockCount < 10 && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-warning)' }}>
                    Only {stockCount} left
                  </span>
                )}
              </div>

              {/* Add to cart / wishlist */}
              <div className="product-info__add-to-cart">
                <button
                  className="btn btn-primary"
                  onClick={handleAddToCart}
                  id="product-add-to-cart"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  Add to Cart
                </button>
                <button
                  className={`btn-icon${isWishlisted ? '' : ''}`}
                  onClick={handleWishlist}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                  style={{
                    background: isWishlisted ? 'var(--burgundy)' : 'transparent',
                    borderColor: isWishlisted ? 'var(--burgundy)' : 'var(--mist-border)',
                    color: isWishlisted ? 'var(--warm-white)' : 'var(--text-dim)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <button className="btn btn-outline" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                Out of Stock
              </button>
              <button
                className={`btn btn-ghost btn-sm`}
                onClick={handleWishlist}
                style={{ color: isWishlisted ? 'var(--burgundy)' : 'var(--text-dim)' }}
              >
                {isWishlisted ? '♥ Saved to Wishlist' : '♡ Notify When Available'}
              </button>
            </div>
          )}

          {/* WhatsApp order */}
          <a
            href={`https://wa.me/233592153306?text=Hi%20CR%20Cosmetics%2C%20I%20would%20like%20to%20order%20${encodeURIComponent(name)}%20×${quantity}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: '0.75rem 1rem',
              background: 'rgba(37,211,102,0.1)',
              border: '1px solid rgba(37,211,102,0.25)',
              borderRadius: 'var(--radius-md)',
              color: '#25D366',
              fontFamily: 'var(--font-primary)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
              textDecoration: 'none',
              transition: 'all var(--dur-fast)',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>📱</span>
            Order via WhatsApp
          </a>

          {/* Accordion details */}
          {accordionItems.length > 0 && (
            <Accordion items={accordionItems} />
          )}
        </div>
      </div>

      {/* ── Related products ── */}
      {relatedProducts.length > 0 && (
        <section style={{
          padding: 'clamp(4rem, 6vw, 6rem) var(--container-pad)',
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          borderTop: '1px solid var(--mist-border)',
        }} aria-labelledby="related-heading">
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <p className="section-label">You may also like</p>
            <h2 id="related-heading" className="section-title">Related Products</h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 'var(--space-4)',
          }}>
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
