'use client';

import React from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { getAllOrders } from '@/services/orderService';
import { formatPrice } from '@/utils/formatPrice';

export default function OrdersListPage() {
  const orders = getAllOrders();

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'delivered':
      case 'completed':
        return <Badge variant="success" size="md">Delivered</Badge>;
      case 'dispatched':
        return <Badge variant="info" size="md">Dispatched</Badge>;
      case 'processing':
      case 'ready':
        return <Badge variant="warning" size="md">Processing</Badge>;
      case 'confirmed':
        return <Badge variant="info" size="md">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="error" size="md">Cancelled</Badge>;
      default:
        return <Badge variant="default" size="md">Placed</Badge>;
    }
  };

  return (
    <div className="orders-page">
      <div className="container">
        <Breadcrumb items={[{ label: 'My Account', href: '/account' }, { label: 'My Orders' }]} />

        <div className="orders-header">
          <h1 className="heading-2">Order History & Tracking</h1>
          <p className="orders-sub">
            Track fulfillment status, view order receipts, and re-order previous essentials.
          </p>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            icon={
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            }
            title="No Orders Placed Yet"
            description="You have not placed any orders with CR Cosmetics & Essentials yet. Explore our genuine skincare and groceries."
            actionLabel="Start Shopping"
            actionHref="/shop"
          />
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
            const orderId = order.orderId || order.id;
            const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : order.date;
            const totalVal = order.pricing?.total !== undefined ? order.pricing.total : order.total;
            const addressVal = order.customer?.address || order.address || 'Botwe, Accra';

            return (
              <div key={orderId} className="order-card">
                <div className="order-card-header">
                  <div className="order-meta-col">
                    <span className="order-id">Order #{orderId}</span>
                    <span className="order-placed-date">Placed on {dateStr}</span>
                  </div>
                  <div className="order-status-badge">
                    {getStatusBadge(order.orderStatus || order.status)}
                  </div>
                </div>

                <div className="order-card-items">
                  {order.items.map((item, idx) => {
                    const itemName = item.productName || item.name;
                    const itemPrice = item.unitPrice !== undefined ? item.unitPrice : item.price;
                    const itemImg = item.image;

                    return (
                      <div key={idx} className="order-item-mini">
                        <div className="item-mini-img">
                          {itemImg ? (
                            <img src={itemImg} alt={itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span>📦</span>
                          )}
                        </div>
                        <div className="item-mini-details">
                          <div className="item-mini-name">{itemName}</div>
                          <div className="item-mini-qty">
                            Qty: {item.quantity} • {formatPrice(itemPrice)} each
                          </div>
                        </div>
                        <div className="item-mini-total">
                          {formatPrice(itemPrice * item.quantity)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="order-card-footer">
                  <div className="footer-left">
                    <span className="del-addr-label">Delivering to:</span>
                    <span className="del-addr-text">{addressVal}</span>
                  </div>
                  <div className="footer-right">
                    <div className="order-total-block">
                      <span className="total-label">Total:</span>
                      <span className="total-amount">{formatPrice(totalVal)}</span>
                    </div>
                    <Button href={`/account/orders/${orderId}`} variant="primary" size="sm">
                      View Live Tracker →
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      <style jsx>{`
        .orders-page {
          padding-bottom: var(--space-20);
        }
        .orders-header {
          margin-bottom: var(--space-8);
        }
        .orders-sub {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
          margin-top: var(--space-1);
        }
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }
        .order-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border-light);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          box-shadow: var(--shadow-sm);
        }
        .order-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: var(--space-4);
          border-bottom: 1px solid var(--color-border-light);
        }
        .order-meta-col {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .order-id {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--color-primary);
        }
        .order-placed-date {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
        }
        .order-card-items {
          padding: var(--space-4) 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .order-item-mini {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }
        .item-mini-img {
          width: 44px;
          height: 44px;
          background: var(--color-bg-alt);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          flex-shrink: 0;
          overflow: hidden;
        }
        .item-mini-details {
          flex: 1;
        }
        .item-mini-name {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-text);
        }
        .item-mini-qty {
          font-size: var(--text-xs);
          color: var(--color-text-secondary);
        }
        .item-mini-total {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-text);
        }
        .order-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--space-4);
          border-top: 1px solid var(--color-border-light);
          flex-wrap: wrap;
          gap: var(--space-4);
        }
        .footer-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .del-addr-label {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .del-addr-text {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
        }
        .footer-right {
          display: flex;
          align-items: center;
          gap: var(--space-6);
        }
        .order-total-block {
          display: flex;
          align-items: baseline;
          gap: var(--space-2);
        }
        .total-label {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
        }
        .total-amount {
          font-family: var(--font-mono);
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--color-text);
        }
      `}</style>
    </div>
  );
}
