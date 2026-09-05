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
  AdminAccount,
  AdminNotification,
} from '../types';
import { api } from '../lib/api';
import { PRODUCTS, CATEGORIES_CONFIG, BRANDS_LIST } from '../data/products';

interface StoreContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: (params?: { category?: string; department?: string; published?: boolean; includeUnpublished?: boolean }) => Promise<void>;
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
  updateOrderStatus: (orderId: string, status: Order['status'], riderInfo?: Partial<RiderTrackingInfo>, estimatedDeliveryTime?: string) => Promise<void>;
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
  adminAccounts: AdminAccount[];
  loadingAdmin: boolean;
  loginAdmin: (pin: string, name?: string, role?: AdminSession['adminRole'], email?: string) => Promise<boolean>;
  logoutAdmin: () => Promise<void>;
  switchAdminRole: (role: AdminSession['adminRole']) => Promise<void>;
  fetchAdminAccounts: () => Promise<void>;
  addAdminAccount: (account: Omit<AdminAccount, 'id'> & { pin?: string }) => Promise<AdminAccount>;
  updateAdminAccount: (id: string, updates: Partial<AdminAccount>) => Promise<void>;
  deleteAdminAccount: (id: string) => Promise<void>;
  changeAdminPassword: (currentPin: string, newPin: string) => Promise<void>;
  adminNotifications: AdminNotification[];
  fetchAdminNotifications: () => Promise<void>;
  markAdminNotificationsRead: (id?: string) => Promise<void>;

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
  storeName: 'CR COSMETICS AND ESSENTIALS',
  storeTagline: '',
  heroHeadline: 'Beauty essentials for a better you.',
  heroSubtitle: 'A considered shop for skincare, beauty, fragrance, and the everyday essentials that make life a little easier.',
  heroImage: '',
  heroBadge: '',
  heroButtonText: 'Shop now',
  heroSecondaryButtonText: '',
  homepageFlashDealLabel: '',
  homepageHotDealsTitle: 'Hot deals',
  homepageNewArrivalsTitle: 'New arrivals',
  homepageBeautyTitle: 'Beauty',
  homepageGroceryTitle: 'Essentials',
  navAllCategoriesLabel: 'All categories',
  navOffersLabel: 'Offers',
  navShopLabel: 'Shop',
  navBeautyLabel: 'Beauty',
  navGroceriesLabel: 'Essentials',
  navAboutLabel: 'About',
  announcementText: '',
  announcementVisible: false,
  announcementBg: '#1E1719',
  homepageSections: {
    flashDeal: true,
    hero: true,
    categories: true,
    hotDeals: true,
    bestSellers: true,
    newArrivals: true,
    beauty: true,
    groceryFeed: true,
    recommendedForYou: true,
  },
  pageVisibility: {
    home: true,
    beauty: true,
    groceries: true,
    shop: true,
    products: true,
    search: true,
    account: true,
    checkout: true,
    about: true,
    support: true,
    contact: true,
    offers: true,
  },
  freeDeliveryThreshold: 300,
  currency: 'GHS',
  standardShippingFee: 30,
  expressShippingFee: 50,
  intercityShippingFee: 70,
  storePhone: '+233 59 215 3306',
  storeEmail: 'contact@crcosmetics.com',
  storeAddress: 'East Legon / Accra Shopping Hub, Ghana',
  storeHours: 'Mon - Sat: 8:00 AM - 8:00 PM | Sun: 12:00 PM - 6:00 PM',
  whatsappNumber: '233592153306',
  maintenanceMode: false,
  bannerAlert: null,
  deliveryZones: [
    { name: 'Accra', keywords: ['accra', 'east legon', 'madina', 'tema', 'airport', 'osu'], fee: 30 },
    { name: 'Other locations', keywords: [], fee: 70 },
  ],
  productDeliveryMessage: '',
  productProtectionMessage: '',
  productReturnsMessage: '',
  productShippingMessage: '',
  productDealLabel: '',
  productSaleHeading: '',
  productWholesaleMessage: '',
  productPricingNote: '',
  productVoucherMessage: '',
};

