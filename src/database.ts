import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

dotenv.config({ path: '.env.local' });
dotenv.config();

const rawConnectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
const connectionString = rawConnectionString ? rawConnectionString.replace(/^\uFEFF/, '').trim() : undefined;

if (!connectionString) {
  throw new Error('DATABASE_URL is required; refusing to start without a database connection');
}

const client = postgres(connectionString, {
  ssl: 'require',
  max: 3,
  prepare: false,
  connect_timeout: 10,
  idle_timeout: 20,
});

export const db = drizzle(client);
export default db;