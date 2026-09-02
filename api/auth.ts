import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '../src/db';
import { adminSessions, users } from '../src/db/schema';
import { signToken } from './_auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const adminLoginSchema = z.object({
  email: z.string().email(),
  pin: z.string().min(4),
  name: z.string().optional(),
  role: z.string().optional(),
});

const googleLoginSchema = z.object({ credential: z.string().min(20) });

function stripPassword(user: typeof users.$inferSelect) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, body } = req;

  try {
    if (method === 'POST') {
      const action = typeof query.action === 'string' ? query.action : 'customer';

      if (action === 'admin') {
        const parsed = adminLoginSchema.safeParse(body);
        if (!parsed.success) {
          return res.status(400).json({ error: 'Invalid admin credentials', details: parsed.error.flatten() });
        }

        const { email, pin } = parsed.data;

        const [admin] = await db
          .select()
          .from(adminSessions)
          .where(eq(adminSessions.email, email))
          .limit(1);

        if (!admin || !admin.isActive) {
          return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        const validPin = await bcrypt.compare(pin, admin.pinHash);
        if (!validPin) {
          return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        await db.update(adminSessions).set({ lastLoginAt: new Date() }).where(eq(adminSessions.id, admin.id));

        const token = signToken({
          sub: admin.id,
          email: admin.email,
          role: 'admin',
          adminRole: admin.adminRole,
          adminName: admin.adminName,
        });

        return res.status(200).json({
          token,
          admin: {
            id: admin.id,
            adminName: admin.adminName,
            adminRole: admin.adminRole,
            email: admin.email,
          },
        });
      }

      if (action === 'google') {
        const parsed = googleLoginSchema.safeParse(body);
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!parsed.success || !clientId) return res.status(400).json({ error: 'Google sign-in is not configured' });

        const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(parsed.data.credential)}`);
        if (!googleResponse.ok) return res.status(401).json({ error: 'Google credential could not be verified' });
        const googleUser = await googleResponse.json() as { sub?: string; email?: string; email_verified?: string; name?: string; aud?: string; iss?: string };
        if (!googleUser.sub || !googleUser.email || googleUser.email_verified !== 'true' || googleUser.aud !== clientId || (googleUser.iss !== 'accounts.google.com' && googleUser.iss !== 'https://accounts.google.com')) {
          return res.status(401).json({ error: 'Google account verification failed' });
        }

        const email = googleUser.email.toLowerCase();
        let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user) {
          [user] = await db.insert(users).values({ email, fullName: googleUser.name || email.split('@')[0], phone: '', passwordHash: null }).returning();
        } else if (!user.isActive) {
          return res.status(403).json({ error: 'This account is blocked' });
        }

        const token = signToken({ sub: user.id, email: user.email, role: 'customer', name: user.fullName });
        return res.status(200).json({ token, user: stripPassword(user) });
      }

      const parsed = loginSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid credentials', details: parsed.error.flatten() });
      }

      const { email, password } = parsed.data;
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const validPassword = user.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = signToken({
        sub: user.id,
        email: user.email,
        role: 'customer',
        name: user.fullName,
      });

      return res.status(200).json({
        token,
        user: stripPassword(user),
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