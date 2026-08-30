import type { VercelRequest, VercelResponse } from '@vercel/node';
import db from '../src/db';
import { promoCodes } from '../src/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

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

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Promo Codes API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}