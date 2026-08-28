import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ShieldCheck, Truck, RefreshCw, CreditCard, Heart } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const { storeSettings } = useStore();

  return (
    <footer className="bg-[#1C1817] text-stone-300 pt-16 pb-12 border-t border-stone-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Core Trust & Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-stone-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-stone-800/80 rounded-xl text-[#C86D51]">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Accra Express &amp; Nationwide</h4>
              <p className="text-xs text-stone-400 mt-1">Same-day dispatch across Greater Accra &amp; intercity express delivery.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-stone-800/80 rounded-xl text-[#C86D51]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">100% Genuine Authenticity</h4>
              <p className="text-xs text-stone-400 mt-1">Directly sourced skincare formulations &amp; premium pantry essentials.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-stone-800/80 rounded-xl text-[#C86D51]">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Mobile Money &amp; Card</h4>
              <p className="text-xs text-stone-400 mt-1">Pay effortlessly via MTN MoMo, Telecel Cash, AT Money, or Card on delivery.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-stone-800/80 rounded-xl text-[#C86D51]">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Customer Satisfaction</h4>
              <p className="text-xs text-stone-400 mt-1">Dedicated customer care &amp; hassle-free store support line.</p>
            </div>
          </div>
        </div>

        {/* 4 Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12">

          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <span className="text-2xl font-extrabold tracking-tight text-white uppercase">
              CR <span className="text-[#C86D51]">COSMETICS</span>
            </span>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Ghana’s premier modern e-commerce platform unifying luxury beauty &amp; dermatological skincare with everyday groceries and essential household provisions under one seamless retail experience.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href={`https://wa.me/${storeSettings.whatsappNumber || '233551234567'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-4 py-2.5 rounded-full transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with Customer Care</span>
              </a>
            </div>
          </div>

          {/* Department 1: Beauty & Skincare */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Beauty &amp; Skincare
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li><Link to="/category/skincare" className="hover:text-white transition-colors">Targeted Skincare</Link></li>
              <li><Link to="/category/makeup" className="hover:text-white transition-colors">Cosmetics &amp; Makeup</Link></li>
              <li><Link to="/category/fragrances" className="hover:text-white transition-colors">Luxury Fragrances</Link></li>
              <li><Link to="/category/body-care" className="hover:text-white transition-colors">Nourishing Body Care</Link></li>
              <li><Link to="/category/beauty-tools" className="hover:text-white transition-colors">Pro Beauty Tools</Link></li>
              <li><Link to="/routine-builder" className="text-[#C86D51] font-semibold hover:underline">Routine Builder Utility</Link></li>
            </ul>
          </div>

          {/* Department 2: Groceries & Essentials */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Groceries &amp; Essentials
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li><Link to="/category/rice-grains" className="hover:text-white transition-colors">Jasmine Rice &amp; Grains</Link></li>
              <li><Link to="/category/cooking-oils" className="hover:text-white transition-colors">Pure Cooking Oils</Link></li>
              <li><Link to="/category/seasoning-spices" className="hover:text-white transition-colors">Tomato Paste &amp; Spices</Link></li>
              <li><Link to="/category/beverages" className="hover:text-white transition-colors">Milk &amp; Beverages</Link></li>
              <li><Link to="/category/household-care" className="hover:text-white transition-colors">Laundry &amp; Cleaners</Link></li>
              <li><Link to="/category/daily-essentials" className="hover:text-white transition-colors">Daily Hygiene Staples</Link></li>
            </ul>
          </div>

          {/* Customer Care & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li><Link to="/account" className="hover:text-white transition-colors">My Customer Account</Link></li>
              <li><Link to="/account/orders" className="hover:text-white transition-colors">Order Tracking &amp; History</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About CR Cosmetics</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Store Support</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQs &amp; Delivery Policies</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

        </div>

        {/* Copyright & Location */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} CR Cosmetics &amp; Essentials Ltd. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted for retail excellence in</span>
            <span className="text-stone-300 font-semibold">Accra, Ghana 🇬🇭</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
