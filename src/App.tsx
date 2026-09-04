import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ErrorBoundary from './components/common/ErrorBoundary';
import { SEO } from './components/common/SEO';
import { useStore } from './context/StoreContext';
import { PageSkeleton, StorefrontSkeleton } from './components/common/LoadingStates';

// Components
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CartDrawerComponent } from './components/common/CartDrawerComponent';
import { WishlistModal } from './components/common/WishlistModal';
import { HomePage } from './components/home/DepartmentStorefronts';
const BeautyDepartmentPage = lazy(() => import('./components/home/DepartmentPages').then(module => ({ default: module.BeautyDepartmentPage })));
const GroceryDepartmentPage = lazy(() => import('./components/home/DepartmentPages').then(module => ({ default: module.GroceryDepartmentPage })));

// Views

const ShopCatalogPage = lazy(() => import('./components/shop/CatalogAndSearch').then(module => ({ default: module.ShopCatalogPage })));
const SearchResultsPage = lazy(() => import('./components/shop/CatalogAndSearch').then(module => ({ default: module.SearchResultsPage })));
const ProductDetailPage = lazy(() => import('./components/product/ProductDetailAndRoutine').then(module => ({ default: module.ProductDetailPage })));
const RoutineBuilderPage = lazy(() => import('./components/product/ProductDetailAndRoutine').then(module => ({ default: module.RoutineBuilderPage })));
const AccountPage = lazy(() => import('./components/account/AccountAndAuth').then(module => ({ default: module.AccountPage })));
const SignInPage = lazy(() => import('./components/account/AccountAndAuth').then(module => ({ default: module.SignInPage })));
const SignUpPage = lazy(() => import('./components/account/AccountAndAuth').then(module => ({ default: module.SignUpPage })));
const AboutPage = lazy(() => import('./components/common/SupportPages').then(module => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import('./components/common/SupportPages').then(module => ({ default: module.ContactPage })));
const SupportPage = lazy(() => import('./components/common/SupportPages').then(module => ({ default: module.SupportPage })));
const FullCartPage = lazy(() => import('./components/checkout/CartAndCheckout').then(module => ({ default: module.FullCartPage })));
const MultiStepCheckoutPage = lazy(() => import('./components/checkout/CartAndCheckout').then(module => ({ default: module.MultiStepCheckoutPage })));
const OrderConfirmationPage = lazy(() => import('./components/checkout/CartAndCheckout').then(module => ({ default: module.OrderConfirmationPage })));

// Lazy-loaded Admin Command Center
const AdminPortal = lazy(() => import('./components/admin/AdminPortal').then(m => ({ default: m.AdminPortal })));

function AppLayout() {
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = React.useState(false);
  const { storeSettings } = useStore();
  const location = useLocation();
  const siteIsPaused = storeSettings.maintenanceMode && location.pathname !== '/admin';

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  const pageVisibility = storeSettings.pageVisibility || {
    home: true,
    beauty: true,
    groceries: true,
    shop: true,
    products: true,
    search: true,
    account: true,
    checkout: true,
    about: true,
    support: true,
    contact: true,
    offers: true,
  };

  const renderUnavailable = (label: string) => (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center px-6 text-center">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#8A3D52]">Temporarily unavailable</p>
      <h1 className="mt-4 font-serif text-4xl">{label}</h1>
      <p className="mt-4 text-sm leading-6 text-stone-500">
        This section has been temporarily disabled by the admin and will be restored when it is ready.
      </p>
    </div>
  );

  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <>
        <Helmet>
          <html lang="en" />
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>CR Cosmetics and Essential • Operations Command Center</title>
        </Helmet>
        <ErrorBoundary>
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              <Route path="/admin/*" element={<AdminPortal />} />
              <Route path="/admin" element={<AdminPortal />} />
            </Routes>
          </Suspense>
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
      </Helmet>

      <SEO />

      <ErrorBoundary>
        <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] font-sans selection:bg-[#C86D51] selection:text-white transition-colors">
          <Header
            onOpenCart={() => setIsCartOpen(true)}
            onOpenWishlist={() => setIsWishlistOpen(true)}
          />

          <main className="flex-1 pt-[6rem] md:pt-[6.75rem]">
            {siteIsPaused ? (
              <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center px-6 text-center">
                <p className="text-xs font-bold uppercase tracking-[.2em] text-[#8A3D52]">Temporarily unavailable</p>
                <h1 className="mt-4 font-serif text-4xl">We are making a few improvements.</h1>
                <p className="mt-4 text-sm leading-6 text-stone-500">
                  {storeSettings.storeName} will be back shortly. Please contact us through WhatsApp for assistance.
                </p>
              </div>
            ) : (
              <Suspense fallback={<StorefrontSkeleton />}>
                <Routes>
                <Route path="/" element={pageVisibility.home ? <HomePage /> : renderUnavailable('Home page is currently offline')} />
                <Route path="/beauty" element={pageVisibility.beauty ? <BeautyDepartmentPage /> : renderUnavailable('Beauty collection is currently offline')} />
                <Route path="/groceries" element={pageVisibility.groceries ? <GroceryDepartmentPage /> : renderUnavailable('Groceries collection is currently offline')} />
                <Route path="/shop" element={pageVisibility.shop ? <ShopCatalogPage /> : renderUnavailable('Shop is currently offline')} />
                <Route path="/category/:categorySlug" element={pageVisibility.shop ? <ShopCatalogPage /> : renderUnavailable('Shop is currently offline')} />
                <Route path="/product/:productId" element={pageVisibility.products ? <ProductDetailPage /> : renderUnavailable('Product details are currently offline')} />
                <Route path="/search" element={pageVisibility.search ? <SearchResultsPage /> : renderUnavailable('Search is currently offline')} />
                <Route path="/routine-builder" element={pageVisibility.routineBuilder ? <RoutineBuilderPage /> : renderUnavailable('Routine builder is currently offline')} />

                <Route path="/cart" element={pageVisibility.shop ? <FullCartPage /> : renderUnavailable('Shopping cart is currently offline')} />
                <Route path="/checkout" element={pageVisibility.checkout ? <MultiStepCheckoutPage /> : renderUnavailable('Checkout is temporarily closed')} />
                <Route path="/order-confirmation/:orderId" element={pageVisibility.checkout ? <OrderConfirmationPage /> : renderUnavailable('Order confirmation is temporarily unavailable')} />

                <Route path="/account" element={pageVisibility.account ? <AccountPage /> : renderUnavailable('Account area is currently offline')} />
                <Route path="/account/orders" element={pageVisibility.account ? <AccountPage /> : renderUnavailable('Account area is currently offline')} />
                <Route path="/signin" element={pageVisibility.account ? <SignInPage /> : renderUnavailable('Sign in is currently offline')} />
                <Route path="/signup" element={pageVisibility.account ? <SignUpPage /> : renderUnavailable('Sign up is currently offline')} />

                <Route path="/about" element={pageVisibility.about ? <AboutPage /> : renderUnavailable('About page is currently offline')} />
                <Route path="/support" element={pageVisibility.support ? <SupportPage /> : renderUnavailable('Support page is currently offline')} />
                <Route path="/contact" element={pageVisibility.contact ? <ContactPage /> : renderUnavailable('Contact page is currently offline')} />
                <Route path="/offers" element={pageVisibility.offers ? <ShopCatalogPage /> : renderUnavailable('Offers are currently closed')} />

                <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
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