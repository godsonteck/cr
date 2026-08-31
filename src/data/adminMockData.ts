import { Customer, InventoryMovement, AuditLog, AdminNotification, AdminUser } from '../types';

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-01',
    fullName: 'Akosua Afriyie Mensah',
    email: 'akosua.mensah@gmail.com',
    phone: '+233 24 456 7890',
    ordersCount: 8,
    totalSpent: 3420.00,
    lastOrderDate: '2026-08-30T14:20:00Z',
    segment: 'High Value',
    status: 'Active',
    addresses: [
      {
        fullName: 'Akosua Afriyie Mensah',
        phone: '+233 24 456 7890',
        city: 'Accra',
        area: 'Airport Residential Area',
        landmarkOrGps: 'Near Nyaho Medical Centre',
      }
    ],
    notes: 'Prefers Korean skincare lines (COSRX, Anua) and evening express courier deliveries.',
    createdAt: '2026-03-12T10:00:00Z',
  },
  {
    id: 'cust-02',
    fullName: 'Kwame Osei Tutu',
    email: 'k.osei@ghanacommerce.gh',
    phone: '+233 50 123 9876',
    ordersCount: 4,
    totalSpent: 1890.00,
    lastOrderDate: '2026-08-29T18:45:00Z',
    segment: 'Returning',
    status: 'Active',
    addresses: [
      {
        fullName: 'Kwame Osei Tutu',
        phone: '+233 50 123 9876',
        city: 'Accra',
        area: 'East Legon',
        landmarkOrGps: 'Opposite Delish Restaurant, Lagos Avenue',
      }
    ],
    notes: 'Regular designer fragrance and household pantry buyer.',
    createdAt: '2026-04-05T12:30:00Z',
  },
  {
    id: 'cust-03',
    fullName: 'Eunice Baaba Andoh',
    email: 'eunice.andoh@yahoo.com',
    phone: '+233 20 876 5432',
    ordersCount: 1,
    totalSpent: 420.00,
    lastOrderDate: '2026-08-31T06:15:00Z',
    segment: 'New',
    status: 'Active',
    addresses: [
      {
        fullName: 'Eunice Baaba Andoh',
        phone: '+233 20 876 5432',
        city: 'Tema',
        area: 'Community 6',
        landmarkOrGps: 'Near Total Filling Station',
      }
    ],
    notes: 'First order placed via WhatsApp referral link.',
    createdAt: '2026-08-31T06:00:00Z',
  },
  {
    id: 'cust-04',
    fullName: 'Dr. Nana Yaa Boateng',
    email: 'ny.boateng@korlebu.edu.gh',
    phone: '+233 55 987 1122',
    ordersCount: 12,
    totalSpent: 6250.00,
    lastOrderDate: '2026-08-28T11:00:00Z',
    segment: 'High Value',
    status: 'Active',
    addresses: [
      {
        fullName: 'Dr. Nana Yaa Boateng',
        phone: '+233 55 987 1122',
        city: 'Accra',
        area: 'Cantonments',
        landmarkOrGps: 'Embassy Gardens Complex',
      }
    ],
    notes: 'VIP client. Enjoys luxury anti-aging formulas and gourmet grocery gift packages.',
    createdAt: '2026-01-18T08:00:00Z',
  },
  {
    id: 'cust-05',
    fullName: 'Kofi Senanu Agbessi',
    email: 'kofi.agbessi@outlook.com',
    phone: '+233 27 345 6789',
    ordersCount: 2,
    totalSpent: 680.00,
    lastOrderDate: '2026-06-14T09:30:00Z',
    segment: 'Inactive',
    status: 'Active',
    addresses: [
      {
        fullName: 'Kofi Senanu Agbessi',
        phone: '+233 27 345 6789',
        city: 'Kumasi',
        area: 'Ahodwo',
        landmarkOrGps: 'Near Royal Golf Club',
      }
    ],
    notes: 'Intercity delivery customer to Kumasi.',
    createdAt: '2026-05-20T14:15:00Z',
  }
];

export const INITIAL_INVENTORY_MOVEMENTS: InventoryMovement[] = [
  {
    id: 'mov-101',
    productId: 'prod-01',
    productName: 'The Ordinary Niacinamide 10% + Zinc 1%',
    productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    previousQuantity: 12,
    adjustment: 50,
    newQuantity: 62,
    reason: 'Stock received',
    actor: 'Emmanuel Drah (Super Admin)',
    timestamp: '2026-08-30T16:00:00Z',
    notes: 'New verified batch shipment received from UK supplier.',
  },
  {
    id: 'mov-102',
    productId: 'prod-02',
    productName: 'CeraVe Moisturizing Cream for Dry Skin',
    productImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    previousQuantity: 28,
    adjustment: -2,
    newQuantity: 26,
    reason: 'Sale',
    actor: 'Online Storefront Checkout',
    timestamp: '2026-08-31T05:30:00Z',
    notes: 'Fulfilled in Order #CR-9482',
  },
  {
    id: 'mov-103',
    productId: 'prod-03',
    productName: 'COSRX Advanced Snail 96 Mucin Power Essence',
    productImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80',
    previousQuantity: 6,
    adjustment: -1,
    newQuantity: 5,
    reason: 'Damaged',
    actor: 'Store Logistics Desk',
    timestamp: '2026-08-29T11:20:00Z',
    notes: 'Bottle seal fractured during internal fulfillment transfer.',
  },
  {
    id: 'mov-104',
    productId: 'prod-06',
    productName: 'Royal Aroma Fragrant Jasmine Rice (5kg)',
    productImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    previousQuantity: 40,
    adjustment: 20,
    newQuantity: 60,
    reason: 'Stock received',
    actor: 'Inventory Manager',
    timestamp: '2026-08-28T09:00:00Z',
    notes: 'Restocked from local warehouse distribution in Spintex.',
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-01',
    actor: 'Emmanuel Drah',
    action: 'PRICE_UPDATE',
    entity: 'Product: COSRX Snail Mucin 96',
    entityId: 'prod-03',
    timestamp: '2026-08-31T07:15:00Z',
    details: 'Price updated from GHS 180.00 to GHS 165.00 for End-of-Month Promo.',
  },
  {
    id: 'aud-02',
    actor: 'Store Concierge',
    action: 'ORDER_DISPATCHED',
    entity: 'Order #CR-9482',
    entityId: 'ord-9482',
    timestamp: '2026-08-31T06:40:00Z',
    details: 'Courier Kwame Boateng assigned with express motorbike dispatch to Airport Residential.',
  },
  {
    id: 'aud-03',
    actor: 'Emmanuel Drah',
    action: 'VOUCHER_CREATED',
    entity: 'Coupon: GLOW2026',
    entityId: 'promo-glow',
    timestamp: '2026-08-30T19:22:00Z',
    details: 'Created 15% discount voucher with GHS 200 minimum spend limit.',
  },
  {
    id: 'aud-04',
    actor: 'System Security',
    action: 'ADMIN_AUTHENTICATED',
    entity: 'Session: Super Admin Gateway',
    timestamp: '2026-08-30T18:05:00Z',
    details: 'Successful 256-bit encrypted authentication from verified device in Accra.',
  }
];

