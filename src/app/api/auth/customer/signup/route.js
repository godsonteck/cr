import { signUpCustomer, createCustomerSession } from '@/services/authService';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, password } = body;

    if (!fullName || !email || !password) {
      return Response.json(
        { success: false, error: 'Full name, email, and password are required.' },
        { status: 400 }
      );
    }

    const result = await signUpCustomer({ fullName, email, phone, password });
    const { token, expiresAt } = await createCustomerSession(result.user.id, true);

    const cookieStore = await cookies();
    cookieStore.set('cr_customer_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      expires: expiresAt,
    });

    return Response.json({
      success: true,
      customer: {
        id: result.user.id,
        fullName: result.user.fullName,
        email: result.user.email,
        phone: result.user.phone,
        emailVerified: result.user.emailVerified,
      },
    });
  } catch (error) {
    console.error('[API /api/auth/customer/signup Error]:', error);
    return Response.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 400 }
    );
  }
}