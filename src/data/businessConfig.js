// ═══════════════════════════════════════════════════════════
// CR COSMETICS & ESSENTIALS
// Configurable Business Rules Engine
// Master Directive Section 01, 25, 29, 30, 37, 51
// ═══════════════════════════════════════════════════════════

export const BUSINESS_CONFIG = {
  // ─── Basic Information ───
  identity: {
    name: 'CR Cosmetics & Essentials',
    shortName: 'CR',
    category: 'Retail (Skincare & Groceries)',
    location: 'Botwe, near Galaxy International School, Accra, Ghana',
    currency: 'GHS',
    currencySymbol: '₵',
    primaryContactPhone: '0592153306',
    whatsappContact: '233592153306',
    email: 'crcosmetics.essential@gmail.com',
  },

  // ─── Inventory Rules ───
  inventory: {
    defaultLowStockThreshold: 10,
    criticalLowStockThreshold: 3,
    reservationTimeoutMinutes: 20, // Time stock is held during checkout attempt
    showOutOfStockInCatalog: true, // Allow discovery while showing Out of Stock badge
    allowBackorders: false,        // Strict prevention of overselling
  },

  // ─── Order State Rules ───
  orderLifecycle: {
    validStatuses: [
      'PENDING',      // Order created, awaiting payment confirmation / review
      'CONFIRMED',    // Payment verified or COD approved, stock committed
      'PROCESSING',   // Order being picked and packed by store team
      'READY',        // Packaged and staged for pickup or rider pickup
      'DISPATCHED',   // En route with delivery rider
      'DELIVERED',    // Handed over at destination
      'COMPLETED',    // Full delivery verified, transaction finalised
      'CANCELLED',    // Cancelled prior to completion
      'REFUNDED',     // Refund issued through authorised channel
    ],
    // States where a customer or staff may still cancel
    cancellableStatuses: ['PENDING', 'CONFIRMED'],
    // States where inventory is actively deducted from available
    stockCommittedStatuses: ['CONFIRMED', 'PROCESSING', 'READY', 'DISPATCHED', 'DELIVERED', 'COMPLETED'],
  },

  // ─── Payment Configuration & Abstractions ───
  payment: {
    validStatuses: [
      'PENDING',
      'AUTHORIZED',
      'PAID',
      'FAILED',
      'CANCELLED',
      'REFUNDED',
      'PARTIALLY_REFUNDED',
    ],
    methods: [
      {
        id: 'momo',
        name: 'Mobile Money',
        networks: ['MTN MoMo', 'Telecel Cash', 'AT Money'],
        requiresVerification: true,
        active: true,
        description: 'Instant mobile wallet payment prompt to your Ghana phone number',
      },
      {
        id: 'cash_on_delivery',
        name: 'Cash / MoMo on Delivery / Pickup',
        requiresVerification: false,
        active: true,
        description: 'Pay cash or Mobile Money upon receiving your items in Botwe / Accra',
      },
    ],
  },

  // ─── Delivery & Fulfillment Service Configuration ───
  fulfillment: {
    methods: [
      {
        id: 'doorstep',
        name: 'Doorstep Delivery',
        active: true,
        baseFee: 25.00,
        freeDeliveryThreshold: 300.00,
        coverageZones: ['Botwe', 'East Legon', 'Madina', 'Adenta', 'Greater Accra'],
        estimatedDeliveryTime: 'Same day / Next day in Accra',
      },
      {
        id: 'pickup',
        name: 'In-Store Pickup (Botwe)',
        active: true,
        baseFee: 0.00,
        pickupLocation: 'CR Store, Botwe near Galaxy International School',
        pickupHours: 'Mon–Sat: 9:00 AM – 8:00 PM',
      },
    ],
  },

  // ─── Promotion & Discount Engine ───
  promotions: {
    allowCoupons: true,
    activeCoupons: [
      {
        code: 'WELCOME10',
        type: 'percentage',
        value: 10,
        description: '10% welcome discount on entire basket',
        minSpend: 50.00,
        maxDiscount: 100.00,
        active: true,
      },
      {
        code: 'GLOW10',
        type: 'percentage',
        value: 10,
        description: '10% skincare care promo',
        minSpend: 100.00,
        maxDiscount: 50.00,
        active: true,
      },
    ],
  },
};
