import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { ReviewsProvider } from './context/ReviewsContext';

// Types
import { CategoryType, Product, Order } from './types';

// Components
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { StoreHero } from './components/home/StoreHero';
import { CategoryCarousel } from './components/home/CategoryCarousel';
import { BentoPromoBanners } from './components/home/BentoPromoBanners';
import { BestSellersSection } from './components/home/BestSellersSection';
import { TrustBar } from './components/home/TrustBar';
import { StoreCatalog } from './components/shop/StoreCatalog';

// Modals & Views
import { ProductDetailModal } from './components/product/ProductDetailModal';
import { BeautyMatchModal } from './components/quiz/BeautyMatchModal';
import { CartDrawer } from './components/common/CartDrawer';
import { WishlistModal } from './components/common/WishlistModal';
import { StoreInfoModal } from './components/common/StoreInfoModal';
import { CheckoutView } from './components/checkout/CheckoutView';
import { OrderConfirmationView } from './components/checkout/OrderConfirmationView';
import { AccountView } from './components/account/AccountView';
import { AdminPortal } from './components/admin/AdminPortal';
import { AdminLoginView } from './components/admin/AdminLoginView';

// WhatsApp Floating Action Button
import { MessageCircle } from 'lucide-react';

type MainView = 'home' | 'checkout' | 'confirmation' | 'account' | 'admin';

function checkIsAdminUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return (
    path === '/admin' || 
    path === '/admin/' || 
    path.startsWith('/admin') || 
    hash === '#admin' || 
    hash === '#/admin'
  );
}

