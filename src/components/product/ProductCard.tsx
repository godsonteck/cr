import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  mode?: 'beauty' | 'grocery' | 'auto';
  onQuickView?: (product: Product) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  mode = 'auto',
  onQuickView,
  className = ''
}) => {
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const isFavorited = isInWishlist(product.id);
  const effectiveMode = mode === 'auto' ? (product.department === 'groceries' ? 'grocery' : 'beauty') : mode;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(product, 1);
    showToast(`Added ${product.name} to cart`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWishlist(product.id);
    showToast(isFavorited ? 'Removed from saved items' : 'Saved to wishlist');
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`group bg-white dark:bg-[#1A1817] border border-[#E8E2DA] dark:border-[#2A2725] rounded-lg p-3 sm:p-4 flex flex-col justify-between hover:border-[#C86D51] transition-all duration-200 cursor-pointer relative ${className}`}
    >
      
      {/* Top Header: Badge & Wishlist Button */}
      <div className="flex items-center justify-between gap-1 mb-2 z-10">
        <div>
          {product.discountBadge ? (
            <span className="bg-[#C86D51] text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {product.discountBadge}
            </span>
          ) : product.badge ? (
            <span className="bg-[#F5F0EB] dark:bg-stone-800 text-[#1C1817] dark:text-stone-300 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {product.badge}
            </span>
          ) : (
            <span />
          )}
        </div>

        <button
          onClick={handleToggleWishlist}
          aria-label="Wishlist"
          className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-400 hover:text-[#C86D51]"
        >
          <Heart 
            className={`w-4 h-4 transition-transform ${
              isFavorited ? 'fill-[#C86D51] text-[#C86D51]' : 'stroke-[1.5]'
            }`} 
          />
        </button>
      </div>

      {/* Product Image Stage */}
      <div className="w-full aspect-square relative bg-[#FBF9F5] dark:bg-[#141211] rounded p-3 flex items-center justify-center overflow-hidden mb-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {onQuickView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onQuickView(product);
            }}
            className="absolute bottom-2 inset-x-2 bg-white/95 dark:bg-stone-900/95 text-[#1C1817] dark:text-stone-100 text-[11px] font-bold py-1.5 rounded border border-stone-200 dark:border-stone-800 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 shadow-sm"
          >
            <Eye className="w-3 h-3" />
            <span>Quick View</span>
          </button>
        )}
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between text-left space-y-1">
        <div>
          <span className="text-[10px] font-bold text-[#8C827A] dark:text-stone-400 uppercase tracking-wider block">
            {product.brand}
          </span>
          <h3 className="text-xs sm:text-sm font-semibold text-[#1C1817] dark:text-stone-100 line-clamp-2 leading-snug group-hover:text-[#C86D51] transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Dynamic Details based on Mode */}
        {effectiveMode === 'beauty' && product.skinType && (
          <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
            For: {product.skinType}
          </p>
        )}

        {effectiveMode === 'grocery' && product.volumeOrWeight && (
          <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
            Pack: {product.volumeOrWeight}
          </p>
        )}

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 text-amber-500 pt-0.5">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-[10px] text-stone-400">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Price Row */}
        <div className="pt-2 flex items-baseline gap-2">
          <span className="text-sm sm:text-base font-extrabold text-[#1C1817] dark:text-stone-100">
            GHS {product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-stone-400 line-through">
              GHS {product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Add to Cart Action */}
      <div className="pt-3 mt-auto">
        <button
          onClick={handleAddToCart}
          className={`w-full py-2 px-3 text-xs font-bold rounded transition-colors flex items-center justify-center gap-2 ${
            effectiveMode === 'grocery'
              ? 'bg-[#4A5D4E] hover:bg-[#3D4D40] text-white'
              : 'bg-[#1C1817] dark:bg-stone-100 hover:bg-[#342F2D] dark:hover:bg-white text-white dark:text-[#1C1817]'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Add to Cart</span>
        </button>
      </div>

    </div>
  );
};
