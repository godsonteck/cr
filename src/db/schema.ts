import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const departmentEnum = pgEnum('department', ['beauty', 'groceries']);
export const categoryTypeEnum = pgEnum('category_type', [
  'all',
  'skincare',
  'makeup',
  'fragrances',
  'body-care',
  'beauty-tools',
  'rice-grains',
  'cooking-oils',
  'seasoning-spices',
  'beverages',
  'snacks-sweets',
  'household-care',
  'daily-essentials',
  'new-arrivals',
  'best-sellers',
  'offers',
]);
export const orderStatusEnum = pgEnum('order_status', [
  'Confirmed',
  'Processing',
  'Packing Order',
  'Out for Delivery',
  'Delivered',
]);
export const paymentMethodEnum = pgEnum('payment_method', [
  'paystack',
  'momo-mtn',
  'momo-telecel',
  'momo-at',
  'cash-on-delivery',
  'card',
  'apple-pay',
]);
export const paymentStatusEnum = pgEnum('payment_status', ['paid', 'pending']);
export const deliveryMethodEnum = pgEnum('delivery_method', [
  'accra-express',
  'standard-delivery',
  'intercity',
  'store-pickup',
]);
export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed']);
export const adminRoleEnum = pgEnum('admin_role', [
  'Super Admin',
  'Store Manager',
  'Inventory Dispatcher',
]);
export const routineStepEnum = pgEnum('routine_step', [
  'cleanse',
  'treat',
  'hydrate',
  'protect',
]);

export const products = pgTable('products', {
  id: varchar('id', { length: 100 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  brand: varchar('brand', { length: 100 }).notNull(),
  department: departmentEnum('department').notNull(),
  category: categoryTypeEnum('category').notNull(),
  categoryLabel: varchar('category_label', { length: 100 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  deliveryPrice: decimal('delivery_price', { precision: 10, scale: 2 }),
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }),
  discountBadge: varchar('discount_badge', { length: 20 }),
  unit: varchar('unit', { length: 100 }).notNull(),
  image: text('image').notNull(),
  images: jsonb('images').$type<string[]>().notNull().default([]),
  description: text('description').notNull(),
  highlights: jsonb('highlights').$type<string[]>().notNull().default([]),
  badge: varchar('badge', { length: 50 }),
  inStock: boolean('in_stock').notNull().default(true),
  isPublished: boolean('is_published').notNull().default(true),
  stockCount: integer('stock_count').notNull().default(0),
  options: jsonb('options').$type<Array<{ name: string; values: string[] }>>().default([]),
  rating: decimal('rating', { precision: 3, scale: 1 }).notNull().default('5.0'),
  reviewCount: integer('review_count').notNull().default(0),
  origin: varchar('origin', { length: 100 }),
  routineStep: routineStepEnum('routine_step'),
  skinType: jsonb('skin_type').$type<string[]>().default([]),
  skinConcern: jsonb('skin_concern').$type<string[]>().default([]),
  packSize: varchar('pack_size', { length: 50 }),
  storageInfo: text('storage_info'),
  shelfLife: varchar('shelf_life', { length: 50 }),
  variants: jsonb('variants').$type<Array<{
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    inStock: boolean;
  }>>().default([]),
  details: jsonb('details').$type<{
    howToUse?: string;
    ingredients?: string;
    benefits?: string;
    nutritionalInfo?: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index('products_category_idx').on(table.category),
  departmentIdx: index('products_department_idx').on(table.department),
  publishedIdx: index('products_published_idx').on(table.isPublished),
  brandIdx: index('products_brand_idx').on(table.brand),
}));

export const categories = pgTable('categories', {
  id: categoryTypeEnum('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  department: departmentEnum('department').notNull(),
  image: text('image').notNull(),
  description: text('description').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const brands = pgTable('brands', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  items: jsonb('items').$type<Array<{
    product: {
      id: string;
      name: string;
      brand: string;
      price: number;
      originalPrice?: number;
      image: string;
      unit: string;
      category: string;
      inStock: boolean;
      stockCount: number;
    };
    quantity: number;
    selectedOption?: string;
    selectedVariant?: {
      id: string;
      name: string;
      price: number;
      originalPrice?: number;
      inStock: boolean;
    };
  }>>().notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  shippingFee: decimal('shipping_fee', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 }).notNull().default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  paymentStatus: paymentStatusEnum('payment_status').notNull().default('pending'),
  deliveryMethod: deliveryMethodEnum('delivery_method').notNull(),
  shippingAddress: jsonb('shipping_address').$type<{
    fullName: string;
    phone: string;
    email?: string;
    city: string;
    area: string;
    landmarkOrGps?: string;
    deliveryNotes?: string;
  }>().notNull(),
  status: orderStatusEnum('status').notNull().default('Confirmed'),
  estimatedDeliveryTime: varchar('estimated_delivery_time', { length: 100 }),
  appliedPromoCode: varchar('applied_promo_code', { length: 50 }),
  riderInfo: jsonb('rider_info').$type<{
    riderName: string;
    riderPhone: string;
    riderLocation: string;
    estimatedArrival: string;
    stageIndex: number;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('orders_user_id_idx').on(table.userId),
  statusIdx: index('orders_status_idx').on(table.status),
  createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
  orderNumberIdx: uniqueIndex('orders_order_number_idx').on(table.orderNumber),
}));

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  savedAddresses: jsonb('saved_addresses').$type<Array<{
    fullName: string;
    phone: string;
    email?: string;
    city: string;
    area: string;
    landmarkOrGps?: string;
  }>>().default([]),
  savedItemIds: jsonb('saved_item_ids').$type<string[]>().default([]),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
}));

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: varchar('product_id', { length: 100 }).notNull().references(() => products.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  authorName: varchar('author_name', { length: 100 }).notNull(),
  rating: integer('rating').notNull(),
  title: varchar('title', { length: 200 }),
  comment: text('comment').notNull(),
  verifiedPurchase: boolean('verified_purchase').notNull().default(false),
  skinType: varchar('skin_type', { length: 50 }),
  helpfulCount: integer('helpful_count').notNull().default(0),
  adminReply: text('admin_reply'),
  isApproved: boolean('is_approved').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  productIdIdx: index('reviews_product_id_idx').on(table.productId),
  userIdIdx: index('reviews_user_id_idx').on(table.userId),
  approvedIdx: index('reviews_approved_idx').on(table.isApproved),
}));

