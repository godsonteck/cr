import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL;

async function run() {
  if (!connectionString) {
    console.error('No DATABASE_URL found!');
    process.exit(1);
  }
  const sql = neon(connectionString);
  try {
    console.log('Adding images column to reviews table if not exists...');
    await sql`ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "images" jsonb DEFAULT '[]'::jsonb;`;
    console.log('Successfully added or confirmed images column in reviews table.');
  } catch (err) {
    console.error('Error running migration:', err);
  }
}

run();
