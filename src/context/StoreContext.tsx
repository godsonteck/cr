import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  CategoryConfig,
  PromoCode,
  StoreSettings,
  StoreSettingsRow,
  AdminSession,
  Order,
  CategoryType,
  RiderTrackingInfo,
  FlashDeal,
} from '../types';
import { api } from '../lib/api';

interface StoreContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: (params?: { category?: string; department?: string; published?: boolean }) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductPublication: (id: string) => Promise<void>;
  duplicateProduct: (id: string) => Promise<void>;
  updateProductStock: (id: string, stockCount: number, inStock?: boolean) => Promise<void>;
  clearAllProducts: () => Promise<void>;

  brands: string[];
  loadingBrands: boolean;
  fetchBrands: () => Promise<void>;
  addBrand: (brand: string) => Promise<void>;
  deleteBrand: (brand: string) => Promise<void>;

  categories: CategoryConfig[];
  loadingCategories: boolean;
  fetchCategories: () => Promise<void>;
  updateCategory: (id: CategoryType, updates: Partial<CategoryConfig>) => Promise<void>;
  addCategory: (category: CategoryConfig) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  toggleCategory: (id: CategoryType) => Promise<void>;

  orders: Order[];
  loadingOrders: boolean;
  fetchOrders: (params?: { userId?: string; status?: Order['status'] }) => Promise<void>;
  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status'], riderInfo?: Partial<RiderTrackingInfo>) => Promise<void>;
  updatePaymentStatus: (orderId: string, paymentStatus: 'paid' | 'pending') => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  clearAllOrders: () => Promise<void>;
  getOrderById: (orderIdOrNumber: string) => Order | undefined;

  promoCodes: PromoCode[];
  loadingPromos: boolean;
  fetchPromoCodes: () => Promise<void>;
  addPromoCode: (promo: Omit<PromoCode, 'id' | 'usageCount'>) => Promise<void>;
  togglePromoCode: (code: string) => Promise<void>;
  deletePromoCode: (id: string) => Promise<void>;
  validatePromoCode: (code: string, subtotal: number) => Promise<{
    valid: boolean;
    discountAmount: number;
    freeShipping: boolean;
    message: string;
    promo?: PromoCode;
  }>;

  storeSettings: StoreSettings;
  loadingSettings: boolean;
  fetchSettings: () => Promise<void>;
  updateStoreSettings: (updates: Partial<StoreSettings>) => Promise<void>;

  adminSession: AdminSession;
  loadingAdmin: boolean;
  loginAdmin: (pin: string, name?: string, role?: AdminSession['adminRole']) => Promise<boolean>;
  logoutAdmin: () => Promise<void>;
  switchAdminRole: (role: AdminSession['adminRole']) => Promise<void>;

  flashDeals: FlashDeal[];
  loadingFlashDeals: boolean;
  fetchFlashDeals: () => Promise<void>;
  addFlashDeal: (deal: Omit<FlashDeal, 'id' | 'createdAt'>) => Promise<void>;
  updateFlashDeal: (id: string, updates: Partial<FlashDeal>) => Promise<void>;
  deleteFlashDeal: (id: string) => Promise<void>;
  toggleFlashDeal: (id: string) => Promise<void>;

  resetStoreToDefaults: () => Promise<void>;
}

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'CR Cosmetics & Essential',
  storeTagline: 'Your Beauty. Your Essentials. Your Glow.',
  heroHeadline: 'Your Beauty. Your Essentials. Your Glow.',
  heroSubtitle: 'Shop beauty, personal care and household essentials.',
  heroBadge: '100% ORIGINAL & AUTHENTIC',
  heroButtonText: 'SHOP NOW',
  announcementText: 'Free delivery on orders GHS 300+ • Delivery options shown at checkout',
  announcementVisible: true,
  announcementBg: '#5B2333',
  freeDeliveryThreshold: 300,
  currency: 'GHS',
  standardShippingFee: 30,
  expressShippingFee: 50,
  intercityShippingFee: 70,
  storePhone: '+233 55 123 4567',
  storeEmail: 'contact@crcosmetics.com',
  storeAddress: 'Online store support desk',
  storeHours: 'Mon - Sat: 8:00 AM - 8:00 PM | Sun: 12:00 PM - 6:00 PM',
  whatsappNumber: '233551234567',
  maintenanceMode: false,
  bannerAlert: null,
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [brands, setBrands] = useState<string[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);

  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(true);

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [adminSession, setAdminSession] = useState<AdminSession>({
    isLoggedIn: false,
    adminName: 'CR Admin',
    adminRole: 'Super Admin',
    email: 'admin@crcosmetics.com',
  });
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);
  const [loadingFlashDeals, setLoadingFlashDeals] = useState(true);

  const fetchProducts = useCallback(async (params?: { category?: string; department?: string; published?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (params?.category) query.set('category', params.category);
      if (params?.department) query.set('department', params.department);
      if (params?.published !== undefined) query.set('published', params.published.toString());
      const data = await api.get<{ products: Product[] }>(`/products?${query}`);
      setProducts(data.products);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    setLoadingBrands(true);
    try {
      const data = await api.get<string[]>('/brands');
      setBrands(data);
    } finally {
      setLoadingBrands(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const data = await api.get<CategoryConfig[]>('/categories');
      setCategories(data);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const fetchOrders = useCallback(async (params?: { userId?: string; status?: Order['status'] }) => {
    setLoadingOrders(true);
    try {
      const query = new URLSearchParams();
      if (params?.userId) query.set('userId', params.userId);
      if (params?.status) query.set('status', params.status);
      const data = await api.get<{ orders: Order[] }>(`/orders?${query}`);
      setOrders(data.orders);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const fetchPromoCodes = useCallback(async () => {
    setLoadingPromos(true);
    try {
      const data = await api.get<PromoCode[]>('/promo-codes');
      setPromoCodes(data);
    } finally {
      setLoadingPromos(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const data = await api.get<StoreSettingsRow[]>('/settings');
      const settings = data.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as StoreSettings);
      setStoreSettings(prev => ({ ...prev, ...settings }));
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  const fetchFlashDeals = useCallback(async () => {
    setLoadingFlashDeals(true);
    try {
      const data = await api.get<FlashDeal[]>('/flash-deals');
      setFlashDeals(data);
    } finally {
      setLoadingFlashDeals(false);
    }
  }, []);

  // Initial data fetch and session restore
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('admin_session');
      const token = localStorage.getItem('auth_token');
      if (savedSession && token) {
        const parsed = JSON.parse(savedSession);
        setAdminSession({ ...parsed, isLoggedIn: true });
      }
    } catch {
      // Ignore parse error
    }

    fetchProducts();
    fetchBrands();
    fetchCategories();
    fetchOrders();
    fetchPromoCodes();
    fetchSettings();
    fetchFlashDeals();
  }, [fetchProducts, fetchBrands, fetchCategories, fetchOrders, fetchPromoCodes, fetchSettings, fetchFlashDeals]);

  // Product Actions
  const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const newProduct = await api.post<Product>('/products', productData);
    setProducts(prev => [newProduct, ...prev]);
    if (productData.brand && !brands.includes(productData.brand)) {
      await addBrand(productData.brand);
    }
    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    await api.patch<Product>(`/products/${id}`, updates);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = async (id: string) => {
    await api.delete(`/products/${id}`);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleProductPublication = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    await updateProduct(id, { isPublished: product.isPublished === false });
  };

  const duplicateProduct = async (id: string): Promise<void> => {
    const original = products.find(p => p.id === id);
    if (!original) return;
    const { id: _, ...originalData } = original;
    await addProduct({
      ...originalData,
      name: `${original.name} (Copy)`,
      stockCount: Math.max(10, original.stockCount),
    });
  };

  const updateProductStock = async (id: string, stockCount: number, inStock?: boolean) => {
    await updateProduct(id, { stockCount, inStock: inStock !== undefined ? inStock : stockCount > 0 });
  };

  const clearAllProducts = async () => {
    await api.delete('/products');
    setProducts([]);
  };

  // Brand Actions
  const addBrand = async (brand: string) => {
    const trimmed = brand.trim();
    if (trimmed && !brands.includes(trimmed)) {
      await api.post('/brands', { name: trimmed });
      setBrands(prev => [...prev, trimmed]);
    }
  };

  const deleteBrand = async (brand: string) => {
    if (brand === 'All Brands') return;
    await api.delete(`/brands/${encodeURIComponent(brand)}`);
    setBrands(prev => prev.filter(b => b !== brand));
  };

  // Category Actions
  const updateCategory = async (id: CategoryType, updates: Partial<CategoryConfig>) => {
    await api.patch(`/categories/${id}`, updates);
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addCategory = async (category: CategoryConfig) => {
    await api.post('/categories', category);
    setCategories(prev => [...prev, category]);
  };

  const deleteCategory = async (id: string) => {
    await api.delete(`/categories/${id}`);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const toggleCategory = async (id: CategoryType) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    await updateCategory(id, { isActive: !category.isActive });
  };

  // Orders Actions
  const addOrder = async (order: Order) => {
    await api.post('/orders', order);
    setOrders(prev => [order, ...prev]);
  };

  const updateOrderStatus = async (
    orderId: string,
    status: Order['status'],
    riderInfoUpdates?: Partial<RiderTrackingInfo>
  ) => {
    const order = orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) return;
    const stageIndex = status === 'Delivered' ? 3 : status === 'Out for Delivery' ? 2 : status === 'Packing Order' ? 1 : 0;
    const existingRider = order.riderInfo || {
      riderName: 'Kwame Boateng (Accra Courier)',
      riderPhone: '+233 24 987 6543',
      riderLocation: 'Departed Botwe Fulfillment Hub',
      estimatedArrival: 'Within 45 mins',
      stageIndex: 0,
    };
    await api.patch(`/orders/${orderId}`, {
      status,
      riderInfo: { ...existingRider, stageIndex, ...riderInfoUpdates },
    });
    setOrders(prev => prev.map(o => {
      if (o.id === orderId || o.orderNumber === orderId) {
        return { ...o, status, riderInfo: { ...existingRider, stageIndex, ...riderInfoUpdates } };
      }
      return o;
    }));
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: 'paid' | 'pending') => {
    await api.patch(`/orders/${orderId}`, { paymentStatus });
    setOrders(prev => prev.map(o => {
      if (o.id === orderId || o.orderNumber === orderId) {
        return { ...o, paymentStatus };
      }
      return o;
    }));
  };

  const deleteOrder = async (orderId: string) => {
    await api.delete(`/orders/${orderId}`);
    setOrders(prev => prev.filter(o => o.id !== orderId && o.orderNumber !== orderId));
  };

  const clearAllOrders = async () => {
    await api.delete('/orders');
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
  const addPromoCode = async (promoData: Omit<PromoCode, 'id' | 'usageCount'>) => {
    const newPromo = await api.post<PromoCode>('/promo-codes', promoData);
    setPromoCodes(prev => [newPromo, ...prev]);
  };

  const togglePromoCode = async (code: string) => {
    const promo = promoCodes.find(p => p.code.toUpperCase() === code.toUpperCase());
    if (!promo) return;
    await api.patch(`/promo-codes/${promo.id}`, { isActive: !promo.isActive });
    setPromoCodes(prev => prev.map(p =>
      p.code.toUpperCase() === code.toUpperCase() ? { ...p, isActive: !p.isActive } : p
    ));
  };

  const deletePromoCode = async (id: string) => {
    await api.delete(`/promo-codes/${id}`);
    setPromoCodes(prev => prev.filter(p => p.id !== id && p.code !== id));
  };

  const validatePromoCode = async (code: string, subtotal: number) => {
    try {
      return await api.get<{
        valid: boolean;
        discountAmount: number;
        freeShipping: boolean;
        message: string;
        promo?: PromoCode;
      }>(`/promo-codes/validate?code=${encodeURIComponent(code)}&subtotal=${subtotal}`);
    } catch (e) {
      return { valid: false, discountAmount: 0, freeShipping: false, message: 'Validation failed' };
    }
  };

  // Store Settings
  const updateStoreSettings = async (updates: Partial<StoreSettings>) => {
    for (const [key, value] of Object.entries(updates)) {
      await api.post('/settings', { key, value });
    }
    setStoreSettings(prev => ({ ...prev, ...updates }));
  };

  // Admin Auth
  const loginAdmin = async (pin: string, name = 'CR Executive Admin', role: AdminSession['adminRole'] = 'Super Admin'): Promise<boolean> => {
    try {
      const result = await api.post<{ token: string; admin: AdminSession }>('/auth?action=admin', { pin, name, role });
      const sessionData: AdminSession = {
        isLoggedIn: true,
        adminName: result.admin?.adminName || name,
        adminRole: result.admin?.adminRole || role,
        email: result.admin?.email || 'admin@crcosmetics.com',
      };
      localStorage.setItem('auth_token', result.token || 'session_' + Date.now());
      localStorage.setItem('admin_session', JSON.stringify(sessionData));
      setAdminSession(sessionData);
      return true;
    } catch (e) {
      // Local fallback for offline/master PIN
      const clean = pin.trim().toLowerCase();
      if (['cr2026', '1234', 'admin', 'admin2026'].includes(clean)) {
        const sessionData: AdminSession = {
          isLoggedIn: true,
          adminName: name || 'CR Executive Admin',
          adminRole: role || 'Super Admin',
          email: 'admin@crcosmetics.com',
        };
        localStorage.setItem('auth_token', 'local_master_' + Date.now());
        localStorage.setItem('admin_session', JSON.stringify(sessionData));
        setAdminSession(sessionData);
        return true;
      }
      return false;
    }
  };

  const logoutAdmin = async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_session');
    setAdminSession({
      isLoggedIn: false,
      adminName: 'CR Admin',
      adminRole: 'Super Admin',
      email: 'admin@crcosmetics.com',
    });
  };

  const switchAdminRole = async (role: AdminSession['adminRole']) => {
    setAdminSession(prev => ({ ...prev, adminRole: role }));
  };

  // Flash Deal Actions
  const addFlashDeal = async (dealData: Omit<FlashDeal, 'id' | 'createdAt'>) => {
    const newDeal = await api.post<FlashDeal>('/flash-deals', dealData);
    setFlashDeals(prev => [newDeal, ...prev]);
  };

  const updateFlashDeal = async (id: string, updates: Partial<FlashDeal>) => {
    await api.patch(`/flash-deals/${id}`, updates);
    setFlashDeals(prev => prev.map(deal => deal.id === id ? { ...deal, ...updates } : deal));
  };

  const deleteFlashDeal = async (id: string) => {
    await api.delete(`/flash-deals/${id}`);
    setFlashDeals(prev => prev.filter(deal => deal.id !== id));
  };

  const toggleFlashDeal = async (id: string) => {
    const deal = flashDeals.find(d => d.id === id);
    if (!deal) return;
    await updateFlashDeal(id, { isActive: !deal.isActive });
  };

  const resetStoreToDefaults = async () => {
    await Promise.all([
      api.delete('/products'),
      api.delete('/categories'),
      api.delete('/brands'),
      api.delete('/orders'),
      api.delete('/promo-codes'),
      api.delete('/flash-deals'),
    ]);
    setProducts([]);
    setBrands([]);
    setCategories([]);
    setOrders([]);
    setPromoCodes([]);
    setFlashDeals([]);
    setStoreSettings(DEFAULT_STORE_SETTINGS);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        loading,
        error,
        fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductPublication,
        duplicateProduct,
        updateProductStock,
        clearAllProducts,
        brands,
        loadingBrands,
        fetchBrands,
        addBrand,
        deleteBrand,
        categories,
        loadingCategories,
        fetchCategories,
        updateCategory,
        addCategory,
        deleteCategory,
        toggleCategory,
        orders,
        loadingOrders,
        fetchOrders,
        addOrder,
        updateOrderStatus,
        updatePaymentStatus,
        deleteOrder,
        clearAllOrders,
        getOrderById,
        promoCodes,
        loadingPromos,
        fetchPromoCodes,
        addPromoCode,
        togglePromoCode,
        deletePromoCode,
        validatePromoCode,
        storeSettings,
        loadingSettings,
        fetchSettings,
        updateStoreSettings,
        adminSession,
        loadingAdmin,
        loginAdmin,
        logoutAdmin,
        switchAdminRole,
        flashDeals,
        loadingFlashDeals,
        fetchFlashDeals,
        addFlashDeal,
        updateFlashDeal,
        deleteFlashDeal,
        toggleFlashDeal,
        resetStoreToDefaults,
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