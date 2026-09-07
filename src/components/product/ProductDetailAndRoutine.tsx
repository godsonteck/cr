import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  ChevronRight,
  Check,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  Zap,
  Clock,
  Share2,
  ChevronLeft,
  ChevronDown,
  Tag,
  PackageCheck,
  MessageCircle,
  Star,
  ThumbsUp,
  Camera,
  ImagePlus,
  X,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductVariant, ProductReview } from '../../types';
import { ProductCard } from './ProductCard';
import { Button, Badge } from '../common/UIPrimitives';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useReviews } from '../../context/ReviewsContext';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { api } from '../../lib/api';
import { SEO } from '../common/SEO';

const COLOR_SWATCHES: Record<string, string> = {
  black: '#171717', white: '#ffffff', red: '#c94b4b', blue: '#4b78c9', green: '#4d8b63', pink: '#db83a5', brown: '#8b5e3c', nude: '#c79578', gold: '#d4af37', silver: '#b8bec8', purple: '#8056a8', orange: '#df7b35', yellow: '#e0bb3f',
};

function FlashCountdown({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const calc = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Ended'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return <span className="font-mono font-black text-white text-base tracking-wider">{timeLeft}</span>;
}

export const ProductDetailPage: React.FC = () => {
  const { products, storeSettings, flashDeals, promoCodes } = useStore();
  const publishedProducts = products.filter(product => product.isPublished !== false);
  const { productId } = useParams<{ productId: string }>();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { markHelpful } = useReviews();
  const { user, isAuthenticated } = useAuth();
  const { showAlert } = useAlert();

  const product = useMemo(() => {
    return publishedProducts.find(p => p.id === productId);
  }, [productId, publishedProducts]);

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [selectedOptionValues, setSelectedOptionValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'reviews'>('description');
  const [descExpanded, setDescExpanded] = useState(false);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>,
  });
  const [reviewsList, setReviewsList] = useState<ProductReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [photoOnlyFilter, setPhotoOnlyFilter] = useState(false);
  const [helpfulVoted, setHelpfulVoted] = useState<Record<string, boolean>>({});

  // In-page review writer state
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewSkinType, setNewReviewSkinType] = useState('Combination');
  const [newReviewImages, setNewReviewImages] = useState<string[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadReviews = useCallback(async () => {
    if (!productId) return;
    setLoadingReviews(true);
    try {
      const data = await api.get<{
        reviews: ProductReview[];
        stats: { averageRating: number; totalReviews: number; distribution: Record<number, number> };
      }>(`/reviews?productId=${productId}`);
      if (data?.reviews) {
        setReviewsList(data.reviews);
      }
      if (data?.stats) {
        setRatingStats({
          averageRating: data.stats.averageRating ?? 0,
          totalReviews: data.stats.totalReviews ?? 0,
          distribution: data.stats.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        });
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  }, [productId]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (newReviewImages.length + files.length > 4) {
      showAlert('Maximum 4 photos per review.', 'error');
      return;
    }
    Array.from(files).forEach((file) => {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
        showAlert('Please choose JPG, PNG, or WEBP images only.', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showAlert('Photos must be under 5MB each.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const res = String(ev.target?.result || '');
        if (res) setNewReviewImages((prev) => [...prev, res]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleMarkHelpful = async (reviewId: string) => {
    if (helpfulVoted[reviewId]) return;
    try {
      await markHelpful(reviewId);
      setHelpfulVoted((prev) => ({ ...prev, [reviewId]: true }));
      setReviewsList((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r))
      );
      showAlert('Thank you for your feedback!', 'success');
    } catch {
      // Ignore
    }
  };

  const handleSubmitNewReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    if (!isAuthenticated) {
      showAlert('Please sign in to share a review.', 'info');
      navigate('/signin');
      return;
    }
    setIsSubmittingReview(true);
    try {
      await api.post('/reviews', {
        productId,
        rating: newReviewRating,
        title: newReviewTitle.trim() || undefined,
        comment: newReviewComment.trim(),
        skinType: newReviewSkinType,
        images: newReviewImages,
      });
      showAlert('Your review has been published! Thank you.', 'success');
      setIsWritingReview(false);
      setNewReviewTitle('');
      setNewReviewComment('');
      setNewReviewImages([]);
      void loadReviews();
      setActiveTab('reviews');
    } catch (err: any) {
      showAlert(err?.message || 'Failed to submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const filteredReviews = useMemo(() => {
    return reviewsList.filter((r) => {
      if (starFilter !== 'all' && r.rating !== starFilter) return false;
      if (photoOnlyFilter && (!r.images || r.images.length === 0)) return false;
      return true;
    });
  }, [reviewsList, starFilter, photoOnlyFilter]);

  const allCustomerPhotos = useMemo(() => {
    const photos: { url: string; authorName: string; rating: number }[] = [];
    reviewsList.forEach((r) => {
      if (r.images && Array.isArray(r.images)) {
        r.images.forEach((img) => photos.push({ url: img, authorName: r.authorName, rating: r.rating }));
      }
    });
    return photos;
  }, [reviewsList]);

  const galleryImages = product?.images?.length ? product.images : [product?.image].filter(Boolean) as string[];

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <p className="text-xs text-stone-500">The product you are looking for does not exist in our catalog.</p>
        <Link to="/shop"><Button variant="primary">Return to Shop</Button></Link>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const currentImage = selectedImage || product.image;
  const hasOptions = Boolean(product.options?.length);
  const activeVariant = selectedVariant;
  const activeFlashDeal = flashDeals.find(deal => deal.isActive && new Date(deal.expiresAt).getTime() > Date.now() && deal.productIds?.includes(product.id));
  const baseDisplayPrice = activeVariant?.price ?? product.price;
  const displayPrice = activeFlashDeal ? Math.max(0.01, baseDisplayPrice * (1 - activeFlashDeal.discountPercentage / 100)) : baseDisplayPrice;
  const displayOriginalPrice = activeFlashDeal ? baseDisplayPrice : product.originalPrice;
  const discountPct = displayOriginalPrice ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100) : (activeFlashDeal ? activeFlashDeal.discountPercentage : 0);
  const allOptionsSelected = !hasOptions || product.options!.every(option => Boolean(selectedOptionValues[option.name]));
  const canPurchase = hasOptions
    ? allOptionsSelected && Boolean(activeVariant?.inStock)
    : Boolean(activeVariant?.inStock ?? product.inStock);
  const availableStock = activeVariant?.stockCount ?? product.stockCount ?? 0;
  const relatedProducts = publishedProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 6);

  const handleAddToCart = () => {
    addToCart({ ...product, price: displayPrice, originalPrice: displayOriginalPrice, discountBadge: activeFlashDeal ? `-${activeFlashDeal.discountPercentage}%` : product.discountBadge }, quantity, activeVariant?.name, activeVariant);
  };

  const handleBuyNow = async () => {
    if (!canPurchase) return;
    await addToCart({ ...product, price: displayPrice, originalPrice: displayOriginalPrice, discountBadge: activeFlashDeal ? `-${activeFlashDeal.discountPercentage}%` : product.discountBadge }, quantity, activeVariant?.name, activeVariant);
    navigate('/checkout');
  };

  return (
    <>
      <SEO
        title={`${product.name} | ${storeSettings.storeName}`}
        description={`${product.name} by ${product.brand}. View price, availability, product details, and delivery information.`}
        type="product"
        productName={product.name}
        productPrice={displayPrice}
        productImage={currentImage}
        productDescription={product.description}
        productAvailability={product.inStock ? 'InStock' : 'OutOfStock'}
      />

      <div className="min-h-screen bg-[var(--bg-main)] py-4">
        <div className="mx-auto max-w-[1440px] px-3 sm:px-6">
          {/* Breadcrumbs */}
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-stone-500">
            <Link to="/" className="hover:text-[#FD384F] transition">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/shop" className="hover:text-[#FD384F] transition">Shop</Link>
            {product.categoryLabel && (
              <>
                <ChevronRight className="h-3 w-3" />
                <Link to={`/category/${product.category}`} className="hover:text-[#FD384F] transition">
                  {product.categoryLabel}
                </Link>
              </>
            )}
            <ChevronRight className="h-3 w-3" />
            <span className="max-w-[280px] break-words font-medium text-stone-900 dark:text-stone-100">
              {product.name}
            </span>
          </nav>

          {/* Main AliExpress 3-Column Card */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 shadow-sm sm:p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              
              {/* Column 1: Gallery with vertical thumbnail strip (lg:col-span-5) */}
              <div className="lg:col-span-5 flex flex-col-reverse gap-3 sm:flex-row">
                {/* Vertical Thumbnails */}
                {galleryImages.length > 1 && (
                  <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto max-h-[480px] no-scrollbar shrink-0">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        onMouseEnter={() => setSelectedImage(img)}
                        onClick={() => setSelectedImage(img)}
                        className={`relative h-14 w-14 sm:h-16 sm:w-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                          currentImage === img
                            ? 'border-black dark:border-white shadow-xs'
                            : 'border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100 dark:border-slate-700'
                        }`}
                      >
                        <img src={img} alt={`${product.name} ${idx + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Main Large Image */}
                <div className="relative flex-1 aspect-square rounded-xl overflow-hidden bg-[var(--bg-soft)] border border-[var(--border-color)] group">
                  {discountPct > 0 && (
                    <span className="absolute top-3 left-3 z-10 rounded-sm bg-[#FD384F] px-2 py-1 text-xs font-black text-white shadow-xs">
                      -{discountPct}%
                    </span>
                  )}
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Video Play Overlay Indicator */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-black/50 text-white flex items-center justify-center">
                      <Zap className="w-6 h-6 fill-white" />
                    </div>
                  </div>

                  {/* Share & Wishlist quick overlays on mobile */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 sm:hidden z-10">
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-stone-700"
                    >
                      <Heart className={`h-4 w-4 ${wishlisted ? 'fill-[#FD384F] text-[#FD384F]' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Column 2: Middle Details (lg:col-span-4 xl:col-span-4) */}
              <div className="lg:col-span-4 xl:col-span-4 flex flex-col space-y-3.5">
                {/* Product Title */}
                <h1 className="text-lg sm:text-xl font-bold leading-snug text-stone-900 dark:text-stone-100">
                  {product.name}
                </h1>

                {/* Rating & Review Counter */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          star <= Math.round(ratingStats.totalReviews > 0 ? ratingStats.averageRating : Number(product.rating || 5))
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('reviews');
                      document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs text-stone-600 underline hover:text-[#C86D51] dark:text-stone-300 font-medium"
                  >
                    {ratingStats.totalReviews > 0
                      ? `${ratingStats.averageRating.toFixed(1)} (${ratingStats.totalReviews} ${ratingStats.totalReviews === 1 ? 'review' : 'reviews'})`
                      : 'Be the first to review'}
                  </button>
                </div>

                {storeSettings.productDealLabel && (
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-sm bg-[#FFF4E6] px-2 py-0.5 text-[11px] font-bold text-[#D96B00] border border-[#FFE2C2]">
                      <Tag className="h-3 w-3" />
                      {storeSettings.productDealLabel}
                    </span>
                  </div>
                )}

                <div className="overflow-hidden rounded-xl border border-[#F5D89F] bg-[#FFFBF0] dark:bg-slate-800/90 dark:border-amber-900/60">
                  {(storeSettings.productSaleHeading || activeFlashDeal) && <div className="flex items-center justify-between bg-[#FCEECC] px-3.5 py-1.5 dark:bg-amber-950/40">
                    <span className="text-xs font-black uppercase tracking-wider text-[#9C3200] dark:text-amber-300">
                      {storeSettings.productSaleHeading || activeFlashDeal?.title}
                    </span>
                    {activeFlashDeal && <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#9C3200] dark:text-amber-300">
                      <Clock className="h-3 w-3" />
                      <span>Ends:</span>
                      <FlashCountdown expiresAt={activeFlashDeal.expiresAt} />
                    </div>}
                  </div>}

                  {/* Pricing Section */}
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-3xl font-black text-[#FD384F]">
                        GH₵{displayPrice.toFixed(2)}
                      </span>
                      {displayOriginalPrice && (
                        <span className="inline-flex items-center rounded-xs bg-[#FD384F]/10 px-1.5 py-0.5 text-xs font-bold text-[#FD384F]">
                          Save GH₵{(displayOriginalPrice - displayPrice).toFixed(2)}
                        </span>
                      )}
                      {displayOriginalPrice && (
                        <span className="text-xs text-stone-400 line-through">
                          GH₵{displayOriginalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {storeSettings.productWholesaleMessage && <div className="text-[11px] text-[#D9381E] flex items-center gap-1 font-semibold">
                      <Tag className="h-3 w-3" />
                      <span>{storeSettings.productWholesaleMessage}</span>
                    </div>}

                    {storeSettings.productPricingNote && <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight">
                      {storeSettings.productPricingNote}
                    </p>}

                    {storeSettings.productVoucherMessage && <div className="mt-1 flex items-center justify-between rounded-md bg-[#FFF0ED] px-2.5 py-1.5 text-[11px] font-bold text-[#FD384F] border border-[#FFD5CC] dark:bg-red-950/30">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 shrink-0" />
                        <span className="break-words">{storeSettings.productVoucherMessage}</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                    </div>}
                  </div>
                </div>

                {/* Color / Variant Selection */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
                    <span>Selected option:</span>
                    <span className="font-semibold text-stone-600 dark:text-stone-400">
                      {activeVariant?.name || Object.values(selectedOptionValues)[0] || 'Default'}
                    </span>
                  </div>

                  {/* Swatch options as clickable image/pill tiles */}
                  <div className="flex flex-wrap gap-2">
                    {product.variants && product.variants.length > 0 ? (
                      product.variants.map((v) => {
                        const isSelected = activeVariant?.id === v.id;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setSelectedVariant(v)}
                            className={`flex items-center gap-2 rounded-lg border-2 p-1 text-xs transition-all ${
                              isSelected
                                ? 'border-black bg-stone-50 font-bold dark:border-white dark:bg-slate-800'
                                : 'border-gray-200 hover:border-gray-400 dark:border-slate-700'
                            }`}
                          >
                            <img
                              src={product.image}
                              alt={v.name}
                              className="h-8 w-8 rounded-sm object-cover"
                            />
                            <span className="pr-1.5 text-[11px]">{v.name}</span>
                          </button>
                        );
                      })
                    ) : product.options && product.options.length > 0 ? (
                      product.options[0].values.map((val) => {
                        const isSelected = selectedOptionValues[product.options![0].name] === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() =>
                              setSelectedOptionValues({
                                ...selectedOptionValues,
                                [product.options![0].name]: val,
                              })
                            }
                            className={`flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-xs transition-all ${
                              isSelected
                                ? 'border-black bg-stone-50 font-bold dark:border-white dark:bg-slate-800'
                                : 'border-gray-200 hover:border-gray-400 dark:border-slate-700'
                            }`}
                          >
                            <span>{val}</span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg border-2 border-black p-1 dark:border-white">
                        <img src={product.image} alt={product.name} className="h-8 w-8 rounded-sm object-cover" />
                        <span className="pr-2 text-xs font-bold">Standard</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              <div className="lg:col-span-3 xl:col-span-3 flex flex-col justify-between rounded-xl border border-gray-200 bg-stone-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/50 space-y-4 sm:p-4">
                <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white dark:bg-slate-900 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center font-bold text-stone-600 hover:bg-stone-100 dark:hover:bg-slate-800 dark:text-stone-300"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-xs font-bold text-stone-900 dark:text-stone-100">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(availableStock || 99, quantity + 1))}
                        className="w-8 h-8 flex items-center justify-center font-bold text-stone-600 hover:bg-stone-100 dark:hover:bg-slate-800 dark:text-stone-300"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => void handleBuyNow()}
                    disabled={!canPurchase}
                    className="w-full h-11 rounded-full bg-[#FD384F] hover:bg-[#E02940] text-white font-bold text-sm tracking-wide shadow-md transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!canPurchase ? 'Out of Stock' : 'Buy now'}
                  </button>

                  <button
                    onClick={handleAddToCart}
                    disabled={!canPurchase}
                    className="w-full h-11 rounded-full border-2 border-[#FD384F] bg-[#FFF0F2] text-[#FD384F] hover:bg-[#FFE0E4] font-bold text-sm tracking-wide transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-950/40"
                  >
                    Add to cart
                  </button>

                  <div className="flex items-center justify-center gap-4 pt-1">
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: product.name, url: window.location.href });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                        }
                      }}
                      className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 transition"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share</span>
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`flex items-center gap-1.5 text-xs transition ${
                        wishlisted ? 'text-[#FD384F] font-bold' : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${wishlisted ? 'fill-[#FD384F]' : ''}`} />
                      <span>{wishlisted ? 'Saved' : 'Wishlist'}</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Product Specifications, Overview & Customer Reviews Tabs */}
          <div id="reviews" className="mt-8 rounded-3xl border border-[#F0E4DC] dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="flex border-b border-[#F0E4DC] bg-[#FCF9F7] dark:border-slate-800 dark:bg-slate-800/50 overflow-x-auto">
              {(['description', 'details', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-[#C86D51] text-[#C86D51] bg-white dark:bg-slate-900'
                      : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  {tab === 'description' && 'Overview'}
                  {tab === 'details' && 'Specifications'}
                  {tab === 'reviews' && (
                    <span className="flex items-center gap-1.5">
                      <span>Customer Reviews</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          activeTab === 'reviews'
                            ? 'bg-[#C86D51]/10 text-[#C86D51]'
                            : 'bg-stone-200 dark:bg-slate-700 text-stone-600 dark:text-stone-300'
                        }`}
                      >
                        {ratingStats.totalReviews}
                      </span>
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-6 text-sm leading-relaxed text-stone-800 dark:text-stone-200">
              {activeTab === 'description' && (
                <div>
                  <p className={`whitespace-pre-line text-sm leading-7 ${!descExpanded ? 'line-clamp-6' : ''}`}>
                    {product.description}
                  </p>
                  {product.description && product.description.length > 300 && (
                    <button
                      onClick={() => setDescExpanded(!descExpanded)}
                      className="mt-3 flex items-center gap-1 text-xs font-bold text-[#C86D51] hover:underline"
                    >
                      {descExpanded ? 'Show less' : 'Read more'}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${descExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'details' && (
                <div className="grid gap-0 divide-y divide-gray-100 dark:divide-slate-800">
                  {[
                    { label: 'Brand', value: product.brand },
                    { label: 'Category', value: product.categoryLabel },
                    product.origin ? { label: 'Origin', value: product.origin } : null,
                    product.unit ? { label: 'Unit / Size', value: product.unit } : null,
                    product.routineStep ? { label: 'Routine Step', value: product.routineStep } : null,
                    { label: 'Availability', value: product.inStock ? 'In Stock' : 'Out of Stock' },
                  ].filter(Boolean).map(({ label, value }: any) => (
                    <div key={label} className="flex items-center py-2.5">
                      <span className="w-36 shrink-0 text-xs text-stone-500 font-medium">{label}</span>
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100">{value}</span>
                    </div>
                  ))}
                  {product.details?.ingredients && (
                    <div className="py-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Ingredients</p>
                      <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">{product.details.ingredients}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-8">
                  {/* Ratings Overview Card */}
                  <div className="grid gap-6 rounded-2xl bg-[#FAF6F3] p-6 dark:bg-slate-800/60 sm:grid-cols-12 items-center border border-[#F0E4DC] dark:border-slate-700/60">
                    {/* Score Summary */}
                    <div className="sm:col-span-4 text-center sm:text-left sm:border-r border-[#E8D8CF] dark:border-slate-700 sm:pr-6">
                      <div className="flex flex-col sm:items-start items-center">
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif text-5xl font-black text-stone-900 dark:text-white">
                            {ratingStats.totalReviews > 0 ? ratingStats.averageRating.toFixed(1) : Number(product.rating || 5).toFixed(1)}
                          </span>
                          <span className="text-sm font-semibold text-stone-400">/ 5.0</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-5 w-5 ${
                                s <= Math.round(ratingStats.totalReviews > 0 ? ratingStats.averageRating : Number(product.rating || 5))
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-xs font-semibold text-stone-600 dark:text-stone-300">
                          {ratingStats.totalReviews > 0
                            ? `Based on ${ratingStats.totalReviews} verified ${ratingStats.totalReviews === 1 ? 'customer review' : 'customer reviews'}`
                            : 'Verified customer ratings'}
                        </p>

                        <button
                          onClick={() => setIsWritingReview(true)}
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1C1817] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#C86D51] dark:bg-stone-100 dark:text-[#1C1817] dark:hover:bg-[#C86D51] dark:hover:text-white transition shadow-sm"
                        >
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span>Write a Review</span>
                        </button>
                      </div>
                    </div>

                    {/* Star Progress Bars */}
                    <div className="sm:col-span-8 space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = ratingStats.distribution?.[stars] || 0;
                        const total = ratingStats.totalReviews || 1;
                        const pct = ratingStats.totalReviews > 0 ? Math.round((count / total) * 100) : 0;
                        const isSelected = starFilter === stars;
                        return (
                          <button
                            key={stars}
                            type="button"
                            onClick={() => setStarFilter(isSelected ? 'all' : stars)}
                            className={`flex w-full items-center gap-3 text-xs transition group py-0.5 px-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-slate-700/40 ${
                              isSelected ? 'ring-1 ring-[#C86D51] bg-white dark:bg-slate-700' : ''
                            }`}
                          >
                            <span className="w-12 text-left font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                              <span>{stars}</span>
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            </span>
                            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-stone-200 dark:bg-slate-700">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-[#C86D51] transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-16 text-right font-medium text-stone-500 dark:text-stone-400">
                              {count} ({pct}%)
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer Photos Gallery */}
                  {allCustomerPhotos.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-2">
                          <Camera className="h-4 w-4 text-[#C86D51]" />
                          <span>Customer Photos ({allCustomerPhotos.length})</span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => setPhotoOnlyFilter(!photoOnlyFilter)}
                          className={`text-xs font-bold transition ${
                            photoOnlyFilter ? 'text-[#C86D51] underline' : 'text-stone-500 hover:text-stone-800'
                          }`}
                        >
                          {photoOnlyFilter ? 'Show all reviews' : 'Filter by reviews with photos'}
                        </button>
                      </div>
                      <div className="flex gap-2.5 overflow-x-auto pb-2">
                        {allCustomerPhotos.map((photo, i) => (
                          <a
                            key={i}
                            href={photo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative group shrink-0 h-20 w-20 rounded-xl overflow-hidden border border-[#F0E4DC] dark:border-slate-700 shadow-xs hover:opacity-90 transition"
                            title={`Photo by ${photo.authorName}`}
                          >
                            <img src={photo.url} alt={`Customer photo ${i + 1}`} className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold">
                              View
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Write a Review In-Page Drawer */}
                  {isWritingReview && (
                    <div className="rounded-2xl border-2 border-[#C86D51]/30 bg-[#FFFDFB] dark:bg-slate-800/80 p-6 shadow-md transition-all space-y-4">
                      <div className="flex items-center justify-between border-b border-[#F0E4DC] dark:border-slate-700 pb-3">
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                          <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                            Write a Review for {product.name}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsWritingReview(false);
                            setNewReviewImages([]);
                          }}
                          className="rounded-lg p-1 text-stone-400 hover:text-stone-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSubmitNewReview} className="space-y-4 text-xs">
                        <div>
                          <label className="font-bold block mb-1.5 text-stone-800 dark:text-stone-200">Overall Rating</label>
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewReviewRating(star)}
                                className="p-1 transition hover:scale-110"
                              >
                                <Star
                                  className={`h-7 w-7 ${
                                    star <= newReviewRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="ml-2 font-bold text-amber-500 text-sm">{newReviewRating} / 5</span>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="font-bold block mb-1 text-stone-800 dark:text-stone-200">Review Headline (Optional)</label>
                            <input
                              type="text"
                              value={newReviewTitle}
                              onChange={(e) => setNewReviewTitle(e.target.value)}
                              placeholder="e.g. Excellent texture, works well!"
                              className="w-full rounded-xl border border-[#F0E4DC] dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs outline-none focus:border-[#C86D51]"
                            />
                          </div>
                          <div>
                            <label className="font-bold block mb-1 text-stone-800 dark:text-stone-200">Your Skin Type (Optional)</label>
                            <select
                              value={newReviewSkinType}
                              onChange={(e) => setNewReviewSkinType(e.target.value)}
                              className="w-full rounded-xl border border-[#F0E4DC] dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs outline-none focus:border-[#C86D51]"
                            >
                              <option value="Dry">Dry Skin</option>
                              <option value="Oily">Oily Skin</option>
                              <option value="Combination">Combination Skin</option>
                              <option value="Sensitive">Sensitive Skin</option>
                              <option value="Normal">Normal Skin</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="font-bold block mb-1 text-stone-800 dark:text-stone-200">Your Review</label>
                          <textarea
                            required
                            rows={4}
                            value={newReviewComment}
                            onChange={(e) => setNewReviewComment(e.target.value)}
                            placeholder="What did you like or dislike about this product? How did it feel in your routine?"
                            className="w-full rounded-xl border border-[#F0E4DC] dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs outline-none focus:border-[#C86D51] resize-none"
                          />
                        </div>

                        {/* Photo upload */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                              <Camera className="h-3.5 w-3.5 text-[#C86D51]" />
                              <span>Add Photos (Optional)</span>
                            </label>
                            <span className="text-[10px] text-stone-400 font-medium">
                              {newReviewImages.length}/4 uploaded
                            </span>
                          </div>

                          {newReviewImages.length > 0 && (
                            <div className="mb-2.5 flex flex-wrap gap-2">
                              {newReviewImages.map((img, idx) => (
                                <div key={idx} className="relative group h-16 w-16 rounded-xl overflow-hidden border border-[#F0E4DC] dark:border-slate-700 shadow-xs">
                                  <img src={img} alt={`Upload ${idx + 1}`} className="h-full w-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => setNewReviewImages((prev) => prev.filter((_, i) => i !== idx))}
                                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition"
                                    title="Remove photo"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {newReviewImages.length < 4 && (
                            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#F0E4DC] dark:border-slate-700 bg-[#FAF6F3]/70 dark:bg-slate-800/50 p-3 hover:border-[#C86D51] transition group">
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/jpg"
                                multiple
                                onChange={handlePhotoUpload}
                                className="hidden"
                              />
                              <ImagePlus className="h-4 w-4 text-[#C86D51] group-hover:scale-110 transition-transform" />
                              <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                                Upload photos of product or your skin results
                              </span>
                            </label>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmittingReview}
                            className="flex-1 rounded-xl text-xs font-bold bg-[#C86D51] text-white hover:bg-[#8A3D52]"
                          >
                            {isSubmittingReview ? 'Submitting...' : 'Post Public Review'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsWritingReview(false);
                              setNewReviewImages([]);
                            }}
                            className="rounded-xl px-4 text-xs font-bold"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-y border-stone-200 dark:border-slate-800 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-stone-500 mr-1 flex items-center gap-1">
                        <Filter className="h-3.5 w-3.5" /> Filter:
                      </span>
                      <button
                        type="button"
                        onClick={() => setStarFilter('all')}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                          starFilter === 'all'
                            ? 'bg-[#1C1817] text-white dark:bg-stone-100 dark:text-[#1C1817]'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-slate-800 dark:text-stone-300'
                        }`}
                      >
                        All ({ratingStats.totalReviews})
                      </button>
                      {[5, 4, 3, 2, 1].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStarFilter(s)}
                          className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                            starFilter === s
                              ? 'bg-[#1C1817] text-white dark:bg-stone-100 dark:text-[#1C1817]'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-slate-800 dark:text-stone-300'
                          }`}
                        >
                          {s} ★ ({ratingStats.distribution?.[s] || 0})
                        </button>
                      ))}
                    </div>

                    {allCustomerPhotos.length > 0 && (
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-600 dark:text-stone-300">
                        <input
                          type="checkbox"
                          checked={photoOnlyFilter}
                          onChange={(e) => setPhotoOnlyFilter(e.target.checked)}
                          className="rounded text-[#C86D51] focus:ring-[#C86D51]"
                        />
                        <span>Photos only</span>
                      </label>
                    )}
                  </div>

                  {/* Reviews List */}
                  {loadingReviews ? (
                    <div className="py-12 text-center text-xs text-stone-400">Loading reviews...</div>
                  ) : filteredReviews.length > 0 ? (
                    <div className="space-y-4">
                      {filteredReviews.map((rev) => (
                        <article
                          key={rev.id}
                          className="rounded-2xl border border-stone-200 dark:border-slate-800 bg-[#FCF9F7]/60 dark:bg-slate-800/40 p-5 space-y-3 transition hover:border-[#C86D51]/40"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center text-amber-400">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                {rev.skinType && (
                                  <span className="rounded-full bg-stone-200 dark:bg-slate-700 px-2.5 py-0.5 text-[10px] font-bold text-stone-700 dark:text-stone-300">
                                    Skin: {rev.skinType}
                                  </span>
                                )}
                              </div>

                              {rev.title && (
                                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 pt-1">{rev.title}</h4>
                              )}
                            </div>

                            <div className="text-right">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
                                <span>{rev.authorName}</span>
                                {rev.verifiedPurchase && (
                                  <span
                                    title="Verified Customer Purchase"
                                    className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400"
                                  >
                                    <CheckCircle2 className="h-3 w-3" />
                                    Verified
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-stone-400">
                                {rev.date || (rev as any).createdAt ? new Date(rev.date || (rev as any).createdAt).toLocaleDateString() : ''}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 whitespace-pre-line">
                            {rev.comment}
                          </p>

                          {/* Attached Photos */}
                          {rev.images && Array.isArray(rev.images) && rev.images.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {rev.images.map((img, idx) => (
                                <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block">
                                  <img
                                    src={img}
                                    alt={`Review photo by ${rev.authorName}`}
                                    className="h-18 w-18 rounded-xl object-cover border border-stone-200 dark:border-slate-700 hover:opacity-90 transition shadow-xs"
                                  />
                                </a>
                              ))}
                            </div>
                          )}

                          {/* Admin/Store Reply */}
                          {rev.adminReply && (
                            <div className="mt-2 rounded-xl bg-white dark:bg-slate-900/80 p-3.5 border border-[#F0E4DC] dark:border-slate-700 text-xs space-y-1">
                              <p className="font-bold text-[#C86D51] flex items-center gap-1.5">
                                <Sparkles className="h-3 w-3" /> Response from CR Cosmetics:
                              </p>
                              <p className="text-stone-600 dark:text-stone-300 leading-relaxed pl-4 border-l-2 border-[#C86D51]/40">
                                {rev.adminReply}
                              </p>
                            </div>
                          )}

                          {/* Helpful Counter */}
                          <div className="flex items-center justify-between border-t border-stone-100 dark:border-slate-800/80 pt-2.5 text-[11px] text-stone-500">
                            <span>Was this review helpful?</span>
                            <button
                              type="button"
                              onClick={() => handleMarkHelpful(rev.id)}
                              disabled={helpfulVoted[rev.id]}
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition ${
                                helpfulVoted[rev.id]
                                  ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 font-bold'
                                  : 'hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-600 dark:text-stone-400'
                              }`}
                            >
                              <ThumbsUp className="h-3 w-3" />
                              <span>Helpful ({rev.helpfulCount || 0})</span>
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-stone-300 dark:border-slate-700 p-8 text-center space-y-3">
                      <Star className="h-8 w-8 text-stone-300 mx-auto" />
                      <p className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                        {starFilter !== 'all' ? `No ${starFilter}-star reviews found.` : 'No reviews yet for this product.'}
                      </p>
                      <p className="text-xs text-stone-500 max-w-sm mx-auto">
                        Be the first customer to share your results, feedback, or routine experience.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsWritingReview(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#C86D51] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#8A3D52] transition shadow-sm"
                      >
                        <Star className="h-3.5 w-3.5 fill-white text-white" />
                        <span>Write the First Review</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-[#FD384F] rounded-full" />
                  <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">You May Also Like</h2>
                </div>
                <Link to="/shop" className="text-xs font-bold text-[#FD384F] hover:underline transition flex items-center gap-1">
                  View All <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                {relatedProducts.map((related) => (
                  <ProductCard key={related.id} product={related} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export const RoutineBuilderPage: React.FC = () => {
  const { addToCart } = useCart();
  const { products } = useStore();
  const publishedProducts = products.filter(product => product.isPublished !== false);

  const cleansers = publishedProducts.filter(p => p.routineStep === 'cleanse' || p.category === 'skincare').slice(0, 2);
  const treats = publishedProducts.filter(p => p.routineStep === 'treat' || p.id === 'the-ordinary-niacinamide');
  const hydrators = publishedProducts.filter(p => p.routineStep === 'hydrate' || p.id === 'cerave-moisturising-cream');

  const [selectedCleanser, setSelectedCleanser] = useState(cleansers[0]);
  const [selectedTreat, setSelectedTreat] = useState(treats[0]);
  const [selectedHydrate, setSelectedHydrate] = useState(hydrators[0]);

  const handleAddFullRoutine = () => {
    if (selectedCleanser) addToCart(selectedCleanser, 1);
    if (selectedTreat) addToCart(selectedTreat, 1);
    if (selectedHydrate) addToCart(selectedHydrate, 1);
  };

  const routineTotal = (selectedCleanser?.price || 0) + (selectedTreat?.price || 0) + (selectedHydrate?.price || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-12">
      <div className="mx-auto max-w-4xl rounded-3xl bg-[#1C1817] p-6 text-center text-white space-y-4 sm:p-10">
        <span className="inline-flex items-center gap-1.5 bg-[#FF6B00] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          Interactive Regimen Tool
        </span>
        <h1 className="text-2xl leading-tight font-extrabold uppercase sm:text-4xl">
          Build Your 4-Step Skincare Routine
        </h1>
        <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto">
          Dermatologically matched formulations designed to target acne, hyperpigmentation, dehydration, and barrier restoration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Step 01 • Cleanse', title: 'Purify & Balance', product: selectedCleanser },
          { label: 'Step 02 • Treat', title: 'Concentrated Active Serum', product: selectedTreat },
          { label: 'Step 03 • Hydrate', title: 'Barrier Repair Cream', product: selectedHydrate },
        ].map(({ label, title, product: step }) => (
          <div key={label} className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-color)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#FF6B00] uppercase">{label}</span>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
            {step && (
              <div className="space-y-3">
                <img src={step.image} alt={step.name} className="w-full h-40 object-cover rounded-xl" />
                <h4 className="text-xs font-bold text-[var(--text-primary)]">{step.name}</h4>
                <span className="text-sm font-extrabold text-[#FF6B00]">GHS {step.price.toFixed(2)}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-[#1C1817] text-white p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
        <div>
          <span className="text-xs text-stone-400 font-semibold block">Complete Regimen Bundle</span>
          <span className="text-2xl font-extrabold">Total: GHS {routineTotal.toFixed(2)}</span>
        </div>
        <Button size="lg" variant="secondary" onClick={handleAddFullRoutine} className="rounded-full px-8 py-4 text-xs font-bold uppercase tracking-wider w-full sm:w-auto">
          <ShoppingCart className="w-4 h-4" />
          <span>Add Full Routine to Cart</span>
        </Button>
      </div>
    </div>
  );
};
