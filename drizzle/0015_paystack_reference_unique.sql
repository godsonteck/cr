DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "orders"
    WHERE "payment_reference" IS NOT NULL
    GROUP BY "payment_reference"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate non-null payment references must be resolved before migration.';
  END IF;
END
$$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "orders_payment_reference_idx" ON "orders" ("payment_reference");