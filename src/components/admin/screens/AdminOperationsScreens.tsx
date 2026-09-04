import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Clock3,
  Edit3,
  ExternalLink,
  Eye,
  Mail,
  Package,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  Users,
  X,
  MessageCircle,
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useAlert } from '../../../context/AlertContext';
import { AdminNotification, FlashDeal, PromoCode, Product, StoreSettings, Customer } from '../../../types';
import { api } from '../../../lib/api';
import { CustomerDetailDrawer } from '../components/CustomerDetailDrawer';

// ─── Utilities ────────────────────────────────────────────────────────────────

const money = (value: number) => `GHS ${Number(value || 0).toFixed(2)}`;

const inputClass =
  'w-full rounded-xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#2a2024] px-3 py-2.5 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-[#1E1719] dark:focus:ring-stone-600 transition';

const buttonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E1719] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#33282C]';

const mutedButton =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] px-3 py-2 text-sm font-semibold text-stone-700 dark:text-stone-300 transition hover:bg-stone-50 dark:hover:bg-[#2a2024]';

const optimizeUploadedImage = (file: File, maxDimension = 1600): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    image.onerror = () => reject(new Error('Image could not be processed'));
    image.src = String(reader.result || '');
  };
  reader.onerror = () => reject(new Error('Image could not be read'));
  reader.readAsDataURL(file);
});

// ─── Shared layout components ─────────────────────────────────────────────────

function ScreenHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-stone-200 dark:border-[#2e2428] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B27A52]">{eyebrow}</p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-[#1E1719] dark:text-stone-100">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-500 dark:text-stone-400">{description}</p>
      </div>
      {action}
    </div>
  );
}

function Stat({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          {label}
        </span>
        <Icon className="h-4 w-4 text-[#B27A52]" />
      </div>
      <p className="mt-3 text-2xl font-bold text-stone-900 dark:text-stone-100">{value}</p>
      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{detail}</p>
    </div>
  );
}

// ─── Inventory Screen ─────────────────────────────────────────────────────────

