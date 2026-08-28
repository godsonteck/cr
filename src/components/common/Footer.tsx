import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ShieldCheck, Truck, CreditCard, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import logoImg from '../../assets/logo.jpeg';

export const Footer: React.FC = () => {
  const { storeSettings } = useStore();

  return (
    <footer className="bg-[#141211] text-stone-400 pt-16 pb-12 border-t border-stone-800/80 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Minimalist 1-Line Trust Strip */}
        <div className="py-6 mb-12 border-y border-stone-800/60 flex flex-wrap items-center justify-between gap-6 text-xs text-stone-300 font-medium">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#C86D51]" />
            <span>Accra Express &amp; Nationwide Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C86D51]" />
            <span>100% Authentic Products</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#C86D51]" />
            <span>Mobile Money &amp; Card Payments</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C86D51]" />
            <span>Two Worlds, One Premium Brand</span>
          </div>
        </div>

        {/* Streamlined Footer Content Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16">

          {/* Brand & Mission */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={logoImg}
                alt="CR Cosmetics & Essentials"
                className="h-10 w-auto object-contain rounded-md"
              />
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight text-white uppercase">
                  CR <span className="text-[#C86D51]">COSMETICS</span>
                </span>
                <span className="text-[8px] tracking-[0.2em] font-bold text-stone-400 uppercase">
                  &amp; ESSENTIALS
                </span>
              </div>
            </Link>
            <p className="text-xs text-stone-400 leading-relaxed max-w-xs">
              Ghana’s premier retailer unifying dermatological skincare &amp; beauty with everyday grocery essentials.
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${storeSettings.whatsappNumber || '233551234567'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Customer Care Chat</span>
              </a>
            </div>
          </div>

          {/* Department 1: Beauty & Skincare */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Beauty &amp; Skincare
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link to="/beauty" className="hover:text-white transition-colors">Beauty Storefront</Link></li>
              <li><Link to="/category/skincare" className="hover:text-white transition-colors">Skincare</Link></li>
              <li><Link to="/category/makeup" className="hover:text-white transition-colors">Makeup &amp; Cosmetics</Link></li>
              <li><Link to="/category/fragrances" className="hover:text-white transition-colors">Fragrances</Link></li>
              <li><Link to="/routine-builder" className="text-[#C86D51] font-semibold hover:underline">Routine Builder</Link></li>
            </ul>
          </div>

          {/* Department 2: Groceries & Essentials */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Groceries &amp; Essentials
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link to="/groceries" className="hover:text-white transition-colors">Grocery Storefront</Link></li>
              <li><Link to="/category/rice-grains" className="hover:text-white transition-colors">Rice &amp; Grains</Link></li>
              <li><Link to="/category/cooking-oils" className="hover:text-white transition-colors">Cooking Oils</Link></li>
              <li><Link to="/category/beverages" className="hover:text-white transition-colors">Beverages &amp; Milk</Link></li>
              <li><Link to="/category/household-care" className="hover:text-white transition-colors">Household Care</Link></li>
            </ul>
          </div>

          {/* Customer Service & Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link to="/account" className="hover:text-white transition-colors">My Account &amp; Orders</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">All Products</Link></li>
            </ul>
          </div>

        </div>

        {/* Minimal Copyright Bar */}
        <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} CR Cosmetics &amp; Essentials. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Designed for retail excellence in</span>
            <span className="text-stone-300 font-semibold">Accra, Ghana 🇬🇭</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
