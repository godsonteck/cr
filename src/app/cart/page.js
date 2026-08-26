'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import QuantitySelector from '@/components/ui/QuantitySelector';
import EmptyState from '@/components/ui/EmptyState';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/formatPrice';

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
    if (promoCode.trim().toUpperCase() === 'WELCOME10') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Try "WELCOME10" for demo.');
      setPromoApplied(false);
    }
  };

  const discountAmount = promoApplied ? subtotal * 0.1 : 0;
  const finalTotal = Math.max(0, total - discountAmount);

  const breadcrumbs = [{ label: 'Cart' }];

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
                      <span>{isSkincare ? '✨' : '🛒'}</span>
                    </div>

                    {/* Info */}
                    <div className="item-details">
                      <div className="item-category-tag">{product.subcategory || product.category}</div>
                      <Link href={`/shop/${product.slug}`} className="item-title">
                        {product.name}
                      </Link>
                      <div className="item-meta">
                        {product.details?.size && <span>{product.details.size}</span>}
                        {product.details?.weight && <span>{product.details.weight}</span>}
                        <span>• Brand: {product.brand}</span>
                      </div>
                      <div className="item-mobile-price">
                        {formatPrice(product.price)} each
                      </div>
                    </div>

                    {/* Price Desktop */}
                    <div className="item-price-col">
                      {formatPrice(product.price)}
                    </div>

                    {/* Quantity Controls */}
                    <div className="item-qty-col">
                      <QuantitySelector
                        value={quantity}
                        onChange={(newQty) => updateQuantity(product.id, newQty)}
                        size="sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="item-total-col">
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
                  <span>Delivery</span>
                  <span>To be confirmed</span>
                </div>

                {promoApplied && (
                  <div className="summary-line discount-line">
                    <span>Demo Promo (10% Off)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="summary-divider" />

                <div className="summary-line total-line">
                  <span>Estimated Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Promo Code Box */}
              <form onSubmit={handleApplyPromo} className="promo-form" aria-label="Demo promotion field">
                <div className="promo-input-row">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code (try WELCOME10)"
                    className="promo-input"
                  />
                  <button type="submit" className="promo-btn">
                    Apply
                  </button>
                </div>
                {promoError && <p className="promo-msg error">{promoError}</p>}
                {promoApplied && <p className="promo-msg success">Promo WELCOME10 applied (10% off)!</p>}
              </form>

              <Button href="/checkout" variant="primary" size="lg" fullWidth>
                Proceed to Checkout
              </Button>

              <div className="checkout-assurances">
                <div className="assurance-bullet">
                  <span>ℹ️</span>
                  <span>Checkout is a storefront preview; no payment is collected.</span>
                </div>
                <div className="assurance-bullet">
                  <span>📍</span>
                  <span>Store location: Botwe, near Galaxy International School.</span>
                </div>
                <div className="assurance-bullet">
                  <span>📱</span>
                  <span>Payment and fulfilment options await business confirmation.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cart-page {
          padding-bottom: var(--space-20);
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
          background-color: var(--color-primary-subtle);
          border: 1px solid #E8D5CA;
          border-radius: var(--radius-lg);
          padding: var(--space-4) var(--space-6);
          margin-bottom: var(--space-8);
        }
        .shipping-banner-text {
          font-size: var(--text-sm);
          color: var(--color-primary-dark);
          margin-bottom: var(--space-2);
        }
        .progress-track {
          width: 100%;
          height: 6px;
          background: rgba(196, 112, 75, 0.2);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          background: var(--color-primary);
          border-radius: var(--radius-full);
          transition: width var(--duration-normal) var(--ease-out);
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
          border-bottom: 1px solid var(--color-border);
          font-size: var(--text-xs);
          font-weight: var(--weight-bold);
          text-transform: uppercase;
          letter-spacing: var(--tracking-wider);
          color: var(--color-text-tertiary);
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
          display: flex;
          gap: var(--space-4);
          padding: var(--space-4);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          align-items: center;
        }
        @media (min-width: 768px) {
          .cart-item-card {
            display: grid;
            grid-template-columns: 80px 2fr 1fr 1.5fr 1fr;
            align-items: center;
          }
        }
        .item-thumb {
          width: 72px;
          height: 72px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          flex-shrink: 0;
        }
        .thumb-skincare {
          background-color: var(--color-primary-subtle);
        }
        .thumb-grocery {
          background-color: var(--color-secondary-subtle);
        }
        .item-details {
          flex: 1;
        }
        .item-category-tag {
          font-size: 10px;
          font-weight: var(--weight-semibold);
          text-transform: uppercase;
          letter-spacing: var(--tracking-wider);
          color: var(--color-text-tertiary);
        }
        .item-title {
          font-size: var(--text-sm);
          font-weight: var(--weight-semibold);
          color: var(--color-text);
          line-height: 1.3;
        }
        .item-title:hover {
          color: var(--color-primary);
        }
        .item-meta {
          font-size: var(--text-xs);
          color: var(--color-text-secondary);
          margin-top: 2px;
        }
        .item-mobile-price {
          font-size: var(--text-xs);
          font-weight: var(--weight-semibold);
          color: var(--color-text);
          margin-top: 4px;
        }
        @media (min-width: 768px) {
          .item-mobile-price {
            display: none;
          }
        }
        .item-price-col {
          display: none;
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
          color: var(--color-text);
        }
        @media (min-width: 768px) {
          .item-price-col {
            display: block;
          }
        }
        .item-qty-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: var(--space-1);
        }
        .remove-btn {
          background: none;
          border: none;
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
          text-decoration: underline;
          cursor: pointer;
          padding: 0;
        }
        .remove-btn:hover {
          color: var(--color-error);
        }
        .item-total-col {
          display: none;
          font-size: var(--text-base);
          font-weight: var(--weight-bold);
          color: var(--color-text);
        }
        @media (min-width: 768px) {
          .item-total-col {
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
          font-size: var(--text-xs);
          color: var(--color-text-secondary);
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: underline;
        }
        .clear-cart-text-btn:hover {
          color: var(--color-error);
        }
        .summary-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          position: sticky;
          top: calc(var(--header-height) + var(--space-6));
        }
        .summary-title {
          font-size: var(--text-lg);
          font-weight: var(--weight-semibold);
          color: var(--color-text);
          margin-bottom: var(--space-4);
          padding-bottom: var(--space-3);
          border-bottom: 1px solid var(--color-border-light);
        }
        .summary-lines {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-bottom: var(--space-6);
        }
        .summary-line {
          display: flex;
          justify-content: space-between;
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
        }
        .free-badge {
          color: var(--color-success);
          font-weight: var(--weight-bold);
        }
        .discount-line {
          color: var(--color-success);
          font-weight: var(--weight-medium);
        }
        .summary-divider {
          height: 1px;
          background: var(--color-border);
          margin: var(--space-1) 0;
        }
        .total-line {
          font-size: var(--text-lg);
          font-weight: var(--weight-bold);
          color: var(--color-text);
        }
        .promo-form {
          margin-bottom: var(--space-6);
        }
        .promo-input-row {
          display: flex;
          gap: var(--space-2);
        }
        .promo-input {
          flex: 1;
          height: 38px;
          padding: 0 var(--space-3);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: var(--text-xs);
        }
        .promo-btn {
          height: 38px;
          padding: 0 var(--space-4);
          background: var(--color-bg-alt);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: var(--text-xs);
          font-weight: var(--weight-semibold);
          color: var(--color-text);
          cursor: pointer;
        }
        .promo-btn:hover {
          background: var(--color-border);
        }
        .promo-msg {
          font-size: var(--text-xs);
          margin-top: var(--space-1);
        }
        .promo-msg.error {
          color: var(--color-error);
        }
        .promo-msg.success {
          color: var(--color-success);
        }
        .checkout-assurances {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-top: var(--space-6);
          padding-top: var(--space-4);
          border-top: 1px solid var(--color-border-light);
        }
        .assurance-bullet {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-xs);
          color: var(--color-text-secondary);
        }
      `}</style>
    </div>
  );
}
