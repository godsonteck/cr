'use client';

import React, { useState, useEffect } from 'react';
import {
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  archiveProduct,
  getAllCategories,
} from '@/services/productService';
import { formatPrice } from '@/utils/formatPrice';

export default function SimpleAdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Simple Form State
  const [form, setForm] = useState({
    name: '',
    category: 'skincare',
    brand: 'CR Essentials',
    price: '',
    originalPrice: '',
    stockCount: 20,
    status: 'PUBLISHED',
    image: '',
    description: '',
  });

  const loadData = () => {
    setProducts(getAllProductsAdmin());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('cr-store-updated', loadData);
    return () => window.removeEventListener('cr-store-updated', loadData);
  }, []);

  const categories = getAllCategories();

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch = !search || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setUploadError('');
    setForm({
      name: '',
      category: 'skincare',
      brand: 'CR Essentials',
      price: '',
      originalPrice: '',
      stockCount: 25,
      status: 'PUBLISHED',
      image: '',
      description: '',
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
    setForm({
      name: p.name,
      category: p.category,
      brand: p.brand || 'CR Essentials',
      price: p.price,
      originalPrice: p.originalPrice || '',
      stockCount: p.stockCount || 0,
      status: p.status || 'PUBLISHED',
      image: p.image || '/images/products/1.jpeg',
      description: p.description || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      category: form.category,
      brand: form.brand,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      stockCount: Number(form.stockCount),
      status: form.status,
      image: form.image,
      description: form.description,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload, 'Store Admin');
      setToastMsg(`Product "${form.name}" updated! Changes are live on the website.`);
    } else {
      createProduct(payload, 'Store Admin');
      setToastMsg(`Product "${form.name}" added! It is now live on the store.`);
    }

    setModalOpen(false);
    loadData();
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleToggleStatus = (p) => {
    const nextStatus = p.status === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED';
    updateProduct(p.id, { status: nextStatus }, 'Store Admin');
    setToastMsg(`"${p.name}" is now ${nextStatus === 'PUBLISHED' ? 'visible on store' : 'hidden from store'}`);
    loadData();
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleArchive = (p) => {
    if (confirm(`Remove "${p.name}" from your active product catalog?`)) {
      archiveProduct(p.id, 'Store Admin');
      setToastMsg(`"${p.name}" archived.`);
      loadData();
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <div className="products-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Product Catalog</h1>
          <p className="page-sub">Add new items, update prices, manage stock, or hide products from the website.</p>
        </div>
        <button className="btn-add" onClick={handleOpenAdd}>
          + Add New Product
        </button>
      </div>

      {toastMsg && <div className="toast-msg">✓ {toastMsg}</div>}

      {/* Toolbar */}
      <div className="toolbar-row">
        <input
          type="text"
          className="search-input"
          placeholder="Search products by title or brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="filter-tabs">
          <button
            className={`tab-btn ${categoryFilter === 'all' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('all')}
          >
            All Products ({products.length})
          </button>
          <button
            className={`tab-btn ${categoryFilter === 'skincare' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('skincare')}
          >
            🧴 Skincare ({products.filter(p => p.category === 'skincare').length})
          </button>
          <button
            className={`tab-btn ${categoryFilter === 'groceries' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('groceries')}
          >
            🥫 Groceries ({products.filter(p => p.category === 'groceries').length})
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="white-card">
        <div className="table-wrap">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price (GHS)</th>
                <th>Stock Left</th>
                <th>Store Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isHidden = p.status === 'HIDDEN';
                  const isArchived = p.status === 'ARCHIVED';
                  const isLow = (p.stockCount || 0) <= 10;

                  return (
                    <tr key={p.id} className={isArchived ? 'row-archived' : ''}>
                      <td>
                        <div className="thumb-box">
                          <img src={p.image} alt={p.name} />
                        </div>
                      </td>
                      <td>
                        <strong>{p.name}</strong>
                        <div className="sub-txt">{p.brand}</div>
                      </td>
                      <td>
                        <span className="cat-tag">{p.category}</span>
                      </td>
                      <td>
                        <strong>{formatPrice(p.price)}</strong>
                        {p.originalPrice && (
                          <div className="sub-txt strike">{formatPrice(p.originalPrice)}</div>
                        )}
                      </td>
                      <td>
                        <span className={`stock-badge ${isLow ? 'low' : ''}`}>
                          {p.stockCount || 0} Units
                        </span>
                      </td>
                      <td>
                        <span className={`pill ${isHidden ? 'pill-hidden' : isArchived ? 'pill-archived' : 'pill-active'}`}>
                          {isArchived ? 'Archived' : isHidden ? 'Hidden' : 'Live on Store'}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-edit" onClick={() => handleOpenEdit(p)}>
                            Edit
                          </button>
                          {!isArchived && (
                            <button className="btn-toggle" onClick={() => handleToggleStatus(p)}>
                              {isHidden ? 'Show' : 'Hide'}
                            </button>
                          )}
                          {!isArchived && (
                            <button className="btn-archive" onClick={() => handleArchive(p)}>
                              Archive
                            </button>
                          )}
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

      {/* Simple Add/Edit Product Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-top">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="close-btn" onClick={() => setModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vitamin C Brightening Serum"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="skincare">Skincare</option>
                    <option value="groceries">Groceries</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Neutrogena, Olay"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price in GHS (₵) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="120.00"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Initial Stock Units *</label>
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
                <label>Product Image</label>
                <label className={`img-upload-zone ${uploading ? 'uploading' : ''} ${form.image ? 'has-image' : ''}`} htmlFor="product-img-input">
                  {form.image ? (
                    <img src={form.image} alt="Preview" className="img-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">📷</span>
                      <span className="upload-label">{uploading ? 'Uploading...' : 'Click to upload product image'}</span>
                      <span className="upload-hint">JPEG, PNG or WebP · Max 5MB</span>
                    </div>
                  )}
                  {uploading && <div className="upload-spinner" />}
                  <input
                    id="product-img-input"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
                {form.image && !uploading && (
                  <button
                    type="button"
                    className="btn-change-img"
                    onClick={() => document.getElementById('product-img-input').click()}
                  >
                    Change Image
                  </button>
                )}
                {uploadError && <span className="upload-error">{uploadError}</span>}
              </div>

              <div className="form-group">
                <label>Product Description</label>
                <textarea
                  rows="3"
                  placeholder="Brief description for customers..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel-modal" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit-modal">
                  {editingProduct ? 'Save Changes' : 'Publish Product'}
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

        .btn-add {
          background: #7B2347;
          color: #fff;
          border: none;
          padding: 0.55rem 1.15rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }

        .toast-msg {
          background: #2A7A4C;
          color: #fff;
          padding: 0.6rem 1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .toolbar-row {
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

        .row-archived {
          opacity: 0.4;
        }

        .thumb-box {
          width: 40px;
          height: 40px;
          border-radius: 4px;
          overflow: hidden;
          background: #FAF8F9;
        }

        .thumb-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sub-txt {
          font-size: 0.72rem;
          color: #9C8E94;
        }

        .strike {
          text-decoration: line-through;
        }

        .cat-tag {
          background: #FAF8F9;
          border: 1px solid #EAE3E6;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.72rem;
          text-transform: capitalize;
        }

        .stock-badge {
          font-weight: 700;
          color: #2A7A4C;
        }
        .stock-badge.low { color: #BE4D6E; }

        .pill {
          display: inline-block;
          padding: 2px 7px;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 700;
        }
        .pill-active { background: #E1F5E8; color: #2A7A4C; }
        .pill-hidden { background: #FFF4E5; color: #C27803; }
        .pill-archived { background: #F3F4F6; color: #6B7280; }

        .action-btns {
          display: flex;
          gap: 0.35rem;
        }

        .btn-edit {
          background: #7B2347;
          color: #fff;
          border: none;
          padding: 0.3rem 0.55rem;
          border-radius: 4px;
          font-size: 0.75rem;
          cursor: pointer;
        }

        .btn-toggle {
          background: #fff;
          border: 1px solid #D8CAD0;
          padding: 0.3rem 0.55rem;
          border-radius: 4px;
          font-size: 0.75rem;
          cursor: pointer;
        }

        .btn-archive {
          background: #FFF5F7;
          border: 1px solid #F3CFDA;
          color: #BE4D6E;
          padding: 0.3rem 0.55rem;
          border-radius: 4px;
          font-size: 0.75rem;
          cursor: pointer;
        }

        /* Modal */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
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
          max-width: 520px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          padding: 1.5rem;
        }

        .modal-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
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

        .modal-form {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .form-row {
          display: flex;
          gap: 0.85rem;
        }

        .form-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .form-group label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #55484E;
        }

        .form-group input, .form-group select, .form-group textarea {
          padding: 0.5rem 0.75rem;
          border: 1px solid #D8CAD0;
          border-radius: 6px;
          font-size: 0.85rem;
          font-family: inherit;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.5rem;
          padding-top: 0.75rem;
          border-top: 1px solid #EAE3E6;
        }

        .btn-cancel-modal {
          background: #fff;
          border: 1px solid #D8CAD0;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .btn-submit-modal {
          background: #7B2347;
          color: #fff;
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }

        /* ── Image Upload Zone ── */
        .img-upload-zone {
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed #D8CAD0;
          border-radius: 8px;
          cursor: pointer;
          overflow: hidden;
          background: #FAF8F9;
          transition: border-color 0.2s, background 0.2s;
          min-height: 150px;
          position: relative;
        }
        .img-upload-zone:hover { border-color: #7B2347; background: #FDF5F8; }
        .img-upload-zone.uploading { opacity: 0.7; cursor: wait; }
        .img-upload-zone.has-image { border-style: solid; border-color: #EAE3E6; }

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          padding: 1.5rem;
          text-align: center;
        }
        .upload-icon { font-size: 2rem; }
        .upload-label { font-size: 0.85rem; font-weight: 600; color: #55484E; }
        .upload-hint { font-size: 0.72rem; color: #9C8E94; }

        .img-preview {
          width: 100%;
          max-height: 200px;
          object-fit: contain;
          display: block;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .upload-spinner {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.7);
        }
        .upload-spinner::after {
          content: '';
          width: 28px; height: 28px;
          border: 3px solid #EAE3E6;
          border-top-color: #7B2347;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .btn-change-img {
          margin-top: 0.4rem;
          background: none;
          border: none;
          color: #7B2347;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
        }

        .upload-error {
          display: block;
          margin-top: 0.3rem;
          color: #C81E1E;
          font-size: 0.78rem;
        }
      `}</style>
    </div>
  );
}
