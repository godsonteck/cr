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
  hasFreeShippingCoupon: boolean;
  progressToFreeShipping: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  selectedSamples: string[];
  toggleSample: (sampleName: string) => Promise<void>;
  addRoutineBundleToCart: (productIds: string[]) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type SavedCart = {
  items: CartItem[];
  promoCode: string;
  discountAmount: number;
  hasFreeShippingCoupon: boolean;
  selectedSamples: string[];
};

const readSavedCart = (): SavedCart => {
  try {
    const saved = localStorage.getItem('cr_cart');
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<SavedCart>;
      return {
        items: Array.isArray(parsed.items) ? parsed.items : [],
        promoCode: parsed.promoCode || '',
        discountAmount: Number(parsed.discountAmount) || 0,
        hasFreeShippingCoupon: Boolean(parsed.hasFreeShippingCoupon),
        selectedSamples: Array.isArray(parsed.selectedSamples) ? parsed.selectedSamples : ['Baobab Barrier Crème (5ml Sample)'],
      };
    }
  } catch {
    // Ignore malformed local cart data and start with an empty cart.
  }
  return { items: [], promoCode: '', discountAmount: 0, hasFreeShippingCoupon: false, selectedSamples: ['Baobab Barrier Crème (5ml Sample)'] };
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { products, storeSettings, validatePromoCode } = useStore();
  const savedCart = React.useRef(readSavedCart());

  const [cart, setCart] = useState<CartItem[]>(savedCart.current.items);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState<string>(savedCart.current.promoCode);
  const [discountAmount, setDiscountAmount] = useState<number>(savedCart.current.discountAmount);
  const [hasFreeShippingCoupon, setHasFreeShippingCoupon] = useState<boolean>(savedCart.current.hasFreeShippingCoupon);
  const [selectedSamples, setSelectedSamples] = useState<string[]>(savedCart.current.selectedSamples);

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
      const items = Array.isArray(data.items) ? data.items : [];
      const hydratedItems = items.flatMap((item: CartItem & { productId?: string }) => {
        if (item.product) return [item];
        const product = products.find(candidate => candidate.id === item.productId);
        return product ? [{ ...item, product }] : [];
      });
      if (hydratedItems.length > 0 || items.length === 0) setCart(hydratedItems);
      setPromoCode(data.promoCode || '');
      setDiscountAmount(data.discountAmount);
      setHasFreeShippingCoupon(data.hasFreeShippingCoupon);
      setSelectedSamples(Array.isArray(data.selectedSamples) ? data.selectedSamples : savedCart.current.selectedSamples);
    } catch (e) {
      console.error('Failed to fetch cart:', e);
      // Keep the local snapshot when the cart API is unavailable or the user is offline.
    } finally {
      setLoading(false);
      setIsHydrated(true);
    }
  }, [products]);

  const saveCart = useCallback(async () => {
    if (!isHydrated) return;
    localStorage.setItem('cr_cart', JSON.stringify({ items: cart, promoCode, discountAmount, hasFreeShippingCoupon, selectedSamples }));
    try {
      await api.post('/cart', {
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          selectedOption: item.selectedOption,
          selectedVariant: item.selectedVariant,
        })),
        promoCode,
        discountAmount,
        hasFreeShippingCoupon,
        selectedSamples,
      });
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cart, promoCode, discountAmount, hasFreeShippingCoupon, selectedSamples, isHydrated]);

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
        hasFreeShippingCoupon,
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