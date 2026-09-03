import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '../src/neon.js';
import { orders } from '../src/db/schema.js';

type PaystackEvent = {
  event?: string;
  data?: {
    reference?: string;
    amount?: number;
    currency?: string;
    status?: string;
  };
};

type RawBodyRequest = VercelRequest & { rawBody?: Buffer | string };

function getRawBody(req: RawBodyRequest): string {
  if (Buffer.isBuffer(req.rawBody)) return req.rawBody.toString('utf8');
  if (typeof req.rawBody === 'string') return req.rawBody;
  return typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
}

function signaturesMatch(received: string, expected: string): boolean {
  const receivedBuffer = Buffer.from(received, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  return receivedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();
  const signature = String(req.headers['x-paystack-signature'] || '');
  if (!secretKey || !signature) return res.status(401).json({ error: 'Invalid webhook signature' });

  const rawBody = getRawBody(req as RawBodyRequest);
  const expectedSignature = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');
  if (!signaturesMatch(signature, expectedSignature)) return res.status(401).json({ error: 'Invalid webhook signature' });

  let event: PaystackEvent;
  try {
    event = JSON.parse(rawBody) as PaystackEvent;
  } catch {
    return res.status(400).json({ error: 'Invalid webhook payload' });
  }

  if (event.event !== 'charge.success') return res.status(200).json({ received: true });

  const reference = event.data?.reference?.trim();
  if (!reference || event.data?.status !== 'success' || event.data.currency !== 'GHS') {
    return res.status(400).json({ error: 'Incomplete payment event' });
  }

  const [order] = await db.select().from(orders).where(eq(orders.paymentReference, reference)).limit(1);
  if (!order) return res.status(200).json({ received: true, matched: false });
  if (Number(event.data.amount) !== Math.round(Number(order.total) * 100)) {
    return res.status(400).json({ error: 'Payment amount does not match order' });
  }
  if (order.paymentStatus === 'paid') return res.status(200).json({ received: true, alreadyProcessed: true });

  await db.update(orders)
    .set({ paymentStatus: 'paid', updatedAt: new Date() })
    .where(eq(orders.id, order.id));

  return res.status(200).json({ received: true, matched: true });
}
