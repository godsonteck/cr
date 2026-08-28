import React from 'react';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../common/UIPrimitives';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-sans space-y-8">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#C86D51] uppercase tracking-widest">Our Store Story</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold uppercase text-[#1C1817] dark:text-stone-100">
          CR Cosmetics &amp; Essentials
        </h1>
        <p className="text-sm text-stone-500 max-w-xl mx-auto">
          Elevating retail commerce in Accra, Ghana by bridging luxury skincare formulations with daily essential household provisions.
        </p>
      </div>

      <div className="bg-white dark:bg-[#1C1917] p-8 rounded-3xl border border-[#E6DFD7] dark:border-[#36322E] space-y-6 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
        <h3 className="text-lg font-extrabold uppercase text-[#1C1817] dark:text-stone-100">Two Worlds, One Premium Brand</h3>
        <p>
          Founded on the commitment to quality, authenticity, and convenience, CR Cosmetics &amp; Essentials provides a unified online retail store. Whether you are searching for targeted niacinamide serums to restore your skin barrier or ordering premium Thai Jasmine rice for family weekend gatherings, our platform provides effortless shopping and express delivery across Greater Accra.
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
        <h1 className="text-3xl font-extrabold uppercase text-[#1C1817] dark:text-stone-100">Contact Support</h1>
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
          <h4 className="text-xs font-bold uppercase">Accra Headquarters</h4>
          <span className="text-xs text-stone-600 block">{storeSettings.storeAddress}</span>
        </div>
      </div>
    </div>
  );
};
