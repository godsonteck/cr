import type { orders } from '../src/db/schema.js';
import { waitUntil } from '@vercel/functions';
import { escapeHtml, sendEmail } from './_email.js';

export function orderNotificationRows(order: typeof orders.$inferSelect) {
  return [
    {
      userId: order.userId || null,
      type: 'order',
      title: 'Order received',
      message: `Order #${order.orderNumber} has been received and is being prepared.`,
      actionUrl: '/account/orders',
    },
    {
      userId: null,
      type: 'order',
      title: 'New order received',
      message: `Order #${order.orderNumber} was placed and needs fulfillment review.`,
      actionUrl: '/admin?tab=orders',
    },
  ];
}

export function scheduleOrderConfirmationEmails(order: typeof orders.$inferSelect, fallbackEmail?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return;

  const customerEmail = order.shippingAddress.email?.trim().toLowerCase() || fallbackEmail;
  const storeEmail = process.env.STORE_NOTIFICATION_EMAIL || from.match(/<([^>]+)>/)?.[1];
  if (!customerEmail && !storeEmail) return;

  const orderLink = `${process.env.PUBLIC_SITE_URL || ''}/account/orders`;
  const emails = [
    customerEmail ? sendEmail({
      to: customerEmail,
      subject: `Order received: ${order.orderNumber}`,
      html: `<p>Hi ${escapeHtml(order.shippingAddress.fullName)},</p><p>Thanks for your order. We received <strong>${escapeHtml(order.orderNumber)}</strong> and are preparing it now.</p><p>You can track your order in your account.</p><p><a href="${escapeHtml(orderLink)}">View order</a></p>`,
    }) : Promise.resolve(false),
    storeEmail ? sendEmail({
      to: storeEmail,
      subject: `New order: ${order.orderNumber}`,
      html: `<p>A new order has been placed.</p><p><strong>${escapeHtml(order.orderNumber)}</strong> from ${escapeHtml(order.shippingAddress.fullName)} for GHS ${escapeHtml(order.total)}.</p>`,
    }) : Promise.resolve(false),
  ];

  try {
    waitUntil(Promise.all(emails));
  } catch (error) {
    console.error(JSON.stringify({
      event: 'order_email_schedule_failed',
      orderId: order.id,
      reference: order.paymentReference,
      message: error instanceof Error ? error.message : 'Unknown error',
    }));
  }
}