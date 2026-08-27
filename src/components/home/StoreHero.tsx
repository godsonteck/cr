import React from 'react';
import { ShieldCheck, CreditCard, Truck, Sparkles, ArrowRight } from 'lucide-react';
import { CategoryType } from '../../types';
import { useStore } from '../../context/StoreContext';

interface StoreHeroProps {
  onShopNow: () => void;
  onExplore: () => void;
  onSelectCategory?: (category: CategoryType) => void;
}

export const StoreHero: React.FC<StoreHeroProps> = ({
  onShopNow,
  onExplore
}) => {
  const { storeSettings } = useStore();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FDFBF9] via-[#FAF6F4] to-[#F5ECE9] border-b border-rose-100/60 py-10 sm:py-16 lg:py-20">
      
      {/* Delicate background ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* LEFT CONTENT COLUMN (Typography & Call to Action) */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8 text-center lg:text-left">
            
            {/* Top Quality Badge */}
            <div className="inline-flex items-center gap-2 bg-white/90 border border-rose-200/80 px-3.5 py-1.5 rounded-full shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#8A3D52]">
                {storeSettings.heroBadge || '100% ORIGINAL & AUTHENTIC'}
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.12]">
                Your Beauty.
                <br />
                <span className="inline-flex items-center gap-2">
                  Your Essentials.
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#D4AF37] animate-pulse inline" />
                </span>
                <br />
                <span className="text-[#8A3D52] italic font-normal font-serif">
                  Your Glow.
                </span>
              </h1>

              <p className="text-gray-600 text-sm sm:text-base font-normal max-w-md mx-auto lg:mx-0 pt-2 leading-relaxed">
                {storeSettings.heroSubtitle || 'Carefully selected beauty and everyday essentials just for you.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1">
              <button
                onClick={onShopNow}
                className="px-8 py-3.5 bg-[#8A3D52] hover:bg-[#732F42] text-white text-xs font-bold uppercase tracking-widest rounded-md shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                {storeSettings.heroButtonText || 'SHOP NOW'}
              </button>

              <button
                onClick={onExplore}
                className="px-8 py-3.5 bg-transparent hover:bg-white text-gray-800 border border-gray-400 hover:border-gray-900 text-xs font-bold uppercase tracking-widest rounded-md transition-all cursor-pointer"
              >
                EXPLORE
              </button>
            </div>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-rose-200/50 text-left">
              <div>
                <span className="font-bold text-gray-900 text-xs sm:text-sm block">100% Genuine</span>
                <span className="text-[11px] text-gray-500">Verified imports</span>
              </div>
              <div>
                <span className="font-bold text-gray-900 text-xs sm:text-sm block">Same-Day Dispatch</span>
                <span className="text-[11px] text-gray-500">Greater Accra</span>
              </div>
              <div>
                <span className="font-bold text-gray-900 text-xs sm:text-sm block">MoMo & Cash</span>
                <span className="text-[11px] text-gray-500">Secure payment</span>
              </div>
            </div>

          </div>

          {/* RIGHT HERO COMPOSITION (Product Showcase) */}
          <div className="lg:col-span-7 relative flex items-center justify-center">
            
            {/* Main Stage Card */}
            <div className="relative w-full max-w-xl bg-white/70 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border border-white/80">
              
              <div className="grid grid-cols-3 gap-3 sm:gap-4 items-center">
                
                {/* 1. The Ordinary Serum */}
                <div className="bg-[#FAF5F3] rounded-2xl p-4 flex flex-col items-center text-center shadow-xs border border-rose-100/50 transform -rotate-1 hover:rotate-0 transition-transform">
                  <div className="w-24 h-32 sm:w-28 sm:h-36 flex items-center justify-center mb-2">
                    <img
                      src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80"
                      alt="The Ordinary Serum"
                      className="max-h-full max-w-full object-contain mix-blend-multiply drop-shadow-md"
                    />
                  </div>
                  <span className="text-[10px] font-black tracking-wider text-gray-400 uppercase">THE ORDINARY</span>
                  <span className="text-xs font-bold text-gray-900 truncate w-full">Niacinamide 10%</span>
                  <span className="text-xs font-extrabold text-[#8A3D52] mt-1">GHS 120</span>
                </div>

                {/* 2. CeraVe Moisturizing Tub (Center Spotlight) */}
                <div className="bg-[#FAF5F3] rounded-2xl p-4 flex flex-col items-center text-center shadow-md border-2 border-[#8A3D52]/20 transform scale-105 z-10">
                  <div className="w-28 h-36 sm:w-32 sm:h-40 flex items-center justify-center mb-2">
                    <img
                      src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80"
                      alt="CeraVe Moisturizing Cream"
                      className="max-h-full max-w-full object-contain mix-blend-multiply drop-shadow-lg"
                    />
                  </div>
                  <span className="text-[10px] font-black tracking-wider text-gray-400 uppercase">CERAVE</span>
                  <span className="text-xs font-bold text-gray-900 truncate w-full">Moisturizing Cream</span>
                  <span className="text-xs font-extrabold text-[#8A3D52] mt-1">GHS 280</span>
                </div>

                {/* 3. COSRX Snail Mucin */}
                <div className="bg-[#FAF5F3] rounded-2xl p-4 flex flex-col items-center text-center shadow-xs border border-rose-100/50 transform rotate-1 hover:rotate-0 transition-transform">
                  <div className="w-24 h-32 sm:w-28 sm:h-36 flex items-center justify-center mb-2">
                    <img
                      src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80"
                      alt="COSRX Snail Essence"
                      className="max-h-full max-w-full object-contain mix-blend-multiply drop-shadow-md"
                    />
                  </div>
                  <span className="text-[10px] font-black tracking-wider text-gray-400 uppercase">COSRX</span>
                  <span className="text-xs font-bold text-gray-900 truncate w-full">Snail 96 Mucin</span>
                  <span className="text-xs font-extrabold text-[#8A3D52] mt-1">GHS 195</span>
                </div>

              </div>

              {/* Floating Badge (Accra Express Delivery) */}
              <div className="absolute -bottom-4 right-6 bg-[#8A3D52] text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold border border-rose-300/40">
                <Truck className="w-4 h-4 text-[#D4AF37]" />
                <span>Accra Express & Intercity Dispatch</span>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
