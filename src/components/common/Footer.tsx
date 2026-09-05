import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useStore } from '../../context/StoreContext';
import logoImg from '../../assets/logo.jpeg';
import { getWhatsAppUrl } from '../../lib/whatsapp';

export const Footer: React.FC = () => {
  const { storeSettings } = useStore();

  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.35fr_0.75fr_1fr] md:gap-10 lg:gap-16">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src={storeSettings.storeLogo || logoImg}
                onError={(event) => { (event.currentTarget as HTMLImageElement).src = logoImg; }}
                alt="CR COSMETICS AND ESSENTIALS"
                className="h-11 w-11 rounded-lg border border-[var(--border-color)] bg-[var(--bg-soft)] object-contain p-1"
              />
              <span className="text-lg font-black tracking-[-0.05em] text-[var(--text-primary)]">
                CR <span className="text-[var(--accent)]">COSMETICS</span> AND ESSENTIALS
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--text-muted)]">
              Beauty, care, and everyday things chosen to fit real routines.
            </p>
            <a
              href={getWhatsAppUrl(storeSettings.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with CR COSMETICS AND ESSENTIALS on WhatsApp"
              title="Chat with us on WhatsApp"
              className="mt-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1FAE5B] text-white transition hover:bg-[#189a51]"
            >
              <FaWhatsapp className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>

          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-subtle)]">Explore</h2>
            <nav className="mt-3 grid gap-2 text-sm font-semibold">
              <Link to="/shop" className="transition hover:text-[var(--accent)]">Shop everything</Link>
              <Link to="/beauty" className="transition hover:text-[var(--accent)]">Beauty</Link>
              <Link to="/groceries" className="transition hover:text-[var(--accent)]">Daily essentials</Link>
              <Link to="/about" className="transition hover:text-[var(--accent)]">Our story</Link>
              <Link to="/support" className="transition hover:text-[var(--accent)]">Support</Link>
            </nav>
          </div>

          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-subtle)]">Contact</h2>
            <div className="mt-3 space-y-2.5 text-sm">
              <a href={`tel:${storeSettings.storePhone}`} className="flex items-start gap-2 transition hover:text-[var(--accent)]">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                <span>{storeSettings.storePhone}</span>
              </a>
              <a href={`mailto:${storeSettings.storeEmail}`} className="flex items-start gap-2 transition hover:text-[var(--accent)]">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                <span className="break-all">{storeSettings.storeEmail}</span>
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                <span>{storeSettings.storeAddress}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-[var(--border-color)] pt-4 text-[10px] uppercase tracking-[0.12em] text-[var(--text-subtle)] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} CR COSMETICS AND ESSENTIALS</span>
          <span>Beauty, care, everyday life</span>
        </div>
      </div>
    </footer>
  );
};
