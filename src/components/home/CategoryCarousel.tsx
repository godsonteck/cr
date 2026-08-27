import React, { useRef } from 'react';
import { CategoryType } from '../../types';
import { CATEGORIES_CONFIG } from '../../data/products';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryCarouselProps {
  currentCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
}

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  currentCategory,
  onSelectCategory
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Heading with Decorative Diamond Line */}
        <div className="text-center space-y-2 mb-8 sm:mb-10">
          <h2 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-[0.2em] uppercase font-sans">
            SHOP BY CATEGORY
          </h2>

          <div className="flex items-center justify-center gap-3 text-rose-200">
            <div className="h-px w-16 bg-rose-200" />
            <div className="w-2 h-2 rotate-45 border border-[#8A3D52] bg-[#8A3D52]" />
            <div className="h-px w-16 bg-rose-200" />
          </div>
        </div>

        {/* Carousel Container with Arrows */}
        <div className="relative group">
          
          {/* Left Arrow Button */}
          <button
            onClick={() => handleScroll('left')}
            className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-black hover:border-gray-400 shadow-md flex items-center justify-center transition-all hover:scale-105"
            aria-label="Previous Category"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Scrollable Categories Row */}
          <div
            ref={scrollRef}
            className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-none py-2 px-1 scroll-smooth"
          >
            {CATEGORIES_CONFIG.map(cat => {
              const isSelected = currentCategory === cat.id;

              return (
                <div
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id as CategoryType)}
                  className="flex-shrink-0 w-36 sm:w-44 text-center cursor-pointer group/item transition-transform duration-200 hover:-translate-y-1"
                >
                  {/* Category Image Box */}
                  <div className={`w-full aspect-square rounded-2xl p-3 flex items-center justify-center bg-[#FAF6F4] border transition-all duration-300 ${
                    isSelected 
                      ? 'border-[#8A3D52] ring-2 ring-[#8A3D52]/20 shadow-md bg-rose-50/50' 
                      : 'border-gray-100 hover:border-rose-200 hover:shadow-md'
                  }`}>
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover/item:scale-105"
                    />
                  </div>

                  {/* Category Name Label */}
                  <h3 className={`mt-3 text-xs font-black tracking-wider uppercase transition-colors ${
                    isSelected ? 'text-[#8A3D52]' : 'text-gray-800 group-hover/item:text-[#8A3D52]'
                  }`}>
                    {cat.name}
                  </h3>
                </div>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={() => handleScroll('right')}
            className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-black hover:border-gray-400 shadow-md flex items-center justify-center transition-all hover:scale-105"
            aria-label="Next Category"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

        </div>

      </div>
    </section>
  );
};
