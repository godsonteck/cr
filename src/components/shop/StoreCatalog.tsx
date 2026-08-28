import React, { useState, useMemo } from 'react';
import { CategoryType, Product } from '../../types';
import { ProductCard } from '../product/ProductCard';
import { useStore } from '../../context/StoreContext';
import { SlidersHorizontal, ChevronDown, Tag, RefreshCw, Sparkles } from 'lucide-react';
import { PredictiveSearchBar } from './PredictiveSearchBar';

interface StoreCatalogProps {
  currentCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenProductDetails: (product: Product) => void;
}

const BUDGET_PRESETS = [
  { label: 'All Budgets', min: 0, max: 1500 },
  { label: 'Under GHS 50', min: 0, max: 50 },
  { label: 'GHS 50 – 150', min: 50, max: 150 },
  { label: 'GHS 150 – 300', min: 150, max: 300 },
  { label: 'GHS 300 – 600', min: 300, max: 600 },
  { label: 'GHS 600+', min: 600, max: 1500 },
];

export const StoreCatalog: React.FC<StoreCatalogProps> = ({
  currentCategory,
  onSelectCategory,
  selectedBrand,
  onSelectBrand,
  searchQuery,
  onSearchChange,
  onOpenProductDetails
}) => {
  const { products, brands } = useStore();
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1500);
  const [isPriceFilterOpen, setIsPriceFilterOpen] = useState<boolean>(true);

  // Check if custom price range is currently active
  const isCustomPriceActive = minPrice > 0 || maxPrice < 1500;

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category filter
      if (currentCategory === 'new-arrivals') {
        if (product.badge !== 'New In' && product.badge !== 'CR Exclusive' && !product.isNewArrival) return false;
      } else if (currentCategory === 'best-sellers') {
        if (product.badge !== 'Bestseller' && product.badge !== 'Popular' && !product.isBestSeller) return false;
      } else if (currentCategory !== 'all' && product.category !== currentCategory) {
        return false;
      }

      // Brand filter
      if (selectedBrand !== 'All Brands' && product.brand !== selectedBrand) {
        return false;
      }

      // Price filter (Min and Max)
      if (product.price < minPrice || product.price > maxPrice) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesBrand = product.brand.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesHighlights = product.highlights ? product.highlights.some(h => h.toLowerCase().includes(q)) : false;
        if (!matchesName && !matchesBrand && !matchesDesc && !matchesHighlights) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // featured
    });
  }, [products, currentCategory, selectedBrand, minPrice, maxPrice, searchQuery, sortBy]);

  const handlePresetClick = (presetMin: number, presetMax: number) => {
    setMinPrice(presetMin);
    setMaxPrice(presetMax);
  };

  const handleResetAllFilters = () => {
    onSelectCategory('all');
    onSelectBrand('All Brands');
    onSearchChange('');
    setMinPrice(0);
    setMaxPrice(1500);
  };

  const categoryTitles: Record<CategoryType, string> = {
    all: 'All Beauty & Everyday Essentials',
    makeup: 'Makeup & Lip Luminizers',
    skincare: 'Targeted Skincare & Serums',
    fragrances: 'Designer Fragrances & Perfumes',
    'body-care': 'Nourishing Body Care & Lotions',
    'beauty-essentials': 'Beauty Tools & Brush Sets',
    'everyday-essentials': 'Everyday Household & Gift Sets',
    'new-arrivals': 'New Arrivals & Just In',
    'best-sellers': 'Customer Best Sellers'
  };

  return (
    <section id="catalog-section" className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Real-time Predictive Search Banner */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-rose-50/70 via-white to-rose-50/50 dark:from-[#181922] dark:via-[#1B1D28] dark:to-[#181922] p-4 sm:p-5 rounded-2xl border border-rose-100/80 dark:border-gray-800 shadow-2xs transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#8A3D52] dark:text-rose-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Predictive Search</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Type any product name, brand, or active ingredient to get real-time recommendations.
              </p>
            </div>
            {searchQuery && (
              <span className="text-xs font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-[#252836] px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 self-start md:self-auto shadow-2xs">
                Active search: <strong className="text-[#8A3D52] dark:text-rose-400">"{searchQuery}"</strong> ({filteredProducts.length} results)
              </span>
            )}
          </div>

          <PredictiveSearchBar
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onSelectProduct={onOpenProductDetails}
            onSelectCategory={onSelectCategory}
            onSelectBrand={onSelectBrand}
            placeholder="Search products, brands, ingredients (e.g. Niacinamide, CeraVe, Fenty)..."
          />
        </div>
      </div>

      {/* Category Title & Quick Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-extrabold text-[#8A3D52] dark:text-rose-400 tracking-widest uppercase bg-rose-50 dark:bg-rose-950/50 px-2.5 py-0.5 rounded-full border border-rose-100 dark:border-rose-900/40">
              {currentCategory.replace('-', ' ')}
            </span>
            {selectedBrand !== 'All Brands' && (
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#1F212C] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span>{selectedBrand}</span>
                <button onClick={() => onSelectBrand('All Brands')} className="hover:text-black dark:hover:text-white cursor-pointer" aria-label="Clear brand">✕</button>
              </span>
            )}
            {isCustomPriceActive && (
              <span className="text-[11px] font-bold text-[#8A3D52] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-rose-200/80 dark:border-rose-900/40">
                <span>GHS {minPrice} – GHS {maxPrice}</span>
                <button onClick={() => { setMinPrice(0); setMaxPrice(1500); }} className="hover:text-black dark:hover:text-white font-bold cursor-pointer" aria-label="Clear price">✕</button>
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 dark:text-white mt-1">
            {categoryTitles[currentCategory] || 'Beauty & Essentials'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Showing {filteredProducts.length} authentic products in Accra, Ghana
          </p>
        </div>

        {/* Filters & Sorting Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Price Filter Toggle Button */}
          <button
            onClick={() => setIsPriceFilterOpen(!isPriceFilterOpen)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs border cursor-pointer ${
              isCustomPriceActive 
                ? 'bg-[#8A3D52] text-white border-[#8A3D52]' 
                : 'bg-white dark:bg-[#1E202B] text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#252836]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Budget Filter</span>
            {isCustomPriceActive && (
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            )}
          </button>

          {/* Brand Selector */}
          <div className="relative">
            <select
              value={selectedBrand}
              onChange={e => onSelectBrand(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-white dark:bg-[#1E202B] border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#8A3D52] shadow-2xs cursor-pointer"
            >
              {brands.map(brand => (
                <option key={brand} value={brand} className="dark:bg-[#1E202B] dark:text-gray-200">{brand}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="appearance-none pl-3 pr-8 py-2 bg-white dark:bg-[#1E202B] border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#8A3D52] shadow-2xs cursor-pointer"
            >
              <option value="featured" className="dark:bg-[#1E202B]">Featured First</option>
              <option value="price-asc" className="dark:bg-[#1E202B]">Price: Low to High</option>
              <option value="price-desc" className="dark:bg-[#1E202B]">Price: High to Low</option>
              <option value="rating" className="dark:bg-[#1E202B]">Highest Rated</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset Filters Button */}
          {(currentCategory !== 'all' || selectedBrand !== 'All Brands' || searchQuery || isCustomPriceActive) && (
            <button
              onClick={handleResetAllFilters}
              className="px-3 py-2 bg-rose-50 dark:bg-rose-950/60 text-[#8A3D52] dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

        </div>
      </div>

      {/* PRICE RANGE FILTER PANEL */}
      {isPriceFilterOpen && (
        <div className="bg-[#FAF5F4] dark:bg-[#161720] border border-rose-100/80 dark:border-gray-800 rounded-2xl p-4 sm:p-5 mb-8 shadow-2xs transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left: Interactive Slider & Range Display */}
            <div className="space-y-3 flex-1 max-w-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
                  <Tag className="w-3.5 h-3.5 text-[#8A3D52] dark:text-rose-400" />
                  <span>Price Range (GHS)</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#8A3D52] dark:text-rose-400 bg-white dark:bg-[#1E202B] px-3 py-1 rounded-lg border border-rose-100 dark:border-gray-700 shadow-2xs">
                  <span>GHS {minPrice}</span>
                  <span className="text-gray-400 dark:text-gray-500">—</span>
                  <span>GHS {maxPrice >= 1500 ? '1,500+' : maxPrice}</span>
                </div>
              </div>

              {/* Slider Controls */}
              <div className="space-y-2">
                <div className="relative flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="1500"
                    step="10"
                    value={maxPrice}
                    onChange={e => {
                      const val = Number(e.target.value);
                      if (val >= minPrice) {
                        setMaxPrice(val);
                      }
                    }}
                    className="w-full h-2 bg-rose-200/80 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#8A3D52] dark:accent-rose-500"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                  <span>GHS 0</span>
                  <span>GHS 300</span>
                  <span>GHS 750</span>
                  <span>GHS 1,200</span>
                  <span>GHS 1,500+</span>
                </div>
              </div>
            </div>

            {/* Right: Quick Budget Filter Pills */}
            <div className="space-y-1.5 lg:border-l lg:border-rose-200/60 dark:lg:border-gray-800 lg:pl-6">
              <span className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Quick Budget Select:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {BUDGET_PRESETS.map(preset => {
                  const isActive = minPrice === preset.min && maxPrice === preset.max;
                  return (
                    <button
                      key={preset.label}
                      onClick={() => handlePresetClick(preset.min, preset.max)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#8A3D52] text-white shadow-2xs scale-102'
                          : 'bg-white dark:bg-[#1E202B] text-gray-700 dark:text-gray-300 hover:bg-rose-100/60 dark:hover:bg-gray-800 border border-gray-200/80 dark:border-gray-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Main Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-[#191A23] rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center space-y-4 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-[#8A3D52] dark:text-rose-400 flex items-center justify-center mx-auto text-xl">
            ✨
          </div>
          <h3 className="font-bold text-base text-gray-900 dark:text-white">No matching products found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            We couldn't find any items matching your current budget or brand selection. Try adjusting the price slider or resetting your filters.
          </p>
          <button
            onClick={handleResetAllFilters}
            className="px-6 py-2.5 bg-[#8A3D52] hover:bg-[#732F42] text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetails={onOpenProductDetails}
            />
          ))}
        </div>
      )}

    </section>
  );
};
