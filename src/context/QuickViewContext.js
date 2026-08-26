'use client';

import React, { createContext, useContext, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import QuantitySelector from '@/components/ui/QuantitySelector';
import Badge from '@/components/ui/Badge';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { formatPrice, getDiscountPercent } from '@/utils/formatPrice';
import Link from 'next/link';

const QuickViewContext = createContext(null);

export function QuickViewProvider({ children }) {
  const [activeProduct, setActiveProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  const openQuickView = (product) => {
    setActiveProduct(product);
    setQuantity(1);
  };

  const closeQuickView = () => {
    setActiveProduct(null);
  };

  const handleAddToCart = () => {
    if (!activeProduct || !activeProduct.inStock) return;
    addItem(activeProduct, quantity, true);
    addToast({
      title: 'Added to Cart',
      message: `${quantity} × ${activeProduct.name} added to your cart.`,
      type: 'success',
    });
    closeQuickView();
  };

  const isSkincare = activeProduct?.category === 'skincare';
  const inWishlist = activeProduct ? isInWishlist(activeProduct.id) : false;
  const discount = activeProduct ? getDiscountPercent(activeProduct.originalPrice, activeProduct.price) : 0;

  return (
    <QuickViewContext.Provider value={{ openQuickView, closeQuickView }}>
      {children}

      <Modal
        isOpen={!!activeProduct}
        onClose={closeQuickView}
        title="Quick Product Preview"
        maxWidth="720px"
      >
        {activeProduct && (
          <div className="quickview-body-grid">
            {/* Image Col */}
            <div className="quickview-img-col">
              <div className="quickview-img-wrap">
                <img
                  src={activeProduct.image}
                  alt={activeProduct.name}
                  className="quickview-img"
                />
                {discount > 0 && (
                  <span className="qv-badge">
                    <Badge variant="sale" size="sm">-{discount}% OFF</Badge>
                  </span>
                )}
              </div>
            </div>

            {/* Info Col */}
            <div className="quickview-info-col">
              <span className="qv-brand">{activeProduct.brand}</span>
              <h3 className="qv-title">{activeProduct.name}</h3>

              <div className="qv-price-row">
                <span className="qv-price">{formatPrice(activeProduct.price)}</span>
                {activeProduct.originalPrice && (
                  <span className="qv-old-price">{formatPrice(activeProduct.originalPrice)}</span>
                )}
                <span className="qv-stock-tag">
                  {activeProduct.inStock ? '✓ In Stock' : 'Out of Stock'}
                </span>
              </div>

              <p className="qv-desc">{activeProduct.description}</p>

              <div className="qv-specs">
                {activeProduct.details?.size && (
                  <span className="spec-tag">🧴 {activeProduct.details.size}</span>
                )}
                {activeProduct.details?.weight && (
                  <span className="spec-tag">⚖️ {activeProduct.details.weight}</span>
                )}
                {activeProduct.details?.skinType && (
                  <span className="spec-tag">✨ {activeProduct.details.skinType}</span>
                )}
              </div>

              <div className="qv-actions">
                <div className="qv-qty-row">
                  <span className="qty-label">Qty:</span>
                  <QuantitySelector
                    value={quantity}
                    onChange={setQuantity}
                    max={activeProduct.stockCount || 10}
                    disabled={!activeProduct.inStock}
                    size="sm"
                  />
                </div>

                <div className="qv-btns-row">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!activeProduct.inStock}
                    variant="primary"
                    size="md"
                    fullWidth
                  >
                    {activeProduct.inStock ? `Add to Cart • ${formatPrice(activeProduct.price * quantity)}` : 'Out of Stock'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      toggleWishlist(activeProduct);
                      addToast({
                        title: inWishlist ? 'Removed from Wishlist' : 'Saved to Wishlist',
                        message: activeProduct.name,
                        type: 'info',
                      });
                    }}
                    className={`qv-heart-btn ${inWishlist ? 'active' : ''}`}
                    aria-label="Wishlist"
                  >
                    ♥
                  </button>
                </div>

                <Link
                  href={`/shop/${activeProduct.slug}`}
                  onClick={closeQuickView}
                  className="view-full-details-link"
                >
                  View Full Product Details →
                </Link>
              </div>
            </div>

            <style jsx>{`
              .quickview-body-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: var(--space-6);
              }
              @media (min-width: 640px) {
                .quickview-body-grid {
                  grid-template-columns: 1fr 1.2fr;
                  gap: var(--space-8);
                }
              }
              .quickview-img-wrap {
                position: relative;
                width: 100%;
                padding-top: 100%;
                border-radius: var(--radius-lg);
                overflow: hidden;
                background-color: var(--color-bg-alt);
              }
              .quickview-img {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
              .qv-badge {
                position: absolute;
                top: var(--space-3);
                left: var(--space-3);
              }
              .quickview-info-col {
                display: flex;
                flex-direction: column;
              }
              .qv-brand {
                font-size: var(--text-xs);
                font-weight: var(--weight-bold);
                text-transform: uppercase;
                letter-spacing: var(--tracking-wider);
                color: #8D4B5D;
                margin-bottom: var(--space-1);
              }
              .qv-title {
                font-size: var(--text-lg);
                font-weight: var(--weight-semibold);
                color: var(--color-text);
                margin-bottom: var(--space-2);
              }
              .qv-price-row {
                display: flex;
                align-items: baseline;
                gap: var(--space-3);
                margin-bottom: var(--space-3);
              }
              .qv-price {
                font-size: var(--text-xl);
                font-weight: var(--weight-bold);
                color: var(--color-text);
              }
              .qv-old-price {
                font-size: var(--text-sm);
                text-decoration: line-through;
                color: var(--color-text-tertiary);
              }
              .qv-stock-tag {
                font-size: var(--text-xs);
                font-weight: var(--weight-semibold);
                color: #4CAF7D;
                margin-left: auto;
              }
              .qv-desc {
                font-size: var(--text-xs);
                color: var(--color-text-secondary);
                line-height: var(--leading-relaxed);
                margin-bottom: var(--space-4);
              }
              .qv-specs {
                display: flex;
                flex-wrap: wrap;
                gap: var(--space-2);
                margin-bottom: var(--space-4);
              }
              .spec-tag {
                font-size: 11px;
                padding: 3px 8px;
                background-color: #FAF1F3;
                border-radius: var(--radius-sm);
                color: #8D4B5D;
                font-weight: 500;
              }
              .qv-actions {
                display: flex;
                flex-direction: column;
                gap: var(--space-3);
                margin-top: auto;
              }
              .qv-qty-row {
                display: flex;
                align-items: center;
                gap: var(--space-3);
              }
              .qty-label {
                font-size: var(--text-xs);
                font-weight: var(--weight-medium);
              }
              .qv-btns-row {
                display: flex;
                gap: var(--space-2);
              }
              .qv-heart-btn {
                width: 42px;
                height: 42px;
                border-radius: var(--radius-md);
                border: 1px solid var(--color-border);
                background: var(--color-surface);
                color: var(--color-text-secondary);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                cursor: pointer;
                flex-shrink: 0;
              }
              .qv-heart-btn.active {
                color: #8D4B5D;
                border-color: #8D4B5D;
              }
              .view-full-details-link {
                text-align: center;
                font-size: var(--text-xs);
                color: #8D4B5D;
                font-weight: var(--weight-semibold);
                margin-top: var(--space-1);
              }
              .view-full-details-link:hover {
                text-decoration: underline;
              }
            `}</style>
          </div>
        )}
      </Modal>
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const context = useContext(QuickViewContext);
  if (!context) {
    throw new Error('useQuickView must be used within QuickViewProvider');
  }
  return context;
}
