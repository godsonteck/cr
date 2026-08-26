'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getOrderById } from '@/services/orderService';
import { formatPrice } from '@/utils/formatPrice';
import { BUSINESS } from '@/utils/constants';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id;
  const order = getOrderById(orderId);

  if (!order) {
    return (
      <div className="container not-found-box">
        <h2>Order Not Found</h2>
        <p>Could not locate details for order reference "{orderId}".</p>
        <Button href="/account/orders" variant="primary">
          Back to Orders
        </Button>
        <style jsx>{`
          .not-found-box {
            padding: var(--space-20) var(--space-4);
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--space-4);
          }
        `}</style>
      </div>
    );
  }

  const idVal = order.orderId || order.id;
  const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : order.date;
  const subtotalVal = order.pricing?.subtotal !== undefined ? order.pricing.subtotal : order.subtotal;
  const deliveryVal = order.pricing?.deliveryFee !== undefined ? order.pricing.deliveryFee : order.delivery;
  const discountVal = order.pricing?.discount !== undefined ? order.pricing.discount : 0;
  const totalVal = order.pricing?.total !== undefined ? order.pricing.total : order.total;
  const addressVal = order.customer?.address || order.address || 'Botwe, Accra';
  const customerName = order.customer?.fullName || 'Customer';
  const customerPhone = order.customer?.phone || '';
  const paymentMethod = order.paymentDetails?.method || 'Mobile Money';
  const paymentStatus = order.paymentStatus || 'PAID';
  const orderStatus = order.orderStatus || order.status || 'CONFIRMED';

  const breadcrumbs = [
    { label: 'My Account', href: '/account' },
    { label: 'My Orders', href: '/account/orders' },
    { label: `Order #${idVal}` },
  ];

  return (
    <div className="order-detail-page">
      <div className="container">
        <Breadcrumb items={breadcrumbs} />

        <div className="order-head-bar">
          <div>
            <span className="order-ref-label">Order Reference</span>
            <h1 className="heading-2">#{idVal}</h1>
            <p className="order-placed-note">Placed on {dateStr} • Botwe Store & Fulfillment Center</p>
          </div>
          <div className="head-right-actions">
            <Button href="https://wa.me/233592153306" variant="outline" size="sm">
              💬 WhatsApp Support (059 215 3306)
            </Button>
          </div>
        </div>

        {/* Multi-step Visual Tracking Timeline */}
        <div className="tracking-timeline-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h3 className="card-section-title">Order Status: <span style={{ color: 'var(--color-primary)' }}>{orderStatus}</span></h3>
            <Badge variant={paymentStatus === 'PAID' ? 'success' : 'warning'}>Payment: {paymentStatus}</Badge>
          </div>

          <div className="timeline-steps-track">
            {order.timeline && order.timeline.length > 0 ? (
              order.timeline.map((step, idx) => (
                <div key={idx} className="timeline-step-node is-completed">
                  <div className="node-marker">
                    <span>✓</span>
                  </div>
                  <div className="node-info">
                    <div className="node-label">{step.status || step.label}</div>
                    <div className="node-timestamp">
                      {step.timestamp ? new Date(step.timestamp).toLocaleString('en-GB') : `${step.date || ''} ${step.time || ''}`}
                      {step.note && <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{step.note}</div>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="timeline-step-node is-completed">
                <div className="node-marker"><span>✓</span></div>
                <div className="node-info">
                  <div className="node-label">Order Confirmed</div>
                  <div className="node-timestamp">{dateStr}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="order-info-grid">
          {/* Items Breakdown */}
          <div className="order-items-pane">
            <h3 className="card-section-title">Items Ordered ({order.items.length})</h3>
            <div className="items-receipt-list">
              {order.items.map((item, idx) => {
                const itemName = item.productName || item.name;
                const itemPrice = item.unitPrice !== undefined ? item.unitPrice : item.price;
                const itemImg = item.image;

                return (
                  <div key={idx} className="receipt-item-row">
                    <div className="receipt-img">
                      {itemImg ? (
                        <img src={itemImg} alt={itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span>📦</span>
                      )}
                    </div>
                    <div className="receipt-details">
                      <div className="receipt-name">{itemName}</div>
                      <div className="receipt-sub">
                        {item.brand && `${item.brand} • `}Qty: {item.quantity} × {formatPrice(itemPrice)}
                      </div>
                    </div>
                    <div className="receipt-price">
                      {formatPrice(itemPrice * item.quantity)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Totals */}
            <div className="receipt-totals-box">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotalVal)}</span>
              </div>
              {discountVal > 0 && (
                <div className="total-row discount">
                  <span>Discount:</span>
                  <span>−{formatPrice(discountVal)}</span>
                </div>
              )}
              <div className="total-row">
                <span>Delivery:</span>
                <span>{deliveryVal === 0 ? 'FREE' : formatPrice(deliveryVal)}</span>
              </div>
              <div className="total-row grand-total">
                <span>Total Amount:</span>
                <span>{formatPrice(totalVal)}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className="order-sidebar-pane">
            <div className="sidebar-card">
              <h4 className="sidebar-title">Delivery & Customer</h4>
              <div className="sidebar-field">
                <span className="field-label">Recipient:</span>
                <span className="field-val">{customerName}</span>
              </div>
              {customerPhone && (
                <div className="sidebar-field">
                  <span className="field-label">Contact Phone:</span>
                  <span className="field-val">{customerPhone}</span>
                </div>
              )}
              <div className="sidebar-field">
                <span className="field-label">Delivery Address:</span>
                <span className="field-val">{addressVal}</span>
              </div>
              {order.customer?.deliveryNotes && (
                <div className="sidebar-field">
                  <span className="field-label">Special Notes:</span>
                  <span className="field-val">{order.customer.deliveryNotes}</span>
                </div>
              )}
            </div>

            <div className="sidebar-card">
              <h4 className="sidebar-title">Payment Information</h4>
              <div className="sidebar-field">
                <span className="field-label">Method:</span>
                <span className="field-val" style={{ textTransform: 'capitalize' }}>{paymentMethod}</span>
              </div>
              <div className="sidebar-field">
                <span className="field-label">Status:</span>
                <span className="field-val">{paymentStatus}</span>
              </div>
              {order.paymentDetails?.transactionRef && (
                <div className="sidebar-field">
                  <span className="field-label">Reference:</span>
                  <span className="field-val" style={{ fontFamily: 'var(--font-mono)' }}>{order.paymentDetails.transactionRef}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .order-detail-page {
          padding-bottom: var(--space-20);
        }
        .order-head-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-8);
          flex-wrap: wrap;
          gap: var(--space-4);
        }
        .order-ref-label {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .order-placed-note {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
          margin-top: var(--space-1);
        }
        .tracking-timeline-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border-light);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          margin-bottom: var(--space-8);
          box-shadow: var(--shadow-sm);
        }
        .card-section-title {
          font-size: var(--text-base);
          font-weight: 700;
          margin-bottom: var(--space-4);
        }
        .timeline-steps-track {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .timeline-step-node {
          display: flex;
          align-items: flex-start;
          gap: var(--space-4);
        }
        .node-marker {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-full);
          background: var(--color-primary);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        .node-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .node-label {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-text);
        }
        .node-timestamp {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
        }
        .order-info-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: var(--space-8);
        }
        .order-items-pane {
          background: var(--color-surface);
          border: 1px solid var(--color-border-light);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          box-shadow: var(--shadow-sm);
        }
        .items-receipt-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          padding-bottom: var(--space-6);
          border-bottom: 1px solid var(--color-border-light);
        }
        .receipt-item-row {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }
        .receipt-img {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-sm);
          background: var(--color-bg-alt);
          overflow: hidden;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .receipt-details {
          flex: 1;
        }
        .receipt-name {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-text);
        }
        .receipt-sub {
          font-size: var(--text-xs);
          color: var(--color-text-secondary);
          margin-top: 2px;
        }
        .receipt-price {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-text);
        }
        .receipt-totals-box {
          padding-top: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
        }
        .total-row.discount {
          color: var(--color-success);
        }
        .total-row.grand-total {
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--color-text);
          border-top: 1px solid var(--color-border-light);
          padding-top: var(--space-3);
          margin-top: var(--space-2);
        }
        .order-sidebar-pane {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }
        .sidebar-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border-light);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .sidebar-title {
          font-size: var(--text-sm);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-primary);
          margin-bottom: var(--space-2);
        }
        .sidebar-field {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .field-label {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
        }
        .field-val {
          font-size: var(--text-sm);
          color: var(--color-text);
          font-weight: 500;
        }
        @media (max-width: 900px) {
          .order-info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
