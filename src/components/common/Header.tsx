import React, { useState } from 'react';
import { CategoryType, Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';
import { PredictiveSearchBar } from '../shop/PredictiveSearchBar';
import { 
  MessageCircle, 
  Search, 
  User, 
  Heart, 
  ShoppingBag, 
  ChevronDown, 
  Crown,
  Menu,
  X,
  Sparkles,
  Lock,
  Sun,
  Moon
} from 'lucide-react';

interface HeaderProps {
  currentCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenProductDetails?: (product: Product) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAccount: () => void;
  onOpenMatchFinder: () => void;
  onOpenAbout: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  selectedBrand,
  onSelectBrand,
  searchQuery,
  onSearchChange,
  onOpenProductDetails,
  onOpenCart,
  onOpenWishlist,
  onOpenAccount,
  onOpenMatchFinder,
  onOpenAbout,
  onGoHome
}) => {
  const { totalItemsCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { storeSettings, brands } = useStore();
  const { isDark, toggleTheme } = useTheme();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isBrandsDropdownOpen, setIsBrandsDropdownOpen] = useState(false);

  const handleCategoryClick = (cat: CategoryType) => {
    onSelectCategory(cat);
    setIsCategoryDropdownOpen(false);
    setIsShopDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleBrandClick = (brand: string) => {
    onSelectBrand(brand);
    setIsBrandsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#121318] shadow-xs select-none border-b border-transparent dark:border-gray-800 transition-colors duration-200">
      {/* 2. MAIN HEADER NAVIGATION BAR */}
      <div className="border-b border-gray-100 dark:border-gray-800/80 bg-white dark:bg-[#121318] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Hamburger & Desktop Links */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white rounded-lg cursor-pointer transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <nav className="hidden lg:flex items-center gap-6 text-xs font-bold tracking-widest text-gray-700 dark:text-gray-300 uppercase">
              <button
                onClick={onGoHome}
                className={`transition-colors hover:text-[#8A3D52] dark:hover:text-rose-400 cursor-pointer ${
                  currentCategory === 'all' && selectedBrand === 'All Brands' && !searchQuery ? 'text-[#8A3D52] dark:text-rose-400 font-black' : ''
                }`}
              >
                HOME
              </button>

              {/* SHOP Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setIsShopDropdownOpen(true)}
                onMouseLeave={() => setIsShopDropdownOpen(false)}
              >
                <button
                  onClick={() => handleCategoryClick('all')}
                  className="flex items-center gap-1 hover:text-[#8A3D52] dark:hover:text-rose-400 transition-colors py-1 cursor-pointer"
                >
                  <span>SHOP</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                </button>

                {isShopDropdownOpen && (
                  <div className="absolute top-full left-0 w-48 bg-white dark:bg-[#1C1D26] border border-gray-100 dark:border-gray-800 shadow-xl rounded-xl p-2 py-2 space-y-1 animate-fadeIn z-50 text-xs normal-case">
                    <button
                      onClick={() => handleCategoryClick('all')}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-800 dark:text-gray-200 font-semibold hover:text-[#8A3D52] dark:hover:text-rose-300 flex items-center justify-between cursor-pointer"
                    >
                      <span>All Products</span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">View all</span>
                    </button>
                    <button
                      onClick={() => handleCategoryClick('new-arrivals')}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-800 dark:text-gray-200 font-semibold hover:text-[#8A3D52] dark:hover:text-rose-300 flex items-center justify-between cursor-pointer"
                    >
                      <span>New Arrivals</span>
                      <span className="text-[9px] bg-rose-100 dark:bg-rose-900/50 text-[#8A3D52] dark:text-rose-300 px-1.5 py-0.5 rounded font-bold">New</span>
                    </button>
                    <button
                      onClick={() => handleCategoryClick('best-sellers')}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-800 dark:text-gray-200 font-semibold hover:text-[#8A3D52] dark:hover:text-rose-300 flex items-center justify-between cursor-pointer"
                    >
                      <span>Best Sellers</span>
                      <span className="text-[9px] bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold">Hot</span>
                    </button>
                  </div>
                )}
              </div>

              {/* CATEGORIES Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setIsCategoryDropdownOpen(true)}
                onMouseLeave={() => setIsCategoryDropdownOpen(false)}
              >
                <button
                  onClick={() => handleCategoryClick('all')}
                  className={`flex items-center gap-1 hover:text-[#8A3D52] dark:hover:text-rose-400 transition-colors py-1 cursor-pointer ${
                    currentCategory !== 'all' ? 'text-[#8A3D52] dark:text-rose-400' : ''
                  }`}
                >
                  <span>CATEGORIES</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                </button>

                {isCategoryDropdownOpen && (
                  <div className="absolute top-full left-0 w-52 bg-white dark:bg-[#1C1D26] border border-gray-100 dark:border-gray-800 shadow-xl rounded-xl p-2 py-2 space-y-1 animate-fadeIn z-50 text-xs normal-case">
                    <button onClick={() => handleCategoryClick('skincare')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-800 dark:text-gray-200 font-semibold hover:text-[#8A3D52] dark:hover:text-rose-300 cursor-pointer">
                      🧴 Skincare
                    </button>
                    <button onClick={() => handleCategoryClick('makeup')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-800 dark:text-gray-200 font-semibold hover:text-[#8A3D52] dark:hover:text-rose-300 cursor-pointer">
                      💄 Makeup
                    </button>
                    <button onClick={() => handleCategoryClick('fragrances')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-800 dark:text-gray-200 font-semibold hover:text-[#8A3D52] dark:hover:text-rose-300 cursor-pointer">
                      ✨ Fragrances
                    </button>
                    <button onClick={() => handleCategoryClick('body-care')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-800 dark:text-gray-200 font-semibold hover:text-[#8A3D52] dark:hover:text-rose-300 cursor-pointer">
                      🫧 Body Care
                    </button>
                    <button onClick={() => handleCategoryClick('beauty-essentials')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-800 dark:text-gray-200 font-semibold hover:text-[#8A3D52] dark:hover:text-rose-300 cursor-pointer">
                      🖌️ Beauty Essentials
                    </button>
                    <button onClick={() => handleCategoryClick('everyday-essentials')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-800 dark:text-gray-200 font-semibold hover:text-[#8A3D52] dark:hover:text-rose-300 cursor-pointer">
                      🧺 Everyday Essentials
                    </button>
                  </div>
                )}
              </div>

              {/* BRANDS Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setIsBrandsDropdownOpen(true)}
                onMouseLeave={() => setIsBrandsDropdownOpen(false)}
              >
                <button
                  className={`flex items-center gap-1 hover:text-[#8A3D52] dark:hover:text-rose-400 transition-colors py-1 cursor-pointer ${
                    selectedBrand !== 'All Brands' ? 'text-[#8A3D52] dark:text-rose-400' : ''
                  }`}
                >
                  <span>BRANDS</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                </button>

                {isBrandsDropdownOpen && (
                  <div className="absolute top-full left-0 w-48 bg-white dark:bg-[#1C1D26] border border-gray-100 dark:border-gray-800 shadow-xl rounded-xl p-2 py-2 space-y-1 animate-fadeIn z-50 text-xs normal-case max-h-80 overflow-y-auto">
                    {brands.map(brand => (
                      <button
                        key={brand}
                        onClick={() => handleBrandClick(brand)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          selectedBrand === brand ? 'bg-rose-50 dark:bg-rose-950/50 text-[#8A3D52] dark:text-rose-300 font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={onOpenAbout}
                className="hover:text-[#8A3D52] dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                ABOUT US
              </button>
            </nav>
          </div>

          {/* Center: Exact CR Crown Logo */}
          <div 
            onClick={onGoHome}
            className="flex flex-col items-center justify-center cursor-pointer text-center group"
          >
            {/* Crown Icon */}
            <div className="text-[#C5A059] flex items-center justify-center mb-0.5 group-hover:scale-110 transition-transform">
              <Crown className="w-5 h-5 fill-current" />
            </div>

            {/* CR Monogram */}
            <span className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tighter text-gray-900 dark:text-white leading-none transition-colors">
              CR
            </span>

            {/* Subtext: COSMETICS & ESSENTIAL */}
            <span className="tracking-[0.25em] text-[9px] sm:text-[10px] font-extrabold text-gray-800 dark:text-gray-300 uppercase mt-0.5 transition-colors">
              COSMETICS & ESSENTIAL
            </span>

            {/* Script subtext: Beauty · Care · Essentials */}
            <span className="font-serif italic text-[11px] sm:text-xs text-[#8A3D52] dark:text-rose-400 tracking-wide mt-0.5 transition-colors">
              Beauty · Care · Essentials
            </span>
          </div>

          {/* Right Action Icons: Dark Mode Toggle, Search, User, Wishlist, Cart */}
          <div className="flex items-center gap-1 sm:gap-2 text-gray-700 dark:text-gray-300">
            
            {/* Global Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-200 hover:text-[#8A3D52] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full transition-colors cursor-pointer relative group"
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={isDark ? 'Switch to Light Mode (Day)' : 'Switch to Dark Mode (Night)'}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 hover:-rotate-12 transition-transform duration-300" />
              )}
              <span className="sr-only">Toggle theme</span>
            </button>

            {/* Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:text-[#8A3D52] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full transition-colors cursor-pointer"
              aria-label="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User Account */}
            <button
              onClick={onOpenAccount}
              className="p-2 hover:text-[#8A3D52] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full transition-colors cursor-pointer"
              aria-label="My Account & Orders"
            >
              <User className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              className="p-2 hover:text-[#8A3D52] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full transition-colors relative cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#8A3D52] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Bag */}
            <button
              onClick={onOpenCart}
              className="p-2 hover:text-[#8A3D52] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full transition-colors relative cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#8A3D52] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </button>

          </div>

        </div>

        {/* Inline Expandable Search Bar with Predictive Dropdown */}
        {isSearchOpen && (
          <div className="border-t border-gray-100 dark:border-gray-800 bg-[#FDF9F8] dark:bg-[#181920] py-3 px-4 sm:px-6 animate-fadeIn">
            <div className="max-w-3xl mx-auto flex items-center gap-3">
              <div className="flex-1">
                <PredictiveSearchBar
                  searchQuery={searchQuery}
                  onSearchChange={onSearchChange}
                  onSelectProduct={product => {
                    if (onOpenProductDetails) {
                      onOpenProductDetails(product);
                    }
                    setIsSearchOpen(false);
                  }}
                  onSelectCategory={cat => {
                    handleCategoryClick(cat);
                    setIsSearchOpen(false);
                  }}
                  onSelectBrand={brand => {
                    handleBrandClick(brand);
                    setIsSearchOpen(false);
                  }}
                  placeholder="Search The Ordinary, CeraVe, perfumes, lipsticks, shea butter..."
                  autoFocus
                />
              </div>

              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer shrink-0"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
          <div className="w-72 max-w-full bg-white dark:bg-[#16171E] h-full p-5 overflow-y-auto flex flex-col justify-between shadow-2xl animate-slideRight text-gray-900 dark:text-gray-100">
            <div className="space-y-6">
              
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-[#C5A059] fill-current" />
                  <span className="font-serif font-black text-sm tracking-wider">CR COSMETICS</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Dark Mode Switcher */}
              <div className="p-3 bg-gray-50 dark:bg-[#1E202A] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-200">
                  {isDark ? <Moon className="w-4 h-4 text-rose-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  <span>{isDark ? 'Dark Mode (Night)' : 'Light Mode (Day)'}</span>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-3 py-1 bg-white dark:bg-[#282A36] text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700 shadow-2xs text-[#8A3D52] dark:text-rose-400 cursor-pointer"
                >
                  Switch
                </button>
              </div>

              <nav className="space-y-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                <button
                  onClick={() => {
                    onGoHome();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 hover:text-[#8A3D52] dark:hover:text-rose-400 cursor-pointer"
                >
                  HOME
                </button>

                <div className="py-2 border-t border-gray-100 dark:border-gray-800 space-y-1">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest block font-bold">Categories</span>
                  <button onClick={() => handleCategoryClick('makeup')} className="w-full text-left py-1.5 text-gray-800 dark:text-gray-200 hover:text-[#8A3D52] dark:hover:text-rose-400 cursor-pointer">
                    💄 Makeup
                  </button>
                  <button onClick={() => handleCategoryClick('skincare')} className="w-full text-left py-1.5 text-gray-800 dark:text-gray-200 hover:text-[#8A3D52] dark:hover:text-rose-400 cursor-pointer">
                    🧴 Skincare
                  </button>
                  <button onClick={() => handleCategoryClick('fragrances')} className="w-full text-left py-1.5 text-gray-800 dark:text-gray-200 hover:text-[#8A3D52] dark:hover:text-rose-400 cursor-pointer">
                    ✨ Fragrances
                  </button>
                  <button onClick={() => handleCategoryClick('body-care')} className="w-full text-left py-1.5 text-gray-800 dark:text-gray-200 hover:text-[#8A3D52] dark:hover:text-rose-400 cursor-pointer">
                    🫧 Body Care
                  </button>
                  <button onClick={() => handleCategoryClick('beauty-essentials')} className="w-full text-left py-1.5 text-gray-800 dark:text-gray-200 hover:text-[#8A3D52] dark:hover:text-rose-400 cursor-pointer">
                    🖌️ Beauty Essentials
                  </button>
                  <button onClick={() => handleCategoryClick('everyday-essentials')} className="w-full text-left py-1.5 text-gray-800 dark:text-gray-200 hover:text-[#8A3D52] dark:hover:text-rose-400 cursor-pointer">
                    🧺 Everyday Essentials
                  </button>
                </div>

                <div className="py-2 border-t border-gray-100 dark:border-gray-800 space-y-1">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest block font-bold">Explore</span>
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenMatchFinder();
                    }}
                    className="w-full text-left py-1.5 text-[#8A3D52] dark:text-rose-400 flex items-center gap-1.5 font-bold cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Find Your Perfect Match</span>
                  </button>
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAbout();
                    }}
                    className="w-full text-left py-1.5 text-gray-700 dark:text-gray-300 hover:text-[#8A3D52] dark:hover:text-rose-400 cursor-pointer"
                  >
                    About Us
                  </button>
                </div>
              </nav>

            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 text-center space-y-2 text-xs">
              <a
                href={`https://wa.me/${storeSettings.whatsappNumber || '233551234567'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-[#8A3D52] hover:bg-[#732F42] text-white rounded-lg font-bold flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: {storeSettings.storePhone}</span>
              </a>
              <p className="text-gray-400 dark:text-gray-500 text-[10px]">{storeSettings.storeAddress}</p>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

    </header>
  );
};
