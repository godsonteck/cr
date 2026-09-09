ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "admin_notes" jsonb DEFAULT '[]'::jsonb NOT NULL;
