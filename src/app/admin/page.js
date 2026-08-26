'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOperationalDashboardSummary } from '@/services/reportingService';
import { getAllOrders, transitionOrderStatus, markOrderPaymentPaid } from '@/services/orderEngine';
import { formatPrice } from '@/utils/formatPrice';

export default function SimpleAdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [toastMsg, setToastMsg] = useState('');

  const loadData = () => {
    setSummary(getOperationalDashboardSummary());
    setOrders(getAllOrders());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('cr-store-updated', loadData);
    return () => window.removeEventListener('cr-store-updated', loadData);
  }, []);

  const handleQuickAdvance = (orderId, nextStatus) => {
    try {
      transitionOrderStatus(orderId, nextStatus, 'Store Admin', `Advanced from Dashboard to ${nextStatus}`);
      setToastMsg(`Order #${orderId} moved to ${nextStatus}`);
      loadData();
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleVerifyPayment = (orderId) => {
    try {
      markOrderPaymentPaid(orderId, `MOMO-${Date.now().toString().slice(-4)}`, 'Store Admin');
      setToastMsg(`Payment verified for order #${orderId}`);
      loadData();
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  if (!summary) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#7A6E73' }}>Loading Dashboard...</div>;
  }

  const { metrics, pipeline, lowStockAlerts } = summary;
  const pendingOrders = orders.filter(
    (o) => o.orderStatus === 'PENDING' || o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PROCESSING'
  );

  return (
    <div className="simple-dash">
      {/* ── Top Header ── */}
      <div className="dash-head">
        <div>
          <h1 className="dash-title">Store Overview</h1>
          <p className="dash-sub">Here is what is happening in your store right now.</p>
        </div>

        <div className="dash-actions">
          <Link href="/admin/products" className="btn-solid">
            + Add Product
          </Link>
          <Link href="/admin/inventory" className="btn-hollow">
            📦 Update Stock
          </Link>
        </div>
      </div>

      {toastMsg && <div className="dash-toast">✓ {toastMsg}</div>}

      {/* ── 4 Simple Big Stat Cards ── */}
      <div className="stat-cards-grid">
        <div className="clean-card">
          <div className="card-top">
            <span className="card-lbl">Total Sales</span>
            <span className="card-ico">💰</span>
          </div>
          <div className="card-num">{formatPrice(metrics.totalGrossRevenue)}</div>
          <div className="card-hint">{metrics.totalOrdersCount} orders placed</div>
        </div>

        <div className="clean-card">
          <div className="card-top">
            <span className="card-lbl">Orders to Fulfill</span>
            <span className="card-ico">🛍️</span>
          </div>
          <div className="card-num" style={{ color: pendingOrders.length > 0 ? '#BE4D6E' : '#2A7A4C' }}>
            {pendingOrders.length}
          </div>
          <div className="card-hint">
            {pendingOrders.length > 0 ? (
              <Link href="/admin/orders" style={{ color: '#BE4D6E', fontWeight: 600 }}>Fulfill orders →</Link>
            ) : 'All orders fulfilled'}
          </div>
        </div>

        <div className="clean-card">
          <div className="card-top">
            <span className="card-lbl">Products in Catalog</span>
            <span className="card-ico">🧴</span>
          </div>
          <div className="card-num">{metrics.totalCatalogProducts}</div>
          <div className="card-hint">
            <Link href="/admin/products" style={{ color: '#7B2347' }}>Manage catalog →</Link>
          </div>
        </div>

        <div className="clean-card">
          <div className="card-top">
            <span className="card-lbl">Low Stock Items</span>
            <span className="card-ico">⚠️</span>
          </div>
          <div className="card-num" style={{ color: lowStockAlerts.length > 0 ? '#D97706' : '#2A7A4C' }}>
            {lowStockAlerts.length}
          </div>
          <div className="card-hint">
            {lowStockAlerts.length > 0 ? (
              <Link href="/admin/inventory" style={{ color: '#D97706', fontWeight: 600 }}>Restock items →</Link>
            ) : 'Stock is healthy'}
          </div>
        </div>
      </div>

      {/* ── Action Needed Alert (if any) ── */}
      {pendingOrders.length > 0 && (
        <div className="action-box">
          <div className="action-box-left">
            <span className="action-box-icon">🚨</span>
            <div>
              <strong>You have {pendingOrders.length} order{pendingOrders.length !== 1 ? 's' : ''} waiting to be processed</strong>
              <p>Customers are waiting for their items to be packed and dispatched.</p>
            </div>
          </div>
          <Link href="/admin/orders" className="btn-action-box">
            Open Orders ({pendingOrders.length}) →
          </Link>
        </div>
      )}

      {/* ── Recent Orders Section ── */}
      <div className="white-panel">
        <div className="panel-title-bar">
          <h2 className="panel-heading">Recent Customer Orders</h2>
          <Link href="/admin/orders" className="panel-more-link">View All Orders →</Link>
        </div>

        {orders.length === 0 ? (
          <div className="empty-box">
            <span style={{ fontSize: '2.5rem', opacity: 0.5 }}>🛍️</span>
            <h3>No Orders Received Yet</h3>
            <p>When customers purchase items from your website, their orders will appear here automatically.</p>
            <Link href="/" target="_blank" className="btn-solid" style={{ marginTop: '0.75rem' }}>
              Visit Live Website
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items Ordered</th>
                  <th>Total Price</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 6).map((order) => {
                  const isPaid = order.paymentStatus === 'PAID';
                  const status = order.orderStatus;

                  return (
                    <tr key={order.orderId}>
                      <td>
                        <strong>#{order.orderId}</strong>
                        <div className="cell-sub">{new Date(order.createdAt).toLocaleDateString('en-GB')}</div>
                      </td>
                      <td>
                        <strong>{order.customer.fullName}</strong>
                        <div className="cell-sub">{order.customer.phone}</div>
                      </td>
                      <td>
                        <div>{order.items.map(i => `${i.quantity}× ${i.productName}`).join(', ')}</div>
                      </td>
                      <td>
                        <strong>{formatPrice(order.pricing.total)}</strong>
                      </td>
                      <td>
                        <span className={`pill ${isPaid ? 'pill-green' : 'pill-yellow'}`}>
                          {order.paymentStatus}
                        </span>
                        {!isPaid && (
                          <button
                            className="btn-micro"
                            onClick={() => handleVerifyPayment(order.orderId)}
                          >
                            Verify MoMo
                          </button>
                        )}
                      </td>
                      <td>
                        <span className={`pill pill-${status.toLowerCase()}`}>
                          {status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-actions-row">
                          {status === 'CONFIRMED' && (
                            <button
                              className="btn-step"
                              onClick={() => handleQuickAdvance(order.orderId, 'PROCESSING')}
                            >
                              Pack Items →
                            </button>
                          )}
                          {status === 'PROCESSING' && (
                            <button
                              className="btn-step"
                              onClick={() => handleQuickAdvance(order.orderId, 'READY')}
                            >
                              Mark Ready →
                            </button>
                          )}
                          {status === 'READY' && (
                            <button
                              className="btn-step"
                              onClick={() => handleQuickAdvance(order.orderId, order.customer.deliveryMethod === 'pickup' ? 'COMPLETED' : 'DISPATCHED')}
                            >
                              {order.customer.deliveryMethod === 'pickup' ? 'Handover' : 'Dispatch'}
                            </button>
                          )}
                          {status === 'DISPATCHED' && (
                            <button
                              className="btn-step"
                              onClick={() => handleQuickAdvance(order.orderId, 'DELIVERED')}
                            >
                              Delivered ✓
                            </button>
                          )}
                          <Link href={`/account/orders/${order.orderId}`} target="_blank" className="btn-view">
                            Receipt
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Quick Low Stock Section ── */}
      {lowStockAlerts.length > 0 && (
        <div className="white-panel">
          <div className="panel-title-bar">
            <h2 className="panel-heading">⚠️ Low Stock Watchlist ({lowStockAlerts.length})</h2>
            <Link href="/admin/inventory" className="panel-more-link">Restock Inventory →</Link>
          </div>

          <div className="low-stock-grid">
            {lowStockAlerts.map((pos) => (
              <div key={pos.productId} className="low-stock-item">
                <div>
                  <strong>{pos.productName}</strong>
                  <div className="cell-sub">Threshold: {pos.lowStockThreshold} units</div>
                </div>
                <div className="stock-counter-badge">
                  {pos.available} Left in Stock
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .simple-dash {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .dash-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .dash-title {
          font-family: var(--font-display, serif);
          font-size: 1.7rem;
          font-weight: 700;
          color: #1A0D14;
          margin: 0;
        }

        .dash-sub {
          font-size: 0.85rem;
          color: #7A6E73;
          margin-top: 0.2rem;
        }

        .dash-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-solid {
          background: #7B2347;
          color: #fff;
          padding: 0.55rem 1.15rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          transition: background 0.15s;
        }
        .btn-solid:hover {
          background: #5E1734;
        }

        .btn-hollow {
          background: #fff;
          color: #7B2347;
          border: 1px solid #D8CAD0;
          padding: 0.55rem 1.15rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          transition: all 0.15s;
        }
        .btn-hollow:hover {
          background: #FDF5F8;
          border-color: #7B2347;
        }

        .dash-toast {
          background: #2A7A4C;
          color: #fff;
          padding: 0.65rem 1.25rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .stat-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
        }

        .clean-card {
          background: #fff;
          border: 1px solid #EAE3E6;
          border-radius: 8px;
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-lbl {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 700;
          color: #7A6E73;
        }

        .card-ico {
          font-size: 1.1rem;
        }

        .card-num {
          font-size: 1.65rem;
          font-weight: 800;
          color: #1A0D14;
          font-family: var(--font-mono, monospace);
        }

        .card-hint {
          font-size: 0.78rem;
          color: #8C7E84;
        }

        .action-box {
          background: #FFF5F7;
          border: 1.5px solid #F3CFDA;
          border-radius: 8px;
          padding: 1rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .action-box-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .action-box-icon {
          font-size: 1.5rem;
        }

        .action-box-left strong {
          display: block;
          font-size: 0.9rem;
          color: #7B2347;
        }

        .action-box-left p {
          font-size: 0.78rem;
          color: #55484E;
          margin: 0.15rem 0 0 0;
        }

        .btn-action-box {
          background: #7B2347;
          color: #fff;
          text-decoration: none;
          padding: 0.45rem 1rem;
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 600;
        }

        .white-panel {
          background: #fff;
          border: 1px solid #EAE3E6;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .panel-title-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }

        .panel-heading {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1A0D14;
          margin: 0;
        }

        .panel-more-link {
          font-size: 0.82rem;
          color: #7B2347;
          font-weight: 600;
          text-decoration: none;
        }

        .empty-box {
          padding: 3rem 1rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .empty-box h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1A0D14;
          margin: 0.5rem 0 0 0;
        }

        .empty-box p {
          font-size: 0.82rem;
          color: #7A6E73;
          max-width: 360px;
          margin: 0;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .clean-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.82rem;
        }

        .clean-table th {
          text-align: left;
          padding: 0.65rem 0.75rem;
          border-bottom: 2px solid #EAE3E6;
          color: #7A6E73;
          font-size: 0.72rem;
          text-transform: uppercase;
        }

        .clean-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #F2ECF0;
          vertical-align: middle;
        }

        .cell-sub {
          font-size: 0.72rem;
          color: #9C8E94;
        }

        .pill {
          display: inline-block;
          padding: 2px 7px;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .pill-green { background: #E1F5E8; color: #2A7A4C; }
        .pill-yellow { background: #FEF3D6; color: #B37D00; }
        .pill-confirmed { background: #E6F0FA; color: #1E6091; }
        .pill-processing { background: #FDE8EF; color: #BE4D6E; }
        .pill-ready { background: #FFF4E5; color: #C27803; }
        .pill-dispatched { background: #EAE6F8; color: #583BB5; }
        .pill-delivered, .pill-completed { background: #E1F5E8; color: #2A7A4C; }
        .pill-cancelled { background: #FDE8E8; color: #C81E1E; }

        .btn-micro {
          display: block;
          margin-top: 3px;
          background: #2A7A4C;
          color: #fff;
          border: none;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.68rem;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-actions-row {
          display: flex;
          gap: 0.35rem;
        }

        .btn-step {
          background: #7B2347;
          color: #fff;
          border: none;
          padding: 0.3rem 0.65rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-view {
          background: #fff;
          border: 1px solid #D8CAD0;
          color: #7B2347;
          text-decoration: none;
          padding: 0.3rem 0.55rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .low-stock-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 0.75rem;
        }

        .low-stock-item {
          background: #FAF8F9;
          border: 1px solid #EAE3E6;
          border-radius: 6px;
          padding: 0.75rem 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stock-counter-badge {
          background: #FDE8EF;
          color: #BE4D6E;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
}
