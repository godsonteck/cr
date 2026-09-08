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
      <div className="mx-auto max-w-3xl px-4 py-10 text-center sm:px-6 sm:py-12">
        <Link to="/" className="inline-flex items-center gap-3 text-[var(--text-primary)]">
            <img
              src={storeSettings.storeLogo || logoImg}
              onError={(event) => { (event.currentTarget as HTMLImageElement).src = logoImg; }}
              alt={storeSettings.storeName}
              className="h-10 w-10 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] object-contain p-1"
            />
            <span className="font-serif text-lg font-bold tracking-[0.02em]">
              {storeSettings.storeName}
            </span>
        </Link>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--text-subtle)]">Beauty, care, and everyday essentials chosen for real routines.</p>
        <a
          href={getWhatsAppUrl(storeSettings.whatsappNumber)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chat with ${storeSettings.storeName} on WhatsApp`}
          className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#1FAE5B] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#189a51]"
        >
          <FaWhatsapp className="h-4 w-4" aria-hidden="true" />
          Chat with us
        </a>
        <div className="mt-9 border-t border-[var(--border-color)] pt-4">
          <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-subtle)]">© {new Date().getFullYear()} {storeSettings.storeName}</span>
        </div>
      </div>
    </footer>
  );
};
