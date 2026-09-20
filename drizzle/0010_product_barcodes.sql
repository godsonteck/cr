-- POS barcode support. Nullable values preserve all existing products.
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "barcode" varchar(128);
CREATE UNIQUE INDEX IF NOT EXISTS "products_barcode_idx" ON "products" ("barcode");
CREATE INDEX IF NOT EXISTS "products_variants_barcode_idx" ON "products" USING gin ("variants" jsonb_path_ops);
