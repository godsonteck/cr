import { db } from '../src/db';

async function runMigration() {
  console.log('🔄 Running migration...');
  
  // Create enums
  const enums = [
    `CREATE TYPE "public"."admin_role" AS ENUM('Super Admin', 'Store Manager', 'Inventory Dispatcher')`,
    `CREATE TYPE "public"."category_type" AS ENUM('all', 'skincare', 'makeup', 'fragrances', 'body-care', 'beauty-tools', 'rice-grains', 'cooking-oils', 'seasoning-spices', 'beverages', 'snacks-sweets', 'household-care', 'daily-essentials', 'new-arrivals', 'best-sellers', 'offers')`,
    `CREATE TYPE "public"."delivery_method" AS ENUM('accra-express', 'standard-delivery', 'intercity', 'store-pickup')`,
    `CREATE TYPE "public"."department" AS ENUM('beauty', 'groceries')`,
    `CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed')`,
    `CREATE TYPE "public"."order_status" AS ENUM('Confirmed', 'Processing', 'Packing Order', 'Out for Delivery', 'Delivered')`,
    `CREATE TYPE "public"."payment_method" AS ENUM('paystack', 'momo-mtn', 'momo-telecel', 'momo-at', 'cash-on-delivery', 'card', 'apple-pay')`,
    `CREATE TYPE "public"."payment_status" AS ENUM('paid', 'pending')`,
    `CREATE TYPE "public"."routine_step" AS ENUM('cleanse', 'treat', 'hydrate', 'protect')`,
  ];

  for (const enumSql of enums) {
    try {
      await db.execute(enumSql);
      console.log('✅ Enum created');
    } catch (e: any) {
      if (e.code === '42710') console.log('⚠️ Enum already exists');
      else console.error('Enum error:', e.message);
    }
  }

  // Create tables
  const tables = [
    `CREATE TABLE "admin_sessions" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "admin_name" varchar(100) NOT NULL, "admin_role" "admin_role" NOT NULL, "email" varchar(255) NOT NULL, "pin_hash" varchar(255) NOT NULL, "is_active" boolean DEFAULT true NOT NULL, "last_login_at" timestamp, "created_at" timestamp DEFAULT now() NOT NULL)`,
    `CREATE TABLE "brands" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "name" varchar(100) NOT NULL, "is_active" boolean DEFAULT true NOT NULL, "created_at" timestamp DEFAULT now() NOT NULL, CONSTRAINT "brands_name_unique" UNIQUE("name"))`,
    `CREATE TABLE "carts" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "user_id" uuid, "session_id" varchar(100), "items" jsonb DEFAULT '[]'::jsonb NOT NULL, "promo_code" varchar(50), "discount_amount" numeric(10, 2) DEFAULT '0', "has_free_shipping_coupon" boolean DEFAULT false, "selected_samples" jsonb DEFAULT '[]'::jsonb, "created_at" timestamp DEFAULT now() NOT NULL, "updated_at" timestamp DEFAULT now() NOT NULL)`,
    `CREATE TABLE "categories" ("id" "category_type" PRIMARY KEY NOT NULL, "slug" varchar(100) NOT NULL, "name" varchar(100) NOT NULL, "department" "department" NOT NULL, "image" text NOT NULL, "description" text NOT NULL, "is_active" boolean DEFAULT true NOT NULL, "sort_order" integer DEFAULT 0, "created_at" timestamp DEFAULT now() NOT NULL, "updated_at" timestamp DEFAULT now() NOT NULL, CONSTRAINT "categories_slug_unique" UNIQUE("slug"))`,
    `CREATE TABLE "flash_deals" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "title" varchar(200) NOT NULL, "subtitle" varchar(300), "description" text, "badge_text" varchar(100), "discount_percentage" integer NOT NULL, "hours_remaining" integer DEFAULT 0 NOT NULL, "minutes_remaining" integer DEFAULT 0 NOT NULL, "seconds_remaining" integer DEFAULT 0 NOT NULL, "is_active" boolean DEFAULT true NOT NULL, "expires_at" timestamp NOT NULL, "background_gradient" varchar(200), "created_at" timestamp DEFAULT now() NOT NULL, "updated_at" timestamp DEFAULT now() NOT NULL)`,
    `CREATE TABLE "orders" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "order_number" varchar(50) NOT NULL, "user_id" uuid, "items" jsonb NOT NULL, "subtotal" numeric(10, 2) NOT NULL, "shipping_fee" numeric(10, 2) NOT NULL, "discount" numeric(10, 2) DEFAULT '0' NOT NULL, "total" numeric(10, 2) NOT NULL, "payment_method" "payment_method" NOT NULL, "payment_status" "payment_status" DEFAULT 'pending' NOT NULL, "delivery_method" "delivery_method" NOT NULL, "shipping_address" jsonb NOT NULL, "status" "order_status" DEFAULT 'Confirmed' NOT NULL, "estimated_delivery_time" varchar(100), "applied_promo_code" varchar(50), "rider_info" jsonb, "created_at" timestamp DEFAULT now() NOT NULL, "updated_at" timestamp DEFAULT now() NOT NULL, CONSTRAINT "orders_order_number_unique" UNIQUE("order_number"))`,
    `CREATE TABLE "products" ("id" varchar(100) PRIMARY KEY NOT NULL, "name" varchar(255) NOT NULL, "brand" varchar(100) NOT NULL, "department" "department" NOT NULL, "category" "category_type" NOT NULL, "category_label" varchar(100) NOT NULL, "price" numeric(10, 2) NOT NULL, "original_price" numeric(10, 2), "discount_badge" varchar(20), "unit" varchar(100) NOT NULL, "image" text NOT NULL, "images" jsonb DEFAULT '[]'::jsonb NOT NULL, "description" text NOT NULL, "highlights" jsonb DEFAULT '[]'::jsonb NOT NULL, "badge" varchar(50), "in_stock" boolean DEFAULT true NOT NULL, "is_published" boolean DEFAULT true NOT NULL, "stock_count" integer DEFAULT 0 NOT NULL, "rating" numeric(3, 1) DEFAULT '5.0' NOT NULL, "review_count" integer DEFAULT 0 NOT NULL, "origin" varchar(100), "routine_step" "routine_step", "skin_type" jsonb DEFAULT '[]'::jsonb, "skin_concern" jsonb DEFAULT '[]'::jsonb, "pack_size" varchar(50), "storage_info" text, "shelf_life" varchar(50), "variants" jsonb DEFAULT '[]'::jsonb, "details" jsonb, "created_at" timestamp DEFAULT now() NOT NULL, "updated_at" timestamp DEFAULT now() NOT NULL)`,
    `CREATE TABLE "promo_codes" ("id" varchar(100) PRIMARY KEY NOT NULL, "code" varchar(50) NOT NULL, "discount_type" "discount_type" NOT NULL, "discount_value" numeric(10, 2) NOT NULL, "min_spend" numeric(10, 2), "free_shipping" boolean DEFAULT false NOT NULL, "is_active" boolean DEFAULT true NOT NULL, "usage_count" integer DEFAULT 0 NOT NULL, "max_usage" integer, "description" text, "expiry_date" timestamp, "created_at" timestamp DEFAULT now() NOT NULL, "updated_at" timestamp DEFAULT now() NOT NULL, CONSTRAINT "promo_codes_code_unique" UNIQUE("code"))`,
    `CREATE TABLE "reviews" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "product_id" varchar(100) NOT NULL, "user_id" uuid, "author_name" varchar(100) NOT NULL, "rating" integer NOT NULL, "title" varchar(200), "comment" text NOT NULL, "verified_purchase" boolean DEFAULT false NOT NULL, "skin_type" varchar(50), "helpful_count" integer DEFAULT 0 NOT NULL, "admin_reply" text, "is_approved" boolean DEFAULT true NOT NULL, "created_at" timestamp DEFAULT now() NOT NULL, "updated_at" timestamp DEFAULT now() NOT NULL)`,
    `CREATE TABLE "store_settings" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "key" varchar(100) NOT NULL, "value" jsonb NOT NULL, "updated_at" timestamp DEFAULT now() NOT NULL, CONSTRAINT "store_settings_key_unique" UNIQUE("key"))`,
    `CREATE TABLE "users" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "email" varchar(255) NOT NULL, "full_name" varchar(100) NOT NULL, "phone" varchar(50) NOT NULL, "password_hash" varchar(255), "saved_addresses" jsonb DEFAULT '[]'::jsonb, "saved_item_ids" jsonb DEFAULT '[]'::jsonb, "is_active" boolean DEFAULT true NOT NULL, "created_at" timestamp DEFAULT now() NOT NULL, "updated_at" timestamp DEFAULT now() NOT NULL, CONSTRAINT "users_email_unique" UNIQUE("email"))`,
    `CREATE TABLE "wishlists" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "user_id" uuid, "session_id" varchar(100), "product_id" varchar(100) NOT NULL, "created_at" timestamp DEFAULT now() NOT NULL)`,
  ];

  for (const tableSql of tables) {
    try {
      await db.execute(tableSql);
      console.log('✅ Table created');
    } catch (e: any) {
      if (e.code === '42P07') console.log('⚠️ Table already exists');
      else console.error('Table error:', e.message);
    }
  }

  // Foreign keys and indexes
  const fksAndIndexes = [
    `ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action`,
    `ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action`,
    `ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action`,
    `ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action`,
    `ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action`,
    `ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action`,
    `CREATE INDEX "carts_user_id_idx" ON "carts" USING btree ("user_id")`,
    `CREATE INDEX "carts_session_id_idx" ON "carts" USING btree ("session_id")`,
    `CREATE INDEX "flash_deals_active_idx" ON "flash_deals" USING btree ("is_active")`,
    `CREATE INDEX "flash_deals_expires_at_idx" ON "flash_deals" USING btree ("expires_at")`,
    `CREATE INDEX "orders_user_id_idx" ON "orders" USING btree ("user_id")`,
    `CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status")`,
    `CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at")`,
    `CREATE UNIQUE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number")`,
    `CREATE INDEX "products_category_idx" ON "products" USING btree ("category")`,
    `CREATE INDEX "products_department_idx" ON "products" USING btree ("department")`,
    `CREATE INDEX "products_published_idx" ON "products" USING btree ("is_published")`,
    `CREATE INDEX "products_brand_idx" ON "products" USING btree ("brand")`,
    `CREATE UNIQUE INDEX "promo_codes_code_idx" ON "promo_codes" USING btree ("code")`,
    `CREATE INDEX "promo_codes_active_idx" ON "promo_codes" USING btree ("is_active")`,
    `CREATE INDEX "reviews_product_id_idx" ON "reviews" USING btree ("product_id")`,
    `CREATE INDEX "reviews_user_id_idx" ON "reviews" USING btree ("user_id")`,
    `CREATE INDEX "reviews_approved_idx" ON "reviews" USING btree ("is_approved")`,
    `CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email")`,
    `CREATE INDEX "wishlists_user_id_idx" ON "wishlists" USING btree ("user_id")`,
    `CREATE INDEX "wishlists_session_id_idx" ON "wishlists" USING btree ("session_id")`,
    `CREATE UNIQUE INDEX "wishlists_unique_user_product" ON "wishlists" USING btree ("user_id","product_id")`,
    `CREATE UNIQUE INDEX "wishlists_unique_session_product" ON "wishlists" USING btree ("session_id","product_id")`,
  ];

  for (const sql of fksAndIndexes) {
    try {
      await db.execute(sql);
      console.log('✅ Index/FK created');
    } catch (e: any) {
      if (e.code === '42P07' || e.code === '42710') console.log('⚠️ Already exists');
      else console.error('FK/Index error:', e.message);
    }
  }

  console.log('🎉 Migration completed!');
}

runMigration()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  });