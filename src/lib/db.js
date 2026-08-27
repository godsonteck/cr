import { neon } from '@neondatabase/serverless';

let sqlClient;

function getSqlClient() {
  if (sqlClient) return sqlClient;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required for database operations');
  }

  sqlClient = neon(connectionString);
  return sqlClient;
}

// Lazily initialize Neon so Next.js can build/collect API route configuration
// without requiring production secrets at build time. The database is still
// required when an API route actually performs a database operation.
export const sql = (...args) => getSqlClient()(...args);

export async function query(queryText, params = []) {
  try {
    return await getSqlClient()(queryText, params);
  } catch (error) {
    console.error('[Neon DB Error]:', error);
    throw error;
  }
}
