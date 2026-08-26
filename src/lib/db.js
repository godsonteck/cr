import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required but not set');
}

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
