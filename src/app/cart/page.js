'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import QuantitySelector from '@/components/ui/QuantitySelector';
import EmptyState from '@/components/ui/EmptyState';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/formatPrice';
import { BUSINESS } from '@/utils/constants';

export default function CartPage() {
  const {
    items,
    totalCount,
    subtotal,
    deliveryFee,
    total,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    if (promoCode.trim().toUpperCase() === 'WELCOME10' || promoCode.trim().toUpperCase() === 'GLOW10') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Try "WELCOME10" for 10% off.');
      setPromoApplied(false);
    }
  };

  const discountAmount = promoApplied ? subtotal * 0.1 : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const breadcrumbs = [{ label: 'Cart' }];

  const generateWhatsAppCartLink = () => {
    const lines = items.map(
      (it, idx) =>
        `${idx + 1}. ${it.product.name} (Qty: ${it.quantity}) — GHS ${(it.product.price * it.quantity).toFixed(2)}`
    );
    const msg = `Hello CR Cosmetics & Essentials,\nI would like to order the following items from my cart:\n\n${lines.join('\n')}\n\n• Subtotal: GHS ${subtotal.toFixed(2)}${promoApplied ? `\n• Discount (10%): -GHS ${discountAmount.toFixed(2)}` : ''}\n• Order Total: GHS ${finalTotal.toFixed(2)}\n\nPlease confirm availability and delivery dispatch to my area.`;
    return `https://wa.me/233592153306?text=${encodeURIComponent(msg)}`;
  };

  if (items.length === 0) {
    return (
      <div className="container cart-empty-wrap">
        <Breadcrumb items={breadcrumbs} />
        <EmptyState
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          }
          title="Your Shopping Cart is Empty"
          description="Looks like you haven't added any skincare or grocery items to your cart yet."
          actionLabel="Explore Store Catalogue"
          actionHref="/shop"
        />
        <style jsx>{`
          .cart-empty-wrap {
            padding-top: calc(var(--header-h, 74px) + 2rem);
            padding-bottom: var(--space-20);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <Breadcrumb items={breadcrumbs} />

        <div className="cart-header">
          <h1 className="heading-2">Your Shopping Cart</h1>
          <span className="cart-item-count">{totalCount} item{totalCount !== 1 ? 's' : ''}</span>
        </div>

        {/* Free Shipping Tracker */}
        <div className="free-shipping-progress-banner">
          <p className="shipping-banner-text">
            {subtotal >= 300 ? (
              <strong>🎉 You have unlocked FREE Doorstep Delivery in Greater Accra!</strong>
            ) : (
              <span>
                Add <strong>{formatPrice(300 - subtotal)}</strong> more to qualify for <strong>FREE Doorstep Delivery</strong> in Accra.
              </span>
            )}
          </p>
          <div className="progress-track">
            <div
              className="progress-bar"
              style={{ width: `${Math.min(100, (subtotal / 300) * 100)}%` }}
            />
          </div>
        </div>

        <div className="cart-layout-grid">
          {/* Main Cart Items List */}
          <div className="cart-items-section">
            <div className="cart-table-header">
              <span className="col-product">Product</span>
              <span className="col-price">Unit Price</span>
              <span className="col-qty">Quantity</span>
              <span className="col-subtotal">Subtotal</span>
            </div>

            <div className="cart-items-body">
              {items.map(({ product, quantity }) => {
                const isSkincare = product.category === 'skincare';
                const lineTotal = product.price * quantity;

                return (
                  <div key={product.id} className="cart-item-card">
                    {/* Thumbnail */}
                    <div className={`item-thumb ${isSkincare ? 'thumb-skincare' : 'thumb-grocery'}`}>
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="item-img" />
                      ) : (
                        <span className="item-icon-fallback">{isSkincare ? '✨' : '🍯'}</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="item-info">
                      {product.brand && <span className="item-brand">{product.brand}</span>}
                      <Link href={`/shop/${product.slug}`} className="item-title">
                        {product.name}
                      </Link>
                      <div className="item-unit-price-mobile">
                        {formatPrice(product.price)} each
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        className="item-remove-btn"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Desktop Unit Price */}
                    <div className="item-unit-price-desktop">
                      {formatPrice(product.price)}
                    </div>

                    {/* Quantity Stepper */}
                    <div className="item-qty-cell">
                      <QuantitySelector
                        value={quantity}
                        min={1}
                        max={product.stockCount || 99}
                        onChange={(newQty) => updateQuantity(product.id, newQty)}
                      />
                    </div>

                    {/* Line Subtotal */}
                    <div className="item-subtotal-cell">
                      {formatPrice(lineTotal)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-actions-row">
              <Button href="/shop" variant="outline" size="sm">
                ← Continue Shopping
              </Button>
              <button
                type="button"
                onClick={clearCart}
                className="clear-cart-text-btn"
              >
                Clear Entire Cart
              </button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="cart-summary-col">
            <div className="summary-card">
              <h3 className="summary-title">Order Summary</h3>

              <div className="summary-lines">
                <div className="summary-line">
                  <span>Subtotal ({totalCount} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="summary-line">
                  <span>Delivery in Accra</span>
                  <span>{subtotal >= 300 ? 'FREE' : 'Calculated at checkout'}</span>
                </div>

                {promoApplied && (
                  <div className="summary-line discount-line">
                    <span>Discount (10% Off)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="summary-divider" />

                <div className="summary-line total-line">
                  <span>Order Subtotal</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Promo Code Box */}
              <form onSubmit={handleApplyPromo} className="promo-form" aria-label="Promo code">
                <div className="promo-input-row">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code (e.g. WELCOME10)"
                    className="promo-input"
                  />
                  <button type="submit" className="promo-btn">
                    Apply
                  </button>
                </div>
                {promoError && <p className="promo-msg error">{promoError}</p>}
                {promoApplied && <p className="promo-msg success">Promo WELCOME10 applied (10% off)!</p>}
              </form>

              <div className="cart-checkout-actions">
                <Button href="/checkout" variant="primary" size="lg" fullWidth>
                  Proceed to Secure Checkout →
                </Button>

                <a
                  href={generateWhatsAppCartLink()}
                  className="cart-btn-wa-order"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>💬</span>
                  <span>Order Entire Cart via WhatsApp</span>
                </a>
              </div>

              <div className="checkout-assurances">
                <div className="assurance-bullet">
                  <span>🛡️</span>
                  <span>100% Genuine, verified skincare and essentials.</span>
                </div>
                <div className="assurance-bullet">
                  <span>📍</span>
                  <span>Store pickup & fast Accra doorstep delivery.</span>
                </div>
                <div className="assurance-bullet">
                  <span>💳</span>
                  <span>MoMo (MTN, Telecel, AT) and Cash on Delivery.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cart-page {
          padding-top: calc(var(--header-h, 74px) + 2rem);
          padding-bottom: var(--space-20);
          background: #FAF8F6;
          min-height: 100vh;
        }
        .cart-header {
          display: flex;
          align-items: baseline;
          gap: var(--space-3);
          margin-bottom: var(--space-6);
        }
        .cart-item-count {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
        }
        .free-shipping-progress-banner {
          background-color: #FDF4F7;
          border: 1px solid #E8D2DC;
          border-radius: var(--radius-lg);
          padding: var(--space-4) var(--space-6);
          margin-bottom: var(--space-8);
        }
        .shipping-banner-text {
          font-size: var(--text-sm);
          color: #6B1733;
          margin-bottom: var(--space-2);
        }
        .progress-track {
          width: 100%;
          height: 6px;
          background: rgba(107, 23, 51, 0.12);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          background: #6B1733;
          border-radius: var(--radius-full);
          transition: width 0.3s ease;
        }
        .cart-layout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-8);
        }
        @media (min-width: 1024px) {
          .cart-layout-grid {
            grid-template-columns: 1fr 380px;
            gap: var(--space-10);
          }
        }
        .cart-table-header {
          display: none;
          grid-template-columns: 3fr 1fr 1.5fr 1fr;
          padding-bottom: var(--space-3);
          border-bottom: 1px solid #EBE2E6;
          font-size: var(--text-xs);
          font-weight: var(--weight-bold);
          text-transform: uppercase;
          letter-spacing: var(--tracking-wider);
          color: #8C7C84;
        }
        @media (min-width: 768px) {
          .cart-table-header {
            display: grid;
          }
        }
        .cart-items-body {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          margin-top: var(--space-4);
        }
        .cart-item-card {
          display: grid;
          grid-template-columns: 80px 1fr auto;
          gap: var(--space-4);
          padding: var(--space-4);
          background: #FFFFFF;
          border: 1px solid #EBE2E6;
          border-radius: var(--radius-lg);
          align-items: center;
        }
        @media (min-width: 768px) {
          .cart-item-card {
            grid-template-columns: 80px 2fr 1fr 1.5fr 1fr;
            padding: var(--space-4) var(--space-6);
          }
        }
        .item-thumb {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: #F8EFF3;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .item-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .item-icon-fallback {
          font-size: 2rem;
        }
        .item-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .item-brand {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #BE4D6E;
        }
        .item-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #161114;
          text-decoration: none;
          line-height: 1.3;
        }
        .item-title:hover {
          color: #6B1733;
        }
        .item-unit-price-mobile {
          font-size: 0.85rem;
          color: #6B5B63;
        }
        @media (min-width: 768px) {
          .item-unit-price-mobile {
            display: none;
          }
        }
        .item-remove-btn {
          align-self: flex-start;
          background: none;
          border: none;
          padding: 0;
          font-size: 0.75rem;
          color: #BE4D6E;
          text-decoration: underline;
          cursor: pointer;
          margin-top: 4px;
        }
        .item-unit-price-desktop {
          display: none;
          font-size: 0.9rem;
          color: #161114;
          font-weight: 500;
        }
        @media (min-width: 768px) {
          .item-unit-price-desktop {
            display: block;
          }
        }
        .item-subtotal-cell {
          display: none;
          font-size: 0.95rem;
          font-weight: 700;
          color: #161114;
        }
        @media (min-width: 768px) {
          .item-subtotal-cell {
            display: block;
          }
        }
        .cart-actions-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--space-6);
        }
        .clear-cart-text-btn {
          background: none;
          border: none;
          font-size: 0.82rem;
          color: #8C7C84;
          text-decoration: underline;
          cursor: pointer;
        }
        .clear-cart-text-btn:hover {
          color: #BE4D6E;
        }

        /* ── Summary Card ── */
        .summary-card {
          background: #FFFFFF;
          border: 1px solid #EBE2E6;
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          position: sticky;
          top: calc(var(--header-h, 74px) + 20px);
          box-shadow: 0 4px 16px rgba(107, 23, 51, 0.04);
        }
        .summary-title {
          font-family: var(--font-display, serif);
          font-size: 1.35rem;
          font-weight: 700;
          margin-bottom: var(--space-6);
          color: #161114;
        }
        .summary-lines {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .summary-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: #55454C;
        }
        .discount-line {
          color: #1E8E49;
          font-weight: 600;
        }
        .summary-divider {
          height: 1px;
          background: #EBE2E6;
          margin: var(--space-3) 0;
        }
        .total-line {
          font-size: 1.15rem;
          font-weight: 700;
          color: #161114;
        }
        .promo-form {
          margin: var(--space-5) 0;
        }
        .promo-input-row {
          display: flex;
          gap: 8px;
        }
        .promo-input {
          flex: 1;
          padding: 0.65rem 0.85rem;
          border: 1.5px solid #D8CAD0;
          border-radius: 6px;
          font-size: 0.85rem;
          outline: none;
        }
        .promo-input:focus {
          border-color: #6B1733;
        }
        .promo-btn {
          padding: 0.65rem 1.1rem;
          background: #161114;
          color: #FFFFFF;
          border: none;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.82rem;
          cursor: pointer;
        }
        .promo-msg {
          font-size: 0.78rem;
          margin-top: 4px;
        }
        .promo-msg.error { color: #D32F2F; }
        .promo-msg.success { color: #1E8E49; }

        .cart-checkout-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: var(--space-6);
        }

        .cart-btn-wa-order {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #1E8E49;
          color: #FFFFFF;
          padding: 0.85rem;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.88rem;
          text-decoration: none;
          transition: background 0.2s;
        }
        .cart-btn-wa-order:hover {
          background: #176F39;
        }

        .checkout-assurances {
          margin-top: var(--space-6);
          padding-top: var(--space-5);
          border-top: 1px solid #EBE2E6;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .assurance-bullet {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 0.8rem;
          color: #6B5B63;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
