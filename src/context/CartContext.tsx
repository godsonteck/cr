import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Product, ProductVariant } from '../types';
import { useStore } from './StoreContext';
import { api } from '../lib/api';

interface CartContextType {
  cart: CartItem[];
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (product: Product, quantity?: number, selectedOption?: string, selectedVariant?: ProductVariant) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItemsCount: number;
  totalItems: number;
  subtotal: number;
  discount: number;
  promoCode: string;
  applyPromoCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removePromoCode: () => Promise<void>;
  shippingFee: number;
  total: number;
  freeShippingThreshold: number;
  progressToFreeShipping: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  selectedSamples: string[];
  toggleSample: (sampleName: string) => Promise<void>;
  addRoutineBundleToCart: (productIds: string[]) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { products, storeSettings, validatePromoCode } = useStore();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [hasFreeShippingCoupon, setHasFreeShippingCoupon] = useState<boolean>(false);
  const [selectedSamples, setSelectedSamples] = useState<string[]>(['Baobab Barrier Crème (5ml Sample)']);

  const freeShippingThreshold = storeSettings.freeDeliveryThreshold || 300;

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{
        items: CartItem[];
        promoCode: string | null;
        discountAmount: number;
        hasFreeShippingCoupon: boolean;
        selectedSamples: string[];
      }>('/cart');
      setCart(data.items);
      setPromoCode(data.promoCode || '');
      setDiscountAmount(data.discountAmount);
      setHasFreeShippingCoupon(data.hasFreeShippingCoupon);
      setSelectedSamples(data.selectedSamples);
    } catch (e) {
      console.error('Failed to fetch cart:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveCart = useCallback(async () => {
    try {
      await api.post('/cart', {
        items: cart,
        promoCode,
        discountAmount,
        hasFreeShippingCoupon,
        selectedSamples,
      });
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cart, promoCode, discountAmount, hasFreeShippingCoupon, selectedSamples]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    saveCart();
  }, [saveCart]);

  const addToCart = async (product: Product, quantity = 1, selectedOption?: string, selectedVariant?: ProductVariant) => {
    if (!product.inStock || product.stockCount <= 0) return;
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id && item.selectedOption === selectedOption);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity = Math.min(product.stockCount, updated[existingIndex].quantity + quantity);
        return updated;
      }
      return [...prev, { product: selectedVariant ? { ...product, price: selectedVariant.price, originalPrice: selectedVariant.originalPrice, inStock: selectedVariant.inStock } : product, quantity: Math.min(product.stockCount, quantity), selectedOption, selectedVariant }];
    });
    setIsCartOpen(true);
  };

  const addRoutineBundleToCart = async (productIds: string[]) => {
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
    setPromoCode('ROUTINE15');
    setIsCartOpen(true);
  };

  const removeFromCart = async (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.product.id === productId ? { ...item, quantity: Math.min(item.product.stockCount, quantity) } : item))
    );
  };

  const clearCart = async () => {
    setCart([]);
    setPromoCode('');
    setDiscountAmount(0);
    setHasFreeShippingCoupon(false);
  };

  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const applyPromoCode = async (code: string) => {
    const result = await validatePromoCode(code, subtotal);
    if (result.valid) {
      setPromoCode(code.toUpperCase());
      setDiscountAmount(result.discountAmount);
      setHasFreeShippingCoupon(result.freeShipping);
      return { success: true, message: result.message };
    }
    return { success: false, message: result.message };
  };

  const removePromoCode = async () => {
    setPromoCode('');
    setDiscountAmount(0);
    setHasFreeShippingCoupon(false);
  };

  const toggleSample = async (sampleName: string) => {
    setSelectedSamples(prev => {
      if (prev.includes(sampleName)) {
        return prev.filter(s => s !== sampleName);
      }
      if (prev.length >= 2) {
        return [prev[1], sampleName];
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
        cartItems: cart,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemsCount,
        totalItems: totalItemsCount,
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
        addRoutineBundleToCart,
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