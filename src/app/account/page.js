'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getRecentOrders } from '@/services/orderService';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/utils/formatPrice';
import { BUSINESS } from '@/utils/constants';
import AccountClient from '@/app/AccountClient';

export default function AccountDashboardPage() {
  const { customer, isAuthenticated, loading: authLoading, signOutCustomer } = useAuth();
  const { count: wishlistCount } = useWishlist();

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return <Badge variant="success" size="sm">Delivered</Badge>;
      case 'dispatched':
      case 'ready':
        return <Badge variant="info" size="sm">Dispatched</Badge>;
      case 'processing':
        return <Badge variant="warning" size="sm">Processing</Badge>;
      case 'confirmed':
        return <Badge variant="info" size="sm">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="danger" size="sm">Cancelled</Badge>;
      default:
        return <Badge variant="default" size="sm">Placed</Badge>;
    }
  };

  // Guest State: Not signed in
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="account-guest-wrapper">
        <div className="container" style={{ maxWidth: '640px', paddingBlock: '3rem' }}>
          <Breadcrumb items={[{ label: 'My Account' }]} />

          <div className="guest-auth-card">
            <div className="guest-brand-badge">CR Customer Portal</div>
            <div className="guest-icon-crown">♛</div>
            <h1 className="guest-title">Sign in to your account</h1>
            <p className="guest-desc">
              Access your order history, manage saved wishlist items, and enjoy seamless one-click checkout across all your devices.
            </p>
            <Link href="/signin" className="btn-primary-full">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Signed in state - fetch orders after mount
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      const orders = await getRecentOrders(5);
      setRecentOrders(orders);
      setOrdersLoaded(true);
    }
    if (!ordersLoaded) loadOrders();
  }, [ordersLoaded]);

  return (
    <div className="account-container">
      <AccountClient
        customer={customer}
        isAuthenticated={isAuthenticated}
        recentOrders={recentOrders}
        wishlistCount={wishlistCount}
        getStatusBadge={getStatusBadge}
        signOutCustomer={signOutCustomer}
      />
    </div>
  );
}