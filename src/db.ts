import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';

// Load .env.local first, then fall back to .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn('⚠️ DATABASE_URL is not set in environment variables');
}

const sql = neon(connectionString || '');
export const db = drizzle(sql);
export default db;