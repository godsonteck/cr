import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useStore } from '../../context/StoreContext';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Instagram, 
  Facebook, 
  MessageCircle,
  Crown
} from 'lucide-react';

interface FooterProps {
  onOpenStoreInfo: () => void;
  onOpenFAQs: () => void;
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenStoreInfo,
  onOpenFAQs,
  onOpenContact
}) => {
  const { showToast } = useToast();
  const { storeSettings } = useStore();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address');
      return;
    }
    showToast('✨ Thank you for subscribing! Welcome to the CR Beauty Circle.');
    setEmail('');
  };

  return (
    <footer className="bg-[#FAF5F4] dark:bg-[#111217] text-gray-800 dark:text-gray-200 text-xs border-t border-rose-100 dark:border-gray-800 transition-colors duration-200">
      
      {/* 4-Column Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10">
          
          {/* COLUMN 1: ABOUT CR COSMETICS & ESSENTIAL (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-extrabold text-xs text-gray-900 dark:text-white tracking-wider uppercase">
              ABOUT CR COSMETICS & ESSENTIAL
            </h4>

            <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
              We provide high-quality cosmetics, skincare, fragrances and everyday essentials that make you look good, feel good and live better.
            </p>

            {/* Social Media Circular Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white dark:bg-[#1A1B22] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-[#8A3D52] hover:border-[#8A3D52] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white dark:bg-[#1A1B22] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-[#8A3D52] hover:border-[#8A3D52] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-8 h-8 rounded-full bg-white dark:bg-[#1A1B22] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-[#8A3D52] hover:border-[#8A3D52] flex items-center justify-center transition-colors shadow-2xs font-bold text-[11px] cursor-pointer"
              >
                <span>Tk</span>
              </a>

              <a
                href={`https://wa.me/${storeSettings.whatsappNumber || '233551234567'}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-full bg-white dark:bg-[#1A1B22] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-[#8A3D52] hover:border-[#8A3D52] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* COLUMN 2: STAY GLOWING (Newsletter Card - lg:col-span-4) */}
          <div className="lg:col-span-4 bg-white dark:bg-[#191A23] rounded-2xl p-5 border border-rose-100/80 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-3">
            <div className="text-center space-y-1">
              <div className="w-8 h-8 bg-rose-50 dark:bg-rose-950/50 text-[#8A3D52] dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-1">
                <Mail className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-xs text-gray-900 dark:text-white tracking-wider uppercase">
                STAY GLOWING
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                Subscribe to get updates on new arrivals, deals and beauty tips.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="flex items-center gap-1.5 pt-1">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-[#121318] border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#8A3D52]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#8A3D52] hover:bg-[#732F42] text-white rounded-lg text-[11px] font-extrabold uppercase tracking-wider transition-colors shadow-2xs shrink-0 cursor-pointer"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>

          {/* COLUMN 3: CUSTOMER CARE (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-extrabold text-xs text-gray-900 dark:text-white tracking-wider uppercase">
              CUSTOMER CARE
            </h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-xs">
              <li>
                <button onClick={onOpenContact} className="hover:text-[#8A3D52] dark:hover:text-rose-400 transition-colors cursor-pointer">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={onOpenFAQs} className="hover:text-[#8A3D52] dark:hover:text-rose-400 transition-colors cursor-pointer">
                  FAQs
                </button>
              </li>
              <li>
                <button onClick={onOpenStoreInfo} className="hover:text-[#8A3D52] dark:hover:text-rose-400 transition-colors cursor-pointer">
                  Delivery & Returns
                </button>
              </li>
              <li>
                <button onClick={onOpenStoreInfo} className="hover:text-[#8A3D52] dark:hover:text-rose-400 transition-colors cursor-pointer">
                  Terms & Privacy
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: CONTACT US (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-extrabold text-xs text-gray-900 dark:text-white tracking-wider uppercase">
              CONTACT US
            </h4>

            <div className="space-y-2.5 text-gray-600 dark:text-gray-400 text-xs">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#8A3D52] dark:text-rose-400 shrink-0" />
                <a href={`tel:${storeSettings.storePhone || '+233551234567'}`} className="hover:text-[#8A3D52] dark:hover:text-rose-400 font-semibold">
                  {storeSettings.storePhone || '+233 55 123 4567'}
                </a>
              </p>

              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#8A3D52] dark:text-rose-400 shrink-0" />
                <a href={`mailto:${storeSettings.storeEmail || 'crcosmetics.essential@gmail.com'}`} className="hover:text-[#8A3D52] dark:hover:text-rose-400 break-all">
                  {storeSettings.storeEmail || 'crcosmetics.essential@gmail.com'}
                </a>
              </p>

              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#8A3D52] dark:text-rose-400 shrink-0 mt-0.5" />
                <span>{storeSettings.storeAddress || 'Botwe School Junction, Accra'}</span>
              </p>

              <p className="flex items-start gap-2 text-[11px] text-gray-500 dark:text-gray-400 pt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#8A3D52] dark:text-rose-400 shrink-0 mt-0.5" />
                <span>{storeSettings.businessHours || 'Mon - Sat: 9:00am - 8:00pm'}</span>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM COPYRIGHT & BRAND BAR */}
      <div className="bg-[#181415] dark:bg-[#0B0C0E] text-gray-400 py-6 px-4 sm:px-6 lg:px-8 text-[11px] border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 text-center sm:text-left">
            <Crown className="w-3.5 h-3.5 text-[#C5A059] fill-current shrink-0" />
            <p className="text-gray-400">
              © {new Date().getFullYear()} <strong className="text-white font-medium">CR Cosmetics & Essential</strong>. All Rights Reserved.
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-gray-400 text-xs">
            <span>Authentic Beauty & Daily Care</span>
            <span className="w-1 h-1 rounded-full bg-[#C5A059]" />
            <span>Accra, Ghana</span>
            <span className="w-1 h-1 rounded-full bg-[#C5A059]" />
            <span className="text-[#C5A059] font-medium">100% Genuine Guarantee</span>
          </div>

        </div>
      </div>

    </footer>
  );
};
