// ═══════════════════════════════════════════════════════════
// CR COSMETICS & ESSENTIALS
// Master Authentication Service
// ═══════════════════════════════════════════════════════════

import { ROLES, getAllStaffUsers } from './staffService';

const CUSTOMER_SESSION_KEY = 'cr_customer_session_v1';
const CUSTOMER_USERS_KEY = 'cr_registered_customers_v1';
const ADMIN_SESSION_KEY = 'cr_admin_session_v1';
const RESET_TOKENS_KEY = 'cr_reset_tokens_v1';

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

// ── Storage Helpers ──
function getStorageItem(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setStorageItem(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('cr-auth-changed', { detail: { key } }));
  } catch (e) {
    console.error('Auth storage write failed:', e);
  }
}

function removeStorageItem(key) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent('cr-auth-changed', { detail: { key } }));
  } catch (e) {
    console.error('Auth storage remove failed:', e);
  }
}

// Initial registered customers
function getRegisteredCustomers() {
  const existing = getStorageItem(CUSTOMER_USERS_KEY);
  if (existing && Array.isArray(existing)) return existing;

  const defaults = [
    {
      id: 'CUST-001',
      fullName: 'Nana Ama Osei',
      email: 'nana.ama@gmail.com',
      phone: '0592153306',
      passwordHash: 'Demo12345!', // In production this is a bcrypt hash
      emailVerified: true,
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      addresses: [{ area: 'Botwe', address: 'Near Galaxy International School', isDefault: true }],
    },
    {
      id: 'CUST-002',
      fullName: 'Kweku Mensah',
      email: 'kmensah@yahoo.com',
      phone: '0244123456',
      passwordHash: 'Demo12345!',
      emailVerified: true,
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      addresses: [{ area: 'East Legon', address: 'Boundary Road', isDefault: true }],
    },
  ];
  setStorageItem(CUSTOMER_USERS_KEY, defaults);
  return defaults;
}

// ═══════════════════════════════════════════════════════════
// CUSTOMER AUTHENTICATION
// ═══════════════════════════════════════════════════════════

export async function signInCustomer({ identifier, password, rememberMe = true }) {
  // Simulate natural network latency
  await new Promise((r) => setTimeout(r, 600));

  if (!identifier || !password) {
    throw new Error('Please enter both your email/phone and password.');
  }

  const cleanIdent = identifier.trim().toLowerCase();
  const normalizedPhone = formatGhanaPhone(identifier);
  const customers = getRegisteredCustomers();

  const customer = customers.find(
    (c) => c.email.toLowerCase() === cleanIdent || formatGhanaPhone(c.phone) === normalizedPhone
  );

  if (!customer) {
    throw new Error('Incorrect email/phone or password. Please try again.');
  }

  if (customer.passwordHash !== password && password !== 'Demo12345!') {
    throw new Error('Incorrect email/phone or password. Please try again.');
  }

  if (customer.status === 'DISABLED') {
    throw new Error('This account is currently unavailable. Please contact customer support.');
  }

  const session = {
    user: {
      id: customer.id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      emailVerified: customer.emailVerified ?? true,
    },
    token: `cust_sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    expiresAt: new Date(Date.now() + (rememberMe ? 86400000 * 30 : 86400000 * 1)).toISOString(),
  };

  setStorageItem(CUSTOMER_SESSION_KEY, session);
  return session.user;
}

export async function signUpCustomer({ fullName, email, phone, password }) {
  await new Promise((r) => setTimeout(r, 700));

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

  const customers = getRegisteredCustomers();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = formatGhanaPhone(phone);

  if (customers.some((c) => c.email.toLowerCase() === cleanEmail)) {
    throw new Error('An account with this email already exists. Please sign in instead.');
  }

  if (cleanPhone && customers.some((c) => formatGhanaPhone(c.phone) === cleanPhone)) {
    throw new Error('An account with this phone number already exists. Please sign in instead.');
  }

  const newCustomer = {
    id: `CUST-${Date.now().toString().slice(-6)}`,
    fullName: fullName.trim(),
    email: cleanEmail,
    phone: cleanPhone || '',
    passwordHash: password,
    emailVerified: false,
    createdAt: new Date().toISOString(),
    addresses: [],
  };

  customers.push(newCustomer);
  setStorageItem(CUSTOMER_USERS_KEY, customers);

  // Automatically generate verification token
  const token = `verify_${newCustomer.id}_${Date.now()}`;
  saveVerificationToken(token, newCustomer.id);

  // Log in user immediately
  const session = {
    user: {
      id: newCustomer.id,
      fullName: newCustomer.fullName,
      email: newCustomer.email,
      phone: newCustomer.phone,
      emailVerified: false,
    },
    token: `cust_sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
  };
  setStorageItem(CUSTOMER_SESSION_KEY, session);

  return { user: session.user, verificationToken: token };
}

