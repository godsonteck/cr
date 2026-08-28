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
    <header className="sticky top-0 z-40 bg-[#FDFBF7] dark:bg-[#12100F] border-b border-[#E6DFD7] dark:border-[#36322E] transition-colors">
      {/* Top Announcement Bar */}
      {storeSettings.announcementVisible && storeSettings.announcementText && (
        <div className="bg-[#1C1817] dark:bg-[#24211E] text-white py-1.5 px-4 text-xs font-medium tracking-wide">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 mx-auto md:mx-0">
              <span className="bg-[#C86D51] text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded">
                Ghana Express
              </span>
              <span>{storeSettings.announcementText}</span>
            </div>
            <div className="hidden md:flex items-center gap-4 text-stone-300">
              <a href={`tel:${storeSettings.storePhone}`} className="hover:text-white flex items-center gap-1">
                <PhoneCall className="w-3 h-3" />
                <span>{storeSettings.storePhone}</span>
              </a>
              <span>•</span>
              <span className="text-amber-300 font-semibold">Free Accra Delivery &gt; GHS {storeSettings.freeDeliveryThreshold}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#1C1817] dark:text-stone-200 hover:bg-[#F5F0EB] dark:hover:bg-stone-800 rounded-lg"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src={logoImg}
                alt="CR Cosmetics & Essentials"
                className="h-10 sm:h-12 w-auto object-contain rounded-md"
              />
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1C1817] dark:text-stone-100 uppercase font-sans">
                  CR <span className="text-[#C86D51]">COSMETICS</span>
                </span>
                <span className="text-[9px] tracking-[0.2em] font-bold text-[#6E6763] dark:text-stone-400 uppercase">
                  &amp; ESSENTIALS
                </span>
              </div>
            </Link>

            {/* Desktop Department Switcher */}
            <nav className="hidden lg:flex items-center gap-1 bg-[#F5F0EB] dark:bg-[#1C1917] p-1 rounded-full border border-[#E6DFD7] dark:border-[#36322E]">
              <Link
                to="/beauty"
                className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                  location.pathname.startsWith('/beauty')
                    ? 'bg-[#1C1817] text-white dark:bg-amber-100 dark:text-stone-950 shadow-sm'
                    : 'text-[#6E6763] hover:text-[#1C1817] dark:text-stone-400 dark:hover:text-stone-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C86D51]" />
                Beauty &amp; Skincare
              </Link>
              <Link
                to="/groceries"
                className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                  location.pathname.startsWith('/groceries')
                    ? 'bg-[#4A5D4E] text-white shadow-sm'
                    : 'text-[#6E6763] hover:text-[#1C1817] dark:text-stone-400 dark:hover:text-stone-200'
                }`}
              >
                <ShoppingBasket className="w-3.5 h-3.5 text-amber-300" />
                Groceries &amp; Essentials
              </Link>
            </nav>
          </div>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xs relative">
            <input
              type="text"
              placeholder="Search products, brands, ingredients..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-[#F5F0EB] dark:bg-[#1C1917] text-[#1C1817] dark:text-stone-200 text-xs pl-9 pr-4 py-2.5 rounded-full border border-[#E6DFD7] dark:border-[#36322E] focus:outline-none focus:border-[#C86D51] transition-colors placeholder:text-stone-400"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </form>

          {/* Action Icons (Account, Wishlist, Theme, Cart) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-[#6E6763] dark:text-stone-300 hover:text-[#1C1817] dark:hover:text-white rounded-full hover:bg-[#F5F0EB] dark:hover:bg-stone-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={onOpenWishlist}
              className="p-2 text-[#6E6763] dark:text-stone-300 hover:text-[#1C1817] dark:hover:text-white rounded-full hover:bg-[#F5F0EB] dark:hover:bg-stone-800 transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#C86D51] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* Account Link */}
            <Link
              to={isAuthenticated ? "/account" : "/signin"}
              className="p-2 text-[#6E6763] dark:text-stone-300 hover:text-[#1C1817] dark:hover:text-white rounded-full hover:bg-[#F5F0EB] dark:hover:bg-stone-800 transition-colors flex items-center gap-1"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
              {isAuthenticated && (
                <span className="hidden xl:inline text-xs font-semibold text-[#1C1817] dark:text-stone-200">
                  {user?.fullName.split(' ')[0]}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="bg-[#1C1817] dark:bg-[#F5F0EB] text-white dark:text-[#1C1817] px-3.5 py-2 rounded-full flex items-center gap-2 font-bold text-xs hover:bg-[#342F2D] dark:hover:bg-white transition-all shadow-sm"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline uppercase tracking-wider">Cart</span>
              <span className="bg-[#C86D51] text-white text-[11px] font-black px-1.5 py-0.5 rounded-full">
                {totalItems}
              </span>
            </button>
          </div>

        </div>

        {/* Secondary Navigation Links (Desktop) */}
        <div className="hidden lg:flex items-center justify-between py-2 border-t border-[#E6DFD7]/60 dark:border-[#36322E]/60 text-xs font-bold uppercase tracking-wider text-[#6E6763] dark:text-stone-400">
          <div className="flex items-center gap-8">
            <Link to="/shop" className="hover:text-[#1C1817] dark:hover:text-stone-100 transition-colors">
              All Shop Catalog
            </Link>
            <Link to="/beauty" className="hover:text-[#C86D51] transition-colors">
              Beauty &amp; Skincare
            </Link>
            <Link to="/groceries" className="hover:text-[#4A5D4E] transition-colors">
              Groceries &amp; Essentials
            </Link>
            <Link to="/routine-builder" className="text-[#C86D51] hover:underline flex items-center gap-1 font-extrabold">
              <Sparkles className="w-3 h-3" />
              Routine Builder
            </Link>
            <Link to="/offers" className="hover:text-[#1C1817] dark:hover:text-stone-100 transition-colors">
              Promotions &amp; Offers
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-[#1C1817] dark:hover:text-stone-100 transition-colors">
              Our Story
            </Link>
            <Link to="/contact" className="hover:text-[#1C1817] dark:hover:text-stone-100 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex">
          <div className="w-4/5 max-w-sm bg-[#FDFBF7] dark:bg-[#12100F] h-full flex flex-col p-6 overflow-y-auto animate-fade-in shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#E6DFD7] dark:border-[#36322E]">
              <span className="text-lg font-extrabold uppercase text-[#1C1817] dark:text-stone-100">
                Navigation
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Input Mobile */}
            <form onSubmit={handleSearchSubmit} className="mt-4 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-[#F5F0EB] dark:bg-[#1C1917] text-xs pl-9 pr-4 py-3 rounded-lg border border-[#E6DFD7] dark:border-[#36322E]"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
            </form>

            {/* Department Tabs */}
            <div className="flex gap-2 mt-6 p-1 bg-[#F5F0EB] dark:bg-[#1C1917] rounded-lg">
              <button
                onClick={() => setActiveDepartmentTab('beauty')}
                className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${
                  activeDepartmentTab === 'beauty' ? 'bg-[#1C1817] text-white' : 'text-stone-500'
                }`}
              >
                Beauty
              </button>
              <button
                onClick={() => setActiveDepartmentTab('groceries')}
                className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${
                  activeDepartmentTab === 'groceries' ? 'bg-[#4A5D4E] text-white' : 'text-stone-500'
                }`}
              >
                Groceries
              </button>
            </div>

            {/* Categories List */}
            <div className="mt-6 flex-1 space-y-3">
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#6E6763]">
                {activeDepartmentTab === 'beauty' ? 'Beauty Categories' : 'Grocery Categories'}
              </div>

              {(activeDepartmentTab === 'beauty' ? beautyCategories : groceryCategories).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#F5F0EB] dark:hover:bg-stone-800 text-sm font-semibold text-[#1C1817] dark:text-stone-200"
                >
                  <span>{cat.name}</span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </Link>
              ))}

              <hr className="my-4 border-[#E6DFD7] dark:border-[#36322E]" />

              <Link
                to="/routine-builder"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 text-sm font-bold text-[#C86D51]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Build Skincare Routine</span>
              </Link>
              <Link
                to="/offers"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-2.5 text-sm font-semibold text-stone-700 dark:text-stone-300"
              >
                Current Deals &amp; Offers
              </Link>
              <Link
                to="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-2.5 text-sm font-semibold text-stone-700 dark:text-stone-300"
              >
                My Customer Account
              </Link>
            </div>

            <div className="pt-4 border-t border-[#E6DFD7] dark:border-[#36322E] text-xs text-stone-500">
              Need help ordering? Call us: <span className="font-bold text-stone-900 dark:text-stone-200">{storeSettings.storePhone}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
