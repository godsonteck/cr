import { db } from '../src/db';
import {
  products,
  categories,
  brands,
  storeSettings,
  promoCodes,
  adminSessions,
} from '../src/db/schema';
import { PRODUCTS, CATEGORIES_CONFIG, BRANDS_LIST } from '../src/data/products';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const DEFAULT_STORE_SETTINGS = {
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

const DEFAULT_PROMO_CODES = [
  {
    id: 'promo-cr10',
    code: 'CR10',
    discountType: 'percentage' as const,
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
    discountType: 'fixed' as const,
    discountValue: 20,
    minSpend: 100,
    freeShipping: false,
    isActive: true,
    usageCount: 0,
    description: 'GHS 20 instant discount for beauty shoppers',
    expiryDate: '2026-12-31'
  }
];

async function hashPin(pin: string): Promise<string> {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    console.log('📦 Seeding categories...');
    for (const cat of CATEGORIES_CONFIG) {
      await db.insert(categories).values({
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        department: cat.department,
        image: cat.image,
        description: cat.description,
        isActive: cat.isActive,
      }).onConflictDoUpdate({
        target: categories.id,
        set: {
          slug: cat.slug,
          name: cat.name,
          department: cat.department,
          image: cat.image,
          description: cat.description,
          isActive: cat.isActive,
          updatedAt: new Date(),
        },
      });
    }
    console.log('✅ Categories seeded');

    console.log('🏷️ Seeding brands...');
    for (const brandName of BRANDS_LIST) {
      if (brandName === 'All Brands') continue;
      await db.insert(brands).values({
        name: brandName,
        isActive: true,
      }).onConflictDoNothing();
    }
    console.log('✅ Brands seeded');

    console.log('🛍️ Seeding products...');
    for (const product of PRODUCTS) {
      await db.insert(products).values({
        id: product.id,
        name: product.name,
        brand: product.brand,
        department: product.department,
        category: product.category,
        categoryLabel: product.categoryLabel,
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString(),
        discountBadge: product.discountBadge,
        unit: product.unit,
        image: product.image,
        images: product.images,
        description: product.description,
        highlights: product.highlights,
        badge: product.badge,
        inStock: product.inStock,
        isPublished: product.isPublished ?? true,
        stockCount: product.stockCount,
        rating: product.rating.toString(),
        reviewCount: product.reviewCount,
        origin: product.origin,
        routineStep: product.routineStep,
        skinType: product.skinType || [],
        skinConcern: product.skinConcern || [],
        packSize: product.packSize,
        storageInfo: product.storageInfo,
        shelfLife: product.shelfLife,
        variants: product.variants || [],
        details: product.details || {},
      }).onConflictDoUpdate({
        target: products.id,
        set: {
          name: product.name,
          brand: product.brand,
          department: product.department,
          category: product.category,
          categoryLabel: product.categoryLabel,
          price: product.price.toString(),
          originalPrice: product.originalPrice?.toString(),
          discountBadge: product.discountBadge,
          unit: product.unit,
          image: product.image,
          images: product.images,
          description: product.description,
          highlights: product.highlights,
          badge: product.badge,
          inStock: product.inStock,
          isPublished: product.isPublished ?? true,
          stockCount: product.stockCount,
          rating: product.rating.toString(),
          reviewCount: product.reviewCount,
          origin: product.origin,
          routineStep: product.routineStep,
          skinType: product.skinType || [],
          skinConcern: product.skinConcern || [],
          packSize: product.packSize,
          storageInfo: product.storageInfo,
          shelfLife: product.shelfLife,
          variants: product.variants || [],
          details: product.details || {},
          updatedAt: new Date(),
        },
      });
    }
    console.log('✅ Products seeded');

    console.log('⚙️ Seeding store settings...');
    for (const [key, value] of Object.entries(DEFAULT_STORE_SETTINGS)) {
      await db.insert(storeSettings).values({
        key,
        value: JSON.stringify(value),
      }).onConflictDoUpdate({
        target: storeSettings.key,
        set: {
          value: JSON.stringify(value),
          updatedAt: new Date(),
        },
      });
    }
    console.log('✅ Store settings seeded');

    console.log('🎫 Seeding promo codes...');
    for (const promo of DEFAULT_PROMO_CODES) {
      await db.insert(promoCodes).values({
        id: promo.id,
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue.toString(),
        minSpend: promo.minSpend?.toString(),
        freeShipping: promo.freeShipping,
        isActive: promo.isActive,
        usageCount: promo.usageCount,
        description: promo.description,
        expiryDate: promo.expiryDate ? new Date(promo.expiryDate) : null,
      }).onConflictDoUpdate({
        target: promoCodes.code,
        set: {
          discountType: promo.discountType,
          discountValue: promo.discountValue.toString(),
          minSpend: promo.minSpend?.toString(),
          freeShipping: promo.freeShipping,
          isActive: promo.isActive,
          usageCount: promo.usageCount,
          description: promo.description,
          expiryDate: promo.expiryDate ? new Date(promo.expiryDate) : null,
          updatedAt: new Date(),
        },
      });
    }
    console.log('✅ Promo codes seeded');

    console.log('👤 Seeding admin session...');
    const defaultPinHash = await hashPin('cr2026');
    await db.insert(adminSessions).values({
      adminName: 'CR Admin',
      adminRole: 'Super Admin',
      email: 'admin@crcosmetics.com',
      pinHash: defaultPinHash,
      isActive: true,
    }).onConflictDoNothing();
    console.log('✅ Admin session seeded');

    console.log('🎉 Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));