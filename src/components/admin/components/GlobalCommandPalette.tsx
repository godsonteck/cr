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
import { useStore } from '../../../context/StoreContext';

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
  const { storeSettings } = useStore();
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
        className="w-full max-w-2xl clay-modal shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-stone-900 dark:text-stone-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Bar */}
        <div className="p-4 border-b border-stone-200/50 dark:border-white/5 flex items-center gap-3">
          <div className="neu-sunken flex-1 flex items-center gap-3 px-3.5 py-2.5">
            <Search className="w-5 h-5 text-stone-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products, orders, customers, or actions..."
              className="w-full bg-transparent text-sm font-semibold text-stone-900 dark:text-stone-100 placeholder-stone-400 outline-none"
            />
          </div>
          <button
            onClick={onClose}
            className="clay-card-sm p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 shrink-0"
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={() => {
                    onNavigateTab('products-new');
                    onClose();
                  }}
                  className="p-3 clay-card-sm text-left hover:scale-[1.02] transition-transform flex items-center gap-2.5 cursor-pointer"
                >
                  <div className="clay-icon-pod h-7 w-7 text-[#B27A52]">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-stone-800 dark:text-stone-200">Add Item</span>
                </button>
                <button
                  onClick={() => {
                    onNavigateTab('orders');
                    onClose();
                  }}
                  className="p-3 clay-card-sm text-left hover:scale-[1.02] transition-transform flex items-center gap-2.5 cursor-pointer"
                >
                  <div className="clay-icon-pod h-7 w-7 text-sky-600">
                    <ClipboardList className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-stone-800 dark:text-stone-200">Pack Orders</span>
                </button>
                <button
                  onClick={() => {
                    onNavigateTab('inventory');
                    onClose();
                  }}
                  className="p-3 clay-card-sm text-left hover:scale-[1.02] transition-transform flex items-center gap-2.5 cursor-pointer"
                >
                  <div className="clay-icon-pod h-7 w-7 text-amber-600">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-stone-800 dark:text-stone-200">Stock Count</span>
                </button>
                <button
                  onClick={() => {
                    onNavigateTab('promos');
                    onClose();
                  }}
                  className="p-3 clay-card-sm text-left hover:scale-[1.02] transition-transform flex items-center gap-2.5 cursor-pointer"
                >
                  <div className="clay-icon-pod h-7 w-7 text-emerald-600">
                    <Tag className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-stone-800 dark:text-stone-200">Discounts</span>
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
              <div className="space-y-1.5">
                {filteredProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProduct(p);
                      onClose();
                    }}
                    className="w-full p-2.5 clay-card-interactive flex items-center justify-between text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover bg-stone-100 dark:bg-stone-800 shrink-0 shadow-xs" />
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
              <div className="space-y-1.5">
                {filteredOrders.map(o => (
                  <button
                    key={o.id}
                    onClick={() => {
                      onSelectOrder(o);
                      onClose();
                    }}
                    className="w-full p-2.5 clay-card-interactive flex items-center justify-between text-left cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{o.orderNumber}</span>
                        <span className="clay-badge clay-badge-info text-[9px] py-0.5 px-2">
                          {o.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
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
              <div className="space-y-1.5">
                {filteredCustomers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCustomer(c);
                      onClose();
                    }}
                    className="w-full p-2.5 clay-card-interactive flex items-center justify-between text-left cursor-pointer group"
                  >
                    <div>
                      <p className="font-bold font-serif text-stone-900 dark:text-stone-100">{c.fullName}</p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
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
          <span>{storeSettings.storeName}</span>
        </div>

      </div>
    </div>
  );
};
