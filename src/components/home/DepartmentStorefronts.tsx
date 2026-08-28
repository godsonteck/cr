import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShoppingBasket,
  ArrowRight
} from 'lucide-react';
import { PRODUCTS, CATEGORIES_CONFIG } from '../../data/products';
import { ProductCard } from '../product/ProductCard';

export const HomePage: React.FC = () => {
  const bestSellers = PRODUCTS.filter(p => p.badge === 'Bestseller' || p.rating >= 4.9).slice(0, 6);
  const beautyFeatured = PRODUCTS.filter(p => p.department === 'beauty').slice(0, 4);
  const groceryFeatured = PRODUCTS.filter(p => p.department === 'groceries').slice(0, 4);

  return (
    <div className="space-y-16 pb-16 font-sans">

      {/* 1. Retail Hero Banner */}
      <section className="bg-[#FAF8F5] dark:bg-[#171514] border-b border-[#E8E2DA] dark:border-[#2A2725] py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12">

          <div className="space-y-6 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F0EAE1] dark:bg-stone-800 rounded text-xs font-bold uppercase tracking-wider text-[#1C1817] dark:text-stone-200">
              <span className="w-2 h-2 rounded-full bg-[#C86D51]" />
              Accra Premier Digital Retailer
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1C1817] dark:text-stone-100 tracking-tight leading-tight uppercase font-sans">
              Beauty &amp; Skincare <br />
              <span className="text-[#C86D51]">Meets Daily Essentials.</span>
            </h1>

            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 font-normal leading-relaxed">
              Shop authentic dermatological skincare, designer fragrances, fresh rice, cooking oils, and household provisions under one seamless retail brand.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/beauty"
                className="px-6 py-3 bg-[#1C1817] dark:bg-stone-100 text-white dark:text-[#1C1817] text-xs font-bold uppercase tracking-wider rounded hover:bg-[#342F2D] dark:hover:bg-white transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#C86D51]" />
                <span>Shop Beauty World</span>
              </Link>
              <Link
                to="/groceries"
                className="px-6 py-3 bg-[#4A5D4E] hover:bg-[#3D4D40] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-2"
              >
                <ShoppingBasket className="w-4 h-4 text-amber-300" />
                <span>Shop Groceries World</span>
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4">
            <Link to="/beauty" className="group relative aspect-4/3 rounded overflow-hidden bg-stone-200 border border-[#E8E2DA]">
              <img
                src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80"
                alt="Beauty & Skincare"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 flex flex-col justify-end text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C86D51]">Department 01</span>
                <span className="text-lg font-extrabold uppercase">Beauty &amp; Skincare</span>
              </div>
            </Link>

            <Link to="/groceries" className="group relative aspect-4/3 rounded overflow-hidden bg-stone-200 border border-[#E8E2DA]">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
                alt="Groceries & Essentials"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 flex flex-col justify-end text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Department 02</span>
                <span className="text-lg font-extrabold uppercase">Groceries &amp; Essentials</span>
              </div>
            </Link>
          </div>

        </div>
      </section>

      {/* 2. Department Category Navigation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E2DA] dark:border-[#2A2725] mb-6">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#C86D51]">Store Departments</h2>
            <p className="text-xl font-extrabold uppercase text-[#1C1817] dark:text-stone-100">Browse Categories</p>
          </div>
          <Link to="/shop" className="text-xs font-bold uppercase text-stone-600 dark:text-stone-400 hover:text-[#1C1817] flex items-center gap-1">
            <span>All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES_CONFIG.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group bg-white dark:bg-[#1A1817] p-4 rounded border border-[#E8E2DA] dark:border-[#2A2725] hover:border-[#C86D51] transition-all flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded overflow-hidden bg-stone-100 mb-3 group-hover:scale-105 transition-transform">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
                {cat.department}
              </span>
              <span className="text-xs font-bold text-[#1C1817] dark:text-stone-200 mt-0.5 group-hover:text-[#C86D51]">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E2DA] dark:border-[#2A2725] mb-6">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#C86D51]">Popular Demand</h2>
            <p className="text-xl sm:text-2xl font-extrabold uppercase text-[#1C1817] dark:text-stone-100">Best Sellers in Ghana</p>
          </div>
          <Link to="/shop?sort=best-sellers" className="text-xs font-bold uppercase text-[#1C1817] dark:text-stone-300 hover:text-[#C86D51] flex items-center gap-1">
            <span>Explore Best Sellers</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {bestSellers.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Beauty Department Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E2DA] dark:border-[#2A2725] mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C86D51]" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#C86D51]">World 01</h2>
              <p className="text-xl font-extrabold uppercase text-[#1C1817] dark:text-stone-100">Beauty &amp; Skincare</p>
            </div>
          </div>
          <Link to="/beauty" className="text-xs font-bold uppercase text-[#C86D51] hover:underline flex items-center gap-1">
            <span>View Beauty Department</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {beautyFeatured.map(product => (
            <ProductCard key={product.id} product={product} mode="beauty" />
          ))}
        </div>
      </section>

      {/* 5. Grocery Department Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E2DA] dark:border-[#2A2725] mb-6">
          <div className="flex items-center gap-2">
            <ShoppingBasket className="w-5 h-5 text-[#4A5D4E]" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#4A5D4E]">World 02</h2>
              <p className="text-xl font-extrabold uppercase text-[#1C1817] dark:text-stone-100">Groceries &amp; Daily Essentials</p>
            </div>
          </div>
          <Link to="/groceries" className="text-xs font-bold uppercase text-[#4A5D4E] hover:underline flex items-center gap-1">
            <span>View Grocery Department</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {groceryFeatured.map(product => (
            <ProductCard key={product.id} product={product} mode="grocery" />
          ))}
        </div>
      </section>

    </div>
  );
};

export const BeautyDepartmentPage: React.FC = () => {
  const beautyProducts = PRODUCTS.filter(p => p.department === 'beauty');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      <div className="bg-[#1C1817] text-white p-8 rounded border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C86D51]">Department 01</span>
          <h1 className="text-2xl sm:text-4xl font-extrabold uppercase">Beauty &amp; Skincare</h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
            Targeted dermatological formulas, hydration serums, luxury fragrances, and professional cosmetics.
          </p>
        </div>
        <Link
          to="/routine-builder"
          className="px-5 py-2.5 bg-[#C86D51] text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-[#b05c42] transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Routine Builder</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {beautyProducts.map(p => (
          <ProductCard key={p.id} product={p} mode="beauty" />
        ))}
      </div>
    </div>
  );
};

export const GroceryDepartmentPage: React.FC = () => {
  const groceryProducts = PRODUCTS.filter(p => p.department === 'groceries');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      <div className="bg-[#4A5D4E] text-white p-8 rounded border border-stone-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Department 02</span>
          <h1 className="text-2xl sm:text-4xl font-extrabold uppercase">Groceries &amp; Everyday Essentials</h1>
          <p className="text-xs sm:text-sm text-stone-200 max-w-xl">
            Premium Jasmine rice, pure vegetable oils, evaporated milk, seasonings, and trusted daily household products.
          </p>
        </div>
        <Link
          to="/shop?category=groceries"
          className="px-5 py-2.5 bg-[#1C1817] text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-black transition-colors"
        >
          <span>Shop Pantry</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {groceryProducts.map(p => (
          <ProductCard key={p.id} product={p} mode="grocery" />
        ))}
      </div>
    </div>
  );
};
