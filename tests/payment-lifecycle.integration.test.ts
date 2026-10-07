import assert from 'node:assert/strict';
import { createHmac, randomBytes } from 'node:crypto';
import { after, test } from 'node:test';

const paymentTestDatabaseUrl = process.env.PAYMENT_TEST_DATABASE_URL;
if (!paymentTestDatabaseUrl) {
  throw new Error('PAYMENT_TEST_DATABASE_URL must point to a dedicated migrated test database.');
}
const parsedDatabaseUrl = new URL(paymentTestDatabaseUrl);
if (!/test/i.test(`${parsedDatabaseUrl.hostname}/${parsedDatabaseUrl.pathname}`)
  && parsedDatabaseUrl.searchParams.get('application_name') !== 'payment-lifecycle-test') {
  throw new Error('The payment integration database URL must identify a test database.');
}

process.env.DATABASE_URL = paymentTestDatabaseUrl;
process.env.PAYSTACK_SECRET_KEY = `sk_test_${randomBytes(24).toString('hex')}`;
process.env.VERCEL_ENV = 'preview';
process.env.RESEND_API_KEY = '';
process.env.EMAIL_FROM = '';
process.env.STORE_NOTIFICATION_EMAIL = '';
process.env.JWT_SECRET = randomBytes(32).toString('hex');
process.env.CRON_SECRET = randomBytes(24).toString('hex');

const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
const cronSecret = process.env.CRON_SECRET;
const jwtSecret = process.env.JWT_SECRET;
const verificationResponses = new Map<string, { statusCode: number; payload: unknown }>();
let initializedPayload: Record<string, unknown> | undefined;
const originalFetch = globalThis.fetch;

globalThis.fetch = async (input, init) => {
  const url = input instanceof Request ? input.url : String(input);
  if (url.endsWith('/transaction/initialize')) {
    initializedPayload = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(JSON.stringify({
      status: true,
      data: { authorization_url: 'https://checkout.paystack.com/test-only', reference: initializedPayload.reference },
    }), { status: 200 });
  }
  const reference = decodeURIComponent(url.split('/').pop() || '');
  const response = verificationResponses.get(reference);
  if (url.includes('/transaction/verify/') && response) {
    return new Response(JSON.stringify(response.payload), { status: response.statusCode });
  }
  throw new Error('Unexpected outbound request in payment integration test.');
};

const [{ default: ordersHandler }, { default: authHandler }, { default: webhookHandler }, { db }, schema, jwt] = await Promise.all([
  import('../server-api/orders.js'),
  import('../server-api/auth.js'),
  import('../server-api/paystack-webhook.js'),
  import('../src/database.js'),
  import('../src/db/schema.js'),
  import('jsonwebtoken'),
]);

type Fixture = {
  userId: string;
  email: string;
  productId: string;
  token: string;
  idempotencyKeys: string[];
  orderIds: string[];
  orderNumbers: string[];
};

class TestResponse {
  statusCode = 200;
  payload: unknown;
  status(code: number) { this.statusCode = code; return this; }
  json(payload: unknown) { this.payload = payload; return this; }
  setHeader() { return this; }
}

async function invoke(handler: (req: any, res: any) => unknown, request: Record<string, unknown>) {
  const response = new TestResponse();
  await handler({ headers: {}, query: {}, ...request }, response);
  return response;
}

async function createFixture(stockCount: number): Promise<Fixture> {
  const suffix = randomBytes(10).toString('hex');
  const email = `payment-${suffix}@example.test`;
  const [user] = await db.insert(schema.users).values({ email, fullName: 'Payment Test', phone: '0000000000' }).returning();
  const productId = `payment-test-${suffix}`;
  await db.insert(schema.products).values({
    id: productId,
    name: 'Integration Test Product',
    brand: 'Test Brand',
    department: 'beauty',
    category: 'skincare',
    categoryLabel: 'Skincare',
    price: '10.00',
    unit: 'each',
    image: 'https://example.test/product.png',
    description: 'Payment lifecycle fixture',
    stockCount,
    inStock: stockCount > 0,
    isPublished: stockCount > 0,
  });
  return {
    userId: user.id,
    email,
    productId,
    token: jwt.default.sign({ sub: user.id, email, role: 'customer', name: 'Payment Test' }, jwtSecret),
    idempotencyKeys: [],
    orderIds: [],
    orderNumbers: [],
  };
}

