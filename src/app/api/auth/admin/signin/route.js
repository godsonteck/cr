import { cookies } from 'next/headers';
import { signInAdmin, createAdminSession } from '@/services/authService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier, password, rememberMe = false } = body;

    if (!identifier || !password) {
      return Response.json(
        { success: false, error: 'Please enter your staff email or username and password.' },
        { status: 400 }
      );
    }

    const staff = await signInAdmin({ identifier, password });
    const { token, expiresAt } = await createAdminSession(staff.id, rememberMe);

    const cookieStore = await cookies();
    cookieStore.set('cr_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24,
      path: '/',
      expires: expiresAt,
    });

    return Response.json({
      success: true,
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        roleName: staff.roleName,
        permissions: staff.permissions,
      },
    });
  } catch (error) {
    console.error('[API /api/auth/admin/signin Error]:', error);
    return Response.json(
      { success: false, error: error.message || 'Authentication failed' },
      { status: 401 }
    );
  }
}