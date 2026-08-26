'use client';

import React, { useState, useEffect } from 'react';
import {
  getAllInventoryPositions,
  getLowStockAlerts,
  adjustStock,
  getInventoryLedger,
} from '@/services/inventoryService';

export default function SimpleAdminInventoryPage() {
  const [positions, setPositions] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [search, setSearch] = useState('');
  const [showLedger, setShowLedger] = useState(false);
  const [intakeProduct, setIntakeProduct] = useState(null);
  const [intakeQty, setIntakeQty] = useState(10);
  const [intakeReason, setIntakeReason] = useState('New stock delivery received');
  const [toastMsg, setToastMsg] = useState('');

  const loadData = () => {
    setPositions(getAllInventoryPositions());
    setLedger(getInventoryLedger(30));
    setLowStockAlerts(getLowStockAlerts());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('cr-store-updated', loadData);
    return () => window.removeEventListener('cr-store-updated', loadData);
  }, []);

  const filtered = positions.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.productName.toLowerCase().includes(q);
  });

  const handleAddStock = (e) => {
    e.preventDefault();
    if (!intakeProduct) return;
    try {
      adjustStock(intakeProduct.productId, Number(intakeQty), intakeReason, 'Store Admin');
      setToastMsg(`Added ${intakeQty} units of "${intakeProduct.productName}" to stock.`);
      setIntakeProduct(null);
      loadData();
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="inv-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Stock Management</h1>
          <p className="page-sub">Track how many units of each product you have left and add new stock when supplies arrive.</p>
        </div>
      </div>

      {toastMsg && <div className="toast-msg">✓ {toastMsg}</div>}

      {/* Low Stock Alert Banner */}
      {lowStockAlerts.length > 0 && (
        <div className="alert-banner">
          <span>⚠️</span>
          <strong>{lowStockAlerts.length} item{lowStockAlerts.length !== 1 ? 's' : ''} running low on stock:</strong>
          <span style={{ color: '#7B2347', fontSize: '0.82rem' }}>
            {lowStockAlerts.slice(0, 3).map(a => a.productName).join(', ')}
            {lowStockAlerts.length > 3 && ` +${lowStockAlerts.length - 3} more`}
          </span>
        </div>
      )}

      {/* Summary Row */}
      <div className="summary-row">
        <div className="sum-card">
          <div className="sum-num">{positions.length}</div>
          <div className="sum-lbl">Total Products Being Tracked</div>
        </div>
        <div className="sum-card" style={{ borderLeft: `3px solid ${lowStockAlerts.length > 0 ? '#D97706' : '#2A7A4C'}` }}>
          <div className="sum-num" style={{ color: lowStockAlerts.length > 0 ? '#D97706' : '#2A7A4C' }}>
            {lowStockAlerts.length}
          </div>
          <div className="sum-lbl">Products Low on Stock</div>
        </div>
        <div className="sum-card" style={{ borderLeft: `3px solid ${positions.filter(p => p.available === 0).length > 0 ? '#C81E1E' : '#2A7A4C'}` }}>
          <div className="sum-num" style={{ color: positions.filter(p => p.available === 0).length > 0 ? '#C81E1E' : '#2A7A4C' }}>
            {positions.filter(p => p.available === 0).length}
          </div>
          <div className="sum-lbl">Out of Stock (Zero Units)</div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="white-card">
        <div className="card-top-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="btn-ledger-toggle"
            onClick={() => setShowLedger(!showLedger)}
          >
            {showLedger ? '📦 Show Stock Levels' : '📜 Show Movement History'}
          </button>
        </div>

        {!showLedger ? (
          <div className="table-wrap">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Units Available to Sell</th>
                  <th>Units in Cart (Reserved)</th>
                  <th>Total Physical</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((pos) => {
                  const isOut = pos.available === 0;
                  const isLow = pos.available <= pos.lowStockThreshold && !isOut;

                  return (
                    <tr key={pos.productId}>
                      <td><strong>{pos.productName}</strong></td>
                      <td>
                        <span style={{ fontWeight: 700, color: isOut ? '#C81E1E' : isLow ? '#D97706' : '#2A7A4C', fontSize: '1.05rem' }}>
                          {pos.available}
                        </span>
                        <span style={{ color: '#9C8E94', fontSize: '0.75rem', marginLeft: '4px' }}>units</span>
                      </td>
                      <td>{pos.reserved} units</td>
                      <td><strong>{pos.totalPhysical} units</strong></td>
                      <td>
                        {isOut ? (
                          <span className="stock-pill out">Out of Stock</span>
                        ) : isLow ? (
                          <span className="stock-pill low">Running Low</span>
                        ) : (
                          <span className="stock-pill ok">Good</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-restock"
                          onClick={() => {
                            setIntakeProduct(pos);
                            setIntakeQty(10);
                            setIntakeReason('New stock delivery received');
                          }}
                        >
                          + Add Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-wrap">
            <p style={{ fontSize: '0.82rem', color: '#7A6E73', marginBottom: '0.75rem' }}>
              Every time stock changes (sale, addition, reservation) it is recorded here automatically.
            </p>
            <table className="clean-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Product</th>
                  <th>What Happened</th>
                  <th>Quantity Changed</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {ledger.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                      No stock movements recorded yet.
                    </td>
                  </tr>
                ) : (
                  ledger.map((m) => (
                    <tr key={m.movementId}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', color: '#7A6E73' }}>
                        {new Date(m.timestamp).toLocaleString('en-GB')}
                      </td>
                      <td><strong>{m.productName}</strong></td>
                      <td>
                        <span className={`move-pill move-${m.type.toLowerCase()}`}>
                          {m.type.replace('STOCK_', '').replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: m.type === 'STOCK_RECEIVED' || m.type === 'STOCK_ADJUSTED' ? '#2A7A4C' : '#BE4D6E' }}>
                          {m.type === 'STOCK_RECEIVED' || m.type === 'STOCK_ADJUSTED' ? '+' : '−'}{m.quantity}
                        </strong>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: '#7A6E73' }}>{m.reason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Stock Modal */}
      {intakeProduct && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-top">
              <div>
                <h2>Add Stock</h2>
                <span style={{ fontSize: '0.82rem', color: '#7A6E73' }}>{intakeProduct.productName}</span>
              </div>
              <button className="close-btn" onClick={() => setIntakeProduct(null)}>×</button>
            </div>

            <form onSubmit={handleAddStock} className="modal-form">
              <div className="stock-current-display">
                <div>Currently in store:</div>
                <strong style={{ fontSize: '1.4rem', color: '#1A0D14' }}>{intakeProduct.totalPhysical} units</strong>
              </div>

              <div className="form-group">
                <label>How many units are you adding? *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={intakeQty}
                  onChange={(e) => setIntakeQty(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Reason (Shipment, delivery note, etc.) *</label>
                <input
                  type="text"
                  required
                  value={intakeReason}
                  onChange={(e) => setIntakeReason(e.target.value)}
                  placeholder="e.g. Received from supplier batch #123"
                />
              </div>

              <div className="preview-new-total">
                New total after adding: <strong>{intakeProduct.totalPhysical + Number(intakeQty)} units</strong>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel-modal" onClick={() => setIntakeProduct(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit-modal">
                  Confirm & Save Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .inv-page { display: flex; flex-direction: column; gap: 1.25rem; }

        .page-title { font-family: var(--font-display, serif); font-size: 1.6rem; font-weight: 700; color: #1A0D14; margin: 0; }
        .page-sub { font-size: 0.82rem; color: #7A6E73; margin-top: 0.2rem; }

        .toast-msg { background: #2A7A4C; color: #fff; padding: 0.6rem 1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; }

        .alert-banner {
          background: #FFF5E6;
          border: 1px solid #FBD38D;
          border-radius: 6px;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
        }

        .summary-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .sum-card {
          background: #fff;
          border: 1px solid #EAE3E6;
          border-left: 3px solid #7B2347;
          border-radius: 6px;
          padding: 1rem 1.25rem;
        }

        .sum-num { font-size: 1.65rem; font-weight: 800; color: #1A0D14; font-family: var(--font-mono, monospace); }
        .sum-lbl { font-size: 0.75rem; color: #7A6E73; margin-top: 0.15rem; }

        .white-card { background: #fff; border: 1px solid #EAE3E6; border-radius: 8px; padding: 1.25rem; }

        .card-top-bar { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }

        .search-input {
          flex: 1;
          min-width: 200px;
          padding: 0.5rem 0.75rem;
          border: 1px solid #D8CAD0;
          border-radius: 6px;
          font-size: 0.85rem;
        }

        .btn-ledger-toggle {
          background: #fff;
          border: 1px solid #D8CAD0;
          padding: 0.45rem 0.85rem;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          color: #55484E;
        }

        .table-wrap { overflow-x: auto; }

        .clean-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
        .clean-table th { text-align: left; padding: 0.65rem 0.75rem; border-bottom: 2px solid #EAE3E6; color: #7A6E73; font-size: 0.72rem; text-transform: uppercase; }
        .clean-table td { padding: 0.75rem; border-bottom: 1px solid #F2ECF0; vertical-align: middle; }

        .stock-pill {
          display: inline-block;
          padding: 2px 7px;
          border-radius: 10px;
          font-size: 0.72rem;
          font-weight: 700;
        }
        .stock-pill.ok { background: #E1F5E8; color: #2A7A4C; }
        .stock-pill.low { background: #FFF4E5; color: #C27803; }
        .stock-pill.out { background: #FDE8E8; color: #C81E1E; }

        .move-pill {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          background: #F3F4F6;
          color: #374151;
          text-transform: capitalize;
        }

        .btn-restock {
          background: #FDF5F8;
          border: 1px solid #D8CAD0;
          color: #7B2347;
          padding: 0.3rem 0.65rem;
          border-radius: 4px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-restock:hover { background: #7B2347; color: #fff; border-color: #7B2347; }

        /* Modal */
        .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 1rem; }
        .modal-card { background: #fff; border-radius: 8px; width: 100%; max-width: 420px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); padding: 1.5rem; }
        .modal-top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #EAE3E6; padding-bottom: 0.75rem; }
        .modal-top h2 { font-size: 1.2rem; margin: 0; color: #1A0D14; }
        .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #7A6E73; }
        .modal-form { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.85rem; }

        .stock-current-display {
          background: #FAF8F9;
          border: 1px solid #EAE3E6;
          border-radius: 6px;
          padding: 0.85rem 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.82rem;
          color: #55484E;
        }

        .form-group { display: flex; flex-direction: column; gap: 0.3rem; }
        .form-group label { font-size: 0.75rem; font-weight: 600; color: #55484E; }
        .form-group input { padding: 0.5rem 0.75rem; border: 1px solid #D8CAD0; border-radius: 6px; font-size: 0.85rem; }

        .preview-new-total {
          background: #F0FAF4;
          border: 1px solid #B5E4CB;
          border-radius: 6px;
          padding: 0.6rem 1rem;
          font-size: 0.82rem;
          color: #2A7A4C;
        }

        .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; padding-top: 0.75rem; border-top: 1px solid #EAE3E6; }
        .btn-cancel-modal { background: #fff; border: 1px solid #D8CAD0; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.85rem; cursor: pointer; }
        .btn-submit-modal { background: #7B2347; color: #fff; border: none; padding: 0.5rem 1.25rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
      `}</style>
    </div>
  );
}
