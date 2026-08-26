import { neon } from '@neondatabase/serverless';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_NTQDd27Agkuw@ep-cool-term-ay9u3ysn-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Neon serverless SQL query tag
export const sql = neon(connectionString);

export async function query(queryText, params = []) {
  try {
    return await sql(queryText, params);
  } catch (error) {
    console.error('[Neon DB Error]:', error);
    throw error;
  }
}
