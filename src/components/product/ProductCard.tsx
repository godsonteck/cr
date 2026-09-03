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
      className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-2.5 text-[var(--text-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_14px_28px_rgba(11,31,56,0.12)] sm:p-3 ${className}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          {product.discountBadge ? (
            <span className="inline-flex items-center rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-white shadow-sm">
              {product.discountBadge}
            </span>
          ) : product.badge ? (
            <span className="inline-flex items-center rounded-full bg-[var(--bg-soft)] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-[var(--text-primary)]">
              {product.badge}
            </span>
          ) : (
            <span />
          )}
        </div>

        <button
          onClick={handleToggleWishlist}
          aria-label="Wishlist"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-soft)] text-[var(--text-muted)] transition-all hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
        >
          <Heart className={`h-3 w-3 ${isFavorited ? 'fill-[#C86D51] text-[#C86D51]' : 'stroke-[1.5]'}`} />
        </button>
      </div>

      <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-[var(--bg-soft)] p-2">
        <img
          src={product.image}
          srcSet={getResponsiveImageSet(product.image)}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          alt={product.name}
          width="600"
          height="600"
          decoding="async"
          className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.04] dark:mix-blend-normal"
          loading="lazy"
        />

        {onQuickView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onQuickView(product);
            }}
            className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-center gap-1 rounded-full bg-white/90 dark:bg-[#2a3f5f] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-[#171414] dark:text-[#f8f4f1] shadow-sm opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Eye className="h-3 w-3" />
            <span>Quick View</span>
          </button>
        )}
      </div>

      <div className="space-y-1.5 text-left">
        <span className="block text-[8px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
          {product.brand}
        </span>

        <h3 className="line-clamp-2 min-h-9 text-xs font-semibold leading-4 text-[var(--text-primary)] sm:text-[13px]">
          {product.name}
        </h3>

        <div className="flex items-end justify-between gap-3">
          <div>
            <span className="text-sm font-black tracking-[-0.03em] text-[var(--text-primary)] sm:text-base">GHS {price.toFixed(2)}</span>
            {originalPrice && (
              <div className="text-[9px] text-[var(--text-subtle)] line-through">GHS {originalPrice.toFixed(2)}</div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || product.stockCount <= 0}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--text-primary)] text-[var(--bg-card)] transition-all hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-35 dark:bg-[var(--accent)] dark:text-white"
            aria-label={product.options?.length ? `Choose options for ${product.name}` : product.inStock && product.stockCount > 0 ? `Add ${product.name} to cart` : `${product.name} is out of stock`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
