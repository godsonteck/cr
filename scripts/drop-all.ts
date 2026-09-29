import { db } from '../src/database';

// ── PRODUCTION SAFETY GUARD ──────────────────────────────────────────────────
// This script permanently destroys all data. It will refuse to run against a
// production Supabase database unless you explicitly pass --confirm-destroy.
const url = (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || '').toLowerCase();
const hasProductionUrl = url.includes('supabase') || url.includes('.pooler.supabase');
const hasConfirmFlag = process.argv.includes('--confirm-destroy');
if (hasProductionUrl && !hasConfirmFlag) {
  console.error('❌ ABORTED: DATABASE_URL points to a production Supabase instance.');
  console.error('   To proceed, run: tsx scripts/drop-all.ts --confirm-destroy');
  process.exit(1);
}
// ─────────────────────────────────────────────────────────────────────────────

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
