'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { SearchProvider } from '@/context/SearchContext';
import { ToastProvider } from '@/context/ToastContext';
import { QuickViewProvider } from '@/context/QuickViewContext';
import { AuthProvider } from '@/context/AuthContext';
import Header from './Header';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import CartDrawer from './CartDrawer';
import WhatsAppOrderButton from './WhatsAppOrderButton';
import SearchOverlay from '@/components/search/SearchOverlay';

export default function AppShell({ children }) {
  const pathname = usePathname() || '';

  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute =
    pathname === '/signin' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/verify-email';

  // For Admin and Dedicated Auth screens, render isolated content without storefront chrome
  if (isAdminRoute || isAuthRoute) {
    return (
      <ToastProvider>
        <AuthProvider>
          <main style={{ minHeight: '100vh' }}>{children}</main>
        </AuthProvider>
      </ToastProvider>
    );
  }

  // Standard Storefront Shell
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <SearchProvider>
              <QuickViewProvider>
                <Header />
                <main>{children}</main>
                <Footer />
                <MobileBottomNav />
                <CartDrawer />
                <WhatsAppOrderButton />
                <SearchOverlay />
              </QuickViewProvider>
            </SearchProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
