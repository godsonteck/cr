'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice } from '@/utils/formatPrice';

export default function AccountClient({
  customer,
  isAuthenticated,
  recentOrders,
  wishlistCount,
  getStatusBadge,
  signOutCustomer,
}) {
  const { items: wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();

  const orderStatusLabels = {
    placed: 'PLACED',
    confirmed: 'CONFIRMED',
    processing: 'PROCESSING',
    dispatched: 'DISPATCHED',
    ready: 'READY',
    delivered: 'DELIVERED',
    cancelled: 'CANCELLED',
  };

  return (
    <div className="account-container">
      {/* Header with user info and sign out */}
      <div className="account-header">
        {isAuthenticated && customer ? (
          <div className="account-user-info">
            <span className="user-greeting">
              Welcome back, {customer.full_name.split(' ')[0]}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={signOutCustomer}
              style={{ marginLeft: '1rem' }}
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <Link href="/signin" className="account-user-info">
            Sign In
          </Link>
        )}
      </div>

      {/* Order History Section */}
      <section className="account-section">
        <div className="account-section-header">
          <h2>Order History</h2>
          <span className="order-count">
            {recentOrders.length} order{s
              .reverse()
              .slice(0, 3)
              .length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="orders-list">
          {recentOrders.map((order) => {
            const orderId = order.orderId || order.id;
            const dateVal =
              order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : 'Recent';
            const totalVal =
              order.pricing?.total !== undefined
                ? order.pricing.total
                : order.total || 0;
            const statusVal = order.orderStatus || order.status || 'PLACED';

            return (
              <div key={orderId} className="order-summary-row">
                <div className="order-row-head">
                  <div>
                    <span className="order-number">Order #{orderId}</span>
                    <span className="order-date">• {dateVal}</span>
                  </div>
                  {getStatusBadge(statusVal)}
                </div>

                <div className="order-row-items">
                  {order.items?.map((item, idx) => (
                    <span key={idx} className="item-tag">
                      {item.quantity}x {item.productName || item.name}
                    </span>
                  ))}
                </div>

                <div className="order-row-footer">
                  <span className="order-total-price">
                    Total: {formatPrice(totalVal)}
                  </span>
                  <Link
                    href={`/account/orders/${orderId}`}
                    className="view-order-link"
                  >
                    View Order Details →
                  </Link>
                </div>
              </div>
            );
          })}

          {recentOrders.length === 0 ? (
            <div className="empty-orders-box">
              <p>You have not placed any orders yet.</p>
              <Link href="/shop" className="btn-link">
                Start Shopping
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      {/* Wishlist Section */}
      <section className="account-section">
        <div className="account-section-header">
          <h2>Wishlist</h2>
          <span className="wishlist-count">
            {wishlistCount} item{s
              .reverse()
              .length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="wishlist-list">
          {wishlistItems.length === 0 ? (
            <p className="empty-wishlist">
              Your wishlist is empty. <Link href="/shop">Start adding items</Link>.
            </p>
          ) : (
            <div className="wishlist-items">
              {wishlistItems.map((item) => (
                <div key={item.id} className="wishlist-item">
                  <span className="wishlist-item-name">
                    {item.name || item.productName}
                  </span>
                  <span className="wishlist-item-price">
                    {formatPrice(item.price || 0)}
                  </span>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="wishlist-remove-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Addresses Section */}
      <section className="account-section">
        <div className="account-section-header">
          <h2>Saved Addresses</h2>
        </div>

        <div className="addresses-list">
          {customer?.addresses?.length
            ? customer.addresses.map((addr, idx) => (
                <div key={idx} className="address-item">
                  <strong>{addr.name || 'Saved Address'}</strong>
                  <p>
                    {addr.street || ''} {addr.city || ''}, {addr.region || ''} {addr.postalCode || ''}
                    {addr.country || ''}
                    .replace(/,\s*$/, '')
                  </p>
                </div>
              ))
            : (
              <p className="empty-addresses">
                No saved addresses. <Link href="/shop">Add a new address</Link>.
              </p>
            )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="account-section">
        <div className="account-section-header">
          <h2>Quick Actions</h2>
        </div>

        <div className="quick-actions-grid">
          <Link href="/shop" className="quick-action-card">
            <span className="qa-icon">🧴</span>
            <div className="qa-title">Browse Skincare</div>
            <div className="qa-desc">
              Explore verified serums, cleansers, and toners.
            </div>
          </Link>

          <Link href="/shop?category=groceries" className="quick-action-card">
            <span className="qa-icon">🛒</span>
            <div className="qa-title">Shop Groceries</div>
            <div className="qa-desc">
              Fresh produce and household essentials.
            </div>
          </Link>

          <Link href="/cart" className="quick-action-card">
            <span className="qa-icon">🛍️</span>
            <div className="qa-title">View Cart</div>
            <div className="qa-desc">
              Review and modify your selected items.
            </div>
          </Link>

          <Link href="/account/orders/new" className="quick-action-card">
            <span className="qa-icon">📦</span>
            <div className="qa-title">Place New Order</div>
            <div className="qa-desc">
              Start a new order for delivery or pickup.
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}