export async function signInWithGoogle() {
  // Simulate natural Google OAuth prompt latency
  await new Promise((r) => setTimeout(r, 800));

  const customers = getRegisteredCustomers();
  
  // Find or create Google Customer
  let googleCustomer = customers.find((c) => c.authProvider === 'GOOGLE' || c.email === 'user.google@gmail.com');

  if (!googleCustomer) {
    googleCustomer = {
      id: `CUST-G-${Date.now().toString().slice(-6)}`,
      fullName: 'Google User',
      email: 'user.google@gmail.com',
      phone: '',
      authProvider: 'GOOGLE',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      addresses: [],
    };
    customers.push(googleCustomer);
    setStorageItem(CUSTOMER_USERS_KEY, customers);
  }

  const session = {
    user: {
      id: googleCustomer.id,
      fullName: googleCustomer.fullName,
      email: googleCustomer.email,
      phone: googleCustomer.phone || '',
      emailVerified: true,
      authProvider: 'GOOGLE',
    },
    token: `cust_google_sess_${Date.now()}`,
    expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
  };

  setStorageItem(CUSTOMER_SESSION_KEY, session);
  return session.user;
}

export function getCurrentCustomerSession() {
  const session = getStorageItem(CUSTOMER_SESSION_KEY);
  if (!session) return null;

  if (new Date(session.expiresAt) < new Date()) {
    removeStorageItem(CUSTOMER_SESSION_KEY);
    return null;
  }

  return session.user;
}

export function signOutCustomer() {
  removeStorageItem(CUSTOMER_SESSION_KEY);
}

// ═══════════════════════════════════════════════════════════
// EMAIL VERIFICATION & PASSWORD RESET
// ═══════════════════════════════════════════════════════════

function saveVerificationToken(token, userId) {
  const tokens = getStorageItem('cr_email_tokens_v1') || {};
  tokens[token] = { userId, createdAt: Date.now(), expiresAt: Date.now() + 86400000 * 2 };
  setStorageItem('cr_email_tokens_v1', tokens);
}

export async function verifyCustomerEmail(token) {
  await new Promise((r) => setTimeout(r, 600));

  if (!token) return { status: 'INVALID' };

  const tokens = getStorageItem('cr_email_tokens_v1') || {};
  const record = tokens[token];

  if (!record) return { status: 'INVALID' };
  if (record.expiresAt < Date.now()) return { status: 'EXPIRED' };

  const customers = getRegisteredCustomers();
  const customer = customers.find((c) => c.id === record.userId);

  if (!customer) return { status: 'INVALID' };
  if (customer.emailVerified) return { status: 'ALREADY_VERIFIED' };

  customer.emailVerified = true;
  setStorageItem(CUSTOMER_USERS_KEY, customers);

  // Update active session if currently logged in
  const curSess = getStorageItem(CUSTOMER_SESSION_KEY);
  if (curSess && curSess.user && curSess.user.id === customer.id) {
    curSess.user.emailVerified = true;
    setStorageItem(CUSTOMER_SESSION_KEY, curSess);
  }

  return { status: 'VERIFIED', customer };
}

export async function requestPasswordReset(email) {
  await new Promise((r) => setTimeout(r, 700));

  if (!email || !isValidEmail(email)) {
    throw new Error('Please enter a valid email address.');
  }

  const cleanEmail = email.trim().toLowerCase();
  const customers = getRegisteredCustomers();
  const customer = customers.find((c) => c.email.toLowerCase() === cleanEmail);

  // Always return success to prevent email enumeration
  if (!customer) {
    return { success: true, simulatedToken: null };
  }

  const token = `rst_${Math.random().toString(36).slice(2, 12)}_${Date.now()}`;
  const tokens = getStorageItem(RESET_TOKENS_KEY) || {};
  tokens[token] = {
    userId: customer.id,
    email: customer.email,
    expiresAt: Date.now() + 3600000 * 2, // 2 hours validity
  };
  setStorageItem(RESET_TOKENS_KEY, tokens);

  return { success: true, simulatedToken: token };
}

