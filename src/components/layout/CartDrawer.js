'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/formatPrice';

export default function CartDrawer() {
  const {
    items, isOpen, closeDrawer, removeItem, updateQuantity,
    totalCount, subtotal, deliveryFee, total,
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

  return (
    <>
      <div className="drawer-overlay" onClick={closeDrawer} aria-hidden="true" />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Shopping cart">

        {/* Header */}
        <div className="drawer-header">
          <h2 className="drawer-title">
            Shopping Cart
            {totalCount > 0 && (
              <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 'var(--weight-regular)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginLeft: '0.5rem' }}>
                ({totalCount} items)
              </span>
            )}
          </h2>
          <button className="btn-icon" onClick={closeDrawer} aria-label="Close cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {isEmpty ? (
            <div className="empty-cart">
              <div className="empty-cart__icon">🛍</div>
              <h3 className="empty-cart__title">Your cart is empty</h3>
              <p className="empty-cart__body">
                Add some products to get started.
              </p>
              <Link href="/shop" className="btn btn-primary btn-sm" onClick={closeDrawer}>
                Browse Shop
              </Link>
            </div>
          ) : (
            <ul role="list">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="cart-item">
                  {/* Image */}
                  <div style={{
                    width: 72, height: 72,
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    background: 'var(--bg-category)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                  }}>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="cart-item__image"
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerText = '🧴';
                        }}
                      />
                    ) : '🧴'}
                  </div>

                  {/* Info */}
                  <div className="cart-item__info">
                    {product.brand && <span className="cart-item__brand">{product.brand}</span>}
                    <p className="cart-item__name">{product.name}</p>
                    <div className="cart-item__meta">
                      <span className="cart-item__price">{formatPrice(product.price * quantity)}</span>
                      <div className="cart-item__controls">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          aria-label={`Decrease ${product.name}`}
                          disabled={quantity <= 1}
                        >−</button>
                        <span className="qty-num">{quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          aria-label={`Increase ${product.name}`}
                          disabled={product.stockCount && quantity >= product.stockCount}
                        >+</button>
                        <button
                          className="cart-item__remove"
                          onClick={() => removeItem(product.id)}
                          aria-label={`Remove ${product.name}`}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer summary */}
        {!isEmpty && (
          <div className="drawer-footer">
            <div>
              <div className="cart-summary__row">
                <span>Subtotal</span>
                <span style={{ fontWeight: 'var(--weight-medium)', color: 'var(--text)' }}>{formatPrice(subtotal)}</span>
              </div>
              <div className="cart-summary__row">
                <span>Delivery</span>
                <span style={{ color: 'var(--text-tertiary)' }}>
                  {deliveryFee !== null && deliveryFee !== undefined
                    ? deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)
                    : 'To be confirmed'}
                </span>
              </div>
              <div className="cart-summary__row total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
              <Link href="/checkout" className="btn btn-primary btn-full" onClick={closeDrawer}>
                Proceed to Checkout
              </Link>
              <Link href="/cart" className="btn btn-outline btn-full btn-sm" onClick={closeDrawer}>
                View Full Cart
              </Link>
            </div>

            <p style={{
              marginTop: 'var(--space-4)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-faint)',
              textAlign: 'center',
              letterSpacing: 'var(--tracking-wide)',
            }}>
              🔒 Secure checkout · Mobile Money · Cash
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
