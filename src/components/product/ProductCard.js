'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice, getDiscountPercent } from '@/utils/formatPrice';

const Icon = ({ children }) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [imgError, setImgError] = React.useState(false);
  if (!product) return null;

  const { id, slug, name, brand, price, originalPrice, image, rating, reviewCount, badge, inStock } = product;
  const isWishlisted = isInWishlist(id);
  const discount = getDiscountPercent(originalPrice, price);
  const badgeLabel = !inStock ? 'Sold out' : badge === 'sale' ? `-${discount}%` : badge ? badge.charAt(0).toUpperCase() + badge.slice(1) : null;

  const handleAddToCart = (e) => { e.preventDefault(); e.stopPropagation(); if (inStock) addItem(product, 1); };
  const handleWishlist = (e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); };

  return (
    <article className={`pc-card${!inStock ? ' pc-card--oos' : ''}`}>
      <div className="pc-media">
        <Link href={`/shop/${slug}`} className="pc-image-link" aria-label={`${name} — ${formatPrice(price)}`}>
          {image && !imgError ? <img src={image} alt={name} className="pc-image" loading="lazy" onError={() => setImgError(true)} /> : <div className="pc-image-fallback"><span>CR</span></div>}
        </Link>
        {badgeLabel && <span className={`pc-badge ${!inStock ? 'pc-badge--out' : ''}`}>{badgeLabel}</span>}
        <button type="button" className={`pc-wishlist${isWishlisted ? ' is-active' : ''}`} onClick={handleWishlist} aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`} aria-pressed={isWishlisted}>
          <Icon><path d="M20.8 8.7c0 5.5-8.8 10.1-8.8 10.1S3.2 14.2 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z" /></Icon>
        </button>
      </div>

      <div className="pc-info">
        <Link href={`/shop/${slug}`} className="pc-copy">
          {brand && <p className="pc-brand">{brand}</p>}
          <h3 className="pc-title">{name}</h3>
        </Link>
        <div className="pc-bottom">
          <div className="pc-prices"><span className="pc-price">{formatPrice(price)}</span>{originalPrice > price && <span className="pc-original">{formatPrice(originalPrice)}</span>}</div>
          {rating ? <div className="pc-rating" aria-label={`${rating} out of 5 stars`}><span>★</span>{rating.toFixed(1)}{reviewCount ? <small>({reviewCount})</small> : null}</div> : null}
        </div>
        <button type="button" className="pc-add" onClick={handleAddToCart} disabled={!inStock}>
          {inStock ? <><Icon><path d="M5 7h14l-1 13H6L5 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></Icon><span>Add to cart</span></> : <span>Out of stock</span>}
        </button>
      </div>

      <style jsx>{`
        .pc-card{position:relative;display:flex;flex-direction:column;height:100%;background:#fff;transition:transform .25s ease}.pc-card:hover{transform:translateY(-2px)}
        .pc-media{position:relative;overflow:hidden;aspect-ratio:1/1.16;background:#f7f3f1}.pc-image-link{display:block;width:100%;height:100%}.pc-image{display:block;width:100%;height:100%;object-fit:cover;transition:transform .55s cubic-bezier(.16,1,.3,1)}.pc-card:hover .pc-image{transform:scale(1.035)}.pc-image-fallback{height:100%;display:grid;place-items:center;color:#b58c9a;font:700 38px var(--font-display,Georgia,serif);background:#f8f0f3}
        .pc-badge{position:absolute;top:12px;left:12px;padding:6px 9px;background:#6b1733;color:#fff;font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.pc-badge--out{background:rgba(255,255,255,.92);color:#685960;border:1px solid #ded3d7}
        .pc-wishlist{position:absolute;top:10px;right:10px;width:36px;height:36px;border:1px solid rgba(220,209,214,.9);border-radius:50%;background:rgba(255,255,255,.92);display:grid;place-items:center;color:#58464e;cursor:pointer;transition:.2s ease}.pc-wishlist:hover,.pc-wishlist.is-active{color:#6b1733;background:#fff5f8;border-color:#dfbdca}
        .pc-info{padding:13px 2px 0;display:flex;flex-direction:column;flex:1}.pc-copy{text-decoration:none;color:inherit}.pc-brand{margin:0 0 5px;color:#9b858e;font-size:9px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}.pc-title{margin:0;color:#25171d;font-size:14px;line-height:1.4;font-weight:600;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;min-height:39px}.pc-bottom{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-top:10px}.pc-prices{display:flex;align-items:baseline;gap:7px}.pc-price{color:#6b1733;font-weight:800;font-size:14px}.pc-original{color:#a99aa0;font-size:11px;text-decoration:line-through}.pc-rating{font-size:10px;color:#67565e;white-space:nowrap}.pc-rating span{color:#b38b3f;margin-right:3px}.pc-rating small{color:#a99aa0;margin-left:2px}.pc-add{margin-top:12px;width:100%;min-height:40px;border:1px solid #6b1733;background:#6b1733;color:#fff;display:flex;align-items:center;justify-content:center;gap:7px;text-transform:uppercase;letter-spacing:.1em;font-size:9px;font-weight:800;cursor:pointer;transition:.2s ease}.pc-add:hover:not(:disabled){background:#501127}.pc-add:disabled{background:#f4eff1;border-color:#e5dce0;color:#8b7c83;cursor:not-allowed}
        @media(max-width:600px){.pc-media{aspect-ratio:1/1.1}.pc-info{padding-top:10px}.pc-title{font-size:13px;min-height:36px}.pc-add{min-height:38px;font-size:8px}.pc-wishlist{width:32px;height:32px}}
      `}</style>
    </article>
  );
}
