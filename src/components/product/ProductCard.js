'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice } from '@/utils/formatPrice';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const { id, slug, name, brand, price, originalPrice, image, inStock } = product;
  const isWishlisted = isInWishlist(id);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="product-card">
      {/* Product Image */}
      <div className="media-box">
        <Link href={`/shop/${slug}`} className="image-link" aria-label={name}>
          <img
            src={image || '/images/products/1.jpeg'}
            alt={name}
            loading="lazy"
          />
        </Link>

        {/* Wishlist Icon */}
        <button
          type="button"
          className={`wishlist-btn ${isWishlisted ? 'is-active' : ''}`}
          onClick={handleWishlist}
          aria-label="Save to wishlist"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isWishlisted ? '#111' : 'none'} stroke="#111" strokeWidth="1.8">
            <path d="M20.8 8.7c0 5.5-8.8 10.1-8.8 10.1S3.2 14.2 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z"/>
          </svg>
        </button>

        {!inStock && <span className="sold-out-tag">Sold Out</span>}
      </div>

      {/* Product Details */}
      <div className="info-box">
        {brand && <span className="brand-label">{brand}</span>}
        <Link href={`/shop/${slug}`} className="name-link">
          <h3 className="product-name">{name}</h3>
        </Link>

        <div className="price-row">
          <span className="current-price">{formatPrice(price)}</span>
          {originalPrice && originalPrice > price && (
            <span className="original-price">{formatPrice(originalPrice)}</span>
          )}
        </div>

        {/* Clean Add to Bag Button */}
        <button
          type="button"
          className={`add-btn ${added ? 'is-added' : ''}`}
          onClick={handleAdd}
          disabled={!inStock}
        >
          {!inStock ? 'Out of Stock' : added ? '✓ Added to Bag' : 'Add to Bag'}
        </button>
      </div>

      <style jsx>{`
        .product-card {
          display: flex;
          flex-direction: column;
          background: #FFFFFF;
          border: 1px solid #EAEAEA;
          border-radius: 8px;
          overflow: hidden;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .product-card:hover {
          border-color: #CCCCCC;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }

        .media-box {
          position: relative;
          aspect-ratio: 1 / 1;
          background: #F9F9F9;
          overflow: hidden;
        }
        .image-link {
          display: block;
          width: 100%;
          height: 100%;
        }
        .media-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .product-card:hover .media-box img {
          transform: scale(1.03);
        }

        .wishlist-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 32px;
          height: 32px;
          background: #FFFFFF;
          border: 1px solid #EAEAEA;
          border-radius: 50%;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: background 0.15s;
        }
        .wishlist-btn:hover {
          background: #F5F5F5;
        }

        .sold-out-tag {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(0, 0, 0, 0.75);
          color: #FFFFFF;
          font-size: 0.65rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 4px;
        }

        .info-box {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .brand-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: #777777;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }
        .name-link {
          text-decoration: none;
          color: inherit;
        }
        .product-name {
          font-size: 0.9rem;
          font-weight: 600;
          line-height: 1.35;
          color: #111111;
          margin: 0 0 0.5rem;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
          min-height: 2.45em;
        }

        .price-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 0.85rem;
          margin-top: auto;
        }
        .current-price {
          font-size: 1rem;
          font-weight: 700;
          color: #111111;
        }
        .original-price {
          font-size: 0.8rem;
          color: #999999;
          text-decoration: line-through;
        }

        .add-btn {
          width: 100%;
          height: 38px;
          background: #111111;
          color: #FFFFFF;
          border: none;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .add-btn:hover:not(:disabled) {
          background: #333333;
        }
        .add-btn.is-added {
          background: #166534;
        }
        .add-btn:disabled {
          background: #EEEEEE;
          color: #999999;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
