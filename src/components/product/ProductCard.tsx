import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Heart, ShoppingBag, Eye } from 'lucide-react';

const getResponsiveImageSet = (image: string) => {
  if (!image.includes('images.unsplash.com')) return undefined;
  return [300, 600, 900]
    .map(width => {
      const url = new URL(image);
      url.searchParams.set('w', String(width));
      return `${url.toString()} ${width}w`;
    })
    .join(', ');
};

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
  const price = Number(product.price || 0);
  const originalPrice = product.originalPrice == null ? undefined : Number(product.originalPrice);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (product.options?.length) {
      navigate(`/product/${product.id}`);
      return;
    }
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
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleCardClick();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`View ${product.name}`}
      className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-2 text-slate-900 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 ${className}`}
    >
      {/* Product Image Area with floating buttons */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-50 dark:bg-slate-800/60">
        <img
          src={product.image}
          srcSet={getResponsiveImageSet(product.image)}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          alt={product.name}
          width="600"
          height="600"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
          {product.discountBadge && (
            <span className="inline-flex items-center rounded-sm bg-[#FD384F] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-xs">
              {product.discountBadge}
            </span>
          )}
        </div>

        {/* Top Right Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label="Wishlist"
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 backdrop-blur-xs text-stone-600 shadow-xs transition-all hover:bg-white hover:text-red-500 hover:scale-110 dark:bg-slate-900/80 dark:text-stone-300"
        >
          <Heart className={`h-3.5 w-3.5 ${isFavorited ? 'fill-[#FD384F] text-[#FD384F]' : ''}`} />
        </button>

        {/* AliExpress Style Circular Floating Add to Cart Button (Bottom Right) */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock || product.stockCount <= 0}
          className="absolute bottom-2 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md border border-gray-100 text-stone-800 transition-all hover:bg-red-50 hover:text-[#FD384F] hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          aria-label={product.options?.length ? `Choose options for ${product.name}` : product.inStock && product.stockCount > 0 ? `Add ${product.name} to cart` : `${product.name} is out of stock`}
          title={product.options?.length ? "Choose options" : "Add to cart"}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>

        {/* Quick View on Hover */}
        {onQuickView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onQuickView(product);
            }}
            className="absolute inset-x-2 bottom-2 z-10 mr-11 flex items-center justify-center gap-1 rounded-lg bg-black/75 px-2 py-1.5 text-[9px] font-bold text-white shadow-sm opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100"
          >
            <Eye className="h-3 w-3" />
            <span>Quick View</span>
          </button>
        )}
      </div>

      {/* Product Information Area */}
      <div className="mt-2 flex flex-col justify-between flex-1 gap-1 text-left">
        {/* Choice & Sale Badges Row (as seen in AliExpress screenshot) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center rounded-xs bg-[#FFDE00] px-1 py-0.2 text-[9px] font-black uppercase tracking-tight text-black">
            Choice
          </span>
          <span className="inline-flex items-center rounded-xs bg-[#FD384F] px-1 py-0.2 text-[9px] font-black uppercase tracking-tight text-white">
            Sale
          </span>
          {product.brand && (
            <span className="text-[9px] font-semibold text-stone-500 uppercase tracking-wider truncate max-w-[120px]">
              {product.brand}
            </span>
          )}
        </div>

        {/* Truncated Title */}
        <h3 className="line-clamp-2 min-h-8 text-xs font-medium leading-4 text-stone-900 dark:text-stone-100 group-hover:text-[#FD384F] transition-colors">
          {product.name}
        </h3>

        {/* Price & Rating / Sold Count */}
        <div className="pt-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base font-black tracking-tight text-[#FD384F]">
              GH₵{price.toFixed(2)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-[10px] text-stone-400 line-through">
                GH₵{originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="mt-0.5 flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400">
            <div className="flex items-center gap-1">
              <span className="text-amber-500 font-bold">★ {product.rating.toFixed(1)}</span>
              <span>·</span>
              <span>{product.reviewCount || 100}+ sold</span>
            </div>
            {product.inStock && product.stockCount > 0 ? (
              <span className="text-emerald-600 font-semibold text-[9px]">In stock</span>
            ) : (
              <span className="text-rose-500 font-semibold text-[9px]">Out of stock</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
