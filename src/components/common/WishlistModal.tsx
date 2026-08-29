import React from 'react';
import { Product } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from './UIPrimitives';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({ isOpen, onClose }) => {
  const { wishlistProducts, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-[#FDFBF7] dark:bg-[#12100F] h-full flex flex-col p-6 shadow-2xl animate-fade-in font-sans">

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E6DFD7] dark:border-[#36322E]">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#C86D51] fill-current" />
            <h3 className="text-base font-extrabold uppercase text-[#1C1817] dark:text-stone-100">
              Saved Wishlist ({wishlistProducts.length})
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {wishlistProducts.length > 0 ? (
            wishlistProducts.map((product) => (
              <div
                key={product.id}
                className="flex gap-4 p-3 bg-white dark:bg-[#1C1917] rounded-2xl border border-[#E6DFD7] dark:border-[#36322E]"
              >
                <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-xl" />
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400">{product.brand}</span>
                  <h4 className="text-xs font-bold text-[#1C1817] dark:text-stone-100 line-clamp-1">
                    {product.name}
                  </h4>
                  <span className="text-xs font-extrabold block">GHS {product.price.toFixed(2)}</span>

                  <div className="flex items-center justify-between pt-1">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        addToCart(product, 1);
                        toggleWishlist(product.id);
                      }}
                      className="rounded-full px-3 py-1 text-[11px]"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Move to Cart</span>
                    </Button>

                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="text-stone-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 space-y-3">
              <Heart className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="text-xs text-stone-500 font-semibold">Your saved wishlist is currently empty.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
