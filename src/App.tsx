import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ErrorBoundary from './components/common/ErrorBoundary';
import { SEO } from './components/common/SEO';
import { useStore } from './context/StoreContext';
import { PageSkeleton } from './components/common/LoadingStates';

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
import { AboutPage, ContactPage, SupportPage } from './components/common/SupportPages';
import { AdminPortal } from './components/admin/AdminPortal';

function AppLayout() {
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = React.useState(false);
  const { storeSettings } = useStore();
  const location = useLocation();
  const siteIsPaused = storeSettings.maintenanceMode && location.pathname !== '/admin';

  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <>
        <Helmet>
          <html lang="en" />
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>CR Cosmetics & Essential • Operations Command Center</title>
        </Helmet>
        <ErrorBoundary>
          <Routes>
            <Route path="/admin/*" element={<AdminPortal />} />
            <Route path="/admin" element={<AdminPortal />} />
          </Routes>
        </ErrorBoundary>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <html lang="en" className="scroll-smooth" />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
      </Helmet>

      <SEO />

      <ErrorBoundary>
        <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] font-sans selection:bg-[#C86D51] selection:text-white transition-colors">
          <Header
            onOpenCart={() => setIsCartOpen(true)}
            onOpenWishlist={() => setIsWishlistOpen(true)}
          />

          <main className="flex-1">
            {siteIsPaused ? (
              <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center px-6 text-center">
                <p className="text-xs font-bold uppercase tracking-[.2em] text-[#8A3D52]">Temporarily unavailable</p>
                <h1 className="mt-4 font-serif text-4xl">We are making a few improvements.</h1>
                <p className="mt-4 text-sm leading-6 text-stone-500">
                  {storeSettings.storeName} will be back shortly. Please contact us through WhatsApp for assistance.
                </p>
              </div>
            ) : (
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
                <Route path="/support" element={<SupportPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/offers" element={<ShopCatalogPage />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            )}
          </main>

          <Footer />

          <CartDrawerComponent isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          <WishlistModal isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
        </div>
      </ErrorBoundary>
    </>
  );
}

export default function App() {
  return <AppLayout />;
}