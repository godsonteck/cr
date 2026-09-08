import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Heart, Minus, Plus, ShoppingBag, Star } from 'lucide-react';

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
  const { addToCart, cartItems, updateQuantity } = useCart();
  const { showToast } = useToast();

  const isFavorited = isInWishlist(product.id);
  const effectiveMode = mode === 'auto' ? (product.department === 'groceries' ? 'grocery' : 'beauty') : mode;
  const price = Number(product.price || 0);
  const originalPrice = product.originalPrice == null ? undefined : Number(product.originalPrice);
  const cartItem = cartItems.find(item => item.product.id === product.id && !item.selectedOption && !item.selectedVariant);
  const cartQuantity = cartItem?.quantity || 0;

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

  const handleQuantityChange = (e: React.MouseEvent, nextQuantity: number) => {
    e.stopPropagation();
    e.preventDefault();
    if (cartItem) {
      updateQuantity(product.id, nextQuantity);
    }
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
      </div>

      <div className="mt-3 flex flex-1 flex-col justify-between gap-1.5 px-0.5 text-left">
        <div className="flex min-h-4 items-center justify-between gap-1.5 flex-wrap">
          {product.brand && (
            <span className="max-w-[140px] break-words text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
              {product.brand}
            </span>
          )}
          {product.reviewCount && product.reviewCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{Number(product.rating || 5).toFixed(1)}</span>
              <span className="text-stone-400 text-[9px] font-normal">({product.reviewCount})</span>
            </span>
          ) : null}
        </div>

        <h3 className="min-h-9 break-words text-[13px] font-semibold leading-5 text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
          {product.name}
        </h3>

        <div className="pt-2 border-t border-[var(--border-color)]/50">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
                  GH₵{price.toFixed(2)}
                </span>
                {originalPrice && originalPrice > price && (
                  <span className="text-[10px] text-[var(--text-subtle)] line-through">
                    GH₵{originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[var(--text-subtle)]">
                {product.unit && (
                  <span className="text-[9px] uppercase tracking-[0.1em] text-[var(--text-subtle)]">
                    {product.unit}
                  </span>
                )}
                {product.unit && <span className="inline-block h-1 w-1 rounded-full bg-[var(--border-color)]" />}
                {product.inStock && product.stockCount > 0 ? (
                  <span className="text-emerald-600 font-semibold text-[9px]">In stock</span>
                ) : (
                  <span className="text-rose-500 font-semibold text-[9px]">Out of stock</span>
                )}
              </div>
            </div>

            <div className="shrink-0" onClick={event => { event.stopPropagation(); }}>
              {cartQuantity > 0 && !product.options?.length ? (
                <div
                  className="flex h-8 items-center overflow-hidden rounded-full bg-[var(--text-primary)] text-[var(--bg-card)] shadow-xs"
                  onClick={event => { event.stopPropagation(); event.preventDefault(); }}
                >
                  <button
                    onClick={event => handleQuantityChange(event, cartQuantity - 1)}
                    className="flex h-8 w-6 sm:w-7 items-center justify-center transition hover:bg-[var(--accent)] active:scale-95"
                    aria-label={`Decrease quantity of ${product.name}`}
                  >
                    <Minus className="h-3 w-3" strokeWidth={2.5} />
                  </button>
                  <span className="min-w-4 px-0.5 text-center text-[11px] font-bold" aria-label={`${cartQuantity} in cart`}>
                    {cartQuantity}
                  </span>
                  <button
                    onClick={event => handleQuantityChange(event, Math.min(product.stockCount, cartQuantity + 1))}
                    disabled={cartQuantity >= product.stockCount}
                    className="flex h-8 w-6 sm:w-7 items-center justify-center transition hover:bg-[var(--accent)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Increase quantity of ${product.name}`}
                  >
                    <Plus className="h-3 w-3" strokeWidth={2.5} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || product.stockCount <= 0}
                  className="flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full bg-[var(--text-primary)] text-[var(--bg-card)] shadow-xs transition-all hover:bg-[var(--accent)] hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={product.options?.length ? `Choose options for ${product.name}` : product.inStock && product.stockCount > 0 ? `Add ${product.name} to cart` : `${product.name} is out of stock`}
                  title={product.options?.length ? "Choose options" : "Add to cart"}
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
