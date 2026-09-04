import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '../src/neon.js';
import { adminSessions, users } from '../src/db/schema.js';
import { requireAuth, signToken } from './_auth.js';
import { checkRateLimit, getClientIp } from './_ratelimit.js';

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
const paystackInitializeSchema = z.object({
  amount: z.number().int().positive(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  reference: z.string().min(10).max(100),
  callbackUrl: z.string().url(),
});
function stripPassword(user: typeof users.$inferSelect) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, body } = req;

  try {
    if (method === 'POST') {
      // Rate-limit all login attempts: 10 per 15 minutes per IP
      const clientIp = getClientIp(req.headers as Record<string, string | string[] | undefined>);
      const action = typeof query.action === 'string' ? query.action : 'customer';
      const rl = checkRateLimit(`auth:${clientIp}:${action}`, 10, 15 * 60 * 1000);
      if (!rl.allowed) {
        res.setHeader('Retry-After', Math.ceil((rl.resetAt - Date.now()) / 1000).toString());
        return res.status(429).json({ error: 'Too many login attempts. Please wait 15 minutes and try again.' });
      }

      if (action === 'admin') {
        const parsed = adminLoginSchema.safeParse(body);
        if (!parsed.success) {
          return res.status(400).json({ error: 'Invalid admin credentials', details: parsed.error.flatten() });
        }

        const { email, pin } = parsed.data;

        let [admin] = await db
          .select()
          .from(adminSessions)
          .where(eq(adminSessions.email, email))
          .limit(1);

        // Bootstrap the configured first admin if production was deployed
        // before the database seed ran. Existing accounts remain authoritative.
        const initialPin = process.env.ADMIN_INITIAL_PIN?.trim();
        const initialEmail = (process.env.ADMIN_EMAIL || 'admin@crcosmetics.com').trim().toLowerCase();
        if (initialPin && email === initialEmail && pin === initialPin) {
          const initialPinHash = await bcrypt.hash(initialPin, 12);
          if (!admin) {
            [admin] = await db.insert(adminSessions).values({
              adminName: 'CR Admin',
              adminRole: 'Super Admin',
              email: initialEmail,
              pinHash: initialPinHash,
              isActive: true,
            }).onConflictDoNothing().returning();
          } else if (!await bcrypt.compare(pin, admin.pinHash)) {
            [admin] = await db.update(adminSessions)
              .set({ pinHash: initialPinHash, isActive: true })
              .where(eq(adminSessions.id, admin.id))
              .returning();
          }
        }

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
        const clientId = (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '').trim();
        if (!parsed.success || !clientId) return res.status(500).json({ error: 'Google sign-in is not configured on the server' });

        const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(parsed.data.credential)}`);
        if (!googleResponse.ok) return res.status(401).json({ error: 'Google credential could not be verified' });
        const googleUser = await googleResponse.json() as { sub?: string; email?: string; email_verified?: string | boolean; name?: string; aud?: string | string[]; iss?: string };
        const audienceMatches = Array.isArray(googleUser.aud) ? googleUser.aud.includes(clientId) : googleUser.aud === clientId;
        if (!googleUser.sub || !googleUser.email || (googleUser.email_verified !== 'true' && googleUser.email_verified !== true) || !audienceMatches || (googleUser.iss !== 'accounts.google.com' && googleUser.iss !== 'https://accounts.google.com')) {
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

      if (action === 'paystack-verify') {
        const auth = await requireAuth(req, res);
        if (!auth) return;

        const reference = typeof body?.reference === 'string' ? body.reference.trim() : '';
        const expectedAmount = typeof body?.amount === 'number' ? body.amount : 0;
        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!reference || !expectedAmount || !secretKey) {
          return res.status(400).json({ error: 'Paystack payment details are incomplete' });
        }

        const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
          headers: { Authorization: `Bearer ${secretKey}` },
        });
        const payload = await paystackResponse.json() as {
          status?: boolean;
          message?: string;
          data?: { status?: string; reference?: string; amount?: number; currency?: string; customer?: { email?: string } };
        };
        if (!paystackResponse.ok || !payload.status || payload.data?.status !== 'success' || payload.data.amount !== expectedAmount || payload.data.currency !== 'GHS') {
          return res.status(402).json({ error: payload.message || 'Payment could not be verified' });
        }
        if (payload.data.customer?.email?.toLowerCase() !== auth.email.toLowerCase()) {
          return res.status(403).json({ error: 'Payment customer does not match this account' });
        }
        return res.status(200).json({ verified: true, reference: payload.data.reference || reference });
      }

      if (action === 'paystack-initialize') {
        const auth = await requireAuth(req, res);
        if (!auth) return;
        const parsed = paystackInitializeSchema.safeParse(body);
        const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();
        if (!parsed.success || !secretKey) return res.status(500).json({ error: 'Paystack is not configured on the server' });
        if (parsed.data.email.toLowerCase() !== auth.email.toLowerCase()) return res.status(403).json({ error: 'Payment email must match the signed-in account' });

        const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: parsed.data.amount,
            email: parsed.data.email,
            reference: parsed.data.reference,
            callback_url: parsed.data.callbackUrl,
            metadata: { customer_name: parsed.data.name, user_id: auth.sub },
          }),
        });
        const payload = await paystackResponse.json() as { status?: boolean; message?: string; data?: { authorization_url?: string; reference?: string } };
        if (!paystackResponse.ok || !payload.status || !payload.data?.authorization_url) return res.status(502).json({ error: payload.message || 'Paystack checkout could not be started' });
        return res.status(200).json({ checkoutUrl: payload.data.authorization_url, reference: payload.data.reference || parsed.data.reference });
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