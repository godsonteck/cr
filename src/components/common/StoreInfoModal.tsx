import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Truck, 
  ShieldCheck, 
  HelpCircle, 
  Sparkles,
  MessageCircle,
  Crown
} from 'lucide-react';

interface StoreInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'about' | 'delivery' | 'faqs' | 'contact';
}

export const StoreInfoModal: React.FC<StoreInfoModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'about'
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'delivery' | 'faqs' | 'contact'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-rose-100 relative space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Monogram */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-[#C5A059] mb-1">
            <Crown className="w-4 h-4 fill-current" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-gray-900">
            CR Cosmetics & Essential
          </h2>
          <p className="text-xs text-[#8A3D52] font-serif italic">
            Beauty · Care · Essentials • Botwe School Junction, Accra
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-center gap-2 border-b border-gray-100 pb-3 text-xs font-bold uppercase tracking-wider">
          {[
            { id: 'about', label: 'About Us' },
            { id: 'delivery', label: 'Delivery & Returns' },
            { id: 'faqs', label: 'FAQs' },
            { id: 'contact', label: 'Contact Us' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-[#8A3D52] text-white shadow-2xs'
                  : 'text-gray-600 hover:bg-rose-50 hover:text-[#8A3D52]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: About Us */}
        {activeTab === 'about' && (
          <div className="space-y-4 text-xs text-gray-600 leading-relaxed animate-fadeIn">
            <p>
              Welcome to <strong className="text-gray-900">CR Cosmetics & Essential</strong>, your trusted destination in Accra for premium beauty, dermatological skincare, iconic fragrances, and daily household essentials.
            </p>
            <p>
              We believe that genuine self-care starts with authentic products. Every item in our catalog is strictly 100% genuine, sourced directly from verified manufacturers and trusted distributors worldwide (including The Ordinary, CeraVe, COSRX, Chanel, and Estée Lauder).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-center">
              <div className="bg-[#FAF5F4] p-3 rounded-xl border border-rose-100">
                <ShieldCheck className="w-5 h-5 text-[#8A3D52] mx-auto mb-1" />
                <h4 className="font-bold text-gray-900">100% Authentic</h4>
                <p className="text-[11px] text-gray-500">Zero counterfeit guarantee</p>
              </div>
              <div className="bg-[#FAF5F4] p-3 rounded-xl border border-rose-100">
                <Truck className="w-5 h-5 text-[#8A3D52] mx-auto mb-1" />
                <h4 className="font-bold text-gray-900">Same-Day Dispatch</h4>
                <p className="text-[11px] text-gray-500">Fast delivery across Accra & Ghana</p>
              </div>
              <div className="bg-[#FAF5F4] p-3 rounded-xl border border-rose-100">
                <Sparkles className="w-5 h-5 text-[#8A3D52] mx-auto mb-1" />
                <h4 className="font-bold text-gray-900">Expert Guidance</h4>
                <p className="text-[11px] text-gray-500">Skincare consultations on WhatsApp</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Delivery & Returns */}
        {activeTab === 'delivery' && (
          <div className="space-y-4 text-xs text-gray-600 leading-relaxed animate-fadeIn">
            <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-100 text-[#8A3D52] font-semibold">
              🚚 Orders above <strong>GHS 300.00</strong> qualify for <strong>FREE Delivery</strong> anywhere within Accra!
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 uppercase tracking-wide">Accra & Greater Accra:</h4>
              <p>Standard delivery is <strong>GHS 25.00</strong>. Orders placed before 2:00 PM are delivered same-day; orders after 2:00 PM arrive the next morning.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 uppercase tracking-wide">Other Regions in Ghana (Kumasi, Takoradi, Tamale):</h4>
              <p>Dispatched via VIP / STC / OA Express parcel delivery within 24 to 48 hours for GHS 40.00.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 uppercase tracking-wide">Returns Policy:</h4>
              <p>Unopened and sealed beauty products can be returned or exchanged within 7 days of purchase if there is any factory defect.</p>
            </div>
          </div>
        )}

        {/* Tab 3: FAQs */}
        {activeTab === 'faqs' && (
          <div className="space-y-3 text-xs text-gray-600 animate-fadeIn">
            <div className="p-3 bg-gray-50 rounded-xl space-y-1">
              <h4 className="font-bold text-gray-900">Are all products genuine?</h4>
              <p>Yes, absolutely. We source all cosmetics, serums, and fragrances directly from certified brand distributors. We have a 100% money-back authenticity guarantee.</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl space-y-1">
              <h4 className="font-bold text-gray-900">How do I place and receive my order?</h4>
              <p>Simply select your favorite products, proceed to checkout, enter your delivery address in Ghana, and our dedicated dispatch team will promptly confirm and deliver directly to your doorstep.</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl space-y-1">
              <h4 className="font-bold text-gray-900">Can I get advice for my specific skin concerns?</h4>
              <p>Yes! Use our "Find Your Perfect Match" tool or tap "Chat With Us" to talk with our skincare consultant on WhatsApp (+233 55 123 4567).</p>
            </div>
          </div>
        )}

        {/* Tab 4: Contact Us */}
        {activeTab === 'contact' && (
          <div className="space-y-4 text-xs text-gray-600 animate-fadeIn">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Phone className="w-4 h-4 text-[#8A3D52]" />
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Phone / WhatsApp</span>
                  <a href="tel:+233551234567" className="font-bold text-gray-900 hover:underline">+233 55 123 4567</a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail className="w-4 h-4 text-[#8A3D52]" />
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Email Inquiries</span>
                  <a href="mailto:crcosmetics.essential@gmail.com" className="font-bold text-gray-900 hover:underline">crcosmetics.essential@gmail.com</a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <MapPin className="w-4 h-4 text-[#8A3D52]" />
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Physical Store</span>
                  <span className="font-bold text-gray-900">Botwe School Junction, Accra, Ghana</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Clock className="w-4 h-4 text-[#8A3D52]" />
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Working Hours</span>
                  <span className="font-bold text-gray-900">Monday - Saturday: 9:00am - 8:00pm | Sunday: 12:00pm - 6:00pm</span>
                </div>
              </div>
            </div>

            <a
              href="https://wa.me/233551234567"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-[#8A3D52] hover:bg-[#732F42] text-white rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat Directly on WhatsApp</span>
            </a>
          </div>
        )}

      </div>
    </div>
  );
};
