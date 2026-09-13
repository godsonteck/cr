import { sql } from 'drizzle-orm';
import { db } from '../src/db.js';

async function run() {
  await db.execute(sql.raw(`ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "images" jsonb DEFAULT '[]'::jsonb`));
  console.log('Production reviews.images column verified.');
}

run().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
});
