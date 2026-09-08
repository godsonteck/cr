import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/neon.js';
import { notifications } from '../src/db/schema.js';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { requireAuth } from './_auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await requireAuth(req, res);
  if (!auth) return;

  try {
    if (req.method === 'GET') {
      const owner = auth.role === 'admin' ? isNull(notifications.userId) : eq(notifications.userId, auth.sub);
      const rows = await db.select().from(notifications).where(owner).orderBy(desc(notifications.createdAt)).limit(100);
      return res.status(200).json({ notifications: rows.map(row => ({
        id: row.id,
        type: row.type,
        title: row.title,
        message: row.message,
        actionUrl: row.actionUrl,
        timestamp: row.createdAt,
        read: row.isRead,
      })) });
    }

    if (req.method === 'PATCH') {
      const id = typeof req.query.id === 'string' ? req.query.id : undefined;
      if (id) {
        await db.update(notifications).set({ isRead: true }).where(and(eq(notifications.id, id), auth.role === 'admin' ? isNull(notifications.userId) : eq(notifications.userId, auth.sub)));
      } else {
        await db.update(notifications).set({ isRead: true }).where(auth.role === 'admin' ? isNull(notifications.userId) : eq(notifications.userId, auth.sub));
      }
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const id = typeof req.query.id === 'string' ? req.query.id : undefined;
      const readOnly = req.query.read === 'true';
      const all = req.query.all === 'true';
      const owner = auth.role === 'admin' ? isNull(notifications.userId) : eq(notifications.userId, auth.sub);

      if (id) {
        await db.delete(notifications).where(and(eq(notifications.id, id), owner));
      } else if (readOnly) {
        await db.delete(notifications).where(and(eq(notifications.isRead, true), owner));
      } else if (all) {
        await db.delete(notifications).where(owner);
      } else {
        return res.status(400).json({ error: 'Missing deletion parameter' });
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Notifications API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}