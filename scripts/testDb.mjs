import { initializeDatabase } from '../src/lib/initDb.js';

async function main() {
  try {
    console.log('Connecting to Neon PostgreSQL...');
    const res = await initializeDatabase();
    console.log('Result:', res);
  } catch (err) {
    console.error('Database initialization failed:', err);
  }
}

main();
