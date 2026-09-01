ALTER TABLE "products" ALTER COLUMN "id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "promo_codes" ALTER COLUMN "id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "promo_codes" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "product_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "wishlists" ALTER COLUMN "product_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_email_unique" UNIQUE("email");