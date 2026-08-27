import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { useStore } from './StoreContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedOption?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotal: number;
  discount: number;
  promoCode: string;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  shippingFee: number;
  total: number;
  freeShippingThreshold: number;
  progressToFreeShipping: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  selectedSamples: string[];
  toggleSample: (sampleName: string) => void;
  addRoutineBundleToCart: (productIds: string[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { products, storeSettings, validatePromoCode } = useStore();

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cr_cosmetics_cart');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    // Default initial luxury cart item
    const defaultProduct = products[0];
    return defaultProduct ? [{ product: defaultProduct, quantity: 1 }] : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [hasFreeShippingCoupon, setHasFreeShippingCoupon] = useState<boolean>(false);
  const [selectedSamples, setSelectedSamples] = useState<string[]>(['Baobab Barrier Crème (5ml Sample)']);

  const freeShippingThreshold = storeSettings.freeDeliveryThreshold || 300;

  useEffect(() => {
    try {
      localStorage.setItem('cr_cosmetics_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  const addToCart = (product: Product, quantity = 1, selectedOption?: string) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id && item.selectedOption === selectedOption);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity, selectedOption }];
    });
    setIsCartOpen(true);
  };

  const addRoutineBundleToCart = (productIds: string[]) => {
    const productsToAdd = products.filter(p => productIds.includes(p.id));
    setCart(prev => {
      let updated = [...prev];
      productsToAdd.forEach(prod => {
        const existingIndex = updated.findIndex(item => item.product.id === prod.id);
        if (existingIndex > -1) {
          updated[existingIndex].quantity += 1;
        } else {
          updated.push({ product: prod, quantity: 1 });
        }
      });
      return updated;
    });
    
    // Auto apply routine discount
    setPromoCode('ROUTINE15');
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setPromoCode('');
    setDiscountAmount(0);
    setHasFreeShippingCoupon(false);
  };

  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const applyPromoCode = (code: string) => {
    const result = validatePromoCode(code, subtotal);
    if (result.valid) {
      setPromoCode(code.toUpperCase());
      setDiscountAmount(result.discountAmount);
      setHasFreeShippingCoupon(result.freeShipping);
      return { success: true, message: result.message };
    }
    return { success: false, message: result.message };
  };

  const removePromoCode = () => {
    setPromoCode('');
    setDiscountAmount(0);
    setHasFreeShippingCoupon(false);
  };

  const toggleSample = (sampleName: string) => {
    setSelectedSamples(prev => {
      if (prev.includes(sampleName)) {
        return prev.filter(s => s !== sampleName);
      }
      if (prev.length >= 2) {
        return [prev[1], sampleName]; // max 2 complimentary samples
      }
      return [...prev, sampleName];
    });
  };

  const calculatedShippingFee = subtotal >= freeShippingThreshold || hasFreeShippingCoupon || subtotal === 0
    ? 0 
    : (storeSettings.standardShippingFee || 30);

  const total = Math.max(0, subtotal - discountAmount + calculatedShippingFee);
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemsCount,
        subtotal,
        discount: discountAmount,
        promoCode,
        applyPromoCode,
        removePromoCode,
        shippingFee: calculatedShippingFee,
        total,
        freeShippingThreshold,
        progressToFreeShipping,
        isCartOpen,
        setIsCartOpen,
        selectedSamples,
        toggleSample,
        addRoutineBundleToCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

