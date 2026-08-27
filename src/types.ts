export type CategoryType = 
  | 'all' 
  | 'makeup' 
  | 'skincare' 
  | 'fragrances' 
  | 'body-care' 
  | 'beauty-essentials' 
  | 'everyday-essentials'
  | 'new-arrivals'
  | 'best-sellers';

export interface CategoryConfig {
  id: CategoryType;
  name: string;
  image: string;
  description: string;
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

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: CategoryType;
  categoryLabel: string;
  price: number; // in GHS
  originalPrice?: number;
  discountBadge?: string; // e.g. "-10%"
  unit: string; // e.g. "30ml Bottle", "454g Tub", "400ml", "100ml EDP", "200ml Jar"
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
  details?: {
    howToUse?: string;
    ingredients?: string;
    benefits?: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOption?: string;
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
  status: 'Confirmed' | 'Packing Order' | 'Out for Delivery' | 'Delivered';
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

