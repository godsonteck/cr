import { neon } from '@neondatabase/serverless';

let sqlClient = null;
let hasWarned = false;

function getSqlClient() {
  if (sqlClient) return sqlClient;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    if (!hasWarned) {
      console.warn('[Database Notice]: DATABASE_URL is not configured. Returning fallback data.');
      hasWarned = true;
    }
    return null;
  }

  try {
    sqlClient = neon(connectionString);
    return sqlClient;
  } catch (err) {
    console.error('[Neon DB Init Error]:', err.message);
    return null;
  }
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
    return [];
  }
}
