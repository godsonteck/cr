import { cookies } from 'next/headers';
import { destroyAdminSession } from '@/services/authService';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('cr_admin_session')?.value;

    if (token) {
      await destroyAdminSession(token);
    }

    cookieStore.delete('cr_admin_session');

    return Response.json({ success: true });
  } catch (error) {
    console.error('[API /api/auth/admin/signout Error]:', error);
    return Response.json(
      { success: false, error: 'Sign out failed' },
      { status: 500 }
    );
  }
}