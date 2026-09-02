import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/neon.js';
import { promoCodes } from '../src/db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { requireAdmin } from './_auth.js';

const promoCreateSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1).max(50).toUpperCase(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive(),
  minSpend: z.number().min(0).optional(),
  freeShipping: z.boolean().default(false),
  isActive: z.boolean().default(true),
  maxUsage: z.number().int().positive().optional(),
  description: z.string().optional(),
  expiryDate: z.string().datetime().optional().nullable(),
});

function validatePromoCode(code: string, subtotal: number, promos: any[]) {
  const cleanCode = code.trim().toUpperCase();
  const matched = promos.find(p => p.code.toUpperCase() === cleanCode);

  if (!matched) {
    return { valid: false, discountAmount: 0, freeShipping: false, message: 'Invalid promo code' };
  }

  if (!matched.isActive) {
    return { valid: false, discountAmount: 0, freeShipping: false, message: 'This promo code is currently disabled.' };
  }

  if (matched.expiryDate && new Date(matched.expiryDate) < new Date()) {
    return { valid: false, discountAmount: 0, freeShipping: false, message: 'This promo code has expired.' };
  }

  if (matched.maxUsage && matched.usageCount >= matched.maxUsage) {
    return { valid: false, discountAmount: 0, freeShipping: false, message: 'This promo code has reached its usage limit.' };
  }

  if (matched.minSpend && subtotal < matched.minSpend) {
    return {
      valid: false,
      discountAmount: 0,
      freeShipping: false,
      message: `Requires minimum order of GHS ${matched.minSpend.toFixed(2)}`,
    };
  }

  let discountAmount = 0;
  if (matched.discountType === 'percentage') {
    discountAmount = (subtotal * matched.discountValue) / 100;
  } else {
    discountAmount = matched.discountValue;
  }

  return {
    valid: true,
    discountAmount,
    freeShipping: !!matched.freeShipping,
    message: `${matched.code} applied! ${matched.description || ''}`,
    promo: matched,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, body } = req;

  try {
    if (method === 'GET') {
      const { code, active, validate, subtotal } = query;
      
      if (code && typeof code === 'string') {
        const [promo] = await db.select().from(promoCodes).where(eq(promoCodes.code, code.toUpperCase())).limit(1);
        if (!promo) {
          return res.status(404).json({ error: 'Promo code not found' });
        }
        
        if (validate === 'true' && subtotal) {
          const result = validatePromoCode(code, parseFloat(subtotal as string), [promo]);
          return res.status(200).json(result);
        }
        
        return res.status(200).json(promo);
      }

      const conditions = [];
      if (active !== undefined) {
        conditions.push(eq(promoCodes.isActive, active === 'true'));
      }

      const results = conditions.length > 0
        ? await db.select().from(promoCodes).where(conditions[0]).orderBy(desc(promoCodes.createdAt))
        : await db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));

      return res.status(200).json(results);
    }

    if (method === 'POST') {
      const auth = await requireAdmin(req, res);
      if (!auth) return;

      const parsed = promoCreateSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid promo code data', details: parsed.error.flatten() });
      }

      const [newPromo] = await db.insert(promoCodes).values({
        ...parsed.data,
        id: parsed.data.id || `promo-${Date.now()}`,
        discountValue: parsed.data.discountValue.toString(),
        minSpend: parsed.data.minSpend?.toString(),
        expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
      }).returning();

      return res.status(201).json(newPromo);
    }

    if (method === 'PATCH') {
      const auth = await requireAdmin(req, res);
      if (!auth) return;

      const { id } = query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Promo code ID is required' });
      }

      const parsed = z.object({
        isActive: z.boolean().optional(),
        discountType: z.enum(['percentage', 'fixed']).optional(),
        discountValue: z.number().positive().optional(),
        minSpend: z.number().min(0).optional(),
        expiryDate: z.string().datetime().optional().nullable(),
        code: z.string().min(1).max(50).optional(),
      }).safeParse(body);

      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid promo update', details: parsed.error.flatten() });
      }

      const updateData = {
        ...parsed.data,
        discountValue: parsed.data.discountValue !== undefined ? parsed.data.discountValue.toString() : undefined,
        minSpend: parsed.data.minSpend !== undefined ? parsed.data.minSpend.toString() : undefined,
        expiryDate: parsed.data.expiryDate !== undefined ? (parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null) : undefined,
        updatedAt: new Date(),
      };

      const [updated] = await db.update(promoCodes).set(updateData).where(eq(promoCodes.id, id)).returning();
      if (!updated) {
        return res.status(404).json({ error: 'Promo code not found' });
      }
      return res.status(200).json(updated);
    }

    if (method === 'DELETE') {
      const auth = await requireAdmin(req, res);
      if (!auth) return;

      const { id } = query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Promo code ID is required' });
      }

      const [deleted] = await db.delete(promoCodes).where(eq(promoCodes.id, id)).returning({ id: promoCodes.id });
      if (!deleted) {
        return res.status(404).json({ error: 'Promo code not found' });
      }
      return res.status(200).json({ success: true, id: deleted.id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Promo Codes API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}