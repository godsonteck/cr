import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/neon.js';
import { users } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { requireAdmin, requireAuth, signToken } from './_auth.js';

const userCreateSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1).max(100),
  phone: z.string().max(50).default(''),
  password: z.string().min(8),
});

function stripPassword(user: typeof users.$inferSelect) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, body } = req;

  try {
    if (method === 'GET') {
      const { id, email, me } = query;

      if (query.admin === 'true') {
        const auth = await requireAdmin(req, res);
        if (!auth) return;

        const allUsers = await db.select({
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          phone: users.phone,
          savedAddresses: users.savedAddresses,
          savedItemIds: users.savedItemIds,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        }).from(users);
        return res.status(200).json(allUsers);
      }

      if (me === 'true') {
        const auth = await requireAuth(req, res);
        if (!auth) {
          return;
        }

        const [user] = await db.select().from(users).where(eq(users.id, auth.sub)).limit(1);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(stripPassword(user));
      }

      if (id && typeof id === 'string') {
        const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(stripPassword(user));
      }

      if (email && typeof email === 'string') {
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(stripPassword(user));
      }

      return res.status(400).json({ error: 'User ID or email is required' });
    }

    if (method === 'PATCH') {
      const auth = await requireAdmin(req, res);
      if (!auth) return;

      const id = typeof query.id === 'string' ? query.id : '';
      if (!id) return res.status(400).json({ error: 'User ID is required' });

      const parsed = z.object({ isActive: z.boolean() }).safeParse(body);
      if (!parsed.success) return res.status(400).json({ error: 'Invalid user update' });

      const [updated] = await db.update(users)
        .set({ isActive: parsed.data.isActive, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      if (!updated) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json(stripPassword(updated));
    }

    if (method === 'POST') {
      const parsed = userCreateSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid user data', details: parsed.error.flatten() });
      }

      const { password, ...userData } = parsed.data;

      const existing = await db.select().from(users).where(eq(users.email, userData.email)).limit(1);
      if (existing[0]) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const [newUser] = await db.insert(users).values({
        ...userData,
        passwordHash,
      }).returning();

      const token = signToken({ sub: newUser.id, email: newUser.email, role: 'customer', name: newUser.fullName });
      return res.status(201).json({
        token,
        user: stripPassword(newUser),
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Users API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}