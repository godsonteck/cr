'use client';

import React, { useState, useEffect } from 'react';
import { getAllOrders, transitionOrderStatus, markOrderPaymentPaid } from '@/services/orderEngine';
import { formatPrice } from '@/utils/formatPrice';

export default function SimpleAdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'PROCESSING' | 'COMPLETED'
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const loadData = () => {
    setOrders(getAllOrders());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('cr-store-updated', loadData);
    return () => window.removeEventListener('cr-store-updated', loadData);
  }, []);

  const handleAdvance = (orderId, nextStatus) => {
    try {
      transitionOrderStatus(orderId, nextStatus, 'Store Admin', `Order updated to ${nextStatus}`);
      setToastMsg(`Order #${orderId} moved to ${nextStatus}`);
      loadData();
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder(getAllOrders().find(o => o.orderId === orderId));
      }
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleVerify = (orderId) => {
    try {
      markOrderPaymentPaid(orderId, `MOMO-${Date.now().toString().slice(-4)}`, 'Store Admin');
      setToastMsg(`Payment verified for order #${orderId}`);
      loadData();
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder(getAllOrders().find(o => o.orderId === orderId));
      }
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = !search || o.orderId.toLowerCase().includes(q) || o.customer.fullName.toLowerCase().includes(q) || o.customer.phone.includes(q);
    if (!matchSearch) return false;

    if (filter === 'PENDING') return o.orderStatus === 'PENDING' || o.orderStatus === 'CONFIRMED';
    if (filter === 'PROCESSING') return o.orderStatus === 'PROCESSING' || o.orderStatus === 'READY' || o.orderStatus === 'DISPATCHED';
    if (filter === 'COMPLETED') return o.orderStatus === 'DELIVERED' || o.orderStatus === 'COMPLETED';
    return true;
  });

  return (
    <div className="orders-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Orders Management</h1>
          <p className="page-sub">View customer orders, verify Mobile Money payments, and update delivery status.</p>
        </div>
      </div>

      {toastMsg && <div className="toast-msg">✓ {toastMsg}</div>}

      {/* Filter Tabs */}
      <div className="orders-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search by order #, customer name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="filter-tabs">
          <button
            className={`tab-btn ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            All ({orders.length})
          </button>
          <button
            className={`tab-btn ${filter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setFilter('PENDING')}
          >
            New / Unpaid ({orders.filter(o => o.orderStatus === 'PENDING' || o.orderStatus === 'CONFIRMED').length})
          </button>
          <button
            className={`tab-btn ${filter === 'PROCESSING' ? 'active' : ''}`}
            onClick={() => setFilter('PROCESSING')}
          >
            In Progress ({orders.filter(o => o.orderStatus === 'PROCESSING' || o.orderStatus === 'READY' || o.orderStatus === 'DISPATCHED').length})
          </button>
          <button
            className={`tab-btn ${filter === 'COMPLETED' ? 'active' : ''}`}
            onClick={() => setFilter('COMPLETED')}
          >
            Delivered ({orders.filter(o => o.orderStatus === 'DELIVERED' || o.orderStatus === 'COMPLETED').length})
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="white-card">
        {filteredOrders.length === 0 ? (
          <div className="empty-box">
            <span style={{ fontSize: '2rem', opacity: 0.5 }}>📦</span>
            <p>No orders matching this filter.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Delivery Location</th>
                  <th>Total Price</th>
                  <th>Payment</th>
                  <th>Fulfillment Status</th>
                  <th>Next Action</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const isPaid = order.paymentStatus === 'PAID';
                  const status = order.orderStatus;

                  return (
                    <tr key={order.orderId}>
                      <td>
                        <strong>#{order.orderId}</strong>
                        <div className="sub-txt">{new Date(order.createdAt).toLocaleDateString('en-GB')}</div>
                      </td>
                      <td>
                        <strong>{order.customer.fullName}</strong>
                        <div className="sub-txt">{order.customer.phone}</div>
                      </td>
                      <td>
                        <div>{order.customer.area || 'Botwe'}</div>
                        <div className="sub-txt">{order.customer.deliveryMethod === 'pickup' ? '🏪 Pickup' : order.customer.address}</div>
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
                            className="btn-momo-pay"
                            onClick={() => handleVerify(order.orderId)}
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
                        <div className="actions-cell">
                          {status === 'CONFIRMED' && (
                            <button
                              className="btn-next"
                              onClick={() => handleAdvance(order.orderId, 'PROCESSING')}
                            >
                              Pack Items →
                            </button>
                          )}
                          {status === 'PROCESSING' && (
                            <button
                              className="btn-next"
                              onClick={() => handleAdvance(order.orderId, 'READY')}
                            >
                              Mark Ready →
                            </button>
                          )}
                          {status === 'READY' && (
                            <button
                              className="btn-next"
                              onClick={() => handleAdvance(order.orderId, order.customer.deliveryMethod === 'pickup' ? 'COMPLETED' : 'DISPATCHED')}
                            >
                              {order.customer.deliveryMethod === 'pickup' ? 'Complete Handover' : 'Dispatch Rider'}
                            </button>
                          )}
                          {status === 'DISPATCHED' && (
                            <button
                              className="btn-next"
                              onClick={() => handleAdvance(order.orderId, 'DELIVERED')}
                            >
                              Mark Delivered ✓
                            </button>
                          )}
                          {status === 'DELIVERED' && (
                            <span style={{ fontSize: '0.75rem', color: '#2A7A4C', fontWeight: 600 }}>Completed ✓</span>
                          )}
                          {['PENDING', 'CONFIRMED'].includes(status) && (
                            <button
                              className="btn-cancel"
                              onClick={() => {
                                if (confirm(`Cancel Order #${order.orderId}?`)) {
                                  handleAdvance(order.orderId, 'CANCELLED');
                                }
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn-inspect"
                          onClick={() => setSelectedOrder(order)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div>
                <h2>Order #{selectedOrder.orderId}</h2>
                <span className="sub-txt">Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-GB')}</span>
              </div>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
            </div>

            <div className="modal-content">
              <div className="section-box">
                <h4>Customer Details</h4>
                <p><strong>Name:</strong> {selectedOrder.customer.fullName}</p>
                <p><strong>Phone:</strong> {selectedOrder.customer.phone}</p>
                <p><strong>Delivery Method:</strong> {selectedOrder.customer.deliveryMethod === 'pickup' ? 'In-Store Pickup (Botwe)' : 'Doorstep Delivery'}</p>
                <p><strong>Address:</strong> {selectedOrder.customer.address || 'Botwe, Accra'}</p>
                {selectedOrder.customer.deliveryNotes && (
                  <p><strong>Notes:</strong> <em>{selectedOrder.customer.deliveryNotes}</em></p>
                )}
              </div>

              <div className="section-box">
                <h4>Items Ordered</h4>
                <div className="items-list">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="item-line">
                      <span>{item.quantity}× {item.productName}</span>
                      <strong>{formatPrice(item.lineTotal)}</strong>
                    </div>
                  ))}
                </div>
                <div className="totals-line">
                  <div>Subtotal: {formatPrice(selectedOrder.pricing.subtotal)}</div>
                  <div>Delivery Fee: {selectedOrder.pricing.deliveryFee === 0 ? 'FREE' : formatPrice(selectedOrder.pricing.deliveryFee)}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#7B2347', marginTop: '0.25rem' }}>
                    Total: {formatPrice(selectedOrder.pricing.total)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .orders-page {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .page-title {
          font-family: var(--font-display, serif);
          font-size: 1.6rem;
          font-weight: 700;
          color: #1A0D14;
          margin: 0;
        }

        .page-sub {
          font-size: 0.82rem;
          color: #7A6E73;
          margin-top: 0.2rem;
        }

        .toast-msg {
          background: #2A7A4C;
          color: #fff;
          padding: 0.6rem 1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .orders-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .search-input {
          flex: 1;
          min-width: 260px;
          padding: 0.55rem 0.85rem;
          border: 1px solid #D8CAD0;
          border-radius: 6px;
          font-size: 0.85rem;
        }

        .filter-tabs {
          display: flex;
          gap: 0.4rem;
        }

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

        .tab-btn.active {
          background: #7B2347;
          border-color: #7B2347;
          color: #fff;
        }

        .white-card {
          background: #fff;
          border: 1px solid #EAE3E6;
          border-radius: 8px;
          padding: 1.25rem;
        }

        .empty-box {
          padding: 3rem;
          text-align: center;
          color: #7A6E73;
        }

        .table-wrap {
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

        .sub-txt {
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

        .btn-momo-pay {
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

        .actions-cell {
          display: flex;
          gap: 0.35rem;
        }

        .btn-next {
          background: #7B2347;
          color: #fff;
          border: none;
          padding: 0.3rem 0.65rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .btn-cancel {
          background: #FDE8E8;
          color: #C81E1E;
          border: none;
          padding: 0.3rem 0.5rem;
          border-radius: 4px;
          font-size: 0.72rem;
          cursor: pointer;
        }

        .btn-inspect {
          background: #fff;
          border: 1px solid #D8CAD0;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          font-size: 0.75rem;
          color: #55484E;
          cursor: pointer;
        }

        /* Modal */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: 1rem;
        }

        .modal-card {
          background: #fff;
          border-radius: 8px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          padding: 1.5rem;
        }

        .modal-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid #EAE3E6;
          padding-bottom: 0.75rem;
        }

        .modal-top h2 {
          font-size: 1.25rem;
          margin: 0;
          color: #1A0D14;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #7A6E73;
        }

        .modal-content {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section-box {
          background: #FAF8F9;
          border: 1px solid #EAE3E6;
          border-radius: 6px;
          padding: 1rem;
          font-size: 0.82rem;
        }

        .section-box h4 {
          margin: 0 0 0.5rem 0;
          color: #7B2347;
          font-size: 0.85rem;
        }

        .section-box p {
          margin: 0.2rem 0;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          border-bottom: 1px solid #EAE3E6;
          padding-bottom: 0.5rem;
        }

        .item-line {
          display: flex;
          justify-content: space-between;
        }

        .totals-line {
          padding-top: 0.5rem;
          text-align: right;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
}
