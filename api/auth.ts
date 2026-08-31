import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db';
import { users, adminSessions } from '../src/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import crypto from 'crypto';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const adminLoginSchema = z.object({
  pin: z.string().min(3),
  email: z.string().email().optional(),
  name: z.string().optional(),
  role: z.string().optional(),
});

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

const MASTER_PINS = ['cr2026', '1234', 'admin', 'admin2026', process.env.ADMIN_PIN].filter(Boolean) as string[];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, body, query } = req;

  try {
    if (method === 'POST') {
      const { action } = query;

      if (action === 'admin') {
        const parsed = adminLoginSchema.safeParse(body);
        if (!parsed.success) {
          return res.status(400).json({ error: 'Please enter a valid security passcode', details: parsed.error.flatten() });
        }

        const { pin, email, name, role } = parsed.data;
        const normalizedPin = pin.trim().toLowerCase();
        const pinHash = hashPin(pin.trim());
        const sessionToken = generateSessionToken();

        // 1. Check database first if available
        try {
          const conditions = [eq(adminSessions.pinHash, pinHash), eq(adminSessions.isActive, true)];
          if (email) {
            conditions.push(eq(adminSessions.email, email));
          }

          const [admin] = await db.select().from(adminSessions).where(and(...conditions)).limit(1);
          if (admin) {
            await db
              .update(adminSessions)
              .set({ lastLoginAt: new Date() })
              .where(eq(adminSessions.id, admin.id));

            return res.status(200).json({
              token: sessionToken,
              admin: {
                id: admin.id,
                adminName: admin.adminName || name || 'CR Executive Admin',
                adminRole: admin.adminRole || role || 'Super Admin',
                email: admin.email || email || 'admin@crcosmetics.com',
              },
            });
          }
        } catch (dbErr) {
          console.warn('Database admin session query fallback:', dbErr);
        }

        // 2. Master passcodes verification
        const isMasterValid = MASTER_PINS.some(p => p.toLowerCase() === normalizedPin);
        if (isMasterValid) {
          return res.status(200).json({
            token: sessionToken,
            admin: {
              id: 'admin-master',
              adminName: name?.trim() || 'CR Executive Admin',
              adminRole: role || 'Super Admin',
              email: email?.trim() || 'admin@crcosmetics.com',
            },
          });
        }

        return res.status(401).json({ error: 'Invalid security passcode. Please check your admin credentials.' });
      }

      // Regular user login
      const parsed = loginSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid credentials', details: parsed.error.flatten() });
      }

      const { email, password } = parsed.data;
      const passwordHash = hashPassword(password);

      const [user] = await db
        .select()
        .from(users)
        .where(and(eq(users.email, email), eq(users.passwordHash, passwordHash), eq(users.isActive, true)))
        .limit(1);

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const sessionToken = generateSessionToken();
      const { passwordHash: _, ...safeUser } = user;

      return res.status(200).json({
        token: sessionToken,
        user: safeUser,
      });
    }

    if (method === 'DELETE') {
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Auth API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}