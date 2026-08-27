import { neon } from '@neondatabase/serverless';

let sqlClient;

function getSqlClient() {
  if (sqlClient) return sqlClient;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Next statically evaluates some client pages during `next build`.
    // Those pages may import services that contain database reads even though
    // no request is being served. Return an empty result during the build only;
    // never silently hide a missing database at runtime.
    if (process.env.NEXT_PHASE === 'phase-production-build') return null;
    throw new Error('DATABASE_URL environment variable is required for database operations');
  }

  sqlClient = neon(connectionString);
  return sqlClient;
}

export const sql = (...args) => {
  const client = getSqlClient();
  if (!client) return Promise.resolve([]);
  return client(...args);
};

export async function query(queryText, params = []) {
  try {
    const client = getSqlClient();
    if (!client) return [];
    return await client(queryText, params);
  } catch (error) {
    console.error('[Neon DB Error]:', error);
    throw error;
  }
}
