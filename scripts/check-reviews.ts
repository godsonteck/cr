import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL;

async function run() {
  if (!connectionString) return;
  const sql = neon(connectionString);
  const pCount = await sql`SELECT count(*) FROM products`;
  const rCount = await sql`SELECT count(*) FROM reviews`;
  const revsByProduct = await sql`SELECT product_id, count(*), avg(rating) FROM reviews GROUP BY product_id`;
  console.log('Total products:', pCount[0].count);
  console.log('Total reviews in reviews table:', rCount[0].count);
  console.log('Reviews by product:', revsByProduct);
  const prodsWithReviews = await sql`SELECT id, name, rating, review_count FROM products WHERE review_count > 0 LIMIT 10`;
  console.log('Products claiming review_count > 0:', prodsWithReviews);
}

run().catch(console.error);
