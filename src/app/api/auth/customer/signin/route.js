import { cookies } from 'next/headers';
import { signInCustomer, createCustomerSession } from '@/services/authService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier, password, rememberMe = false } = body;

    if (!identifier || !password) {
      return Response.json(
        { success: false, error: 'Please enter both your email/phone and password.' },
        { status: 400 }
      );
    }

    const customer = await signInCustomer({ identifier, password });
    const { token, expiresAt } = await createCustomerSession(customer.id, rememberMe);

    const cookieStore = await cookies();
    cookieStore.set('cr_customer_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
      path: '/',
      expires: expiresAt,
    });

    return Response.json({
      success: true,
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        emailVerified: customer.emailVerified,
      },
    });
  } catch (error) {
    console.error('[API /api/auth/customer/signin Error]:', error);
    return Response.json(
      { success: false, error: error.message || 'Authentication failed' },
      { status: 401 }
    );
  }
}