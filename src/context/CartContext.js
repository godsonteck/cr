'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'cr_cart_items_v1';

const initialState = {
  items: [],
  isOpen: false, // Cart drawer open state
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'INIT_CART':
      return { ...state, items: action.payload || [] };

    case 'ADD_ITEM': {
      const { product, quantity = 1 } = action.payload;
      const existingIndex = state.items.findIndex(item => item.product.id === product.id);

      let newItems;
      if (existingIndex > -1) {
        newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity,
        };
      } else {
        newItems = [...state.items, { product, quantity }];
      }

      return {
        ...state,
        items: newItems,
        isOpen: action.openDrawer !== false ? true : state.isOpen,
      };
    }

    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => item.product.id !== action.payload.productId),
      };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.product.id !== productId),
        };
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        ),
      };
    }

    case 'CLEAR_CART':
      return { ...state, items: [] };

    case 'OPEN_DRAWER':
      return { ...state, isOpen: true };

    case 'CLOSE_DRAWER':
      return { ...state, isOpen: false };

    case 'TOGGLE_DRAWER':
      return { ...state, isOpen: !state.isOpen };

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        dispatch({ type: 'INIT_CART', payload: JSON.parse(saved) });
      }
    } catch (e) {
      console.warn('Could not read cart from localStorage', e);
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [state.items]);

  const addItem = (product, quantity = 1, openDrawer = true) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity }, openDrawer });
  };

  const removeItem = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const openDrawer = () => dispatch({ type: 'OPEN_DRAWER' });
  const closeDrawer = () => dispatch({ type: 'CLOSE_DRAWER' });
  const toggleDrawer = () => dispatch({ type: 'TOGGLE_DRAWER' });

  // Computed values
  const totalCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  
  // Delivery fee calculation based on business config
  const deliveryFee = subtotal >= 300 ? 0 : 25;
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        totalCount,
        subtotal,
        deliveryFee,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openDrawer,
        closeDrawer,
        toggleDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
