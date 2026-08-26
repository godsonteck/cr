'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice, getDiscountPercent } from '@/utils/formatPrice';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (!product) return null;

  const {
    id, slug, name, brand, price, originalPrice,
    image, rating, reviewCount, badge, inStock,
  } = product;

  const isWishlisted = isInWishlist(id);
  const discount     = getDiscountPercent(originalPrice, price);
  const badgeLabel   = !inStock ? 'out' : badge;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addItem(product, 1);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const [imgError, setImgError] = React.useState(false);

  return (
    <div className={`pc-card${!inStock ? ' pc-card--oos' : ''}`}>
      <Link href={`/shop/${slug}`} className="pc-card__link" aria-label={`${name} — ${formatPrice(price)}`}>
        {/* ── Image Canvas ── */}
        <div className="pc-card__media">
          {badgeLabel && (
            <span className={`pc-badge pc-badge--${badgeLabel}`}>
              {badgeLabel === 'out'  ? 'Sold Out'
                : badgeLabel === 'sale' ? `−${discount}%`
                : badgeLabel.charAt(0).toUpperCase() + badgeLabel.slice(1)}
            </span>
          )}

          <button
            type="button"
            className={`pc-wishlist-btn${isWishlisted ? ' pc-wishlist-btn--active' : ''}`}
            onClick={handleWishlist}
            aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
            aria-pressed={isWishlisted}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {image && !imgError ? (
            <img
              src={image}
              alt={name}
              className="pc-card__img"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="pc-card__img-fallback" aria-hidden="true">
              <span>✨</span>
            </div>
          )}

          {/* Quick Add Tray */}
          <div className="pc-card__action-tray">
            {inStock ? (
              <button
                type="button"
                className="pc-btn-quick-add"
                onClick={handleAddToCart}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span>Add to Cart</span>
              </button>
            ) : (
              <div className="pc-btn-oos-pill">Out of Stock</div>
            )}
          </div>
        </div>

        {/* ── Product Info ── */}
        <div className="pc-card__info">
          {brand && <p className="pc-card__brand">{brand}</p>}
          <h3 className="pc-card__title">{name}</h3>

          <div className="pc-card__meta-row">
            <div className="pc-card__prices">
              <span className="pc-card__price">{formatPrice(price)}</span>
              {originalPrice && originalPrice > price && (
                <span className="pc-card__original-price">{formatPrice(originalPrice)}</span>
              )}
            </div>

            {rating && (
              <div className="pc-card__rating" title={`${rating} out of 5 stars`}>
                <span className="pc-card__star">★</span>
                <span className="pc-card__rating-num">{rating.toFixed(1)}</span>
                {reviewCount && <span className="pc-card__reviews">({reviewCount})</span>}
              </div>
            )}
          </div>
        </div>
      </Link>

      <style jsx>{`
        .pc-card {
          position: relative;
          background: #ffffff;
          border-radius: 6px;
          border: 1px solid #F0E8EC;
          overflow: hidden;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .pc-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px -6px rgba(123, 35, 71, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.03);
          border-color: #E2D2D9;
        }

        .pc-card__link {
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        /* ── Media ── */
        .pc-card__media {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 4.8;
          background: #FAF6F8;
          overflow: hidden;
        }

        .pc-card__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pc-card:hover .pc-card__img {
          transform: scale(1.04);
        }

        .pc-card__img-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          color: #D4B2C0;
        }

        /* ── Badge ── */
        .pc-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 3;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.25rem 0.55rem;
          border-radius: 3px;
        }
        .pc-badge--new,
        .pc-badge--bestseller {
          background: #1A0D14;
          color: #FFFFFF;
        }
        .pc-badge--sale {
          background: #C92A2A;
          color: #FFFFFF;
        }
        .pc-badge--out {
          background: rgba(255, 255, 255, 0.95);
          color: #7A6A72;
          border: 1px solid #D8CAD0;
        }

        /* ── Wishlist Button ── */
        .pc-wishlist-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 3;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(235, 224, 230, 0.8);
          color: #8C7E84;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        }

        .pc-wishlist-btn:hover {
          color: #7B2347;
          background: #FFFFFF;
          transform: scale(1.08);
        }

        .pc-wishlist-btn--active {
          color: #7B2347 !important;
          background: #FBEFF4 !important;
          border-color: #E8C8D6 !important;
        }

        /* ── Quick Add Tray ── */
        .pc-card__action-tray {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 8px;
          z-index: 4;
          transform: translateY(100%);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pc-card:hover .pc-card__action-tray,
        .pc-card:focus-within .pc-card__action-tray {
          transform: translateY(0);
        }

        .pc-btn-quick-add {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 0.65rem 0.85rem;
          background: #7B2347;
          color: #ffffff;
          font-family: inherit;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(123, 35, 71, 0.25);
          transition: background 0.15s ease;
        }

        .pc-btn-quick-add:hover {
          background: #5E1734;
        }

        .pc-btn-oos-pill {
          width: 100%;
          text-align: center;
          padding: 0.55rem;
          background: rgba(255, 255, 255, 0.94);
          color: #7A6A72;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border-radius: 4px;
          border: 1px solid #EBE0E6;
        }

        /* ── Info ── */
        .pc-card__info {
          padding: 0.9rem 1rem 1.1rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .pc-card__brand {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #9C8C94;
          margin-bottom: 0.25rem;
        }

        .pc-card__title {
          font-family: var(--font-primary, sans-serif);
          font-size: 0.9rem;
          font-weight: 600;
          color: #1A0D14;
          line-height: 1.35;
          margin-bottom: 0.65rem;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
          min-height: 2.4em;
        }

        .pc-card__meta-row {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .pc-card__prices {
          display: flex;
          align-items: baseline;
          gap: 0.4rem;
        }

        .pc-card__price {
          font-size: 0.95rem;
          font-weight: 700;
          color: #7B2347;
          letter-spacing: -0.01em;
        }

        .pc-card__original-price {
          font-size: 0.75rem;
          color: #A3969C;
          text-decoration: line-through;
        }

        .pc-card__rating {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 0.72rem;
          color: #7A6A72;
        }

        .pc-card__star {
          color: #C5A059;
          font-size: 0.8rem;
        }

        .pc-card__rating-num {
          font-weight: 600;
          color: #2D1E24;
        }

        .pc-card__reviews {
          font-size: 0.65rem;
          color: #A3969C;
        }

        .pc-card--oos .pc-card__img {
          opacity: 0.65;
        }

        /* ── Mobile always visible tray or tap ── */
        @media (max-width: 768px) {
          .pc-card__action-tray {
            position: static;
            transform: none;
            padding: 0.6rem 1rem 0.8rem;
            background: #ffffff;
          }
          .pc-btn-quick-add {
            padding: 0.55rem 0.75rem;
            font-size: 0.68rem;
          }
        }
      `}</style>
    </div>
  );
}
