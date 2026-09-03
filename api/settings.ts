import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/neon.js';
import { storeSettings } from '../src/db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { requireAdmin } from './_auth.js';

const settingUpdateSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.any(),
});

const toJsonbValue = (value: unknown) => value === null ? sql`'null'::jsonb` : value;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, body } = req;

  try {
    if (method === 'GET') {
      const { key } = query;
      
      if (key && typeof key === 'string') {
        const [setting] = await db.select().from(storeSettings).where(eq(storeSettings.key, key)).limit(1);
        if (!setting) {
          return res.status(404).json({ error: 'Setting not found' });
        }
        return res.status(200).json({ key: setting.key, value: setting.value });
      }

      const results = await db.select().from(storeSettings);
      return res.status(200).json(results);
    }

    if (method === 'POST') {
      const auth = await requireAdmin(req, res);
      if (!auth) return;

      const parsed = settingUpdateSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid setting data', details: parsed.error.flatten() });
      }

      const [newSetting] = await db.insert(storeSettings).values({
        key: parsed.data.key,
        value: toJsonbValue(parsed.data.value),
      }).onConflictDoUpdate({
        target: storeSettings.key,
        set: { value: toJsonbValue(parsed.data.value), updatedAt: new Date() },
      }).returning();

      return res.status(201).json(newSetting);
    }

    if (method === 'PATCH') {
      const auth = await requireAdmin(req, res);
      if (!auth) return;

      const { key } = query;
      if (!key || typeof key !== 'string') {
        return res.status(400).json({ error: 'Setting key is required' });
      }

      const parsed = z.object({ value: z.any() }).safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid value', details: parsed.error.flatten() });
      }

      const [updated] = await db
        .update(storeSettings)
        .set({ value: toJsonbValue(parsed.data.value), updatedAt: new Date() })
        .where(eq(storeSettings.key, key))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: 'Setting not found' });
      }
      return res.status(200).json(updated);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Store Settings API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}