async function prepareOrder(fixture: Fixture, quantity = 1) {
  const [product] = await db.select().from(schema.products).where((await import('drizzle-orm')).eq(schema.products.id, fixture.productId)).limit(1);
  const idempotencyKey = `payment-test-${randomBytes(12).toString('hex')}`;
  fixture.idempotencyKeys.push(idempotencyKey);
  const subtotal = Number(product.price) * quantity;
  const response = await invoke(ordersHandler, {
    method: 'POST',
    query: { action: 'prepare-paystack' },
    headers: { authorization: `Bearer ${fixture.token}` },
    body: {
      items: [{
        product: {
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: Number(product.price),
          image: product.image,
          unit: product.unit,
          category: product.category,
          inStock: product.inStock,
          stockCount: product.stockCount,
        },
        quantity,
      }],
      subtotal,
      shippingFee: 0,
      discount: 0,
      total: subtotal,
      paymentMethod: 'paystack',
      paymentStatus: 'pending',
      deliveryMethod: 'store-pickup',
      shippingAddress: { fullName: 'Payment Test', phone: '0000000000', email: fixture.email, city: 'Accra', area: 'Test' },
      idempotencyKey,
    },
  });
  const order = response.payload as { id?: string; orderNumber?: string; total?: string | number; paymentReference?: string; paymentStatus?: string };
  if (order.id) fixture.orderIds.push(order.id);
  if (order.orderNumber) fixture.orderNumbers.push(order.orderNumber);
  return { response, order };
}

function successfulVerification(fixture: Fixture, order: { paymentReference?: string; total?: string | number }, amount = Math.round(Number(order.total) * 100)) {
  const reference = order.paymentReference!;
  verificationResponses.set(reference, {
    statusCode: 200,
    payload: { status: true, data: { status: 'success', reference, amount, currency: 'GHS', customer: { email: fixture.email } } },
  });
}

function webhookRequest(event: unknown) {
  const rawBody = JSON.stringify(event);
  const signature = createHmac('sha512', paystackSecret).update(rawBody).digest('hex');
  return {
    method: 'POST',
    rawBody: Buffer.from(rawBody),
    headers: { 'x-paystack-signature': signature },
  };
}

async function cleanupFixture(fixture: Fixture) {
  for (const key of fixture.idempotencyKeys) {
    const rows = await db.select({ id: schema.orders.id, orderNumber: schema.orders.orderNumber })
      .from(schema.orders).where((await import('drizzle-orm')).eq(schema.orders.idempotencyKey, key));
    fixture.orderIds.push(...rows.map(row => row.id));
    fixture.orderNumbers.push(...rows.map(row => row.orderNumber));
  }
  if (fixture.orderIds.length) {
    await db.delete(schema.inventoryMovements).where((await import('drizzle-orm')).inArray(schema.inventoryMovements.orderId, fixture.orderIds));
    await db.delete(schema.orders).where((await import('drizzle-orm')).inArray(schema.orders.id, fixture.orderIds));
  }
  const messages = fixture.orderNumbers.flatMap(orderNumber => [
    `Order #${orderNumber} has been received and is being prepared.`,
    `Order #${orderNumber} was placed and needs fulfillment review.`,
    `Order #${orderNumber} was cancelled and reserved stock was released.`,
    `Order #${orderNumber} was cancelled after Paystack confirmed the payment did not complete.`,
  ]);
  if (messages.length) await db.delete(schema.notifications).where((await import('drizzle-orm')).inArray(schema.notifications.message, messages));
  await db.delete(schema.products).where((await import('drizzle-orm')).eq(schema.products.id, fixture.productId));
  await db.delete(schema.users).where((await import('drizzle-orm')).eq(schema.users.id, fixture.userId));
}

after(async () => {
  globalThis.fetch = originalFetch;
  verificationResponses.clear();
  await db.$client.end({ timeout: 1 });
});

test('successful payment initializes from the order and confirms server-side', async () => {
  const fixture = await createFixture(2);
  try {
    const { response, order } = await prepareOrder(fixture);
    assert.equal(response.statusCode, 201);
    assert.equal(order.paymentStatus, 'pending');

    const initResponse = await invoke(authHandler, {
      method: 'POST',
      query: { action: 'paystack-initialize' },
      headers: { authorization: `Bearer ${fixture.token}` },
      body: { orderId: order.id, callbackUrl: 'https://store.example.test/checkout', amount: 1, email: 'spoof@example.test' },
    });
    assert.equal(initResponse.statusCode, 200);
    assert.equal(initializedPayload?.amount, Math.round(Number(order.total) * 100));
    assert.equal(initializedPayload?.currency, 'GHS');
    assert.equal(initializedPayload?.email, fixture.email);
    assert.equal(initializedPayload?.reference, order.paymentReference);

    successfulVerification(fixture, order);
    const confirmed = await invoke(ordersHandler, {
      method: 'POST',
      query: { action: 'confirm-paystack' },
      headers: { authorization: `Bearer ${fixture.token}` },
      body: { orderId: order.id, reference: order.paymentReference },
    });
    assert.equal(confirmed.statusCode, 200);
    assert.equal((confirmed.payload as { paymentStatus: string }).paymentStatus, 'paid');
  } finally {
    await cleanupFixture(fixture);
  }
});