const normalizeStoreSettings = (settings: Partial<StoreSettings>): Partial<StoreSettings> => ({
  ...settings,
  storeName: settings.storeName === 'CR Mart' || settings.storeName === 'CR Cosmetics' || settings.storeName === 'CR Cosmetics & Essentials' || settings.storeName === 'CR Cosmetics and Essential'
    ? 'CR COSMETICS AND ESSENTIALS'
    : (settings.storeName?.trim() || 'CR COSMETICS AND ESSENTIALS'),
  storeTagline: '',
  heroHeadline: settings.heroHeadline === 'Everyday care, chosen well.' || settings.heroHeadline === 'Minimal beauty for everyday rituals.' || settings.heroHeadline === 'Beauty made simple.' || settings.heroHeadline === 'Your Beauty. Your Essentials. Your Glow.' || settings.heroHeadline === 'The things you reach for.' ? 'Beauty essentials for a better you.' : (settings.heroHeadline || 'Beauty essentials for a better you.'),
  heroSubtitle: settings.heroSubtitle === 'A considered edit of skincare, beauty, fragrances and everyday essentials.' || settings.heroSubtitle === 'Thoughtful skincare, fragrance and daily essentials designed to feel simple and elevated.' || settings.heroSubtitle === 'Curated skincare, fragrance, and everyday essentials chosen for a calmer, more elevated routine.' || settings.heroSubtitle === 'Shop beauty, personal care and household essentials.' ? 'A considered shop for skincare, beauty, fragrance, and the everyday essentials that make life a little easier.' : (settings.heroSubtitle || 'A considered shop for skincare, beauty, fragrance, and the everyday essentials that make life a little easier.'),
  heroButtonText: settings.heroButtonText === 'Shop the collection' || settings.heroButtonText === 'Shop collection' || settings.heroButtonText === 'Shop now' ? 'Shop now' : (settings.heroButtonText || 'Shop now'),
  homepageHotDealsTitle: settings.homepageHotDealsTitle === "Today's hot deals" ? 'Hot deals' : (settings.homepageHotDealsTitle || 'Hot deals'),
  homepageBeautyTitle: settings.homepageBeautyTitle === 'Beauty & skincare' ? 'Beauty essentials' : (settings.homepageBeautyTitle || 'Beauty essentials'),
  homepageGroceryTitle: settings.homepageGroceryTitle === 'Groceries & essentials' ? 'Daily essentials' : (settings.homepageGroceryTitle || 'Daily essentials'),
  navAllCategoriesLabel: settings.navAllCategoriesLabel === 'All Categories' ? 'All categories' : (settings.navAllCategoriesLabel || 'All categories'),
  navOffersLabel: settings.navOffersLabel === 'SuperDeals' ? 'Offers' : (settings.navOffersLabel || 'Offers'),
  navShopLabel: settings.navShopLabel === 'Shop All' ? 'Shop' : (settings.navShopLabel || 'Shop'),
  navBeautyLabel: settings.navBeautyLabel === 'Beauty & Skincare' ? 'Beauty' : (settings.navBeautyLabel || 'Beauty'),
  navGroceriesLabel: settings.navGroceriesLabel === 'Groceries & Essentials' ? 'Essentials' : (settings.navGroceriesLabel || 'Essentials'),
  navAboutLabel: settings.navAboutLabel === 'About Us' ? 'About' : (settings.navAboutLabel || 'About'),
  storeAddress: (settings.storeAddress || 'East Legon / Accra Shopping Hub, Ghana').replace(/\s*\(Google Maps:\s*https?:\/\/[^)]+\)/i, '').trim(),
});

const INITIAL_ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    id: 'admin-1',
    fullName: 'Store Administrator',
    email: 'admin@crcosmetics.com',
    phone: '+233 20 000 0000',
    role: 'super_admin',
  },
  {
    id: 'admin-2',
    fullName: 'Ama Boateng',
    email: 'operations@crcosmetics.com',
    phone: '+233 50 123 4567',
    role: 'admin',
  },
  {
    id: 'admin-3',
    fullName: 'Kojo Owusu',
    email: 'manager@crcosmetics.com',
    phone: '+233 24 765 4321',
    role: 'manager',
  },
];

const normalizeProduct = (product: Product): Product => ({
  ...product,
  price: Number(product.price),
  originalPrice: product.originalPrice == null ? undefined : Number(product.originalPrice),
  deliveryPrice: product.deliveryPrice == null ? undefined : Number(product.deliveryPrice),
  stockCount: Number(product.stockCount || 0),
  rating: Number(product.rating || 0),
  reviewCount: Number(product.reviewCount || 0),
  variants: (product.variants || []).map(variant => ({
    ...variant,
    price: Number(variant.price),
    originalPrice: variant.originalPrice == null ? undefined : Number(variant.originalPrice),
  })),
});

