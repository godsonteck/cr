import type { VercelRequest, VercelResponse } from '@vercel/node';
import db from '../src/db.ts';
import { users } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import crypto from 'crypto';

const userCreateSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1).max(100),
  phone: z.string().min(1).max(50),
  password: z.string().min(8).optional(),
});

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, body } = req;

  try {
    if (method === 'GET') {
      const { id, email } = query;
      
      if (id && typeof id === 'string') {
        const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        const { passwordHash, ...safeUser } = user;
        return res.status(200).json(safeUser);
      }

      if (email && typeof email === 'string') {
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        const { passwordHash, ...safeUser } = user;
        return res.status(200).json(safeUser);
      }

      return res.status(400).json({ error: 'User ID or email is required' });
    }

    if (method === 'POST') {
      const parsed = userCreateSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid user data', details: parsed.error.flatten() });
      }

      const { password, ...userData } = parsed.data;
      const [newUser] = await db.insert(users).values({
        ...userData,
        passwordHash: password ? hashPassword(password) : null,
      }).returning();

      const { passwordHash, ...safeUser } = newUser;
      return res.status(201).json(safeUser);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Users API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}