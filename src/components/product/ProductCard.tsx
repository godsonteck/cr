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
      className={`group relative flex min-w-0 cursor-pointer flex-col justify-between overflow-hidden bg-transparent pb-2 text-[var(--text-primary)] ${className}`}
    >
      <div className={`relative w-full overflow-hidden rounded-2xl bg-[var(--bg-soft)] ${effectiveMode === 'beauty' ? 'aspect-[4/5]' : 'aspect-square'}`}>
        <img
          src={product.image}
          srcSet={getResponsiveImageSet(product.image)}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          alt={product.name}
          width="600"
          height="600"
          decoding="async"
          className={`h-full w-full transition-transform duration-300 group-hover:scale-[1.03] ${effectiveMode === 'beauty' ? 'object-cover' : 'object-contain p-3'}`}
          loading="lazy"
        />

        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
          {(product.discountBadge || product.badge) && (
            <span className="inline-flex w-fit items-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-primary)] shadow-sm">
              {product.discountBadge || product.badge}
            </span>
          )}
        </div>

        <button
          onClick={handleToggleWishlist}
          aria-label="Wishlist"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] shadow-sm transition-all hover:bg-[var(--bg-card-alt)] hover:text-[var(--accent)]"
        >
          <Heart className={`h-3.5 w-3.5 ${isFavorited ? 'fill-[var(--accent)] text-[var(--accent)]' : ''}`} />
        </button>

        <button
          onClick={handleAddToCart}
          disabled={!product.inStock || product.stockCount <= 0}
          className="absolute bottom-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--text-primary)] text-[var(--bg-card)] shadow-lg transition-all hover:bg-[var(--accent)] hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={product.options?.length ? `Choose options for ${product.name}` : product.inStock && product.stockCount > 0 ? `Add ${product.name} to cart` : `${product.name} is out of stock`}
          title={product.options?.length ? "Choose options" : "Add to cart"}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>

      </div>

      <div className="mt-3 flex flex-1 flex-col justify-between gap-1.5 px-0.5 text-left">
        <div className="flex min-h-4 items-center gap-1.5 flex-wrap">
          {product.brand && (
            <span className="max-w-[140px] truncate text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
              {product.brand}
            </span>
          )}
        </div>

        <h3 className="line-clamp-2 min-h-9 text-[13px] font-semibold leading-5 text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
          {product.name}
        </h3>

        <div className="pt-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
              GH₵{price.toFixed(2)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-[10px] text-[var(--text-subtle)] line-through">
                GH₵{originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center justify-between text-[10px] text-[var(--text-subtle)]">
            <span className="text-[9px] uppercase tracking-[0.1em] text-[var(--text-subtle)]">{product.unit}</span>
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
