import React from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Product } from '../../types';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct
}) => {
  const { wishlistProducts, toggleWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    showToast(`Added ${product.name} to bag`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div 
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-slideLeft"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#8A3D52] fill-current" />
            <h2 className="font-serif font-bold text-base text-gray-900">Saved Favorites</h2>
            <span className="bg-rose-50 text-[#8A3D52] text-xs font-bold px-2 py-0.5 rounded-full">
              {wishlistCount}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Close wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-100">
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-14 h-14 bg-rose-50 text-[#8A3D52] rounded-full flex items-center justify-center mx-auto text-2xl">
                ❤️
              </div>
              <h3 className="font-bold text-gray-900 text-sm">No saved items yet</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Tap the heart icon on any beauty or essential product to save it for quick access.
              </p>
            </div>
          ) : (
            wishlistProducts.map(product => (
              <div key={product.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                <div 
                  className="w-16 h-16 rounded-xl bg-[#FAF6F4] p-1 border border-gray-100 cursor-pointer shrink-0 flex items-center justify-center"
                  onClick={() => {
                    onClose();
                    onSelectProduct(product);
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                    {product.brand}
                  </span>
                  <h4 
                    onClick={() => {
                      onClose();
                      onSelectProduct(product);
                    }}
                    className="text-xs font-bold text-gray-900 truncate hover:text-[#8A3D52] cursor-pointer"
                  >
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-extrabold text-[#8A3D52]">GHS {product.price.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="px-3 py-1 bg-[#8A3D52] hover:bg-[#732F42] text-white text-[11px] font-bold rounded-md flex items-center gap-1 transition-colors"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Add to Bag</span>
                    </button>

                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="text-gray-400 hover:text-rose-600 p-1 transition-colors text-xs"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF5F4] border-t border-rose-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
          >
            Back to Shopping
          </button>
        </div>

      </div>
    </div>
  );
};
