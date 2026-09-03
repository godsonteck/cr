import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from './UIPrimitives';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';

export const CartDrawerComponent: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Shopping cart" onClick={onClose}>
      <div className="flex h-full w-full max-w-md flex-col bg-[var(--bg-main)] p-6 font-sans shadow-2xl animate-fade-in" onClick={event => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-[var(--accent)]" /><h3 className="text-base font-extrabold uppercase text-[var(--text-primary)]">Your Cart ({totalItems})</h3></div>
          <button onClick={onClose} aria-label="Close cart" className="min-h-10 min-w-10 rounded-lg p-1 text-[var(--text-primary)] hover:bg-[var(--bg-soft)]"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto py-4">
          {cartItems.length > 0 ? cartItems.map(item => (
            <div key={`${item.product.id}-${item.selectedOption || ''}`} className="flex gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3">
              <img src={item.product.image} alt={item.product.name} className="h-16 w-16 rounded-xl object-cover" />
              <div className="flex-1 space-y-1"><span className="text-[10px] font-bold uppercase text-[var(--text-subtle)]">{item.product.brand}</span><h4 className="line-clamp-1 text-xs font-bold text-[var(--text-primary)]">{item.product.name}</h4><span className="block text-xs font-extrabold text-[var(--text-primary)]">GHS {item.product.price.toFixed(2)}</span>
                <div className="flex items-center justify-between pt-1"><div className="flex items-center rounded-full border border-[var(--border-color)] bg-[var(--bg-soft)] px-2 py-0.5 text-xs"><button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} aria-label={`Decrease quantity for ${item.product.name}`} className="min-h-10 min-w-10 font-bold">-</button><span className="px-2 font-extrabold">{item.quantity}</span><button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} aria-label={`Increase quantity for ${item.product.name}`} className="min-h-10 min-w-10 font-bold">+</button></div><button onClick={() => removeFromCart(item.product.id)} aria-label={`Remove ${item.product.name} from cart`} className="min-h-10 min-w-10 text-[var(--text-subtle)] hover:text-red-500"><Trash2 className="mx-auto h-4 w-4" /></button></div>
              </div>
            </div>
          )) : <div className="space-y-3 py-12 text-center"><ShoppingBag className="mx-auto h-12 w-12 text-[var(--text-subtle)]" /><p className="text-xs font-semibold text-[var(--text-muted)]">Your shopping cart is currently empty.</p></div>}
        </div>
        {cartItems.length > 0 && <div className="space-y-4 border-t border-[var(--border-color)] pt-4"><div className="flex justify-between text-sm font-extrabold text-[var(--text-primary)]"><span>Subtotal:</span><span>GHS {subtotal.toFixed(2)}</span></div><p className="text-[10px] text-[var(--text-subtle)]">Shipping calculated at checkout.</p><div className="grid grid-cols-2 gap-2"><Button variant="outline" size="sm" onClick={() => { onClose(); navigate('/cart'); }} className="rounded-full">View Full Cart</Button><Button variant="primary" size="sm" onClick={() => { if (!isAuthenticated) { onClose(); showAlert('Please sign in to place your order.', 'error'); navigate('/signin'); return; } onClose(); navigate('/checkout'); }} className="rounded-full">Checkout Now</Button></div></div>}
      </div>
    </div>
  );
};
