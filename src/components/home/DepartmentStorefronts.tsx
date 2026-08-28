import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShoppingBasket,
  ArrowRight,
  Heart,
  ShoppingBag
} from 'lucide-react';
import { PRODUCTS, CATEGORIES_CONFIG } from '../../data/products';
import { Product } from '../../types';
import { Badge, Button } from '../common/UIPrimitives';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  const isBeauty = product.department === 'beauty';

  return (
    <div className="group bg-white dark:bg-[#1C1917] rounded-2xl border border-[#E6DFD7] dark:border-[#36322E] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">

      {/* Product Image Area */}
      <div className="relative aspect-square overflow-hidden bg-[#F5F0EB] dark:bg-stone-900 p-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <Badge variant={product.badge === 'Sale' ? 'terracotta' : product.badge === 'CR Exclusive' ? 'gold' : 'espresso'}>
              {product.badge}
            </Badge>
          )}
          {product.discountBadge && (
            <Badge variant="terracotta">{product.discountBadge}</Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={`absolute bottom-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            wishlisted
              ? 'bg-[#C86D51] text-white'
              : 'bg-white/90 dark:bg-stone-800/90 text-stone-700 dark:text-stone-200 hover:bg-white'
          }`}
          aria-label="Wishlist product"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Information */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs text-[#6E6763] dark:text-stone-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">{product.brand}</span>
            {product.packSize && <span className="text-[11px] font-bold text-stone-500">{product.packSize}</span>}
          </div>

          <Link to={`/product/${product.id}`} className="group-hover:text-[#C86D51] transition-colors">
            <h3 className="text-xs sm:text-sm font-bold text-[#1C1817] dark:text-stone-100 line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="pt-3 border-t border-[#E6DFD7]/60 dark:border-[#36322E]/60 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-extrabold text-[#1C1817] dark:text-stone-100">
                GHS {product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-stone-400 line-through">
                  GHS {product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#6E6763] dark:text-stone-400 block">{product.unit}</span>
          </div>

          <Button
            size="sm"
            variant={isBeauty ? 'primary' : 'botanical'}
            onClick={() => addToCart(product, 1)}
            className="rounded-full px-3 py-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="text-xs">Add</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export const HomePage: React.FC = () => {
  const bestSellers = PRODUCTS.filter(p => p.badge === 'Bestseller' || p.rating >= 4.9).slice(0, 6);

  return (
    <div className="space-y-20 pb-20 font-sans">

      {/* 1. Hero Storefront Banner */}
      <section className="relative bg-[#1C1817] text-white overflow-hidden rounded-b-3xl">
        <div className="absolute inset-0 z-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=2000&q=80"
            alt="Hero background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36 flex flex-col items-center text-center">
          <span className="bg-[#C86D51] text-white text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-6">
            Ghana Premier Digital Retailer
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight uppercase font-sans">
            Luxury Beauty &amp; Skincare <br className="hidden sm:inline" />
            <span className="text-[#C86D51]">Meets Everyday Provisions.</span>
          </h1>

          <p className="mt-6 text-sm sm:text-lg text-stone-300 max-w-2xl font-normal leading-relaxed">
            One platform. Two dedicated shopping worlds. Explore targeted dermatological skincare, authentic luxury perfumes, and fresh household grocery staples.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link to="/beauty">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto rounded-full px-8 py-4">
                <Sparkles className="w-5 h-5" />
                <span>Shop Beauty &amp; Skincare</span>
              </Button>
            </Link>
            <Link to="/groceries">
              <Button size="lg" variant="botanical" className="w-full sm:w-auto rounded-full px-8 py-4">
                <ShoppingBasket className="w-5 h-5 text-amber-300" />
                <span>Shop Groceries &amp; Essentials</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Dual-World Department Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold tracking-widest uppercase text-[#C86D51]">
            Intelligently Organized Retail
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#1C1817] dark:text-stone-100 uppercase mt-1">
            Explore Our Two Shopping Worlds
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* World 1 Card */}
          <div className="group relative rounded-3xl overflow-hidden bg-[#1C1817] text-white min-h-[380px] flex flex-col justify-end p-8 sm:p-10 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1000&q=80"
              alt="Beauty Department"
              className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="relative z-10 space-y-3">
              <span className="bg-[#1C1817] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-stone-700">
                Department 01
              </span>
              <h3 className="text-3xl font-extrabold uppercase">Beauty &amp; Skincare</h3>
              <p className="text-xs sm:text-sm text-stone-300 max-w-md">
                Dermatologist-recommended serums, barrier creams, designer perfumes, and professional cosmetic tools.
              </p>
              <Link to="/beauty" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C86D51] hover:text-white pt-2">
                <span>Enter Beauty World</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* World 2 Card */}
          <div className="group relative rounded-3xl overflow-hidden bg-[#4A5D4E] text-white min-h-[380px] flex flex-col justify-end p-8 sm:p-10 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80"
              alt="Grocery Department"
              className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="relative z-10 space-y-3">
              <span className="bg-[#4A5D4E] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-stone-600">
                Department 02
              </span>
              <h3 className="text-3xl font-extrabold uppercase">Groceries &amp; Essentials</h3>
              <p className="text-xs sm:text-sm text-stone-200 max-w-md">
                Premium Jasmine rice, pure cooking oils, evaporated milk, seasonings, and trusted daily household hygiene.
              </p>
              <Link to="/groceries" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 hover:text-white pt-2">
                <span>Enter Groceries World</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h2 className="text-xs font-bold tracking-widest uppercase text-[#C86D51]">
              Curated Departments
            </h2>
            <p className="text-2xl font-extrabold text-[#1C1817] dark:text-stone-100 uppercase mt-1">
              Shop by Essential Category
            </p>
          </div>
          <Link to="/shop" className="text-xs font-bold uppercase tracking-wider text-[#1C1817] dark:text-stone-300 hover:text-[#C86D51] flex items-center gap-1 mt-2 md:mt-0">
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
          {CATEGORIES_CONFIG.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group bg-white dark:bg-[#1C1917] p-5 rounded-2xl border border-[#E6DFD7] dark:border-[#36322E] flex flex-col items-center text-center hover:shadow-lg transition-all"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden bg-stone-100 mb-3 group-hover:scale-105 transition-transform">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                {cat.department}
              </span>
              <span className="text-xs font-bold text-[#1C1817] dark:text-stone-200 mt-0.5 group-hover:text-[#C86D51] transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Best Sellers Rail */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <Badge variant="terracotta" className="mb-2">Customer Favorites</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1817] dark:text-stone-100 uppercase">
              Best Sellers in Ghana
            </h2>
          </div>
          <Link to="/shop?sort=best-sellers" className="text-xs font-bold uppercase text-[#1C1817] dark:text-stone-300 hover:text-[#C86D51] flex items-center gap-1 mt-2 md:mt-0">
            <span>Explore Best Sellers</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {bestSellers.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Routine Builder Interactive Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1C1817] text-white rounded-3xl p-8 lg:p-12 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl z-10">
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#C86D51]">
              <Sparkles className="w-4 h-4" />
              Skincare Routine Utility
            </span>
            <h3 className="text-3xl font-extrabold uppercase leading-tight">
              Build Your Personalized Regimen
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Match your exact skin concern with dermatological formulas: Cleanse, Treat, Hydrate, and Protect for radiant results.
            </p>
            <Link to="/routine-builder" className="inline-block pt-2">
              <Button variant="secondary" className="rounded-full px-6 py-3 text-xs uppercase tracking-wider">
                Start Routine Finder
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto z-10">
            <div className="bg-stone-900/90 border border-stone-800 p-4 rounded-xl text-center">
              <span className="text-xs font-extrabold text-[#C86D51] uppercase block">Step 01</span>
              <span className="text-xs text-stone-300 font-semibold">Cleanse</span>
            </div>
            <div className="bg-stone-900/90 border border-stone-800 p-4 rounded-xl text-center">
              <span className="text-xs font-extrabold text-[#C86D51] uppercase block">Step 02</span>
              <span className="text-xs text-stone-300 font-semibold">Treat</span>
            </div>
            <div className="bg-stone-900/90 border border-stone-800 p-4 rounded-xl text-center">
              <span className="text-xs font-extrabold text-[#C86D51] uppercase block">Step 03</span>
              <span className="text-xs text-stone-300 font-semibold">Hydrate</span>
            </div>
            <div className="bg-stone-900/90 border border-stone-800 p-4 rounded-xl text-center">
              <span className="text-xs font-extrabold text-[#C86D51] uppercase block">Step 04</span>
              <span className="text-xs text-stone-300 font-semibold">Protect</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export const BeautyDepartmentPage: React.FC = () => {
  const beautyProducts = PRODUCTS.filter(p => p.department === 'beauty');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="bg-[#1C1817] text-white p-8 lg:p-12 rounded-3xl relative overflow-hidden">
        <div className="max-w-2xl space-y-4">
          <Badge variant="terracotta">Department 01</Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold uppercase">Beauty &amp; Skincare</h1>
          <p className="text-sm text-stone-300 leading-relaxed">
            Targeted serums, nourishing body milks, barrier repair creams, and haute parfumerie. Curated for authentic results.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {beautyProducts.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};

export const GroceryDepartmentPage: React.FC = () => {
  const groceryProducts = PRODUCTS.filter(p => p.department === 'groceries');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="bg-[#4A5D4E] text-white p-8 lg:p-12 rounded-3xl relative overflow-hidden">
        <div className="max-w-2xl space-y-4">
          <Badge variant="gold">Department 02</Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold uppercase">Groceries &amp; Essentials</h1>
          <p className="text-sm text-stone-200 leading-relaxed">
            Fresh Thai Jasmine rice, pure vegetable cooking oil, full cream evaporated milk, seasonings, and laundry essentials.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {groceryProducts.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};
