'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getLowStockAlerts } from '@/services/inventoryService';
import { getAllOrders } from '@/services/orderEngine';
import { BUSINESS } from '@/utils/constants';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, isAdminAuthenticated, loading: authLoading, signOutAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If visiting the dedicated Admin Sign-In page, render directly without admin sidebar
  if (pathname === '/admin/signin') {
    return <>{children}</>;
  }

  const lowStockCount = getLowStockAlerts().length;
  const pendingOrdersCount = getAllOrders().filter(
    (o) => o.orderStatus === 'PENDING' || o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PROCESSING'
  ).length;

  const navLinks = [
    { label: 'Dashboard', href: '/admin', icon: '📊' },
    { label: 'Orders', href: '/admin/orders', icon: '🛍️', badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} new` : null, badgeColor: '#BE4D6E' },
    { label: 'Products', href: '/admin/products', icon: '🧴' },
    { label: 'Inventory', href: '/admin/inventory', icon: '📦', badge: lowStockCount > 0 ? `${lowStockCount} low` : null, badgeColor: '#D97706' },
    { label: 'Customers', href: '/admin/customers', icon: '👥' },
    { label: 'Store Settings', href: '/admin/settings', icon: '⚙️' },
  ];

  // ── Access Guard: If not signed in as staff, show guard screen ──
  if (!authLoading && !isAdminAuthenticated) {
    return (
      <div className="admin-guard-container">
        <div className="admin-guard-card">
          <div className="guard-brand">
            <span className="guard-crown">♛</span>
            <h2>CR Cosmetics & Essentials</h2>
            <span className="guard-tag">ADMIN & STAFF PORTAL</span>
          </div>

          <div className="guard-icon">🔒</div>
          <h3>Authentication Required</h3>
          <p>You must be signed in as an authorized staff member to access the store administration console.</p>

          <div className="guard-actions">
            <Link href={`/admin/signin?redirect=${encodeURIComponent(pathname)}`} className="btn-guard-signin">
              Sign In with Staff Account →
            </Link>
            <Link href="/" className="btn-guard-home">
              ← Return to Storefront
            </Link>
          </div>
        </div>

        <style jsx>{`
          .admin-guard-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #1A0D14;
            padding: 1.5rem;
            color: #fff;
          }
          .admin-guard-card {
            background: #26131D;
            border: 1px solid rgba(197, 160, 89, 0.3);
            border-radius: 12px;
            padding: 2.5rem;
            max-width: 440px;
            width: 100%;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          }
          .guard-crown {
            font-size: 2rem;
            color: #C5A059;
          }
          .guard-brand h2 {
            font-family: var(--font-display, serif);
            font-size: 1.25rem;
            margin: 0.35rem 0 0.2rem 0;
            color: #fff;
          }
          .guard-tag {
            font-size: 0.68rem;
            font-weight: 700;
            letter-spacing: 0.1em;
            color: #E6C885;
          }
          .guard-icon {
            font-size: 2.2rem;
            margin: 0.5rem 0 0;
          }
          .admin-guard-card h3 {
            font-family: var(--font-display, serif);
            font-size: 1.4rem;
            margin: 0;
            color: #fff;
          }
          .admin-guard-card p {
            font-size: 0.85rem;
            color: #CFC5CA;
            line-height: 1.5;
            margin: 0;
          }
          .guard-actions {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-top: 0.5rem;
          }
          .btn-guard-signin {
            background: #7B2347;
            color: #fff;
            padding: 0.8rem;
            border-radius: 6px;
            font-size: 0.9rem;
            font-weight: 600;
            text-decoration: none;
            transition: background 0.15s;
          }
          .btn-guard-signin:hover {
            background: #962F58;
          }
          .btn-guard-home {
            font-size: 0.82rem;
            color: #E6C885;
            text-decoration: none;
          }
          .btn-guard-home:hover {
            text-decoration: underline;
          }
        `}</style>
      </div>
    );
  }

  const staffName = admin?.name || 'Staff Admin';
  const staffRole = admin?.roleName || admin?.role?.replace('_', ' ') || 'Administrator';
  const staffInitial = staffName.charAt(0).toUpperCase();

  const handleSignOut = () => {
    signOutAdmin();
    router.push('/admin/signin');
  };

  return (
    <div className="admin-app">
      {/* ─── Sidebar Navigation ─── */}
      <aside className={`admin-nav-sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="nav-brand-box">
          <span className="nav-brand-crown">♛</span>
          <div>
            <div className="nav-brand-name">CR Cosmetics</div>
            <div className="nav-brand-role">Store Admin Portal</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="nav-menu">
          {navLinks.map(({ label, href, icon, badge, badgeColor }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="nav-icon">{icon}</span>
                <span className="nav-label">{label}</span>
                {badge && (
                  <span className="nav-badge" style={{ backgroundColor: badgeColor }}>
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Storefront Link at bottom */}
        <div className="nav-footer">
          <Link href="/" className="nav-storefront-btn" target="_blank">
            🛍️ Open Live Website ↗
          </Link>
          <div className="nav-store-info">
            Botwe Branch • 059 215 3306
          </div>
        </div>
      </aside>

      {/* ─── Main Content Canvas ─── */}
      <div className="admin-body-wrap">
        {/* Top bar */}
        <header className="admin-header-bar">
          <button
            className="mobile-nav-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <div className="header-greeting">
            <span className="greeting-title">{BUSINESS.name}</span>
            <span className="greeting-sub">• Botwe, Accra</span>
          </div>

          <div className="header-right-side">
            <Link href="/admin/products" className="quick-btn-add">
              + Add Product
            </Link>

            <div className="admin-user-pill">
              <span className="admin-avatar">{staffInitial}</span>
              <div className="admin-info-inline">
                <span className="admin-name">{staffName}</span>
                <span className="admin-role-badge">{staffRole}</span>
              </div>
            </div>

            <button
              type="button"
              className="admin-logout-btn"
              onClick={handleSignOut}
              title="Sign Out of Admin Console"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Page Children */}
        <main className="admin-page-canvas">
          {children}
        </main>
      </div>

      <style jsx global>{`
        .admin-app {
          display: flex;
          min-height: 100vh;
          background: #FAF8F9;
          font-family: var(--font-primary, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
          color: #2D1E24;
          overflow-x: hidden;
        }

        .admin-nav-sidebar {
          width: 240px;
          background: #1A0D14;
          color: #fff;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 100;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          overflow-y: auto;
        }

        .nav-brand-box {
          padding: 1.25rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .nav-brand-crown {
          color: #C5A059;
          font-size: 1.4rem;
        }

        .nav-brand-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #fff;
          font-family: var(--font-display, serif);
        }

        .nav-brand-role {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.55);
        }

        .nav-menu {
          padding: 1rem 0.75rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.85rem;
          color: rgba(255, 255, 255, 0.75);
          text-decoration: none;
          border-radius: 6px;
          font-size: 0.88rem;
          font-weight: 500;
          transition: all 0.15s ease;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }

        .nav-item.active {
          background: #7B2347;
          color: #fff;
          font-weight: 600;
        }

        .nav-icon {
          font-size: 1.05rem;
        }

        .nav-label {
          flex: 1;
        }

        .nav-badge {
          color: #fff;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 10px;
          text-transform: uppercase;
        }

        .nav-footer {
          padding: 1rem 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-storefront-btn {
          background: rgba(197, 160, 89, 0.15);
          color: #E6C885;
          text-decoration: none;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          text-align: center;
          border: 1px solid rgba(197, 160, 89, 0.3);
          transition: all 0.2s;
        }

        .nav-storefront-btn:hover {
          background: rgba(197, 160, 89, 0.25);
        }

        .nav-store-info {
          font-size: 0.68rem;
          color: rgba(255, 255, 255, 0.45);
          text-align: center;
        }

        .admin-body-wrap {
          flex: 1;
          margin-left: 240px;
          display: flex;
          flex-direction: column;
          min-width: 0;
          min-height: 100vh;
        }

        .admin-header-bar {
          height: 64px;
          background: #fff;
          border-bottom: 1px solid #EBE4E8;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 90;
        }

        .mobile-nav-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 1.4rem;
          color: #7B2347;
          cursor: pointer;
        }

        .header-greeting {
          font-size: 0.9rem;
        }

        .greeting-title {
          font-weight: 700;
          color: #7B2347;
        }

        .greeting-sub {
          color: #7A6E73;
          font-size: 0.8rem;
          margin-left: 0.3rem;
        }

        .header-right-side {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .quick-btn-add {
          background: #7B2347;
          color: #fff;
          text-decoration: none;
          padding: 0.45rem 0.9rem;
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 600;
          transition: background 0.15s;
        }

        .quick-btn-add:hover {
          background: #5E1734;
        }

        .admin-user-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem 0.25rem 0.35rem;
          background: #FDF5F8;
          border: 1px solid #EBDDE3;
          border-radius: 20px;
        }

        .admin-avatar {
          width: 26px;
          height: 26px;
          background: #7B2347;
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .admin-info-inline {
          display: flex;
          flex-direction: column;
        }

        .admin-name {
          font-size: 0.78rem;
          font-weight: 700;
          color: #1A0D14;
          line-height: 1.1;
        }

        .admin-role-badge {
          font-size: 0.65rem;
          color: #7B2347;
          font-weight: 600;
        }

        .admin-logout-btn {
          background: none;
          border: 1px solid #D8CAD0;
          padding: 0.35rem 0.7rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #7A6E73;
          cursor: pointer;
          transition: all 0.15s;
        }

        .admin-logout-btn:hover {
          background: #FEE2E2;
          border-color: #FCA5A5;
          color: #DC2626;
        }

        .admin-page-canvas {
          padding: 2rem;
          max-width: 1300px;
          width: 100%;
          margin: 0 auto;
          flex: 1;
        }

        @media (max-width: 1024px) {
          .admin-nav-sidebar {
            transform: translateX(-100%);
            transition: transform 0.25s ease;
          }
          .admin-nav-sidebar.open {
            transform: translateX(0);
          }
          .admin-body-wrap {
            margin-left: 0;
          }
          .mobile-nav-toggle {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}
