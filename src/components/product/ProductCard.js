'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice, getDiscountPercent } from '@/utils/formatPrice';

function StarRating({ rating }) {
  if (!rating) return null;
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <div className="product-card__stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: full },  (_, i) => <span key={`f${i}`}>★</span>)}
      {half === 1 && <span>★</span>}
      {Array.from({ length: empty }, (_, i) => <span key={`e${i}`} style={{ opacity: 0.3 }}>★</span>)}
    </div>
  );
}

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

  return (
    <Link
      href={`/shop/${slug}`}
      className={`product-card${!inStock ? ' out-of-stock' : ''}`}
      aria-label={`${name} — ${formatPrice(price)}`}
    >
      {/* Image area */}
      <div className="product-card__image-wrap">
        {/* Badge */}
        {badgeLabel && (
          <div className="product-card__badge">
            <span className={`badge badge-${badgeLabel}`}>
              {badgeLabel === 'out' ? 'Sold Out'
                : badgeLabel === 'sale' ? `-${discount}%`
                : badgeLabel.toUpperCase()}
            </span>
          </div>
        )}

        {/* Wishlist heart */}
        <button
          className={`product-card__wishlist${isWishlisted ? ' active' : ''}`}
          onClick={handleWishlist}
          aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
          aria-pressed={isWishlisted}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Product image */}
        {image ? (
          <img
            src={image}
            alt={name}
            className="product-card__image"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.parentElement) e.target.parentElement.style.background = 'var(--bg-category)';
            }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem', background: 'var(--blush)',
            color: 'var(--rose-light)',
          }}>
            🧴
          </div>
        )}

        {/* Quick-add on hover */}
        <div className="product-card__overlay">
          {inStock ? (
            <button
              className="product-card__quick-add"
              onClick={handleAddToCart}
              tabIndex={-1}
            >
              Add to Cart
            </button>
          ) : (
            <div style={{
              width: '100%', padding: '0.55rem 1rem',
              background: 'rgba(255,255,255,0.85)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-primary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-semibold)',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
            }}>
              Out of Stock
            </div>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="product-card__body">
        {brand && <p className="product-card__brand">{brand}</p>}
        <h3 className="product-card__name">{name}</h3>
        <div className="product-card__footer">
          <div>
            {originalPrice && originalPrice > price ? (
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
                <span className="product-card__price product-card__price-sale">{formatPrice(price)}</span>
                <span className="product-card__original-price">{formatPrice(originalPrice)}</span>
              </span>
            ) : (
              <span className="product-card__price">{formatPrice(price)}</span>
            )}
          </div>
          {rating && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
              <StarRating rating={rating} />
              {reviewCount && (
                <span style={{ fontSize: '0.6rem', color: 'var(--text-faint)' }}>({reviewCount})</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
