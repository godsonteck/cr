// ═══════════════════════════════════════════════════════════
// CR COSMETICS & ESSENTIALS
// Server-Side Authentication Service with bcrypt
// ═══════════════════════════════════════════════════════════

import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { ROLES } from './staffService';

const BCRYPT_ROUNDS = 12;

// Format / sanitize Ghanaian phone numbers
export function formatGhanaPhone(input) {
  if (!input) return '';
  let cleaned = input.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+233')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('233')) {
    cleaned = '0' + cleaned.slice(3);
  }
  return cleaned;
}

export function isValidGhanaPhone(phone) {
  const normalized = formatGhanaPhone(phone);
  return /^0(24|25|54|55|59|53|20|50|27|57|26|28|23)\d{7}$/.test(normalized);
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

export function evaluatePasswordStrength(password) {
  if (!password) return { score: 0, label: 'None', color: '#D8CAD0', checks: { length: false, mixed: false, number: false, symbol: false } };

  const checks = {
    length: password.length >= 8,
    mixed: /[a-z]/.test(password) && /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^a-zA-Z0-9]/.test(password),
  };

  const count = Object.values(checks).filter(Boolean).length;
  let score = 0;
  let label = 'Weak';
  let color = '#E05666';

  if (password.length >= 6 && count === 1) {
    score = 1;
    label = 'Weak';
    color = '#E05666';
  } else if (count === 2 || (count === 3 && password.length < 8)) {
    score = 2;
    label = 'Fair';
    color = '#F59E0B';
  } else if (count === 3 && password.length >= 8) {
    score = 3;
    label = 'Good';
    color = '#3B82F6';
  } else if (count >= 4 && password.length >= 8) {
    score = 4;
    label = 'Strong';
    color = '#10B981';
  }

  return { score, label, color, checks };
}

// ═══════════════════════════════════════════════════════════
// CUSTOMER AUTHENTICATION (Server-Side)
// ═══════════════════════════════════════════════════════════

export async function signInCustomer({ identifier, password }) {
  if (!identifier || !password) {
    throw new Error('Please enter both your email/phone and password.');
  }

  const cleanIdent = identifier.trim().toLowerCase();
  const normalizedPhone = formatGhanaPhone(identifier);

  const customers = await sql`
    SELECT id, full_name, email, phone, password_hash, email_verified, status, addresses
    FROM customers
    WHERE LOWER(email) = ${cleanIdent} OR phone = ${normalizedPhone}
    LIMIT 1;
  `;

  if (customers.length === 0) {
    throw new Error('Incorrect email/phone or password. Please try again.');
  }

  const customer = customers[0];

  if (customer.status === 'DISABLED') {
    throw new Error('This account is currently unavailable. Please contact customer support.');
  }

  const isValidPassword = await bcrypt.compare(password, customer.password_hash);
  if (!isValidPassword) {
    throw new Error('Incorrect email/phone or password. Please try again.');
  }

  return {
    id: customer.id,
    fullName: customer.full_name,
    email: customer.email,
    phone: customer.phone,
    emailVerified: customer.email_verified ?? true,
  };
}

export async function signUpCustomer({ fullName, email, phone, password }) {
  if (!fullName || fullName.trim().length < 2) {
    throw new Error('Please enter your full name.');
  }

  if (!email || !isValidEmail(email)) {
    throw new Error('Please enter a valid email address.');
  }

  if (phone && !isValidGhanaPhone(phone)) {
    throw new Error('Please enter a valid Ghanaian phone number (e.g. 0592153306 or 0244123456).');
  }

  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = formatGhanaPhone(phone);

  const existingEmail = await sql`
    SELECT id FROM customers WHERE LOWER(email) = ${cleanEmail} LIMIT 1;
  `;
  if (existingEmail.length > 0) {
    throw new Error('An account with this email already exists. Please sign in instead.');
  }

  if (cleanPhone) {
    const existingPhone = await sql`
      SELECT id FROM customers WHERE phone = ${cleanPhone} LIMIT 1;
    `;
    if (existingPhone.length > 0) {
      throw new Error('An account with this phone number already exists. Please sign in instead.');
    }
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const customerId = `CUST-${Date.now().toString().slice(-6)}`;

  await sql`
    INSERT INTO customers (id, full_name, phone, email, password_hash, email_verified, addresses)
    VALUES (${customerId}, ${fullName.trim()}, ${cleanPhone || ''}, ${cleanEmail}, ${passwordHash}, false, '[]'::jsonb);
  `;

  // Create email verification token
  const verifyToken = `verify_${customerId}_${Date.now()}`;
  const expiresAt = new Date(Date.now() + 86400000 * 2); // 2 days
  await sql`
    INSERT INTO email_verification_tokens (token, customer_id, expires_at)
    VALUES (${verifyToken}, ${customerId}, ${expiresAt.toISOString()});
  `;

  // TODO: Send verification email with link containing the token
  // For now, we'll return the token for development purposes
  return {
    user: {
      id: customerId,
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: cleanPhone || '',
      emailVerified: false,
    },
    verificationToken: verifyToken,
  };
}

export async function getCustomerById(customerId) {
  const customers = await sql`
    SELECT id, full_name, email, phone, email_verified, addresses, created_at
    FROM customers
    WHERE id = ${customerId}
    LIMIT 1;
  `;

  if (customers.length === 0) return null;

  const c = customers[0];
  return {
    id: c.id,
    fullName: c.full_name,
    email: c.email,
    phone: c.phone,
    emailVerified: c.email_verified,
    addresses: c.addresses || [],
    createdAt: c.created_at,
  };
}

export async function updateCustomerProfile(customerId, updates) {
  const allowedFields = ['full_name', 'phone', 'addresses'];
  const setClauses = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      setClauses.push(`${key} = $${values.length + 1}`);
      values.push(value);
    }
  }

  if (setClauses.length === 0) return null;

  values.push(customerId);
  const query = `UPDATE customers SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING *`;

  const result = await sql(query, values);
  return result[0] || null;
}

