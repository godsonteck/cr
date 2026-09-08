import React from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import { useStore } from '../../context/StoreContext';
import logoImg from '../../assets/logo.jpeg';
import { getWhatsAppUrl } from '../../lib/whatsapp';

export const Footer: React.FC = () => {
  const { storeSettings } = useStore();

  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)]">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-7 text-center sm:px-6 md:flex-row md:justify-between md:text-left lg:px-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <img
              src={storeSettings.storeLogo || logoImg}
              onError={(event) => { (event.currentTarget as HTMLImageElement).src = logoImg; }}
              alt={storeSettings.storeName}
              className="h-9 w-9 rounded-lg border border-[var(--border-color)] bg-[var(--bg-soft)] object-contain p-1"
            />
            <span className="text-base font-black tracking-[-0.04em] text-[var(--text-primary)]">
              {storeSettings.storeName}
            </span>
          </Link>
          <p className="mt-2 text-xs text-[var(--text-subtle)]">Beauty, care, and everyday life.</p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={getWhatsAppUrl(storeSettings.whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Chat with ${storeSettings.storeName} on WhatsApp`}
            title="Chat with us on WhatsApp"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1FAE5B] text-white transition hover:bg-[#189a51]"
          >
            <FaWhatsapp className="h-4 w-4" aria-hidden="true" />
          </a>
          <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-subtle)]">© {new Date().getFullYear()} {storeSettings.storeName}</span>
        </div>
      </div>
    </footer>
  );
};
