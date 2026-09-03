ALTER TABLE "flash_deals" ADD COLUMN IF NOT EXISTS "product_ids" jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_reference" varchar(100);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_sender_phone" varchar(50);