import type { orders } from '../src/db/schema.js';

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