export async function changeCustomerPassword(customerId, currentPassword, newPassword) {
  const customers = await sql`
    SELECT password_hash FROM customers WHERE id = ${customerId} LIMIT 1;
  `;

  if (customers.length === 0) {
    throw new Error('Account not found.');
  }

  const isValid = await bcrypt.compare(currentPassword, customers[0].password_hash);
  if (!isValid) {
    throw new Error('Current password is incorrect.');
  }

  if (!newPassword || newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters long.');
  }

  const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await sql`UPDATE customers SET password_hash = ${newHash}, updated_at = CURRENT_TIMESTAMP WHERE id = ${customerId};`;

  return { success: true };
}

// ═══════════════════════════════════════════════════════════
// ADMIN & STAFF AUTHENTICATION (Server-Side)
// ═══════════════════════════════════════════════════════════

export async function signInAdmin({ identifier, password }) {
  if (!identifier || !password) {
    throw new Error('Please enter your staff email or username and password.');
  }

  const cleanIdent = identifier.trim().toLowerCase();

  const staff = await sql`
    SELECT id, name, email, role, status, password_hash
    FROM staff
    WHERE LOWER(email) = ${cleanIdent} OR LOWER(name) = ${cleanIdent}
    LIMIT 1;
  `;

  if (staff.length === 0) {
    throw new Error('Invalid credentials or unauthorized staff account.');
  }

  const staffUser = staff[0];

  if (staffUser.status !== 'ACTIVE') {
    throw new Error('This staff account is currently inactive. Contact your Super Administrator.');
  }

  const isValidPassword = await bcrypt.compare(password, staffUser.password_hash);
  if (!isValidPassword) {
    throw new Error('Invalid credentials. Please verify your staff password.');
  }

  const roleConfig = ROLES[staffUser.role];
  return {
    id: staffUser.id,
    name: staffUser.name,
    email: staffUser.email,
    role: staffUser.role,
    roleName: roleConfig?.name || staffUser.role,
    permissions: roleConfig?.permissions || [],
  };
}

