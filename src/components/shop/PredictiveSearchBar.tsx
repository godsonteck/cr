import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Product, CategoryType } from '../../types';
import { useStore } from '../../context/StoreContext';
import { 
  Search, 
  X, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  Star, 
  Tag, 
  Layers
} from 'lucide-react';

interface PredictiveSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectProduct?: (product: Product) => void;
  onSelectCategory?: (category: CategoryType) => void;
  onSelectBrand?: (brand: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

const TRENDING_SEARCHES = [
  'Niacinamide Serum',
  'CeraVe Moisturising',
  'Snail Mucin 96',
  'Fenty Gloss',
  'Lancôme Perfume',
  'SPF 50 Sunscreen'
];

export const PredictiveSearchBar: React.FC<PredictiveSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onSelectProduct,
  onSelectCategory,
  onSelectBrand,
  placeholder = 'Search products, brands, ingredients (e.g. Niacinamide, CeraVe, Fenty)...',
  className = '',
  autoFocus = false
}) => {
  const { products, brands, categories } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute real-time predictive suggestions
  const { suggestedProducts, suggestedBrands, suggestedCategories, predictiveTerms } = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return {
        suggestedProducts: products.slice(0, 4),
        suggestedBrands: [],
        suggestedCategories: [],
        predictiveTerms: []
      };
    }

    // Matching products
    const matchedProds = products.filter(p => {
      const name = p.name.toLowerCase();
      const brand = p.brand.toLowerCase();
      const desc = p.description.toLowerCase();
      const highlights = p.highlights ? p.highlights.join(' ').toLowerCase() : '';
      const category = p.category.toLowerCase();
      return (
        name.includes(query) ||
        brand.includes(query) ||
        desc.includes(query) ||
        highlights.includes(query) ||
        category.includes(query)
      );
    }).slice(0, 5);

    // Matching brands
    const matchedBrands = brands.filter(b => 
      b !== 'All Brands' && b.toLowerCase().includes(query)
    ).slice(0, 3);

    // Matching categories
    const matchedCats = categories.filter(c => 
      c.id !== 'all' && (c.name.toLowerCase().includes(query) || c.description.toLowerCase().includes(query))
    ).slice(0, 3);

    // Predictive keyword completions
    const termsSet = new Set<string>();
    products.forEach(p => {
      if (p.name.toLowerCase().includes(query)) {
        termsSet.add(p.name);
      }
      if (p.brand.toLowerCase().includes(query)) {
        termsSet.add(`${p.brand} ${p.category}`);
      }
    });

    const matchedTerms = Array.from(termsSet).slice(0, 4);

    return {
      suggestedProducts: matchedProds,
      suggestedBrands: matchedBrands,
      suggestedCategories: matchedCats,
      predictiveTerms: matchedTerms
    };
  }, [searchQuery, products, brands, categories]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    const totalItems = suggestedProducts.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < suggestedProducts.length) {
        e.preventDefault();
        handleProductClick(suggestedProducts[selectedIndex]);
      } else {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleProductClick = (product: Product) => {
    setIsOpen(false);
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      onSearchChange(product.name);
    }
  };

  const handleTermClick = (term: string) => {
    onSearchChange(term);
    setIsOpen(false);
  };

  const handleCategoryClick = (catId: CategoryType) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
    setIsOpen(false);
  };

  const handleBrandClick = (brandName: string) => {
    if (onSelectBrand) {
      onSelectBrand(brandName);
    }
    setIsOpen(false);
  };

  // Helper to highlight matching text
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="font-extrabold text-[#8A3D52] dark:text-rose-400 underline decoration-[#8A3D52]/40 bg-rose-50 dark:bg-rose-950/60 px-0.5 rounded">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-[#8A3D52]" />
        
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={e => {
            onSearchChange(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#1E202B] border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8A3D52] dark:focus:ring-rose-500 focus:border-[#8A3D52] shadow-2xs transition-all"
        />

        {searchQuery ? (
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 font-mono bg-gray-50 dark:bg-[#15161E] px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 pointer-events-none">
            <span>ESC to close</span>
          </div>
        )}
      </div>

      {/* Real-time Predictive Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1C1D26] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-50 overflow-hidden animate-fadeIn divide-y divide-gray-100 dark:divide-gray-800 max-h-[80vh] sm:max-h-[480px] overflow-y-auto">
          
          {/* Quick Keywords / Autocomplete pills */}
          {searchQuery.trim() && predictiveTerms.length > 0 && (
            <div className="p-3 bg-[#FAF6F5]/70 dark:bg-[#181922] flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-extrabold text-[#8A3D52] dark:text-rose-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                <Sparkles className="w-3 h-3" />
                <span>Predictions:</span>
              </span>
              {predictiveTerms.map((term, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleTermClick(term)}
                  className="text-xs bg-white dark:bg-[#252836] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-700 dark:text-gray-200 hover:text-[#8A3D52] dark:hover:text-rose-400 px-2.5 py-1 rounded-lg border border-gray-200/80 dark:border-gray-700 font-medium transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>{term}</span>
                  <ArrowRight className="w-2.5 h-2.5 text-gray-400" />
                </button>
              ))}
            </div>
          )}

          {/* Matching Categories & Brands shortcuts */}
          {searchQuery.trim() && (suggestedCategories.length > 0 || suggestedBrands.length > 0) && (
            <div className="p-3 bg-white dark:bg-[#1C1D26] flex flex-wrap gap-2">
              {suggestedCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id as CategoryType)}
                  className="text-xs bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-[#8A3D52] dark:text-rose-300 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-100 dark:border-rose-900/40"
                >
                  <Layers className="w-3 h-3" />
                  <span>Category: {cat.name}</span>
                </button>
              ))}
              {suggestedBrands.map(brand => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => handleBrandClick(brand)}
                  className="text-xs bg-gray-100 dark:bg-[#252836] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer border dark:border-gray-700"
                >
                  <Tag className="w-3 h-3 text-[#8A3D52] dark:text-rose-400" />
                  <span>Brand: {brand}</span>
                </button>
              ))}
            </div>
          )}

          {/* Product Suggestions List */}
          <div className="p-2 space-y-1">
            <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              <span>{searchQuery.trim() ? `Suggested Products (${suggestedProducts.length})` : 'Popular Recommendations'}</span>
              {searchQuery.trim() && (
                <span className="text-[10px] text-[#8A3D52] dark:text-rose-400 normal-case font-bold">Click item for full details</span>
              )}
            </div>

            {suggestedProducts.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p className="font-semibold text-gray-700 dark:text-gray-200">No products matching "{searchQuery}"</p>
                <p className="text-[11px]">Try searching by brand (e.g. CeraVe, Ordinary) or skincare concerns</p>
              </div>
            ) : (
              suggestedProducts.map((product, idx) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                    selectedIndex === idx 
                      ? 'bg-rose-50/80 dark:bg-rose-950/40 ring-1 ring-[#8A3D52]/20 dark:ring-rose-500/30' 
                      : 'hover:bg-gray-50 dark:hover:bg-[#242634]'
                  }`}
                >
                  {/* Thumbnail */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold text-[#8A3D52] dark:text-rose-400 uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.2 rounded border border-rose-100 dark:border-rose-900/40">
                        {product.brand}
                      </span>
                      {product.inStock === false && (
                        <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded">
                          Out of stock
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 truncate mt-0.5">
                      {renderHighlightedText(product.name, searchQuery)}
                    </h4>

                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                      <span className="font-mono font-bold text-[#8A3D52] dark:text-rose-400">
                        GHS {product.price.toFixed(2)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-[#D4AF37] font-semibold">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{product.rating || 5.0}</span>
                      </span>
                      <span>•</span>
                      <span className="capitalize">{product.category.replace('-', ' ')}</span>
                    </div>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="shrink-0 text-gray-400 group-hover:text-[#8A3D52] dark:text-gray-500 dark:group-hover:text-rose-400">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Trending Searches (when query is empty) */}
          {!searchQuery.trim() && (
            <div className="p-3 bg-gray-50/70 dark:bg-[#181922] border-t border-gray-100 dark:border-gray-800 space-y-2">
              <span className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#8A3D52] dark:text-rose-400" />
                <span>Popular Searches</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {TRENDING_SEARCHES.map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleTermClick(item)}
                    className="text-xs bg-white dark:bg-[#252836] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-700 dark:text-gray-200 hover:text-[#8A3D52] dark:hover:text-rose-400 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 font-medium transition-colors cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer View All Bar */}
          {searchQuery.trim() && (
            <div className="p-2.5 bg-gray-50 dark:bg-[#181922] text-center border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-[#8A3D52] dark:text-rose-400 hover:underline cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
              >
                <span>Filter full catalog for "{searchQuery}"</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
