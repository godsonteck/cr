import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { and, eq } from 'drizzle-orm';
import { db } from '../src/database.js';
import { orders, notifications } from '../src/db/schema.js';
import { orderNotificationRows } from './_order-notifications.js';
import { getPaystackSecretKey } from './_paystack.js';

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

async function getRawBody(req: RawBodyRequest): Promise<string | null> {
  if (Buffer.isBuffer(req.rawBody)) return req.rawBody.toString('utf8');
  if (typeof req.rawBody === 'string') return req.rawBody;
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  if (chunks.length > 0) return Buffer.concat(chunks).toString('utf8');
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  return typeof req.body === 'string' ? req.body : null;
}

function signaturesMatch(received: string, expected: string): boolean {
  const receivedBuffer = Buffer.from(received, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  return receivedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secretKey = getPaystackSecretKey();
  const signature = String(req.headers['x-paystack-signature'] || '');
  if (!secretKey || !signature) return res.status(401).json({ error: 'Invalid webhook signature' });

  const rawBody = await getRawBody(req as RawBodyRequest);
  if (rawBody === null) return res.status(400).json({ error: 'Raw webhook body is unavailable.' });
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

  // Verify the amount before touching payment status
  const [order] = await db
    .select({ id: orders.id, total: orders.total })
    .from(orders)
    .where(eq(orders.paymentReference, reference))
    .limit(1);
  if (!order) return res.status(500).json({ error: 'Order is not available for this payment reference yet.' });
  if (Number(event.data.amount) !== Math.round(Number(order.total) * 100)) {
    return res.status(400).json({ error: 'Payment amount does not match order' });
  }

  // Atomic conditional update: only marks paid if still pending.
  // Two simultaneous webhook deliveries cannot both succeed — whichever
  // arrives second finds paymentStatus already 'paid' and returns early.
  const result = await db.transaction(async tx => {
    const updated = await tx
      .update(orders)
      .set({ paymentStatus: 'paid', updatedAt: new Date() })
      .where(and(
        eq(orders.paymentReference, reference),
        eq(orders.paymentStatus, 'pending'),
      ))
      .returning();
    if (updated[0]) await tx.insert(notifications).values(orderNotificationRows(updated[0]));
    return updated;
  });

  if (!result.length) {
    return res.status(200).json({ received: true, alreadyProcessed: true });
  }

  return res.status(200).json({ received: true, matched: true });
}
