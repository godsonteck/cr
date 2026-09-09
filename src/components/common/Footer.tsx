import React from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import { useStore } from '../../context/StoreContext';
import logoImg from '../../assets/logo.jpeg';
import { getWhatsAppUrl } from '../../lib/whatsapp';

export const Footer: React.FC = () => {
  const { storeSettings } = useStore();

  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-soft)] text-[var(--text-muted)]">
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xs">
            <Link to="/" className="inline-flex items-center gap-3 text-[var(--text-primary)]">
              <img
                src={storeSettings.storeLogo || logoImg}
                onError={(event) => { (event.currentTarget as HTMLImageElement).src = logoImg; }}
                alt={storeSettings.storeName}
                className="h-8 w-8 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] object-contain p-1"
              />
              <span className="font-serif text-base font-bold tracking-[0.02em]">{storeSettings.storeName}</span>
            </Link>
          </div>

          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:justify-end" aria-label="Footer links">
            <Link to="/about" className="transition hover:text-[var(--accent)]">About</Link>
            <Link to="/faq" className="transition hover:text-[var(--accent)]">FAQs</Link>
            <Link to="/feedback" className="transition hover:text-[var(--accent)]">Feedback</Link>
            <Link to="/contact" className="transition hover:text-[var(--accent)]">Contact</Link>
            <Link to="/delivery-returns" className="transition hover:text-[var(--accent)]">Delivery &amp; returns</Link>
            <a href={getWhatsAppUrl(storeSettings.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 transition hover:text-[#189a51]"><FaWhatsapp className="h-3.5 w-3.5 text-[#1FAE5B]" aria-hidden="true" /> WhatsApp</a>
          </nav>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border-color)] pt-3 text-[10px] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
          <span>© {new Date().getFullYear()} {storeSettings.storeName}</span>
          <div className="flex gap-3 normal-case tracking-normal">
            <Link to="/terms" className="hover:text-[var(--accent)]">Terms</Link>
            <Link to="/privacy" className="hover:text-[var(--accent)]">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
