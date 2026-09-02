export type DepartmentType = 'beauty' | 'groceries';

export type CategoryType = 
  | 'all' 
  // Beauty Categories
  | 'skincare' 
  | 'makeup'
  | 'fragrances' 
  | 'body-care' 
  | 'beauty-tools'
  // Grocery Categories
  | 'rice-grains'
  | 'cooking-oils'
  | 'seasoning-spices'
  | 'beverages'
  | 'snacks-sweets'
  | 'household-care'
  | 'daily-essentials'
  // Special Curations
  | 'new-arrivals'
  | 'best-sellers'
  | 'offers';

export interface CategoryConfig {
  id: CategoryType;
  slug: string;
  name: string;
  department: DepartmentType;
  image: string;
  description: string;
  isActive: boolean;
}

export interface DepartmentConfig {
  id: DepartmentType;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 10 for 10%, or 30 for GHS 30
  minSpend?: number;
  freeShipping?: boolean;
  isActive: boolean;
  usageCount: number;
  description: string;
  expiryDate?: string;
}

export interface FlashDeal {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badgeText: string; // e.g. "⚡ MEGA FLASH DEAL"
  discountPercentage: number; // e.g. 70 for "UP TO 70% OFF"
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
  backgroundGradient: string; // e.g. "from-[var(--accent)] via-[var(--violet)] to-[var(--olive)]"
}

export interface HomepageSectionVisibility {
  flashDeal: boolean;
  hero: boolean;
  categories: boolean;
  hotDeals: boolean;
  bestSellers: boolean;
  newArrivals: boolean;
  beauty: boolean;
  groceryFeed: boolean;
  recommendedForYou: boolean;
}

export interface StorefrontPageVisibility {
  home: boolean;
  beauty: boolean;
  groceries: boolean;
  shop: boolean;
  products: boolean;
  search: boolean;
  account: boolean;
  checkout: boolean;
  about: boolean;
  support: boolean;
  contact: boolean;
  offers: boolean;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroBadge: string;
  heroButtonText: string;
  heroSecondaryButtonText?: string;
  announcementText: string;
  announcementVisible: boolean;
  announcementBg: string;
  homepageSections: HomepageSectionVisibility;
  pageVisibility: StorefrontPageVisibility;
  freeDeliveryThreshold: number; // in GHS
  currency: string;
  standardShippingFee: number;
  expressShippingFee: number;
  intercityShippingFee: number;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
  storeHours: string;
  whatsappNumber: string;
  maintenanceMode: boolean;
  bannerAlert: string | null;
  storeLogo?: string;
}

export interface StoreSettingsRow {
  key: string;
  value: any;
}

export interface AdminSession {
  isLoggedIn: boolean;
  adminName: string;
  adminRole: 'Super Admin' | 'Store Manager' | 'Inventory Dispatcher';
  email: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  skinType?: string;
  helpfulCount: number;
  adminReply?: string;
}

export type RoutineStep = 'cleanse' | 'treat' | 'hydrate' | 'protect';

export interface ProductVariant {
  id: string;
  name: string; // e.g. "30ml", "100ml", "5kg", "10kg"
  price: number;
  originalPrice?: number;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  department: DepartmentType;
  category: CategoryType;
  categoryLabel: string;
  price: number; // in GHS
  originalPrice?: number;
  discountBadge?: string; // e.g. "-10%"
  unit: string; // e.g. "30ml Dropper Bottle", "5kg Bag", "400ml Bottle"
  image: string;
  images: string[];
  description: string;
  highlights: string[];
  badge?: 'Bestseller' | 'New In' | 'CR Exclusive' | 'Sale' | '100% Authentic' | 'Popular';
  inStock: boolean;
  /** Admin-only publication control. Unpublished products never appear in the customer storefront. */
  isPublished?: boolean;
  stockCount: number;
  rating: number;
  reviewCount: number;
  origin?: string;
  // Beauty Specific Metadata
  routineStep?: RoutineStep;
  skinType?: string[]; // e.g. ["All Skin Types", "Oily", "Combination"]
  skinConcern?: string[]; // e.g. ["Acne", "Hyperpigmentation", "Dullness"]
  // Grocery Specific Metadata
  packSize?: string; // e.g. "5kg", "1 Litre", "Pack of 6"
  storageInfo?: string;
  shelfLife?: string;
  variants?: ProductVariant[];
  details?: {
    howToUse?: string;
    ingredients?: string;
    benefits?: string;
    nutritionalInfo?: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOption?: string;
  selectedVariant?: ProductVariant;
}

export interface RiderTrackingInfo {
  riderName: string;
  riderPhone: string;
  riderLocation: string;
  estimatedArrival: string;
  stageIndex: number;
}

export type DeliveryMethod = 'accra-express' | 'standard-delivery' | 'intercity' | 'store-pickup';

export type PaymentMethod = 'momo-mtn' | 'momo-telecel' | 'momo-at' | 'cash-on-delivery' | 'card' | 'apple-pay' | 'paystack';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email?: string;
  city: string;
  area: string;
  landmarkOrGps?: string;
  deliveryNotes?: string;
}

export type OrderStatus = 'Confirmed' | 'Processing' | 'Packing Order' | 'Out for Delivery' | 'Delivered';

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending';
  deliveryMethod: DeliveryMethod;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  estimatedDeliveryTime: string;
  appliedPromoCode?: string;
  riderInfo?: RiderTrackingInfo;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role?: 'customer' | 'super_admin' | 'admin' | 'manager';
  savedAddresses: ShippingAddress[];
  orders: Order[];
  savedItemIds: string[];
}

export interface AdminAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'super_admin' | 'admin' | 'manager';
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  previousQuantity: number;
  adjustment: number;
  newQuantity: number;
  reason: 'Stock received' | 'Sale' | 'Damaged' | 'Expired' | 'Manual adjustment' | 'Returned' | 'Correction';
  actor: string;
  timestamp: string;
  notes?: string;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate?: string;
  segment: 'High Value' | 'Returning' | 'New' | 'Inactive';
  status: 'Active' | 'Blocked';
  addresses: ShippingAddress[];
  notes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entity: string;
  entityId?: string;
  timestamp: string;
  details: string;
}

export interface AdminNotification {
  id: string;
  type: 'order' | 'inventory' | 'customer' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Store Manager' | 'Catalog Manager' | 'Order Manager' | 'Marketing Manager' | 'Inventory Dispatcher';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

