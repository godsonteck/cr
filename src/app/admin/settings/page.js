'use client';

import React, { useState, useEffect } from 'react';
import { getAllOrders } from '@/services/orderEngine';
import { getAllProductsAdmin } from '@/services/productService';
import { formatPrice } from '@/utils/formatPrice';

export default function SimpleAdminSettingsPage() {
  const [tab, setTab] = useState('reports'); // 'reports' | 'store' | 'audit'
  const [orders, setOrders] = useState([]);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    const load = () => {
      setOrders(getAllOrders());
      setProductCount(getAllProductsAdmin().length);
    };
    load();
    window.addEventListener('cr-store-updated', load);
    return () => window.removeEventListener('cr-store-updated', load);
  }, []);

  const paidOrders = orders.filter(o => o.paymentStatus === 'PAID');
  const totalRevenue = paidOrders.reduce((s, o) => s + (o.pricing?.total || 0), 0);
  const totalUnits = paidOrders.reduce((s, o) => s + o.items.reduce((i, item) => i + item.quantity, 0), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / Math.max(paidOrders.length, 1) : 0;

  // Top products
  const productSales = {};
  orders.forEach(o => {
    o.items.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.productName, units: 0, revenue: 0 };
      }
      productSales[item.productId].units += item.quantity;
      productSales[item.productId].revenue += item.lineTotal || 0;
    });
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.units - a.units).slice(0, 8);

  const handleExportCSV = () => {
    const header = 'Order ID,Date,Customer,Phone,Items,Total,Payment Status,Order Status\n';
    const rows = orders.map(o => {
      const items = o.items.map(i => `${i.quantity}x ${i.productName}`).join('; ');
      return `"${o.orderId}","${o.createdAt}","${o.customer.fullName}","${o.customer.phone}","${items}",${o.pricing.total},"${o.paymentStatus}","${o.orderStatus}"`;
    }).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CR_Orders_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="settings-page">
      <div className="page-head">
        <h1 className="page-title">Reports & Settings</h1>
        <p className="page-sub">View sales reports, export your data, and manage store configurations.</p>
      </div>

      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'reports' ? 'active' : ''}`} onClick={() => setTab('reports')}>
          📈 Sales Reports
        </button>
        <button className={`tab-btn ${tab === 'store' ? 'active' : ''}`} onClick={() => setTab('store')}>
          🏬 Store Information
        </button>
      </div>

      {/* ── REPORTS TAB ── */}
      {tab === 'reports' && (
        <div className="tab-content">
          {/* Big Numbers */}
          <div className="report-kpis">
            <div className="kpi-card">
              <div className="kpi-lbl">Total Revenue (Paid Orders)</div>
              <div className="kpi-num">{formatPrice(totalRevenue)}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-lbl">Total Orders</div>
              <div className="kpi-num">{orders.length}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-lbl">Units Sold</div>
              <div className="kpi-num">{totalUnits}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-lbl">Average Order Value</div>
              <div className="kpi-num">{formatPrice(avgOrderValue)}</div>
            </div>
          </div>

          {/* Export */}
          <div className="export-row">
            <div>
              <strong>Download All Orders</strong>
              <p>Export a spreadsheet of all your orders to open in Excel or Google Sheets.</p>
            </div>
            <button className="btn-export" onClick={handleExportCSV}>
              📥 Export Orders as CSV
            </button>
          </div>

          {/* Top Selling Products */}
          <div className="white-card">
            <h2 className="section-heading">Best Selling Products</h2>
            {topProducts.length === 0 ? (
              <div className="empty-box">
                <p>No sales data yet. Products will appear here once customers start ordering.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="clean-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Product Name</th>
                      <th>Units Sold</th>
                      <th>Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, idx) => (
                      <tr key={p.name}>
                        <td>
                          <span className="rank-badge">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
                        </td>
                        <td><strong>{p.name}</strong></td>
                        <td><span className="units-tag">{p.units} units</span></td>
                        <td><strong>{formatPrice(p.revenue)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Order Status Breakdown */}
          <div className="white-card">
            <h2 className="section-heading">Order Status Breakdown</h2>
            <div className="status-breakdown-grid">
              {[
                { label: 'Pending / New', key: ['PENDING'], color: '#F59E0B' },
                { label: 'Confirmed', key: ['CONFIRMED'], color: '#3B82F6' },
                { label: 'Processing', key: ['PROCESSING'], color: '#8B5CF6' },
                { label: 'Ready / Dispatched', key: ['READY', 'DISPATCHED'], color: '#F97316' },
                { label: 'Delivered / Completed', key: ['DELIVERED', 'COMPLETED'], color: '#10B981' },
                { label: 'Cancelled', key: ['CANCELLED'], color: '#EF4444' },
              ].map(({ label, key, color }) => {
                const count = orders.filter(o => key.includes(o.orderStatus)).length;
                return (
                  <div key={label} className="status-breakdown-item">
                    <div className="status-bar-wrap">
                      <div
                        className="status-bar-fill"
                        style={{
                          width: orders.length > 0 ? `${(count / orders.length) * 100}%` : '0%',
                          background: color,
                        }}
                      />
                    </div>
                    <div className="status-breakdown-text">
                      <span>{label}</span>
                      <strong>{count}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── STORE INFO TAB ── */}
      {tab === 'store' && (
        <div className="tab-content">
          <div className="white-card">
            <h2 className="section-heading">Store Information</h2>
            <p className="section-desc">This is the official information for CR Cosmetics & Essentials.</p>

            <div className="info-grid">
              <div className="info-row-item">
                <label>Business Name</label>
                <div className="info-value">CR Cosmetics and Essentials</div>
              </div>
              <div className="info-row-item">
                <label>Phone Number</label>
                <div className="info-value">0592153306</div>
              </div>
              <div className="info-row-item">
                <label>WhatsApp</label>
                <a href="https://wa.me/233592153306" target="_blank" className="info-value link">
                  +233 59 215 3306 ↗
                </a>
              </div>
              <div className="info-row-item">
                <label>Location</label>
                <div className="info-value">Botwe, near Galaxy International School, Accra, Ghana</div>
              </div>
              <div className="info-row-item">
                <label>Currency</label>
                <div className="info-value">Ghana Cedi (GHS / ₵)</div>
              </div>
              <div className="info-row-item">
                <label>Payment Methods</label>
                <div className="info-value">MTN MoMo, Telecel Cash, AT Money, Cash on Delivery</div>
              </div>
              <div className="info-row-item">
                <label>Products in Catalog</label>
                <div className="info-value">{productCount} products</div>
              </div>
              <div className="info-row-item">
                <label>Delivery Coverage</label>
                <div className="info-value">Botwe, East Legon, Madina, Adenta, and surrounding Greater Accra areas</div>
              </div>
            </div>
          </div>

          <div className="white-card">
            <h2 className="section-heading">Current Active Promotions</h2>
            <div className="promo-item">
              <div>
                <strong>WELCOME10</strong>
                <p>10% off for new customers on their first order. Minimum spend: ₵100.</p>
              </div>
              <span className="promo-badge">Active</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .settings-page { display: flex; flex-direction: column; gap: 1.25rem; }
        .page-title { font-family: var(--font-display, serif); font-size: 1.6rem; font-weight: 700; color: #1A0D14; margin: 0; }
        .page-sub { font-size: 0.82rem; color: #7A6E73; margin-top: 0.2rem; }

        .tab-bar { display: flex; gap: 0.5rem; }
        .tab-btn { background: #fff; border: 1px solid #D8CAD0; padding: 0.55rem 1.1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; color: #55484E; cursor: pointer; }
        .tab-btn.active { background: #7B2347; border-color: #7B2347; color: #fff; }

        .tab-content { display: flex; flex-direction: column; gap: 1.25rem; }

        .report-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
        .kpi-card { background: #fff; border: 1px solid #EAE3E6; border-radius: 8px; padding: 1.25rem 1.5rem; }
        .kpi-lbl { font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: #7A6E73; letter-spacing: 0.5px; }
        .kpi-num { font-size: 1.55rem; font-weight: 800; color: #1A0D14; font-family: var(--font-mono, monospace); margin-top: 0.25rem; }

        .export-row {
          background: #fff;
          border: 1px solid #EAE3E6;
          border-radius: 8px;
          padding: 1.25rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .export-row strong { font-size: 0.9rem; color: #1A0D14; }
        .export-row p { font-size: 0.78rem; color: #7A6E73; margin: 0.2rem 0 0 0; }

        .btn-export {
          background: #7B2347;
          color: #fff;
          border: none;
          padding: 0.55rem 1.15rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .white-card { background: #fff; border: 1px solid #EAE3E6; border-radius: 8px; padding: 1.5rem; }
        .section-heading { font-size: 1rem; font-weight: 700; color: #1A0D14; margin: 0 0 0.5rem 0; }
        .section-desc { font-size: 0.8rem; color: #7A6E73; margin: 0 0 1.25rem 0; }

        .empty-box { padding: 2rem; text-align: center; color: #7A6E73; }

        .table-wrap { overflow-x: auto; }
        .clean-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
        .clean-table th { text-align: left; padding: 0.65rem 0.75rem; border-bottom: 2px solid #EAE3E6; color: #7A6E73; font-size: 0.72rem; text-transform: uppercase; }
        .clean-table td { padding: 0.75rem; border-bottom: 1px solid #F2ECF0; vertical-align: middle; }

        .rank-badge { font-size: 1.1rem; }
        .units-tag { background: #FDF5F8; color: #7B2347; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; }

        .status-breakdown-grid { display: flex; flex-direction: column; gap: 0.85rem; }
        .status-breakdown-item {}
        .status-breakdown-text { display: flex; justify-content: space-between; font-size: 0.8rem; color: #55484E; margin-bottom: 0.25rem; }
        .status-bar-wrap { height: 8px; background: #F2ECF0; border-radius: 4px; overflow: hidden; }
        .status-bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; min-width: 2px; }

        /* Store Info */
        .info-grid { display: flex; flex-direction: column; gap: 0.75rem; }
        .info-row-item { display: flex; flex-direction: column; gap: 0.2rem; padding-bottom: 0.75rem; border-bottom: 1px solid #F2ECF0; }
        .info-row-item:last-child { border-bottom: none; }
        .info-row-item label { font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: #9C8E94; letter-spacing: 0.5px; }
        .info-value { font-size: 0.9rem; color: #1A0D14; }
        .info-value.link { color: #7B2347; text-decoration: none; font-weight: 600; }

        .promo-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.85rem 1rem;
          background: #FAF8F9;
          border-radius: 6px;
          border: 1px solid #EAE3E6;
          gap: 1rem;
        }
        .promo-item strong { font-size: 1rem; color: #1A0D14; font-family: monospace; }
        .promo-item p { font-size: 0.78rem; color: #7A6E73; margin: 0.2rem 0 0 0; }
        .promo-badge { background: #E1F5E8; color: #2A7A4C; font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 12px; white-space: nowrap; }
      `}</style>
    </div>
  );
}
