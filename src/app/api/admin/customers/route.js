import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import { validateAdminSession } from '@/services/authService';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('cr_admin_session')?.value;

  if (!token) return null;

  return validateAdminSession(token);
}

export async function GET(request) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!admin.permissions.includes('manage_customers') && admin.role !== 'SUPER_ADMIN') {
      return Response.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('id');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    if (customerId) {
      const rows = await sql`
        SELECT * FROM customers WHERE id = ${customerId} LIMIT 1;
      `;
      if (rows.length === 0) {
        return Response.json({ success: false, error: 'Customer not found' }, { status: 404 });
      }
      const c = rows[0];
      return Response.json({
        success: true,
        customer: {
          id: c.id,
          fullName: c.full_name,
          phone: c.phone,
          email: c.email,
          emailVerified: c.email_verified,
          addresses: c.addresses || [],
          ordersCount: c.orders_count,
          totalSpent: parseFloat(c.total_spent || 0),
          status: c.status,
          createdAt: c.created_at,
        },
      });
    }

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      whereClause += ` AND (LOWER(full_name) LIKE $${params.length} OR phone LIKE $${params.length} OR LOWER(email) LIKE $${params.length})`;
    }

    const countQuery = `SELECT COUNT(*) as count FROM customers ${whereClause}`;
    const countResult = await sql(countQuery, params);
    const totalCount = parseInt(countResult[0]?.count || '0', 10);

    params.push(limit, offset);
    const query = `SELECT * FROM customers ${whereClause} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const rows = await sql(query, params);

    return Response.json({
      success: true,
      customers: rows.map(c => ({
        id: c.id,
        fullName: c.full_name,
        phone: c.phone,
        email: c.email,
        emailVerified: c.email_verified,
        addresses: c.addresses || [],
        ordersCount: c.orders_count,
        totalSpent: parseFloat(c.total_spent || 0),
        status: c.status,
        createdAt: c.created_at,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('[API /api/admin/customers GET Error]:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!admin.permissions.includes('manage_customers') && admin.role !== 'SUPER_ADMIN') {
      return Response.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { customerId, status, ...updates } = body;

    if (!customerId) {
      return Response.json({ success: false, error: 'Customer ID is required' }, { status: 400 });
    }

    const allowedFields = ['full_name', 'phone', 'addresses', 'status'];
    const setClauses = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = $${values.length + 1}`);
        if (key === 'addresses') {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
      }
    }

    if (status) {
      setClauses.push(`status = $${values.length + 1}`);
      values.push(status);
    }

    if (setClauses.length === 0) {
      return Response.json({ success: false, error: 'No valid fields to update' }, { status: 400 });
    }

    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    values.push(customerId);

    const query = `UPDATE customers SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`;
    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    // Record audit log
    await sql`
      INSERT INTO audit_logs (event_type, actor_name, actor_role, description, details)
      VALUES ('CUSTOMER_UPDATED', ${admin.name}, 'ADMIN', ${`Updated customer: ${customerId}`}, ${JSON.stringify({ customerId, updates })});
    `;

    return Response.json({ success: true, customer: result[0] });
  } catch (error) {
    console.error('[API /api/admin/customers PATCH Error]:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}