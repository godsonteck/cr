import React from 'react';
import { Product } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    showToast(`Added ${product.name} to basket`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
    showToast(isFavorited ? 'Removed from saved favorites' : 'Saved to favorites');
  };

  return (
    <div 
      onClick={() => onOpenDetails(product)}
      className="bg-white dark:bg-[#1A1817] rounded-xl border border-[#E6DFD7] dark:border-[#2E2A28] p-4 flex flex-col justify-between group hover:shadow-lg hover:border-[#C86D51]/40 transition-all duration-300 cursor-pointer relative"
    >
      
      {/* Top Badges & Wishlist Heart */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          {product.discountBadge ? (
            <span className="bg-[#C86D51] text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
              {product.discountBadge}
            </span>
          ) : product.badge ? (
            <span className="bg-[#F5F0EB] dark:bg-stone-800 text-[#1C1817] dark:text-stone-300 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
              {product.badge}
            </span>
          ) : (
            <span />
          )}
        </div>

        {/* Heart Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label="Add to Wishlist"
          className="p-1.5 rounded-full hover:bg-[#F5F0EB] dark:hover:bg-stone-800 transition-colors text-stone-400 hover:text-[#C86D51]"
        >
          <Heart 
            className={`w-4 h-4 transition-transform ${
              isFavorited ? 'fill-[#C86D51] text-[#C86D51]' : 'stroke-[1.5]'
            }`} 
          />
        </button>
      </div>

      {/* Product Image Container */}
      <div className="w-full aspect-square flex items-center justify-center p-3 rounded-lg bg-[#FDFBF7] dark:bg-[#141211] overflow-hidden relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-md"
        />

        {/* Quick View Button */}
        <div className="absolute inset-x-2 bottom-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className="px-3 py-1.5 bg-white/95 dark:bg-[#24211E]/95 text-[#1C1817] dark:text-stone-100 rounded-md text-[11px] font-semibold shadow-sm border border-stone-200 dark:border-stone-700 flex items-center gap-1.5 hover:text-[#C86D51]"
          >
            <Eye className="w-3 h-3" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="pt-4 text-left space-y-1">
        <p className="text-[10px] font-bold text-[#6E6763] uppercase tracking-wider">
          {product.brand}
        </p>

        <h3 className="text-xs font-semibold text-[#1C1817] dark:text-stone-100 line-clamp-2 group-hover:text-[#C86D51] transition-colors leading-snug">
          {product.name}
        </h3>

        {/* Pricing */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-sm font-extrabold text-[#1C1817] dark:text-white">
            GHS {product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-stone-400 line-through">
              GHS {product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 pt-0.5 text-amber-500">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-current" />
            ))}
          </div>
          <span className="text-[10px] text-stone-400">
            ({product.reviewCount})
          </span>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="pt-4">
        <button
          onClick={handleAddToCart}
          className="w-full py-2 bg-[#1C1817] dark:bg-stone-100 hover:bg-[#342F2D] dark:hover:bg-white text-white dark:text-[#1C1817] text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Add to Bag</span>
        </button>
      </div>

    </div>
  );
};
