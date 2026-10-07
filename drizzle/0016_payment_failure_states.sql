ALTER TYPE "order_status" ADD VALUE IF NOT EXISTS 'Cancelled';
--> statement-breakpoint
ALTER TYPE "payment_status" ADD VALUE IF NOT EXISTS 'failed';