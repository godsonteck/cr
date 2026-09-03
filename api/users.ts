import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/neon.js';
import { users, orders } from '../src/db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { requireAdmin, requireAuth, signToken } from './_auth.js';

const userCreateSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1).max(100),
  phone: z.string().max(50).default(''),
  password: z.string().min(8),
});

const userProfileUpdateSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  phone: z.string().max(50).optional(),
  savedAddresses: z.array(z.object({
    id: z.string().optional(),
    fullName: z.string().min(1),
    phone: z.string().min(1),
    altPhone: z.string().optional(),
    email: z.string().email().optional(),
    city: z.string().min(1),
    area: z.string().min(1),
    landmarkOrGps: z.string().optional(),
    deliveryNotes: z.string().optional(),
    isDefault: z.boolean().optional(),
    tag: z.enum(['Home', 'Work', 'Other']).optional(),
  })).optional(),
  savedItemIds: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

function stripPassword(user: typeof users.$inferSelect) {
  const { passwordHash, ...safeUser } = user;
  return {
    ...safeUser,
    hasPassword: Boolean(passwordHash),
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, body } = req;

  try {
    if (method === 'GET') {
      const { id, email, me } = query;

      if (query.admin === 'true') {
        const auth = await requireAdmin(req, res);
        if (!auth) return;

        // Fetch all registered customers with aggregate order stats
        const allUsers = await db.select({
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          phone: users.phone,
          savedAddresses: users.savedAddresses,
          savedItemIds: users.savedItemIds,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        }).from(users).orderBy(desc(users.createdAt));

        // Fetch aggregate order metrics grouped by userId
        const orderStats = await db
          .select({
            userId: orders.userId,
            ordersCount: sql<number>`count(*)::int`,
            totalSpent: sql<number>`coalesce(sum(${orders.total}), 0)::float`,
            lastOrderDate: sql<string>`max(${orders.createdAt})`,
          })
          .from(orders)
          .groupBy(orders.userId);

        const statsMap = new Map<string, { ordersCount: number; totalSpent: number; lastOrderDate: string }>();
        orderStats.forEach((s) => {
          if (s.userId) {
            statsMap.set(s.userId, {
              ordersCount: s.ordersCount,
              totalSpent: Number(s.totalSpent) || 0,
              lastOrderDate: s.lastOrderDate,
            });
          }
        });

        const enhancedUsers = allUsers.map((u) => {
          const stats = statsMap.get(u.id) || { ordersCount: 0, totalSpent: 0, lastOrderDate: '' };
          return {
            ...u,
            ordersCount: stats.ordersCount,
            totalSpent: stats.totalSpent,
            lastOrderDate: stats.lastOrderDate,
            segment: stats.totalSpent >= 500 ? 'High Value' : stats.ordersCount > 1 ? 'Returning' : 'New',
          };
        });

        return res.status(200).json(enhancedUsers);
      }

      if (me === 'true') {
        const auth = await requireAuth(req, res);
        if (!auth) return;

        const [user] = await db.select().from(users).where(eq(users.id, auth.sub)).limit(1);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Fetch customer's orders
        const userOrders = await db
          .select()
          .from(orders)
          .where(eq(orders.userId, auth.sub))
          .orderBy(desc(orders.createdAt))
          .limit(50);

        const safe = stripPassword(user);
        return res.status(200).json({
          ...safe,
          orders: userOrders.map((o) => ({
            ...o,
            total: Number(o.total),
            subtotal: Number(o.subtotal),
            shippingFee: Number(o.shippingFee),
            discount: Number(o.discount),
            createdAt: o.createdAt ? o.createdAt.toISOString() : new Date().toISOString(),
          })),
        });
      }

      if (id && typeof id === 'string') {
        const auth = await requireAuth(req, res);
        if (!auth) return;
        if (auth.role !== 'admin' && auth.sub !== id) {
          return res.status(403).json({ error: 'You can only view your own profile' });
        }
        const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(stripPassword(user));
      }

      if (email && typeof email === 'string') {
        const auth = await requireAuth(req, res);
        if (!auth) return;
        if (auth.role !== 'admin' && auth.email.toLowerCase() !== email.toLowerCase()) {
          return res.status(403).json({ error: 'You can only view your own profile' });
        }
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(stripPassword(user));
      }

      return res.status(400).json({ error: 'User ID or email is required' });
    }

    if (method === 'PATCH') {
      const auth = await requireAuth(req, res);
      if (!auth) return;

      const targetId = typeof query.id === 'string' && query.id
        ? query.id
        : query.me === 'true'
        ? auth.sub
        : auth.sub;

      // Only admins can modify other users
      if (auth.role !== 'admin' && auth.sub !== targetId) {
        return res.status(403).json({ error: 'You are not authorized to update this profile' });
      }

      const parsed = userProfileUpdateSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid profile update data', details: parsed.error.flatten() });
      }

      const updates: Partial<typeof users.$inferInsert> = {
        updatedAt: new Date(),
      };

      if (parsed.data.fullName !== undefined) updates.fullName = parsed.data.fullName.trim();
      if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone.trim();
      if (parsed.data.savedAddresses !== undefined) updates.savedAddresses = parsed.data.savedAddresses;
      if (parsed.data.savedItemIds !== undefined) updates.savedItemIds = parsed.data.savedItemIds;

      // Only admins may toggle isActive status
      if (parsed.data.isActive !== undefined) {
        if (auth.role !== 'admin') {
          return res.status(403).json({ error: 'Only admins can modify account status' });
        }
        updates.isActive = parsed.data.isActive;
      }

      const [updated] = await db.update(users)
        .set(updates)
        .where(eq(users.id, targetId))
        .returning();

      if (!updated) return res.status(404).json({ error: 'User not found' });

      // Fetch user orders to maintain complete UserProfile structure
      const userOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, targetId))
        .orderBy(desc(orders.createdAt))
        .limit(50);

      const safe = stripPassword(updated);
      return res.status(200).json({
        ...safe,
        orders: userOrders.map((o) => ({
          ...o,
          total: Number(o.total),
          subtotal: Number(o.subtotal),
          shippingFee: Number(o.shippingFee),
          discount: Number(o.discount),
          createdAt: o.createdAt ? o.createdAt.toISOString() : new Date().toISOString(),
        })),
      });
    }

    if (method === 'POST') {
      const action = typeof query.action === 'string' ? query.action : '';

      // Action: Change or Set Password
      if (action === 'change-password') {
        const auth = await requireAuth(req, res);
        if (!auth) return;

        const parsed = changePasswordSchema.safeParse(body);
        if (!parsed.success) {
          return res.status(400).json({ error: 'Invalid password details', details: parsed.error.flatten() });
        }

        const [user] = await db.select().from(users).where(eq(users.id, auth.sub)).limit(1);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // If user already has a password, verify current password
        if (user.passwordHash) {
          if (!parsed.data.currentPassword) {
            return res.status(400).json({ error: 'Current password is required to set a new password' });
          }
          const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
          if (!valid) {
            return res.status(401).json({ error: 'The current password you entered is incorrect' });
          }
        }

        const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
        await db.update(users)
          .set({ passwordHash: newHash, updatedAt: new Date() })
          .where(eq(users.id, auth.sub));

        return res.status(200).json({ success: true, message: 'Password updated successfully' });
      }

      // Default POST: User Registration
      const parsed = userCreateSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid user registration data', details: parsed.error.flatten() });
      }

      const { password, ...userData } = parsed.data;
      const cleanEmail = userData.email.trim().toLowerCase();

      const existing = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
      if (existing[0]) {
        return res.status(409).json({ error: 'An account with this email address already exists. Please sign in.' });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const [newUser] = await db.insert(users).values({
        email: cleanEmail,
        fullName: userData.fullName.trim(),
        phone: userData.phone.trim(),
        passwordHash,
      }).returning();

      const token = signToken({
        sub: newUser.id,
        email: newUser.email,
        role: 'customer',
        name: newUser.fullName,
      });

      return res.status(201).json({
        token,
        user: {
          ...stripPassword(newUser),
          orders: [],
        },
      });
    }

    if (method === 'DELETE') {
      const auth = await requireAuth(req, res);
      if (!auth) return;

      const targetId = typeof query.id === 'string' && query.id ? query.id : auth.sub;

      if (auth.role !== 'admin' && auth.sub !== targetId) {
        return res.status(403).json({ error: 'You can only delete your own account' });
      }

      await db.delete(users).where(eq(users.id, targetId));
      return res.status(200).json({ success: true, message: 'Account deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Users API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}