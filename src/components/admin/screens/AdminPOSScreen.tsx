import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Barcode, Banknote, CreditCard, Loader2, Minus, Plus, Search, ShoppingCart, Trash2, Smartphone, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useAlert } from '../../../context/AlertContext';
import { api } from '../../../lib/api';
import type { PaymentMethod, Product, ProductVariant } from '../../../types';

type PosLine = { product: Product; variant?: ProductVariant; quantity: number };
type PosPayment = 'cash-on-delivery' | 'card' | 'momo-mtn';

const money = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' });
const keyFor = (product: Product, variant?: ProductVariant) => `${product.id}:${variant?.id || 'base'}`;

export function AdminPOSScreen() {
  const { products, loading, fetchProducts, fetchOrders } = useStore();
  const { showAlert } = useAlert();
  const [query, setQuery] = useState('');
  const [scannerValue, setScannerValue] = useState('');
  const [cart, setCart] = useState<PosLine[]>([]);
  const [payment, setPayment] = useState<PosPayment>('cash-on-delivery');
  const [reference, setReference] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const scannerRef = useRef<HTMLInputElement>(null);

  useEffect(() => { void fetchProducts({ includeUnpublished: true }); }, [fetchProducts]);
  useEffect(() => { scannerRef.current?.focus(); }, []);

  const sellable = useMemo(() => products.filter(product => product.isPublished !== false && product.inStock && product.stockCount > 0), [products]);
  const shownProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return !needle ? sellable : sellable.filter(product => [product.name, product.brand, product.category, product.id, ...(product.variants || []).map(v => v.name)].join(' ').toLowerCase().includes(needle));
  }, [query, sellable]);
  const total = cart.reduce((sum, line) => sum + Number(line.variant?.price ?? line.product.price) * line.quantity, 0);

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
  const scan = () => {
    const needle = scannerValue.trim().toLowerCase();
    if (!needle) return;
    const product = sellable.find(item => item.id.toLowerCase() === needle || item.name.toLowerCase() === needle);
    const variantMatch = sellable.flatMap(item => (item.variants || []).map(variant => ({ item, variant }))).find(item => item.variant.id.toLowerCase() === needle || item.variant.name.toLowerCase() === needle);
    if (variantMatch) addLine(variantMatch.item, variantMatch.variant);
    else if (product) addLine(product);
    else showAlert('No live product or variation matches that scan. Search by name instead.', 'warning');
    setScannerValue('');
  };
  const completeSale = async () => {
    if (!cart.length || submitting) return;
    if (payment === 'momo-mtn' && (!reference.trim() || !senderPhone.trim())) { showAlert('Enter the MoMo reference and sender phone.', 'warning'); return; }
    setSubmitting(true);
    try {
      const payload = {
        orderSource: 'pos', subtotal: total, shippingFee: 0, discount: 0, total,
        paymentMethod: payment as PaymentMethod, paymentStatus: 'paid', deliveryMethod: 'store-pickup',
        paymentReference: reference.trim() || undefined, paymentSenderPhone: payment === 'momo-mtn' ? senderPhone.trim() : undefined,
        shippingAddress: { fullName: customerName.trim() || 'Walk-in customer', phone: payment === 'momo-mtn' ? senderPhone.trim() : 'In-store sale', city: 'In-store', area: 'POS counter' },
        items: cart.map(line => ({
          product: { id: line.product.id, name: line.product.name, brand: line.product.brand, price: Number(line.variant?.price ?? line.product.price), originalPrice: line.variant?.originalPrice ?? line.product.originalPrice, image: line.variant?.image || line.product.image, unit: line.product.unit, category: line.product.category, inStock: true, stockCount: Number(line.variant?.stockCount ?? line.product.stockCount) },
          quantity: line.quantity,
          selectedVariant: line.variant ? { id: line.variant.id, name: line.variant.name, price: Number(line.variant.price), originalPrice: line.variant.originalPrice, inStock: true } : undefined,
        })),
      };
      const order = await api.post<{ orderNumber: string }>('/orders?channel=pos', payload);
      showAlert(`Sale ${order.orderNumber} completed and stock updated.`, 'success');
      setCart([]); setReference(''); setSenderPhone(''); setCustomerName('');
      await Promise.all([fetchProducts({ includeUnpublished: true }), fetchOrders()]);
      window.setTimeout(() => window.print(), 50);
    } catch (error: any) { showAlert(error?.data?.error || error?.message || 'Could not complete this sale.', 'error'); }
    finally { setSubmitting(false); scannerRef.current?.focus(); }
  };

  return <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px] print:block">
    <section className="min-w-0 space-y-4 print:hidden">
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-[#35272c] dark:bg-[#1e1719] sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold">Counter sale</h2><p className="text-sm text-stone-500">Scan an item or search the live catalogue. Stock is checked again when you complete the sale.</p></div><div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Secure stock sync</div></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2"><label className="relative"><Barcode className="absolute left-3 top-3 h-5 w-5 text-stone-400" /><input ref={scannerRef} value={scannerValue} onChange={event => setScannerValue(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') scan(); }} placeholder="Scan barcode or enter product ID" className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#b9774c] dark:border-[#514048] dark:bg-[#21191b]" /></label><label className="relative"><Search className="absolute left-3 top-3 h-5 w-5 text-stone-400" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search products" className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#b9774c] dark:border-[#514048] dark:bg-[#21191b]" /></label></div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{loading ? <p className="col-span-full p-8 text-center text-sm text-stone-500">Loading products…</p> : shownProducts.map(product => <article key={product.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-[#35272c] dark:bg-[#1e1719]"><img src={product.image} alt="" className="h-28 w-full object-cover" /><div className="p-3"><p className="line-clamp-2 text-sm font-bold">{product.name}</p><p className="mt-1 text-sm font-extrabold text-[#a85e35]">{money.format(product.price)}</p>{product.variants?.length ? <div className="mt-2 flex flex-wrap gap-1">{product.variants.filter(v => v.inStock && (v.stockCount ?? 0) > 0).map(variant => <button key={variant.id} onClick={() => addLine(product, variant)} className="rounded-md border border-stone-300 px-2 py-1 text-[11px] font-bold hover:border-[#b9774c]">{variant.name}</button>)}</div> : <button onClick={() => addLine(product)} className="mt-2 w-full rounded-lg bg-[#24191b] py-2 text-xs font-bold text-white">Add</button>}</div></article>)}</div>
    </section>
    <aside className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-[#35272c] dark:bg-[#1e1719] print:hidden"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-bold"><ShoppingCart className="h-5 w-5" /> Current sale</h2><span className="text-xs font-bold text-stone-500">{cart.reduce((sum, line) => sum + line.quantity, 0)} items</span></div><div className="my-4 max-h-[35vh] space-y-3 overflow-auto">{cart.length ? cart.map(line => <div key={keyFor(line.product, line.variant)} className="rounded-xl bg-stone-50 p-3 dark:bg-[#261d20]"><div className="flex justify-between gap-2"><div><p className="text-sm font-bold">{line.product.name}</p>{line.variant && <p className="text-xs text-stone-500">{line.variant.name}</p>}</div><button onClick={() => updateQuantity(line, 0)} aria-label="Remove item"><Trash2 className="h-4 w-4 text-red-500" /></button></div><div className="mt-2 flex items-center justify-between"><span className="text-sm font-bold">{money.format(Number(line.variant?.price ?? line.product.price) * line.quantity)}</span><span className="flex items-center gap-2"><button onClick={() => updateQuantity(line, line.quantity - 1)} className="rounded p-1 hover:bg-stone-200"><Minus className="h-4 w-4" /></button><b>{line.quantity}</b><button onClick={() => updateQuantity(line, line.quantity + 1)} className="rounded p-1 hover:bg-stone-200"><Plus className="h-4 w-4" /></button></span></div></div>) : <p className="py-10 text-center text-sm text-stone-500">Your sale is empty.</p>}</div><label className="block text-xs font-bold">Customer name <span className="font-normal text-stone-400">(optional)</span><input value={customerName} onChange={event => setCustomerName(event.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 bg-transparent p-2.5 text-sm" placeholder="Walk-in customer" /></label><div className="mt-3 grid grid-cols-3 gap-2">{([{ id: 'cash-on-delivery', label: 'Cash', icon: Banknote }, { id: 'card', label: 'Card', icon: CreditCard }, { id: 'momo-mtn', label: 'MoMo', icon: Smartphone }] as const).map(option => <button key={option.id} onClick={() => setPayment(option.id)} className={`rounded-lg border p-2 text-xs font-bold ${payment === option.id ? 'border-[#b9774c] bg-[#fff3ea] text-[#7d4122]' : 'border-stone-200'}`}><option.icon className="mx-auto mb-1 h-4 w-4" />{option.label}</button>)}</div>{payment === 'momo-mtn' && <div className="mt-3 grid gap-2"><input value={reference} onChange={event => setReference(event.target.value)} placeholder="MoMo transaction reference" className="rounded-lg border border-stone-300 bg-transparent p-2.5 text-sm" /><input value={senderPhone} onChange={event => setSenderPhone(event.target.value)} placeholder="Sender phone" className="rounded-lg border border-stone-300 bg-transparent p-2.5 text-sm" /></div>}<div className="mt-4 flex items-end justify-between border-t border-stone-200 pt-4"><span className="text-sm font-semibold">Total</span><strong className="text-2xl">{money.format(total)}</strong></div><button disabled={!cart.length || submitting} onClick={completeSale} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#24191b] py-3.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}{submitting ? 'Completing sale…' : 'Complete sale'}</button></aside>
  </div>;
}
