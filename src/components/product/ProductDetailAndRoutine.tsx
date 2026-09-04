import React, { useState, useMemo, useEffect } from 'react';
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
  Star,
  Zap,
  Clock,
  Share2,
  ChevronLeft,
  ChevronDown,
  Tag,
  PackageCheck,
  MessageCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductVariant } from '../../types';
import { ProductCard } from './ProductCard';
import { Button, Badge } from '../common/UIPrimitives';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
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
  const { products, storeSettings, flashDeals } = useStore();
  const publishedProducts = products.filter(product => product.isPublished !== false);
  const { productId } = useParams<{ productId: string }>();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const product = useMemo(() => {
    return publishedProducts.find(p => p.id === productId);
  }, [productId, publishedProducts]);

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [selectedOptionValues, setSelectedOptionValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'delivery'>('description');
  const [descExpanded, setDescExpanded] = useState(false);

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
        title={`${product.name} | CR Cosmetics and Essential`}
        description={`${product.name} by ${product.brand}. View price, availability, product details, and delivery information.`}
        type="product"
        productName={product.name}
        productPrice={displayPrice}
        productImage={currentImage}
        productDescription={product.description}
        productAvailability={product.inStock ? 'InStock' : 'OutOfStock'}
      />

      <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#0B1523] py-4">
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
            <span className="text-stone-900 dark:text-stone-100 font-medium truncate max-w-[280px]">
              {product.name}
            </span>
          </nav>

          {/* Main AliExpress 3-Column Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              
              {/* Column 1: Gallery with vertical thumbnail strip (lg:col-span-5) */}
              <div className="lg:col-span-5 flex flex-col-reverse sm:flex-row gap-3">
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
                <div className="relative flex-1 aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 dark:bg-slate-800 dark:border-slate-700 group">
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

                {/* Ratings & Sold Stats */}
                <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300 flex-wrap">
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          star <= Math.round(product.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300 dark:text-stone-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-stone-800 dark:text-stone-100">{product.rating.toFixed(1)}</span>
                  <a href="#reviews" className="underline hover:text-[#FD384F]">
                    {product.reviewCount || 580} Reviews
                  </a>
                  <span>|</span>
                  <span className="font-semibold text-stone-700 dark:text-stone-300">1,000+ sold</span>
                </div>

                {/* Deal Tag */}
                <div>
                  <span className="inline-flex items-center gap-1 rounded-sm bg-[#FFF4E6] px-2 py-0.5 text-[11px] font-bold text-[#D96B00] border border-[#FFE2C2]">
                    <Tag className="h-3 w-3" />
                    Best price in similar deals
                  </span>
                </div>

                {/* AliExpress "FALL FEST SALE" / "SUPER DEALS" Promo Box */}
                <div className="overflow-hidden rounded-xl border border-[#F5D89F] bg-[#FFFBF0] dark:bg-slate-800/90 dark:border-amber-900/60">
                  {/* Top Bar of Sale Box */}
                  <div className="flex items-center justify-between bg-[#FCEECC] px-3.5 py-1.5 dark:bg-amber-950/40">
                    <span className="text-xs font-black uppercase tracking-wider text-[#9C3200] dark:text-amber-300">
                      {activeFlashDeal?.title || 'FALL FEST SALE'}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#9C3200] dark:text-amber-300">
                      <Clock className="h-3 w-3" />
                      <span>Ends:</span>
                      {activeFlashDeal ? (
                        <FlashCountdown expiresAt={activeFlashDeal.expiresAt} />
                      ) : (
                        <span>Limited Time</span>
                      )}
                    </div>
                  </div>

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

                    {/* Wholesale discount notice */}
                    <div className="text-[11px] text-[#D9381E] flex items-center gap-1 font-semibold">
                      <Tag className="h-3 w-3" />
                      <span>Wholesale: 2+ pieces, extra 1% off</span>
                    </div>

                    {/* Tax & Coins info */}
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight">
                      Tax excluded, add at checkout if applicable · Extra 5% off with coins
                    </p>

                    {/* Discount voucher banner */}
                    <div className="mt-1 flex items-center justify-between rounded-md bg-[#FFF0ED] px-2.5 py-1.5 text-[11px] font-bold text-[#FD384F] border border-[#FFD5CC] dark:bg-red-950/30">
                      <div className="flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 shrink-0" />
                        <span>GH₵25.49 off on orders over GH₵190.00</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Color / Variant Selection */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
                    <span>Color / Variant:</span>
                    <span className="font-semibold text-stone-600 dark:text-stone-400">
                      {activeVariant?.name || Object.values(selectedOptionValues)[0] || 'Default'}
                    </span>
                    <span className="text-rose-500">🔥</span>
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

                {/* AI Overview Accordion */}
                <details className="group rounded-xl border border-purple-200 bg-purple-50/50 p-3 text-xs dark:bg-purple-950/20 dark:border-purple-900/50">
                  <summary className="flex cursor-pointer items-center justify-between font-bold text-purple-900 dark:text-purple-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                      AI overview of item
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="mt-2 space-y-1.5 text-stone-700 dark:text-stone-300 leading-relaxed pl-5 list-disc">
                    <p>• {product.description.slice(0, 140)}...</p>
                    {product.highlights?.slice(0, 2).map((h, idx) => (
                      <p key={idx}>• {h}</p>
                    ))}
                  </div>
                </details>
              </div>

              {/* Column 3: AliExpress Right Buy Box / Service Commitment (lg:col-span-3 xl:col-span-3) */}
              <div className="lg:col-span-3 xl:col-span-3 flex flex-col justify-between rounded-xl border border-gray-200 bg-stone-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50 space-y-4">
                
                {/* Store Info */}
                <div className="space-y-1 border-b border-gray-200 pb-3 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500">Sold By</span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-sm">Verified</span>
                  </div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {storeSettings.storeName || 'CR Cosmetics Official'}
                  </h3>
                  <p className="text-[11px] text-stone-500">98.6% Positive Feedback</p>
                </div>

                {/* Service Commitment Box */}
                <div className="space-y-3 text-xs">
                  <p className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    Service commitment
                  </p>

                  <div className="space-y-2 text-stone-600 dark:text-stone-300 text-[11px]">
                    <div className="flex items-start gap-2">
                      <Truck className="h-3.5 w-3.5 shrink-0 text-stone-500 mt-0.5" />
                      <div>
                        <span className="font-bold text-stone-800 dark:text-stone-200">
                          Shipping: GH₵{Number(storeSettings.standardShippingFee || 18.86).toFixed(2)}
                        </span>
                        <p className="text-stone-500">
                          Estimated Delivery: 1–3 business days across Accra & beyond
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <RotateCcw className="h-3.5 w-3.5 shrink-0 text-stone-500 mt-0.5" />
                      <div>
                        <span className="font-bold text-stone-800 dark:text-stone-200">Return & refund policy</span>
                        <p className="text-stone-500">7-day buyer protection & easy returns</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-stone-500 mt-0.5" />
                      <div>
                        <span className="font-bold text-stone-800 dark:text-stone-200">Security & Privacy</span>
                        <p className="text-stone-500">Safe payments via Paystack</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quantity & CTA Area */}
                <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-slate-700">
                  {/* Quantity Selector */}
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

                  {/* Big Primary Red Action: "Buy now" (AliExpress signature style) */}
                  <button
                    onClick={() => void handleBuyNow()}
                    disabled={!canPurchase}
                    className="w-full h-11 rounded-full bg-[#FD384F] hover:bg-[#E02940] text-white font-bold text-sm tracking-wide shadow-md transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!canPurchase ? 'Out of Stock' : 'Buy now'}
                  </button>

                  {/* Secondary Action: "Add to cart" */}
                  <button
                    onClick={handleAddToCart}
                    disabled={!canPurchase}
                    className="w-full h-11 rounded-full border-2 border-[#FD384F] bg-[#FFF0F2] text-[#FD384F] hover:bg-[#FFE0E4] font-bold text-sm tracking-wide transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-950/40"
                  >
                    Add to cart
                  </button>

                  {/* Share & Wishlist buttons row */}
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

          {/* Product Specifications & Details Tabs */}
          <div id="reviews" className="mt-6 rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex border-b border-gray-200 bg-stone-50 dark:border-slate-800 dark:bg-slate-800/50">
              {(['description', 'details', 'delivery'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
                    activeTab === tab
                      ? 'border-[#FD384F] text-[#FD384F] bg-white dark:bg-slate-900'
                      : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  {tab === 'description' ? 'Overview' : tab === 'details' ? 'Specifications' : 'Customer Service & Shipping'}
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
                      className="mt-3 flex items-center gap-1 text-xs font-bold text-[#FD384F] hover:underline"
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

              {activeTab === 'delivery' && (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { icon: Truck, title: 'Standard Delivery', desc: `GHS ${Number(storeSettings.standardShippingFee || 18.86).toFixed(2)} · 1–3 business days` },
                      { icon: PackageCheck, title: 'Free Delivery', desc: `On orders above GHS ${Number(storeSettings.freeDeliveryThreshold || 300).toFixed(0)}` },
                      { icon: RotateCcw, title: 'Returns Policy', desc: '7-day easy return policy for damaged or defective items' },
                      { icon: ShieldCheck, title: 'Buyer Protection', desc: '100% authentic products guaranteed with verified payment protection' },
                    ].map(({ icon: Icon, title, desc }) => (
                      <div key={title} className="flex gap-3 rounded-xl border border-gray-200 bg-stone-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                        <Icon className="h-5 w-5 shrink-0 text-[#FD384F] mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-stone-900 dark:text-stone-100">{title}</p>
                          <p className="text-xs text-stone-500 mt-0.5">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
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
