import type { VercelRequest, VercelResponse } from '@vercel/node';
import auth from '../server-api/auth.js';
import cart from '../server-api/cart.js';
import catalog from '../server-api/catalog.js';
import flashDeals from '../server-api/flash-deals.js';
import notifications from '../server-api/notifications.js';
import orders from '../server-api/orders.js';
import paystackWebhook from '../server-api/paystack-webhook.js';
import posShifts from '../server-api/pos-shifts.js';
import products from '../server-api/products.js';
import promoCodes from '../server-api/promo-codes.js';
import reviews from '../server-api/reviews.js';
import settings from '../server-api/settings.js';
import users from '../server-api/users.js';

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const handlers: Record<string, Handler> = {
  auth,
  cart,
  catalog,
  'flash-deals': flashDeals,
  notifications,
  orders,
  'paystack-webhook': paystackWebhook,
  'pos-shifts': posShifts,
  products,
  'promo-codes': promoCodes,
  reviews,
  settings,
  users,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const rawPath = req.query.path;
  const path = Array.isArray(rawPath) ? rawPath[0] : rawPath;
  const target = typeof path === 'string' ? handlers[path] : undefined;
  if (!target) return res.status(404).json({ error: 'API route not found' });
  return target(req, res);
}