const INITIAL_SEED_ORDERS: Order[] = [
  {
    id: 'ord-gh-01',
    orderNumber: 'CR-GH-9842',
    items: [
      {
        product: PRODUCTS[0] || { id: 'the-ordinary-niacinamide', name: 'Niacinamide 10% + Zinc 1%', price: 120, brand: 'The Ordinary', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', inStock: true, stockCount: 20, rating: 5, reviewCount: 12, category: 'skincare', department: 'beauty', description: '', highlights: [] },
        quantity: 2,
      },
      {
        product: PRODUCTS[1] || { id: 'cerave-moisturizing-cream', name: 'Moisturizing Cream (Tub)', price: 210, brand: 'CeraVe', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80', inStock: true, stockCount: 15, rating: 5, reviewCount: 8, category: 'skincare', department: 'beauty', description: '', highlights: [] },
        quantity: 1,
      }
    ],
    subtotal: 450.0,
    shippingFee: 30.0,
    discount: 0.0,
    total: 480.0,
    shippingAddress: {
      fullName: 'Nana Yaa Osei',
      phone: '+233 24 555 0192',
      email: 'nanayaa.osei@gmail.com',
      city: 'Accra',
      area: 'East Legon (Near Del Hospital)',
      landmarkOrGps: 'GA-182-9901',
    },
    paymentMethod: 'momo-mtn',
    paymentStatus: 'paid',
    status: 'Packing Order',
    deliveryMethod: 'standard-delivery',
    estimatedDeliveryTime: '2-4 hours',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    riderInfo: {
      riderName: 'Kwame Boateng',
      riderPhone: '+233 24 987 6543',
      riderLocation: 'Accra Dispatch Station',
      estimatedArrival: '30 mins',
      stageIndex: 2,
    }
  },
  {
    id: 'ord-gh-02',
    orderNumber: 'CR-GH-9843',
    items: [
      {
        product: PRODUCTS[6] || { id: 'royal-umbrella-rice-5kg', name: 'Royal Umbrella Fragrant Rice (5kg)', price: 175, brand: 'Royal Umbrella', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80', inStock: true, stockCount: 30, rating: 5, reviewCount: 15, category: 'rice-grains', department: 'groceries', description: '', highlights: [] },
        quantity: 2,
      },
      {
        product: PRODUCTS[7] || { id: 'frytol-cooking-oil-3l', name: 'Frytol Pure Vegetable Oil (3L)', price: 110, brand: 'Frytol', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80', inStock: true, stockCount: 25, rating: 5, reviewCount: 10, category: 'cooking-oils', department: 'groceries', description: '', highlights: [] },
        quantity: 1,
      }
    ],
    subtotal: 460.0,
    shippingFee: 50.0,
    discount: 20.0,
    appliedPromoCode: 'CRGLOW15',
    total: 490.0,
    shippingAddress: {
      fullName: 'Kofi Mensah-Armah',
      phone: '+233 20 444 8821',
      email: 'kofi.mensah@gmail.com',
      city: 'Accra',
      area: 'Airport Residential Area',
      landmarkOrGps: 'GA-044-1290',
    },
    paymentMethod: 'momo-telecel',
    paymentStatus: 'paid',
    status: 'Out for Delivery',
    deliveryMethod: 'accra-express',
    estimatedDeliveryTime: '1-2 hours',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    riderInfo: {
      riderName: 'Samuel Quaye',
      riderPhone: '+233 50 123 7890',
      riderLocation: 'En route to Airport Residential',
      estimatedArrival: '15 mins',
      stageIndex: 3,
    }
  },
  {
    id: 'ord-gh-03',
    orderNumber: 'CR-GH-9844',
    items: [
      {
        product: PRODUCTS[2] || { id: 'cosrx-snail-mucin', name: 'Advanced Snail 96 Mucin Essence', price: 165, brand: 'COSRX', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80', inStock: true, stockCount: 18, rating: 5, reviewCount: 22, category: 'skincare', department: 'beauty', description: '', highlights: [] },
        quantity: 1,
      }
    ],
    subtotal: 165.0,
    shippingFee: 30.0,
    discount: 0.0,
    total: 195.0,
    shippingAddress: {
      fullName: 'Abena Serwaa',
      phone: '+233 55 981 2341',
      email: 'abena.serwaa@outlook.com',
      city: 'Accra',
      area: 'Cantonments (Close to Embassy)',
      landmarkOrGps: 'GA-019-3321',
    },
    paymentMethod: 'cash-on-delivery',
    paymentStatus: 'pending',
    status: 'Confirmed',
    deliveryMethod: 'standard-delivery',
    estimatedDeliveryTime: 'Same day',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  }
];

const INITIAL_SEED_PROMOS: PromoCode[] = [];

const INITIAL_SEED_FLASH_DEALS: FlashDeal[] = [];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state with local storage fallback for 100% consistency
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('cr_products');
      if (saved) return JSON.parse(saved);
    } catch { return PRODUCTS; }
    return PRODUCTS;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [brands, setBrands] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cr_brands');
      if (saved) {
        const parsed = JSON.parse(saved) as Array<string | { name?: string }>;
        return parsed
          .map(brand => typeof brand === 'string' ? brand : brand.name || '')
          .filter(Boolean);
      }
    } catch { return BRANDS_LIST; }
    return BRANDS_LIST;
  });
  const [loadingBrands, setLoadingBrands] = useState(false);

  const [categories, setCategories] = useState<CategoryConfig[]>(() => {
    try {
      const saved = localStorage.getItem('cr_categories');
      if (saved) return JSON.parse(saved);
    } catch { return CATEGORIES_CONFIG; }
    return CATEGORIES_CONFIG;
  });
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('cr_orders');
      if (saved) return JSON.parse(saved);
    } catch { return INITIAL_SEED_ORDERS; }
    return INITIAL_SEED_ORDERS;
  });
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    try {
      const saved = localStorage.getItem('cr_promos');
      if (saved) return JSON.parse(saved);
    } catch { return INITIAL_SEED_PROMOS; }
    return INITIAL_SEED_PROMOS;
  });
  const [loadingPromos, setLoadingPromos] = useState(false);

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('cr_settings');
      return saved ? { ...DEFAULT_STORE_SETTINGS, ...normalizeStoreSettings(JSON.parse(saved)) } : DEFAULT_STORE_SETTINGS;
    } catch {
      return DEFAULT_STORE_SETTINGS;
    }
  });
  const [loadingSettings, setLoadingSettings] = useState(false);

  const [adminSession, setAdminSession] = useState<AdminSession>(() => {
    try {
      const saved = localStorage.getItem('admin_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isLoggedIn) return parsed;
      }
    } catch {}
    return {
      isLoggedIn: false,
      adminName: 'Store Administrator',
      adminRole: 'Super Admin',
      email: 'admin@crcosmetics.com',
    };
  });
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(() => {
    try {
      const saved = localStorage.getItem('cr_admin_accounts');
      if (saved) return JSON.parse(saved);
    } catch { return INITIAL_ADMIN_ACCOUNTS; }
    return INITIAL_ADMIN_ACCOUNTS;
  });

  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>(() => {
    try {
      const saved = localStorage.getItem('cr_flash_deals');
      if (saved) return JSON.parse(saved);
    } catch { return INITIAL_SEED_FLASH_DEALS; }
    return INITIAL_SEED_FLASH_DEALS;
  });
  const [loadingFlashDeals, setLoadingFlashDeals] = useState(false);

  const fetchAdminNotifications = useCallback(async () => {
    try {
      const response = await api.get<{ notifications: AdminNotification[] }>('/notifications');
      setAdminNotifications(Array.isArray(response.notifications) ? response.notifications : []);
    } catch {
      setAdminNotifications([]);
    }
  }, []);

  const markAdminNotificationsRead = useCallback(async (id?: string) => {
    await api.patch(`/notifications${id ? `?id=${encodeURIComponent(id)}` : ''}`, {});
    setAdminNotifications(prev => id ? prev.map(item => item.id === id ? { ...item, read: true } : item) : prev.map(item => ({ ...item, read: true })));
  }, []);

  // Sync to localStorage on state changes
  useEffect(() => {
    localStorage.setItem('cr_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('cr_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('cr_promos', JSON.stringify(promoCodes));
  }, [promoCodes]);

  useEffect(() => {
    localStorage.setItem('cr_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('cr_flash_deals', JSON.stringify(flashDeals));
  }, [flashDeals]);

  useEffect(() => {
    localStorage.setItem('cr_admin_accounts', JSON.stringify(adminAccounts));
  }, [adminAccounts]);

  useEffect(() => {
    localStorage.setItem('cr_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== 'cr_settings' || !event.newValue) return;
      try {
        setStoreSettings(previous => ({ ...previous, ...normalizeStoreSettings(JSON.parse(event.newValue!)) }));
      } catch {
        // Ignore malformed cross-tab storage values.
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const fetchProducts = useCallback(async (params?: { category?: string; department?: string; published?: boolean; includeUnpublished?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (params?.category) query.set('category', params.category);
      if (params?.department) query.set('department', params.department);
      if (params?.published !== undefined) query.set('published', params.published.toString());
      const shouldIncludeUnpublished = params?.includeUnpublished
        || (params?.published === undefined && Boolean(localStorage.getItem('admin_auth_token')));
      if (shouldIncludeUnpublished) query.set('includeUnpublished', 'true');
      const data = await api.get<{ products: Product[] }>(`/products?${query}`);
      if (data && Array.isArray(data.products)) {
        setProducts(data.products.map(normalizeProduct));
      }
    } catch (e: any) {
      setError('Failed to load products from server. Showing local data.');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    setLoadingBrands(true);
    try {
      const data = await api.get<Array<string | { name: string }>>('/brands');
      if (data && Array.isArray(data) && data.length > 0) {
        setBrands(data.map(brand => typeof brand === 'string' ? brand : brand.name));
      }
    } catch (e: any) {
      setError('Failed to load brands from server.');
      throw e;
    } finally {
      setLoadingBrands(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const data = await api.get<CategoryConfig[]>('/categories');
      if (data && Array.isArray(data) && data.length > 0) {
        setCategories(data);
      }
    } catch (e: any) {
      setError('Failed to load categories from server.');
      throw e;
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const fetchOrders = useCallback(async (params?: { userId?: string; status?: Order['status'] }) => {
    if (!localStorage.getItem('auth_token') && !localStorage.getItem('admin_auth_token')) {
      return;
    }
    setLoadingOrders(true);
    try {
      const query = new URLSearchParams();
      if (params?.userId) query.set('userId', params.userId);
      if (params?.status) query.set('status', params.status);
      const data = await api.get<{ orders: Order[] }>(`/orders?${query}`);
      if (data && Array.isArray(data.orders)) setOrders(data.orders);
    } catch (e: any) {
      if (e?.status === 401 || e?.status === 403) {
        return;
      }
      setError('Failed to load orders from server.');
      throw e;
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const fetchPromoCodes = useCallback(async () => {
    setLoadingPromos(true);
    try {
      const data = await api.get<PromoCode[]>('/promo-codes');
      if (data && Array.isArray(data) && data.length > 0) {
        setPromoCodes(data);
      }
    } catch (e: any) {
      setError('Failed to load promo codes from server.');
      throw e;
    } finally {
      setLoadingPromos(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      console.log('Fetching settings from API...');
      const data = await api.get<StoreSettingsRow[]>('/settings');
      console.log('Settings API response:', data);
      
      if (data && Array.isArray(data) && data.length > 0) {
        const settings = data.reduce((acc, s) => {
          let value = s.value;
          // If value is a string that looks like JSON, parse it
          if (typeof value === 'string') {
            try {
              value = JSON.parse(value);
            } catch {
              // Keep as string if not valid JSON
            }
          }
          return { ...acc, [s.key]: value };
        }, {} as StoreSettings);
        
        console.log('Parsed settings:', settings);
        setStoreSettings(prev => ({ ...prev, ...normalizeStoreSettings(settings) }));
      } else {
        console.log('No settings returned from API');
      }
    } catch (e: any) {
      console.error('Failed to load store settings:', e);
      setError('Failed to load store settings from server.');
      throw e;
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  const fetchFlashDeals = useCallback(async () => {
    setLoadingFlashDeals(true);
    try {
      const data = await api.get<FlashDeal[]>('/flash-deals');
      setFlashDeals(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setFlashDeals([]);
      setError('Failed to load flash deals from server.');
    } finally {
      setLoadingFlashDeals(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('admin_session');
      const token = localStorage.getItem('admin_auth_token') || localStorage.getItem('auth_token');
      if (savedSession && token) {
        const parsed = JSON.parse(savedSession);
        setAdminSession({ ...parsed, isLoggedIn: true });
      }
    } catch (e: any) { setError(e.message || "Operation failed"); }

    const hasAdminSession = Boolean(localStorage.getItem('admin_auth_token'));
    const startupRequests: Array<Promise<unknown>> = [
      fetchProducts({ includeUnpublished: hasAdminSession }),
      fetchCategories(),
      fetchSettings(),
      fetchFlashDeals(),
    ];
    if (hasAdminSession) startupRequests.push(fetchBrands());
    void Promise.allSettled(startupRequests);
  }, [fetchProducts, fetchBrands, fetchCategories, fetchSettings, fetchFlashDeals]);

  // Product Actions
  const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const newId = 'prod-' + Date.now();
    const newProduct: Product = {
      ...productData,
      id: newId,
      rating: productData.rating || 5.0,
      reviewCount: productData.reviewCount || 0,
      isPublished: productData.isPublished !== false,
      inStock: productData.inStock !== false && (productData.stockCount || 0) > 0,
      stockCount: productData.stockCount || 10,
    };

    try {
      const apiResult = await api.post<Product>('/products', { ...productData, id: newId });
      setProducts(prev => [apiResult, ...prev]);
      await fetchProducts({ includeUnpublished: true });
      return apiResult;
    } catch (e: any) {
      setError('Failed to add product to server. Changes saved locally only.');
      setProducts(prev => [newProduct, ...prev]);
      if (productData.brand && !brands.includes(productData.brand)) {
        setBrands(prev => [...prev, productData.brand]);
      }
      return newProduct;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    try {
      await api.patch<Product>(`/products?id=${encodeURIComponent(id)}`, updates);
      await fetchProducts({ includeUnpublished: true });
    } catch (e: any) {
      setError('Failed to update product on server.');
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      await api.delete(`/products?id=${encodeURIComponent(id)}`);
      await fetchProducts({ includeUnpublished: true });
    } catch (e: any) {
      setError('Failed to delete product from server.');
    }
  };

  const toggleProductPublication = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const newStatus = product.isPublished === false;
    updateProduct(id, { isPublished: newStatus });
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
    setProducts([]);
    try {
      await api.delete('/products');
    } catch (e: any) { setError(e.message || "Operation failed"); }
  };

  // Brand Actions
  const addBrand = async (brand: string) => {
    const trimmed = brand.trim();
    if (trimmed && !brands.includes(trimmed)) {
      setBrands(prev => [...prev, trimmed]);
      try {
        await api.post('/brands', { name: trimmed });
        await fetchBrands();
      } catch (e: any) { setError(e.message || "Operation failed"); }
    }
  };

  const deleteBrand = async (brand: string) => {
    setBrands(prev => prev.filter(b => b !== brand));
    try {
      await api.delete(`/brands?id=${encodeURIComponent(brand)}`);
      await fetchBrands();
    } catch (e: any) { setError(e.message || "Operation failed"); }
  };

  // Category Actions
  const updateCategory = async (id: CategoryType, updates: Partial<CategoryConfig>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    try {
      await api.patch<CategoryConfig>(`/categories?id=${encodeURIComponent(id)}`, updates);
      await fetchCategories();
    } catch (e: any) { setError(e.message || "Operation failed"); }
  };

  const addCategory = async (category: CategoryConfig) => {
    setCategories(prev => [...prev, category]);
    try {
      await api.post<CategoryConfig>('/categories', category);
      await fetchCategories();
    } catch (e: any) { setError(e.message || "Operation failed"); }
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    try {
      await api.delete(`/categories?id=${encodeURIComponent(id)}`);
      await fetchCategories();
    } catch (e: any) { setError(e.message || "Operation failed"); }
  };

  const toggleCategory = async (id: CategoryType) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    updateCategory(id, { isActive: !cat.isActive });
  };

  // Order Actions
const addOrder = async (order: Order) => {
    setOrders(prev => [order, ...prev]);
  // The API transaction already deducts stock. Keep the local catalog in sync without posting a second order.
    order.items.forEach(item => {
      if (item.product?.id) {
        const prod = products.find(p => p.id === item.product.id);
        if (prod) {
          const newQty = Math.max(0, (prod.stockCount || 0) - item.quantity);
          setProducts(prev => prev.map(product => product.id === prod.id ? { ...product, stockCount: newQty, inStock: newQty > 0 } : product));
        }
      }
    });
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], riderInfo?: Partial<RiderTrackingInfo>, estimatedDeliveryTime?: string) => {
    const previousOrder = orders.find(order => order.id === orderId);
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status,
          estimatedDeliveryTime: estimatedDeliveryTime ?? o.estimatedDeliveryTime,
          riderInfo: riderInfo ? { ...o.riderInfo, ...riderInfo } as RiderTrackingInfo : o.riderInfo,
        };
      }
      return o;
    }));

    try {
      await api.patch(`/orders?id=${encodeURIComponent(orderId)}`, { status, riderInfo, estimatedDeliveryTime });
    } catch (e: any) {
      if (previousOrder) setOrders(prev => prev.map(order => order.id === orderId ? previousOrder : order));
      setError(e.message || "Operation failed");
      throw e;
    }
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: 'paid' | 'pending') => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus } : o));
    try {
      await api.patch(`/orders?id=${encodeURIComponent(orderId)}`, { paymentStatus });
    } catch (e: any) { setError(e.message || "Operation failed"); }
  };

  const deleteOrder = async (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    try {
      await api.delete(`/orders?id=${encodeURIComponent(orderId)}`);
    } catch (e: any) { setError(e.message || "Operation failed"); }
  };

  const clearAllOrders = async () => {
    setOrders([]);
    try {
      await api.delete('/orders');
    } catch (e: any) { setError(e.message || "Operation failed"); }
  };

  const getOrderById = (orderIdOrNumber: string): Order | undefined => {
    return orders.find(o => o.id === orderIdOrNumber || o.orderNumber.toLowerCase() === orderIdOrNumber.toLowerCase());
  };

  // Promo Actions
  const addPromoCode = async (promoData: Omit<PromoCode, 'id' | 'usageCount'>) => {
    const newPromo: PromoCode = {
      ...promoData,
      id: 'promo-' + Date.now(),
      usageCount: 0,
    };
    setPromoCodes(prev => [newPromo, ...prev]);
    try {
      await api.post('/promo-codes', promoData);
    } catch (e: any) { setError(e.message || "Operation failed"); }
  };

  const togglePromoCode = async (code: string) => {
    setPromoCodes(prev => prev.map(p => p.code === code ? { ...p, isActive: !p.isActive } : p));
    try {
      await api.patch(`/promo-codes/${code}/toggle`, {});
    } catch (e: any) { setError(e.message || "Operation failed"); }
  };

  const deletePromoCode = async (id: string) => {
    setPromoCodes(prev => prev.filter(p => p.id !== id));
    try {
      await api.delete(`/promo-codes?id=${encodeURIComponent(id)}`);
    } catch (e: any) { setError(e.message || "Operation failed"); }
  };

  const validatePromoCode = async (code: string, subtotal: number) => {
    const cleanCode = code.trim().toUpperCase();
    const promo = promoCodes.find(p => p.code.toUpperCase() === cleanCode && p.isActive);

    if (!promo) {
      return { valid: false, discountAmount: 0, freeShipping: false, message: 'Invalid or expired promo code' };
    }

    if (promo.minSpend && subtotal < promo.minSpend) {
      return {
        valid: false,
        discountAmount: 0,
        freeShipping: false,
        message: `Minimum spend of GHS ${promo.minSpend} required for this code (Your cart: GHS ${subtotal.toFixed(2)})`
      };
    }

    let discountAmount = 0;
    if (promo.discountType === 'percentage') {
      discountAmount = (subtotal * promo.discountValue) / 100;
    } else if (promo.discountType === 'fixed') {
      discountAmount = Math.min(promo.discountValue, subtotal);
    }

    return {
      valid: true,
      discountAmount,
      freeShipping: !!promo.freeShipping,
      message: `Code ${cleanCode} applied successfully!`,
      promo,
    };
  };

  // Settings Actions
  const updateStoreSettings = async (updates: Partial<StoreSettings>) => {
    setStoreSettings(prev => ({ ...prev, ...normalizeStoreSettings(updates) }));
    try {
      console.log('Saving settings:', updates);
      const errors: string[] = [];
      
      for (const [key, value] of Object.entries(updates)) {
        try {
          console.log(`Saving ${key}:`, value);
          const result = await api.post('/settings', { key, value });
          console.log(`Successfully saved ${key}:`, result);
        } catch (itemError: any) {
          console.error(`Failed to save ${key}:`, itemError);
          if (itemError?.status === 401 || itemError?.status === 403) {
            localStorage.removeItem('admin_auth_token');
            localStorage.removeItem('admin_session');
            setAdminSession(prev => ({ ...prev, isLoggedIn: false }));
          }
          errors.push(`${key}: ${itemError.message}`);
        }
      }
      
      if (errors.length > 0) {
        setError(`Failed to save some settings: ${errors.join(', ')}`);
        console.error('Setting errors:', errors);
        throw new Error(`Failed to save some settings: ${errors.join(', ')}`);
      }
      
      console.log('Fetching settings from server...');
      await fetchSettings();
      console.log('Settings fetched:', storeSettings);
    } catch (e: any) { 
      console.error('updateStoreSettings error:', e);
      setError(e.message || "Operation failed"); 
      throw e;
    }
  };

  // Admin Auth Actions
  const loginAdmin = async (pin: string, name = 'Store Administrator', role: AdminSession['adminRole'] = 'Super Admin', email = 'admin@crcosmetics.com'): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPin = pin.trim();
    setLoadingAdmin(true);

    // 1. Try remote backend authentication
    try {
      const result = await api.post<{ token: string; admin: { id: string; adminName: string; adminRole: string; email: string } }>('/auth?action=admin', {
        email: cleanEmail,
        pin: cleanPin,
        name,
        role,
      });

      if (result && result.admin) {
        localStorage.setItem('admin_auth_token', result.token);
        localStorage.setItem('admin_session', JSON.stringify({
          isLoggedIn: true,
          adminName: result.admin.adminName,
          adminRole: result.admin.adminRole as AdminSession['adminRole'],
          email: result.admin.email,
        }));
        setAdminSession({
          isLoggedIn: true,
          adminName: result.admin.adminName,
          adminRole: result.admin.adminRole as AdminSession['adminRole'],
          email: result.admin.email,
        });
        // Refresh all data after login
        await Promise.allSettled([
          fetchProducts({ includeUnpublished: true }),
          fetchOrders(),
          fetchSettings(),
          fetchPromoCodes(),
          fetchFlashDeals(),
        ]);
        setLoadingAdmin(false);
        return true;
      }
    } catch {
      // Backend offline or local development fallback
    }

    // 2. Local fallback is useful for offline development only. Production
    // must never claim an admin session that the API cannot validate.
    if (!import.meta.env.DEV) {
      return false;
    }

    // 2. Resilient local credential validation
    const savedCustomPassword = localStorage.getItem(`cr_admin_password_${cleanEmail}`);
    const globalAdminPassword = localStorage.getItem('cr_admin_password_admin@crcosmetics.com');
    const validPins = [
      savedCustomPassword,
      globalAdminPassword,
      '1234',
      '0000',
      '123456',
      'admin123',
    ].filter(Boolean);

    if (validPins.includes(cleanPin)) {
      const matchedAccount = (adminAccounts || []).find(a => a.email.toLowerCase() === cleanEmail);
      const sessionData = {
        isLoggedIn: true,
        adminName: matchedAccount?.fullName || name || 'Store Administrator',
        adminRole: (matchedAccount?.role === 'super_admin'
          ? 'Super Admin'
          : matchedAccount?.role === 'manager'
          ? 'Store Manager'
          : matchedAccount?.role === 'admin'
          ? 'Super Admin'
          : role) as AdminSession['adminRole'],
        email: cleanEmail || 'admin@crcosmetics.com',
      };

      const mockToken = localStorage.getItem('admin_auth_token') || 'local_admin_token_' + Date.now();
      localStorage.setItem('admin_auth_token', mockToken);
      localStorage.setItem('admin_session', JSON.stringify(sessionData));
      setAdminSession(sessionData);
      // Refresh data after local login
      await Promise.allSettled([
        fetchProducts({ includeUnpublished: true }),
        fetchOrders(),
        fetchSettings(),
        fetchPromoCodes(),
        fetchFlashDeals(),
      ]);
      setLoadingAdmin(false);
      return true;
    }

    setLoadingAdmin(false);
    return false;
  };

  const logoutAdmin = async () => {
    localStorage.removeItem('admin_auth_token');
    localStorage.removeItem('admin_session');
    setAdminSession({
      isLoggedIn: false,
      adminName: 'Store Administrator',
      adminRole: 'Super Admin',
      email: 'admin@crcosmetics.com',
    });
  };

  const switchAdminRole = async (role: AdminSession['adminRole']) => {
    setAdminSession(prev => ({ ...prev, adminRole: role }));
  };

  const fetchAdminAccounts = useCallback(async () => {
    try {
      const accounts = await api.get<AdminAccount[]>('/admin-accounts');
      if (Array.isArray(accounts)) {
        setAdminAccounts(accounts);
        try {
          localStorage.setItem('cr_admin_accounts', JSON.stringify(accounts));
        } catch {}
      }
    } catch (e: any) {
      setError(e.message || "Operation failed");
    }
  }, []);

  const addAdminAccount = async (account: Omit<AdminAccount, 'id'> & { pin?: string }): Promise<AdminAccount> => {
    try {
      const created = await api.post<AdminAccount>('/admin-accounts', account);
      setAdminAccounts(prev => [created, ...prev]);
      return created;
    } catch (e: any) {
      setError(e.message || 'Operation failed');
    }
    const newAccount: AdminAccount = {
      ...account,
      id: `admin-${Date.now()}`,
    };
    setAdminAccounts(prev => [newAccount, ...prev]);
    return newAccount;
  };

  const updateAdminAccount = async (id: string, updates: Partial<AdminAccount>) => {
    setAdminAccounts(prev => prev.map(account => account.id === id ? { ...account, ...updates } : account));
    const account = adminAccounts.find(item => item && item.id === id);
    const sessionEmail = (adminSession?.email || '').toLowerCase().trim();
    if (account && account.email && account.email.toLowerCase().trim() === sessionEmail) {
      setAdminSession(prev => ({
        ...prev,
        adminName: updates.fullName ?? prev.adminName,
        email: updates.email ?? prev.email,
        adminRole: updates.role === 'super_admin' ? 'Super Admin' : updates.role === 'manager' ? 'Store Manager' : updates.role === 'admin' ? 'Inventory Dispatcher' : prev.adminRole,
      }));
    }
    try {
      await api.patch(`/admin-accounts/${id}`, updates);
    } catch (e: any) { setError(e.message || 'Operation failed'); }
  };

  const deleteAdminAccount = async (id: string) => {
    setAdminAccounts(prev => prev.filter(account => account.id !== id));
    try {
      await api.delete(`/admin-accounts/${id}`);
    } catch (e: any) { setError(e.message || 'Operation failed'); }
  };

  const changeAdminPassword = async (currentPin: string, newPin: string) => {
    const sessionEmail = (adminSession?.email || '').toLowerCase().trim();
    const account = adminAccounts.find(item => item && item.email && item.email.toLowerCase().trim() === sessionEmail);
    if (!account) throw new Error('Active admin account was not found');
    await api.patch(`/admin-accounts/${account.id}`, { currentPin, pin: newPin });
  };

  // Flash Deal Actions
  const addFlashDeal = async (dealData: Omit<FlashDeal, 'id' | 'createdAt'>) => {
    try {
      const createdDeal = await api.post<FlashDeal>('/flash-deals', dealData);
      setFlashDeals(prev => [createdDeal, ...prev]);
    } catch (e: any) { setError(e.message || "Operation failed"); }
  };

  const updateFlashDeal = async (id: string, updates: Partial<FlashDeal>) => {
    setFlashDeals(prev => prev.map(deal => deal.id === id ? { ...deal, ...updates } : deal));
    try {
      await api.patch(`/flash-deals?id=${encodeURIComponent(id)}`, updates);
    } catch (e: any) { setError(e.message || "Operation failed"); }
  };

  const deleteFlashDeal = async (id: string) => {
    setFlashDeals(prev => prev.filter(deal => deal.id !== id));
    try {
      await api.delete(`/flash-deals?id=${encodeURIComponent(id)}`);
    } catch (e: any) { setError(e.message || "Operation failed"); }
  };

  const toggleFlashDeal = async (id: string) => {
    const deal = flashDeals.find(d => d.id === id);
    if (!deal) return;
    updateFlashDeal(id, { isActive: !deal.isActive });
  };

  const resetStoreToDefaults = async () => {
    setProducts(PRODUCTS);
    setCategories(CATEGORIES_CONFIG);
    setBrands(BRANDS_LIST);
    setOrders(INITIAL_SEED_ORDERS);
    setPromoCodes(INITIAL_SEED_PROMOS);
    setFlashDeals(INITIAL_SEED_FLASH_DEALS);
    setStoreSettings(DEFAULT_STORE_SETTINGS);
    localStorage.clear();
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
        adminAccounts,
        loadingAdmin,
        adminNotifications,
        fetchAdminNotifications,
        markAdminNotificationsRead,
        loginAdmin,
        logoutAdmin,
        switchAdminRole,
        fetchAdminAccounts,
        addAdminAccount,
        updateAdminAccount,
        deleteAdminAccount,
        changeAdminPassword,
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