export async function createStaffUser({ name, email, password, role = 'ORDER_STAFF' }, createdBy) {
  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required.');
  }

  if (!ROLES[role]) {
    throw new Error('Invalid role specified.');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  const existing = await sql`SELECT id FROM staff WHERE LOWER(email) = ${email.toLowerCase()} LIMIT 1;`;
  if (existing.length > 0) {
    throw new Error('A staff member with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const staffId = `USR-${Date.now().toString().slice(-6)}`;

  await sql`
    INSERT INTO staff (id, name, email, role, status, password_hash)
    VALUES (${staffId}, ${name}, ${email.toLowerCase()}, ${role}, 'ACTIVE', ${passwordHash});
  `;

  const roleConfig = ROLES[role];
  return {
    id: staffId,
    name,
    email: email.toLowerCase(),
    role,
    roleName: roleConfig.name,
    permissions: roleConfig.permissions,
  };
}

export async function getAllStaffUsers() {
  const staff = await sql`
    SELECT id, name, email, role, status, last_active, created_at
    FROM staff
    ORDER BY created_at DESC;
  `;

  return staff.map(s => ({
    id: s.id,
    name: s.name,
    email: s.email,
    role: s.role,
    status: s.status,
    lastActive: s.last_active,
    createdAt: s.created_at,
  }));
}

// ═══════════════════════════════════════════════════════════
// PASSWORD RESET (Server-Side)
// ═══════════════════════════════════════════════════════════

export async function requestPasswordReset(email) {
  if (!email || !isValidEmail(email)) {
    throw new Error('Please enter a valid email address.');
  }

  const cleanEmail = email.trim().toLowerCase();

  const customers = await sql`
    SELECT id, email FROM customers WHERE LOWER(email) = ${cleanEmail} LIMIT 1;
  `;

  // Always return success to prevent email enumeration
  if (customers.length === 0) {
    return { success: true };
  }

  const customer = customers[0];
  const token = `rst_${Math.random().toString(36).slice(2, 12)}_${Date.now()}`;
  const expiresAt = new Date(Date.now() + 3600000 * 2); // 2 hours

  await sql`
    INSERT INTO password_reset_tokens (token, customer_id, email, expires_at)
    VALUES (${token}, ${customer.id}, ${customer.email}, ${expiresAt.toISOString()});
  `;

  // TODO: Send email with reset link
  // For now, return token for development
  return { success: true, simulatedToken: token };
}

export async function validateResetToken(token) {
  if (!token) return { valid: false, reason: 'INVALID' };

  const tokens = await sql`
    SELECT customer_id, email, expires_at FROM password_reset_tokens
    WHERE token = ${token} AND expires_at > CURRENT_TIMESTAMP
    LIMIT 1;
  `;

  if (tokens.length === 0) return { valid: false, reason: 'INVALID_OR_EXPIRED' };

  return { valid: true, userId: tokens[0].customer_id, email: tokens[0].email };
}

export async function resetPasswordWithToken({ token, newPassword }) {
  const validation = await validateResetToken(token);
  if (!validation.valid) {
    throw new Error('Invalid or expired reset link. Please request a new link.');
  }

  if (!newPassword || newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters long.');
  }

  const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await sql`UPDATE customers SET password_hash = ${newHash}, updated_at = CURRENT_TIMESTAMP WHERE id = ${validation.userId};`;
  await sql`DELETE FROM password_reset_tokens WHERE token = ${token};`;

  return { success: true };
}

// ═══════════════════════════════════════════════════════════
// SESSION MANAGEMENT (Server-Side with HttpOnly Cookies)
// ═══════════════════════════════════════════════════════════

export function createSessionToken() {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 16)}`;
}

export async function createCustomerSession(customerId, rememberMe = false) {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + (rememberMe ? 86400000 * 30 : 86400000 * 1));

  await sql`
    INSERT INTO customer_sessions (token, customer_id, expires_at)
    VALUES (${token}, ${customerId}, ${expiresAt.toISOString()});
  `;

  return { token, expiresAt };
}

export async function createAdminSession(staffId, rememberMe = false) {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + (rememberMe ? 86400000 * 7 : 86400000 * 1));

  await sql`
    INSERT INTO admin_sessions (token, staff_id, expires_at)
    VALUES (${token}, ${staffId}, ${expiresAt.toISOString()});
  `;

  return { token, expiresAt };
}

export async function validateCustomerSession(token) {
  if (!token) return null;

  const sessions = await sql`
    SELECT cs.customer_id, c.full_name, c.email, c.phone, c.email_verified
    FROM customer_sessions cs
    JOIN customers c ON c.id = cs.customer_id
    WHERE cs.token = ${token} AND cs.expires_at > CURRENT_TIMESTAMP
    LIMIT 1;
  `;

  if (sessions.length === 0) return null;

  const s = sessions[0];
  return {
    id: s.customer_id,
    fullName: s.full_name,
    email: s.email,
    phone: s.phone,
    emailVerified: s.email_verified,
  };
}

export async function validateAdminSession(token) {
  if (!token) return null;

  const sessions = await sql`
    SELECT s.id, s.name, s.email, s.role, s.status
    FROM admin_sessions ass
    JOIN staff s ON s.id = ass.staff_id
    WHERE ass.token = ${token} AND ass.expires_at > CURRENT_TIMESTAMP AND s.status = 'ACTIVE'
    LIMIT 1;
  `;

  if (sessions.length === 0) return null;

  const s = sessions[0];
  const roleConfig = ROLES[s.role];
  return {
    id: s.id,
    name: s.name,
    email: s.email,
    role: s.role,
    roleName: roleConfig?.name || s.role,
    permissions: roleConfig?.permissions || [],
  };
}

export async function destroyCustomerSession(token) {
  await sql`DELETE FROM customer_sessions WHERE token = ${token};`;
}

export async function destroyAdminSession(token) {
  await sql`DELETE FROM admin_sessions WHERE token = ${token};`;
}

export async function cleanupExpiredSessions() {
  await sql`DELETE FROM customer_sessions WHERE expires_at < CURRENT_TIMESTAMP;`;
  await sql`DELETE FROM admin_sessions WHERE expires_at < CURRENT_TIMESTAMP;`;
  await sql`DELETE FROM password_reset_tokens WHERE expires_at < CURRENT_TIMESTAMP;`;
}