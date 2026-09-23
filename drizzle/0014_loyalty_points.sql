ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "loyalty_points" integer NOT NULL DEFAULT 0;
ALTER TYPE "order_status" ADD VALUE IF NOT EXISTS 'Refunded';
ALTER TYPE "admin_role" ADD VALUE IF NOT EXISTS 'Cashier';
