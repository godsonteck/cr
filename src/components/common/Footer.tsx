import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ShieldCheck, Truck, CreditCard, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import logoImg from '../../assets/logo.jpeg';
import { getWhatsAppUrl } from '../../lib/whatsapp';

export const Footer: React.FC = () => {
  const { storeSettings } = useStore();

  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-card-alt)] py-6 text-[var(--text-muted)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img
              src={storeSettings.storeLogo || logoImg}
              onError={(event) => { (event.currentTarget as HTMLImageElement).src = logoImg; }}
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
            href={getWhatsAppUrl(storeSettings.whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with CR Cosmetics on WhatsApp"
            title="Chat with us on WhatsApp"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white transition-colors hover:bg-[#20bd5a]"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
        </div>

        <div className="mt-5 border-t border-[var(--border-color)] pt-4 text-[10px] uppercase tracking-[0.12em] text-[#756f6b]">
          © {new Date().getFullYear()} CR Cosmetics &amp; Essentials
        </div>
      </div>
    </footer>
  );
};
