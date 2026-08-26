'use client';

import React from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getRecentOrders } from '@/services/orderService';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/utils/formatPrice';
import { BUSINESS } from '@/utils/constants';

export default function AccountDashboardPage() {
  const { customer, isAuthenticated, loading: authLoading, signOutCustomer } = useAuth();
  const recentOrders = getRecentOrders(5);
  const { count: wishlistCount } = useWishlist();

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return <Badge variant="success" size="sm">Delivered</Badge>;
      case 'dispatched':
      case 'ready':
        return <Badge variant="info" size="sm">Dispatched</Badge>;
      case 'processing':
        return <Badge variant="warning" size="sm">Processing</Badge>;
      case 'confirmed':
        return <Badge variant="info" size="sm">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="danger" size="sm">Cancelled</Badge>;
      default:
        return <Badge variant="default" size="sm">Placed</Badge>;
    }
  };

  // Guest State: Not signed in
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="account-guest-wrapper">
        <div className="container" style={{ maxWidth: '640px', paddingBlock: '3rem' }}>
          <Breadcrumb items={[{ label: 'My Account' }]} />

          <div className="guest-auth-card">
            <div className="guest-brand-badge">CR Customer Portal</div>
            <div className="guest-icon-crown">♛</div>
            <h1 className="guest-title">Sign in to your account</h1>
            <p className="guest-desc">
              Access your order history, manage saved wishlist items, and enjoy seamless one-click checkout across all your devices.
            </p>

            <div className="guest-btn-group">
              <Link href="/signin?redirect=/account" className="btn-guest-primary">
                Sign In to Account
              </Link>
              <Link href="/signup?redirect=/account" className="btn-guest-secondary">
                Create New Account
              </Link>
            </div>

            <div className="guest-features-row">
              <div className="gf-item">
                <span>📦</span>
                <div>
                  <strong>Track Orders</strong>
                  <p>Real-time updates from Botwe to your door</p>
                </div>
              </div>
              <div className="gf-item">
                <span>❤️</span>
                <div>
                  <strong>Saved Wishlist</strong>
                  <p>Keep track of your favorite skincare items</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .guest-auth-card {
            background: #fff;
            border: 1px solid #EBE4E8;
            border-radius: 12px;
            padding: 3rem 2rem;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            box-shadow: 0 4px 20px rgba(123, 35, 71, 0.05);
            margin-top: 1rem;
          }
          .guest-brand-badge {
            background: #FDF5F8;
            color: #7B2347;
            font-size: 0.72rem;
            font-weight: 700;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }
          .guest-icon-crown {
            font-size: 2.2rem;
            color: #C5A059;
          }
          .guest-title {
            font-family: var(--font-display, serif);
            font-size: 1.85rem;
            color: #1A0D14;
            margin: 0;
          }
          .guest-desc {
            font-size: 0.9rem;
            color: #7A6E73;
            line-height: 1.5;
            max-width: 44ch;
            margin: 0;
          }
          .guest-btn-group {
            display: flex;
            gap: 0.75rem;
            width: 100%;
            max-width: 360px;
            margin-top: 0.5rem;
          }
          .btn-guest-primary {
            flex: 1;
            padding: 0.8rem;
            background: #7B2347;
            color: #fff;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 600;
            text-decoration: none;
            transition: background 0.15s;
          }
          .btn-guest-primary:hover {
            background: #5E1734;
          }
          .btn-guest-secondary {
            flex: 1;
            padding: 0.8rem;
            background: #fff;
            color: #1A0D14;
            border: 1.5px solid #D8CAD0;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.15s;
          }
          .btn-guest-secondary:hover {
            border-color: #7B2347;
            background: #FAF8F9;
          }
          .guest-features-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid #F0EAEF;
            width: 100%;
            text-align: left;
          }
          .gf-item {
            display: flex;
            align-items: flex-start;
            gap: 0.65rem;
            font-size: 0.82rem;
          }
          .gf-item span {
            font-size: 1.25rem;
          }
          .gf-item strong {
            display: block;
            color: #1A0D14;
            font-size: 0.82rem;
          }
          .gf-item p {
            margin: 0.15rem 0 0 0;
            color: #7A6E73;
            font-size: 0.75rem;
          }
          @media (max-width: 540px) {
            .guest-btn-group {
              flex-direction: column;
            }
            .guest-features-row {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    );
  }

  const customerName = customer?.fullName || 'Customer';
  const customerEmail = customer?.email || '';
  const customerPhone = customer?.phone || '059 215 3306';
  const customerInitial = customerName.charAt(0).toUpperCase();

  return (
    <div className="account-page">
      <div className="container" style={{ paddingBlock: '2.5rem' }}>
        <Breadcrumb items={[{ label: 'My Account' }]} />

        {/* Welcome Header */}
        <div className="account-welcome-banner">
          <div className="welcome-avatar">{customerInitial}</div>
          <div className="welcome-info">
            <h1 className="heading-2 welcome-name">Welcome Back, {customerName}</h1>
            <p className="welcome-sub">
              {customerEmail ? `${customerEmail} • ` : ''}{customerPhone}
            </p>
          </div>
          <button
            type="button"
            className="btn-signout-customer"
            onClick={signOutCustomer}
            title="Sign out of your account"
          >
            Sign Out
          </button>
        </div>

        {/* Metrics Overview */}
        <div className="account-dashboard-grid">
          <div className="metric-card">
            <span className="metric-icon">📦</span>
            <div className="metric-val">{recentOrders.length}</div>
            <div className="metric-label">Total Orders</div>
            <Link href="/account/orders" className="metric-link">
              View History →
            </Link>
          </div>

          <div className="metric-card">
            <span className="metric-icon">❤️</span>
            <div className="metric-val">{wishlistCount}</div>
            <div className="metric-label">Saved in Wishlist</div>
            <Link href="/account/wishlist" className="metric-link">
              View Wishlist →
            </Link>
          </div>

          <div className="metric-card">
            <span className="metric-icon">📍</span>
            <div className="metric-val">Botwe</div>
            <div className="metric-label">Primary Store Location</div>
            <Link href="/contact" className="metric-link">
              Store Info →
            </Link>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="account-section">
          <div className="section-head-flex">
            <h2 className="heading-3">Recent Orders</h2>
            <Link href="/account/orders" className="view-all-link">
              All Orders ({recentOrders.length}) →
            </Link>
          </div>

          <div className="orders-cards-list">
            {recentOrders.length === 0 ? (
              <div className="empty-orders-box">
                <p>You have not placed any orders yet.</p>
                <Button href="/shop" variant="primary" size="sm">
                  Start Shopping
                </Button>
              </div>
            ) : (
              recentOrders.map((order) => {
                const idVal = order.orderId || order.id;
                const dateVal = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : (order.date || 'Recent');
                const totalVal = order.pricing?.total !== undefined ? order.pricing.total : (order.total || 0);
                const statusVal = order.orderStatus || order.status || 'PLACED';

                return (
                  <div key={idVal} className="order-summary-row">
                    <div className="order-row-head">
                      <div>
                        <span className="order-number">Order #{idVal}</span>
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
                      <Link href={`/account/orders/${idVal}`} className="view-order-link">
                        View Order Details →
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="account-section">
          <h2 className="heading-3" style={{ marginBottom: '1rem' }}>Quick Actions</h2>
          <div className="quick-links-grid">
            <Link href="/shop" className="quick-action-card">
              <span className="qa-icon">🧴</span>
              <div className="qa-title">Browse Skincare</div>
              <div className="qa-desc">Explore verified serums, cleansers, and toners.</div>
            </Link>

            <Link href="/shop?category=groceries" className="quick-action-card">
              <span className="qa-icon">🛒</span>
              <div className="qa-title">Shop Groceries</div>
              <div className="qa-desc">Quality daily essentials and pantry staples.</div>
            </Link>

            <Link href="/contact" className="quick-action-card">
              <span className="qa-icon">💬</span>
              <div className="qa-title">Customer Care</div>
              <div className="qa-desc">Need assistance with an order? Contact our Botwe team.</div>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .account-page {
          padding-bottom: var(--space-20);
        }
        .account-welcome-banner {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          background: #fff;
          border: 1px solid #EBE4E8;
          border-radius: var(--radius-xl);
          padding: var(--space-6) var(--space-8);
          margin-bottom: var(--space-8);
        }
        .welcome-avatar {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background-color: #7B2347;
          color: #ffffff;
          font-weight: 700;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .welcome-info {
          flex: 1;
        }
        .welcome-name {
          font-size: var(--text-2xl);
          margin-bottom: 2px;
          color: #1A0D14;
        }
        .welcome-sub {
          font-size: var(--text-sm);
          color: #7A6E73;
        }
        .btn-signout-customer {
          background: none;
          border: 1.5px solid #D8CAD0;
          padding: 0.45rem 0.95rem;
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #7A6E73;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-signout-customer:hover {
          background: #FEE2E2;
          border-color: #FCA5A5;
          color: #DC2626;
        }
        .account-dashboard-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-4);
          margin-bottom: var(--space-12);
        }
        @media (min-width: 640px) {
          .account-dashboard-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .metric-card {
          background: #fff;
          border: 1px solid #EBE4E8;
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          display: flex;
          flex-direction: column;
        }
        .metric-icon {
          font-size: 24px;
          margin-bottom: var(--space-2);
        }
        .metric-val {
          font-size: var(--text-3xl);
          font-weight: var(--weight-bold);
          color: #1A0D14;
          line-height: 1;
          margin-bottom: var(--space-1);
        }
        .metric-label {
          font-size: var(--text-xs);
          color: #7A6E73;
          margin-bottom: var(--space-4);
        }
        .metric-link {
          font-size: var(--text-xs);
          font-weight: var(--weight-semibold);
          color: #7B2347;
          margin-top: auto;
          text-decoration: none;
        }
        .account-section {
          margin-bottom: var(--space-12);
        }
        .section-head-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-4);
        }
        .view-all-link {
          font-size: var(--text-xs);
          font-weight: var(--weight-semibold);
          color: #7B2347;
          text-decoration: none;
        }
        .orders-cards-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .empty-orders-box {
          padding: 2.5rem;
          text-align: center;
          background: #fff;
          border-radius: var(--radius-lg);
          border: 1px solid #EBE4E8;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .empty-orders-box p {
          color: #7A6E73;
          font-size: var(--text-sm);
          margin: 0;
        }
        .order-summary-row {
          background: #fff;
          border: 1px solid #EBE4E8;
          border-radius: var(--radius-lg);
          padding: var(--space-4) var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .order-row-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .order-number {
          font-weight: 700;
          font-size: var(--text-sm);
          color: #1A0D14;
        }
        .order-date {
          font-size: var(--text-xs);
          color: #7A6E73;
          margin-left: var(--space-2);
        }
        .order-row-items {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }
        .item-tag {
          font-size: var(--text-xs);
          background: #FAF8F9;
          border: 1px solid #EBE4E8;
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          color: #55484E;
        }
        .order-row-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--space-3);
          border-top: 1px solid #F0EAEF;
        }
        .order-total-price {
          font-weight: 700;
          font-size: var(--text-base);
          color: #1A0D14;
        }
        .view-order-link {
          font-size: var(--text-xs);
          color: #7B2347;
          font-weight: 600;
          text-decoration: none;
        }
        .quick-links-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-4);
        }
        @media (min-width: 640px) {
          .quick-links-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .quick-action-card {
          background: #fff;
          border: 1px solid #EBE4E8;
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          display: flex;
          flex-direction: column;
          text-decoration: none;
          transition: transform 0.15s, border-color 0.15s;
        }
        .quick-action-card:hover {
          transform: translateY(-2px);
          border-color: #7B2347;
        }
        .qa-icon {
          font-size: 24px;
          margin-bottom: var(--space-2);
        }
        .qa-title {
          font-size: var(--text-sm);
          font-weight: 600;
          color: #1A0D14;
          margin-bottom: var(--space-1);
        }
        .qa-desc {
          font-size: var(--text-xs);
          color: #7A6E73;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
