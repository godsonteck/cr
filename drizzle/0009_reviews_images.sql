ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "images" jsonb DEFAULT '[]'::jsonb;
