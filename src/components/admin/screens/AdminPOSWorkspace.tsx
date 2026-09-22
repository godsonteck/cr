import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Banknote,
  Barcode,
  Check,
  ChevronDown,
  CreditCard,
  Minus,
  PackageOpen,
  Plus,
  ReceiptText,
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
import type { FlashDeal, PaymentMethod, Product, ProductVariant } from '../../../types';

type PosLine = { product: Product; variant?: ProductVariant; quantity: number };
type PosItem = { product: Product; variant?: ProductVariant; title: string; stock: number; barcode?: string };
type PaymentChoice = 'cash-on-delivery' | 'card' | 'momo-mtn';

const currency = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' });
const lineKey = (line: PosLine | PosItem) => `${line.product.id}:${line.variant?.id || 'base'}`;

function money(value: number) {
  return currency.format(Number.isFinite(value) ? value : 0);
}

function escapeReceipt(value: string) {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] || character));
}

export function AdminPOSWorkspace() {
  const { products, loading, fetchProducts, fetchOrders, storeSettings } = useStore();
  const { showAlert } = useAlert();
  const scannerRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [cart, setCart] = useState<PosLine[]>([]);
  const [payment, setPayment] = useState<PaymentChoice>('cash-on-delivery');
  const [customer, setCustomer] = useState('');
  const [scannerValue, setScannerValue] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [reference, setReference] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [activeDeal, setActiveDeal] = useState<FlashDeal | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [online, setOnline] = useState(() => navigator.onLine);
  const [saleKey, setSaleKey] = useState(() => `POS-${crypto.randomUUID()}`);

  useEffect(() => {
    void fetchProducts({ includeUnpublished: true });
    void api.get<FlashDeal[]>('/flash-deals').then(deals => setActiveDeal(deals[0] || null)).catch(() => setActiveDeal(null));
    scannerRef.current?.focus();
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchProducts]);

  const items = useMemo<PosItem[]>(() => products.flatMap(product => {
    if (product.isPublished === false) return [];
    if (product.variants?.length) {
      return product.variants
        .filter(variant => variant.inStock && Number(variant.stockCount) > 0)
        .map(variant => ({ product, variant, title: `${product.name} - ${variant.name}`, stock: Number(variant.stockCount), barcode: variant.barcode }));
    }
    return product.inStock && Number(product.stockCount) > 0
      ? [{ product, title: product.name, stock: Number(product.stockCount), barcode: product.barcode }]
      : [];
  }), [products]);

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
        if (product) addToCart({ product, title: product.name, stock: Number(product.stockCount), barcode: product.barcode });
        else showAlert('No product matched that code.', 'warning');
      } catch {
        showAlert('Could not search the catalogue right now.', 'error');
      }
    }
    setScannerValue('');
    scannerRef.current?.focus();
  };

  const printReceipt = (orderNumber: string) => {
    const receipt = window.open('', '_blank');
    if (!receipt) return;
    const lines = cart.map(line => `<tr><td>${escapeReceipt(line.product.name)}${line.variant ? ` - ${escapeReceipt(line.variant.name)}` : ''}<small>${line.quantity} x ${money(priceFor(line))}</small></td><td>${money(priceFor(line) * line.quantity)}</td></tr>`).join('');
    const storeName = escapeReceipt(storeSettings.storeName || 'CR Cosmetics and Essentials');
    receipt.document.write(`<!doctype html><html><head><title>Receipt ${escapeReceipt(orderNumber)}</title><style>body{font-family:Arial,sans-serif;max-width:380px;margin:24px auto;color:#201719}header{text-align:center;border-bottom:2px solid #201719;padding-bottom:14px}h1{font-size:20px;margin:0 0 6px}p{color:#655d5a;font-size:12px;margin:5px 0}table{width:100%;border-collapse:collapse;margin:18px 0}td{padding:10px 0;border-bottom:1px solid #ddd;font-size:13px}td:last-child{text-align:right;font-weight:bold}small{display:block;color:#655d5a;margin-top:3px}.total{font-size:18px;font-weight:bold;border-top:2px solid #201719;padding-top:12px;text-align:right}button{width:100%;padding:12px;background:#201719;color:#fff;border:0;font-weight:bold}@media print{button{display:none}}</style></head><body><header><h1>${storeName}</h1><p>Sale receipt · ${escapeReceipt(orderNumber)}</p><p>${new Date().toLocaleString()}</p></header><p>Customer: ${escapeReceipt(customer || 'Walk-in customer')}</p><table>${lines}</table><p class="total">Total: ${money(subtotal)}</p><p>Payment: ${payment === 'cash-on-delivery' ? `Cash · Change ${money(change)}` : payment === 'momo-mtn' ? 'MTN Mobile Money' : 'Card'}</p><button onclick="window.print()">Print receipt</button></body></html>`);
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
    try {
      const order = await api.post<{ orderNumber: string }>('/orders?channel=pos', {
        orderSource: 'pos', idempotencyKey: saleKey, subtotal, shippingFee: 0, discount: 0, total: subtotal,
        paymentMethod: payment as PaymentMethod, paymentStatus: 'paid', deliveryMethod: 'store-pickup',
        paymentReference: reference.trim() || undefined, paymentSenderPhone: payment === 'momo-mtn' ? senderPhone.trim() : undefined,
        cashReceived: payment === 'cash-on-delivery' ? received : undefined,
        shippingAddress: { fullName: customer.trim() || 'Walk-in customer', phone: payment === 'momo-mtn' ? senderPhone.trim() : 'In-store sale', city: 'In-store', area: 'POS counter' },
        items: cart.map(line => ({
          product: { id: line.product.id, name: line.product.name, brand: line.product.brand, price: priceFor(line), originalPrice: line.variant?.originalPrice ?? line.product.originalPrice, image: line.variant?.image || line.product.image, unit: line.product.unit, category: line.product.category, inStock: true, stockCount: Number(line.variant?.stockCount ?? line.product.stockCount) },
          quantity: line.quantity,
          selectedVariant: line.variant ? { id: line.variant.id, name: line.variant.name, price: Number(line.variant.price), originalPrice: line.variant.originalPrice, inStock: true } : undefined,
        })),
      });
      printReceipt(order.orderNumber);
      showAlert(`Sale ${order.orderNumber} completed. Stock was updated.`, 'success');
      setCart([]); setCustomer(''); setCashReceived(''); setReference(''); setSenderPhone(''); setSaleKey(`POS-${crypto.randomUUID()}`);
      await Promise.all([fetchProducts({ includeUnpublished: true }), fetchOrders()]);
    } catch (error: any) {
      const offline = !navigator.onLine || error instanceof TypeError || (error instanceof ApiError && error.status === 408);
      showAlert(offline ? 'The sale could not sync. Check the connection and try again.' : error?.data?.error || error?.message || 'Could not complete this sale.', offline ? 'warning' : 'error');
    } finally {
      setSubmitting(false);
      scannerRef.current?.focus();
    }
  };

  const checkout = (
    <section className="flex min-h-[calc(100vh-8rem)] flex-col rounded-[24px] border border-[#e8d9d2] bg-[#fffdfb] p-4 shadow-[0_18px_50px_rgba(36,25,27,0.08)] dark:border-[#3b2b2f] dark:bg-[#1e1719] sm:p-5 sticky top-24">
      <div className="flex items-start justify-between gap-3 border-b border-[#eee2dc] pb-4 dark:border-[#3b2b2f]">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a85e35]">Checkout rail</p><h2 className="mt-1 text-xl font-bold">Current sale</h2><p className="mt-1 text-xs text-stone-500">{itemCount} item{itemCount === 1 ? '' : 's'} ready to settle</p></div>
        <div className="rounded-xl bg-[#f5ebe5] p-2.5 text-[#a85e35] dark:bg-[#342528]"><ShoppingBag className="h-5 w-5" /></div>
      </div>
      <div className="min-h-0 flex-1 py-4">
        {cart.length ? <div className="max-h-[30vh] space-y-2 overflow-y-auto pr-1">{cart.map(line => <div key={lineKey(line)} className="rounded-2xl border border-[#eee2dc] bg-white p-3 dark:border-[#3b2b2f] dark:bg-[#241b1d]"><div className="flex gap-3"><img src={line.variant?.image || line.product.image} alt="" className="h-12 w-12 rounded-xl object-cover" /><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><p className="truncate text-sm font-bold">{line.product.name}</p><button type="button" onClick={() => updateLine(line, 0)} aria-label={`Remove ${line.product.name}`} className="text-stone-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div>{line.variant && <p className="truncate text-xs text-[#a85e35]">{line.variant.name}</p>}<div className="mt-2 flex items-center justify-between"><span className="text-sm font-bold">{money(priceFor(line) * line.quantity)}</span><span className="flex items-center gap-2"><button type="button" onClick={() => updateLine(line, line.quantity - 1)} className="rounded-lg border border-stone-200 p-1 hover:bg-stone-100 dark:border-[#4a383d]"><Minus className="h-3.5 w-3.5" /></button><b className="min-w-4 text-center text-xs">{line.quantity}</b><button type="button" onClick={() => updateLine(line, line.quantity + 1)} className="rounded-lg border border-stone-200 p-1 hover:bg-stone-100 dark:border-[#4a383d]"><Plus className="h-3.5 w-3.5" /></button></span></div></div></div></div>)}</div> : <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-[#dbc9c0] bg-[#fff8f3] text-center dark:border-[#4a383d] dark:bg-[#241b1d]"><ReceiptText className="h-8 w-8 text-[#b9774c]" /><p className="mt-3 text-sm font-bold">Your ticket is empty</p><p className="mt-1 max-w-[220px] text-xs leading-5 text-stone-500">Tap a product tile or scan a barcode to start the sale.</p></div>}
        <div className="mt-4"><label className="flex items-center gap-2 text-xs font-bold"><UserRound className="h-4 w-4 text-[#a85e35]" />Customer name <span className="font-normal text-stone-400">optional</span></label><input value={customer} onChange={event => setCustomer(event.target.value)} placeholder="Walk-in customer" className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#b9774c] dark:border-[#4a383d] dark:bg-[#241b1d]" /></div>
        <div className="mt-4"><p className="text-xs font-bold">Payment method</p><div className="mt-2 grid grid-cols-3 gap-2">{([{ id: 'cash-on-delivery', label: 'Cash', icon: Banknote }, { id: 'card', label: 'Card', icon: CreditCard }, { id: 'momo-mtn', label: 'MoMo', icon: Smartphone }] as const).map(option => <button key={option.id} type="button" onClick={() => setPayment(option.id)} className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-[11px] font-bold transition ${payment === option.id ? 'border-[#a85e35] bg-[#f5ebe5] text-[#8e4d2d] dark:bg-[#342528] dark:text-[#e6a47d]' : 'border-stone-200 text-stone-500 hover:border-[#b9774c] dark:border-[#4a383d]'}`}><option.icon className="h-4 w-4" />{option.label}</button>)}</div></div>
        {payment === 'cash-on-delivery' ? <div className="mt-3"><label className="text-xs font-bold">Cash received</label><input type="number" min="0" step="0.01" value={cashReceived} onChange={event => setCashReceived(event.target.value)} placeholder={money(subtotal)} className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-[#b9774c] dark:border-[#4a383d] dark:bg-[#241b1d]" /><div className="mt-2 flex justify-between text-xs"><span className="text-stone-500">Change</span><b className={change > 0 ? 'text-emerald-700' : 'text-stone-700 dark:text-stone-300'}>{money(change)}</b></div></div> : <div className="mt-3 space-y-2"><label className="text-xs font-bold">Payment reference<input value={reference} onChange={event => setReference(event.target.value)} placeholder="Required for reconciliation" className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#b9774c] dark:border-[#4a383d] dark:bg-[#241b1d]" /></label>{payment === 'momo-mtn' && <label className="text-xs font-bold">Sender phone<input value={senderPhone} onChange={event => setSenderPhone(event.target.value)} placeholder="024..." className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#b9774c] dark:border-[#4a383d] dark:bg-[#241b1d]" /></label>}</div>}
      </div>
      <div className="border-t border-[#eee2dc] pt-4 dark:border-[#3b2b2f]"><div className="flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Amount due</p><p className="mt-1 text-3xl font-black tracking-tight">{money(subtotal)}</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">Stock checked</span></div><button type="button" disabled={!cart.length || submitting} onClick={() => void completeSale()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#24191b] px-4 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#3b292c] disabled:cursor-not-allowed disabled:opacity-40">{submitting ? 'Posting sale...' : 'Complete sale'}<ArrowRight className="h-4 w-4" /></button><p className="mt-2 text-center text-[10px] text-stone-400">A receipt opens after the sale is posted.</p></div>
    </section>
  );

  return <div className="min-h-[calc(100vh-7rem)] space-y-4">
    <header className="flex flex-col gap-3 border-b border-stone-200 pb-4 dark:border-[#3b2b2f] sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a85e35]">Counter workspace</p><h1 className="mt-1 font-serif text-3xl font-bold tracking-tight">Point of Sale</h1><p className="mt-1 text-sm text-stone-500">Build the ticket, confirm payment, and move to the next customer.</p></div><div className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-2 text-xs font-bold sm:self-auto ${online ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300'}`}>{online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}{online ? 'Live inventory' : 'Offline mode'}</div></header>
    <div className="grid grid-cols-[minmax(0,1fr)_440px] items-start gap-6">
      <section className="min-w-0 space-y-4">
        <div className="rounded-[24px] border border-[#e8d9d2] bg-[#fffdfb] p-4 shadow-[0_18px_50px_rgba(36,25,27,0.06)] dark:border-[#3b2b2f] dark:bg-[#1e1719] sm:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a85e35]">Find stock</p><h2 className="mt-1 text-lg font-bold">Build a ticket</h2></div><span className="text-xs font-semibold text-stone-500">{filteredItems.length} available</span></div><div className="mt-4 grid gap-2 md:grid-cols-[1.1fr_1fr]"><div className="flex gap-2"><label className="relative min-w-0 flex-1"><Barcode className="absolute left-3 top-3 h-5 w-5 text-stone-400" /><input ref={scannerRef} value={scannerValue} onChange={event => setScannerValue(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') void scanItem(); }} placeholder="Scan barcode or SKU" className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#b9774c] dark:border-[#4a383d] dark:bg-[#241b1d]" /></label><button type="button" onClick={() => void scanItem()} disabled={!scannerValue.trim()} className="rounded-xl bg-[#24191b] px-4 text-sm font-bold text-white disabled:opacity-40">Add</button></div><label className="relative"><Search className="absolute left-3 top-3 h-5 w-5 text-stone-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name, brand, SKU" className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#b9774c] dark:border-[#4a383d] dark:bg-[#241b1d]" /></label></div><div className="mt-3 flex gap-2 overflow-x-auto pb-1"><button type="button" onClick={() => setCategory('all')} className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${category === 'all' ? 'bg-[#24191b] text-white' : 'border border-stone-200 text-stone-600 dark:border-[#4a383d] dark:text-stone-300'}`}>All stock</button>{categories.map(item => <button type="button" key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${category === item ? 'bg-[#24191b] text-white' : 'border border-stone-200 text-stone-600 dark:border-[#4a383d] dark:text-stone-300'}`}>{item}</button>)}</div></div>
        <div className="rounded-[24px] border border-[#e8d9d2] bg-[#fffdfb] p-3 shadow-[0_18px_50px_rgba(36,25,27,0.06)] dark:border-[#3b2b2f] dark:bg-[#1e1719] sm:p-4"><div className="mb-3 flex items-center justify-between px-1"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Product shelf</p><p className="mt-1 text-sm font-bold">Tap to add to ticket</p></div>{activeDeal && <span className="rounded-full bg-[#f5ebe5] px-2.5 py-1 text-[10px] font-bold text-[#8e4d2d]">{activeDeal.discountPercentage}% deal active</span>}</div>{loading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-52 animate-pulse rounded-2xl bg-stone-100 dark:bg-[#2a2024]" />)}</div> : filteredItems.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{filteredItems.map(item => <button type="button" key={lineKey(item)} onClick={() => addToCart(item)} className="group overflow-hidden rounded-2xl border border-[#eadfd9] bg-white text-left transition hover:-translate-y-0.5 hover:border-[#b9774c] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#b9774c] dark:border-[#4a383d] dark:bg-[#241b1d]"><div className="relative"><img src={item.variant?.image || item.product.image} alt="" className="h-32 w-full object-cover" /><span className="absolute right-2 top-2 rounded-full bg-[#24191b]/85 px-2 py-1 text-[10px] font-bold text-white">{item.stock} left</span></div><div className="p-3"><p className="line-clamp-2 min-h-10 text-sm font-bold">{item.product.name}</p>{item.variant && <p className="mt-1 truncate text-xs font-semibold text-[#a85e35]">{item.variant.name}</p>}<div className="mt-3 flex items-end justify-between gap-2"><span className="text-sm font-black">{money(Number(item.variant?.price ?? item.product.price))}</span><span className="rounded-lg bg-[#f5ebe5] p-1.5 text-[#8e4d2d] transition group-hover:bg-[#e8b792]"><Plus className="h-4 w-4" /></span></div></div></button>)}</div> : <div className="flex min-h-64 flex-col items-center justify-center text-center"><PackageOpen className="h-9 w-9 text-stone-300" /><p className="mt-3 text-sm font-bold">Nothing matches this shelf</p><p className="mt-1 text-xs text-stone-500">Try another search or category.</p></div>}</div>
      </section>
      <section>{checkout}</section>
    </div>
  </div>;
}
