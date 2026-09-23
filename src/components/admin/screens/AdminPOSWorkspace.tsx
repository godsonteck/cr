import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Banknote,
  Barcode,
  Check,
  ChevronDown,
  Minus,
  PackageOpen,
  Plus,
  Printer,
  ReceiptText,
  RefreshCw,
  Search,
  ShoppingBag,
  Smartphone,
  Trash2,
  UserRound,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useAlert } from '../../../context/AlertContext';
import { api, ApiError } from '../../../lib/api';
import type { FlashDeal, Order, PaymentMethod, Product, ProductVariant } from '../../../types';

type PosLine = { product: Product; variant?: ProductVariant; quantity: number };
type PosItem = { product: Product; variant?: ProductVariant; title: string; stock: number; barcode?: string };
type PaymentChoice = 'cash-on-delivery' | 'momo-mtn';
type PosShift = { id: string; deviceId: string; cashierName: string; status: 'OPEN' | 'CLOSED'; openingCash: number; expectedCash: number | null; actualCash: number | null; difference: number | null; openedAt: string; closedAt: string | null; notes?: string | null };
type PosCustomer = { id: string; fullName: string; email: string; phone: string; loyaltyPoints?: number; savedAddresses?: Array<{ fullName: string; phone: string; email?: string; city: string; area: string; landmarkOrGps?: string; deliveryNotes?: string; isDefault?: boolean }> };

const currency = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' });
const lineKey = (line: PosLine | PosItem) => `${line.product.id}:${line.variant?.id || 'base'}`;

function money(value: number) {
  return currency.format(Number.isFinite(value) ? value : 0);
}

function escapeReceipt(value: string) {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] || character));
}

const browserQueueKey = 'cr_pos_pending_sales';
function readBrowserQueue(): DesktopQueuedSale[] {
  try { return JSON.parse(localStorage.getItem(browserQueueKey) || '[]') as DesktopQueuedSale[]; } catch { return []; }
}
function writeBrowserQueue(queue: DesktopQueuedSale[]) {
  localStorage.setItem(browserQueueKey, JSON.stringify(queue));
}

