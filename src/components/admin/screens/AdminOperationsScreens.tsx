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

export function AdminInventoryScreen() {
  const store = useStore();
  const { showAlert } = useAlert();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(0);

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
    await store.updateProductStock(selected.id, Math.max(0, quantity));
    showAlert(`${selected.name} stock updated`, 'success');
    setSelected(null);
  };

  const stockBadge = (count: number) => {
    if (count === 0) return 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400';
    if (count <= 5)  return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400';
  };

  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Stock control"
        title="Inventory"
        description="Keep quantities accurate, identify risk early, and update the live catalog without leaving the operations desk."
        action={
          <button className={mutedButton} onClick={() => setQuery('')}>
            <Package className="h-4 w-4" />
            {store.products.length} SKUs
          </button>
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
                }}
              >
                <Edit3 className="h-4 w-4" />
                Adjust
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
            <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              New quantity
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
      const apiUsers = await api.get<any[]>('/users?admin=true');
      if (Array.isArray(apiUsers)) {
        apiUsers.forEach(u => {
          const key = u.email?.trim().toLowerCase() || u.phone?.trim() || u.id;
          const existing = customerMap.get(key);
          if (existing) {
            existing.id = u.id || existing.id;
            existing.fullName = u.fullName || existing.fullName;
            existing.status = u.isActive === false ? 'Blocked' : existing.status;
          } else {
            const id = u.id || 'cust-' + Date.now();
            const isBlocked = u.isActive === false || localStorage.getItem(`cr_customer_blocked_${id}`) === 'true';
            customerMap.set(key, {
              id,
              fullName: u.fullName || 'Registered User',
              email: u.email || '',
              phone: u.phone || '',
              ordersCount: 0,
              totalSpent: 0,
              segment: 'New',
              status: isBlocked ? 'Blocked' : 'Active',
              addresses: u.savedAddresses || [],
              notes: localStorage.getItem(`cr_customer_notes_${id}`) || '',
              createdAt: u.createdAt || new Date().toISOString(),
            });
          }
        });
      }
    } catch {
      // Backend users offline — seamlessly fallback to order-derived customers
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
        eyebrow="Customer relations"
        title="Customers"
        description="Comprehensive customer database automatically built from orders and account registrations."
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
              }?text=${encodeURIComponent(`Hello ${customer.fullName}, this is CR Cosmetics & Essentials.`)}`;

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
        eyebrow="Campaign tools"
        title="Promotions"
        description="Create and control discount codes that customers can use at checkout."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Create Form */}
        <form onSubmit={add} className="space-y-4 rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] p-5">
          <h2 className="font-bold text-stone-900 dark:text-stone-100">Create a code</h2>
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
    };

    if (editing) {
      await store.updateFlashDeal(editing.id, data);
    } else {
      await store.addFlashDeal(data);
    }
    showAlert(editing ? 'Flash deal updated' : 'Flash deal created', 'success');
    setEditing(null);
    setForm({ title: '', subtitle: '', description: '', discountPercentage: 20, expiresAt: '' });
  };

  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Merchandising"
        title="Flash deals"
        description="Control limited-time offers shown on the storefront, with one clear active state at a time."
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
            {editing ? 'Edit deal' : 'New flash deal'}
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

  const update = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await store.updateStoreSettings(form);
    showAlert('Store settings saved', 'success');
  };

  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Store configuration"
        title="Settings"
        description="Keep the storefront identity, delivery pricing, contact details, and operational mode in one place."
      />

      <form onSubmit={save} className="space-y-6">
        {/* Store Identity */}
        <section className="rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] p-5">
          <h2 className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
            <Settings2 className="h-4 w-4 text-[#B27A52]" />
            Store identity
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400">
              Store name
              <input
                className={`${inputClass} mt-2`}
                value={form.storeName}
                onChange={e => update('storeName', e.target.value)}
              />
            </label>
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400">
              Tagline
              <input
                className={`${inputClass} mt-2`}
                value={form.storeTagline}
                onChange={e => update('storeTagline', e.target.value)}
              />
            </label>
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400 md:col-span-2">
              Announcement
              <input
                className={`${inputClass} mt-2`}
                value={form.announcementText}
                onChange={e => update('announcementText', e.target.value)}
              />
            </label>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
            <input
              type="checkbox"
              checked={form.announcementVisible}
              onChange={e => update('announcementVisible', e.target.checked)}
            />
            Show announcement bar
          </label>
        </section>

        {/* Delivery & Contact */}
        <section className="rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] p-5">
          <h2 className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
            <Truck className="h-4 w-4 text-[#B27A52]" />
            Delivery and contact
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {(
              [
                ['standardShippingFee', 'Standard delivery fee'],
                ['expressShippingFee', 'Express delivery fee'],
                ['intercityShippingFee', 'Intercity delivery fee'],
                ['freeDeliveryThreshold', 'Free delivery threshold'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="text-xs font-bold text-stone-600 dark:text-stone-400">
                {label}
                <input
                  className={`${inputClass} mt-2`}
                  type="number"
                  min="0"
                  value={form[key]}
                  onChange={e => update(key, Number(e.target.value))}
                />
              </label>
            ))}
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400">
              Phone
              <input
                className={`${inputClass} mt-2`}
                value={form.storePhone}
                onChange={e => update('storePhone', e.target.value)}
              />
            </label>
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400">
              Email
              <input
                className={`${inputClass} mt-2`}
                type="email"
                value={form.storeEmail}
                onChange={e => update('storeEmail', e.target.value)}
              />
            </label>
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400 md:col-span-2">
              Address
              <input
                className={`${inputClass} mt-2`}
                value={form.storeAddress}
                onChange={e => update('storeAddress', e.target.value)}
              />
            </label>
          </div>
        </section>

        {/* Operational Mode */}
        <section className="rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-5">
          <h2 className="flex items-center gap-2 font-bold text-red-900 dark:text-red-300">
            <ShieldCheck className="h-4 w-4" />
            Operational mode
          </h2>
          <label className="mt-3 flex items-center gap-2 text-sm text-red-900 dark:text-red-300">
            <input
              type="checkbox"
              checked={form.maintenanceMode}
              onChange={e => update('maintenanceMode', e.target.checked)}
            />
            Put the customer storefront in maintenance mode
          </label>
        </section>

        <button className={buttonClass}>
          <Save className="h-4 w-4" />
          Save all settings
        </button>
      </form>
    </div>
  );
}

// ─── Notifications Screen ─────────────────────────────────────────────────────

export function AdminNotificationsScreen({ notifications = [] }: { notifications?: AdminNotification[] }) {
  const store = useStore();
  const { showAlert } = useAlert();
  const [filter, setFilter] = useState<'all' | AdminNotification['type']>('all');
  const [reviewed, setReviewed] = useState<string[]>([]);

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
    setReviewed(generated.map(item => item.id));
    showAlert('All visible alerts reviewed', 'success');
  };

  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Operations inbox"
        title="Alerts & messages"
        description="A focused view of live exceptions that need a decision from the store team."
        action={
          <button className={mutedButton} onClick={markAll}>
            <Check className="h-4 w-4" />
            Review all ({unread})
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
              There are no unreviewed alerts in this view.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
