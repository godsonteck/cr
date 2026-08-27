import React, { useState } from 'react';
import { Product } from '../../types';
import { PRODUCTS } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { X, Sparkles, Check, ArrowRight, Heart, ShoppingBag, RotateCcw } from 'lucide-react';

interface BeautyMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const BeautyMatchModal: React.FC<BeautyMatchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct
}) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedGoal, setSelectedGoal] = useState<string>('glowing-skin');
  const [selectedSkinType, setSelectedSkinType] = useState<string>('combination');
  const [selectedPreference, setSelectedPreference] = useState<string>('everyday');

  if (!isOpen) return null;

  const handleFinish = () => {
    setStep(3);
  };

  const getRecommendedProducts = (): Product[] => {
    if (selectedGoal === 'glowing-skin') {
      return PRODUCTS.filter(p => p.id === 'the-ordinary-niacinamide' || p.id === 'cosrx-snail-mucin-essence' || p.id === 'cerave-moisturising-cream');
    } else if (selectedGoal === 'fragrance') {
      return PRODUCTS.filter(p => p.id === 'la-vie-est-belle-eau-de-parfum' || p.id === 'chanel-coco-mademoiselle');
    } else if (selectedGoal === 'makeup') {
      return PRODUCTS.filter(p => p.id === 'fenty-gloss-bomb-universal' || p.id === 'luxury-pro-makeup-brush-set');
    } else {
      return PRODUCTS.filter(p => p.id === 'dove-body-lotion-hydrating' || p.id === 'nivea-soft-cream' || p.id === 'cr-exclusive-luxury-gift-hamper');
    }
  };

  const recommended = getRecommendedProducts();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-rose-100 relative space-y-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#8A3D52] text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>CR Beauty Match Finder</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
            Find Your Perfect Match
          </h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Answer a few quick questions and let our beauty curators recommend the ideal products for your skin and lifestyle.
          </p>
        </div>

        {/* Step 1: Beauty Goal */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              1. What is your primary beauty focus right now?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { id: 'glowing-skin', label: 'Clear & Glowing Skin', desc: 'Blemish control, deep hydration & radiant tone' },
                { id: 'fragrance', label: 'Luxury Fragrance & Scent', desc: 'Long-lasting iconic Eau de Parfum' },
                { id: 'makeup', label: 'Lip Glow & Makeup Tools', desc: 'Juicy glosses & professional brushes' },
                { id: 'body-care', label: 'Deep Body Moisture & Essentials', desc: 'Daily nourishing body creams & hampers' }
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => setSelectedGoal(option.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    selectedGoal === option.id
                      ? 'border-[#8A3D52] bg-rose-50/70 ring-1 ring-[#8A3D52]'
                      : 'border-gray-200 hover:border-rose-200 hover:bg-gray-50'
                  }`}
                >
                  <p className="font-extrabold text-gray-900">{option.label}</p>
                  <p className="text-[11px] text-gray-500 mt-1">{option.desc}</p>
                </button>
              ))}
            </div>

            <div className="pt-3">
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-[#8A3D52] hover:bg-[#732F42] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>Continue to Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Skin & Care Preference */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              2. What is your skin type or daily preference?
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { id: 'oily-combination', label: 'Oily / Combination', desc: 'Needs shine control & pore care' },
                { id: 'dry-normal', label: 'Dry to Very Dry', desc: 'Needs rich barrier nourishment' },
                { id: 'sensitive', label: 'Sensitive Skin', desc: 'Fragrance-free, gentle soothing' },
                { id: 'all-skin', label: 'Everyday Glow', desc: 'Universal daily essentials' }
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => setSelectedSkinType(option.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    selectedSkinType === option.id
                      ? 'border-[#8A3D52] bg-rose-50/70 ring-1 ring-[#8A3D52]'
                      : 'border-gray-200 hover:border-rose-200 hover:bg-gray-50'
                  }`}
                >
                  <p className="font-extrabold text-gray-900">{option.label}</p>
                  <p className="text-[11px] text-gray-500 mt-1">{option.desc}</p>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold"
              >
                Back
              </button>

              <button
                onClick={handleFinish}
                className="flex-1 py-3 bg-[#8A3D52] hover:bg-[#732F42] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Show My Personalized Matches</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Recommended Matches */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-800">
                Top Matches Curated For You ({recommended.length})
              </h3>
              <button
                onClick={() => setStep(1)}
                className="text-[11px] text-[#8A3D52] font-bold hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retake</span>
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {recommended.map(product => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between gap-3 p-3 bg-gray-50/70 border border-gray-200 rounded-2xl hover:border-rose-200 transition-colors"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-14 h-14 object-contain rounded-xl bg-white p-1 border border-gray-100 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black text-gray-500 uppercase">{product.brand}</span>
                    <h4 className="text-xs font-bold text-gray-900 truncate">{product.name}</h4>
                    <p className="text-xs font-black text-[#8A3D52]">GHS {product.price.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        addToCart(product, 1);
                        showToast(`Added ${product.name} to basket`);
                      }}
                      className="px-3 py-1.5 bg-[#8A3D52] hover:bg-[#732F42] text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-2xs"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
