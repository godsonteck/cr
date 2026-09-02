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
      className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-2.5 text-[var(--text-primary)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[0_24px_42px_rgba(11,31,56,0.14)] ${className}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          {product.discountBadge ? (
            <span className="inline-flex items-center rounded-full bg-[var(--accent)] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
              {product.discountBadge}
            </span>
          ) : product.badge ? (
            <span className="inline-flex items-center rounded-full bg-[var(--bg-soft)] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">
              {product.badge}
            </span>
          ) : (
            <span />
          )}
        </div>

        <button
          onClick={handleToggleWishlist}
          aria-label="Wishlist"
          className="rounded-full border border-[var(--border-color)] bg-[var(--bg-soft)] p-1.5 text-[var(--text-muted)] transition-all hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
        >
          <Heart className={`h-3.5 w-3.5 ${isFavorited ? 'fill-[#111111] text-[#111111]' : 'stroke-[1.5]'}`} />
        </button>
      </div>

      <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-[1rem] bg-[var(--bg-soft)]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
          loading="lazy"
        />

        {onQuickView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onQuickView(product);
            }}
            className="absolute inset-x-2 bottom-2 flex items-center justify-center gap-1 rounded-full bg-white/90 dark:bg-[#2a3f5f] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#171414] dark:text-[#f8f4f1] shadow-sm opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Eye className="h-3 w-3" />
            <span>Quick View</span>
          </button>
        )}
      </div>

      <div className="space-y-2 text-left">
        <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-subtle)]">
          {product.brand}
        </span>

        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-[var(--text-primary)]">
          {product.name}
        </h3>

        {product.rating && (
          <div className="flex items-center gap-1 text-[#f4b23d]">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="text-[11px] font-bold text-[var(--text-primary)]">{product.rating.toFixed(1)}</span>
            <span className="text-[10px] text-[var(--text-subtle)]">({product.reviewCount || 0})</span>
          </div>
        )}

        <div className="flex items-end justify-between gap-3">
          <div>
            <span className="text-lg font-black tracking-[-0.05em] text-[var(--text-primary)]">GHS {product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <div className="text-[11px] text-[var(--text-subtle)] line-through">GHS {product.originalPrice.toFixed(2)}</div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || product.stockCount <= 0}
            className="rounded-full bg-[var(--text-primary)] p-2.5 text-[var(--bg-card)] transition-all hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-35 dark:bg-[var(--accent)] dark:text-white"
            aria-label={product.inStock && product.stockCount > 0 ? `Add ${product.name} to cart` : `${product.name} is out of stock`}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
