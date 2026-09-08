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
import { AlertProvider } from './context/AlertContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { NotificationProvider } from './context/NotificationContext';
import './index.css';

// Auto-reload when Vite can't fetch a chunk (happens after a new deployment
// invalidates the old hashed filenames that the browser has cached).
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});


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
                    <AlertProvider>
                      <ReviewsProvider>
                        <NotificationProvider>
                          <App />
                        </NotificationProvider>
                      </ReviewsProvider>
                    </AlertProvider>
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