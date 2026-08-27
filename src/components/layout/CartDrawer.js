'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/formatPrice';

const FREE_SHIPPING_THRESHOLD = 300;

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    totalCount,
    subtotal,
    deliveryFee,
    total,
  } = useCart();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeDrawer(); };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeDrawer]);

  if (!isOpen) return null;

  const isEmpty = items.length === 0;
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <>
      <div className="cd-overlay" onClick={closeDrawer} aria-hidden="true" />
      <aside className="cd-drawer" role="dialog" aria-modal="true" aria-label="Shopping Cart">

        {/* Header */}
        <div className="cd-header">
          <div className="cd-title-wrap">
            <h2 className="cd-title">Your Shopping Bag</h2>
            <span className="cd-count-badge">{totalCount} item{totalCount !== 1 ? 's' : ''}</span>
          </div>
          <button className="cd-close-btn" onClick={closeDrawer} aria-label="Close cart drawer">
            ✕
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="cd-shipping-bar">
          <div className="cd-shipping-text">
            {amountToFreeShipping > 0 ? (
              <span>Add <strong>{formatPrice(amountToFreeShipping)}</strong> more for <strong>FREE Delivery in Accra</strong>!</span>
            ) : (
              <span className="cd-shipping-unlocked">🎉 You qualified for <strong>FREE Delivery in Accra</strong>!</span>
            )}
          </div>
          <div className="cd-progress-track">
            <div className="cd-progress-fill" style={{ width: `${freeShippingProgress}%` }} />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="cd-body">
          {isEmpty ? (
            <div className="cd-empty">
              <div className="cd-empty-icon">🛍️</div>
              <h3>Your bag is currently empty</h3>
              <p>Explore our genuine skincare &amp; grocery essentials to get started.</p>
              <Link href="/shop" className="cd-btn cd-btn--primary" onClick={closeDrawer}>
                Start Shopping
              </Link>
            </div>
          ) : (
            <ul className="cd-items" role="list">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="cd-item">
                  {/* Thumbnail */}
                  <Link href={`/shop/${product.slug}`} className="cd-item-thumb" onClick={closeDrawer}>
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <span>🧴</span>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="cd-item-info">
                    {product.brand && <span className="cd-item-brand">{product.brand}</span>}
                    <Link href={`/shop/${product.slug}`} className="cd-item-name" onClick={closeDrawer}>
                      {product.name}
                    </Link>

                    <div className="cd-item-price-row">
                      <span className="cd-item-price">{formatPrice(product.price)}</span>
                      <span className="cd-item-subtotal">Total: {formatPrice(product.price * quantity)}</span>
                    </div>

                    {/* Quantity Selector & Remove */}
                    <div className="cd-item-controls">
                      <div className="cd-qty-box">
                        <button
                          type="button"
                          className="cd-qty-btn"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          disabled={quantity <= 1}
                          aria-label={`Decrease ${product.name}`}
                        >
                          −
                        </button>
                        <span className="cd-qty-num">{quantity}</span>
                        <button
                          type="button"
                          className="cd-qty-btn"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={product.stockCount && quantity >= product.stockCount}
                          aria-label={`Increase ${product.name}`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="cd-item-remove"
                        onClick={() => removeItem(product.id)}
                        aria-label={`Remove ${product.name} from cart`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Drawer Footer & Checkout */}
        {!isEmpty && (
          <div className="cd-footer">
            <div className="cd-summary">
              <div className="cd-summary-row">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <div className="cd-summary-row">
                <span>Estimated Delivery</span>
                <span className="cd-delivery-val">
                  {amountToFreeShipping === 0 ? 'FREE' : 'Calculated at checkout'}
                </span>
              </div>
              <div className="cd-summary-row cd-summary-row--total">
                <span>Estimated Total</span>
                <strong>{formatPrice(total)}</strong>
              </div>
            </div>

            <div className="cd-actions">
              <Link href="/checkout" className="cd-btn cd-btn--checkout" onClick={closeDrawer}>
                <span>Proceed to Checkout</span>
                <span>→</span>
              </Link>
              <Link href="/cart" className="cd-btn cd-btn--view-cart" onClick={closeDrawer}>
                View Full Cart
              </Link>
            </div>

            <div className="cd-trust-footer">
              <span>🔒 100% Secure Checkout</span>
              <span>📱 MoMo &bull; Telecel &bull; Cash</span>
            </div>
          </div>
        )}
      </aside>

      <style jsx>{`
        .cd-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26, 13, 20, 0.65);
          backdrop-filter: blur(4px);
          z-index: 999;
          animation: cd-fade 0.25s ease;
        }

        .cd-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          max-width: 440px;
          background: #FFFFFF;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          box-shadow: -8px 0 32px rgba(0, 0, 0, 0.2);
          animation: cd-slide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: var(--font-primary, sans-serif);
        }

        @keyframes cd-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cd-slide {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }

        /* ── Header ── */
        .cd-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #EBE2E6;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #FAF8F6;
        }
        .cd-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .cd-title {
          font-family: var(--font-display, serif);
          font-size: 1.35rem;
          font-weight: 700;
          color: #1A0D14;
          margin: 0;
        }
        .cd-count-badge {
          background: #EBE0E6;
          color: #7B2347;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 999px;
        }
        .cd-close-btn {
          background: none;
          border: none;
          font-size: 1.1rem;
          cursor: pointer;
          color: #63545B;
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          transition: background 0.15s;
        }
        .cd-close-btn:hover {
          background: #EBE2E6;
          color: #1A0D14;
        }

        /* ── Free shipping progress ── */
        .cd-shipping-bar {
          background: #FFF8FA;
          border-bottom: 1px solid #F0E2E7;
          padding: 0.85rem 1.5rem;
        }
        .cd-shipping-text {
          font-size: 0.78rem;
          color: #55454C;
          margin-bottom: 0.5rem;
          text-align: center;
        }
        .cd-shipping-text strong {
          color: #7B2347;
        }
        .cd-shipping-unlocked {
          color: #166534;
          font-weight: 600;
        }
        .cd-progress-track {
          height: 6px;
          background: #EBE0E6;
          border-radius: 999px;
          overflow: hidden;
        }
        .cd-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #7B2347 0%, #C59B3F 100%);
          border-radius: 999px;
          transition: width 0.3s ease;
        }

        /* ── Body & Items ── */
        .cd-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem 1.5rem;
        }
        .cd-empty {
          text-align: center;
          padding: 4rem 1rem;
        }
        .cd-empty-icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
        }
        .cd-empty h3 {
          font-family: var(--font-display, serif);
          font-size: 1.4rem;
          color: #1A0D14;
          margin: 0 0 0.5rem;
        }
        .cd-empty p {
          font-size: 0.85rem;
          color: #7A6A72;
          margin: 0 0 1.5rem;
        }

        .cd-items {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .cd-item {
          display: grid;
          grid-template-columns: 75px 1fr;
          gap: 1rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid #F0E8EC;
        }
        .cd-item-thumb {
          width: 75px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          background: #FAF6F8;
          border: 1px solid #EBE2E6;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cd-item-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .cd-item-info {
          display: flex;
          flex-direction: column;
        }
        .cd-item-brand {
          font-size: 0.62rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #7B2347;
          margin-bottom: 2px;
        }
        .cd-item-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: #1A0D14;
          text-decoration: none;
          line-height: 1.3;
          margin-bottom: 0.35rem;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }
        .cd-item-price-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          font-size: 0.8rem;
          margin-bottom: 0.5rem;
        }
        .cd-item-price {
          font-weight: 700;
          color: #7B2347;
        }
        .cd-item-subtotal {
          color: #7A6A72;
          font-size: 0.72rem;
        }
        .cd-item-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
        }
        .cd-qty-box {
          display: flex;
          align-items: center;
          border: 1.5px solid #D8CAD0;
          border-radius: 4px;
          background: #FFFFFF;
          height: 28px;
        }
        .cd-qty-btn {
          width: 26px;
          height: 100%;
          background: none;
          border: none;
          font-size: 0.95rem;
          font-weight: 700;
          color: #1A0D14;
          cursor: pointer;
        }
        .cd-qty-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .cd-qty-num {
          min-width: 24px;
          text-align: center;
          font-size: 0.78rem;
          font-weight: 700;
        }
        .cd-item-remove {
          background: none;
          border: none;
          color: #A3969C;
          font-size: 0.72rem;
          text-decoration: underline;
          cursor: pointer;
        }
        .cd-item-remove:hover {
          color: #DC2626;
        }

        /* ── Footer ── */
        .cd-footer {
          padding: 1.25rem 1.5rem;
          background: #FAF8F6;
          border-top: 1px solid #EBE2E6;
        }
        .cd-summary {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-bottom: 1.25rem;
        }
        .cd-summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #63545B;
        }
        .cd-summary-row--total {
          border-top: 1px solid #EBE2E6;
          padding-top: 0.6rem;
          margin-top: 0.25rem;
          font-size: 1.05rem;
          color: #1A0D14;
        }
        .cd-summary-row--total strong {
          color: #7B2347;
          font-size: 1.2rem;
        }
        .cd-delivery-val {
          color: #166534;
          font-weight: 600;
          font-size: 0.78rem;
        }

        .cd-actions {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          margin-bottom: 1rem;
        }
        .cd-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .cd-btn--checkout {
          background: #7B2347;
          color: #FFFFFF;
          border: none;
          box-shadow: 0 4px 14px rgba(123, 35, 71, 0.25);
        }
        .cd-btn--checkout:hover {
          background: #5E1734;
        }
        .cd-btn--view-cart {
          background: #FFFFFF;
          color: #1A0D14;
          border: 1.5px solid #D8CAD0;
        }
        .cd-btn--view-cart:hover {
          border-color: #7B2347;
          color: #7B2347;
        }

        .cd-trust-footer {
          display: flex;
          justify-content: space-between;
          font-size: 0.68rem;
          color: #8C7C84;
          text-align: center;
        }
      `}</style>
    </>
  );
}
