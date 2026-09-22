-- Each variation owns a description. Existing variation records retain their
-- own JSON row and receive the confirmed parent description only as a safe
-- starting point for later admin editing.
UPDATE "products" AS p
SET "variants" = (
  SELECT jsonb_agg(
    CASE WHEN COALESCE(NULLIF(trim(item->>'description'), ''), '') = ''
      THEN jsonb_set(item, '{description}', to_jsonb(p."description"))
      ELSE item
    END
  )
  FROM jsonb_array_elements(COALESCE(p."variants", '[]'::jsonb)) AS item
)
WHERE jsonb_array_length(COALESCE(p."variants", '[]'::jsonb)) > 0;
