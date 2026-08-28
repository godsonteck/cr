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
      className="bg-white dark:bg-[#1A1C25] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 relative flex flex-col justify-between group hover:shadow-xl hover:border-rose-100 dark:hover:border-rose-900/40 transition-all duration-300 cursor-pointer"
    >
      
      {/* Top Badges & Wishlist Heart */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          {product.discountBadge ? (
            <span className="bg-[#A25F6F] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
              {product.discountBadge}
            </span>
          ) : product.badge ? (
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
              product.badge === 'CR Exclusive' 
                ? 'bg-black dark:bg-zinc-900 text-[#D4AF37] border border-[#D4AF37]/30' 
                : 'bg-rose-50 dark:bg-rose-950/60 text-[#8A3D52] dark:text-rose-300'
            }`}>
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
          className="p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors text-gray-400 dark:text-gray-500 hover:text-rose-600 dark:hover:text-rose-400"
        >
          <Heart 
            className={`w-4 h-4 transition-transform active:scale-125 ${
              isFavorited ? 'fill-[#8A3D52] text-[#8A3D52] dark:fill-rose-400 dark:text-rose-400' : 'text-gray-400 dark:text-gray-500 stroke-[1.5]'
            }`} 
          />
        </button>
      </div>

      {/* Product Image Container */}
      <div className="w-full aspect-square flex items-center justify-center p-2 rounded-xl bg-gray-50/50 dark:bg-[#14151D] group-hover:bg-rose-50/20 dark:group-hover:bg-rose-950/20 transition-colors overflow-hidden relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-108 transition-transform duration-500 rounded-lg"
        />

        {/* Hover Quick Actions overlay */}
        <div className="absolute inset-x-2 bottom-2 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className="px-3 py-1.5 bg-white/95 dark:bg-[#232532]/95 hover:bg-white dark:hover:bg-[#282B3A] text-gray-800 dark:text-gray-100 rounded-lg text-[11px] font-bold shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-1 hover:text-[#8A3D52] dark:hover:text-rose-400"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="pt-3 text-center space-y-1">
        
        {/* Brand */}
        <h4 className="text-xs font-black text-gray-900 dark:text-gray-100 tracking-wide uppercase">
          {product.brand}
        </h4>

        {/* Product Name */}
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 group-hover:text-[#8A3D52] dark:group-hover:text-rose-400 transition-colors font-medium">
          {product.name}
        </p>

        {/* Pricing */}
        <div className="flex items-center justify-center gap-2 pt-1">
          {product.originalPrice && (
            <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
              GHS {product.originalPrice.toFixed(2)}
            </span>
          )}
          <span className="text-xs font-black text-gray-900 dark:text-white">
            GHS {product.price.toFixed(2)}
          </span>
        </div>

        {/* Rating Stars & Count */}
        <div className="flex items-center justify-center gap-1 text-[#D4AF37] pt-0.5">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-current" />
            ))}
          </div>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
            ({product.reviewCount})
          </span>
        </div>

      </div>

      {/* Direct Add to Basket Button */}
      <div className="pt-3">
        <button
          onClick={handleAddToCart}
          className="w-full py-2 bg-gray-900 dark:bg-rose-900/60 dark:hover:bg-[#8A3D52] hover:bg-[#8A3D52] text-white text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Add to Bag</span>
        </button>
      </div>

    </div>
  );
};
