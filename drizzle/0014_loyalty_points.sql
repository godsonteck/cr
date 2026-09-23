ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "loyalty_points" integer NOT NULL DEFAULT 0;