test('duplicate webhook delivery is a no-op', async () => {
  const fixture = await createFixture(2);
  try {
    const { order } = await prepareOrder(fixture);
    const event = { event: 'charge.success', data: { reference: order.paymentReference, amount: Math.round(Number(order.total) * 100), currency: 'GHS', status: 'success' } };
    const first = await invoke(webhookHandler, webhookRequest(event));
    const second = await invoke(webhookHandler, webhookRequest(event));
    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 200);
    assert.equal((second.payload as { alreadyProcessed?: boolean }).alreadyProcessed, true);
  } finally {
    await cleanupFixture(fixture);
  }
});

test('late failure event cannot revert a paid order', async () => {
  const fixture = await createFixture(2);
  try {
    const { order } = await prepareOrder(fixture);
    const success = { event: 'charge.success', data: { reference: order.paymentReference, amount: Math.round(Number(order.total) * 100), currency: 'GHS', status: 'success' } };
    await invoke(webhookHandler, webhookRequest(success));
    const lateFailure = { event: 'charge.failed', data: { reference: order.paymentReference, status: 'failed' } };
    const response = await invoke(webhookHandler, webhookRequest(lateFailure));
    const [stored] = await db.select().from(schema.orders).where((await import('drizzle-orm')).eq(schema.orders.id, order.id!)).limit(1);
    assert.equal(response.statusCode, 200);
    assert.equal(stored.paymentStatus, 'paid');
  } finally {
    await cleanupFixture(fixture);
  }
});

test('amount mismatch cannot confirm an order', async () => {
  const fixture = await createFixture(2);
  try {
    const { order } = await prepareOrder(fixture);
    successfulVerification(fixture, order, Math.round(Number(order.total) * 100) - 1);
    const response = await invoke(ordersHandler, {
      method: 'POST',
      query: { action: 'confirm-paystack' },
      headers: { authorization: `Bearer ${fixture.token}` },
      body: { orderId: order.id, reference: order.paymentReference },
    });
    const [stored] = await db.select().from(schema.orders).where((await import('drizzle-orm')).eq(schema.orders.id, order.id!)).limit(1);
    assert.equal(response.statusCode, 402);
    assert.equal(stored.paymentStatus, 'pending');
  } finally {
    await cleanupFixture(fixture);
  }
});

test('failed payment releases reserved stock once', async () => {
  const fixture = await createFixture(1);
  try {
    const { order } = await prepareOrder(fixture);
    await db.update(schema.orders).set({ createdAt: new Date(Date.now() - 20 * 60 * 1000) })
      .where((await import('drizzle-orm')).eq(schema.orders.id, order.id!));
    verificationResponses.set(order.paymentReference!, {
      statusCode: 200,
      payload: { status: true, data: { status: 'failed', reference: order.paymentReference } },
    });
    const request = { method: 'GET', query: { action: 'reconcile', orderId: order.id }, headers: { authorization: `Bearer ${cronSecret}` } };
    const first = await invoke(ordersHandler, request);
    const second = await invoke(ordersHandler, request);
    const [stored] = await db.select().from(schema.orders).where((await import('drizzle-orm')).eq(schema.orders.id, order.id!)).limit(1);
    const [product] = await db.select().from(schema.products).where((await import('drizzle-orm')).eq(schema.products.id, fixture.productId)).limit(1);
    assert.equal(first.statusCode, 200);
    assert.equal((first.payload as { released: number }).released, 1);
    assert.equal((second.payload as { released: number }).released, 0);
    assert.equal(stored.paymentStatus, 'failed');
    assert.equal(stored.status, 'Cancelled');
    assert.equal(product.stockCount, 1);
  } finally {
    await cleanupFixture(fixture);
  }
});

test('concurrent attempts cannot buy the final unit twice', async () => {
  const fixture = await createFixture(1);
  try {
    const [first, second] = await Promise.all([prepareOrder(fixture), prepareOrder(fixture)]);
    assert.deepEqual([first.response.statusCode, second.response.statusCode].sort(), [201, 409]);
    const [product] = await db.select().from(schema.products).where((await import('drizzle-orm')).eq(schema.products.id, fixture.productId)).limit(1);
    assert.equal(product.stockCount, 0);
    assert.equal(fixture.orderIds.length, 1);
  } finally {
    await cleanupFixture(fixture);
  }
});