export function AdminInventoryScreen({ onAddProduct }: { onAddProduct?: () => void }) {
  const store = useStore();
  const { showAlert } = useAlert();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [adjustmentMode, setAdjustmentMode] = useState<'set' | 'add' | 'remove'>('set');

  const rows = useMemo(
    () =>
      store.products
        .filter(p =>
          `${p.name} ${p.brand} ${p.categoryLabel}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
        .sort((a, b) => a.stockCount - b.stockCount),
    [store.products, query]
  );

  const low = store.products.filter(p => p.stockCount > 0 && p.stockCount <= 5).length;
  const out = store.products.filter(p => p.stockCount <= 0).length;

  const save = async () => {
    if (!selected) return;
    const nextQuantity = adjustmentMode === 'add'
      ? selected.stockCount + quantity
      : adjustmentMode === 'remove'
        ? selected.stockCount - quantity
        : quantity;
    await store.updateProductStock(selected.id, Math.max(0, nextQuantity));
    showAlert(`${selected.name} stock updated`, 'success');
    setSelected(null);
  };

  const removeProduct = async (product: Product) => {
    if (!window.confirm(`Remove ${product.name} from the catalog and inventory?`)) return;
    await store.deleteProduct(product.id);
    showAlert(`${product.name} removed from inventory`, 'success');
  };

  const stockBadge = (count: number) => {
    if (count === 0) return 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400';
    if (count <= 5)  return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400';
  };

  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Store"
        title="Inventory"
        description="Check stock and update quantities."
        action={
          <div className="flex flex-wrap gap-2">
            {onAddProduct && <button className={buttonClass} onClick={onAddProduct}><Plus className="h-4 w-4" />Add product</button>}
            <button className={mutedButton} onClick={() => setQuery('')}><Package className="h-4 w-4" />{store.products.length} SKUs</button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Units on hand"
          value={store.products.reduce((n, p) => n + p.stockCount, 0)}
          detail="Across every catalog item"
          icon={Package}
        />
        <Stat label="Low stock" value={low} detail="1 to 5 units remaining" icon={AlertTriangle} />
        <Stat label="Out of stock" value={out} detail="Needs replenishment" icon={X} />
      </div>

      <input
        className={inputClass}
        placeholder="Search product, brand, or category"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      <div className="overflow-hidden rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a]">
        <div className="divide-y divide-stone-100 dark:divide-[#2e2428]">
          {rows.map(product => (
            <div key={product.id} className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap">
              <img src={product.image} alt="" className="h-12 w-12 rounded-xl object-cover flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-stone-900 dark:text-stone-100">{product.name}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {product.brand} · {product.categoryLabel}
                </p>
              </div>
              <span className={`min-w-24 rounded-full px-3 py-1 text-center text-xs font-bold ${stockBadge(product.stockCount)}`}>
                {product.stockCount} units
              </span>
              <button
                className={mutedButton}
                onClick={() => {
                  setSelected(product);
                  setQuantity(product.stockCount);
                  setAdjustmentMode('set');
                }}
              >
                <Edit3 className="h-4 w-4" />
                Adjust
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                onClick={() => void removeProduct(product)}
                title={`Remove ${product.name}`}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="p-8 text-center text-sm text-stone-500 dark:text-stone-400">
              No products match this search.
            </p>
          )}
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#201b1a] p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Adjust stock</h2>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-[#2a2024] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{selected.name}</p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {(['set', 'add', 'remove'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => { setAdjustmentMode(mode); setQuantity(mode === 'set' ? selected.stockCount : 1); }}
                  className={`rounded-xl border px-2 py-2 text-xs font-bold capitalize ${adjustmentMode === mode ? 'border-[#1E1719] bg-[#1E1719] text-white' : 'border-stone-200 bg-white text-stone-600 dark:border-[#2e2428] dark:bg-[#2a2024] dark:text-stone-300'}`}
                >
                  {mode === 'set' ? 'Set total' : mode === 'add' ? 'Receive stock' : 'Remove stock'}
                </button>
              ))}
            </div>
            <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              {adjustmentMode === 'set' ? 'New quantity' : 'Units to adjust'}
            </label>
            <input
              className={`${inputClass} mt-2`}
              type="number"
              min="0"
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
            />
            <button className={`${buttonClass} mt-5 w-full`} onClick={save}>
              <Save className="h-4 w-4" />
              Save quantity
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Customers Screen (Resilient Multi-tier Data Provider) ───────────────────

export function AdminCustomersScreen() {
  const store = useStore();
  const { showAlert } = useAlert();
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Derive and aggregate customers from orders & backend/local storage
  const buildCustomerList = useCallback(async () => {
    setLoading(true);
    const customerMap = new Map<string, Customer>();

    // 1. Build from Orders (authoritative source of active shoppers)
    (store.orders || []).forEach(order => {
      const email = order.shippingAddress?.email?.trim().toLowerCase() || '';
      const phone = order.shippingAddress?.phone?.trim() || '';
      const name = order.shippingAddress?.fullName?.trim() || 'Valued Customer';
      const key = email || phone || name;
      if (!key) return;

      const existing = customerMap.get(key);
      const orderTotal = Number(order.total) || 0;
      const orderDate = order.createdAt;

      if (!existing) {
        const id = 'cust-' + (email ? email.replace(/[^a-z0-9]/g, '-') : phone.replace(/[^0-9]/g, ''));
        const savedNotes = localStorage.getItem(`cr_customer_notes_${id}`) || '';
        const isBlocked = localStorage.getItem(`cr_customer_blocked_${id}`) === 'true';

        customerMap.set(key, {
          id,
          fullName: name,
          email: email || `${phone.replace(/[^0-9]/g, '')}@customer.cr`,
          phone: phone || 'No phone recorded',
          ordersCount: 1,
          totalSpent: orderTotal,
          lastOrderDate: orderDate,
          segment: orderTotal >= 500 ? 'High Value' : 'New',
          status: isBlocked ? 'Blocked' : 'Active',
          addresses: [order.shippingAddress],
          notes: savedNotes,
          createdAt: orderDate,
        });
      } else {
        existing.ordersCount += 1;
        existing.totalSpent += orderTotal;
        if (!existing.lastOrderDate || orderDate > existing.lastOrderDate) {
          existing.lastOrderDate = orderDate;
        }
        if (order.shippingAddress && !existing.addresses.some(a => a.area === order.shippingAddress.area)) {
          existing.addresses.push(order.shippingAddress);
        }
        existing.segment = existing.totalSpent >= 500 ? 'High Value' : existing.ordersCount > 1 ? 'Returning' : 'New';
      }
    });

    // 2. Try fetching registered users from API
    try {
      const adminToken = localStorage.getItem('admin_auth_token');
      if (!adminToken) {
        throw new Error('Admin session is missing. Please sign in again.');
      }
      const apiUsers = await api.get<any[]>('/users?admin=true', adminToken);
      if (Array.isArray(apiUsers)) {
        apiUsers.forEach(u => {
          const key = u.email?.trim().toLowerCase() || u.phone?.trim() || u.id;
          const existing = customerMap.get(key);
          if (existing) {
            existing.id = u.id || existing.id;
            existing.fullName = u.fullName || existing.fullName;
            existing.status = u.isActive === false ? 'Blocked' : existing.status;
            if (u.ordersCount !== undefined && u.ordersCount > existing.ordersCount) {
              existing.ordersCount = u.ordersCount;
            }
            if (u.totalSpent !== undefined && u.totalSpent > existing.totalSpent) {
              existing.totalSpent = u.totalSpent;
            }
            if (u.segment) {
              existing.segment = u.segment;
            }
            if (u.savedAddresses && u.savedAddresses.length > 0) {
              existing.addresses = [...existing.addresses, ...u.savedAddresses];
            }
          } else {
            const id = u.id || 'cust-' + Date.now();
            const isBlocked = u.isActive === false || localStorage.getItem(`cr_customer_blocked_${id}`) === 'true';
            customerMap.set(key, {
              id,
              fullName: u.fullName || 'Registered User',
              email: u.email || '',
              phone: u.phone || '',
              ordersCount: u.ordersCount || 0,
              totalSpent: u.totalSpent || 0,
              segment: u.segment || 'New',
              status: isBlocked ? 'Blocked' : 'Active',
              addresses: u.savedAddresses || [],
              notes: localStorage.getItem(`cr_customer_notes_${id}`) || '',
              createdAt: u.createdAt || new Date().toISOString(),
            });
          }
        });
      }
    } catch (error: any) {
      showAlert(error?.message || 'Registered customers could not be loaded.', 'error');
    }

    const result = Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
    setCustomers(result);
    setLoading(false);
  }, [store.orders]);

  useEffect(() => {
    void buildCustomerList();
  }, [buildCustomerList]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return customers.filter(
      c =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }, [customers, query]);

  const activeCount = customers.filter(c => c.status === 'Active').length;
  const repeatCount = filtered.filter(c => c.ordersCount > 1).length;

  const toggleStatus = async (customer: Customer) => {
    const nextStatus = customer.status === 'Active' ? 'Blocked' : 'Active';
    const isBlocked = nextStatus === 'Blocked';

    // Update local state and persistence
    localStorage.setItem(`cr_customer_blocked_${customer.id}`, isBlocked ? 'true' : 'false');
    setCustomers(prev =>
      prev.map(c => (c.id === customer.id ? { ...c, status: nextStatus } : c))
    );

    // Sync with remote API if reachable
    try {
      await api.patch(`/users/${customer.id}`, { isActive: !isBlocked });
    } catch {
      // Handled locally
    }

    showAlert(`${customer.fullName} is now ${nextStatus.toLowerCase()}`, 'success');
  };

  const handleSaveNotes = (customerId: string, notes: string) => {
    localStorage.setItem(`cr_customer_notes_${customerId}`, notes);
    setCustomers(prev =>
      prev.map(c => (c.id === customerId ? { ...c, notes } : c))
    );
    if (selectedCustomer && selectedCustomer.id === customerId) {
      setSelectedCustomer(prev => (prev ? { ...prev, notes } : null));
    }
    showAlert('Customer notes saved', 'success');
  };

  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Store"
        title="Customers"
        description="View customers and their order history."
        action={
          <button className={mutedButton} onClick={() => void buildCustomerList()}>
            <ExternalLink className="h-4 w-4" />
            Refresh
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total Customers" value={customers.length} detail="In shop records" icon={Users} />
        <Stat label="Active Accounts" value={activeCount} detail="Allowed to shop" icon={ShieldCheck} />
        <Stat label="Repeat Buyers" value={repeatCount} detail="2+ completed orders" icon={ShoppingBag} />
      </div>

      <input
        className={inputClass}
        placeholder="Search by name, email, or phone number..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      {loading ? (
        <div className="rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] p-10 text-center text-sm text-stone-500 dark:text-stone-400">
          Loading customer records...
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a]">
          <div className="divide-y divide-stone-100 dark:divide-[#2e2428]">
            {filtered.map(customer => {
              const customerPhoneClean = customer.phone.replace(/[^0-9]/g, '');
              const whatsappUrl = `https://wa.me/${
                customerPhoneClean.startsWith('0') ? '233' + customerPhoneClean.slice(1) : customerPhoneClean
              }?text=${encodeURIComponent(`Hello ${customer.fullName}, this is CR Mart.`)}`;

              return (
                <div key={customer.id} className="flex flex-wrap items-center gap-4 p-4 hover:bg-stone-50/60 dark:hover:bg-[#2a2024]/40 transition-colors">
                  {/* Avatar */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2E3D7] dark:bg-[#3d2a22] font-bold text-[#8A5738] dark:text-[#E8B792] flex-shrink-0">
                    {customer.fullName.charAt(0).toUpperCase()}
                  </div>

                  {/* Details */}
                  <div className="min-w-48 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-stone-900 dark:text-stone-100">{customer.fullName}</p>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A5738] dark:text-[#E8B792] bg-[#F2E3D7]/60 dark:bg-[#3d2a22] px-2 py-0.5 rounded-full">
                        {customer.segment}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {customer.email} · {customer.phone}
                    </p>
                    <p className="mt-1 text-[11px] text-stone-400 dark:text-stone-600">
                      Joined {new Date(customer.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Order summary */}
                  <div className="text-right">
                    <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {money(customer.totalSpent)}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {customer.ordersCount} {customer.ordersCount === 1 ? 'order' : 'orders'}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      customer.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                        : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                    }`}
                  >
                    {customer.status}
                  </span>

                  {/* Actions */}
                  <button
                    className={mutedButton}
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <Eye className="h-4 w-4" />
                    Details
                  </button>
                  <a
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                  <button className={mutedButton} onClick={() => void toggleStatus(customer)}>
                    {customer.status === 'Active' ? 'Block' : 'Activate'}
                  </button>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="p-8 text-center text-sm text-stone-500 dark:text-stone-400">
                No customers match this search.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Customer Detail Drawer */}
      <CustomerDetailDrawer
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        orders={store.orders}
        onSaveCustomerNotes={handleSaveNotes}
      />
    </div>
  );
}

