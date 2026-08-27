import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  CategoryConfig, 
  PromoCode, 
  StoreSettings, 
  AdminSession, 
  Order, 
  CategoryType,
  RiderTrackingInfo
} from '../types';
import { PRODUCTS, BRANDS_LIST, CATEGORIES_CONFIG } from '../data/products';

interface StoreContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
  updateProductStock: (id: string, stockCount: number, inStock?: boolean) => void;
  clearAllProducts: () => void;
  
  // Brands
  brands: string[];
  addBrand: (brand: string) => void;
  deleteBrand: (brand: string) => void;

  // Categories
  categories: CategoryConfig[];
  updateCategory: (id: CategoryType, updates: Partial<CategoryConfig>) => void;
  addCategory: (category: CategoryConfig) => void;
  deleteCategory: (id: string) => void;

  // Orders & Dispatch Management
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status'], riderInfo?: Partial<RiderTrackingInfo>) => void;
  updatePaymentStatus: (orderId: string, paymentStatus: 'paid' | 'pending') => void;
  deleteOrder: (orderId: string) => void;
  clearAllOrders: () => void;
  getOrderById: (orderIdOrNumber: string) => Order | undefined;

  // Promo Codes
  promoCodes: PromoCode[];
  addPromoCode: (promo: Omit<PromoCode, 'id' | 'usageCount'>) => void;
  togglePromoCode: (code: string) => void;
  deletePromoCode: (id: string) => void;
  validatePromoCode: (code: string, subtotal: number) => { 
    valid: boolean; 
    discountAmount: number; 
    freeShipping: boolean; 
    message: string;
    promo?: PromoCode;
  };

  // Store & Website Settings
  storeSettings: StoreSettings;
  updateStoreSettings: (updates: Partial<StoreSettings>) => void;

  // Admin Session & Authentication
  adminSession: AdminSession;
  loginAdmin: (pin: string, name?: string, role?: AdminSession['adminRole']) => boolean;
  logoutAdmin: () => void;
  switchAdminRole: (role: AdminSession['adminRole']) => void;

  // Utility & Full Reset
  resetStoreToDefaults: () => void;
}

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'CR Cosmetics & Essential',
  storeTagline: 'Your Beauty. Your Essentials. Your Glow.',
  heroHeadline: 'Your Beauty. Your Essentials. Your Glow.',
  heroSubtitle: 'Carefully selected beauty and everyday essentials just for you.',
  heroBadge: '100% ORIGINAL & AUTHENTIC',
  heroButtonText: 'SHOP NOW',
  announcementText: 'Free Delivery on Orders GHS 300+ • 100% Authentic Products • Same-Day Accra Dispatch',
  announcementVisible: true,
  announcementBg: '#5B2333',
  freeDeliveryThreshold: 300,
  currency: 'GHS',
  standardShippingFee: 30,
  expressShippingFee: 50,
  intercityShippingFee: 70,
  storePhone: '+233 55 123 4567',
  storeEmail: 'contact@crcosmetics.com',
  storeAddress: 'Botwe School Junction Store Hub, East Legon / Botwe, Accra',
  storeHours: 'Mon - Sat: 8:00 AM - 8:00 PM | Sun: 12:00 PM - 6:00 PM',
  whatsappNumber: '233551234567',
  maintenanceMode: false,
  bannerAlert: null
};