export const INITIAL_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'notif-01',
    type: 'inventory',
    title: 'Low Stock Alert',
    message: 'COSRX Snail 96 Mucin Essence is down to 5 units. Reorder recommended.',
    timestamp: '15 mins ago',
    read: false,
    actionUrl: '/admin?tab=inventory'
  },
  {
    id: 'notif-02',
    type: 'order',
    title: 'New Paid MoMo Order',
    message: 'Order #CR-9485 from Akosua Mensah (GHS 640.00) is ready for packing.',
    timestamp: '42 mins ago',
    read: false,
    actionUrl: '/admin?tab=orders'
  },
  {
    id: 'notif-03',
    type: 'customer',
    title: 'High-Value Customer Activity',
    message: 'Dr. Nana Yaa Boateng placed her 12th repeat order.',
    timestamp: '2 hours ago',
    read: true,
    actionUrl: '/admin?tab=customers'
  },
  {
    id: 'notif-04',
    type: 'system',
    title: 'Daily Auto-Backup Verified',
    message: 'Neon PostgreSQL store catalog and orders database verified intact.',
    timestamp: '5 hours ago',
    read: true,
    actionUrl: '/admin?tab=settings'
  }
];

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'adm-01',
    name: 'Emmanuel Drah',
    email: 'emmanueldrah@gmail.com',
    role: 'Super Admin',
    isActive: true,
    lastLoginAt: '2026-08-31T07:45:00Z',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'adm-02',
    name: 'Abena Serwaa',
    email: 'abena.serwaa@crcosmetics.com',
    role: 'Store Manager',
    isActive: true,
    lastLoginAt: '2026-08-30T16:20:00Z',
    createdAt: '2026-02-15T09:00:00Z',
  },
  {
    id: 'adm-03',
    name: 'Kwame Boateng',
    email: 'dispatch@crcosmetics.com',
    role: 'Inventory Dispatcher',
    isActive: true,
    lastLoginAt: '2026-08-31T06:00:00Z',
    createdAt: '2026-03-01T08:00:00Z',
  }
];

export const ANALYTICS_DATA = {
  today: {
    revenue: 4850.00,
    orders: 14,
    avgOrderValue: 346.42,
    customersCount: 14,
    revenueGrowth: '+18.4% vs yesterday',
    hourly: [
      { time: '08:00', revenue: 420, orders: 1 },
      { time: '10:00', revenue: 890, orders: 3 },
      { time: '12:00', revenue: 1450, orders: 4 },
      { time: '14:00', revenue: 2100, orders: 6 },
      { time: '16:00', revenue: 3400, orders: 10 },
      { time: '18:00', revenue: 4850, orders: 14 }
    ]
  },
  sevenDays: {
    revenue: 32450.00,
    orders: 98,
    avgOrderValue: 331.12,
    customersCount: 86,
    revenueGrowth: '+12.8% vs prior 7 days',
    daily: [
      { date: 'Aug 25', revenue: 4100, orders: 12 },
      { date: 'Aug 26', revenue: 4800, orders: 15 },
      { date: 'Aug 27', revenue: 3950, orders: 11 },
      { date: 'Aug 28', revenue: 5600, orders: 18 },
      { date: 'Aug 29', revenue: 4200, orders: 13 },
      { date: 'Aug 30', revenue: 4950, orders: 15 },
      { date: 'Aug 31', revenue: 4850, orders: 14 }
    ]
  },
  thirtyDays: {
    revenue: 128400.00,
    orders: 395,
    avgOrderValue: 325.06,
    customersCount: 310,
    revenueGrowth: '+24.6% vs prior month',
    weekly: [
      { label: 'Week 1', revenue: 29500, orders: 92 },
      { label: 'Week 2', revenue: 31200, orders: 96 },
      { label: 'Week 3', revenue: 35250, orders: 109 },
      { label: 'Week 4', revenue: 32450, orders: 98 }
    ]
  },
  categorySplit: [
    { name: 'Skincare (Serums & Creams)', percentage: 46, revenue: 59064.00 },
    { name: 'Designer Fragrances', percentage: 24, revenue: 30816.00 },
    { name: 'Makeup & Beauty Tools', percentage: 16, revenue: 20544.00 },
    { name: 'Groceries & Household Pantry', percentage: 14, revenue: 17976.00 }
  ]
};