// ─── Promotions Screen ────────────────────────────────────────────────────────

export function AdminPromotionsScreen() {
  const store = useStore();
  const { showAlert } = useAlert();
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountValue: 10,
    discountType: 'percentage' as PromoCode['discountType'],
    minSpend: 0,
    freeShipping: false,
  });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return;
    await store.addPromoCode({
      ...form,
      code: form.code.trim().toUpperCase(),
      minSpend: form.minSpend || undefined,
      isActive: true,
    });
    showAlert(`${form.code.toUpperCase()} created`, 'success');
    setForm({ code: '', description: '', discountValue: 10, discountType: 'percentage', minSpend: 0, freeShipping: false });
  };

  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Store"
        title="Discounts"
        description="Create discount codes for checkout."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Create Form */}
        <form onSubmit={add} className="space-y-4 rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] p-5">
          <h2 className="font-bold text-stone-900 dark:text-stone-100">New discount code</h2>
          <input
            required
            className={inputClass}
            placeholder="CODE NAME"
            value={form.code}
            onChange={e => setForm({ ...form, code: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Customer-facing description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              className={inputClass}
              value={form.discountType}
              onChange={e => setForm({ ...form, discountType: e.target.value as PromoCode['discountType'] })}
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed GHS</option>
            </select>
            <input
              className={inputClass}
              type="number"
              min="0"
              value={form.discountValue}
              onChange={e => setForm({ ...form, discountValue: Number(e.target.value) })}
            />
          </div>
          <input
            className={inputClass}
            type="number"
            min="0"
            placeholder="Minimum spend (optional)"
            value={form.minSpend || ''}
            onChange={e => setForm({ ...form, minSpend: Number(e.target.value) })}
          />
          <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
            <input
              type="checkbox"
              checked={form.freeShipping}
              onChange={e => setForm({ ...form, freeShipping: e.target.checked })}
            />
            Include free shipping
          </label>
          <button className={`${buttonClass} w-full`}>
            <Plus className="h-4 w-4" />
            Create promotion
          </button>
        </form>

        {/* Promo List */}
        <div className="space-y-3">
          {store.promoCodes.map(promo => (
            <div
              key={promo.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2E3D7] dark:bg-[#3d2a22] text-[#8A5738] dark:text-[#E8B792]">
                <Tag className="h-5 w-5" />
              </div>
              <div className="min-w-40 flex-1">
                <p className="font-mono font-bold text-stone-900 dark:text-stone-100">{promo.code}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {promo.description || 'No description'} · {promo.usageCount} uses
                </p>
              </div>
              <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                {promo.freeShipping
                  ? 'Free delivery'
                  : promo.discountType === 'percentage'
                  ? `${promo.discountValue}% off`
                  : `${money(promo.discountValue)} off`}
              </span>
              <button className={mutedButton} onClick={() => store.togglePromoCode(promo.code)}>
                {promo.isActive ? 'Pause' : 'Activate'}
              </button>
              <button
                className="rounded-xl p-2 text-stone-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                aria-label={`Delete ${promo.code}`}
                onClick={() => store.deletePromoCode(promo.id)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {store.promoCodes.length === 0 && (
            <p className="rounded-2xl border border-dashed border-stone-300 dark:border-[#2e2428] p-8 text-center text-sm text-stone-500 dark:text-stone-400">
              No promotions have been created.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Flash Deals Screen ───────────────────────────────────────────────────────

export function AdminFlashDealsScreen() {
  const store = useStore();
  const { showAlert } = useAlert();
  const [editing, setEditing] = useState<FlashDeal | null>(null);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    discountPercentage: 20,
    expiresAt: '',
    productIds: [] as string[],
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const expires = form.expiresAt
      ? new Date(form.expiresAt).toISOString()
      : new Date(Date.now() + 86400000).toISOString();

    const data = {
      ...form,
      expiresAt: expires,
      badgeText: 'LIMITED TIME DEAL',
      hoursRemaining: 24,
      minutesRemaining: 0,
      secondsRemaining: 0,
      backgroundGradient: 'from-[#1E1719] via-[#2B1F23] to-[#120B0D]',
      isActive: true,
      productIds: form.productIds,
    };

    if (editing) {
      await store.updateFlashDeal(editing.id, data);
    } else {
      await store.addFlashDeal(data);
    }
    showAlert(editing ? 'Flash deal updated' : 'Flash deal created', 'success');
    setEditing(null);
    setForm({ title: '', subtitle: '', description: '', discountPercentage: 20, expiresAt: '', productIds: [] });
  };

  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Store"
        title="Deals"
        description="Create and manage limited-time offers."
        action={
          <span className="rounded-full bg-stone-100 dark:bg-[#2a2024] px-3 py-1.5 text-xs font-bold text-stone-600 dark:text-stone-400">
            {store.flashDeals.filter(d => d.isActive).length} active
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Form */}
        <form onSubmit={save} className="space-y-4 rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] p-5">
          <h2 className="font-bold text-stone-900 dark:text-stone-100">
            {editing ? 'Edit deal' : 'New deal'}
          </h2>
          <input
            required
            className={inputClass}
            placeholder="Deal title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Short subtitle"
            value={form.subtitle}
            onChange={e => setForm({ ...form, subtitle: e.target.value })}
          />
          <textarea
            className={`${inputClass} min-h-24`}
            placeholder="Describe the offer"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 block mb-1">
                Discount %
              </label>
              <input
                className={inputClass}
                type="number"
                min="0"
                max="100"
                value={form.discountPercentage}
                onChange={e => setForm({ ...form, discountPercentage: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 block mb-1">
                Expires at
              </label>
              <input
                className={inputClass}
                type="datetime-local"
                value={form.expiresAt}
                onChange={e => setForm({ ...form, expiresAt: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 block">Deal products</label>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-stone-200 p-2 dark:border-[#2e2428]">
              {store.products.filter(product => product.isPublished !== false).map(product => {
                const selected = form.productIds.includes(product.id);
                return <label key={product.id} className="flex cursor-pointer items-center gap-2 rounded-lg p-2 text-xs hover:bg-stone-50 dark:hover:bg-[#2a2024]"><input type="checkbox" checked={selected} onChange={() => setForm({ ...form, productIds: selected ? form.productIds.filter(id => id !== product.id) : [...form.productIds, product.id] })} /><span className="truncate text-stone-700 dark:text-stone-300">{product.name}</span><span className="ml-auto text-stone-400">GHS {product.price.toFixed(2)}</span></label>;
              })}
            </div>
            <p className="text-[11px] text-stone-500">Selected products appear in the storefront flash-deal collection.</p>
          </div>
          <div className="flex gap-2">
            <button className={`${buttonClass} flex-1`}>
              <Save className="h-4 w-4" />
              {editing ? 'Save deal' : 'Publish deal'}
            </button>
            {editing && (
              <button type="button" className={mutedButton} onClick={() => setEditing(null)}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Deals List */}
        <div className="space-y-3">
          {store.flashDeals.map(deal => (
            <div key={deal.id} className="rounded-2xl border border-stone-200 bg-[#1E1719] p-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E8B792]">
                    {deal.badgeText}
                  </p>
                  <h2 className="mt-2 text-xl font-bold">{deal.title}</h2>
                  <p className="mt-1 text-sm text-stone-300">{deal.description}</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold whitespace-nowrap">
                  {deal.discountPercentage}% off
                </span>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="mr-auto text-xs text-stone-400">
                  Ends {new Date(deal.expiresAt).toLocaleString()}
                </span>
                <button
                  className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20 transition-colors"
                  onClick={() => {
                    setEditing(deal);
                    setForm({
                      title: deal.title,
                      subtitle: deal.subtitle,
                      description: deal.description,
                      discountPercentage: deal.discountPercentage,
                      expiresAt: deal.expiresAt.slice(0, 16),
                      productIds: deal.productIds || [],
                    });
                  }}
                >
                  Edit
                </button>
                <button
                  className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20 transition-colors"
                  onClick={() => store.toggleFlashDeal(deal.id)}
                >
                  {deal.isActive ? 'Pause' : 'Activate'}
                </button>
                <button
                  className="rounded-xl p-2 text-stone-300 hover:bg-red-900 transition-colors"
                  aria-label={`Delete ${deal.title}`}
                  onClick={() => store.deleteFlashDeal(deal.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {store.flashDeals.length === 0 && (
            <p className="rounded-2xl border border-dashed border-stone-300 dark:border-[#2e2428] p-8 text-center text-sm text-stone-500 dark:text-stone-400">
              No flash deals have been created.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Settings Screen ──────────────────────────────────────────────────────────

export function AdminSettingsScreen() {
  const store = useStore();
  const { showAlert } = useAlert();
  const [form, setForm] = useState<StoreSettings>(store.storeSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>(form.storeLogo || '');
  const [heroImagePreview, setHeroImagePreview] = useState<string>(form.heroImage || '');

  // Sync form when store updates
  React.useEffect(() => {
    setForm(store.storeSettings);
    setLogoPreview(store.storeSettings.storeLogo || '');
    setHeroImagePreview(store.storeSettings.heroImage || '');
  }, [store.storeSettings]);

  const update = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const updateNested = <K extends 'homepageSections' | 'pageVisibility'>(key: K, child: keyof StoreSettings[K], value: boolean) =>
    setForm(prev => ({ ...prev, [key]: { ...prev[key], [child]: value } }));

  const deliveryZones = form.deliveryZones || [];
  const updateDeliveryZone = (index: number, updates: Partial<NonNullable<StoreSettings['deliveryZones']>[number]>) =>
    setForm(prev => ({ ...prev, deliveryZones: (prev.deliveryZones || []).map((zone, zoneIndex) => zoneIndex === index ? { ...zone, ...updates } : zone) }));

  const handleLogoUpload = async (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      showAlert('Please choose a JPG, PNG, WEBP, or GIF image under 5MB.', 'error');
      return;
    }
    try {
      const optimizedImage = await optimizeUploadedImage(file);
      setLogoPreview(optimizedImage);
      update('storeLogo', optimizedImage);
      showAlert('Logo selected - save settings to apply', 'info');
    } catch {
      showAlert('The image could not be processed. Please try another file.', 'error');
    }
  };

  const handleHeroImageUpload = async (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      showAlert('Please choose a JPG, PNG, WEBP, or GIF image under 5MB.', 'error');
      return;
    }
    try {
      const optimizedImage = await optimizeUploadedImage(file);
      setHeroImagePreview(optimizedImage);
      update('heroImage', optimizedImage);
      showAlert('Hero image selected - save settings to apply', 'info');
    } catch {
      showAlert('The image could not be processed. Please try another file.', 'error');
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await store.updateStoreSettings(form);
      showAlert('Settings saved and live on your website', 'success');
    } catch (error) {
      showAlert('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle switch component
  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
        checked ? 'bg-[#1E1719]' : 'bg-stone-300'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Manage"
        title="Settings"
        description="Control what customers see on your website."
      />

      <form onSubmit={save} className="space-y-5 pb-32">
        {/* STORE LOGO */}
        <div className="rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] p-6">
          <h2 className="font-bold text-stone-900 dark:text-stone-100 mb-1">Store logo</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">Upload your store's logo image. Appears everywhere on website and admin.</p>
          <div className="flex items-start gap-6">
            {/* Logo Preview */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-stone-300 dark:border-[#2e2428] bg-stone-50 dark:bg-[#2a2024] flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="text-center">
                    <div className="text-2xl">📸</div>
                    <p className="text-xs text-stone-400 mt-1">No logo</p>
                  </div>
                )}
              </div>
            </div>
            {/* Upload */}
            <div className="flex-1">
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file);
                  }}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E1719] text-white rounded-lg font-medium text-sm hover:bg-[#33282C] transition-colors cursor-pointer">
                  <Plus className="w-4 h-4" />
                  Choose image
                </span>
              </label>
              <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                PNG, JPG, GIF up to 5MB. Square images work best (1:1).
              </p>
              {logoPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setLogoPreview('');
                    update('storeLogo', '');
                  }}
                  className="mt-3 text-xs text-red-600 dark:text-red-400 hover:underline font-medium"
                >
                  Remove logo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* BANNER ANNOUNCEMENT */}
        <div className={`rounded-2xl border-2 p-6 ${
          form.announcementVisible
            ? 'border-[#B27A52]/30 bg-[#B27A52]/5 dark:border-[#B27A52]/20 dark:bg-[#B27A52]/10'
            : 'border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a]'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-900 dark:text-stone-100">Top announcement</h3>
                <Toggle checked={form.announcementVisible} onChange={v => update('announcementVisible', v)} />
              </div>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                {form.announcementVisible ? 'Showing on your website' : 'Hidden from customers'}
              </p>
              {form.announcementVisible && form.announcementText && (
                <div className="mt-3 rounded-lg bg-[#B27A52] px-3 py-2 text-xs font-semibold text-white">
                  {form.announcementText}
                </div>
              )}
            </div>
          </div>
          <label className="mt-4 block text-xs font-bold text-stone-600 dark:text-stone-400">
            Message
            <input
              className={`${inputClass} mt-2`}
              value={form.announcementText}
              onChange={e => update('announcementText', e.target.value)}
              placeholder="e.g., Free delivery on orders over GHS 100"
            />
          </label>
        </div>

        {/* STORE BRANDING */}
        <section className="rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] p-6">
          <h2 className="font-bold text-stone-900 dark:text-stone-100">Store branding</h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">How your store appears to customers</p>
          <div className="mt-4 space-y-4">
            <label className="block text-xs font-bold text-stone-600 dark:text-stone-400">
              Store name
              <input className={`${inputClass} mt-2`} value={form.storeName} onChange={e => update('storeName', e.target.value)} />
            </label>
            <label className="block text-xs font-bold text-stone-600 dark:text-stone-400">
              Tagline
              <input className={`${inputClass} mt-2`} value={form.storeTagline} onChange={e => update('storeTagline', e.target.value)} placeholder="Short description of your store" />
            </label>
          </div>
        </section>

        {/* HOMEPAGE */}
        <section className="rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] p-6">
          <h2 className="font-bold text-stone-900 dark:text-stone-100">Homepage</h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Main welcome message customers see</p>
          <div className="mt-4 space-y-4">
            <label className="block text-xs font-bold text-stone-600 dark:text-stone-400">
              Main headline
              <input className={`${inputClass} mt-2`} value={form.heroHeadline} onChange={e => update('heroHeadline', e.target.value)} placeholder="Beauty, care, and everyday essentials." />
            </label>
            <label className="block text-xs font-bold text-stone-600 dark:text-stone-400">
              Description
              <textarea className={`${inputClass} mt-2 min-h-24`} value={form.heroSubtitle} onChange={e => update('heroSubtitle', e.target.value)} placeholder="A few sentences about your store..." />
            </label>
            <div className="border-t border-stone-100 pt-4 dark:border-[#2e2428]">
              <label className="block text-xs font-bold text-stone-600 dark:text-stone-400">Hero image</label>
              <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="h-32 w-full overflow-hidden rounded-xl border border-dashed border-stone-300 bg-stone-50 dark:border-[#2e2428] dark:bg-[#2a2024] sm:w-48">
                  {heroImagePreview ? <img src={heroImagePreview} alt="Hero preview" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-stone-400">No hero image</div>}
                </div>
                <div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#1E1719] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#33282C]">
                    <Plus className="h-4 w-4" />
                    Choose image
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={event => { const file = event.target.files?.[0]; if (file) handleHeroImageUpload(file); }} />
                  </label>
                  <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">JPG, PNG, WEBP, or GIF up to 5MB. Landscape images work best.</p>
                  {heroImagePreview && <button type="button" onClick={() => { setHeroImagePreview(''); update('heroImage', ''); }} className="mt-3 text-xs font-medium text-red-600 hover:underline dark:text-red-400">Remove hero image</button>}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DELIVERY & CONTACT */}
        <section className="rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] p-6">
          <h2 className="font-bold text-stone-900 dark:text-stone-100">Delivery &amp; contact</h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">How customers reach you and get orders</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400">
              Phone
              <input className={`${inputClass} mt-2`} value={form.storePhone} onChange={e => update('storePhone', e.target.value)} placeholder="+233 24 123 4567" />
            </label>
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400">
              Email
              <input className={`${inputClass} mt-2`} type="email" value={form.storeEmail} onChange={e => update('storeEmail', e.target.value)} />
            </label>
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400 sm:col-span-2">
              Address
              <input className={`${inputClass} mt-2`} value={form.storeAddress} onChange={e => update('storeAddress', e.target.value)} />
            </label>
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400">
              Hours
              <input className={`${inputClass} mt-2`} value={form.storeHours} onChange={e => update('storeHours', e.target.value)} placeholder="9am - 6pm daily" />
            </label>
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400">
              WhatsApp
              <input className={`${inputClass} mt-2`} value={form.whatsappNumber} onChange={e => update('whatsappNumber', e.target.value)} placeholder="+233 24 123 4567" />
            </label>
          </div>
        </section>

        {/* PRODUCT PAGE MARKETPLACE CONTENT */}
        <section className="rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] p-6">
          <h2 className="font-bold text-stone-900 dark:text-stone-100">Product page marketplace content</h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">These messages appear on product pages. Leave any field empty to remove it.</p>
          <div className="mt-4 space-y-4">
            <label className="block text-xs font-bold text-stone-600 dark:text-stone-400">
              Delivery message
              <input className={`${inputClass} mt-2`} value={form.productDeliveryMessage || ''} onChange={e => update('productDeliveryMessage', e.target.value)} placeholder="e.g. Delivery available across Accra" />
            </label>
            <label className="block text-xs font-bold text-stone-600 dark:text-stone-400">
              Checkout or seller message
              <input className={`${inputClass} mt-2`} value={form.productProtectionMessage || ''} onChange={e => update('productProtectionMessage', e.target.value)} placeholder="e.g. Secure checkout with verified payment" />
            </label>
            <label className="block text-xs font-bold text-stone-600 dark:text-stone-400">
              Returns message
              <input className={`${inputClass} mt-2`} value={form.productReturnsMessage || ''} onChange={e => update('productReturnsMessage', e.target.value)} placeholder="e.g. Returns accepted according to store policy" />
            </label>
            <label className="block text-xs font-bold text-stone-600 dark:text-stone-400">
              Shipping details
              <textarea className={`${inputClass} mt-2 min-h-20`} value={form.productShippingMessage || ''} onChange={e => update('productShippingMessage', e.target.value)} placeholder="Explain delivery areas, timing, pickup, or conditions." />
            </label>
          </div>
        </section>

        {/* HOMEPAGE SECTIONS */}
        <section className="rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] p-6">
          <h2 className="font-bold text-stone-900 dark:text-stone-100">Homepage sections</h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Show or hide areas of your homepage</p>
          <div className="mt-4 space-y-2">
            {([
              ['flashDeal', 'Flash deal banner'],
              ['hero', 'Welcome section'],
              ['categories', 'Category navigation'],
              ['hotDeals', 'Hot deals'],
              ['newArrivals', 'New products'],
              ['beauty', 'Beauty section'],
              ['groceryFeed', 'Essentials section'],
            ] as const).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2.5">
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">{label}</span>
                <Toggle checked={form.homepageSections[key]} onChange={v => updateNested('homepageSections', key, v)} />
              </div>
            ))}
          </div>
        </section>

        {/* CUSTOMER PAGES */}
        <section className="rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] p-6">
          <h2 className="font-bold text-stone-900 dark:text-stone-100">Customer pages</h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Control which pages customers can access</p>
          <div className="mt-4 space-y-2">
            {([
              ['shop', 'Shop page'],
              ['products', 'Product detail pages'],
              ['checkout', 'Checkout'],
              ['account', 'Customer accounts'],
              ['about', 'About page'],
              ['support', 'Help &amp; support'],
            ] as const).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2.5">
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">{label}</span>
                <Toggle checked={form.pageVisibility[key]} onChange={v => updateNested('pageVisibility', key, v)} />
              </div>
            ))}
          </div>
        </section>

        {/* WEBSITE STATUS */}
        <section className="rounded-2xl border border-orange-200 dark:border-orange-900/40 bg-orange-50 dark:bg-orange-950/20 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-bold text-orange-900 dark:text-orange-300">Website status</h2>
              <p className="mt-1 text-xs text-orange-800 dark:text-orange-400">
                {form.maintenanceMode ? 'Website is closed to customers' : 'Website is live and accepting orders'}
              </p>
            </div>
            <Toggle checked={form.maintenanceMode} onChange={v => update('maintenanceMode', v)} />
          </div>
        </section>

        {/* SAVE BUTTON */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#1a1515] px-4 py-4 sm:px-6">
          <button
            type="submit"
            disabled={isSaving}
            className={`w-full rounded-xl px-6 py-3 font-bold transition ${
              isSaving
                ? 'bg-stone-300 text-stone-600 cursor-not-allowed'
                : 'bg-[#1E1719] text-white hover:bg-[#33282C]'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save all settings'}
            </div>
          </button>
          <p className="mt-2 text-center text-xs text-stone-500">Changes appear instantly on your website</p>
        </div>
      </form>
    </div>
  );
}

// ─── Notifications Screen ─────────────────────────────────────────────────────

export function AdminNotificationsScreen({ notifications = [] }: { notifications?: AdminNotification[] }) {
  const store = useStore();
  const { showAlert } = useAlert();
  const [filter, setFilter] = useState<'all' | AdminNotification['type']>('all');
  const [reviewed, setReviewed] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('cr_admin_reviewed_notifications') || '[]');
    } catch {
      return [];
    }
  });

  const generated = useMemo<AdminNotification[]>(() => {
    const result: AdminNotification[] = [];

    const low = store.products.filter(p => p.stockCount <= 5);
    if (low.length) {
      result.push({
        id: 'low-stock',
        type: 'inventory',
        title: `${low.length} products need attention`,
        message: `${low.filter(p => p.stockCount === 0).length} are out of stock and should be replenished.`,
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    const pending = store.orders.filter(o => o.status !== 'Delivered');
    if (pending.length) {
      result.push({
        id: 'pending-orders',
        type: 'order',
        title: `${pending.length} orders in progress`,
        message: 'Review fulfillment status and delivery handoffs.',
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    return [...notifications, ...result];
  }, [notifications, store.products, store.orders]);

  const visible = generated
    .filter(item => filter === 'all' || item.type === filter)
    .filter(item => !reviewed.includes(item.id));

  const unread = generated.filter(item => !reviewed.includes(item.id)).length;

  const markAll = () => {
    const nextReviewed = generated.map(item => item.id);
    setReviewed(nextReviewed);
    localStorage.setItem('cr_admin_reviewed_notifications', JSON.stringify(nextReviewed));
    showAlert('All visible alerts reviewed', 'success');
  };

  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Manage"
        title="Alerts"
        description="See stock and order issues that need attention."
        action={
          <button className={mutedButton} onClick={markAll}>
            <Check className="h-4 w-4" />
            Mark all done ({unread})
          </button>
        }
      />

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'order', 'inventory', 'customer', 'system'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize transition-colors ${
              filter === type
                ? 'bg-[#1E1719] text-white'
                : 'border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-[#2a2024]'
            }`}
          >
            {type}{' '}
            {type === 'all'
              ? `(${unread})`
              : `(${generated.filter(item => item.type === type && !reviewed.includes(item.id)).length})`}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-3">
        {visible.map(item => (
          <div
            key={item.id}
            className="flex gap-4 rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] p-5"
          >
            {/* Icon */}
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                item.type === 'inventory'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                  : 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
              }`}
            >
              {item.type === 'inventory' ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <Clock3 className="h-5 w-5" />
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-stone-900 dark:text-stone-100">{item.title}</p>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{item.message}</p>
              <p className="mt-2 text-xs text-stone-400 dark:text-stone-600">
                Updated {new Date(item.timestamp).toLocaleString()}
              </p>
            </div>

            {/* Actions */}
            <button
              className={mutedButton}
              onClick={() => setReviewed(prev => [...prev, item.id])}
            >
              Mark reviewed
            </button>
            <ChevronRight className="h-5 w-5 text-stone-300 dark:text-stone-600 self-center flex-shrink-0" />
          </div>
        ))}

        {visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-300 dark:border-[#2e2428] p-12 text-center">
            <Check className="mx-auto h-8 w-8 text-emerald-600" />
            <p className="mt-3 font-bold text-stone-900 dark:text-stone-100">All clear</p>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              There is nothing to review here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
