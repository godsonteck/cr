import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { db } from '../src/neon.js';
import { adminSessions, users } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  console.warn('JWT_SECRET is not set. Authentication endpoints will reject requests until it is configured.');
}

export type AuthSession = {
  sub: string;
  email: string;
  role: 'customer' | 'admin';
  adminRole?: string;
  adminName?: string;
  name?: string;
  iat?: number;
  exp?: number;
};

export function signToken(payload: Record<string, unknown>, expiresIn: SignOptions['expiresIn'] = '6h') {
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is missing');
  }

  return jwt.sign(payload, jwtSecret, { expiresIn });
}

export function verifyToken(token: string): AuthSession {
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is missing');
  }

  return jwt.verify(token, jwtSecret) as AuthSession;
}

function getAuthorizationToken(req: VercelRequest) {
  const auth = req.headers.authorization;
  if (typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }

  return null;
}

export async function requireAuth(req: VercelRequest, res: VercelResponse): Promise<AuthSession | null> {
  const token = getAuthorizationToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }

  try {
    const payload = verifyToken(token);
    const userId = payload.sub;

    if (!userId) {
      res.status(401).json({ error: 'Invalid token payload' });
      return null;
    }

    if (payload.role === 'customer') {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user || !user.isActive) {
        res.status(401).json({ error: 'User account is no longer active' });
        return null;
      }
    }

    if (payload.role === 'admin') {
      const [admin] = await db.select().from(adminSessions).where(eq(adminSessions.id, userId)).limit(1);
      if (!admin || !admin.isActive) {
        res.status(403).json({ error: 'Admin session is no longer valid' });
        return null;
      }
    }

    return payload;
  } catch (error) {
    console.error('Token validation failed:', error);
    res.status(401).json({ error: 'Invalid or expired session' });
    return null;
  }
}

export async function requireAdmin(req: VercelRequest, res: VercelResponse): Promise<AuthSession | null> {
  const auth = await requireAuth(req, res);
  if (!auth) {
    return null;
  }

  if (auth.role !== 'admin') {
    res.status(403).json({ error: 'Administrator access required' });
    return null;
  }

  return auth;
}
