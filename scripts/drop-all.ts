import { db } from '../src/db';

async function dropAll() {
  console.log('🗑️ Dropping all tables...');
  
  const tables = [
    'wishlists', 'reviews', 'orders', 'carts', 'products', 
    'flash_deals', 'promo_codes', 'categories', 'brands', 
    'store_settings', 'users', 'admin_sessions'
  ];

  for (const t of tables) {
    try { 
      await db.execute(`DROP TABLE IF EXISTS "${t}" CASCADE`); 
      console.log('Dropped:', t); 
    } catch (e: any) { 
      console.log('Error dropping', t, e.message); 
    }
  }
  
  // Drop enums
  const enums = ['admin_role', 'category_type', 'delivery_method', 'department', 'discount_type', 'order_status', 'payment_method', 'payment_status', 'routine_step'];
  for (const e of enums) {
    try { 
      await db.execute(`DROP TYPE IF EXISTS "${e}" CASCADE`); 
      console.log('Dropped enum:', e); 
    } catch (e: any) { 
      console.log('Error dropping enum', e); 
    }
  }
  
  console.log('✅ All dropped');
}

dropAll()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));