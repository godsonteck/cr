import React from 'react';
import { ExternalLink, Bell, LogOut, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { navTabs, type AdminTab } from './adminTabs';

interface AdminLayoutProps {
  currentTab: AdminTab;
  setCurrentTab: (tab: AdminTab) => void;
  ghanaTime: string;
  unreadNotifsCount: number;
  pendingOrdersCount: number;
  lowStockProducts: number;
  children: React.ReactNode;
  onOpenCommandPalette: () => void;
}

export function AdminLayout({
  currentTab,
  setCurrentTab,
  ghanaTime,
  unreadNotifsCount,
  pendingOrdersCount,
  lowStockProducts,
  children,
  onOpenCommandPalette,
}: AdminLayoutProps) {
  const store = useStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-cr-espresso flex flex-col font-sans selection:bg-[#1E1719] selection:text-[#FAF6F0]">
      <header className="bg-[#140D10] text-stone-100 border-b border-stone-800/80 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src={new URL('../../assets/logo.jpeg', import.meta.url).toString()}
                alt="CR Cosmetics & Essentials"
                className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 shadow-sm border border-stone-700"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm tracking-wide text-white">
                    {store.storeSettings.storeName}
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-800 text-[#E8B792] border border-stone-700">
                    Store Manager
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                  <span>Accra Time: {ghanaTime || '08:00 AM'}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">Website Online ({store.products.length} items)</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-3 px-3.5 py-1.5 bg-[#23171C] hover:bg-[#2C1E23] border border-stone-800 rounded-xl text-xs text-stone-400 transition-colors w-72 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-stone-400" />
            <span className="flex-1 text-left">Search items, orders, people...</span>
            <kbd className="px-1.5 py-0.5 bg-stone-800 border border-stone-700 text-[10px] font-mono rounded text-stone-300">
              Ctrl+K
            </kbd>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 rounded-lg text-xs font-semibold text-stone-200 transition-colors cursor-pointer"
            >
              <span>View Online Shop</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </button>

            <div className="relative">
              <button
                onClick={() => setCurrentTab('notifications')}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors relative cursor-pointer"
                title="Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C89B3C] text-cr-espresso text-[9px] font-bold flex items-center justify-center">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>
            </div>

            <div className="h-4 w-px bg-stone-800 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight">
                  {store.adminSession.adminName}
                </p>
                <p className="text-[10px] text-[#E8B792] font-medium">
                  {store.adminSession.adminRole}
                </p>
              </div>

              <button
                onClick={() => {
                  store.logoutAdmin();
                  navigate('/');
                }}
                className="p-2 rounded-xl bg-stone-800 hover:bg-red-950 text-stone-400 hover:text-red-200 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64 shrink-0 space-y-4">
          <div className="md:hidden flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {navTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentTab(id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  currentTab === id ? 'bg-[#1E1719] text-[#FAF6F0] shadow-sm' : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="hidden md:block bg-white border border-[#E8E2D8] rounded-2xl p-3 shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">Main</span>
              {navTabs.filter((t) => t.group === 'MAIN').map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setCurrentTab(id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentTab === id ? 'bg-[#1E1719] text-[#FAF6F0] shadow-xs font-bold' : 'text-stone-600 hover:text-cr-espresso hover:bg-cr-sand'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-1 pt-2 border-t border-stone-100">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">Shop & Sales</span>
              {navTabs.filter((t) => t.group === 'SHOPPING').map(({ id, label, icon: Icon }) => {
                const isActive = currentTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setCurrentTab(id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive ? 'bg-[#1E1719] text-[#FAF6F0] shadow-xs font-bold' : 'text-stone-600 hover:text-cr-espresso hover:bg-cr-sand'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </div>
                    {id === 'orders' && pendingOrdersCount > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-800'}`}>
                        {pendingOrdersCount}
                      </span>
                    )}
                    {id === 'inventory' && lowStockProducts > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
                        {lowStockProducts}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="space-y-1 pt-2 border-t border-stone-100">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">Reports & Settings</span>
              {navTabs.filter((t) => t.group === 'REPORTS' || t.group === 'SETTINGS').map(({ id, label, icon: Icon }) => {
                const isActive = currentTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setCurrentTab(id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive ? 'bg-[#1E1719] text-[#FAF6F0] shadow-xs font-bold' : 'text-stone-600 hover:text-cr-espresso hover:bg-cr-sand'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </div>
                    {id === 'notifications' && unreadNotifsCount > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-[#1E1719] text-white'}`}>
                        {unreadNotifsCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 space-y-6">{children}</main>
      </div>
    </div>
  );
}
