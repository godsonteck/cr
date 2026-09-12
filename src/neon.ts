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
  max: 1, // serverless-friendly: keep connection pool minimal
});

export const db = drizzle(client);
export default db;