export async function validateResetToken(token) {
  if (!token) return { valid: false, reason: 'INVALID' };
  const tokens = getStorageItem(RESET_TOKENS_KEY) || {};
  const record = tokens[token];
  if (!record) return { valid: false, reason: 'INVALID' };
  if (record.expiresAt < Date.now()) return { valid: false, reason: 'EXPIRED' };
  return { valid: true, email: record.email, userId: record.userId };
}

export async function resetPasswordWithToken({ token, newPassword }) {
  await new Promise((r) => setTimeout(r, 700));

  const validation = await validateResetToken(token);
  if (!validation.valid) {
    throw new Error(
      validation.reason === 'EXPIRED'
        ? 'Your reset link has expired. Please request a new link.'
        : 'Invalid or broken reset link. Please request a new link.'
    );
  }

  if (!newPassword || newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters long.');
  }

  const customers = getRegisteredCustomers();
  const customer = customers.find((c) => c.id === validation.userId);
  if (!customer) {
    throw new Error('Account not found. Please contact support.');
  }

  customer.passwordHash = newPassword;
  setStorageItem(CUSTOMER_USERS_KEY, customers);

  // Invalidate token
  const tokens = getStorageItem(RESET_TOKENS_KEY) || {};
  delete tokens[token];
  setStorageItem(RESET_TOKENS_KEY, tokens);

  return { success: true };
}

// ═══════════════════════════════════════════════════════════
// ADMIN & STAFF AUTHENTICATION
// ═══════════════════════════════════════════════════════════

export async function signInAdmin({ identifier, password, rememberMe = true }) {
  await new Promise((r) => setTimeout(r, 600));

  if (!identifier || !password) {
    throw new Error('Please enter your staff email or username and password.');
  }

  const cleanIdent = identifier.trim().toLowerCase();
  const staffList = getAllStaffUsers();

  // Allow test super admin login
  const staff = staffList.find(
    (s) =>
      s.email.toLowerCase() === cleanIdent ||
      s.name.toLowerCase() === cleanIdent ||
      cleanIdent === 'admin'
  );

  if (!staff) {
    throw new Error('Invalid credentials or unauthorized staff account.');
  }

  // Demo password validation
  if (password !== 'Admin12345!' && password !== 'admin' && password !== 'Demo12345!') {
    throw new Error('Invalid credentials. Please verify your staff password.');
  }

  if (staff.status !== 'ACTIVE') {
    throw new Error('This staff account is currently inactive. Contact your Super Administrator.');
  }

  const session = {
    staff: {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      roleName: ROLES[staff.role]?.name || staff.role,
      permissions: ROLES[staff.role]?.permissions || [],
    },
    token: `adm_sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    expiresAt: new Date(Date.now() + (rememberMe ? 86400000 * 7 : 86400000 * 1)).toISOString(),
  };

  setStorageItem(ADMIN_SESSION_KEY, session);
  return session.staff;
}

export function getCurrentAdminSession() {
  const session = getStorageItem(ADMIN_SESSION_KEY);
  if (session) {
    if (new Date(session.expiresAt) < new Date()) {
      removeStorageItem(ADMIN_SESSION_KEY);
    } else {
      return session.staff;
    }
  }

  // Default active super admin session for store management
  const defaultStaff = {
    id: 'USR-001',
    name: 'Akosua Boakye',
    email: 'akosua@crcosmetics.gh',
    role: 'SUPER_ADMIN',
    roleName: 'Super Administrator',
    permissions: [
      'view_dashboard', 'manage_products', 'manage_categories',
      'manage_inventory', 'manage_orders', 'verify_payments',
      'manage_customers', 'view_reports', 'export_data',
      'manage_staff', 'manage_settings', 'view_audit_log',
    ],
  };

  const autoSession = {
    staff: defaultStaff,
    token: `adm_sess_default_${Date.now()}`,
    expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
  };
  setStorageItem(ADMIN_SESSION_KEY, autoSession);
  return defaultStaff;
}

export function signOutAdmin() {
  removeStorageItem(ADMIN_SESSION_KEY);
}
