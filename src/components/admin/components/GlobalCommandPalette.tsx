import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Package, 
  ClipboardList, 
  User, 
  Tag, 
  Sliders, 
  Plus, 
  ArrowRight, 
  X, 
  Boxes, 
  Truck, 
  TrendingUp, 
  Settings, 
  Bell 
} from 'lucide-react';
import { Product, Order, Customer } from '../../../types';

interface GlobalCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  customers: Customer[];
  onSelectProduct: (product: Product) => void;
  onSelectOrder: (order: Order) => void;
  onSelectCustomer: (customer: Customer) => void;
  onNavigateTab: (tabId: string) => void;
}

export const GlobalCommandPalette: React.FC<GlobalCommandPaletteProps> = ({
  isOpen,
  onClose,
  products = [],
  orders = [],
  customers = [],
  onSelectProduct,
  onSelectOrder,
  onSelectCustomer,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  const safeProducts = Array.isArray(products) ? products : [];
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];

  const filteredProducts = useMemo(() => {
    if (!isOpen) return [];
    if (!query.trim()) return safeProducts.slice(0, 4);
    const q = query.toLowerCase();
    return safeProducts
      .filter(p => 
        (p?.name || '').toLowerCase().includes(q) || 
        (p?.brand || '').toLowerCase().includes(q) ||
        (p?.category || '').toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [isOpen, safeProducts, query]);

  const filteredOrders = useMemo(() => {
    if (!isOpen) return [];
    if (!query.trim()) return safeOrders.slice(0, 3);
    const q = query.toLowerCase();
    return safeOrders
      .filter(o => 
        (o?.orderNumber || '').toLowerCase().includes(q) || 
        (o?.shippingAddress?.fullName || '').toLowerCase().includes(q) || 
        (o?.shippingAddress?.phone || '').includes(q)
      )
      .slice(0, 4);
  }, [isOpen, safeOrders, query]);

  const filteredCustomers = useMemo(() => {
    if (!isOpen) return [];
    if (!query.trim()) return safeCustomers.slice(0, 3);
    const q = query.toLowerCase();
    return safeCustomers
      .filter(c => 
        (c?.fullName || '').toLowerCase().includes(q) || 
        (c?.phone || '').includes(q) || 
        (c?.email || '').toLowerCase().includes(q)
      )
      .slice(0, 4);
  }, [isOpen, safeCustomers, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24 font-sans animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#191316] rounded-3xl shadow-2xl border border-stone-200 dark:border-[#2e2428] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Bar */}
        <div className="p-4 border-b border-stone-100 dark:border-[#2e2428] flex items-center gap-3 bg-stone-50/70 dark:bg-[#221a1d]">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products, orders, or actions..."
            className="w-full bg-transparent text-sm font-semibold text-stone-900 dark:text-stone-100 placeholder-stone-400 outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-stone-800 dark:text-stone-200">
          
          {/* Quick Shortcuts */}
          {!query && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-2">
                Quick Shortcuts
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    onNavigateTab('products-new');
                    onClose();
                  }}
                  className="p-2.5 bg-stone-50 dark:bg-[#241c20] hover:bg-stone-100 dark:hover:bg-[#2d2328] rounded-xl text-left border border-stone-100 dark:border-[#35292f] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-stone-900 dark:text-stone-100" />
                  <span className="font-bold text-stone-800 dark:text-stone-200">Add New Item</span>
                </button>
                <button
                  onClick={() => {
                    onNavigateTab('orders');
                    onClose();
                  }}
                  className="p-2.5 bg-stone-50 dark:bg-[#241c20] hover:bg-stone-100 dark:hover:bg-[#2d2328] rounded-xl text-left border border-stone-100 dark:border-[#35292f] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <ClipboardList className="w-4 h-4 text-stone-900 dark:text-stone-100" />
                  <span className="font-bold text-stone-800 dark:text-stone-200">Pack Orders</span>
                </button>
                <button
                  onClick={() => {
                    onNavigateTab('inventory');
                    onClose();
                  }}
                  className="p-2.5 bg-stone-50 dark:bg-[#241c20] hover:bg-stone-100 dark:hover:bg-[#2d2328] rounded-xl text-left border border-stone-100 dark:border-[#35292f] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Truck className="w-4 h-4 text-stone-900 dark:text-stone-100" />
                  <span className="font-bold text-stone-800 dark:text-stone-200">Check Stock</span>
                </button>
                <button
                  onClick={() => {
                    onNavigateTab('promos');
                    onClose();
                  }}
                  className="p-2.5 bg-stone-50 dark:bg-[#241c20] hover:bg-stone-100 dark:hover:bg-[#2d2328] rounded-xl text-left border border-stone-100 dark:border-[#35292f] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Tag className="w-4 h-4 text-stone-900 dark:text-stone-100" />
                  <span className="font-bold text-stone-800 dark:text-stone-200">Discount Codes</span>
                </button>
              </div>
            </div>
          )}

          {/* Products */}
          {filteredProducts.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-2">
                Products & Items
              </span>
              <div className="space-y-1">
                {filteredProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProduct(p);
                      onClose();
                    }}
                    className="w-full p-2.5 hover:bg-stone-50 dark:hover:bg-[#241c20] rounded-xl flex items-center justify-between transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover bg-stone-100 dark:bg-stone-800 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-stone-900 dark:text-stone-100 truncate">{p.name}</p>
                        <p className="text-[11px] text-stone-400 dark:text-stone-500">{p.brand || 'Store Item'} • GHS {Number(p.price || 0).toFixed(2)}</p>
                      </div>
                    </div>
                    <span className="text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customer Orders */}
          {filteredOrders.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-2">
                Customer Orders
              </span>
              <div className="space-y-1">
                {filteredOrders.map(o => (
                  <button
                    key={o.id}
                    onClick={() => {
                      onSelectOrder(o);
                      onClose();
                    }}
                    className="w-full p-2.5 hover:bg-stone-50 dark:hover:bg-[#241c20] rounded-xl flex items-center justify-between transition-colors text-left cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{o.orderNumber}</span>
                        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                          {o.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        {o.shippingAddress?.fullName || 'Customer'} • GHS {Number(o.total || 0).toFixed(2)}
                      </p>
                    </div>
                    <span className="text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customers */}
          {filteredCustomers.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-2">
                Customers
              </span>
              <div className="space-y-1">
                {filteredCustomers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCustomer(c);
                      onClose();
                    }}
                    className="w-full p-2.5 hover:bg-stone-50 dark:hover:bg-[#241c20] rounded-xl flex items-center justify-between transition-colors text-left cursor-pointer group"
                  >
                    <div>
                      <p className="font-bold text-stone-900 dark:text-stone-100">{c.fullName}</p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        {c.phone || c.email || 'No phone'} • {c.ordersCount || 0} {(c.ordersCount === 1) ? 'order' : 'orders'}
                      </p>
                    </div>
                    <span className="text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-100 dark:border-[#2e2428] bg-stone-50 dark:bg-[#221a1d] flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
          <span>Press <strong>ESC</strong> to close</span>
          <span>CR Cosmetics and Essential</span>
        </div>

      </div>
    </div>
  );
};
