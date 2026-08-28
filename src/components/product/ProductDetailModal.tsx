import React, { useState } from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { useReviews } from '../../context/ReviewsContext';
import { AccraDeliveryBadge } from './AccraDeliveryBadge';
import { 
  X, 
  Heart, 
  ShoppingBag, 
  Star, 
  ShieldCheck, 
  Truck, 
  MessageCircle, 
  Check, 
  Plus, 
  Minus,
  Sparkles,
  ThumbsUp,
  MessageSquare,
  UserCheck,
  Award,
  Send
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectRelated: (product: Product) => void;
}

const SKIN_TYPE_OPTIONS = [
  'Oily / Acne-Prone',
  'Dry & Dehydrated',
  'Combination Skin',
  'Sensitive Skin',
  'Normal Skin',
  'Perfume / Fragrance Lover',
  'Daily Essentials'
];

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onSelectRelated
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const { getReviewsForProduct, getProductRatingStats, addReview, markHelpful } = useReviews();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'benefits' | 'how-to-use' | 'ingredients' | 'reviews'>('benefits');

  // Review Form State
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerSkinType, setReviewerSkinType] = useState('Oily / Acne-Prone');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  if (!product) return null;

  const isFavorited = isInWishlist(product.id);
  const productReviews = getReviewsForProduct(product.id);
  const { averageRating, totalReviews, distribution } = getProductRatingStats(
    product.id, 
    product.rating, 
    product.reviewCount
  );

  const handleAdd = () => {
    addToCart(product, quantity);
    showToast(`Added ${quantity} × ${product.name} to basket`);
    onClose();
  };

  const handleWhatsAppOrder = () => {
    const text = `Hello CR Cosmetics & Essential! I'd like to order:
• ${product.name} (${product.brand})
• Quantity: ${quantity}
• Price: GHS ${(product.price * quantity).toFixed(2)}
Please confirm availability and dispatch to Accra. Thank you!`;
    window.open(`https://wa.me/233551234567?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) {
      showToast('Please provide your name and review comments.');
      return;
    }

    setIsSubmittingReview(true);
    setTimeout(() => {
      addReview({
        productId: product.id,
        authorName: reviewerName.trim(),
        rating: reviewRating,
        title: reviewTitle.trim() || 'Verified Customer Review',
        comment: reviewComment.trim(),
        verifiedPurchase: true,
        skinType: reviewerSkinType
      });

      setIsSubmittingReview(false);
      setIsWritingReview(false);
      setReviewComment('');
      setReviewTitle('');
      showToast('Thank you! Your verified review has been published.');
      setActiveTab('reviews');
    }, 400);
  };

  const ratingDescriptions: Record<number, string> = {
    1: '1 Star - Disappointed',
    2: '2 Stars - Fair',
    3: '3 Stars - Average',
    4: '4 Stars - Good & Effective',
    5: '5 Stars - Excellent & Authentic!'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="bg-white dark:bg-[#15161E] rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-rose-100 dark:border-gray-800 relative space-y-6 max-h-[90vh] overflow-y-auto transition-colors"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Main Product Presentation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-start">
          
          {/* Left: Product Image */}
          <div className="space-y-3">
            <div className="w-full aspect-square rounded-2xl bg-[#FAF6F4] dark:bg-[#1A1C26] p-4 flex items-center justify-center border border-gray-100 dark:border-gray-800 relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal rounded-xl"
              />
              {product.badge && (
                <span className="absolute top-3 left-3 bg-[#8A3D52] dark:bg-[#A25F6F] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Authenticity Badge */}
            <div className="bg-rose-50/70 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 rounded-xl p-3 text-xs text-[#8A3D52] dark:text-rose-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#8A3D52] dark:text-rose-400" />
              <span className="font-semibold">Guaranteed 100% Original & Authentic</span>
            </div>
          </div>

          {/* Right: Details & Purchase */}
          <div className="space-y-4">
            
            <div>
              <span className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
                {product.brand}
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-gray-900 dark:text-white mt-0.5">
                {product.name}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{product.unit}</p>
            </div>

            {/* Rating Summary Header with clickable link to review tab */}
            <div 
              onClick={() => setActiveTab('reviews')}
              className="flex items-center gap-2 text-xs cursor-pointer group hover:opacity-90"
            >
              <div className="flex text-[#D4AF37]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-3.5 h-3.5 ${star <= Math.round(averageRating) ? 'fill-current text-[#D4AF37]' : 'text-gray-300 dark:text-gray-600'}`} 
                  />
                ))}
              </div>
              <span className="font-bold text-gray-800 dark:text-gray-200">{averageRating.toFixed(1)}</span>
              <span className="text-gray-400 dark:text-gray-500 underline decoration-rose-200 group-hover:text-[#8A3D52] dark:group-hover:text-rose-400">
                ({totalReviews} customer reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
                GHS {product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                  GHS {product.originalPrice.toFixed(2)}
                </span>
              )}
              {product.discountBadge && (
                <span className="bg-[#8A3D52] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  {product.discountBadge}
                </span>
              )}
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {product.description}
            </p>

            {/* Highlights bullet list */}
            <div className="space-y-1.5 pt-1">
              {product.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                  <Check className="w-3.5 h-3.5 text-[#8A3D52] dark:text-rose-400 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>

            {/* Dynamic Accra Delivery Estimation Badge */}
            <AccraDeliveryBadge productPrice={product.price * quantity} />

            {/* Quantity Stepper & Add to Bag */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
              
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[#1E202B] p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white rounded hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-gray-900 dark:text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white rounded hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Basket Button */}
                <button
                  onClick={handleAdd}
                  className="flex-1 py-2.5 bg-[#8A3D52] hover:bg-[#732F42] text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag • GHS {(product.price * quantity).toFixed(2)}</span>
                </button>

                {/* Heart Wishlist Toggle */}
                <button
                  onClick={() => {
                    toggleWishlist(product.id);
                    showToast(isFavorited ? 'Removed from saved favorites' : 'Saved to favorites');
                  }}
                  className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-400 dark:text-gray-500 hover:text-[#8A3D52] dark:hover:text-rose-400 transition-colors cursor-pointer"
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-[#8A3D52] text-[#8A3D52] dark:fill-rose-400 dark:text-rose-400' : ''}`} />
                </button>
              </div>

              {/* Instant WhatsApp Order CTA */}
              <button
                onClick={handleWhatsAppOrder}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Instant Order via WhatsApp (+233 55 123 4567)</span>
              </button>

            </div>

          </div>

        </div>

        {/* Tabbed Info for Benefits, How to use, Ingredients & Customer Reviews */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-xs">
          
          <div className="flex flex-wrap gap-4 border-b border-gray-100 dark:border-gray-800 pb-2 font-bold text-gray-600 dark:text-gray-400">
            <button
              onClick={() => setActiveTab('benefits')}
              className={`pb-1 transition-colors cursor-pointer ${activeTab === 'benefits' ? 'text-[#8A3D52] dark:text-rose-400 border-b-2 border-[#8A3D52] dark:border-rose-400' : 'hover:text-gray-900 dark:hover:text-white'}`}
            >
              Key Benefits
            </button>
            {product.details?.howToUse && (
              <button
                onClick={() => setActiveTab('how-to-use')}
                className={`pb-1 transition-colors cursor-pointer ${activeTab === 'how-to-use' ? 'text-[#8A3D52] dark:text-rose-400 border-b-2 border-[#8A3D52] dark:border-rose-400' : 'hover:text-gray-900 dark:hover:text-white'}`}
              >
                How To Use
              </button>
            )}
            {product.details?.ingredients && (
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`pb-1 transition-colors cursor-pointer ${activeTab === 'ingredients' ? 'text-[#8A3D52] dark:text-rose-400 border-b-2 border-[#8A3D52] dark:border-rose-400' : 'hover:text-gray-900 dark:hover:text-white'}`}
              >
                Ingredients
              </button>
            )}
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-1 transition-colors cursor-pointer flex items-center gap-1.5 ${activeTab === 'reviews' ? 'text-[#8A3D52] dark:text-rose-400 border-b-2 border-[#8A3D52] dark:border-rose-400' : 'hover:text-gray-900 dark:hover:text-white'}`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Customer Reviews ({totalReviews})</span>
            </button>
          </div>

          <div className="pt-3 text-gray-600 dark:text-gray-300 leading-relaxed">
            
            {activeTab === 'benefits' && (
              <p>{product.details?.benefits || product.description}</p>
            )}

            {activeTab === 'how-to-use' && (
              <p>{product.details?.howToUse}</p>
            )}

            {activeTab === 'ingredients' && (
              <p className="font-mono text-[11px] bg-gray-50 dark:bg-[#1E202B] p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200">{product.details?.ingredients}</p>
            )}

            {/* CUSTOMER REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="space-y-6 pt-1">
                
                {/* Rating Distribution & Write Review CTA */}
                <div className="bg-[#FAF5F4] dark:bg-[#1A1C26] p-4 sm:p-5 rounded-2xl border border-rose-100/90 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
                  
                  {/* Left score summary */}
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    <div>
                      <span className="text-3xl sm:text-4xl font-serif font-extrabold text-gray-900 dark:text-white block">
                        {averageRating.toFixed(1)}
                      </span>
                      <div className="flex text-[#D4AF37] justify-center sm:justify-start mt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-3.5 h-3.5 ${star <= Math.round(averageRating) ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 block">
                        Based on {totalReviews} reviews
                      </span>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-1 w-32 sm:w-40">
                      {[5, 4, 3, 2, 1].map((ratingNum) => {
                        const pct = distribution[ratingNum] || 0;
                        return (
                          <div key={ratingNum} className="flex items-center gap-2 text-[10px]">
                            <span className="w-3 font-bold text-gray-500 dark:text-gray-400">{ratingNum}★</span>
                            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#8A3D52] dark:bg-rose-400 rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-6 text-right text-gray-400 dark:text-gray-500">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Write Review Trigger */}
                  <div className="text-center sm:text-right">
                    <button
                      onClick={() => setIsWritingReview(!isWritingReview)}
                      className="px-5 py-2.5 bg-[#8A3D52] hover:bg-[#732F42] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 mx-auto sm:ml-auto"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-rose-200" />
                      <span>{isWritingReview ? 'Close Review Form' : 'Write a Product Review'}</span>
                    </button>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">
                      Share your skin experience with the CR Community
                    </p>
                  </div>

                </div>

                {/* INLINE WRITE REVIEW FORM */}
                {isWritingReview && (
                  <form onSubmit={handleReviewSubmit} className="bg-white dark:bg-[#1E202B] border-2 border-[#8A3D52]/30 dark:border-rose-500/40 rounded-2xl p-5 space-y-4 animate-fadeIn shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                      <h4 className="font-serif font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#8A3D52] dark:text-rose-400" />
                        <span>Write Your Verified Review</span>
                      </h4>
                      <span className="text-[11px] text-[#8A3D52] dark:text-rose-400 font-semibold">
                        {ratingDescriptions[hoverRating || reviewRating]}
                      </span>
                    </div>

                    {/* Star selector */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Your Rating *</label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="p-1 text-gray-300 dark:text-gray-600 hover:text-[#D4AF37] transition-colors cursor-pointer"
                          >
                            <Star className={`w-6 h-6 ${(hoverRating || reviewRating) >= star ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-300 dark:text-gray-600'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Your Name / Alias *</label>
                        <input
                          type="text"
                          required
                          value={reviewerName}
                          onChange={e => setReviewerName(e.target.value)}
                          placeholder="e.g. Akosua Mensah"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161720] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-xs focus:bg-white dark:focus:bg-[#161720] focus:outline-none focus:ring-1 focus:ring-[#8A3D52]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Your Skin Profile / Interest</label>
                        <select
                          value={reviewerSkinType}
                          onChange={e => setReviewerSkinType(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161720] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-xs focus:bg-white dark:focus:bg-[#161720] focus:outline-none focus:ring-1 focus:ring-[#8A3D52]"
                        >
                          {SKIN_TYPE_OPTIONS.map(opt => (
                            <option key={opt} value={opt} className="dark:bg-[#161720]">{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Headline / Review Title</label>
                        <input
                          type="text"
                          value={reviewTitle}
                          onChange={e => setReviewTitle(e.target.value)}
                          placeholder="e.g. Cleared my hyperpigmentation in 3 weeks!"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161720] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-xs focus:bg-white dark:focus:bg-[#161720] focus:outline-none focus:ring-1 focus:ring-[#8A3D52]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Detailed Review & Texture Experience *</label>
                        <textarea
                          required
                          rows={3}
                          value={reviewComment}
                          onChange={e => setReviewComment(e.target.value)}
                          placeholder="How did this product feel? Did it work for your skin under Ghana's weather? How was the delivery?"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161720] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-xs focus:bg-white dark:focus:bg-[#161720] focus:outline-none focus:ring-1 focus:ring-[#8A3D52]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsWritingReview(false)}
                        className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="px-5 py-2 bg-[#8A3D52] hover:bg-[#732F42] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        {isSubmittingReview ? (
                          <span>Publishing...</span>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Publish Review</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* List of Verified Reviews */}
                <div className="space-y-4">
                  {productReviews.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 dark:text-gray-500 space-y-1">
                      <p className="font-semibold text-gray-600 dark:text-gray-300">Be the first to review this original item!</p>
                      <p className="text-[11px]">Click "Write a Product Review" to share your experience.</p>
                    </div>
                  ) : (
                    productReviews.map(rev => (
                      <div key={rev.id} className="p-4 bg-gray-50/70 dark:bg-[#191A24] rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                        
                        {/* Top: Stars, Name & Verified Badge */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <div className="flex text-[#D4AF37]">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`w-3 h-3 ${star <= rev.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} 
                                />
                              ))}
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white text-xs">{rev.authorName}</span>
                            {rev.verifiedPurchase && (
                              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.2 rounded-full flex items-center gap-0.5 border border-emerald-200 dark:border-emerald-800">
                                <UserCheck className="w-2.5 h-2.5" />
                                <span>Verified Buyer</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">{rev.date}</span>
                        </div>

                        {/* Skin Type Tag */}
                        {rev.skinType && (
                          <div className="inline-block">
                            <span className="text-[10px] bg-rose-50 dark:bg-rose-950/60 text-[#8A3D52] dark:text-rose-300 font-semibold px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-900/40">
                              Skin: {rev.skinType}
                            </span>
                          </div>
                        )}

                        {/* Title & Comment */}
                        {rev.title && (
                          <h5 className="font-bold text-gray-900 dark:text-white text-xs">{rev.title}</h5>
                        )}
                        <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                          {rev.comment}
                        </p>

                        {/* Helpful footer */}
                        <div className="flex items-center justify-between pt-1 text-[11px] text-gray-400 dark:text-gray-500">
                          <span className="text-[10px]">100% Genuine product verification</span>
                          <button
                            onClick={() => {
                              markHelpful(rev.id);
                              showToast('Marked review as helpful!');
                            }}
                            className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer transition-colors"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Helpful ({rev.helpfulCount})</span>
                          </button>
                        </div>

                      </div>
                    ))
                  )}
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
