import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Barcode, Banknote, CreditCard, Loader2, Minus, Plus, Search, ShoppingCart, Trash2, Smartphone, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useAlert } from '../../../context/AlertContext';
import { api } from '../../../lib/api';
import type { PaymentMethod, Product, ProductVariant } from '../../../types';

type PosLine = { product: Product; variant?: ProductVariant; quantity: number };
type PosCatalogueItem = { product: Product; variant?: ProductVariant; title: string; stockCount: number; barcode?: string; serialNumber?: string };
type PosPayment = 'cash-on-delivery' | 'card' | 'momo-mtn';

const money = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' });
const keyFor = (product: Product, variant?: ProductVariant) => `${product.id}:${variant?.id || 'base'}`;

export function AdminPOSScreen() {
  const { products, loading, fetchProducts, fetchOrders, storeSettings } = useStore();
  const { showAlert } = useAlert();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [scannerValue, setScannerValue] = useState('');
  const [cart, setCart] = useState<PosLine[]>([]);
  const [payment, setPayment] = useState<PosPayment>('cash-on-delivery');
  const [reference, setReference] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [saleKey, setSaleKey] = useState(() => `POS-${crypto.randomUUID()}`);
  const scannerRef = useRef<HTMLInputElement>(null);

  useEffect(() => { void fetchProducts({ includeUnpublished: true }); }, [fetchProducts]);
  useEffect(() => { scannerRef.current?.focus(); }, []);

  const catalogueItems = useMemo<PosCatalogueItem[]>(() => products.flatMap(product => {
    if (product.isPublished === false) return [];
    if (product.variants?.length) return product.variants
      .filter(variant => variant.inStock && Number(variant.stockCount) > 0)
      .map(variant => ({ product, variant, title: `${product.name} — ${variant.name}`, stockCount: Number(variant.stockCount), barcode: variant.barcode, serialNumber: variant.serialNumber }));
    return product.inStock && Number(product.stockCount) > 0
      ? [{ product, title: product.name, stockCount: Number(product.stockCount), barcode: product.barcode, serialNumber: product.serialNumber }]
      : [];
  }), [products]);
  const sellable = useMemo(() => catalogueItems.map(item => item.product).filter((product, index, all) => all.findIndex(item => item.id === product.id) === index), [catalogueItems]);
  const categories = useMemo(() => Array.from(new Set(catalogueItems.map(item => item.product.categoryLabel || item.product.category).filter(Boolean))).sort(), [catalogueItems]);
  const shownProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return catalogueItems.filter(item => {
      const matchesCategory = activeCategory === 'all' || (item.product.categoryLabel || item.product.category) === activeCategory;
      const matchesSearch = !needle || [item.title, item.product.brand, item.product.category, item.product.categoryLabel, item.product.id, item.variant?.id, item.barcode, item.serialNumber].filter(Boolean).join(' ').toLowerCase().includes(needle);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, catalogueItems, query]);
  const barcodeMissing = catalogueItems.filter(item => !item.barcode?.trim()).length;
  const total = cart.reduce((sum, line) => sum + Number(line.variant?.price ?? line.product.price) * line.quantity, 0);
  const tendered = Number(cashReceived);
  const change = payment === 'cash-on-delivery' && Number.isFinite(tendered) ? Math.max(0, tendered - total) : 0;

  const addLine = (product: Product, variant?: ProductVariant) => {
    const available = Number(variant?.stockCount ?? product.stockCount);
    if (!variant && (product.variants?.length || 0) > 0) {
      showAlert('Choose a variation before adding this product.', 'info');
      return;
    }
    setCart(previous => {
      const key = keyFor(product, variant);
      const current = previous.find(line => keyFor(line.product, line.variant) === key);
      if (current && current.quantity >= available) { showAlert('No more units are available for this item.', 'warning'); return previous; }
      return current ? previous.map(line => keyFor(line.product, line.variant) === key ? { ...line, quantity: line.quantity + 1 } : line) : [...previous, { product, variant, quantity: 1 }];
    });
  };
  const updateQuantity = (line: PosLine, quantity: number) => {
    const key = keyFor(line.product, line.variant);
    const available = Number(line.variant?.stockCount ?? line.product.stockCount);
    setCart(previous => quantity <= 0 ? previous.filter(item => keyFor(item.product, item.variant) !== key) : previous.map(item => keyFor(item.product, item.variant) === key ? { ...item, quantity: Math.min(quantity, available) } : item));
  };
  const scan = async () => {
    const needle = scannerValue.trim().toLowerCase();
    if (!needle) return;
    // Exact barcode queries stay fast even when the catalogue grows beyond
    // the currently loaded POS grid. Fallback matching is useful for manual
    // product IDs and names.
    let scannedProduct: Product | undefined;
    try {
      const result = await api.get<{ products: Product[] }>(`/products?scanCode=${encodeURIComponent(scannerValue.trim())}&limit=1`);
      scannedProduct = result.products?.[0];
    } catch { /* A manual lookup can still use the already loaded catalogue. */ }
    const product = scannedProduct || sellable.find(item => item.id.toLowerCase() === needle || item.name.toLowerCase() === needle || item.barcode?.toLowerCase() === needle || item.serialNumber?.toLowerCase() === needle);
    const variantMatch = (scannedProduct ? [scannedProduct] : sellable).flatMap(item => (item.variants || []).map(variant => ({ item, variant }))).find(item => item.variant.barcode?.toLowerCase() === needle || item.variant.serialNumber?.toLowerCase() === needle || item.variant.id.toLowerCase() === needle || item.variant.name.toLowerCase() === needle);
    if (variantMatch) addLine(variantMatch.item, variantMatch.variant);
    else if (product) addLine(product);
    else showAlert('No live product or variation matches that scan. Search by name instead.', 'warning');
    setScannerValue('');
  };
  const completeSale = async () => {
    if (!cart.length || submitting) return;
    if (payment === 'momo-mtn' && (!reference.trim() || !senderPhone.trim())) { showAlert('Enter the MoMo reference and sender phone.', 'warning'); return; }
    if (payment === 'card' && !reference.trim()) { showAlert('Enter the card terminal reference.', 'warning'); return; }
    if (payment === 'cash-on-delivery' && (!cashReceived || !Number.isFinite(tendered) || tendered < total)) { showAlert('Enter the cash received; it must cover the total.', 'warning'); return; }
    const receiptWindow = window.open('', '_blank');
    setSubmitting(true);
    try {
      const payload = {
        orderSource: 'pos', idempotencyKey: saleKey, subtotal: total, shippingFee: 0, discount: 0, total,
        paymentMethod: payment as PaymentMethod, paymentStatus: 'paid', deliveryMethod: 'store-pickup',
        paymentReference: reference.trim() || undefined, paymentSenderPhone: payment === 'momo-mtn' ? senderPhone.trim() : undefined, cashReceived: payment === 'cash-on-delivery' ? tendered : undefined,
        shippingAddress: { fullName: customerName.trim() || 'Walk-in customer', phone: payment === 'momo-mtn' ? senderPhone.trim() : 'In-store sale', city: 'In-store', area: 'POS counter' },
        items: cart.map(line => ({
          product: { id: line.product.id, name: line.product.name, brand: line.product.brand, price: Number(line.variant?.price ?? line.product.price), originalPrice: line.variant?.originalPrice ?? line.product.originalPrice, image: line.variant?.image || line.product.image, unit: line.product.unit, category: line.product.category, inStock: true, stockCount: Number(line.variant?.stockCount ?? line.product.stockCount) },
          quantity: line.quantity,
          selectedVariant: line.variant ? { id: line.variant.id, name: line.variant.name, price: Number(line.variant.price), originalPrice: line.variant.originalPrice, inStock: true } : undefined,
        })),
      };
      const order = await api.post<{ orderNumber: string }>('/orders?channel=pos', payload);
      showAlert(`Sale ${order.orderNumber} completed and stock updated.`, 'success');
      if (receiptWindow) {
        const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));
        const lines = cart.map(line => `<tr><td>${escape(line.product.name)}${line.variant ? ` — ${escape(line.variant.name)}` : ''}<br><small>${line.quantity} × ${money.format(Number(line.variant?.price ?? line.product.price))}</small></td><td style="text-align:right">${money.format(Number(line.variant?.price ?? line.product.price) * line.quantity)}</td></tr>`).join('');
        const companyName = storeSettings.storeName.trim() || 'Store';
        const companyDetails = [storeSettings.storeTagline, storeSettings.storeAddress, storeSettings.storePhone, storeSettings.storeEmail, storeSettings.whatsappNumber && `WhatsApp: ${storeSettings.whatsappNumber}`, storeSettings.storeHours].map(detail => detail?.trim()).filter(Boolean).map(detail => `<p class="company-detail">${escape(detail!)}</p>`).join('');
        const companyLogo = storeSettings.storeLogo?.trim() ? `<img src="${escape(storeSettings.storeLogo.trim())}" alt="${escape(companyName)} logo" class="logo" />` : '';
        receiptWindow.document.write(`<!doctype html><html><head><title>Receipt ${escape(order.orderNumber)}</title><style>body{font-family:Arial,sans-serif;max-width:360px;margin:24px auto;color:#171717}.brand{border-bottom:2px solid #171717;padding-bottom:14px;text-align:center}.logo{display:block;max-height:64px;max-width:150px;margin:0 auto 9px;object-fit:contain}h1{font-size:20px;margin:0}.company-detail{margin:3px 0;color:#555;font-size:12px}p{margin:6px 0;color:#555}table{width:100%;border-collapse:collapse;margin:18px 0}td{padding:9px 0;border-bottom:1px solid #ddd;font-size:13px}small{color:#666}.total{font-size:18px;font-weight:bold;border-top:2px solid #111;padding-top:12px}button{width:100%;padding:12px;border:0;background:#171717;color:#fff;font-weight:bold}@media print{body{margin:0 auto}button{display:none}}</style></head><body><header class="brand">${companyLogo}<h1>${escape(companyName)}</h1>${companyDetails}</header><p>Sale receipt · ${escape(order.orderNumber)}</p><p>${new Date().toLocaleString()}</p><p>Customer: ${escape(customerName.trim() || 'Walk-in customer')}</p><table>${lines}</table><p>Payment: ${payment === 'cash-on-delivery' ? 'Cash' : payment === 'momo-mtn' ? 'Mobile Money' : 'Card'}${reference.trim() ? ` · Ref: ${escape(reference.trim())}` : ''}</p>${payment === 'cash-on-delivery' ? `<p>Cash received: ${money.format(tendered)}<br>Change: ${money.format(change)}</p>` : ''}<p class="total">Total: ${money.format(total)}</p><button onclick="window.print()">Print receipt</button></body></html>`);
        receiptWindow.document.close();
      }
      setCart([]); setReference(''); setSenderPhone(''); setCustomerName(''); setCashReceived(''); setSaleKey(`POS-${crypto.randomUUID()}`);
      await Promise.all([fetchProducts({ includeUnpublished: true }), fetchOrders()]);
    } catch (error: any) { showAlert(error?.data?.error || error?.message || 'Could not complete this sale.', 'error'); }
    finally { setSubmitting(false); scannerRef.current?.focus(); }
  };

  return <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px] print:block">
    <section className="min-w-0 space-y-4 print:hidden">
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-[#35272c] dark:bg-[#1e1719] sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold">Counter sale</h2><p className="text-sm text-stone-500">Every stocked product and variation is shown separately. Stock is checked again when you complete the sale.</p></div><div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Secure stock sync</div></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2"><div><div className="flex gap-2"><label className="relative min-w-0 flex-1"><Barcode className="absolute left-3 top-3 h-5 w-5 text-stone-400" /><input ref={scannerRef} value={scannerValue} onChange={event => setScannerValue(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') void scan(); }} placeholder="Scan barcode, serial number, or product ID" className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#b9774c] dark:border-[#514048] dark:bg-[#21191b]" /></label><button type="button" onClick={() => void scan()} disabled={!scannerValue.trim()} className="rounded-xl bg-[#24191b] px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Add</button></div><p className="mt-1.5 text-xs text-stone-500">Connect a USB or Bluetooth scanner in keyboard mode, click this field once, then scan a barcode or serial number. Press Enter after a typed code.</p></div><label className="relative"><Search className="absolute left-3 top-3 h-5 w-5 text-stone-400" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search products" className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#b9774c] dark:border-[#514048] dark:bg-[#21191b]" /></label></div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1"><button type="button" onClick={() => setActiveCategory('all')} className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${activeCategory === 'all' ? 'bg-[#24191b] text-white' : 'border border-stone-300 text-stone-600 hover:border-[#b9774c]'}`}>All products</button>{categories.map(category => <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${activeCategory === category ? 'bg-[#24191b] text-white' : 'border border-stone-300 text-stone-600 hover:border-[#b9774c]'}`}>{category}</button>)}</div>
      </div>
      <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm dark:border-[#35272c] dark:bg-[#1e1719]"><div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1"><p className="text-sm font-bold">Product keys <span className="font-normal text-stone-500">({shownProducts.length} shown)</span></p>{barcodeMissing > 0 && <p className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">{barcodeMissing} item{barcodeMissing === 1 ? '' : 's'} need a barcode</p>}</div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">{loading ? <p className="col-span-full p-8 text-center text-sm text-stone-500">Loading products…</p> : shownProducts.map(item => <button key={keyFor(item.product, item.variant)} type="button" onClick={() => addLine(item.product, item.variant)} className="group overflow-hidden rounded-xl border border-stone-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#b9774c] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#b9774c] dark:border-[#514048] dark:bg-[#21191b]"><img src={item.variant?.image || item.product.image} alt="" className="h-28 w-full object-cover" /><span className="block p-3"><span className="line-clamp-2 block text-sm font-bold">{item.product.name}</span>{item.variant && <span className="mt-0.5 block truncate text-xs font-semibold text-[#a85e35]">{item.variant.name}</span>}<span className="mt-2 block text-sm font-extrabold">{money.format(Number(item.variant?.price ?? item.product.price))}</span><span className="mt-2 flex items-center justify-between gap-2 text-[11px]"><span className="font-medium text-stone-500">{item.stockCount} in stock</span>{item.barcode?.trim() ? <span className="text-emerald-700">Barcode ready</span> : <span className="text-amber-700">No barcode</span>}</span></span></button>)}</div>{!loading && !shownProducts.length && <p className="p-8 text-center text-sm text-stone-500">No in-stock products or variations match this search.</p>}</div>
    </section>
    <aside className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-[#35272c] dark:bg-[#1e1719] print:hidden"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-bold"><ShoppingCart className="h-5 w-5" /> Current sale</h2><span className="text-xs font-bold text-stone-500">{cart.reduce((sum, line) => sum + line.quantity, 0)} items</span></div><div className="my-4 max-h-[35vh] space-y-3 overflow-auto">{cart.length ? cart.map(line => <div key={keyFor(line.product, line.variant)} className="rounded-xl bg-stone-50 p-3 dark:bg-[#261d20]"><div className="flex justify-between gap-2"><div><p className="text-sm font-bold">{line.product.name}</p>{line.variant && <p className="text-xs text-stone-500">{line.variant.name}</p>}</div><button onClick={() => updateQuantity(line, 0)} aria-label="Remove item"><Trash2 className="h-4 w-4 text-red-500" /></button></div><div className="mt-2 flex items-center justify-between"><span className="text-sm font-bold">{money.format(Number(line.variant?.price ?? line.product.price) * line.quantity)}</span><span className="flex items-center gap-2"><button onClick={() => updateQuantity(line, line.quantity - 1)} className="rounded p-1 hover:bg-stone-200"><Minus className="h-4 w-4" /></button><b>{line.quantity}</b><button onClick={() => updateQuantity(line, line.quantity + 1)} className="rounded p-1 hover:bg-stone-200"><Plus className="h-4 w-4" /></button></span></div></div>) : <p className="py-10 text-center text-sm text-stone-500">Your sale is empty.</p>}</div><label className="block text-xs font-bold">Customer name <span className="font-normal text-stone-400">(optional)</span><input value={customerName} onChange={event => setCustomerName(event.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 bg-transparent p-2.5 text-sm" placeholder="Walk-in customer" /></label><div className="mt-3 grid grid-cols-3 gap-2">{([{ id: 'cash-on-delivery', label: 'Cash', icon: Banknote }, { id: 'card', label: 'Card', icon: CreditCard }, { id: 'momo-mtn', label: 'MoMo', icon: Smartphone }] as const).map(option => <button key={option.id} onClick={() => { setPayment(option.id); setReference(''); setSenderPhone(''); setCashReceived(''); }} className={`rounded-lg border p-2 text-xs font-bold ${payment === option.id ? 'border-[#b9774c] bg-[#fff3ea] text-[#7d4122]' : 'border-stone-200'}`}><option.icon className="mx-auto mb-1 h-4 w-4" />{option.label}</button>)}</div>{payment === 'cash-on-delivery' && <div className="mt-3 rounded-lg bg-stone-50 p-3 dark:bg-[#261d20]"><label className="block text-xs font-bold">Cash received<input inputMode="decimal" value={cashReceived} onChange={event => setCashReceived(event.target.value)} placeholder="0.00" className="mt-1 w-full rounded-lg border border-stone-300 bg-white p-2.5 text-sm dark:bg-[#21191b]" /></label>{cashReceived && <p className={`mt-2 text-xs font-bold ${tendered >= total ? 'text-emerald-700' : 'text-red-600'}`}>Change: {money.format(change)}{tendered < total ? ` · Short by ${money.format(total - tendered)}` : ''}</p>}</div>}{payment === 'card' && <div className="mt-3"><label className="block text-xs font-bold">Card terminal reference<input value={reference} onChange={event => setReference(event.target.value)} placeholder="Required receipt or terminal reference" className="mt-1 w-full rounded-lg border border-stone-300 bg-transparent p-2.5 text-sm" /></label></div>}{payment === 'momo-mtn' && <div className="mt-3 grid gap-2"><input value={reference} onChange={event => setReference(event.target.value)} placeholder="MoMo transaction reference" className="rounded-lg border border-stone-300 bg-transparent p-2.5 text-sm" /><input value={senderPhone} onChange={event => setSenderPhone(event.target.value)} placeholder="Sender phone" className="rounded-lg border border-stone-300 bg-transparent p-2.5 text-sm" /></div>}<div className="mt-4 flex items-end justify-between border-t border-stone-200 pt-4"><span className="text-sm font-semibold">Total</span><strong className="text-2xl">{money.format(total)}</strong></div><button disabled={!cart.length || submitting} onClick={completeSale} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#24191b] py-3.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}{submitting ? 'Completing sale…' : 'Complete sale'}</button></aside>
  </div>;
}
