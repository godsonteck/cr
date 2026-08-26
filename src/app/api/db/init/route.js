import { initializeDatabase } from '@/lib/initDb';

export async function GET() {
  try {
    const result = await initializeDatabase();
    return Response.json(result);
  } catch (error) {
    console.error('[API /api/db/init Error]:', error);
    return Response.json(
      { success: false, error: error.message || 'Database initialization failed' },
      { status: 500 }
    );
  }
}