function MainStoreContent() {
  const { adminSession, storeSettings } = useStore();
  
  // Initialize view from URL
  const [currentView, setCurrentView] = useState<MainView>(() => {
    return checkIsAdminUrl() ? 'admin' : 'home';
  });

  const [currentCategory, setCurrentCategory] = useState<CategoryType>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('All Brands');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Customer Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isStoreInfoOpen, setIsStoreInfoOpen] = useState(false);
  const [storeInfoTab, setStoreInfoTab] = useState<'about' | 'delivery' | 'faqs' | 'contact'>('about');
  const [isMatchFinderOpen, setIsMatchFinderOpen] = useState(false);

  // Listen to browser URL changes for /admin or #admin
  useEffect(() => {
    const handleUrlChange = () => {
      if (checkIsAdminUrl()) {
        setCurrentView('admin');
      } else if (currentView === 'admin') {
        setCurrentView('home');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [currentView]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  const handleReturnToStore = useCallback(() => {
    setCurrentView('home');
    if (window.location.pathname.startsWith('/admin')) {
      window.history.pushState({}, '', '/');
    }
    if (window.location.hash.includes('admin')) {
      window.history.pushState({}, '', window.location.pathname);
    }
  }, []);

  const handleSelectCategory = (cat: CategoryType) => {
    setCurrentCategory(cat);
    setCurrentView('home');
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectBrand = (brand: string) => {
    setSelectedBrand(brand);
    setCurrentView('home');
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShopNow = () => {
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOrderSuccess = (order: Order) => {
    setCompletedOrder(order);
    setCurrentView('confirmation');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F8] text-gray-900 font-sans selection:bg-[#8A3D52] selection:text-white">
      
      {/* Top Header for Storefront */}
      {currentView !== 'admin' && (
        <Header
          currentCategory={currentCategory}
          onSelectCategory={handleSelectCategory}
          selectedBrand={selectedBrand}
          onSelectBrand={handleSelectBrand}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenProductDetails={product => setSelectedProduct(product)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenAccount={() => setCurrentView('account')}
          onOpenMatchFinder={() => setIsMatchFinderOpen(true)}
          onOpenAbout={() => {
            setStoreInfoTab('about');
            setIsStoreInfoOpen(true);
          }}
          onGoHome={() => {
            setCurrentView('home');
            setCurrentCategory('all');
            setSelectedBrand('All Brands');
            setSearchQuery('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Main View Area */}
      <main className="flex-1">
        
        {/* Administrator Portal accessed via /admin */}
        {currentView === 'admin' && (
          adminSession.isLoggedIn ? (
            <AdminPortal
              onReturnToStore={handleReturnToStore}
            />
          ) : (
            <AdminLoginView
              onLoginSuccess={() => {}}
              onReturnToStore={handleReturnToStore}
            />
          )
        )}

        {/* Storefront Home View */}
        {currentView === 'home' && (
          <>
            {!searchQuery && currentCategory === 'all' && selectedBrand === 'All Brands' ? (
              <>
                {/* 1. Hero Section */}
                <StoreHero
                  onShopNow={handleShopNow}
                  onExplore={() => setIsMatchFinderOpen(true)}
                  onSelectCategory={handleSelectCategory}
                />

                {/* 2. Shop By Category Carousel with 6 Cards */}
                <CategoryCarousel
                  currentCategory={currentCategory}
                  onSelectCategory={handleSelectCategory}
                />

                {/* 3. 3 Bento Promotional Banners */}
                <BentoPromoBanners
                  onShopNewArrivals={() => handleSelectCategory('new-arrivals')}
                  onOpenMatchFinder={() => setIsMatchFinderOpen(true)}
                  onDiscoverExclusive={() => handleSelectBrand('CR Exclusive')}
                />

                {/* 4. Best Sellers Section */}
                <BestSellersSection
                  onOpenDetails={product => setSelectedProduct(product)}
                  onViewAllProducts={handleShopNow}
                />

                {/* 5. Trust Bar */}
                <TrustBar />

                {/* 6. Full Catalog */}
                <StoreCatalog
                  currentCategory={currentCategory}
                  onSelectCategory={handleSelectCategory}
                  selectedBrand={selectedBrand}
                  onSelectBrand={handleSelectBrand}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onOpenProductDetails={product => setSelectedProduct(product)}
                />
              </>
            ) : (
              <StoreCatalog
                currentCategory={currentCategory}
                onSelectCategory={handleSelectCategory}
                selectedBrand={selectedBrand}
                onSelectBrand={handleSelectBrand}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onOpenProductDetails={product => setSelectedProduct(product)}
              />
            )}
          </>
        )}

        {/* Checkout Flow */}
        {currentView === 'checkout' && (
          <CheckoutView
            onBackToShop={() => setCurrentView('home')}
            onOrderComplete={handleOrderSuccess}
          />
        )}

        {/* Order Confirmation */}
        {currentView === 'confirmation' && completedOrder && (
          <OrderConfirmationView
            order={completedOrder}
            onContinueShopping={() => {
              setCurrentView('home');
              setCurrentCategory('all');
            }}
          />
        )}

        {/* User Account / Orders View */}
        {currentView === 'account' && (
          <AccountView
            onBackToShop={() => setCurrentView('home')}
          />
        )}
      </main>

      {/* Footer with 4 columns + Copyright (Clean of admin links) */}
      {currentView !== 'admin' && (
        <Footer
          onOpenStoreInfo={() => {
            setStoreInfoTab('delivery');
            setIsStoreInfoOpen(true);
          }}
          onOpenFAQs={() => {
            setStoreInfoTab('faqs');
            setIsStoreInfoOpen(true);
          }}
          onOpenContact={() => {
            setStoreInfoTab('contact');
            setIsStoreInfoOpen(true);
          }}
        />
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSelectRelated={prod => setSelectedProduct(prod)}
      />

      {/* Beauty Match Finder Modal */}
      <BeautyMatchModal
        isOpen={isMatchFinderOpen}
        onClose={() => setIsMatchFinderOpen(false)}
        onSelectProduct={prod => {
          setIsMatchFinderOpen(false);
          setSelectedProduct(prod);
        }}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          setCurrentView('checkout');
        }}
      />

      {/* Wishlist Drawer */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        onSelectProduct={prod => setSelectedProduct(prod)}
      />

      {/* Store Info & FAQs Modal */}
      <StoreInfoModal
        isOpen={isStoreInfoOpen}
        onClose={() => setIsStoreInfoOpen(false)}
        initialTab={storeInfoTab}
      />

      {/* Floating WhatsApp Quick Order Button */}
      {currentView !== 'admin' && (
        <a
          href={`https://wa.me/${storeSettings.whatsappNumber || '233551234567'}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Order or Chat on WhatsApp"
          className="fixed bottom-5 right-5 z-30 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2 group cursor-pointer"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold uppercase tracking-wider pr-1">
            WhatsApp Order
          </span>
        </a>
      )}

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
                  <MainStoreContent />
                </ReviewsProvider>
              </ToastProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
