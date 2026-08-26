import { sql } from './db.js';
import { products as seedProducts } from '../data/products.js';
import { BUSINESS_CONFIG } from '../data/businessConfig.js';

export async function initializeDatabase() {
  console.log('[DB Init] Starting Neon PostgreSQL schema initialization...');

  // 1. Products Table
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(64) PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      brand VARCHAR(128),
      category VARCHAR(64) NOT NULL,
      subcategory VARCHAR(64),
      price NUMERIC(10, 2) NOT NULL,
      original_price NUMERIC(10, 2),
      cost_price NUMERIC(10, 2),
      stock_count INTEGER DEFAULT 0,
      low_stock_threshold INTEGER DEFAULT 5,
      in_stock BOOLEAN DEFAULT TRUE,
      badge VARCHAR(64),
      rating NUMERIC(3, 1) DEFAULT 5.0,
      review_count INTEGER DEFAULT 0,
      status VARCHAR(32) DEFAULT 'PUBLISHED',
      image TEXT,
      images JSONB DEFAULT '[]'::jsonb,
      description TEXT,
      details JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 2. Customers Table
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id VARCHAR(64) PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      phone VARCHAR(64) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT,
      addresses JSONB DEFAULT '[]'::jsonb,
      orders_count INTEGER DEFAULT 0,
      total_spent NUMERIC(10, 2) DEFAULT 0.00,
      status VARCHAR(32) DEFAULT 'ACTIVE',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 3. Staff Table (for admin authentication)
  await sql`
    CREATE TABLE IF NOT EXISTS staff (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      role VARCHAR(64) NOT NULL DEFAULT 'ORDER_STAFF',
      status VARCHAR(32) DEFAULT 'ACTIVE',
      password_hash TEXT NOT NULL,
      last_active TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 4. Customer Sessions Table
  await sql`
    CREATE TABLE IF NOT EXISTS customer_sessions (
      token VARCHAR(128) PRIMARY KEY,
      customer_id VARCHAR(64) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 5. Admin Sessions Table
  await sql`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token VARCHAR(128) PRIMARY KEY,
      staff_id VARCHAR(64) NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 6. Password Reset Tokens Table
  await sql`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token VARCHAR(128) PRIMARY KEY,
      customer_id VARCHAR(64) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      email VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 7. Email Verification Tokens Table
  await sql`
    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      token VARCHAR(128) PRIMARY KEY,
      customer_id VARCHAR(64) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 7. Orders Table
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(64) PRIMARY KEY,
      order_number VARCHAR(64) UNIQUE NOT NULL,
      customer_id VARCHAR(64),
      customer_name VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(64) NOT NULL,
      customer_email VARCHAR(255),
      delivery_address TEXT,
      delivery_area VARCHAR(128),
      delivery_method VARCHAR(32) DEFAULT 'doorstep',
      delivery_notes TEXT,
      items JSONB NOT NULL DEFAULT '[]'::jsonb,
      subtotal NUMERIC(10, 2) NOT NULL,
      delivery_fee NUMERIC(10, 2) DEFAULT 0.00,
      discount NUMERIC(10, 2) DEFAULT 0.00,
      total NUMERIC(10, 2) NOT NULL,
      payment_method VARCHAR(32) DEFAULT 'momo',
      payment_status VARCHAR(32) DEFAULT 'PENDING',
      order_status VARCHAR(32) DEFAULT 'PENDING',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 8. Inventory Ledger Table
  await sql`
    CREATE TABLE IF NOT EXISTS inventory_ledger (
      id SERIAL PRIMARY KEY,
      product_id VARCHAR(64) NOT NULL,
      product_name VARCHAR(255),
      change_qty INTEGER NOT NULL,
      balance_after INTEGER NOT NULL,
      reason VARCHAR(128) NOT NULL,
      reference_id VARCHAR(64),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 9. Audit Logs Table
  await sql`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      event_type VARCHAR(64) NOT NULL,
      actor_name VARCHAR(128) DEFAULT 'System',
      actor_role VARCHAR(64) DEFAULT 'ADMIN',
      description TEXT NOT NULL,
      details JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 10. Settings Table
  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key VARCHAR(128) PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Create indexes for performance
  await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_customer_sessions_expires ON customer_sessions(expires_at);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_inventory_ledger_product ON inventory_ledger(product_id);`;

  // Check if products need seeding
  const existingProducts = await sql`SELECT count(*) as count FROM products;`;
  const productCount = parseInt(existingProducts[0]?.count || '0', 10);

  if (productCount === 0) {
    console.log(`[DB Init] Seeding ${seedProducts.length} initial products...`);
    for (const p of seedProducts) {
      await sql`
        INSERT INTO products (
          id, slug, name, brand, category, subcategory,
          price, original_price, cost_price, stock_count, low_stock_threshold,
          in_stock, badge, rating, review_count, status, image, description, details
        ) VALUES (
          ${p.id}, ${p.slug}, ${p.name}, ${p.brand || null}, ${p.category}, ${p.subcategory || null},
          ${p.price}, ${p.originalPrice || null}, ${p.costPrice || null}, ${p.stockCount || 50}, ${p.lowStockThreshold || 5},
          ${p.inStock ?? true}, ${p.badge || null}, ${p.rating || 5.0}, ${p.reviewCount || 0}, ${p.status || 'PUBLISHED'},
          ${p.image || null}, ${p.description || null}, ${JSON.stringify(p.details || {})}
        ) ON CONFLICT (id) DO NOTHING;
      `;
    }
    console.log('[DB Init] Products successfully seeded into Neon PostgreSQL.');
  }

  // Seed default admin user if no staff exists
  const existingStaff = await sql`SELECT count(*) as count FROM staff;`;
  if (parseInt(existingStaff[0]?.count || '0', 10) === 0) {
    const bcrypt = await import('bcryptjs');
    const adminHash = await bcrypt.hash('Admin12345!', 12);
    await sql`
      INSERT INTO staff (id, name, email, role, status, password_hash)
      VALUES ('USR-001', 'Akosua Boakye', 'akosua@crcosmetics.gh', 'SUPER_ADMIN', 'ACTIVE', ${adminHash})
      ON CONFLICT (id) DO NOTHING;
    `;
    console.log('[DB Init] Default admin user seeded.');
  }

  // Seed default settings if empty
  const existingSettings = await sql`SELECT count(*) as count FROM settings;`;
  if (parseInt(existingSettings[0]?.count || '0', 10) === 0) {
    await sql`
      INSERT INTO settings (key, value)
      VALUES ('business_config', ${JSON.stringify(BUSINESS_CONFIG)})
      ON CONFLICT (key) DO NOTHING;
    `;
    console.log('[DB Init] Business configuration successfully seeded into Neon PostgreSQL.');
  }

  return { success: true, message: 'Neon PostgreSQL schema verified and active.' };
}
