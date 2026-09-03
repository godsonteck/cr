ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profile_image" text;
DO $$ BEGIN
	ALTER TYPE "payment_method" ADD VALUE IF NOT EXISTS 'korapay';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;