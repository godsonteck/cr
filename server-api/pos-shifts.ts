import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../src/database.js';
import { orders, posShifts } from '../src/db/schema.js';
import { requireAdmin } from './_auth.js';

const openShiftSchema = z.object({
  deviceId: z.string().trim().min(1).max(100),
  openingCash: z.coerce.number().nonnegative(),
});

const closeShiftSchema = z.object({
  shiftId: z.string().uuid(),
  actualCash: z.coerce.number().nonnegative(),
  notes: z.string().trim().max(1000).optional(),
});

function serializeShift(shift: typeof posShifts.$inferSelect) {
  return {
    ...shift,
    openingCash: Number(shift.openingCash),
    expectedCash: shift.expectedCash == null ? null : Number(shift.expectedCash),
    actualCash: shift.actualCash == null ? null : Number(shift.actualCash),
    difference: shift.difference == null ? null : Number(shift.difference),
    openedAt: shift.openedAt.toISOString(),
    closedAt: shift.closedAt?.toISOString() || null,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const auth = await requireAdmin(req, res);
    if (!auth) return;
    if (!['Super Admin', 'Store Manager', 'Cashier'].includes(auth.adminRole || '')) {
      return res.status(403).json({ error: 'Only Store Managers and Super Admins can manage POS shifts.' });
    }

    if (req.method === 'GET') {
      const deviceId = typeof req.query.deviceId === 'string' ? req.query.deviceId.trim() : '';
      if (!deviceId) return res.status(400).json({ error: 'Device ID is required.' });
      const [shift] = await db.select().from(posShifts)
        .where(and(eq(posShifts.deviceId, deviceId), eq(posShifts.status, 'OPEN')))
        .orderBy(desc(posShifts.openedAt))
        .limit(1);
      return res.status(200).json({ shift: shift ? serializeShift(shift) : null });
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    if (req.query.action === 'open') {
      const parsed = openShiftSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: 'Invalid opening cash details.' });
      const [existing] = await db.select().from(posShifts)
        .where(and(eq(posShifts.deviceId, parsed.data.deviceId), eq(posShifts.status, 'OPEN')))
        .limit(1);
      if (existing) return res.status(409).json({ error: 'This terminal already has an open shift.', shift: serializeShift(existing) });
      const [shift] = await db.insert(posShifts).values({
        deviceId: parsed.data.deviceId,
        cashierName: auth.adminName || auth.email,
        openingCash: parsed.data.openingCash.toFixed(2),
        status: 'OPEN',
      }).returning();
      return res.status(201).json({ shift: serializeShift(shift) });
    }

    if (req.query.action === 'close') {
      const parsed = closeShiftSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: 'Invalid closing cash details.' });
      const [shift] = await db.select().from(posShifts).where(eq(posShifts.id, parsed.data.shiftId)).limit(1);
      if (!shift || shift.status !== 'OPEN') return res.status(404).json({ error: 'Open shift not found.' });
      if (shift.cashierName !== (auth.adminName || auth.email)) return res.status(403).json({ error: 'Only the cashier who opened this shift can close it.' });

      const [cashSales] = await db.select({ total: sql<string>`coalesce(sum(${orders.total}), 0)` })
        .from(orders)
        .where(and(
          eq(orders.orderSource, 'pos'),
          eq(orders.paymentMethod, 'cash-on-delivery'),
          eq(orders.cashierName, shift.cashierName),
          gte(orders.createdAt, shift.openedAt),
        ));
      const expectedCash = Number(shift.openingCash) + Number(cashSales?.total || 0);
      const [closed] = await db.update(posShifts).set({
        status: 'CLOSED',
        expectedCash: expectedCash.toFixed(2),
        actualCash: parsed.data.actualCash.toFixed(2),
        difference: (parsed.data.actualCash - expectedCash).toFixed(2),
        closedAt: new Date(),
        notes: parsed.data.notes || null,
      }).where(and(eq(posShifts.id, shift.id), eq(posShifts.status, 'OPEN'))).returning();
      return res.status(200).json({ shift: serializeShift(closed) });
    }

    return res.status(400).json({ error: 'Unknown shift action.' });
  } catch (error) {
    console.error('POS shift error:', error);
    return res.status(500).json({ error: 'POS shift operation failed.' });
  }
}
