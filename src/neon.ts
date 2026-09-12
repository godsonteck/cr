import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

dotenv.config({ path: '.env.local' });
dotenv.config();

const rawConnectionString = process.env.DATABASE_URL;
const connectionString = rawConnectionString ? rawConnectionString.replace(/^\uFEFF/, '').trim() : undefined;

if (!connectionString) {
  console.warn('⚠️  DATABASE_URL is not set — database queries will fail until it is configured.');
}

const client = postgres(connectionString || 'postgres://user:pass@localhost:5432/db', {
  ssl: 'require',
  max: 3,                // allow a small pool for concurrent queries in one invocation
  prepare: false,        // required for Supabase transaction pooler (PgBouncer)
  connect_timeout: 10,   // fail fast if DB is unreachable (seconds)
  idle_timeout: 20,      // release idle connections quickly in serverless
});

export const db = drizzle(client);
export default db;
