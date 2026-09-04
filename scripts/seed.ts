import { db } from '../src/db';
import {
  products,
  categories,
  brands,
  storeSettings,
  promoCodes,
  adminSessions,
} from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { PRODUCTS, CATEGORIES_CONFIG, BRANDS_LIST } from '../src/data/products';
import bcrypt from 'bcryptjs';

const DEFAULT_STORE_SETTINGS = {
  storeName: 'CR Cosmetics and Essential',
  storeTagline: 'Your Beauty. Your Essentials. Your Glow.',
  heroHeadline: 'Your Beauty. Your Essentials. Your Glow.',
  heroSubtitle: 'Shop beauty, personal care and household essentials.',
  heroBadge: '100% ORIGINAL & AUTHENTIC',
  heroButtonText: 'SHOP NOW',
  announcementText: '',
  announcementVisible: false,
  announcementBg: '#5B2333',
  freeDeliveryThreshold: 300,
  currency: 'GHS',
  standardShippingFee: 30,
  expressShippingFee: 50,
  intercityShippingFee: 70,
  storePhone: '+233 59 215 3306',
  storeEmail: 'contact@crcosmetics.com',
  storeAddress: 'CR Cosmetics and Essential • Accra, Ghana (Google Maps: https://maps.app.goo.gl/iZj5aqj13gCaYZ1m9)',
  storeHours: 'Mon - Sat: 8:00 AM - 8:00 PM | Sun: 12:00 PM - 6:00 PM',
  whatsappNumber: '233592153306',
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

    const initialAdminPin = process.env.ADMIN_INITIAL_PIN?.trim();
    if (initialAdminPin) {
      console.log('👤 Seeding admin session from ADMIN_INITIAL_PIN...');
      const defaultPinHash = await bcrypt.hash(initialAdminPin, 12);
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@crcosmetics.com';
      
      // Check if admin already exists
      const [existingAdmin] = await db.select().from(adminSessions).where(eq(adminSessions.email, adminEmail)).limit(1);
      
      if (existingAdmin) {
        console.log('ℹ️ Admin with email ' + adminEmail + ' already exists, skipping insert');
      } else {
        await db.insert(adminSessions).values({
          adminName: 'CR Admin',
          adminRole: 'Super Admin',
          email: adminEmail,
          pinHash: defaultPinHash,
          isActive: true,
        });
        console.log('✅ Admin session seeded');
      }
    } else {
      console.log('ℹ️ No ADMIN_INITIAL_PIN provided; skipping admin session seed. Create the first admin with a secure PIN in the database or via the admin setup flow.');
    }

    console.log('🎉 Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));