export function AdminPOSWorkspace() {
  const { products, loading, fetchProducts, fetchOrders, orders, loadingOrders, storeSettings, adminSession, logoutAdmin } = useStore();
  const { showAlert } = useAlert();
  const scannerRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [cart, setCart] = useState<PosLine[]>([]);
  const [payment, setPayment] = useState<PaymentChoice>('cash-on-delivery');
  const [customer, setCustomer] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<PosCustomer | null>(null);
  const [customerMatches, setCustomerMatches] = useState<PosCustomer[]>([]);
  const [scannerValue, setScannerValue] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [reference, setReference] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [activeDeal, setActiveDeal] = useState<FlashDeal | null>(null);
  const [cachedProducts, setCachedProducts] = useState<Product[]>([]);
  const [syncState, setSyncState] = useState<{ pending: number; conflicts: DesktopQueuedSale[] }>({ pending: 0, conflicts: [] });
  const [submitting, setSubmitting] = useState(false);
  const [online, setOnline] = useState(() => navigator.onLine);
  const [saleKey, setSaleKey] = useState(() => `POS-${crypto.randomUUID()}`);
  const [deviceId, setDeviceId] = useState(() => {
    const key = 'cr_pos_browser_device_id';
    try {
      const saved = localStorage.getItem(key);
      if (saved) return saved;
      const created = `browser-${crypto.randomUUID()}`;
      localStorage.setItem(key, created);
      return created;
    } catch {
      return 'browser-pos';
    }
  });
  const [shift, setShift] = useState<PosShift | null>(null);
  const [openingCash, setOpeningCash] = useState('');
  const [actualCash, setActualCash] = useState('');
  const [shiftNotes, setShiftNotes] = useState('');
  const [shiftBusy, setShiftBusy] = useState(false);

  const loadShift = useCallback(async (currentDeviceId = deviceId) => {
    if (!navigator.onLine) return;
    try {
      const result = await api.get<{ shift: PosShift | null }>(`/pos-shifts?deviceId=${encodeURIComponent(currentDeviceId)}`);
      setShift(result.shift);
    } catch {
      setShift(null);
    }
  }, [deviceId]);

  const openShift = async () => {
    const amount = Number(openingCash);
    if (!Number.isFinite(amount) || amount < 0) {
      showAlert('Enter the opening cash float before opening the shift.', 'warning');
      return;
    }
    setShiftBusy(true);
    try {
      const result = await api.post<{ shift: PosShift }>('/pos-shifts?action=open', { deviceId, openingCash: amount });
      setShift(result.shift);
      setOpeningCash('');
      showAlert('Cashier shift opened.', 'success');
    } catch (error: any) {
      if (error?.data?.shift) setShift(error.data.shift);
      showAlert(error?.data?.error || error?.message || 'Could not open cashier shift.', 'error');
    } finally {
      setShiftBusy(false);
    }
  };

  const closeShift = async () => {
    if (!shift) return;
    const amount = Number(actualCash);
    if (!Number.isFinite(amount) || amount < 0) {
      showAlert('Enter the counted cash before closing the shift.', 'warning');
      return;
    }
    setShiftBusy(true);
    try {
      const result = await api.post<{ shift: PosShift }>('/pos-shifts?action=close', { shiftId: shift.id, actualCash: amount, notes: shiftNotes.trim() || undefined });
      setShift(result.shift);
      setActualCash('');
      setShiftNotes('');
      showAlert(`Shift closed. Cash variance: ${money(Number(result.shift.difference || 0))}.`, Number(result.shift.difference || 0) === 0 ? 'success' : 'warning');
    } catch (error: any) {
      showAlert(error?.data?.error || error?.message || 'Could not close cashier shift.', 'error');
    } finally {
      setShiftBusy(false);
    }
  };

  const switchCashier = async () => {
    if (shift?.status === 'OPEN') {
      showAlert('Close the active cash drawer before switching cashier.', 'warning');
      return;
    }
    await logoutAdmin();
  };

  const syncQueuedSales = useCallback(async () => {
    const desktop = window.crDesktop?.pos;
    if (!navigator.onLine) return;
    const pending = desktop ? await desktop.sales.pending() : readBrowserQueue();
    for (const sale of pending.filter(item => item.status !== 'SYNC_CONFLICT')) {
      try {
        await api.post('/orders?channel=pos', sale.payload);
        if (desktop) await desktop.sales.markSync({ idempotencyKey: sale.idempotencyKey, status: 'SYNCED' });
        else writeBrowserQueue(readBrowserQueue().filter(item => item.idempotencyKey !== sale.idempotencyKey));
      } catch (error) {
        const status = error instanceof ApiError && error.status === 409 ? 'SYNC_CONFLICT' : 'SYNC_FAILED';
        if (desktop) await desktop.sales.markSync({ idempotencyKey: sale.idempotencyKey, status, error: error instanceof Error ? error.message : 'Could not synchronize sale' });
        else writeBrowserQueue(readBrowserQueue().map(item => item.idempotencyKey === sale.idempotencyKey ? { ...item, status, attempts: item.attempts + 1, last_error: error instanceof Error ? error.message : 'Could not synchronize sale' } : item));
        if (status === 'SYNC_FAILED') break;
      }
    }
    const remaining = desktop ? await desktop.sales.pending() : readBrowserQueue();
    setSyncState({ pending: remaining.filter(item => item.status !== 'SYNC_CONFLICT').length, conflicts: remaining.filter(item => item.status === 'SYNC_CONFLICT') });
    if (pending.length !== remaining.length) {
      await Promise.all([
        fetchProducts({ includeUnpublished: true }),
        fetchOrders(),
      ]);
    }
  }, [fetchOrders, fetchProducts]);

  useEffect(() => {
    let active = true;
    const loadCatalogue = async () => {
      const desktop = window.crDesktop?.pos;
      if (desktop) {
        try {
          const status = await desktop.status();
          if (status.deviceId) setDeviceId(status.deviceId);
        } catch {}
      }
      try {
        await fetchProducts({ includeUnpublished: true });
      } catch {
        if (desktop && active) setCachedProducts(await desktop.catalog.get());
      }
      if (navigator.onLine) void syncQueuedSales();
      void fetchOrders();
      void loadShift();
    };
    void loadCatalogue();
    void api.get<FlashDeal[]>('/flash-deals').then(deals => setActiveDeal(deals[0] || null)).catch(() => setActiveDeal(null));
    scannerRef.current?.focus();
    const handleOnline = () => { setOnline(true); void loadCatalogue(); };
    const handleOffline = () => setOnline(false);
    const syncTimer = window.setInterval(() => { void syncQueuedSales(); }, 15000);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.clearInterval(syncTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchOrders, fetchProducts, loadShift, syncQueuedSales]);

  useEffect(() => {
    void loadShift(deviceId);
  }, [deviceId, loadShift]);

  useEffect(() => {
    const query = customer.trim();
    if (selectedCustomer || query.length < 2) {
      setCustomerMatches([]);
      return;
    }
    const timer = window.setTimeout(() => {
      void api.get<PosCustomer[]>(`/users?admin=true&search=${encodeURIComponent(query)}`)
        .then(matches => setCustomerMatches(Array.isArray(matches) ? matches.slice(0, 5) : []))
        .catch(() => setCustomerMatches([]));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [customer, selectedCustomer]);

  useEffect(() => {
    if (window.crDesktop?.pos && products.length) void window.crDesktop.pos.catalog.cache(products);
  }, [products]);

  const posProducts = products.length ? products : cachedProducts;
  const items = useMemo<PosItem[]>(() => posProducts.flatMap(product => {
    if (product.isPublished === false) return [];
    if (product.variants?.length) {
      return product.variants
        .filter(variant => variant.inStock && Number(variant.stockCount) > 0)
        .map(variant => ({ product, variant, title: `${product.name} - ${variant.name}`, stock: Number(variant.stockCount), barcode: variant.barcode }));
    }
    return product.inStock && Number(product.stockCount) > 0
      ? [{ product, title: product.name, stock: Number(product.stockCount), barcode: product.barcode }]
      : [];
  }), [posProducts]);

  const categories = useMemo(() => Array.from(new Set(items.map(item => item.product.categoryLabel || item.product.category))).sort(), [items]);
  const filteredItems = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return items.filter(item => {
      const itemCategory = item.product.categoryLabel || item.product.category;
      const matchesCategory = category === 'all' || itemCategory === category;
      const searchable = [item.title, item.product.brand, item.product.id, item.variant?.id, item.barcode].filter(Boolean).join(' ').toLowerCase();
      return matchesCategory && (!needle || searchable.includes(needle));
    });
  }, [items, search, category]);

  const priceFor = (line: PosLine) => {
    const price = Number(line.variant?.price ?? line.product.price);
    return activeDeal?.productIds?.includes(line.product.id)
      ? Math.max(0.01, price * (1 - activeDeal.discountPercentage / 100))
      : price;
  };
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cart.reduce((sum, line) => sum + priceFor(line) * line.quantity, 0);
  const received = Number(cashReceived);
  const change = payment === 'cash-on-delivery' && Number.isFinite(received) ? Math.max(0, received - subtotal) : 0;
  const selectedAddress = selectedCustomer?.savedAddresses?.find(address => address.isDefault) || selectedCustomer?.savedAddresses?.[0];

  const addToCart = (item: PosItem) => {
    setCart(previous => {
      const key = lineKey(item);
      const current = previous.find(line => lineKey(line) === key);
      if (current && current.quantity >= item.stock) {
        showAlert('That item is already at its available stock limit.', 'warning');
        return previous;
      }
      return current
        ? previous.map(line => lineKey(line) === key ? { ...line, quantity: line.quantity + 1 } : line)
        : [...previous, { product: item.product, variant: item.variant, quantity: 1 }];
    });
  };

  const updateLine = (line: PosLine, quantity: number) => {
    const max = Number(line.variant?.stockCount ?? line.product.stockCount);
    setCart(previous => quantity <= 0
      ? previous.filter(item => lineKey(item) !== lineKey(line))
      : previous.map(item => lineKey(item) === lineKey(line) ? { ...item, quantity: Math.min(quantity, max) } : item));
  };

  const scanItem = async () => {
    const value = scannerValue.trim().toLowerCase();
    if (!value) return;
    const local = items.find(item => [item.product.id, item.product.name, item.variant?.id, item.variant?.name, item.barcode].filter(Boolean).some(candidate => String(candidate).toLowerCase() === value));
    if (local) addToCart(local);
    else {
      try {
        const result = await api.get<{ products: Product[] }>(`/products?scanCode=${encodeURIComponent(scannerValue.trim())}&limit=1`);
        const product = result.products?.[0];
        const variant = product?.variants?.find(item => [item.id, item.name, item.barcode, item.serialNumber].filter(Boolean).some(candidate => String(candidate).toLowerCase() === value));
        if (product && variant) addToCart({ product, variant, title: `${product.name} - ${variant.name}`, stock: Number(variant.stockCount), barcode: variant.barcode });
        else if (product && product.variants?.length) showAlert('Choose a variation before adding this product.', 'warning');
        else if (product) addToCart({ product, title: product.name, stock: Number(product.stockCount), barcode: product.barcode });
        else showAlert('No product matched that code.', 'warning');
      } catch {
        showAlert('Could not search the catalogue right now.', 'error');
      }
    }
    setScannerValue('');
    scannerRef.current?.focus();
  };

  const printReceipt = (order: Order, existingWindow?: Window | null, tenderedCash?: number) => {
    const receipt = existingWindow || window.open('', '_blank');
    if (!receipt) return;
    const lines = order.items.map(item => {
      const unitPrice = Number(item.selectedVariant?.price ?? item.product.price);
      const variant = item.selectedVariant?.name ? ` - ${escapeReceipt(item.selectedVariant.name)}` : '';
      return `<tr><td>${escapeReceipt(item.product.name)}${variant}<small>${escapeReceipt(item.product.brand)} · ${item.quantity} x ${money(unitPrice)}</small></td><td>${money(unitPrice * item.quantity)}</td></tr>`;
    }).join('');
    const storeName = escapeReceipt(storeSettings.storeName || 'CR Cosmetics and Essentials');
    const paymentLabel = order.paymentMethod === 'cash-on-delivery' ? 'Cash' : order.paymentMethod === 'momo-mtn' ? 'MTN Mobile Money' : order.paymentMethod.replaceAll('-', ' ');
    const cashDetails = order.paymentMethod === 'cash-on-delivery' && tenderedCash != null
      ? `<p>Cash received: ${money(tenderedCash)} · Change: ${money(Math.max(0, tenderedCash - Number(order.total)))} </p>`
      : '';
    receipt.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Receipt ${escapeReceipt(order.orderNumber)}</title><style>body{font-family:Arial,sans-serif;max-width:380px;margin:24px auto;color:#201719}header{text-align:center;border-bottom:2px solid #201719;padding-bottom:14px}h1{font-size:20px;margin:0 0 6px}p{color:#655d5a;font-size:12px;margin:5px 0}table{width:100%;border-collapse:collapse;margin:18px 0}td{padding:10px 0;border-bottom:1px solid #ddd;font-size:13px}td:last-child{text-align:right;font-weight:bold}small{display:block;color:#655d5a;margin-top:3px}.summary{margin-top:14px;border-top:1px solid #ddd;padding-top:10px}.row{display:flex;justify-content:space-between;margin:5px 0}.total{font-size:18px;font-weight:bold;border-top:2px solid #201719;padding-top:12px;text-align:right}button{width:100%;padding:12px;background:#201719;color:#fff;border:0;font-weight:bold;margin-top:14px}@media print{button{display:none}}</style></head><body><header><h1>${storeName}</h1><p>${escapeReceipt(storeSettings.storeAddress || '')}</p><p>${escapeReceipt(storeSettings.storePhone || '')} · ${escapeReceipt(storeSettings.storeEmail || '')}</p><p>Sale receipt · ${escapeReceipt(order.orderNumber)}</p><p>${new Date(order.createdAt).toLocaleString()}</p></header><p>Customer: ${escapeReceipt(order.shippingAddress?.fullName || 'Walk-in customer')}</p><p>Phone: ${escapeReceipt(order.shippingAddress?.phone || 'In-store sale')}</p><table>${lines}</table><div class="summary"><div class="row"><span>Subtotal</span><b>${money(Number(order.subtotal))}</b></div>${Number(order.discount) > 0 ? `<div class="row"><span>Discount</span><b>-${money(Number(order.discount))}</b></div>` : ''}<div class="row"><span>Delivery</span><b>${money(Number(order.shippingFee))}</b></div><p class="total">Total: ${money(Number(order.total))}</p></div><p>Payment: ${escapeReceipt(paymentLabel)}${order.paymentReference ? ` · Ref: ${escapeReceipt(order.paymentReference)}` : ''}</p>${cashDetails}<p>Thank you for shopping with ${storeName}.</p><button onclick="window.print()">Print receipt</button></body></html>`);
    receipt.document.close();
  };

  const completeSale = async () => {
    if (!cart.length || submitting) return;
    if (payment === 'cash-on-delivery' && (!cashReceived || !Number.isFinite(received) || received < subtotal)) {
      showAlert('Cash received must cover the sale total.', 'warning');
      return;
    }
    if (payment !== 'cash-on-delivery' && !reference.trim()) {
      showAlert('Add the payment reference before completing the sale.', 'warning');
      return;
    }
    setSubmitting(true);
    const receiptWindow = window.open('', '_blank');
    let payload: Record<string, unknown> | null = null;
    try {
      payload = {
        orderSource: 'pos', idempotencyKey: saleKey, subtotal, shippingFee: 0, discount: 0, total: subtotal,
        paymentMethod: payment as PaymentMethod, paymentStatus: 'paid', deliveryMethod: 'store-pickup',
        paymentReference: reference.trim() || undefined, paymentSenderPhone: payment === 'momo-mtn' ? senderPhone.trim() : undefined,
        cashReceived: payment === 'cash-on-delivery' ? received : undefined,
        userId: selectedCustomer?.id,
        shippingAddress: selectedCustomer ? {
          fullName: selectedAddress?.fullName || selectedCustomer.fullName,
          phone: selectedAddress?.phone || selectedCustomer.phone,
          email: selectedAddress?.email || selectedCustomer.email,
          city: selectedAddress?.city || 'In-store',
          area: selectedAddress?.area || 'POS counter',
          landmarkOrGps: selectedAddress?.landmarkOrGps,
          deliveryNotes: selectedAddress?.deliveryNotes,
        } : { fullName: customer.trim() || 'Walk-in customer', phone: payment === 'momo-mtn' ? senderPhone.trim() : 'In-store sale', city: 'In-store', area: 'POS counter' },
        items: cart.map(line => ({
          product: { id: line.product.id, name: line.product.name, brand: line.product.brand, price: priceFor(line), originalPrice: line.variant?.originalPrice ?? line.product.originalPrice, image: line.variant?.image || line.product.image, unit: line.product.unit, category: line.product.category, inStock: true, stockCount: Number(line.variant?.stockCount ?? line.product.stockCount) },
          quantity: line.quantity,
          selectedVariant: line.variant ? { id: line.variant.id, name: line.variant.name, price: Number(line.variant.price), originalPrice: line.variant.originalPrice, inStock: true } : undefined,
        })),
      };
      const order = await api.post<Order>('/orders?channel=pos', payload);
      printReceipt(order, receiptWindow, payment === 'cash-on-delivery' ? received : undefined);
      showAlert(`Sale ${order.orderNumber} completed. Stock was updated.`, 'success');
      setCart([]); setCustomer(''); setSelectedCustomer(null); setCustomerMatches([]); setCashReceived(''); setReference(''); setSenderPhone(''); setSaleKey(`POS-${crypto.randomUUID()}`);
      await Promise.all([fetchProducts({ includeUnpublished: true }), fetchOrders()]);
    } catch (error: any) {
      receiptWindow?.close();
      const offline = !navigator.onLine || error instanceof TypeError || (error instanceof ApiError && error.status === 408);
      const desktop = window.crDesktop?.pos;
      if (offline && payload) {
        if (desktop) await desktop.sales.queue(payload);
        else {
          const queue = readBrowserQueue();
          writeBrowserQueue([...queue, { idempotencyKey: saleKey, payload, status: 'PENDING_SYNC', attempts: 0 }]);
        }
        const pending = desktop ? await desktop.sales.pending() : readBrowserQueue();
        setSyncState({ pending: pending.filter(item => item.status !== 'SYNC_CONFLICT').length, conflicts: pending.filter(item => item.status === 'SYNC_CONFLICT') });
        setCart([]); setCustomer(''); setSelectedCustomer(null); setCustomerMatches([]); setCashReceived(''); setReference(''); setSenderPhone(''); setSaleKey(`POS-${crypto.randomUUID()}`);
        showAlert('Sale saved on this terminal and will sync automatically when the connection returns.', 'warning');
      } else {
        showAlert(error?.data?.error || error?.message || 'Could not complete this sale.', 'error');
      }
    } finally {
      setSubmitting(false);
      scannerRef.current?.focus();
    }
  };

  const checkout = (
    <section className="sticky top-24 z-20 flex h-fit self-start overflow-visible flex-col rounded-[24px] border border-[#e8d9d2] bg-[#fffdfb] p-4 shadow-[0_18px_50px_rgba(36,25,27,0.08)] dark:border-[#3b2b2f] dark:bg-[#1e1719] sm:p-5">
      <div className="flex items-start justify-between gap-3 border-b border-[#eee2dc] pb-4 dark:border-[#3b2b2f]">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a85e35]">Checkout rail</p><h2 className="mt-1 text-xl font-bold">Current sale</h2><p className="mt-1 text-xs text-stone-500">{itemCount} item{itemCount === 1 ? '' : 's'} ready to settle</p></div>
        <div className="rounded-xl bg-[#f5ebe5] p-2.5 text-[#a85e35] dark:bg-[#342528]"><ShoppingBag className="h-5 w-5" /></div>
      </div>
      <div className="py-4 pr-1">
        {cart.length ? <div className="max-h-[30vh] space-y-2 overflow-y-auto pr-1">{cart.map(line => <div key={lineKey(line)} className="rounded-2xl border border-[#eee2dc] bg-white p-3 dark:border-[#3b2b2f] dark:bg-[#241b1d]"><div className="flex gap-3"><img src={line.variant?.image || line.product.image} alt="" className="h-12 w-12 rounded-xl object-cover" /><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><p className="truncate text-sm font-bold">{line.product.name}</p><button type="button" onClick={() => updateLine(line, 0)} aria-label={`Remove ${line.product.name}`} className="text-stone-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div>{line.variant && <p className="truncate text-xs text-[#a85e35]">{line.variant.name}</p>}<div className="mt-2 flex items-center justify-between"><span className="text-sm font-bold">{money(priceFor(line) * line.quantity)}</span><span className="flex items-center gap-2"><button type="button" onClick={() => updateLine(line, line.quantity - 1)} className="rounded-lg border border-stone-200 p-1 hover:bg-stone-100 dark:border-[#4a383d]"><Minus className="h-3.5 w-3.5" /></button><b className="min-w-4 text-center text-xs">{line.quantity}</b><button type="button" onClick={() => updateLine(line, line.quantity + 1)} className="rounded-lg border border-stone-200 p-1 hover:bg-stone-100 dark:border-[#4a383d]"><Plus className="h-3.5 w-3.5" /></button></span></div></div></div></div>)}</div> : <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-[#dbc9c0] bg-[#fff8f3] text-center dark:border-[#4a383d] dark:bg-[#241b1d]"><ReceiptText className="h-8 w-8 text-[#b9774c]" /><p className="mt-3 text-sm font-bold">Your ticket is empty</p><p className="mt-1 max-w-[220px] text-xs leading-5 text-stone-500">Tap a product tile or scan a barcode to start the sale.</p></div>}
        <div className="relative mt-4"><label className="flex items-center gap-2 text-xs font-bold"><UserRound className="h-4 w-4 text-[#a85e35]" />Customer account <span className="font-normal text-stone-400">optional</span></label><input value={customer} onChange={event => { setCustomer(event.target.value); setSelectedCustomer(null); }} placeholder="Search name, phone, or email" className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#b9774c] dark:border-[#4a383d] dark:bg-[#241b1d]" />{selectedCustomer && <p className="mt-1 text-[10px] font-bold text-emerald-700">Linked account: {selectedCustomer.email}</p>}{customerMatches.length > 0 && <div className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl dark:border-[#4a383d] dark:bg-[#241b1d]">{customerMatches.map(match => <button key={match.id} type="button" onClick={() => { setSelectedCustomer(match); setCustomer(match.fullName); setCustomerMatches([]); }} className="block w-full border-b border-stone-100 px-3 py-2 text-left text-xs hover:bg-[#f5ebe5] dark:border-[#3b2b2f] dark:hover:bg-[#342528]"><b className="block">{match.fullName}</b><span className="text-stone-500">{match.phone} · {match.email}</span></button>)}</div>}</div>
        <div className="mt-4"><p className="text-xs font-bold">Payment method</p><div className="mt-2 grid grid-cols-2 gap-2">{([{ id: 'cash-on-delivery', label: 'Cash', icon: Banknote }, { id: 'momo-mtn', label: 'MoMo', icon: Smartphone }] as const).map(option => <button key={option.id} type="button" onClick={() => setPayment(option.id)} className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-[11px] font-bold transition ${payment === option.id ? 'border-[#a85e35] bg-[#f5ebe5] text-[#8e4d2d] dark:bg-[#342528] dark:text-[#e6a47d]' : 'border-stone-200 text-stone-500 hover:border-[#b9774c] dark:border-[#4a383d]'}`}><option.icon className="h-4 w-4" />{option.label}</button>)}</div></div>
        {payment === 'cash-on-delivery' ? <div className="mt-3"><label className="text-xs font-bold">Cash received</label><input type="number" min="0" step="0.01" value={cashReceived} onChange={event => setCashReceived(event.target.value)} placeholder={money(subtotal)} className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-[#b9774c] dark:border-[#4a383d] dark:bg-[#241b1d]" /><div className="mt-2 flex justify-between text-xs"><span className="text-stone-500">Change</span><b className={change > 0 ? 'text-emerald-700' : 'text-stone-700 dark:text-stone-300'}>{money(change)}</b></div></div> : <div className="mt-3 space-y-2"><label className="text-xs font-bold">Payment reference<input value={reference} onChange={event => setReference(event.target.value)} placeholder="Required for reconciliation" className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#b9774c] dark:border-[#4a383d] dark:bg-[#241b1d]" /></label>{payment === 'momo-mtn' && <label className="text-xs font-bold">Sender phone<input value={senderPhone} onChange={event => setSenderPhone(event.target.value)} placeholder="024..." className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#b9774c] dark:border-[#4a383d] dark:bg-[#241b1d]" /></label>}</div>}
      </div>
      <div className="border-t border-[#eee2dc] pt-4 dark:border-[#3b2b2f]"><div className="flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Amount due</p><p className="mt-1 text-3xl font-black tracking-tight">{money(subtotal)}</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">Stock checked</span></div><button type="button" disabled={!cart.length || submitting} onClick={() => void completeSale()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#24191b] px-4 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#3b292c] disabled:cursor-not-allowed disabled:opacity-40">{submitting ? 'Posting sale...' : 'Complete sale'}<ArrowRight className="h-4 w-4" /></button><p className="mt-2 text-center text-[10px] text-stone-400">A receipt opens after the sale is posted.</p></div>
    </section>
  );

  const posHistory = (orders || []).filter(order => order.orderSource === 'pos').slice(0, 12);

  return <div className="min-h-[calc(100vh-2rem)] space-y-4">
    <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm dark:border-[#3b2b2f] dark:bg-[#1e1719]"><label className="relative min-w-0 flex-1"><Search className="absolute left-4 top-3.5 h-5 w-5 text-stone-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search products by name or barcode..." className="w-full rounded-xl bg-stone-50 py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#b9774c] dark:bg-[#241b1d]" /></label><div className="hidden items-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 lg:flex dark:border-[#3b2b2f]"><span className="text-lg text-[#249447]">★</span><span><b className="block text-sm">Loyalty</b><small className="text-xs text-stone-500">{selectedCustomer ? `${selectedCustomer.loyaltyPoints || 0} points · earns 1/GHS` : 'Link a customer account'}</small></span></div><div className="hidden items-center gap-3 rounded-xl border border-stone-200 px-4 py-2.5 lg:flex dark:border-[#3b2b2f]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-sm font-bold text-stone-500 dark:bg-[#342528]">{(adminSession.adminName || 'C').charAt(0).toUpperCase()}</span><span><b className="block text-sm">{adminSession.adminName || 'Cashier'}</b><small className="text-xs text-stone-500">{adminSession.adminRole} · {online ? 'Online' : 'Offline'}</small></span></div></div>
    {(syncState.pending > 0 || syncState.conflicts.length > 0) && <div className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${syncState.conflicts.length ? 'border-red-200 bg-red-50 text-red-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}><span><b>{syncState.conflicts.length ? `${syncState.conflicts.length} sale conflict${syncState.conflicts.length === 1 ? '' : 's'}` : `${syncState.pending} sale${syncState.pending === 1 ? '' : 's'} waiting to sync`}</b><span className="ml-2 text-xs opacity-80">{syncState.conflicts.length ? 'Review stock or pricing changes before retrying.' : 'The terminal will retry automatically.'}</span></span><button type="button" onClick={() => void syncQueuedSales()} className="rounded-lg border border-current px-3 py-1.5 text-xs font-bold">Retry sync</button></div>}
    <header className="flex flex-col gap-3 border-b border-stone-200 pb-4 dark:border-[#3b2b2f] sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a85e35]">Counter workspace</p><h1 className="mt-1 font-serif text-3xl font-bold tracking-tight">Point of Sale</h1><p className="mt-1 text-sm text-stone-500">Build the ticket, confirm payment, and move to the next customer.</p></div><div className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-2 text-xs font-bold sm:self-auto ${online ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300'}`}>{online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}{online ? 'Live inventory' : 'Offline mode'}</div></header>
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-[#3b2b2f] dark:bg-[#1e1719]"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a85e35]">Cash drawer</p><h2 className="mt-1 text-base font-bold">{shift?.status === 'OPEN' ? 'Shift open' : 'Open a cashier shift'}</h2><p className="mt-1 text-xs text-stone-500">{shift?.status === 'OPEN' ? `Opened ${new Date(shift.openedAt).toLocaleString()} with ${money(shift.openingCash)} float.` : 'Count the opening float before recording sales.'}</p></div>{shift?.status === 'OPEN' ? <div className="flex flex-col gap-2 sm:flex-row sm:items-end"><div><label className="block text-[10px] font-bold uppercase text-stone-500">Counted cash</label><input type="number" min="0" step="0.01" value={actualCash} onChange={event => setActualCash(event.target.value)} placeholder={shift.expectedCash == null ? '0.00' : money(shift.expectedCash)} className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-bold outline-none focus:border-[#b9774c] sm:w-36 dark:border-[#4a383d] dark:bg-[#241b1d]" /></div><div><label className="block text-[10px] font-bold uppercase text-stone-500">Note</label><input value={shiftNotes} onChange={event => setShiftNotes(event.target.value)} placeholder="Optional" className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-[#b9774c] sm:w-44 dark:border-[#4a383d] dark:bg-[#241b1d]" /></div><button type="button" onClick={() => void closeShift()} disabled={shiftBusy} className="rounded-xl bg-[#24191b] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">{shiftBusy ? 'Saving...' : 'Close shift'}</button></div> : <div className="flex flex-col gap-2 sm:flex-row sm:items-end"><div><label className="block text-[10px] font-bold uppercase text-stone-500">Opening float</label><input type="number" min="0" step="0.01" value={openingCash} onChange={event => setOpeningCash(event.target.value)} placeholder="0.00" className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-bold outline-none focus:border-[#b9774c] sm:w-36 dark:border-[#4a383d] dark:bg-[#241b1d]" /></div><button type="button" onClick={() => void openShift()} disabled={shiftBusy} className="rounded-xl bg-[#249447] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">{shiftBusy ? 'Opening...' : 'Open shift'}</button></div>}</div>{shift?.status === 'CLOSED' && <p className={`mt-3 text-xs font-bold ${Number(shift.difference || 0) === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>Last shift closed with {money(Number(shift.actualCash || 0))} counted against {money(Number(shift.expectedCash || 0))} expected. Variance: {money(Number(shift.difference || 0))}.</p>}</section>
    {shift?.status !== 'OPEN' && <div className="flex justify-end"><button type="button" onClick={() => void switchCashier()} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 dark:border-[#3b2b2f] dark:bg-[#1e1719] dark:text-stone-300 dark:hover:bg-[#241b1d]">Switch cashier</button></div>}
    <div className="grid grid-cols-[210px_minmax(0,1fr)_440px] items-stretch gap-6">
      <aside className="sticky top-24 self-start space-y-2 rounded-[24px] border border-[#e8d9d2] bg-[#fffdfb] p-3 shadow-[0_18px_50px_rgba(36,25,27,0.06)] dark:border-[#3b2b2f] dark:bg-[#1e1719]"><p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a85e35]">Browse</p><button type="button" onClick={() => setCategory('all')} className={`w-full rounded-2xl px-3 py-3 text-left text-sm font-bold transition ${category === 'all' ? 'bg-[#24191b] text-white' : 'text-stone-600 hover:bg-[#f5ebe5] dark:text-stone-300 dark:hover:bg-[#342528]'}`}><span className="block">All stock</span><span className={`mt-1 block text-[10px] font-medium ${category === 'all' ? 'text-stone-300' : 'text-stone-400'}`}>{items.length} available</span></button>{categories.map(item => <button type="button" key={item} onClick={() => setCategory(item)} className={`w-full rounded-2xl px-3 py-3 text-left text-sm font-bold transition ${category === item ? 'bg-[#f5ebe5] text-[#8e4d2d] ring-1 ring-[#d89b76] dark:bg-[#342528] dark:text-[#e6a47d]' : 'text-stone-600 hover:bg-[#f5ebe5] dark:text-stone-300 dark:hover:bg-[#342528]'}`}><span className="block truncate">{item}</span><span className="mt-1 block text-[10px] font-medium text-stone-400">Browse shelf</span></button>)}</aside>
      <section className="pos-workbench min-w-0 space-y-4">
        <div className="rounded-[24px] border border-[#e8d9d2] bg-[#fffdfb] p-4 shadow-[0_18px_50px_rgba(36,25,27,0.06)] dark:border-[#3b2b2f] dark:bg-[#1e1719] sm:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a85e35]">Find stock</p><h2 className="mt-1 text-lg font-bold">Build a ticket</h2></div><span className="text-xs font-semibold text-stone-500">{filteredItems.length} available</span></div><div className="mt-4 grid gap-2 md:grid-cols-[1.1fr_1fr]"><div className="flex gap-2"><label className="relative min-w-0 flex-1"><Barcode className="absolute left-3 top-3 h-5 w-5 text-stone-400" /><input ref={scannerRef} value={scannerValue} onChange={event => setScannerValue(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') void scanItem(); }} placeholder="Scan barcode or SKU" className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#b9774c] dark:border-[#4a383d] dark:bg-[#241b1d]" /></label><button type="button" onClick={() => void scanItem()} disabled={!scannerValue.trim()} className="rounded-xl bg-[#24191b] px-4 text-sm font-bold text-white disabled:opacity-40">Add</button></div><label className="relative"><Search className="absolute left-3 top-3 h-5 w-5 text-stone-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name, brand, SKU" className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#b9774c] dark:border-[#4a383d] dark:bg-[#241b1d]" /></label></div><div className="mt-3 flex gap-2 overflow-x-auto pb-1"><button type="button" onClick={() => setCategory('all')} className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${category === 'all' ? 'bg-[#24191b] text-white' : 'border border-stone-200 text-stone-600 dark:border-[#4a383d] dark:text-stone-300'}`}>All stock</button>{categories.map(item => <button type="button" key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${category === item ? 'bg-[#24191b] text-white' : 'border border-stone-200 text-stone-600 dark:border-[#4a383d] dark:text-stone-300'}`}>{item}</button>)}</div></div>
        <div className="rounded-[24px] border border-[#e8d9d2] bg-[#fffdfb] p-3 shadow-[0_18px_50px_rgba(36,25,27,0.06)] dark:border-[#3b2b2f] dark:bg-[#1e1719] sm:p-4"><div className="mb-3 flex items-center justify-between px-1"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Product shelf</p><p className="mt-1 text-sm font-bold">Tap to add to ticket</p></div>{activeDeal && <span className="rounded-full bg-[#f5ebe5] px-2.5 py-1 text-[10px] font-bold text-[#8e4d2d]">{activeDeal.discountPercentage}% deal active</span>}</div>{loading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-52 animate-pulse rounded-2xl bg-stone-100 dark:bg-[#2a2024]" />)}</div> : filteredItems.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{filteredItems.map(item => <button type="button" key={lineKey(item)} onClick={() => addToCart(item)} className="group overflow-hidden rounded-2xl border border-[#eadfd9] bg-white text-left transition hover:-translate-y-0.5 hover:border-[#b9774c] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#b9774c] dark:border-[#4a383d] dark:bg-[#241b1d]"><div className="relative"><img src={item.variant?.image || item.product.image} alt="" className="h-32 w-full object-cover" /><span className="absolute right-2 top-2 rounded-full bg-[#24191b]/85 px-2 py-1 text-[10px] font-bold text-white">{item.stock} left</span></div><div className="p-3"><p className="line-clamp-2 min-h-10 text-sm font-bold">{item.product.name}</p>{item.variant && <p className="mt-1 truncate text-xs font-semibold text-[#a85e35]">{item.variant.name}</p>}<div className="mt-3 flex items-end justify-between gap-2"><span className="text-sm font-black">{money(Number(item.variant?.price ?? item.product.price))}</span><span className="rounded-lg bg-[#f5ebe5] p-1.5 text-[#8e4d2d] transition group-hover:bg-[#e8b792]"><Plus className="h-4 w-4" /></span></div></div></button>)}</div> : <div className="flex min-h-64 flex-col items-center justify-center text-center"><PackageOpen className="h-9 w-9 text-stone-300" /><p className="mt-3 text-sm font-bold">Nothing matches this shelf</p><p className="mt-1 text-xs text-stone-500">Try another search or category.</p></div>}</div>
      </section>
      <section>{checkout}</section>
    </div>
    <div className="grid grid-cols-3 gap-4"><button type="button" onClick={() => { setCart([]); setCustomer(''); setCashReceived(''); setReference(''); setSenderPhone(''); }} className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-[#3b2b2f] dark:bg-[#1e1719] dark:text-stone-300 dark:hover:bg-red-950/20">Clear ticket</button><button type="button" onClick={() => scannerRef.current?.focus()} className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-700 transition hover:border-[#b9774c] hover:bg-[#f5ebe5] dark:border-[#3b2b2f] dark:bg-[#1e1719] dark:text-stone-300 dark:hover:bg-[#342528]">Focus scanner</button><button type="button" disabled={!cart.length || submitting} onClick={() => void completeSale()} className="rounded-2xl bg-[#249447] px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#1d7e3b] disabled:cursor-not-allowed disabled:opacity-40">Pay {money(subtotal)} <ArrowRight className="ml-1 inline h-4 w-4" /></button></div>
    <div className="grid grid-cols-5 gap-4"><button type="button" onClick={() => showAlert('Scale mode is ready for weighed products.', 'info')} className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-700 transition hover:border-[#b9774c] hover:bg-[#f5ebe5] dark:border-[#3b2b2f] dark:bg-[#1e1719] dark:text-stone-300 dark:hover:bg-[#342528]">Scale<span className="mt-1 block text-[10px] font-medium text-stone-400">Weigh item</span></button><button type="button" onClick={() => showAlert('Apply a promotion from the ticket before payment.', 'info')} className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-700 transition hover:border-[#b9774c] hover:bg-[#f5ebe5] dark:border-[#3b2b2f] dark:bg-[#1e1719] dark:text-stone-300 dark:hover:bg-[#342528]">Discount<span className="mt-1 block text-[10px] font-medium text-stone-400">Apply discount</span></button><button type="button" disabled={!cart.length} onClick={() => showAlert('Current ticket held for this cashier session.', 'success')} className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-700 transition hover:border-[#b9774c] hover:bg-[#f5ebe5] disabled:opacity-40 dark:border-[#3b2b2f] dark:bg-[#1e1719] dark:text-stone-300 dark:hover:bg-[#342528]">Hold<span className="mt-1 block text-[10px] font-medium text-stone-400">Save ticket</span></button><button type="button" onClick={() => showAlert('Refunds are handled from the Orders workspace.', 'info')} className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-700 transition hover:border-[#b9774c] hover:bg-[#f5ebe5] dark:border-[#3b2b2f] dark:bg-[#1e1719] dark:text-stone-300 dark:hover:bg-[#342528]">Refund<span className="mt-1 block text-[10px] font-medium text-stone-400">Process refund</span></button><button type="button" disabled={!cart.length || submitting} onClick={() => void completeSale()} className="rounded-2xl bg-[#249447] px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#1d7e3b] disabled:cursor-not-allowed disabled:opacity-40">Pay {money(subtotal)} <ArrowRight className="ml-1 inline h-4 w-4" /></button></div>
    <section className="rounded-[24px] border border-[#e8d9d2] bg-[#fffdfb] p-4 shadow-[0_18px_50px_rgba(36,25,27,0.06)] dark:border-[#3b2b2f] dark:bg-[#1e1719] sm:p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a85e35]">POS ledger</p><h2 className="mt-1 text-lg font-bold">Recent sales</h2><p className="mt-1 text-xs text-stone-500">Completed counter sales from the shared order system.</p></div><button type="button" onClick={() => void fetchOrders()} disabled={loadingOrders} className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 disabled:opacity-50 dark:border-[#4a383d] dark:text-stone-300 dark:hover:bg-[#241b1d]"><RefreshCw className={`h-3.5 w-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />Refresh</button></div>{posHistory.length ? <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-stone-200 text-[10px] uppercase tracking-wider text-stone-500 dark:border-[#3b2b2f]"><tr><th className="px-3 py-2">Sale</th><th className="px-3 py-2">Customer</th><th className="px-3 py-2">Payment</th><th className="px-3 py-2">Total</th><th className="px-3 py-2">Date</th><th className="px-3 py-2 text-right">Receipt</th></tr></thead><tbody className="divide-y divide-stone-100 dark:divide-[#3b2b2f]">{posHistory.map(order => <tr key={order.id}><td className="px-3 py-3 font-mono text-xs font-bold">{order.orderNumber}</td><td className="px-3 py-3">{order.shippingAddress?.fullName || 'Walk-in customer'}</td><td className="px-3 py-3 capitalize text-stone-500">{order.paymentMethod.replaceAll('-', ' ')}</td><td className="px-3 py-3 font-bold">{money(Number(order.total))}</td><td className="px-3 py-3 text-xs text-stone-500">{new Date(order.createdAt).toLocaleString()}</td><td className="px-3 py-3 text-right"><button type="button" onClick={() => printReceipt(order)} aria-label={`Print receipt for ${order.orderNumber}`} className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-bold hover:bg-[#f5ebe5] dark:border-[#4a383d] dark:hover:bg-[#342528]"><Printer className="h-3.5 w-3.5" />Print</button></td></tr>)}</tbody></table></div> : <div className="mt-4 rounded-2xl border border-dashed border-[#dbc9c0] px-4 py-8 text-center text-sm text-stone-500">{loadingOrders ? 'Loading sales history...' : 'No POS sales have been recorded yet.'}</div>}</section>
  </div>;
}