const DEFAULT_PROMO_CODES: PromoCode[] = [
  {
    id: 'promo-cr10',
    code: 'CR10',
    discountType: 'percentage',
    discountValue: 10,
    minSpend: 150,
    freeShipping: false,
    isActive: true,
    usageCount: 0,
    description: '10% off for orders above GHS 150',
    expiryDate: '2026-12-31'
  },
  {
    id: 'promo-welcome20',
    code: 'WELCOME20',
    discountType: 'fixed',
    discountValue: 20,
    minSpend: 100,
    freeShipping: false,
    isActive: true,
    usageCount: 0,
    description: 'GHS 20 instant discount for beauty shoppers',
    expiryDate: '2026-12-31'
  }
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'cr_admin_session';
const PRODUCTS_STORAGE_KEY = 'cr_store_products';
const BRANDS_STORAGE_KEY = 'cr_store_brands';
const ORDERS_STORAGE_KEY = 'cr_store_orders';
const SETTINGS_STORAGE_KEY = 'cr_store_settings';
const PROMOS_STORAGE_KEY = 'cr_store_promos';
const CATEGORIES_STORAGE_KEY = 'cr_store_categories';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Products State (Editable and manageable via Admin)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return PRODUCTS;
  });

  // 2. Brands State
  const [brands, setBrands] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(BRANDS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return BRANDS_LIST;
  });

  // 3. Categories State
  const [categories, setCategories] = useState<CategoryConfig[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return CATEGORIES_CONFIG as CategoryConfig[];
  });

  // 4. Orders State - Clean real store orders (starts empty unless customers place orders)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // 5. Promo Codes State
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    try {
      const saved = localStorage.getItem(PROMOS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PROMO_CODES;
  });

  // 6. Store Settings State
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_STORE_SETTINGS;
  });

  // 7. Admin Session State
  const [adminSession, setAdminSession] = useState<AdminSession>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      isLoggedIn: false,
      adminName: 'CR Admin',
      adminRole: 'Super Admin',
      email: 'admin@crcosmetics.com'
    };
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(brands));
    } catch (e) {
      console.error(e);
    }
  }, [brands]);

  useEffect(() => {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(PROMOS_STORAGE_KEY, JSON.stringify(promoCodes));
    } catch (e) {
      console.error(e);
    }
  }, [promoCodes]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(storeSettings));
    } catch (e) {
      console.error(e);
    }
  }, [storeSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminSession));
    } catch (e) {
      console.error(e);
    }
  }, [adminSession]);

  // Product Actions
  const addProduct = (productData: Omit<Product, 'id'>): Product => {
    const newId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newProduct: Product = {
      ...productData,
      id: newId,
      rating: productData.rating || 5.0,
      reviewCount: productData.reviewCount || 0,
      images: productData.images && productData.images.length > 0 ? productData.images : [productData.image]
    };
    setProducts(prev => [newProduct, ...prev]);

    // If new brand is introduced, add to brands list automatically
    if (productData.brand && !brands.includes(productData.brand)) {
      addBrand(productData.brand);
    }

    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates };
        if (updates.image && (!updates.images || updates.images.length === 0)) {
          updated.images = [updates.image];
        }
        return updated;
      }
      return p;
    }));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const duplicateProduct = (id: string) => {
    const original = products.find(p => p.id === id);
    if (!original) return;
    const duplicated: Product = {
      ...original,
      id: `prod-${Date.now()}`,
      name: `${original.name} (Copy)`,
      stockCount: Math.max(10, original.stockCount)
    };
    setProducts(prev => [duplicated, ...prev]);
  };

  const updateProductStock = (id: string, stockCount: number, inStock?: boolean) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          stockCount,
          inStock: inStock !== undefined ? inStock : stockCount > 0
        };
      }
      return p;
    }));
  };

  const clearAllProducts = () => {
    setProducts([]);
  };

  // Brand Actions
  const addBrand = (brand: string) => {
    const trimmed = brand.trim();
    if (trimmed && !brands.includes(trimmed)) {
      setBrands(prev => [...prev, trimmed]);
    }
  };

  const deleteBrand = (brand: string) => {
    if (brand === 'All Brands') return;
    setBrands(prev => prev.filter(b => b !== brand));
  };

  // Category Actions
  const updateCategory = (id: CategoryType, updates: Partial<CategoryConfig>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addCategory = (category: CategoryConfig) => {
    setCategories(prev => [...prev, category]);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Orders Actions
  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    // Deduct stock from products
    order.items.forEach(item => {
      updateProductStock(
        item.product.id, 
        Math.max(0, (item.product.stockCount || 10) - item.quantity),
        (item.product.stockCount || 10) - item.quantity > 0
      );
    });
  };

  const updateOrderStatus = (
    orderId: string, 
    status: Order['status'], 
    riderInfoUpdates?: Partial<RiderTrackingInfo>
  ) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId || o.orderNumber === orderId) {
        const stageIndex = status === 'Delivered' ? 3 : status === 'Out for Delivery' ? 2 : status === 'Packing Order' ? 1 : 0;
        const existingRider = o.riderInfo || {
          riderName: 'Kwame Boateng (Accra Courier)',
          riderPhone: '+233 24 987 6543',
          riderLocation: 'Departed Botwe Fulfillment Hub',
          estimatedArrival: 'Within 45 mins',
          stageIndex: 0
        };
        return {
          ...o,
          status,
          riderInfo: {
            ...existingRider,
            stageIndex,
            ...(riderInfoUpdates || {})
          }
        };
      }
      return o;
    }));
  };

  const updatePaymentStatus = (orderId: string, paymentStatus: 'paid' | 'pending') => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId || o.orderNumber === orderId) {
        return { ...o, paymentStatus };
      }
      return o;
    }));
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId && o.orderNumber !== orderId));
  };

  const clearAllOrders = () => {
    setOrders([]);
  };

  const getOrderById = (orderIdOrNumber: string): Order | undefined => {
    const clean = orderIdOrNumber.trim().toUpperCase();
    return orders.find(o => 
      o.id.toUpperCase() === clean || 
      o.orderNumber.toUpperCase() === clean ||
      o.orderNumber.toUpperCase().includes(clean)
    );
  };

  // Promo Code Actions
  const addPromoCode = (promoData: Omit<PromoCode, 'id' | 'usageCount'>) => {
    const newPromo: PromoCode = {
      ...promoData,
      id: `promo-${Date.now()}`,
      code: promoData.code.trim().toUpperCase(),
      usageCount: 0
    };
    setPromoCodes(prev => [newPromo, ...prev]);
  };

  const togglePromoCode = (code: string) => {
    setPromoCodes(prev => prev.map(p => {
      if (p.code.toUpperCase() === code.toUpperCase()) {
        return { ...p, isActive: !p.isActive };
      }
      return p;
    }));
  };

  const deletePromoCode = (id: string) => {
    setPromoCodes(prev => prev.filter(p => p.id !== id && p.code !== id));
  };

  const validatePromoCode = (code: string, subtotal: number) => {
    const cleanCode = code.trim().toUpperCase();
    const matched = promoCodes.find(p => p.code.toUpperCase() === cleanCode);

    if (!matched) {
      return { valid: false, discountAmount: 0, freeShipping: false, message: 'Invalid promo code' };
    }

    if (!matched.isActive) {
      return { valid: false, discountAmount: 0, freeShipping: false, message: 'This promo code is currently disabled.' };
    }

    if (matched.minSpend && subtotal < matched.minSpend) {
      return { 
        valid: false, 
        discountAmount: 0, 
        freeShipping: false, 
        message: `Requires minimum order of GHS ${matched.minSpend.toFixed(2)}` 
      };
    }

    let discountAmount = 0;
    if (matched.discountType === 'percentage') {
      discountAmount = (subtotal * matched.discountValue) / 100;
    } else {
      discountAmount = matched.discountValue;
    }

    return {
      valid: true,
      discountAmount,
      freeShipping: !!matched.freeShipping,
      message: `${matched.code} applied! ${matched.description}`,
      promo: matched
    };
  };

  // Store Settings
  const updateStoreSettings = (updates: Partial<StoreSettings>) => {
    setStoreSettings(prev => ({ ...prev, ...updates }));
  };

  // Admin Auth
  const loginAdmin = (pin: string, name = 'CR Store Admin', role: AdminSession['adminRole'] = 'Super Admin') => {
    if (pin.trim() === '1234' || pin.trim() === 'admin' || pin.trim() === 'cr2026' || pin.trim() === '0000' || pin.length >= 4) {
      const session: AdminSession = {
        isLoggedIn: true,
        adminName: name,
        adminRole: role,
        email: 'admin@crcosmetics.com'
      };
      setAdminSession(session);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setAdminSession({
      isLoggedIn: false,
      adminName: 'CR Admin',
      adminRole: 'Super Admin',
      email: 'admin@crcosmetics.com'
    });
  };

  const switchAdminRole = (role: AdminSession['adminRole']) => {
    setAdminSession(prev => ({ ...prev, adminRole: role }));
  };

  // Reset to initial catalog data
  const resetStoreToDefaults = () => {
    setProducts(PRODUCTS);
    setBrands(BRANDS_LIST);
    setCategories(CATEGORIES_CONFIG as CategoryConfig[]);
    setOrders([]);
    setPromoCodes(DEFAULT_PROMO_CODES);
    setStoreSettings(DEFAULT_STORE_SETTINGS);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        updateProductStock,
        clearAllProducts,
        brands,
        addBrand,
        deleteBrand,
        categories,
        updateCategory,
        addCategory,
        deleteCategory,
        orders,
        addOrder,
        updateOrderStatus,
        updatePaymentStatus,
        deleteOrder,
        clearAllOrders,
        getOrderById,
        promoCodes,
        addPromoCode,
        togglePromoCode,
        deletePromoCode,
        validatePromoCode,
        storeSettings,
        updateStoreSettings,
        adminSession,
        loginAdmin,
        logoutAdmin,
        switchAdminRole,
        resetStoreToDefaults
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
