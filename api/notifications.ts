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

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Notifications API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}