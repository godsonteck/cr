import React from 'react';
import { ChevronRight, Sparkles, Crown } from 'lucide-react';
import { CategoryType } from '../../types';

interface BentoPromoBannersProps {
  onShopNewArrivals: () => void;
  onOpenMatchFinder: () => void;
  onDiscoverExclusive: () => void;
}

export const BentoPromoBanners: React.FC<BentoPromoBannersProps> = ({
  onShopNewArrivals,
  onOpenMatchFinder,
  onDiscoverExclusive
}) => {
  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* BANNER 1: NEW ARRIVALS (Rose Blush Card) */}
          <div className="bg-[#F8EDED] rounded-3xl p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between min-h-[300px] border border-rose-100/80 shadow-xs group hover:shadow-md transition-all">
            
            <div className="space-y-3 z-10 max-w-[65%]">
              <span className="text-[11px] font-extrabold text-[#8A3D52] tracking-widest uppercase block">
                NEW ARRIVALS
              </span>

              <h3 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                Just<br />In!
              </h3>

              <p className="text-xs text-gray-600 leading-relaxed">
                Shop the latest beauty must-haves.
              </p>

              <div className="pt-3">
                <button
                  onClick={onShopNewArrivals}
                  className="px-5 py-2.5 bg-[#8A3D52] hover:bg-[#732F42] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-transform group-hover:scale-105 active:scale-95"
                >
                  SHOP NOW
                </button>
              </div>
            </div>

            {/* Product Trio Image floating on right */}
            <div className="absolute -bottom-2 -right-4 w-44 sm:w-48 h-56 pointer-events-none flex items-end">
              <img
                src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80"
                alt="New Arrivals Beauty Collection"
                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
              />
            </div>

          </div>

          {/* BANNER 2: FIND YOUR PERFECT MATCH (Warm Nude Card with Glowing Portrait) */}
          <div className="bg-[#F6EFEA] rounded-3xl p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between min-h-[300px] border border-amber-100/60 shadow-xs group hover:shadow-md transition-all">
            
            <div className="space-y-3 z-10 max-w-[60%]">
              <h3 className="text-xs font-extrabold text-gray-900 tracking-wider uppercase">
                FIND YOUR PERFECT MATCH
              </h3>

              <p className="text-xs text-gray-600 leading-relaxed">
                Not sure what to buy? Let us help you find the perfect products for your skin, style & needs.
              </p>

              <div className="pt-2">
                <button
                  onClick={onOpenMatchFinder}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/90 hover:bg-white text-gray-900 border border-gray-300 rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-xs group-hover:text-[#8A3D52]"
                >
                  <span>FIND NOW</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Glowing African Woman Portrait on right */}
            <div className="absolute bottom-0 right-0 w-44 sm:w-48 h-64 pointer-events-none flex items-end">
              <img
                src="https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=600&q=80"
                alt="Glowing Radiance"
                className="w-full h-full object-cover object-top rounded-bl-3xl group-hover:scale-105 transition-transform duration-500"
              />
            </div>

          </div>

          {/* BANNER 3: CR EXCLUSIVE (Rich Berry/Plum Card with Branded Gift Bag) */}
          <div className="bg-[#8A3D52] text-white rounded-3xl p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between min-h-[300px] shadow-md group hover:shadow-xl transition-all">
            
            {/* Background subtle glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-3 z-10 max-w-[60%]">
              <div className="flex items-center gap-1.5 text-rose-200">
                <Crown className="w-4 h-4 text-[#D4AF37] fill-current" />
                <span className="text-[11px] font-extrabold tracking-widest uppercase">
                  CR EXCLUSIVE
                </span>
              </div>

              <p className="text-xs text-rose-100 leading-relaxed font-medium">
                Curated with love, only for you.
              </p>

              <div className="pt-4">
                <button
                  onClick={onDiscoverExclusive}
                  className="px-5 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/40 text-xs font-bold uppercase tracking-wider rounded-lg backdrop-blur-xs transition-transform group-hover:scale-105 active:scale-95"
                >
                  DISCOVER
                </button>
              </div>
            </div>

            {/* Luxury Black CR Branded Gift Bag Image with Gold Foil Branding */}
            <div className="absolute -bottom-2 -right-3 w-48 sm:w-52 h-56 pointer-events-none flex items-end">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1513094735237-8f2714d57c13?auto=format&fit=crop&w=600&q=80"
                  alt="CR Exclusive Luxury Gift Box"
                  className="w-full h-full object-contain rounded-2xl group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Overlay Crown Monogram Tag */}
                <div className="absolute bottom-6 left-2 bg-black/85 text-[#D4AF37] px-3 py-1.5 rounded-lg border border-[#D4AF37]/40 shadow-lg text-[10px] font-black tracking-widest text-center uppercase">
                  CR Signature
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
