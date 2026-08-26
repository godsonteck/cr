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
  const [open, setOpen] = useState(0);

  return (
    <div className="cr-accordion">
      {items.map(({ title, content }, i) => (
        <div key={i} className={`cr-accordion-item${open === i ? ' cr-accordion-item--open' : ''}`}>
          <button
            type="button"
            className="cr-accordion-trigger"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span>{title}</span>
            <span className="cr-accordion-icon">{open === i ? '−' : '+'}</span>
          </button>
          {open === i && (
            <div className="cr-accordion-content">
              <div className="cr-accordion-body">{content}</div>
            </div>
          )}
        </div>
      ))}
      <style jsx>{`
        .cr-accordion {
          border-top: 1px solid #EBE0E6;
          margin-top: 1.5rem;
        }
        .cr-accordion-item {
          border-bottom: 1px solid #EBE0E6;
        }
        .cr-accordion-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.1rem 0;
          background: none;
          border: none;
          font-family: inherit;
          font-size: 0.9rem;
          font-weight: 700;
          color: #1A0D14;
          cursor: pointer;
          text-align: left;
        }
        .cr-accordion-trigger:hover {
          color: #7B2347;
        }
        .cr-accordion-icon {
          font-size: 1.2rem;
          color: #7B2347;
        }
        .cr-accordion-body {
          padding-bottom: 1.25rem;
          font-size: 0.88rem;
          color: #63545B;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug;

  const product = getProductBySlug(slug);
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="cr-not-found-view">
        <div className="cr-not-found-card">
          <span className="cr-not-found-icon">🧴</span>
          <h2>Product Not Found</h2>
          <p>This product may have been moved or is currently unavailable.</p>
          <Link href="/shop" className="cr-btn-back-shop">
            Browse All Products
          </Link>
        </div>
        <style jsx>{`
          .cr-not-found-view {
            padding-top: calc(var(--header-h, 74px) + 4rem);
            min-height: 80vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .cr-not-found-card {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }
          .cr-not-found-icon {
            font-size: 3.5rem;
          }
          .cr-not-found-card h2 {
            font-family: var(--font-display, serif);
            font-size: 2rem;
            color: #1A0D14;
          }
          .cr-btn-back-shop {
            padding: 0.85rem 1.75rem;
            background: #7B2347;
            color: #FFFFFF;
            font-weight: 700;
            text-decoration: none;
            border-radius: 6px;
          }
        `}</style>
      </div>
    );
  }

  const {
    name, brand, price, originalPrice, image,
    rating, reviewCount, badge, inStock, stockCount,
    description, details, category, subcategory,
  } = product;

  const isWishlisted = isInWishlist(product.id);
  const relatedProducts = getRelatedProducts(product, 4);
  const discount = getDiscountPercent(originalPrice, price);

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem(product, quantity);
    addToast({
      title: 'Added to Cart',
      message: `${name} × ${quantity}`,
      type: 'success',
      duration: 3000,
    });
  };

  const handleWishlist = () => {
    toggleWishlist(product);
    addToast({
      message: isWishlisted ? 'Removed from Wishlist' : 'Saved to Wishlist',
      type: isWishlisted ? 'info' : 'success',
      duration: 2000,
    });
  };

  /* ── Accordion Items ── */
  const accordionItems = [
    {
      title: 'Product Specifications',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {details?.size && <p><strong>Size:</strong> {details.size}</p>}
          {details?.volume && <p><strong>Volume:</strong> {details.volume}</p>}
          {details?.weight && <p><strong>Weight:</strong> {details.weight}</p>}
          {details?.skinType && <p><strong>Skin Type:</strong> {details.skinType}</p>}
          {details?.origin && <p><strong>Origin:</strong> {details.origin}</p>}
        </div>
      ),
    },
    details?.usage && {
      title: 'How to Apply / Use',
      content: <p>{details.usage}</p>,
    },
    details?.ingredients && {
      title: 'Ingredients & Formula',
      content: <p style={{ wordBreak: 'break-word' }}>{details.ingredients}</p>,
    },
    details?.storage && {
      title: 'Storage & Care',
      content: <p>{details.storage}</p>,
    },
  ].filter(Boolean);

  const [imgError, setImgError] = useState(false);

  return (
    <div className="cr-pdp-page">
      <div className="cr-pdp-container">
        {/* ── Breadcrumb ── */}
        <nav className="cr-pdp-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/shop">Shop</Link>
          <span>/</span>
          <Link href={`/shop?category=${category}`}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Link>
          <span>/</span>
          <span className="cr-pdp-crumb-current">{name}</span>
        </nav>

        {/* ── 2-Column Product Layout ── */}
        <div className="cr-pdp-layout">
          {/* Left Gallery */}
          <div className="cr-pdp-gallery">
            <div className="cr-pdp-media-frame">
              {badge && (
                <span className="cr-pdp-badge">
                  {badge === 'sale' ? `−${discount}%` : badge.toUpperCase()}
                </span>
              )}
              {image && !imgError ? (
                <img
                  src={image}
                  alt={name}
                  className="cr-pdp-main-img"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="cr-pdp-img-fallback">✨</div>
              )}
            </div>
          </div>

          {/* Right Product Details */}
          <div className="cr-pdp-details">
            {brand && <p className="cr-pdp-brand">{brand}</p>}
            <h1 className="cr-pdp-title">{name}</h1>

            {/* Rating Row */}
            {rating && (
              <div className="cr-pdp-rating-row">
                <span className="cr-pdp-stars">{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
                <span className="cr-pdp-rating-text">{rating.toFixed(1)} ({reviewCount || 12} verified reviews)</span>
              </div>
            )}

            {/* Price Box */}
            <div className="cr-pdp-price-box">
              <span className="cr-pdp-price">{formatPrice(price)}</span>
              {originalPrice && originalPrice > price && (
                <span className="cr-pdp-original-price">{formatPrice(originalPrice)}</span>
              )}
              {discount > 0 && (
                <span className="cr-pdp-discount-tag">Save {discount}%</span>
              )}
            </div>

            <p className="cr-pdp-description">{description}</p>

            {/* Availability status */}
            <div className="cr-pdp-stock-status">
              <span className={`cr-stock-dot${inStock ? ' cr-stock-dot--in' : ' cr-stock-dot--out'}`} />
              <span className="cr-stock-label">
                {inStock ? (stockCount && stockCount < 10 ? `Only ${stockCount} items left in stock` : 'In Stock • Ready to Dispatch') : 'Currently Out of Stock'}
              </span>
            </div>

            {/* Actions */}
            {inStock ? (
              <div className="cr-pdp-cta-block">
                <div className="cr-pdp-qty-stepper">
                  <button
                    type="button"
                    className="cr-qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="cr-qty-val">{quantity}</span>
                  <button
                    type="button"
                    className="cr-qty-btn"
                    onClick={() => setQuantity((q) => Math.min(stockCount || 99, q + 1))}
                    disabled={stockCount && quantity >= stockCount}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="cr-btn-add-cart"
                  onClick={handleAddToCart}
                  id="pdp-add-to-cart-btn"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  className={`cr-btn-wishlist${isWishlisted ? ' cr-btn-wishlist--active' : ''}`}
                  onClick={handleWishlist}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="cr-pdp-oos-box">
                <button type="button" className="cr-btn-oos" disabled>
                  Sold Out
                </button>
              </div>
            )}

            {/* Direct WhatsApp Ordering */}
            <a
              href={`https://wa.me/233592153306?text=Hello%20CR%20Cosmetics%2C%20I%20want%20to%20order%3A%20${encodeURIComponent(name)}%20(Qty%3A%20${quantity})`}
              className="cr-pdp-wa-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>💬</span>
              <span>Fast Order via WhatsApp</span>
            </a>

            {/* Accordions */}
            {accordionItems.length > 0 && <Accordion items={accordionItems} />}
          </div>
        </div>

        {/* ── Related Products ── */}
        {relatedProducts.length > 0 && (
          <section className="cr-pdp-related">
            <div className="cr-related-header">
              <p className="cr-related-eyebrow">Pair It With</p>
              <h2 className="cr-related-title">You May Also Like</h2>
            </div>
            <div className="cr-related-grid">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <style jsx>{`
        .cr-pdp-page {
          padding-top: calc(var(--header-h, 74px) + 1rem);
          padding-bottom: 5rem;
          background: #FFFFFF;
        }

        .cr-pdp-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 clamp(1rem, 4vw, 2.5rem);
        }

        /* ── Breadcrumb ── */
        .cr-pdp-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          color: #8C7C84;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .cr-pdp-breadcrumb a {
          color: #63545B;
          text-decoration: none;
        }

        .cr-pdp-breadcrumb a:hover {
          color: #7B2347;
        }

        .cr-pdp-crumb-current {
          color: #1A0D14;
          font-weight: 600;
        }

        /* ── Main Layout ── */
        .cr-pdp-layout {
          display: grid;
          grid-template-columns: 1fr 1.05fr;
          gap: clamp(2rem, 5vw, 4.5rem);
          align-items: start;
        }

        /* ── Gallery Frame ── */
        .cr-pdp-gallery {
          position: sticky;
          top: calc(var(--header-h, 74px) + 2rem);
        }

        .cr-pdp-media-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 4.8;
          border-radius: 12px;
          background: #FAF6F8;
          border: 1px solid #EBE0E6;
          overflow: hidden;
          box-shadow: 0 8px 28px rgba(123, 35, 71, 0.06);
        }

        .cr-pdp-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 3;
          background: #7B2347;
          color: #FFFFFF;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
        }

        .cr-pdp-main-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .cr-pdp-img-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 5rem;
          color: #D8CAD0;
        }

        /* ── Details Panel ── */
        .cr-pdp-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .cr-pdp-brand {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #BE4D6E;
        }

        .cr-pdp-title {
          font-family: var(--font-display, serif);
          font-size: clamp(1.8rem, 3.2vw, 2.5rem);
          font-weight: 700;
          color: #1A0D14;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }

        .cr-pdp-rating-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 0.1rem;
        }

        .cr-pdp-stars {
          color: #C5A059;
          font-size: 0.95rem;
          letter-spacing: 1px;
        }

        .cr-pdp-rating-text {
          font-size: 0.8rem;
          color: #7A6A72;
        }

        .cr-pdp-price-box {
          display: flex;
          align-items: baseline;
          gap: 12px;
          padding: 1.25rem 0;
          border-top: 1px solid #F0E8EC;
          border-bottom: 1px solid #F0E8EC;
          margin: 0.75rem 0;
        }

        .cr-pdp-price {
          font-size: 1.85rem;
          font-weight: 700;
          color: #7B2347;
          letter-spacing: -0.02em;
        }

        .cr-pdp-original-price {
          font-size: 1.1rem;
          color: #A3969C;
          text-decoration: line-through;
        }

        .cr-pdp-discount-tag {
          padding: 0.25rem 0.6rem;
          background: #FBE9F0;
          color: #7B2347;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 4px;
        }

        .cr-pdp-description {
          font-size: 0.95rem;
          color: #55454C;
          line-height: 1.65;
          margin-bottom: 0.5rem;
        }

        .cr-pdp-stock-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .cr-stock-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .cr-stock-dot--in {
          background: #16A34A;
        }

        .cr-stock-dot--out {
          background: #DC2626;
        }

        .cr-stock-label {
          color: #2D1E24;
        }

        /* ── Actions ── */
        .cr-pdp-cta-block {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 0.5rem;
        }

        .cr-pdp-qty-stepper {
          display: flex;
          align-items: center;
          border: 1.5px solid #D8CAD0;
          border-radius: 6px;
          height: 48px;
          background: #FFFFFF;
        }

        .cr-qty-btn {
          width: 38px;
          height: 100%;
          background: none;
          border: none;
          font-size: 1.1rem;
          color: #1A0D14;
          cursor: pointer;
        }

        .cr-qty-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .cr-qty-val {
          min-width: 32px;
          text-align: center;
          font-size: 0.95rem;
          font-weight: 700;
        }

        .cr-btn-add-cart {
          flex: 1;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #7B2347;
          color: #FFFFFF;
          font-family: inherit;
          font-size: 0.88rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s ease;
          box-shadow: 0 4px 16px rgba(123, 35, 71, 0.25);
        }

        .cr-btn-add-cart:hover {
          background: #5E1734;
        }

        .cr-btn-wishlist {
          width: 48px;
          height: 48px;
          border-radius: 6px;
          border: 1.5px solid #D8CAD0;
          background: #FFFFFF;
          color: #7A6A72;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cr-btn-wishlist:hover {
          border-color: #7B2347;
          color: #7B2347;
        }

        .cr-btn-wishlist--active {
          background: #FBEFF4;
          border-color: #7B2347;
          color: #7B2347;
        }

        .cr-btn-oos {
          width: 100%;
          height: 48px;
          background: #EBE4E8;
          color: #7A6A72;
          font-size: 0.88rem;
          font-weight: 700;
          text-transform: uppercase;
          border: none;
          border-radius: 6px;
          cursor: not-allowed;
        }

        .cr-pdp-wa-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0.85rem 1rem;
          background: #F0FDF4;
          border: 1.5px solid #BBF7D0;
          border-radius: 6px;
          color: #15803D;
          font-weight: 700;
          font-size: 0.88rem;
          text-decoration: none;
          margin-top: 0.5rem;
          transition: all 0.2s ease;
        }

        .cr-pdp-wa-btn:hover {
          background: #DCFCE7;
          border-color: #86EFAC;
        }

        /* ── Related Section ── */
        .cr-pdp-related {
          margin-top: 5rem;
          padding-top: 3.5rem;
          border-top: 1px solid #F0E8EC;
        }

        .cr-related-header {
          margin-bottom: 2rem;
        }

        .cr-related-eyebrow {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #7B2347;
          margin-bottom: 0.25rem;
        }

        .cr-related-title {
          font-family: var(--font-display, serif);
          font-size: 1.8rem;
          font-weight: 700;
          color: #1A0D14;
        }

        .cr-related-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        /* ── Breakpoints ── */
        @media (max-width: 960px) {
          .cr-pdp-layout {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .cr-pdp-gallery {
            position: static;
          }
          .cr-pdp-media-frame {
            max-width: 520px;
            margin: 0 auto;
          }
          .cr-related-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
