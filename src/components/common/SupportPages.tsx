import React from 'react';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../common/UIPrimitives';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-sans space-y-8">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#C86D51] uppercase tracking-widest">Our Store Story</span>
        <h1 className="font-serif text-4xl tracking-[-0.06em] text-[var(--text-primary)] sm:text-6xl">
          CR Cosmetics &amp; Essentials
        </h1>
        <p className="text-sm text-stone-500 max-w-xl mx-auto">
          Beauty, personal care and household essentials in one shop.
        </p>
      </div>

      <div className="bg-[var(--bg-card)] p-8 rounded-3xl border border-[var(--border-color)] space-y-6 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
        <h3 className="font-serif text-2xl text-[var(--text-primary)]">About CR Cosmetics &amp; Essentials</h3>
        <p>
          CR Cosmetics &amp; Essentials brings together skincare, cosmetics, personal care and household products. Product information, pricing and availability are shown on each product page.
        </p>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { storeSettings } = useStore();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-sans space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-4xl tracking-[-0.05em] text-[var(--text-primary)]">Contact support</h1>
        <p className="text-xs text-stone-500">We are here to assist with product inquiries, delivery status, and Mobile Money orders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1C1917] p-6 rounded-3xl border border-[#E6DFD7] dark:border-[#36322E] text-center space-y-2">
          <Phone className="w-6 h-6 text-[#C86D51] mx-auto" />
          <h4 className="text-xs font-bold uppercase">Customer Line</h4>
          <span className="text-xs text-stone-600 block">{storeSettings.storePhone}</span>
        </div>

        <div className="bg-white dark:bg-[#1C1917] p-6 rounded-3xl border border-[#E6DFD7] dark:border-[#36322E] text-center space-y-2">
          <Mail className="w-6 h-6 text-[#C86D51] mx-auto" />
          <h4 className="text-xs font-bold uppercase">Email Support</h4>
          <span className="text-xs text-stone-600 block">{storeSettings.storeEmail}</span>
        </div>

        <div className="bg-white dark:bg-[#1C1917] p-6 rounded-3xl border border-[#E6DFD7] dark:border-[#36322E] text-center space-y-2">
          <MapPin className="w-6 h-6 text-[#C86D51] mx-auto" />
          <h4 className="text-xs font-bold uppercase">Store Support</h4>
          <span className="text-xs text-stone-600 block">{storeSettings.storeAddress}</span>
        </div>
      </div>
    </div>
  );
};
