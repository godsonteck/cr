import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  ShoppingBag, 
  Heart,
  User,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  ShoppingBasket,
  PhoneCall,
  Sun,
  Moon
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';
import { CATEGORIES_CONFIG } from '../../data/products';
import { DepartmentType } from '../../types';
import logoImg from '../../assets/logo.jpeg';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenWishlist: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart, onOpenWishlist }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const { wishlistIds } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const { storeSettings } = useStore();
  const { isDarkMode, toggleTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDepartmentTab, setActiveDepartmentTab] = useState<DepartmentType>('beauty');
  const [searchInput, setSearchInput] = useState('');

  const beautyCategories = CATEGORIES_CONFIG.filter(c => c.department === 'beauty');
  const groceryCategories = CATEGORIES_CONFIG.filter(c => c.department === 'groceries');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#141211] border-b border-[#E8E2DA] dark:border-[#2A2725] transition-colors font-sans">
      {/* Top Utility Announcement Bar */}
      {storeSettings.announcementVisible && storeSettings.announcementText && (
        <div className="bg-[#1C1817] text-stone-200 text-xs py-2 px-4 border-b border-stone-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-[#C86D51] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                Ghana Express
              </span>
              <span>{storeSettings.announcementText}</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-stone-400 text-[11px]">
              <a href={`tel:${storeSettings.storePhone}`} className="hover:text-white flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{storeSettings.storePhone}</span>
              </a>
              <span>•</span>
              <span className="text-amber-300 font-semibold">Free Accra Shipping over GHS {storeSettings.freeDeliveryThreshold}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Retail Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-6">

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-[#1C1817] dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Logo & Retail Identity */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="CR Cosmetics & Essentials"
              className="h-10 sm:h-12 w-auto object-contain rounded"
            />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-extrabold text-[#1C1817] dark:text-stone-100 uppercase tracking-tight font-sans">
                CR <span className="text-[#C86D51]">COSMETICS</span>
              </span>
              <span className="text-[9px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">
                &amp; ESSENTIALS
              </span>
            </div>
          </Link>

          {/* Department Navigation Tabs (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 border-l border-r border-[#E8E2DA] dark:border-[#2A2725] px-6 py-1">
            <Link
              to="/beauty"
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-2 ${
                location.pathname.startsWith('/beauty')
                  ? 'bg-[#1C1817] text-white'
                  : 'text-stone-600 dark:text-stone-300 hover:text-[#1C1817] dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C86D51]" />
              Beauty &amp; Skincare
            </Link>
            <Link
              to="/groceries"
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-2 ${
                location.pathname.startsWith('/groceries')
                  ? 'bg-[#4A5D4E] text-white'
                  : 'text-stone-600 dark:text-stone-300 hover:text-[#1C1817] dark:hover:text-white'
              }`}
            >
              <ShoppingBasket className="w-3.5 h-3.5 text-amber-300" />
              Groceries &amp; Essentials
            </Link>
          </div>

          {/* Predictive Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-sm relative">
            <input
              type="text"
              placeholder="Search products, brands, ingredients..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-[#F5F2EC] dark:bg-[#1C1A19] text-xs pl-9 pr-4 py-2.5 rounded border border-[#E8E2DA] dark:border-[#2A2725] focus:outline-none focus:border-[#C86D51]"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </form>

          {/* Retail Actions (Theme, Wishlist, Account, Cart) */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={onOpenWishlist}
              className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C86D51] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            <Link
              to={isAuthenticated ? "/account" : "/signin"}
              className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors flex items-center gap-1.5"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
              {isAuthenticated && (
                <span className="hidden xl:inline text-xs font-bold text-[#1C1817] dark:text-stone-200">
                  {user?.fullName.split(' ')[0]}
                </span>
              )}
            </Link>

            <button
              onClick={onOpenCart}
              className="bg-[#1C1817] dark:bg-stone-100 text-white dark:text-[#1C1817] px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 hover:bg-[#342F2D] dark:hover:bg-white transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-[#C86D51] text-white text-[11px] font-extrabold px-1.5 py-0.5 rounded">
                {totalItems}
              </span>
            </button>
          </div>

        </div>

        {/* Category Sub-Bar */}
        <div className="hidden lg:flex items-center justify-between py-2.5 border-t border-[#E8E2DA] dark:border-[#2A2725] text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
          <div className="flex items-center gap-8">
            <Link to="/shop" className="hover:text-[#1C1817] dark:hover:text-white">All Catalog</Link>
            <Link to="/beauty" className="hover:text-[#C86D51]">Beauty Storefront</Link>
            <Link to="/groceries" className="hover:text-[#4A5D4E]">Grocery Storefront</Link>
            <Link to="/routine-builder" className="text-[#C86D51] hover:underline flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Skincare Routine Builder
            </Link>
            <Link to="/offers" className="hover:text-[#1C1817] dark:hover:text-white">Deals &amp; Offers</Link>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-[#1C1817] dark:hover:text-white">About Brand</Link>
            <Link to="/contact" className="hover:text-[#1C1817] dark:hover:text-white">Customer Service</Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-white dark:bg-[#141211] h-full flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2DA] dark:border-[#2A2725]">
              <span className="text-base font-extrabold uppercase">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="mt-4 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-[#F5F2EC] dark:bg-[#1C1A19] text-xs pl-9 pr-4 py-2.5 rounded border border-[#E8E2DA]"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </form>

            <div className="flex gap-2 mt-6 p-1 bg-[#F5F2EC] dark:bg-[#1C1A19] rounded">
              <button
                onClick={() => setActiveDepartmentTab('beauty')}
                className={`flex-1 py-2 text-xs font-bold uppercase rounded ${
                  activeDepartmentTab === 'beauty' ? 'bg-[#1C1817] text-white' : 'text-stone-500'
                }`}
              >
                Beauty
              </button>
              <button
                onClick={() => setActiveDepartmentTab('groceries')}
                className={`flex-1 py-2 text-xs font-bold uppercase rounded ${
                  activeDepartmentTab === 'groceries' ? 'bg-[#4A5D4E] text-white' : 'text-stone-500'
                }`}
              >
                Groceries
              </button>
            </div>

            <div className="mt-6 flex-1 space-y-2">
              {(activeDepartmentTab === 'beauty' ? beautyCategories : groceryCategories).map(cat => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-sm font-semibold rounded"
                >
                  <span>{cat.name}</span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </Link>
              ))}

              <hr className="my-4 border-[#E8E2DA] dark:border-[#2A2725]" />
              <Link to="/routine-builder" onClick={() => setIsMobileMenuOpen(false)} className="block p-2.5 text-sm font-bold text-[#C86D51]">
                Routine Builder
              </Link>
              <Link to="/offers" onClick={() => setIsMobileMenuOpen(false)} className="block p-2.5 text-sm font-semibold">
                Promotions
              </Link>
              <Link to="/account" onClick={() => setIsMobileMenuOpen(false)} className="block p-2.5 text-sm font-semibold">
                My Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
