-- Supplier/manufacturer serial number support for POS scans.
-- Nullable values preserve all existing catalogue and stock data.
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "serial_number" varchar(128);
CREATE UNIQUE INDEX IF NOT EXISTS "products_serial_number_idx" ON "products" ("serial_number");
CREATE INDEX IF NOT EXISTS "products_variants_serial_number_idx" ON "products" USING gin ("variants" jsonb_path_ops);
