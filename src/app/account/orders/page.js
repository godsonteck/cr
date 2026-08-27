'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { getAllOrders } from '@/services/orderService';
import { formatPrice } from '@/utils/formatPrice';
import { useAuth } from '@/context/AuthContext';

export default function OrdersListPage() {
  const { customer, isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      if (authLoading) return;
      if (!isAuthenticated) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLoadError('');
        const result = await getAllOrders();
        const safeOrders = Array.isArray(result) ? result : [];
        if (!cancelled) setOrders(safeOrders);
      } catch (error) {
        console.error('[CR Orders] Failed to load orders:', error);
        if (!cancelled) {
          setOrders([]);
          setLoadError('We could not load your orders right now. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOrders();
    return () => { cancelled = true; };
  }, [authLoading, isAuthenticated, customer?.id]);

  const getStatusBadge = (status) => {
    const normalized = (status || '').toLowerCase();
    switch (normalized) {
      case 'delivered':
      case 'completed':
        return <Badge variant="success" size="md">Delivered</Badge>;
      case 'dispatched':
        return <Badge variant="info" size="md">Dispatched</Badge>;
      case 'processing':
      case 'ready':
        return <Badge variant="warning" size="md">Processing</Badge>;
      case 'confirmed':
        return <Badge variant="info" size="md">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="error" size="md">Cancelled</Badge>;
      default:
        return <Badge variant="default" size="md">Placed</Badge>;
    }
  };

  const normalizedOrders = Array.isArray(orders) ? orders : [];

  return (
    <div className="orders-page">
      <div className="orders-shell">
        <Breadcrumb items={[{ label: 'My Account', href: '/account' }, { label: 'My Orders' }]} />

        <header className="orders-header">
          <div>
            <span className="orders-kicker">CR CUSTOMER / ORDER JOURNAL</span>
            <h1>My orders</h1>
          </div>
          <p>Track every purchase from confirmation to delivery, and keep your beauty and everyday essentials close at hand.</p>
        </header>

        {!authLoading && !isAuthenticated ? (
          <section className="orders-gate">
            <div className="orders-mark">CR</div>
            <span className="orders-kicker">CUSTOMER ACCESS</span>
            <h2>Sign in to see your orders.</h2>
            <p>Your order history, delivery updates and receipts will live here once you sign in.</p>
            <Link href="/signin" className="orders-primary">SIGN IN <span>↗</span></Link>
          </section>
        ) : loading ? (
          <section className="orders-loading" aria-live="polite">
            <span className="loading-line" /><span className="loading-line short" /><span className="loading-line" />
            <p>Loading your order journal…</p>
          </section>
        ) : loadError ? (
          <section className="orders-message">
            <div className="orders-message-mark">!</div>
            <h2>Orders are temporarily unavailable.</h2>
            <p>{loadError}</p>
            <button type="button" onClick={() => window.location.reload()}>TRY AGAIN ↗</button>
          </section>
        ) : normalizedOrders.length === 0 ? (
          <EmptyState
            icon={<span className="empty-cr-mark">CR</span>}
            title="No orders yet"
            description="Your next beauty find or everyday essential will appear here after checkout."
            actionLabel="Explore the collection"
            actionHref="/shop"
          />
        ) : (
          <div className="orders-list">
            {normalizedOrders.map((order) => {
              const orderId = order.orderId || order.id;
              const dateStr = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                : order.date || 'Date unavailable';
              const totalVal = order.pricing?.total !== undefined ? order.pricing.total : order.total;
              const addressVal = order.customer?.address || order.address || 'Botwe, Accra';
              const items = Array.isArray(order.items) ? order.items : [];

              return (
                <article key={orderId} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <span className="order-overline">ORDER</span>
                      <strong className="order-id">#{orderId}</strong>
                      <span className="order-placed-date">Placed {dateStr}</span>
                    </div>
                    <div>{getStatusBadge(order.orderStatus || order.status)}</div>
                  </div>

                  <div className="order-card-items">
                    {items.map((item, idx) => {
                      const itemName = item.productName || item.name || 'CR product';
                      const itemPrice = item.unitPrice !== undefined ? item.unitPrice : (item.price || 0);
                      const itemImg = item.image;
                      return (
                        <div key={`${orderId}-${idx}`} className="order-item-mini">
                          <div className="item-mini-img">
                            {itemImg ? <img src={itemImg} alt={itemName} /> : <span>CR</span>}
                          </div>
                          <div className="item-mini-details">
                            <div className="item-mini-name">{itemName}</div>
                            <div className="item-mini-qty">Qty {item.quantity || 1} · {formatPrice(itemPrice)} each</div>
                          </div>
                          <div className="item-mini-total">{formatPrice(itemPrice * (item.quantity || 1))}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="order-card-footer">
                    <div className="footer-left">
                      <span className="del-addr-label">DELIVERING TO</span>
                      <span className="del-addr-text">{addressVal}</span>
                    </div>
                    <div className="footer-right">
                      <div className="order-total-block"><span>Total</span><strong>{formatPrice(totalVal || 0)}</strong></div>
                      <Button href={`/account/orders/${orderId}`} variant="primary" size="sm">View order ↗</Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .orders-page{min-height:100vh;background:#fbf8f6;color:#28191f;padding:calc(var(--header-h,74px) + 35px) 20px 90px}.orders-shell{max-width:1180px;margin:auto}.orders-header{display:grid;grid-template-columns:1.2fr .8fr;gap:60px;align-items:end;padding:54px 0 44px;border-bottom:1px solid #ded2d6}.orders-kicker{display:block;font:700 8px/1.2 Arial,sans-serif;letter-spacing:.2em;color:#957783;text-transform:uppercase;margin-bottom:14px}.orders-header h1{font:400 clamp(50px,7vw,88px)/.9 Georgia,serif;letter-spacing:-.055em;margin:0}.orders-header p{font:400 17px/1.55 Georgia,serif;color:#66535b;max-width:38ch;margin:0 0 5px}.orders-list{padding-top:28px;display:flex;flex-direction:column;gap:18px}.order-card{background:#fff;border:1px solid #e6dde0;padding:0 26px;transition:border-color .2s,transform .2s}.order-card:hover{border-color:#cbb5bf;transform:translateY(-2px)}.order-card-header{display:flex;justify-content:space-between;align-items:center;padding:21px 0;border-bottom:1px solid #eee7e9}.order-card-header>div:first-child{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}.order-overline{font:700 8px Arial,sans-serif;letter-spacing:.15em;color:#a28b94}.order-id{font:700 13px Arial,sans-serif;color:#6b1733}.order-placed-date{font:400 11px Arial,sans-serif;color:#94838a}.order-card-items{padding:17px 0;display:flex;flex-direction:column;gap:10px}.order-item-mini{display:flex;align-items:center;gap:15px}.item-mini-img{width:62px;height:68px;flex-shrink:0;background:#f7f1f3;display:flex;align-items:center;justify-content:center;overflow:hidden;font:400 20px Georgia,serif;color:#b28c9d}.item-mini-img img{width:100%;height:100%;object-fit:cover}.item-mini-details{flex:1;min-width:0}.item-mini-name{font:600 13px Arial,sans-serif;color:#33242a}.item-mini-qty{font:400 10px Arial,sans-serif;color:#8b777f;margin-top:5px}.item-mini-total{font:700 12px Arial,sans-serif;color:#3b2930}.order-card-footer{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:19px 0;border-top:1px solid #eee7e9}.footer-left{display:flex;flex-direction:column;gap:5px}.del-addr-label{font:700 7px Arial,sans-serif;letter-spacing:.16em;color:#a28b94}.del-addr-text{font:400 11px Arial,sans-serif;color:#66535b}.footer-right{display:flex;align-items:center;gap:24px}.order-total-block{display:flex;align-items:baseline;gap:7px;font:400 11px Arial,sans-serif;color:#8a777f}.order-total-block strong{font:700 16px Arial,sans-serif;color:#28191f}.orders-gate,.orders-message{text-align:center;padding:85px 25px;border-top:1px solid #ded2d6}.orders-mark{font:400 65px Georgia,serif;color:#6b1733;margin-bottom:24px}.orders-gate h2,.orders-message h2{font:400 38px Georgia,serif;margin:0 0 10px}.orders-gate p,.orders-message p{max-width:42ch;margin:0 auto 25px;color:#75636b;line-height:1.6;font-size:13px}.orders-primary{display:inline-flex;background:#6b1733;color:#fff;text-decoration:none;padding:14px 23px;font:700 9px Arial,sans-serif;letter-spacing:.14em}.orders-primary span{margin-left:15px}.orders-loading{padding:55px 0}.loading-line{display:block;width:100%;height:10px;background:linear-gradient(90deg,#f0e7ea,#faf7f7,#f0e7ea);margin-bottom:10px}.loading-line.short{width:45%}.orders-loading p{font:400 12px Arial,sans-serif;color:#8c7881}.orders-message-mark{width:40px;height:40px;border:1px solid #bfaab3;border-radius:50%;display:grid;place-items:center;margin:0 auto 20px;color:#6b1733}.orders-message button{border:0;background:#6b1733;color:#fff;padding:13px 20px;font:700 9px Arial,sans-serif;letter-spacing:.12em}.empty-cr-mark{font:400 48px Georgia,serif;color:#6b1733}@media(max-width:720px){.orders-header{grid-template-columns:1fr;gap:22px;padding:38px 0 30px}.orders-header h1{font-size:58px}.order-card{padding:0 16px}.order-card-footer{align-items:flex-start;flex-direction:column}.footer-right{width:100%;justify-content:space-between}.order-item-mini{gap:11px}.item-mini-img{width:55px;height:62px}.item-mini-total{display:none}}@media(max-width:420px){.orders-page{padding-inline:14px}.orders-header h1{font-size:50px}.orders-header p{font-size:15px}.order-card-header{align-items:flex-start;gap:10px;flex-direction:column}.footer-right{gap:12px;align-items:flex-end}.order-total-block{flex-direction:column;gap:2px}}
      `}</style>
    </div>
  );
}
