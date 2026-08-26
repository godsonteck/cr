import { cookies } from 'next/headers';
import { destroyCustomerSession } from '@/services/authService';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('cr_customer_session')?.value;

    if (token) {
      await destroyCustomerSession(token);
    }

    cookieStore.delete('cr_customer_session');

    return Response.json({ success: true });
  } catch (error) {
    console.error('[API /api/auth/customer/signout Error]:', error);
    return Response.json(
      { success: false, error: 'Sign out failed' },
      { status: 500 }
    );
  }
}