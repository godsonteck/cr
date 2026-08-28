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

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroBadge: string;
  heroButtonText: string;
  announcementText: string;
  announcementVisible: boolean;
  announcementBg: string;
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

export type PaymentMethod = 'momo-mtn' | 'momo-telecel' | 'momo-at' | 'cash-on-delivery' | 'card' | 'apple-pay';

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
  savedAddresses: ShippingAddress[];
  orders: Order[];
  savedItemIds: string[];
}
