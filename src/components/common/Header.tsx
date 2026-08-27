import React, { useState } from 'react';
import { CategoryType } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useStore } from '../../context/StoreContext';
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
  Lock
} from 'lucide-react';

interface HeaderProps {
  currentCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
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
    <header className="sticky top-0 z-40 bg-white shadow-xs select-none">
      {/* 2. MAIN HEADER NAVIGATION BAR */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Hamburger & Desktop Links */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-gray-900 rounded-lg cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <nav className="hidden lg:flex items-center gap-6 text-xs font-bold tracking-widest text-gray-700 uppercase">
              <button
                onClick={onGoHome}
                className={`transition-colors hover:text-[#8A3D52] cursor-pointer ${
                  currentCategory === 'all' && selectedBrand === 'All Brands' && !searchQuery ? 'text-[#8A3D52] font-black' : ''
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
                  className="flex items-center gap-1 hover:text-[#8A3D52] transition-colors py-1 cursor-pointer"
                >
                  <span>SHOP</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {isShopDropdownOpen && (
                  <div className="absolute top-full left-0 w-48 bg-white border border-gray-100 shadow-xl rounded-xl p-2 py-2 space-y-1 animate-fadeIn z-50 text-xs normal-case">
                    <button
                      onClick={() => handleCategoryClick('all')}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-gray-800 font-semibold hover:text-[#8A3D52] flex items-center justify-between cursor-pointer"
                    >
                      <span>All Products</span>
                      <span className="text-[10px] text-gray-400">View all</span>
                    </button>
                    <button
                      onClick={() => handleCategoryClick('new-arrivals')}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-gray-800 font-semibold hover:text-[#8A3D52] flex items-center justify-between cursor-pointer"
                    >
                      <span>New Arrivals</span>
                      <span className="text-[9px] bg-rose-100 text-[#8A3D52] px-1.5 py-0.5 rounded font-bold">New</span>
                    </button>
                    <button
                      onClick={() => handleCategoryClick('best-sellers')}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-gray-800 font-semibold hover:text-[#8A3D52] flex items-center justify-between cursor-pointer"
                    >
                      <span>Best Sellers</span>
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">Hot</span>
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
                  className={`flex items-center gap-1 hover:text-[#8A3D52] transition-colors py-1 cursor-pointer ${
                    currentCategory !== 'all' ? 'text-[#8A3D52]' : ''
                  }`}
                >
                  <span>CATEGORIES</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {isCategoryDropdownOpen && (
                  <div className="absolute top-full left-0 w-52 bg-white border border-gray-100 shadow-xl rounded-xl p-2 py-2 space-y-1 animate-fadeIn z-50 text-xs normal-case">
                    <button onClick={() => handleCategoryClick('skincare')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-gray-800 font-semibold hover:text-[#8A3D52] cursor-pointer">
                      🧴 Skincare
                    </button>
                    <button onClick={() => handleCategoryClick('makeup')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-gray-800 font-semibold hover:text-[#8A3D52] cursor-pointer">
                      💄 Makeup
                    </button>
                    <button onClick={() => handleCategoryClick('fragrances')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-gray-800 font-semibold hover:text-[#8A3D52] cursor-pointer">
                      ✨ Fragrances
                    </button>
                    <button onClick={() => handleCategoryClick('body-care')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-gray-800 font-semibold hover:text-[#8A3D52] cursor-pointer">
                      🫧 Body Care
                    </button>
                    <button onClick={() => handleCategoryClick('beauty-essentials')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-gray-800 font-semibold hover:text-[#8A3D52] cursor-pointer">
                      🖌️ Beauty Essentials
                    </button>
                    <button onClick={() => handleCategoryClick('everyday-essentials')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-gray-800 font-semibold hover:text-[#8A3D52] cursor-pointer">
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
                  className={`flex items-center gap-1 hover:text-[#8A3D52] transition-colors py-1 cursor-pointer ${
                    selectedBrand !== 'All Brands' ? 'text-[#8A3D52]' : ''
                  }`}
                >
                  <span>BRANDS</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {isBrandsDropdownOpen && (
                  <div className="absolute top-full left-0 w-48 bg-white border border-gray-100 shadow-xl rounded-xl p-2 py-2 space-y-1 animate-fadeIn z-50 text-xs normal-case max-h-80 overflow-y-auto">
                    {brands.map(brand => (
                      <button
                        key={brand}
                        onClick={() => handleBrandClick(brand)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          selectedBrand === brand ? 'bg-rose-50 text-[#8A3D52] font-bold' : 'text-gray-700 hover:bg-gray-50'
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
                className="hover:text-[#8A3D52] transition-colors cursor-pointer"
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
            <span className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tighter text-gray-900 leading-none">
              CR
            </span>

            {/* Subtext: COSMETICS & ESSENTIAL */}
            <span className="tracking-[0.25em] text-[9px] sm:text-[10px] font-extrabold text-gray-800 uppercase mt-0.5">
              COSMETICS & ESSENTIAL
            </span>

            {/* Script subtext: Beauty · Care · Essentials */}
            <span className="font-serif italic text-[11px] sm:text-xs text-[#8A3D52] tracking-wide mt-0.5">
              Beauty · Care · Essentials
            </span>
          </div>

          {/* Right Action Icons: Search, User, Wishlist, Cart */}
          <div className="flex items-center gap-1.5 sm:gap-3 text-gray-700">
            
            {/* Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:text-[#8A3D52] hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
              aria-label="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User Account */}
            <button
              onClick={onOpenAccount}
              className="p-2 hover:text-[#8A3D52] hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
              aria-label="My Account & Orders"
            >
              <User className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              className="p-2 hover:text-[#8A3D52] hover:bg-rose-50 rounded-full transition-colors relative cursor-pointer"
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
              className="p-2 hover:text-[#8A3D52] hover:bg-rose-50 rounded-full transition-colors relative cursor-pointer"
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

        {/* Inline Expandable Search Bar */}
        {isSearchOpen && (
          <div className="border-t border-gray-100 bg-[#FDF9F8] py-3 px-4 sm:px-6 animate-fadeIn">
            <div className="max-w-3xl mx-auto flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => onSearchChange(e.target.value)}
                  placeholder="Search The Ordinary, CeraVe, perfumes, lipsticks, shea butter..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8A3D52]"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-xs font-bold text-gray-600 hover:text-gray-900 px-3 py-1.5 cursor-pointer"
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
          <div className="w-72 max-w-full bg-white h-full p-5 overflow-y-auto flex flex-col justify-between shadow-2xl animate-slideRight">
            <div className="space-y-6">
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-[#C5A059] fill-current" />
                  <span className="font-serif font-black text-sm tracking-wider">CR COSMETICS</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-2 text-xs font-bold uppercase tracking-wider text-gray-700">
                <button
                  onClick={() => {
                    onGoHome();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 hover:text-[#8A3D52] cursor-pointer"
                >
                  HOME
                </button>

                <div className="py-2 border-t border-gray-100 space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold">Categories</span>
                  <button onClick={() => handleCategoryClick('makeup')} className="w-full text-left py-1.5 text-gray-800 hover:text-[#8A3D52] cursor-pointer">
                    💄 Makeup
                  </button>
                  <button onClick={() => handleCategoryClick('skincare')} className="w-full text-left py-1.5 text-gray-800 hover:text-[#8A3D52] cursor-pointer">
                    🧴 Skincare
                  </button>
                  <button onClick={() => handleCategoryClick('fragrances')} className="w-full text-left py-1.5 text-gray-800 hover:text-[#8A3D52] cursor-pointer">
                    ✨ Fragrances
                  </button>
                  <button onClick={() => handleCategoryClick('body-care')} className="w-full text-left py-1.5 text-gray-800 hover:text-[#8A3D52] cursor-pointer">
                    🫧 Body Care
                  </button>
                  <button onClick={() => handleCategoryClick('beauty-essentials')} className="w-full text-left py-1.5 text-gray-800 hover:text-[#8A3D52] cursor-pointer">
                    🖌️ Beauty Essentials
                  </button>
                  <button onClick={() => handleCategoryClick('everyday-essentials')} className="w-full text-left py-1.5 text-gray-800 hover:text-[#8A3D52] cursor-pointer">
                    🧺 Everyday Essentials
                  </button>
                </div>

                <div className="py-2 border-t border-gray-100 space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold">Explore</span>
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenMatchFinder();
                    }}
                    className="w-full text-left py-1.5 text-[#8A3D52] flex items-center gap-1.5 font-bold cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Find Your Perfect Match</span>
                  </button>
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAbout();
                    }}
                    className="w-full text-left py-1.5 text-gray-700 cursor-pointer"
                  >
                    About Us
                  </button>
                </div>
              </nav>

            </div>

            <div className="pt-6 border-t border-gray-100 text-center space-y-2 text-xs">
              <a
                href={`https://wa.me/${storeSettings.whatsappNumber || '233551234567'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-[#8A3D52] text-white rounded-lg font-bold flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: {storeSettings.storePhone}</span>
              </a>
              <p className="text-gray-400 text-[10px]">{storeSettings.storeAddress}</p>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

    </header>
  );
};
