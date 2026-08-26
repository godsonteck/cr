import { cookies } from 'next/headers';
import { validateAdminSession } from '@/services/authService';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('cr_admin_session')?.value;

    if (!token) {
      return Response.json({ success: true, staff: null });
    }

    const staff = await validateAdminSession(token);

    if (!staff) {
      cookieStore.delete('cr_admin_session');
      return Response.json({ success: true, staff: null });
    }

    return Response.json({ success: true, staff });
  } catch (error) {
    console.error('[API /api/auth/admin/me Error]:', error);
    return Response.json(
      { success: false, error: 'Session validation failed' },
      { status: 500 }
    );
  }
}