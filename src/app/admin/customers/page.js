'use client';

import React, { useState, useEffect } from 'react';
import { getAllOrders } from '@/services/orderEngine';
import { formatPrice } from '@/utils/formatPrice';

export default function SimpleAdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const buildCustomerList = () => {
      const orders = getAllOrders();
      const map = {};

      orders.forEach((order) => {
        const phone = order.customer.phone;
        if (!map[phone]) {
          map[phone] = {
            phone,
            fullName: order.customer.fullName,
            email: order.customer.email || '',
            area: order.customer.area || 'Botwe',
            orders: [],
            totalSpent: 0,
          };
        }
        map[phone].orders.push(order);
        map[phone].totalSpent += order.pricing?.total || 0;

        // Use most recent name
        if (new Date(order.createdAt) > new Date(map[phone].orders[0]?.createdAt || 0)) {
          map[phone].fullName = order.customer.fullName;
        }
      });

      setCustomers(Object.values(map).sort((a, b) => b.orders.length - a.orders.length));
    };

    buildCustomerList();
    window.addEventListener('cr-store-updated', buildCustomerList);
    return () => window.removeEventListener('cr-store-updated', buildCustomerList);
  }, []);

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.fullName.toLowerCase().includes(q) || c.phone.includes(q) || c.area.toLowerCase().includes(q);
  });

  const repeatCount = customers.filter(c => c.orders.length > 1).length;
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);

  return (
    <div className="customers-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-sub">See who has ordered from you, how much they have spent, and their order history.</p>
        </div>
      </div>

      {/* Summary */}
      <div className="summary-row">
        <div className="sum-card">
          <div className="sum-lbl">Total Customers</div>
          <div className="sum-num">{customers.length}</div>
        </div>
        <div className="sum-card">
          <div className="sum-lbl">Repeat Customers</div>
          <div className="sum-num" style={{ color: '#2A7A4C' }}>{repeatCount}</div>
        </div>
        <div className="sum-card">
          <div className="sum-lbl">Revenue from Customers</div>
          <div className="sum-num">{formatPrice(totalRevenue)}</div>
        </div>
      </div>

      <div className="white-card">
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, phone, or area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-box">
            <span style={{ fontSize: '2rem', opacity: 0.5 }}>👥</span>
            <p>{customers.length === 0 ? 'No customers yet. When someone places an order, they will appear here.' : 'No customers matching your search.'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Phone Number</th>
                  <th>Location</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Last Order</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cust) => {
                  const lastOrder = cust.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

                  return (
                    <tr key={cust.phone}>
                      <td>
                        <strong>{cust.fullName}</strong>
                        {cust.orders.length > 1 && (
                          <span className="repeat-tag">Repeat Customer</span>
                        )}
                      </td>
                      <td>{cust.phone}</td>
                      <td>{cust.area}</td>
                      <td>
                        <span className="orders-badge">{cust.orders.length} Order{cust.orders.length !== 1 ? 's' : ''}</span>
                      </td>
                      <td><strong>{formatPrice(cust.totalSpent)}</strong></td>
                      <td style={{ fontSize: '0.78rem', color: '#7A6E73' }}>
                        {new Date(lastOrder.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td>
                        <button
                          className="btn-view"
                          onClick={() => setSelected(cust)}
                        >
                          View History
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

      {/* Customer Detail Panel */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div>
                <h2>{selected.fullName}</h2>
                <span style={{ fontSize: '0.82rem', color: '#7A6E73' }}>
                  {selected.phone} • {selected.area}
                </span>
              </div>
              <button className="close-btn" onClick={() => setSelected(null)}>×</button>
            </div>

            <div className="cust-summary">
              <div className="cust-stat">
                <div>{selected.orders.length}</div>
                <div>Orders</div>
              </div>
              <div className="cust-stat">
                <div>{formatPrice(selected.totalSpent)}</div>
                <div>Total Spent</div>
              </div>
            </div>

            <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '0.85rem', color: '#55484E' }}>Order History</h4>
            <div className="orders-hist-list">
              {selected.orders
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((o) => (
                  <div key={o.orderId} className="hist-row">
                    <div>
                      <strong>#{o.orderId}</strong>
                      <div style={{ fontSize: '0.72rem', color: '#9C8E94' }}>
                        {new Date(o.createdAt).toLocaleDateString('en-GB')} • {o.items.length} item{o.items.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong>{formatPrice(o.pricing?.total || 0)}</strong>
                      <div style={{ fontSize: '0.72rem' }}>
                        <span className={`pill ${o.orderStatus === 'COMPLETED' || o.orderStatus === 'DELIVERED' ? 'pill-done' : 'pill-other'}`}>
                          {o.orderStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .customers-page { display: flex; flex-direction: column; gap: 1.25rem; }
        .page-title { font-family: var(--font-display, serif); font-size: 1.6rem; font-weight: 700; color: #1A0D14; margin: 0; }
        .page-sub { font-size: 0.82rem; color: #7A6E73; margin-top: 0.2rem; }

        .summary-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
        .sum-card { background: #fff; border: 1px solid #EAE3E6; border-radius: 8px; padding: 1.25rem 1.5rem; }
        .sum-lbl { font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: #7A6E73; letter-spacing: 0.5px; }
        .sum-num { font-size: 1.55rem; font-weight: 800; color: #1A0D14; font-family: var(--font-mono, monospace); margin-top: 0.2rem; }

        .white-card { background: #fff; border: 1px solid #EAE3E6; border-radius: 8px; padding: 1.25rem; }
        .search-input { width: 100%; max-width: 400px; padding: 0.55rem 0.85rem; border: 1px solid #D8CAD0; border-radius: 6px; font-size: 0.85rem; }

        .empty-box { padding: 3rem; text-align: center; color: #7A6E73; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }

        .table-wrap { overflow-x: auto; }
        .clean-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
        .clean-table th { text-align: left; padding: 0.65rem 0.75rem; border-bottom: 2px solid #EAE3E6; color: #7A6E73; font-size: 0.72rem; text-transform: uppercase; }
        .clean-table td { padding: 0.75rem; border-bottom: 1px solid #F2ECF0; vertical-align: middle; }

        .repeat-tag { display: inline-block; background: #E6F0FA; color: #1E6091; font-size: 0.65rem; font-weight: 700; padding: 1px 5px; border-radius: 3px; margin-left: 6px; text-transform: uppercase; }

        .orders-badge { background: #FDF5F8; color: #7B2347; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; }

        .btn-view { background: #fff; border: 1px solid #D8CAD0; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.75rem; cursor: pointer; color: #55484E; }
        .btn-view:hover { background: #7B2347; color: #fff; border-color: #7B2347; }

        /* Modal */
        .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 1rem; }
        .modal-card { background: #fff; border-radius: 8px; width: 100%; max-width: 460px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); padding: 1.5rem; max-height: 85vh; overflow-y: auto; }
        .modal-top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #EAE3E6; padding-bottom: 0.75rem; margin-bottom: 1rem; }
        .modal-top h2 { font-size: 1.2rem; margin: 0; color: #1A0D14; }
        .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #7A6E73; }

        .cust-summary { display: flex; gap: 1.5rem; margin-bottom: 0.5rem; }
        .cust-stat div:first-child { font-size: 1.4rem; font-weight: 800; color: #7B2347; }
        .cust-stat div:last-child { font-size: 0.72rem; color: #7A6E73; }

        .orders-hist-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .hist-row { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.75rem; background: #FAF8F9; border-radius: 6px; border: 1px solid #EAE3E6; }

        .pill { display: inline-block; padding: 1px 5px; border-radius: 4px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; }
        .pill-done { background: #E1F5E8; color: #2A7A4C; }
        .pill-other { background: #F3F4F6; color: #6B7280; }
      `}</style>
    </div>
  );
}
