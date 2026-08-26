import { sql } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return Response.json({ success: false, status: 'INVALID' }, { status: 400 });
    }

    const tokens = await sql`
      SELECT customer_id FROM email_verification_tokens
      WHERE token = ${token} AND expires_at > CURRENT_TIMESTAMP
      LIMIT 1;
    `;

    if (tokens.length === 0) {
      return Response.json({ success: false, status: 'INVALID' });
    }

    const customerId = tokens[0].customer_id;

    const customers = await sql`
      SELECT id, full_name, email_verified FROM customers WHERE id = ${customerId} LIMIT 1;
    `;

    if (customers.length === 0) {
      return Response.json({ success: false, status: 'INVALID' });
    }

    const customer = customers[0];

    if (customer.email_verified) {
      await sql`DELETE FROM email_verification_tokens WHERE token = ${token};`;
      return Response.json({ success: true, status: 'ALREADY_VERIFIED' });
    }

    await sql`UPDATE customers SET email_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = ${customerId};`;
    await sql`DELETE FROM email_verification_tokens WHERE token = ${token};`;

    return Response.json({
      success: true,
      status: 'VERIFIED',
      customer: {
        id: customer.id,
        fullName: customer.full_name,
      },
    });
  } catch (error) {
    console.error('[API /api/auth/customer/verify-email Error]:', error);
    return Response.json({ success: false, status: 'INVALID' }, { status: 500 });
  }
}