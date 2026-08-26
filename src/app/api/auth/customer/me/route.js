import { cookies } from 'next/headers';
import { validateCustomerSession } from '@/services/authService';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('cr_customer_session')?.value;

    if (!token) {
      return Response.json({ success: true, customer: null });
    }

    const customer = await validateCustomerSession(token);

    if (!customer) {
      cookieStore.delete('cr_customer_session');
      return Response.json({ success: true, customer: null });
    }

    return Response.json({ success: true, customer });
  } catch (error) {
    console.error('[API /api/auth/customer/me Error]:', error);
    return Response.json(
      { success: false, error: 'Session validation failed' },
      { status: 500 }
    );
  }
}