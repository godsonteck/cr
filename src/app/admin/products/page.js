'use client';

import React, { useState, useEffect } from 'react';
import {
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  archiveProduct,
  deleteProduct,
  getAllCategories,
} from '@/services/productService';
import { formatPrice } from '@/utils/formatPrice';

export default function SimpleAdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Form State
  const [form, setForm] = useState({
    name: '',
    category: 'skincare',
    subcategory: 'Face',
    brand: 'CR Essentials',
    price: '',
    originalPrice: '',
    costPrice: '',
    stockCount: 25,
    badge: 'new',
    status: 'PUBLISHED',
    image: '',
    description: '',
    skinType: '',
    usage: '',
    ingredients: '',
  });

  const loadData = () => {
    getAllProductsAdmin().then((res) => {
      setProducts(res || []);
    }).catch(() => {
      setProducts([]);
    });
  };

  useEffect(() => {
    loadData();
    window.addEventListener('cr-store-updated', loadData);
    return () => window.removeEventListener('cr-store-updated', loadData);
  }, []);

  const categories = getAllCategories();

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(q) ||
      (p.id || '').toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q);
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'PUBLISHED' && p.status === 'PUBLISHED') ||
      (statusFilter === 'HIDDEN' && p.status === 'HIDDEN') ||
      (statusFilter === 'ARCHIVED' && p.status === 'ARCHIVED') ||
      (statusFilter === 'LOW_STOCK' && (p.stockCount || 0) <= 10);
    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setUploadError('');
    setForm({
      name: '',
      category: 'skincare',
      subcategory: 'Face',
      brand: 'CR Essentials',
      price: '',
      originalPrice: '',
      costPrice: '',
      stockCount: 25,
      badge: 'new',
      status: 'PUBLISHED',
      image: '',
      description: '',
      skinType: '',
      usage: '',
      ingredients: '',
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || data.error) {
        setUploadError(data.error || 'Upload failed. Try again.');
      } else {
        setForm((prev) => ({ ...prev, image: data.path }));
      }
    } catch (err) {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setUploadError('');
    setForm({
      name: p.name,
      category: p.category,
      subcategory: p.subcategory || (p.category === 'groceries' ? 'Pantry' : 'Face'),
      brand: p.brand || 'CR Essentials',
      price: p.price,
      originalPrice: p.originalPrice || '',
      costPrice: p.costPrice || '',
      stockCount: p.stockCount !== undefined ? p.stockCount : 20,
      badge: p.badge || '',
      status: p.status || 'PUBLISHED',
      image: p.image || '/images/products/1.jpeg',
      description: p.description || '',
      skinType: p.details?.skinType || '',
      usage: p.details?.usage || '',
      ingredients: p.details?.ingredients || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      category: form.category,
      subcategory: form.subcategory,
      brand: form.brand,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      costPrice: form.costPrice ? Number(form.costPrice) : null,
      stockCount: Number(form.stockCount),
      badge: form.badge || null,
      status: form.status,
      image: form.image || '/images/products/1.jpeg',
      description: form.description,
      details: {
        skinType: form.skinType || undefined,
        usage: form.usage || undefined,
        ingredients: form.ingredients || undefined,
      },
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, payload, 'Store Admin');
      setToastMsg(`Product "${form.name}" updated! Changes are live on the website.`);
    } else {
      await createProduct(payload, 'Store Admin');
      setToastMsg(`Product "${form.name}" added! It is now live on the store.`);
    }

    setModalOpen(false);
    loadData();
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleToggleStatus = async (p) => {
    const nextStatus = p.status === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED';
    await updateProduct(p.id, { status: nextStatus }, 'Store Admin');
    setToastMsg(
      `"${p.name}" is now ${nextStatus === 'PUBLISHED' ? 'live & visible on store' : 'taken down / hidden from store'}`
    );
    loadData();
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleStockAdjust = async (p, delta) => {
    const newStock = Math.max(0, (p.stockCount || 0) + delta);
    await updateProduct(p.id, { stockCount: newStock }, 'Store Admin');
    setToastMsg(`Stock for "${p.name}" updated to ${newStock} units.`);
    loadData();
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleArchive = async (p) => {
    if (confirm(`Archive "${p.name}" from the store catalog?`)) {
      await archiveProduct(p.id, 'Store Admin');
      setToastMsg(`"${p.name}" archived.`);
      loadData();
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleDelete = async (p) => {
    if (confirm(`PERMANENTLY delete "${p.name}"? This action cannot be undone.`)) {
      await deleteProduct(p.id, 'Store Admin');
      setToastMsg(`"${p.name}" was permanently removed from system.`);
      loadData();
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <div className="products-page">
      {/* Page Header */}
      <div className="page-head">
        <div>
          <h1 className="page-title">Product &amp; Catalog Management</h1>
          <p className="page-sub">
            Full admin control: Add new items, update prices, manage inventory levels, take down items, or replace products across Skincare and Groceries.
          </p>
        </div>
        <button className="btn-add" onClick={handleOpenAdd}>
          <span>+ Add New Product</span>
        </button>
      </div>

      {toastMsg && <div className="toast-msg">✓ {toastMsg}</div>}

      {/* Metrics Row */}
      <div className="metrics-row">
        <div className="metric-pill">
          <span>Total Catalog:</span>
          <strong>{products.length} Items</strong>
        </div>
        <div className="metric-pill">
          <span>Active Live:</span>
          <strong>{products.filter((p) => p.status === 'PUBLISHED').length}</strong>
        </div>
        <div className="metric-pill">
          <span>Hidden/Taken Down:</span>
          <strong style={{ color: '#D97706' }}>{products.filter((p) => p.status === 'HIDDEN').length}</strong>
        </div>
        <div className="metric-pill">
          <span>Low Stock (&lt;10):</span>
          <strong style={{ color: '#DC2626' }}>{products.filter((p) => (p.stockCount || 0) <= 10).length}</strong>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="toolbar-row">
        <input
          type="text"
          className="search-input"
          placeholder="Search products by title, ID or brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="filter-tabs">
          <button
            className={`tab-btn ${categoryFilter === 'all' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('all')}
          >
            All ({products.length})
          </button>
          <button
            className={`tab-btn ${categoryFilter === 'skincare' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('skincare')}
          >
            ✨ Skincare ({products.filter((p) => p.category === 'skincare').length})
          </button>
          <button
            className={`tab-btn ${categoryFilter === 'groceries' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('groceries')}
          >
            🌾 Groceries ({products.filter((p) => p.category === 'groceries').length})
          </button>
        </div>

        <select
          className="status-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="PUBLISHED">Live on Store</option>
          <option value="HIDDEN">Hidden / Taken Down</option>
          <option value="LOW_STOCK">Low Stock Alert</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="white-card">
        <div className="table-wrap">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product &amp; Brand</th>
                <th>Department</th>
                <th>Selling Price</th>
                <th>Stock Level</th>
                <th>Store Visibility</th>
                <th>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem', color: '#888' }}>
                    No products found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isHidden = p.status === 'HIDDEN';
                  const isArchived = p.status === 'ARCHIVED';
                  const isLow = (p.stockCount || 0) <= 10;
                  const isOos = (p.stockCount || 0) === 0;

                  return (
                    <tr key={p.id} className={isArchived ? 'row-archived' : ''}>
                      <td>
                        <div className="thumb-box">
                          <img src={p.image || '/images/products/1.jpeg'} alt={p.name} />
                        </div>
                      </td>
                      <td>
                        <strong className="prod-title">{p.name}</strong>
                        <div className="sub-txt">
                          {p.brand} &bull; <span className="prod-slug">/{p.slug}</span>
                        </div>
                        {p.badge && <span className="admin-badge-tag">{p.badge}</span>}
                      </td>
                      <td>
                        <span className={`cat-tag ${p.category === 'groceries' ? 'cat-tag--grocery' : ''}`}>
                          {p.category === 'groceries' ? '🌾 Groceries' : '✨ Skincare'}
                        </span>
                        {p.subcategory && <div className="sub-txt">{p.subcategory}</div>}
                      </td>
                      <td>
                        <strong className="price-tag">{formatPrice(p.price)}</strong>
                        {p.originalPrice && (
                          <div className="sub-txt strike">{formatPrice(p.originalPrice)}</div>
                        )}
                      </td>
                      <td>
                        <div className="stock-control">
                          <span className={`stock-badge ${isOos ? 'oos' : isLow ? 'low' : 'ok'}`}>
                            {isOos ? 'OUT OF STOCK' : `${p.stockCount || 0} Units`}
                          </span>
                          <div className="stock-quick-btns">
                            <button
                              type="button"
                              className="stock-btn"
                              title="Decrease 1"
                              onClick={() => handleStockAdjust(p, -1)}
                            >
                              −
                            </button>
                            <button
                              type="button"
                              className="stock-btn"
                              title="Restock +5"
                              onClick={() => handleStockAdjust(p, 5)}
                            >
                              +5
                            </button>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`pill ${isHidden ? 'pill-hidden' : isArchived ? 'pill-archived' : 'pill-active'}`}>
                          {isArchived ? 'Archived' : isHidden ? 'Taken Down' : 'Live on Store'}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-edit" onClick={() => handleOpenEdit(p)} title="Edit Details">
                            Edit
                          </button>
                          {!isArchived && (
                            <button
                              className={`btn-toggle ${isHidden ? 'btn-toggle--show' : 'btn-toggle--hide'}`}
                              onClick={() => handleToggleStatus(p)}
                              title={isHidden ? 'Publish to store' : 'Take down from store'}
                            >
                              {isHidden ? 'Put Up' : 'Take Down'}
                            </button>
                          )}
                          {!isArchived && (
                            <button className="btn-archive" onClick={() => handleArchive(p)} title="Archive product">
                              Archive
                            </button>
                          )}
                          <button className="btn-delete" onClick={() => handleDelete(p)} title="Delete permanently">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-top">
              <h2>{editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product to Store'}</h2>
              <button className="close-btn" onClick={() => setModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Jasmine Rice 5kg or Hydro Boost Water Gel"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department / Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      setForm({
                        ...form,
                        category: cat,
                        subcategory: cat === 'groceries' ? 'Pantry' : 'Face',
                      });
                    }}
                  >
                    <option value="skincare">✨ Skincare &amp; Beauty</option>
                    <option value="groceries">🌾 Groceries &amp; Essentials</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Subcategory</label>
                  <select
                    value={form.subcategory}
                    onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                  >
                    {form.category === 'skincare' ? (
                      <>
                        <option value="Face">Face Care</option>
                        <option value="Body">Body Care</option>
                        <option value="Hair">Hair &amp; Scalp</option>
                        <option value="Fragrances">Fragrances</option>
                      </>
                    ) : (
                      <>
                        <option value="Pantry">Pantry (Rice, Cooking Oils, Honey)</option>
                        <option value="Household">Household (Shea Butter, Black Soap)</option>
                        <option value="Snacks">Beverages &amp; Snacks</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Neutrogena, Olay, Royal Essentials, CR Naturals"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Promotional Badge</label>
                  <select
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  >
                    <option value="">No Badge</option>
                    <option value="bestseller">Best Seller</option>
                    <option value="sale">On Sale</option>
                    <option value="new">New Arrival</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Selling Price (GH₵) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="135.00"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Original Price / Strike-through (GH₵)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Optional (e.g. 150.00)"
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Stock Available *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="25"
                    value={form.stockCount}
                    onChange={(e) => setForm({ ...form, stockCount: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Visibility Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="PUBLISHED">Live on Website (Published)</option>
                  <option value="HIDDEN">Hidden / Taken Down (Draft)</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div className="form-group">
                <label>Product Image (Upload or Path)</label>
                <div className="img-upload-container">
                  <label
                    className={`img-upload-zone ${uploading ? 'uploading' : ''} ${form.image ? 'has-image' : ''}`}
                    htmlFor="product-img-input"
                  >
                    {form.image ? (
                      <img src={form.image} alt="Preview" className="img-preview" />
                    ) : (
                      <div className="upload-placeholder">
                        <span className="upload-icon">📷</span>
                        <span className="upload-label">
                          {uploading ? 'Uploading...' : 'Click to Upload Image'}
                        </span>
                        <span className="upload-hint">JPEG, PNG or WebP</span>
                      </div>
                    )}
                    <input
                      id="product-img-input"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>

                  <div className="img-path-input-wrap">
                    <span className="sub-txt">Or enter existing image URL / path:</span>
                    <input
                      type="text"
                      placeholder="/images/products/jasmine-rice.jpg"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                    />
                  </div>
                </div>
                {uploadError && <span className="upload-error">{uploadError}</span>}
              </div>

              <div className="form-group">
                <label>Product Description</label>
                <textarea
                  rows="3"
                  placeholder="Detailed benefits, size, and features..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel-modal" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit-modal">
                  {editingProduct ? 'Save & Update Store' : 'Publish Product to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .products-page {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          font-family: var(--font-primary, sans-serif);
        }

        .page-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .page-title {
          font-family: var(--font-display, serif);
          font-size: 1.7rem;
          font-weight: 700;
          color: #1A0D14;
          margin: 0;
        }

        .page-sub {
          font-size: 0.85rem;
          color: #63545B;
          margin-top: 0.25rem;
          max-width: 700px;
        }

        .btn-add {
          background: #7B2347;
          color: #fff;
          border: none;
          padding: 0.65rem 1.25rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
          box-shadow: 0 2px 8px rgba(123, 35, 71, 0.25);
        }
        .btn-add:hover {
          background: #5E1734;
        }

        .toast-msg {
          background: #166534;
          color: #fff;
          padding: 0.75rem 1.25rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        /* ── Metrics ── */
        .metrics-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .metric-pill {
          background: #FFFFFF;
          border: 1px solid #EBE2E6;
          padding: 8px 16px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: #55454C;
        }
        .metric-pill strong {
          color: #1A0D14;
          font-weight: 700;
        }

        /* ── Toolbar ── */
        .toolbar-row {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }
        .search-input {
          flex: 1;
          min-width: 260px;
          padding: 9px 14px;
          border: 1.5px solid #D8CAD0;
          border-radius: 6px;
          font-size: 0.85rem;
          background: #FFFFFF;
        }
        .filter-tabs {
          display: flex;
          gap: 4px;
          background: #FFFFFF;
          padding: 4px;
          border-radius: 6px;
          border: 1px solid #EBE2E6;
        }
        .tab-btn {
          background: none;
          border: none;
          padding: 6px 12px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #63545B;
          border-radius: 4px;
          cursor: pointer;
        }
        .tab-btn.active {
          background: #7B2347;
          color: #FFFFFF;
        }
        .status-select {
          padding: 8px 12px;
          border: 1.5px solid #D8CAD0;
          border-radius: 6px;
          font-size: 0.82rem;
          background: #FFFFFF;
          color: #1A0D14;
          font-weight: 600;
        }

        /* ── Table ── */
        .white-card {
          background: #FFFFFF;
          border: 1px solid #EBE2E6;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
        }
        .table-wrap {
          overflow-x: auto;
        }
        .clean-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .clean-table th {
          background: #FAF8F6;
          padding: 12px 16px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #7A6E73;
          border-bottom: 1.5px solid #EBE2E6;
        }
        .clean-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #F0E8EC;
          vertical-align: middle;
          font-size: 0.85rem;
        }
        .thumb-box {
          width: 48px;
          height: 52px;
          border-radius: 6px;
          overflow: hidden;
          background: #FAF6F8;
          border: 1px solid #EBE2E6;
        }
        .thumb-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .prod-title {
          display: block;
          color: #1A0D14;
          font-size: 0.9rem;
        }
        .prod-slug {
          color: #9A8A92;
          font-size: 0.72rem;
        }
        .admin-badge-tag {
          display: inline-block;
          font-size: 0.6rem;
          font-weight: 800;
          text-transform: uppercase;
          background: #FBE9F0;
          color: #7B2347;
          padding: 2px 6px;
          border-radius: 3px;
          margin-top: 3px;
        }
        .cat-tag {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
          background: #F4E8EE;
          color: #7B2347;
        }
        .cat-tag--grocery {
          background: #DCFCE7;
          color: #166534;
        }
        .sub-txt {
          font-size: 0.75rem;
          color: #7A6E73;
        }
        .strike {
          text-decoration: line-through;
        }
        .price-tag {
          color: #7B2347;
          font-weight: 800;
        }

        /* ── Stock ── */
        .stock-control {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .stock-badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
        }
        .stock-badge.ok { background: #DCFCE7; color: #166534; }
        .stock-badge.low { background: #FEF3C7; color: #92400E; }
        .stock-badge.oos { background: #FEE2E2; color: #991B1B; }
        .stock-quick-btns {
          display: flex;
          gap: 2px;
        }
        .stock-btn {
          background: #F0E8EC;
          border: none;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 7px;
          border-radius: 3px;
          cursor: pointer;
        }
        .stock-btn:hover { background: #7B2347; color: #fff; }

        /* ── Pill ── */
        .pill {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 999px;
        }
        .pill-active { background: #DCFCE7; color: #166534; }
        .pill-hidden { background: #FEF3C7; color: #92400E; }
        .pill-archived { background: #F3F4F6; color: #6B7280; }

        /* ── Action Buttons ── */
        .action-btns {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-edit {
          background: #7B2347;
          color: #fff;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-toggle {
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-toggle--hide {
          background: #FEF3C7;
          color: #92400E;
        }
        .btn-toggle--show {
          background: #DCFCE7;
          color: #166534;
        }
        .btn-archive {
          background: #F3F4F6;
          color: #4B5563;
          border: 1px solid #D1D5DB;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          cursor: pointer;
        }
        .btn-delete {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.95rem;
          padding: 4px;
        }

        /* ── Modal ── */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(26, 13, 20, 0.65);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }
        .modal-card {
          background: #FFFFFF;
          border-radius: 12px;
          width: 100%;
          max-width: 620px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.2);
        }
        .modal-top {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #EBE2E6;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-top h2 {
          font-family: var(--font-display, serif);
          font-size: 1.35rem;
          margin: 0;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 1.3rem;
          cursor: pointer;
        }
        .modal-form {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .form-group label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #1A0D14;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 8px 12px;
          border: 1.5px solid #D8CAD0;
          border-radius: 6px;
          font-size: 0.85rem;
          font-family: inherit;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .img-upload-container {
          display: grid;
          grid-template-columns: 100px 1fr;
          gap: 1rem;
          align-items: center;
        }
        .img-upload-zone {
          width: 100px;
          height: 100px;
          border: 2px dashed #C0AFB6;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
          background: #FAF8F6;
        }
        .img-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .upload-placeholder {
          text-align: center;
          font-size: 0.68rem;
          color: #7A6E73;
        }
        .upload-icon {
          font-size: 1.5rem;
          display: block;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid #EBE2E6;
        }
        .btn-cancel-modal {
          padding: 8px 16px;
          background: #F3F4F6;
          border: 1px solid #D1D5DB;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }
        .btn-submit-modal {
          padding: 8px 18px;
          background: #7B2347;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
