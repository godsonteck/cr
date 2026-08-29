import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { ReviewsProvider } from './context/ReviewsContext';

// Components
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CartDrawerComponent } from './components/checkout/CartAndCheckout';
import { WishlistModal } from './components/common/WishlistModal';

// Views
import { HomePage, BeautyDepartmentPage, GroceryDepartmentPage } from './components/home/DepartmentStorefronts';
import { ShopCatalogPage, SearchResultsPage } from './components/shop/CatalogAndSearch';
import { ProductDetailPage, RoutineBuilderPage } from './components/product/ProductDetailAndRoutine';
import { FullCartPage, MultiStepCheckoutPage, OrderConfirmationPage } from './components/checkout/CartAndCheckout';
import { AccountPage, SignInPage, SignUpPage } from './components/account/AccountAndAuth';
import { AboutPage, ContactPage } from './components/common/SupportPages';
import { AdminPortal } from './components/admin/AdminPortal';

function AppLayout() {
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] font-sans selection:bg-[#C86D51] selection:text-white transition-colors">
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
      />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/beauty" element={<BeautyDepartmentPage />} />
          <Route path="/groceries" element={<GroceryDepartmentPage />} />
          <Route path="/shop" element={<ShopCatalogPage />} />
          <Route path="/category/:categorySlug" element={<ShopCatalogPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/routine-builder" element={<RoutineBuilderPage />} />

          <Route path="/cart" element={<FullCartPage />} />
          <Route path="/checkout" element={<MultiStepCheckoutPage />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />

          <Route path="/account" element={<AccountPage />} />
          <Route path="/account/orders" element={<AccountPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/offers" element={<ShopCatalogPage />} />
          <Route path="/admin" element={<AdminPortal />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      <CartDrawerComponent isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WishlistModal isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <ToastProvider>
                <ReviewsProvider>
                  <BrowserRouter>
                    <AppLayout />
                  </BrowserRouter>
                </ReviewsProvider>
              </ToastProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
