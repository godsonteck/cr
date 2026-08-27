'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getLowStockAlerts } from '@/services/inventoryService';
import { getAllOrders } from '@/services/orderEngine';
import { BUSINESS } from '@/utils/constants';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: '⌂' },
  { label: 'Orders', href: '/admin/orders', icon: '◫' },
  { label: 'Products', href: '/admin/products', icon: '◇' },
  { label: 'Inventory', href: '/admin/inventory', icon: '▦' },
  { label: 'Customers', href: '/admin/customers', icon: '○' },
  { label: 'Store Settings', href: '/admin/settings', icon: '⚙' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname() || '';
  const router = useRouter();
  const { admin, isAdminAuthenticated, loading: authLoading, signOutAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [counts, setCounts] = useState({ lowStock: 0, pendingOrders: 0 });

  const isSignin = pathname === '/admin/signin';

  useEffect(() => {
    let cancelled = false;
    async function loadCounts() {
      try {
        const [lowStockResult, ordersResult] = await Promise.all([getLowStockAlerts(), getAllOrders()]);
        if (cancelled) return;
        const lowStock = Array.isArray(lowStockResult) ? lowStockResult.length : 0;
        const orders = Array.isArray(ordersResult) ? ordersResult : [];
        const pendingOrders = orders.filter((order) => {
          const status = String(order?.orderStatus || '').toUpperCase();
          return ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(status);
        }).length;
        setCounts({ lowStock, pendingOrders });
      } catch (error) {
        console.error('[AdminLayout] Failed to load navigation counts:', error);
        if (!cancelled) setCounts({ lowStock: 0, pendingOrders: 0 });
      }
    }
    if (!isSignin && isAdminAuthenticated) loadCounts();
    return () => { cancelled = true; };
  }, [isSignin, isAdminAuthenticated]);

  useEffect(() => setMobileOpen(false), [pathname]);

  const staffName = admin?.name || 'Staff Admin';
  const staffRole = admin?.roleName || String(admin?.role || 'Administrator').replace(/_/g, ' ');
  const staffInitial = staffName.charAt(0).toUpperCase();
  const navLinks = useMemo(() => NAV.map((item) => ({ ...item, badge: item.href === '/admin/orders' ? counts.pendingOrders : item.href === '/admin/inventory' ? counts.lowStock : null })), [counts]);

  const handleSignOut = () => { signOutAdmin(); router.push('/admin/signin'); };

  if (isSignin) return <>{children}</>;

  if (!authLoading && !isAdminAuthenticated) {
    return <div className="cr-admin-guard"><div className="cr-admin-guard-card"><div className="cr-admin-mark">CR</div><div className="cr-admin-eyebrow">CR COSMETICS & ESSENTIALS</div><h1>Staff access required</h1><p>Sign in with an authorised staff account to manage products, orders, inventory and customers.</p><Link href={`/admin/signin?redirect=${encodeURIComponent(pathname)}`} className="cr-admin-primary">Sign in to admin ↗</Link><Link href="/" className="cr-admin-secondary">Return to storefront</Link></div><style jsx>{`.cr-admin-guard{min-height:100vh;display:grid;place-items:center;padding:24px;background:#f7f1f3;color:#24161c}.cr-admin-guard-card{width:min(440px,100%);padding:52px 42px;text-align:center;background:#fff;border:1px solid #e8dfe2;box-shadow:0 24px 70px rgba(43,20,30,.08)}.cr-admin-mark{font:400 58px/.8 Georgia,serif;letter-spacing:-.08em;color:#6b1733;margin-bottom:24px}.cr-admin-eyebrow{font:700 9px/1 Arial,sans-serif;letter-spacing:.18em;color:#967985;margin-bottom:18px}.cr-admin-guard-card h1{font:400 38px/.98 Georgia,serif;margin:0 0 14px;letter-spacing:-.035em}.cr-admin-guard-card p{font:400 14px/1.65 Arial,sans-serif;color:#74636b;margin:0 auto 26px;max-width:34ch}.cr-admin-primary,.cr-admin-secondary{display:block;text-decoration:none}.cr-admin-primary{padding:15px;background:#6b1733;color:#fff;font:700 10px Arial,sans-serif;letter-spacing:.13em;text-transform:uppercase}.cr-admin-secondary{margin-top:18px;color:#6b1733;font:700 10px Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase}`}</style></div>;
  }

  return <div className="cr-admin-app">
    {mobileOpen && <button className="cr-admin-overlay" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <aside className={`cr-admin-sidebar${mobileOpen ? ' is-open' : ''}`}>
      <div className="cr-admin-brand">
        <img src="/logo.jpeg" alt="CR Cosmetics Logo" className="cr-admin-logo-img" />
        <div>
          <strong>Cosmetics &amp; Essentials</strong>
          <span>Store operations</span>
        </div>
      </div>
      <div className="cr-admin-section-label">Workspace</div>
      <nav className="cr-admin-nav" aria-label="Admin navigation">{navLinks.map((item) => { const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href); return <Link key={item.href} href={item.href} className={`cr-admin-nav-item${active ? ' active' : ''}`}><span className="cr-admin-nav-icon">{item.icon}</span><span>{item.label}</span>{item.badge > 0 && <b>{item.badge}</b>}</Link>; })}</nav>
      <div className="cr-admin-sidebar-bottom"><Link href="/" target="_blank" className="cr-admin-live">View live store <span>↗</span></Link><div className="cr-admin-location">BOTWE · ACCRA</div></div>
    </aside>
    <div className="cr-admin-main">
      <header className="cr-admin-topbar"><button className="cr-admin-menu" onClick={() => setMobileOpen((value) => !value)} aria-label="Open navigation">☰</button><div className="cr-admin-context"><span>{BUSINESS.name}</span><small> / {pathname === '/admin' ? 'Overview' : pathname.split('/').filter(Boolean).slice(-1)[0]?.replace(/-/g, ' ')}</small></div><div className="cr-admin-top-actions"><Link href="/admin/products" className="cr-admin-add">+ Add product</Link><div className="cr-admin-user"><span>{staffInitial}</span><div><strong>{staffName}</strong><small>{staffRole}</small></div></div><button className="cr-admin-signout" onClick={handleSignOut}>Sign out</button></div></header>
      <main className="cr-admin-content">{children}</main>
    </div>
    <style jsx global>{`.cr-admin-app{min-height:100vh;background:#f8f6f7;color:#281a20;font-family:Arial,sans-serif}.cr-admin-sidebar{position:fixed;inset:0 auto 0 0;width:252px;background:#24131b;color:#fff;z-index:200;display:flex;flex-direction:column;border-right:1px solid rgba(255,255,255,.08)}.cr-admin-brand{padding:22px 23px;border-bottom:1px solid rgba(255,255,255,.1);display:flex;gap:13px;align-items:center}.cr-admin-logo-img{width:42px;height:42px;border-radius:50%;object-fit:cover;border:1px solid #c59b3f}.cr-admin-brand strong{display:block;font:700 12px/1.2 Georgia,serif}.cr-admin-brand span{display:block;margin-top:5px;color:#bdaeb5;font-size:9px;letter-spacing:.12em;text-transform:uppercase}.cr-admin-section-label{padding:28px 23px 10px;color:#8f7b84;font-size:8px;font-weight:700;letter-spacing:.2em;text-transform:uppercase}.cr-admin-nav{padding:0 12px;display:flex;flex-direction:column;gap:3px}.cr-admin-nav-item{min-height:45px;padding:0 12px;display:flex;align-items:center;gap:12px;color:#cdbfc5;text-decoration:none;font-size:12px;position:relative}.cr-admin-nav-item:hover{color:#fff;background:rgba(255,255,255,.05)}.cr-admin-nav-item.active{color:#fff;background:var(--burgundy, #6b1733)}.cr-admin-nav-item b{margin-left:auto;min-width:20px;height:20px;padding:0 5px;border-radius:20px;background:#a94d6b;display:grid;place-items:center;color:#fff;font-size:8px}.cr-admin-nav-icon{width:18px;text-align:center;color:#b994a2;font-size:15px}.cr-admin-nav-item.active .cr-admin-nav-icon{color:#fff}.cr-admin-sidebar-bottom{margin-top:auto;padding:18px;border-top:1px solid rgba(255,255,255,.1)}.cr-admin-live{display:flex;justify-content:space-between;padding:12px 13px;color:#e5c5cf;text-decoration:none;border:1px solid rgba(229,197,207,.2);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.cr-admin-location{padding:12px 2px 0;color:#88767f;font-size:8px;letter-spacing:.16em}.cr-admin-main{margin-left:252px;min-height:100vh}.cr-admin-topbar{height:72px;background:rgba(255,255,255,.94);backdrop-filter:blur(14px);border-bottom:1px solid #e9e1e4;display:flex;align-items:center;justify-content:space-between;padding:0 30px;position:sticky;top:0;z-index:150}.cr-admin-context{font-size:12px;color:var(--burgundy, #6b1733)}.cr-admin-context span{font-weight:700}.cr-admin-context small{color:#98858d;font-size:11px}.cr-admin-top-actions{display:flex;align-items:center;gap:16px}.cr-admin-add{background:var(--burgundy, #6b1733);color:#fff;text-decoration:none;padding:11px 15px;font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}.cr-admin-user{display:flex;align-items:center;gap:9px}.cr-admin-user>span{width:32px;height:32px;background:#f1e5e9;color:var(--burgundy, #6b1733);display:grid;place-items:center;font-size:11px;font-weight:700}.cr-admin-user strong,.cr-admin-user small{display:block}.cr-admin-user strong{font-size:11px}.cr-admin-user small{margin-top:3px;color:#8d7b83;font-size:8px;text-transform:uppercase;letter-spacing:.08em}.cr-admin-signout{border:0;background:none;color:#8a747d;font-size:10px;font-weight:700;cursor:pointer}.cr-admin-signout:hover{color:var(--burgundy)}.cr-admin-content{padding:clamp(22px,4vw,48px);max-width:1600px}.cr-admin-menu,.cr-admin-overlay{display:none}@media(max-width:900px){.cr-admin-sidebar{transform:translateX(-100%);transition:transform .25s ease}.cr-admin-sidebar.is-open{transform:none}.cr-admin-main{margin-left:0}.cr-admin-menu{display:block;border:0;background:none;font-size:20px;color:var(--burgundy);cursor:pointer;margin-right:12px}.cr-admin-overlay{display:block;position:fixed;inset:0;background:rgba(26,12,19,.45);z-index:190;border:0}.cr-admin-topbar{padding:0 18px}.cr-admin-context{flex:1}.cr-admin-user div,.cr-admin-signout{display:none}.cr-admin-top-actions{gap:7px}.cr-admin-add{padding:10px 11px}}@media(max-width:520px){.cr-admin-context{display:none}.cr-admin-topbar{justify-content:flex-end}.cr-admin-content{padding:20px 15px}.cr-admin-add{font-size:8px}}`}</style>
  </div>;
}