export const promoCodes = pgTable('promo_codes', {
  id: varchar('id', { length: 100 }).primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  discountType: discountTypeEnum('discount_type').notNull(),
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  minSpend: decimal('min_spend', { precision: 10, scale: 2 }),
  freeShipping: boolean('free_shipping').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  usageCount: integer('usage_count').notNull().default(0),
  maxUsage: integer('max_usage'),
  description: text('description'),
  expiryDate: timestamp('expiry_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  codeIdx: uniqueIndex('promo_codes_code_idx').on(table.code),
  activeIdx: index('promo_codes_active_idx').on(table.isActive),
}));

export const flashDeals = pgTable('flash_deals', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 200 }).notNull(),
  subtitle: varchar('subtitle', { length: 300 }),
  description: text('description'),
  badgeText: varchar('badge_text', { length: 100 }),
  discountPercentage: integer('discount_percentage').notNull(),
  hoursRemaining: integer('hours_remaining').notNull().default(0),
  minutesRemaining: integer('minutes_remaining').notNull().default(0),
  secondsRemaining: integer('seconds_remaining').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  expiresAt: timestamp('expires_at').notNull(),
  backgroundGradient: varchar('background_gradient', { length: 200 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  activeIdx: index('flash_deals_active_idx').on(table.isActive),
  expiresAtIdx: index('flash_deals_expires_at_idx').on(table.expiresAt),
}));

export const storeSettings = pgTable('store_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const adminSessions = pgTable('admin_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminName: varchar('admin_name', { length: 100 }).notNull(),
  adminRole: adminRoleEnum('admin_role').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 30 }).notNull().default(''),
  pinHash: varchar('pin_hash', { length: 255 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const carts = pgTable('carts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionId: varchar('session_id', { length: 100 }),
  items: jsonb('items').$type<Array<{
    productId: string;
    quantity: number;
    selectedOption?: string;
    selectedVariant?: {
      id: string;
      name: string;
      price: number;
      originalPrice?: number;
      inStock: boolean;
    };
  }>>().notNull().default([]),
  promoCode: varchar('promo_code', { length: 50 }),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0'),
  hasFreeShippingCoupon: boolean('has_free_shipping_coupon').default(false),
  selectedSamples: jsonb('selected_samples').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('carts_user_id_idx').on(table.userId),
  sessionIdIdx: index('carts_session_id_idx').on(table.sessionId),
}));

export const wishlists = pgTable('wishlists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionId: varchar('session_id', { length: 100 }),
  productId: varchar('product_id', { length: 100 }).notNull().references(() => products.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('wishlists_user_id_idx').on(table.userId),
  sessionIdIdx: index('wishlists_session_id_idx').on(table.sessionId),
  uniqueUserProduct: uniqueIndex('wishlists_unique_user_product').on(table.userId, table.productId),
  uniqueSessionProduct: uniqueIndex('wishlists_unique_session_product').on(table.sessionId, table.productId),
}));

export const productsRelations = relations(products, ({ many }) => ({
  reviews: many(reviews),
  wishlists: many(wishlists),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  reviews: many(reviews),
  carts: many(carts),
  wishlists: many(wishlists),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));

export const cartsRelations = relations(carts, ({ one }) => ({
  user: one(users, { fields: [carts.userId], references: [users.id] }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, { fields: [wishlists.userId], references: [users.id] }),
  product: one(products, { fields: [wishlists.productId], references: [products.id] }),
}));