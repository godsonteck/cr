import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { ReviewsProvider } from './context/ReviewsContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <StoreProvider>
            <AuthProvider>
              <WishlistProvider>
                <CartProvider>
                  <ToastProvider>
                    <ReviewsProvider>
                      <App />
                    </ReviewsProvider>
                  </ToastProvider>
                </CartProvider>
              </WishlistProvider>
            </AuthProvider>
          </StoreProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);