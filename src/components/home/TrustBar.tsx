import React from 'react';
import { ShieldCheck, Sparkles, Truck, Headphones, Heart } from 'lucide-react';

export const TrustBar: React.FC = () => {
  return (
    <section className="bg-[#FAF5F3] dark:bg-[#13141B] border-y border-rose-100 dark:border-gray-800 py-8 sm:py-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          
          {/* 1. 100% AUTHENTIC PRODUCTS */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-white dark:bg-[#1C1E28] text-[#8A3D52] dark:text-rose-400 shadow-xs flex items-center justify-center shrink-0 border border-rose-100/80 dark:border-gray-700">
              <Sparkles className="w-5 h-5 text-[#C5A059]" />
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-900 dark:text-white tracking-wider uppercase">
                AUTHENTIC PRODUCTS
              </h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                100% Original direct from brand sources
              </p>
            </div>
          </div>

          {/* 2. CURATED LUXURY & CARE (Replaced payment method) */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-white dark:bg-[#1C1E28] text-[#8A3D52] dark:text-rose-400 shadow-xs flex items-center justify-center shrink-0 border border-rose-100/80 dark:border-gray-700">
              <Heart className="w-5 h-5 text-[#8A3D52] dark:text-rose-400" />
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-900 dark:text-white tracking-wider uppercase">
                PREMIUM CURATION
              </h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                Dermatology & luxury beauty essentials
              </p>
            </div>
          </div>

          {/* 3. FAST & RELIABLE DELIVERY */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-white dark:bg-[#1C1E28] text-[#8A3D52] dark:text-rose-400 shadow-xs flex items-center justify-center shrink-0 border border-rose-100/80 dark:border-gray-700">
              <Truck className="w-5 h-5 text-[#8A3D52] dark:text-rose-400" />
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-900 dark:text-white tracking-wider uppercase">
                EXPRESS DISPATCH
              </h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                Same-day Accra & nationwide courier
              </p>
            </div>
          </div>

          {/* 4. CUSTOMER CARE */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-white dark:bg-[#1C1E28] text-[#8A3D52] dark:text-rose-400 shadow-xs flex items-center justify-center shrink-0 border border-rose-100/80 dark:border-gray-700">
              <Headphones className="w-5 h-5 text-[#8A3D52] dark:text-rose-400" />
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-900 dark:text-white tracking-wider uppercase">
                BEAUTY CONCIERGE
              </h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                Personal routine advice & support
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
