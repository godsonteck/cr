import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ShieldCheck, Truck, CreditCard, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import logoImg from '../../assets/logo.jpeg';

export const Footer: React.FC = () => {
  const { storeSettings } = useStore();

  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-card-alt)] py-6 text-[var(--text-muted)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="CR Cosmetics & Essentials"
              className="h-8 w-auto rounded-md object-contain"
            />
            <div>
              <div className="text-sm font-black uppercase tracking-[-0.05em] text-[var(--text-primary)]">
                CR <span className="text-[#b86649]">Cosmetics</span>
              </div>
              <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#79706c]">Essentials</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            <Link to="/shop" className="hover:text-[var(--text-primary)]">Shop</Link>
            <Link to="/beauty" className="hover:text-[var(--text-primary)]">Beauty</Link>
            <Link to="/groceries" className="hover:text-[var(--text-primary)]">Groceries</Link>
            <Link to="/about" className="hover:text-[var(--text-primary)]">About</Link>
            <Link to="/support" className="hover:text-[var(--text-primary)]">Support</Link>
          </div>

          <a
            href={`https://wa.me/${storeSettings.whatsappNumber || '233592153306'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#20bd5a]"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>WhatsApp (0592153306)</span>
          </a>
        </div>

        <div className="mt-5 border-t border-stone-200 pt-4 text-[10px] uppercase tracking-[0.12em] text-[#756f6b]">
          © {new Date().getFullYear()} CR Cosmetics &amp; Essentials
        </div>
      </div>
    </footer>
  );
};
