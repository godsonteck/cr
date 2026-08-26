'use client';

import React, { useState, useEffect } from 'react';
import { getAllOrders, markOrderPaymentPaid } from '@/services/orderEngine';
import { formatPrice } from '@/utils/formatPrice';

export default function SimpleAdminPaymentsPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'PAID'
  const [toastMsg, setToastMsg] = useState('');

  const loadData = () => setOrders(getAllOrders());

  useEffect(() => {
    loadData();
    window.addEventListener('cr-store-updated', loadData);
    return () => window.removeEventListener('cr-store-updated', loadData);
  }, []);

  const handleVerify = (orderId) => {
    try {
      markOrderPaymentPaid(orderId, `MOMO-${Date.now().toString().slice(-5)}`, 'Store Admin');
      setToastMsg(`Payment confirmed for order #${orderId}. Status updated automatically.`);
      loadData();
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = orders.filter((o) => {
    if (filter === 'PENDING') return o.paymentStatus === 'PENDING';
    if (filter === 'PAID') return o.paymentStatus === 'PAID';
    return true;
  });

  const totalCollected = orders.filter(o => o.paymentStatus === 'PAID').reduce((s, o) => s + (o.pricing?.total || 0), 0);
  const totalPending = orders.filter(o => o.paymentStatus === 'PENDING').reduce((s, o) => s + (o.pricing?.total || 0), 0);
  const pendingCount = orders.filter(o => o.paymentStatus === 'PENDING').length;

  return (
    <div className="pay-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-sub">Verify Mobile Money payments from customers and mark them as received.</p>
        </div>
      </div>

      {toastMsg && <div className="toast-msg">✓ {toastMsg}</div>}

      {/* Pending Payment Alert */}
      {pendingCount > 0 && (
        <div className="pending-alert">
          <span>💳</span>
          <div>
            <strong>{pendingCount} payment{pendingCount !== 1 ? 's' : ''} waiting to be verified</strong>
            <p>Customers have placed orders. Check your Mobile Money wallet and verify the payments below.</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="summary-row">
        <div className="sum-card green">
          <div className="sum-lbl">Total Money Received</div>
          <div className="sum-num">{formatPrice(totalCollected)}</div>
          <div className="sum-hint">{orders.filter(o => o.paymentStatus === 'PAID').length} payments confirmed</div>
        </div>

        <div className={`sum-card ${pendingCount > 0 ? 'yellow' : 'green'}`}>
          <div className="sum-lbl">Awaiting Verification</div>
          <div className="sum-num">{formatPrice(totalPending)}</div>
          <div className="sum-hint">{pendingCount} orders pending payment</div>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-tabs">
        <button className={`tab-btn ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>
          All Transactions ({orders.length})
        </button>
        <button className={`tab-btn ${filter === 'PENDING' ? 'active' : ''}`} onClick={() => setFilter('PENDING')}>
          ⏳ Pending Verification ({pendingCount})
        </button>
        <button className={`tab-btn ${filter === 'PAID' ? 'active' : ''}`} onClick={() => setFilter('PAID')}>
          ✓ Confirmed Paid ({orders.filter(o => o.paymentStatus === 'PAID').length})
        </button>
      </div>

      {/* Payments Table */}
      <div className="white-card">
        {filtered.length === 0 ? (
          <div className="empty-box">
            <span style={{ fontSize: '2rem', opacity: 0.5 }}>💳</span>
            <p>{orders.length === 0 ? 'No orders received yet. Payments will appear here when customers place orders.' : 'No payments matching this filter.'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Payment Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const isPaid = order.paymentStatus === 'PAID';
                  const details = order.paymentDetails || {};

                  return (
                    <tr key={order.orderId}>
                      <td><strong>#{order.orderId}</strong></td>
                      <td style={{ fontSize: '0.78rem', color: '#7A6E73' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td>
                        <strong>{order.customer.fullName}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#9C8E94' }}>{order.customer.phone}</div>
                      </td>
                      <td>
                        <span className="method-tag">{details.network || details.method || 'Mobile Money'}</span>
                        <div style={{ fontSize: '0.72rem', color: '#9C8E94' }}>{details.accountNumber || order.customer.phone}</div>
                      </td>
                      <td>
                        <strong style={{ fontSize: '1rem' }}>{formatPrice(order.pricing.total)}</strong>
                      </td>
                      <td>
                        <span className={`pill ${isPaid ? 'pill-paid' : 'pill-pending'}`}>
                          {isPaid ? '✓ PAID' : '⏳ PENDING'}
                        </span>
                      </td>
                      <td>
                        {!isPaid ? (
                          <button
                            className="btn-verify"
                            onClick={() => handleVerify(order.orderId)}
                          >
                            ✓ Mark as Paid
                          </button>
                        ) : (
                          <span style={{ color: '#2A7A4C', fontSize: '0.78rem', fontWeight: 600 }}>Payment Received</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .pay-page { display: flex; flex-direction: column; gap: 1.25rem; }
        .page-title { font-family: var(--font-display, serif); font-size: 1.6rem; font-weight: 700; color: #1A0D14; margin: 0; }
        .page-sub { font-size: 0.82rem; color: #7A6E73; margin-top: 0.2rem; }
        .toast-msg { background: #2A7A4C; color: #fff; padding: 0.6rem 1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; }

        .pending-alert {
          background: #FFF5E6;
          border: 1px solid #FBD38D;
          border-radius: 8px;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.85rem;
        }
        .pending-alert strong { color: #92400E; display: block; }
        .pending-alert p { color: #7A6E73; margin: 0.2rem 0 0 0; font-size: 0.78rem; }
        .pending-alert span:first-child { font-size: 1.4rem; }

        .summary-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
        .sum-card {
          background: #fff;
          border: 1px solid #EAE3E6;
          border-radius: 8px;
          padding: 1.25rem 1.5rem;
        }
        .sum-card.green { border-left: 4px solid #2A7A4C; }
        .sum-card.yellow { border-left: 4px solid #D97706; }

        .sum-lbl { font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: #7A6E73; letter-spacing: 0.5px; }
        .sum-num { font-size: 1.55rem; font-weight: 800; color: #1A0D14; font-family: var(--font-mono, monospace); margin: 0.25rem 0; }
        .sum-hint { font-size: 0.75rem; color: #9C8E94; }

        .filter-tabs { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .tab-btn {
          background: #fff;
          border: 1px solid #D8CAD0;
          padding: 0.45rem 0.85rem;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #55484E;
          cursor: pointer;
        }
        .tab-btn.active { background: #7B2347; border-color: #7B2347; color: #fff; }

        .white-card { background: #fff; border: 1px solid #EAE3E6; border-radius: 8px; padding: 1.25rem; }
        .empty-box { padding: 3rem; text-align: center; color: #7A6E73; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }

        .table-wrap { overflow-x: auto; }
        .clean-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
        .clean-table th { text-align: left; padding: 0.65rem 0.75rem; border-bottom: 2px solid #EAE3E6; color: #7A6E73; font-size: 0.72rem; text-transform: uppercase; }
        .clean-table td { padding: 0.75rem; border-bottom: 1px solid #F2ECF0; vertical-align: middle; }

        .method-tag { background: #FDF5F8; color: #7B2347; padding: 2px 6px; border-radius: 4px; font-size: 0.72rem; font-weight: 600; }

        .pill { display: inline-block; padding: 3px 8px; border-radius: 10px; font-size: 0.72rem; font-weight: 700; }
        .pill-paid { background: #E1F5E8; color: #2A7A4C; }
        .pill-pending { background: #FEF3D6; color: #B37D00; }

        .btn-verify {
          background: #2A7A4C;
          color: #fff;
          border: none;
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
