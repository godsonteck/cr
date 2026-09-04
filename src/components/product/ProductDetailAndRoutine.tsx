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

      <div className="min-h-screen bg-[#f5f1ee]">
        <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
          <div className="rounded-[30px] border border-[#ebdfe5] bg-[#f7f3f2] p-3 sm:p-4">
            <div className="mb-4 px-1">
              <nav className="flex items-center gap-1.5 text-[11px] text-[var(--text-subtle)]">
                <Link to="/" className="hover:text-[#ff7a00] transition">Home</Link>
                <ChevronRight className="h-3 w-3" />
                <Link to="/shop" className="hover:text-[#ff7a00] transition">Shop</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-[var(--text-primary)] truncate max-w-[200px]">{product.name}</span>
              </nav>
            </div>

            {activeFlashDeal && (
              <div className="mb-4 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#ff7a00] to-[#ff9d48] px-4 py-3 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                      <Zap className="h-3.5 w-3.5 text-white fill-white" />
                      <span className="text-white text-xs font-black uppercase tracking-wider">Flash Sale</span>
                    </div>
                    <span className="text-white/90 text-xs font-semibold">{activeFlashDeal.discountPercentage}% OFF · Limited Time</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-white/80" />
                    <span className="text-white/80 text-xs">Ends in</span>
                    <FlashCountdown expiresAt={activeFlashDeal.expiresAt} />
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-5 lg:grid-cols-[470px_minmax(0,1fr)] xl:grid-cols-[560px_minmax(0,1fr)]">
              <div className="space-y-3">
                <div className="relative rounded-[26px] overflow-hidden bg-[#efefee] border border-[#e7dfe2] aspect-[1.08] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)]">
                  {discountPct > 0 && (
                    <div className="absolute top-3 left-3 z-10 bg-[#ff5e2e] text-white text-[11px] font-black px-2.5 py-1.5 rounded-full shadow-sm">
                      -{discountPct}%
                    </div>
                  )}
                  {product.badge && product.badge !== 'Sale' && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge variant="secondary">{product.badge}</Badge>
                    </div>
                  )}
                  <img src={currentImage} alt={product.name} className="h-full w-full object-contain p-4 sm:p-6" />
                  {galleryImages.length > 1 && (
                    <>
                      <button onClick={() => { const idx = galleryImages.indexOf(currentImage); setSelectedImage(galleryImages[(idx - 1 + galleryImages.length) % galleryImages.length]); }} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/20 rounded-full flex items-center justify-center text-white hover:bg-black/30 transition lg:hidden">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button onClick={() => { const idx = galleryImages.indexOf(currentImage); setSelectedImage(galleryImages[(idx + 1) % galleryImages.length]); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/20 rounded-full flex items-center justify-center text-white hover:bg-black/30 transition lg:hidden">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>

                {galleryImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {galleryImages.map((img, idx) => (
                      <button key={idx} onClick={() => setSelectedImage(img)} className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${currentImage === img ? 'border-[#ff7a00] shadow-md' : 'border-[#ebdfe5] opacity-70 hover:opacity-100'}`}>
                        <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="hidden lg:grid grid-cols-3 gap-4">
                  {[
                    { icon: Truck, label: 'Fast Delivery', sub: 'Accra & beyond' },
                    { icon: ShieldCheck, label: 'Genuine', sub: '100% authentic' },
                    { icon: RotateCcw, label: 'Easy Returns', sub: '7-day policy' },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="flex min-h-[150px] flex-col items-center justify-center gap-3 rounded-[28px] border border-[#e6e1e1] bg-[#f4f2f2] p-5 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]">
                      <Icon className="h-10 w-10 text-[#ff7a00]" strokeWidth={2.25} />
                      <div className="space-y-1">
                        <div className="text-[18px] font-semibold leading-none text-[#1e1e1e]">{label}</div>
                        <div className="text-[14px] leading-none text-[#4a4a4a]">{sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 rounded-[28px] border border-[#ebdfe5] bg-[#fffdfb] p-4 sm:p-5 shadow-[0_18px_38px_rgba(129,93,97,0.05)]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ebdfe5] bg-[#fff5ee] px-3 py-1 text-[11px] font-bold text-[#1f1b1c]">
                      <ShieldCheck className="h-3 w-3 text-[#ff7a00]" />
                      CR Cosmetics
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">{product.brand}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { if (navigator.share) { navigator.share({ title: product.name, url: window.location.href }); } else { navigator.clipboard.writeText(window.location.href); } }} className="w-9 h-9 rounded-full border border-[#ebdfe5] bg-white flex items-center justify-center text-[var(--text-subtle)] hover:text-[#ff7a00] transition">
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => toggleWishlist(product.id)} className={`w-9 h-9 rounded-full border flex items-center justify-center transition ${wishlisted ? 'border-rose-500 bg-rose-500 text-white' : 'border-[#ebdfe5] bg-white text-[var(--text-subtle)] hover:text-rose-500 hover:border-rose-400'}`}>
                      <Heart className={`h-3.5 w-3.5 ${wishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                <div>
                  <h1 className="text-3xl sm:text-[2.5rem] font-black leading-none text-[#1f1b1c] tracking-[-0.06em]">{product.name}</h1>
                </div>

                <div className="flex items-center flex-wrap gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`h-4 w-4 ${s <= Math.round(product.rating) ? 'text-[#ff9d48] fill-[#ff9d48]' : 'text-[#ebdfe5]'}`} />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-[#1f1b1c]">{product.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-[var(--text-subtle)] underline cursor-pointer">{product.reviewCount} reviews</span>
                  <span className="h-3.5 w-px bg-[#ebdfe5]" />
                  {availableStock > 0 ? (
                    <span className="text-xs font-semibold text-emerald-600">{availableStock} in stock</span>
                  ) : (
                    <span className="text-xs font-semibold text-red-500">Out of stock</span>
                  )}
                </div>

                <div className={`rounded-[24px] border p-4 ${activeFlashDeal ? 'border-[#ffd1ac] bg-[#fff7f1]' : 'border-[#ebdfe5] bg-[#f8f1f3]'}`}>
                  <div className="flex items-end gap-3 flex-wrap">
                    <span className="text-4xl font-black tracking-[-0.06em] text-[#ff7a00]">GHS {displayPrice.toFixed(2)}</span>
                    {displayOriginalPrice && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-[var(--text-subtle)] line-through">GHS {displayOriginalPrice.toFixed(2)}</span>
                        <span className="text-[11px] font-black text-white bg-[#ff5a4d] rounded px-1.5 py-0.5">-{discountPct}%</span>
                      </div>
                    )}
                  </div>
                  {availableStock > 0 && availableStock <= 20 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#ebdfe5] rounded-full overflow-hidden">
                        <div className="h-full bg-[#ff7a00] rounded-full" style={{ width: `${Math.min(100, ((20 - availableStock) / 20) * 100)}%` }} />
                      </div>
                      <span className="text-[11px] font-bold text-[#ff7a00] whitespace-nowrap">Only {availableStock} left!</span>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-[#ebdfe5] bg-white divide-y divide-[#ebdfe5] overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Truck className="h-4 w-4 shrink-0 text-[#ff7a00]" />
                    <span className="text-xs font-bold text-[var(--text-primary)]">{storeSettings.productDeliveryMessage || `Delivery: GHS ${Number(storeSettings.standardShippingFee).toFixed(2)}`}</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Tag className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-xs text-[var(--text-primary)]">Free delivery on orders above <strong>GHS {Number(storeSettings.freeDeliveryThreshold).toFixed(0)}</strong></span>
                  </div>
                </div>

                {product.options && product.options.length > 0 ? product.options.map(option => (
                  <div key={option.name} className="space-y-2">
                    <p className="text-xs font-bold text-[var(--text-primary)]">{option.name}: <span className="text-[#ff7a00] font-normal">{selectedOptionValues[option.name] || `Select ${option.name}`}</span></p>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map(value => {
                        const isSelected = selectedOptionValues[option.name] === value;
                        const isColor = option.name.toLowerCase() === 'color' || option.name.toLowerCase() === 'colour';
                        const swatchColor = COLOR_SWATCHES[value.toLowerCase()];
                        const matchingVariant = product.variants?.find(variant => Object.entries({ ...selectedOptionValues, [option.name]: value }).every(([key, selectedValue]) => variant.options?.[key] === selectedValue));
                        return (
                          <button key={value} type="button" onClick={() => { const nextValues = { ...selectedOptionValues, [option.name]: value }; setSelectedOptionValues(nextValues); const nextVariant = product.variants?.find(variant => Object.entries(nextValues).length === product.options?.length && Object.entries(nextValues).every(([key, selectedValue]) => variant.options?.[key] === selectedValue)); setSelectedVariant(nextVariant); }} disabled={matchingVariant?.inStock === false} className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${isSelected ? 'border-[#ff7a00] bg-[#fff5ee] text-[#ff7a00] ring-1 ring-[#ff7a00]' : 'border-[#ebdfe5] bg-white text-[var(--text-primary)] hover:border-[#ff7a00]/60'} disabled:cursor-not-allowed disabled:opacity-40`}>
                            {isColor && swatchColor && <span className="h-3.5 w-3.5 rounded-full border border-black/15" style={{ backgroundColor: swatchColor }} />}
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )) : product.variants && product.variants.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-[var(--text-primary)]">Select option</p>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant) => (
                        <button key={variant.id} type="button" onClick={() => setSelectedVariant(variant)} disabled={!variant.inStock} className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${activeVariant?.id === variant.id ? 'border-[#ff7a00] bg-[#fff5ee] text-[#ff7a00] ring-1 ring-[#ff7a00]' : 'border-[#ebdfe5] bg-white text-[var(--text-primary)]'} disabled:opacity-40 disabled:cursor-not-allowed`}>
                          {variant.name} · GHS {variant.price.toFixed(2)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[var(--text-primary)] w-20 shrink-0">Quantity:</span>
                    <div className="flex items-center border-2 border-[#ebdfe5] rounded-xl overflow-hidden bg-white">
                      <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-xl font-bold text-[var(--text-primary)] hover:bg-[#fff3ea] transition">−</button>
                      <span className="w-12 text-center text-sm font-black text-[var(--text-primary)] border-x-2 border-[#ebdfe5] h-10 flex items-center justify-center">{quantity}</span>
                      <button type="button" onClick={() => setQuantity(Math.min(availableStock || 99, quantity + 1))} className="w-10 h-10 flex items-center justify-center text-xl font-bold text-[var(--text-primary)] hover:bg-[#fff3ea] transition">+</button>
                    </div>
                    <span className="text-xs text-[var(--text-subtle)]">{product.unit}</span>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={handleAddToCart} disabled={!canPurchase} className="flex-1 h-12 rounded-2xl border-2 border-[#ff7a00] bg-white text-[#ff7a00] text-sm font-black uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-[#fff5ee] transition disabled:opacity-50 disabled:cursor-not-allowed">
                      <ShoppingCart className="h-4 w-4" />
                      {!canPurchase ? (allOptionsSelected ? 'Sold Out' : 'Select Options') : 'Add to Cart'}
                    </button>
                    <button onClick={() => void handleBuyNow()} disabled={!canPurchase} className="flex-1 h-12 rounded-2xl bg-[#111111] text-white text-sm font-black uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-[#2c2c2c] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10">
                      {!canPurchase ? (allOptionsSelected ? 'Sold Out' : 'Select Options') : 'Buy Now'}
                    </button>
                  </div>
                </div>

                {product.highlights?.length ? (
                  <div className="rounded-2xl border border-[#ebdfe5] bg-[#fffdfc] p-4">
                    <p className="text-[11px] font-black uppercase tracking-wider text-[var(--text-subtle)] mb-3">Product Highlights</p>
                    <ul className="space-y-2">
                      {product.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                          <Check className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:hidden">
                  {[
                    { icon: Truck, label: 'Fast Delivery' },
                    { icon: ShieldCheck, label: 'Genuine' },
                    { icon: RotateCcw, label: 'Easy Returns' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-[24px] border border-[#e6e1e1] bg-[#f4f2f2] px-3 py-4 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]">
                      <Icon className="h-9 w-9 text-[#ff7a00]" strokeWidth={2.25} />
                      <span className="text-[17px] font-semibold leading-none text-[#1e1e1e]">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-[#ebdfe5] bg-[#fffdfb] overflow-hidden shadow-[0_18px_38px_rgba(129,93,97,0.05)]">
              <div className="flex border-b border-[#ebdfe5] bg-[#f8f0f3]">
                {(['description', 'details', 'delivery'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3.5 text-xs font-black uppercase tracking-wider transition border-b-2 ${activeTab === tab ? 'border-[#ff7a00] text-[#ff7a00] bg-white' : 'border-transparent text-[var(--text-subtle)] hover:text-[var(--text-primary)]'}`}
                  >
                    {tab === 'description' ? 'Description' : tab === 'details' ? 'Specifications' : 'Delivery'}
                  </button>
                ))}
              </div>

              <div className="p-5 text-sm leading-7 text-[var(--text-primary)]">
                {activeTab === 'description' && (
                  <div>
                    <p className={`whitespace-pre-line text-sm text-[var(--text-primary)] leading-7 ${!descExpanded ? 'line-clamp-6' : ''}`}>
                      {product.description}
                    </p>
                    {product.description && product.description.length > 300 && (
                      <button onClick={() => setDescExpanded(!descExpanded)} className="mt-3 flex items-center gap-1 text-xs font-bold text-[#ff7a00] hover:text-[#e56a00] transition">
                        {descExpanded ? 'Show less' : 'Read more'}
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${descExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="grid gap-0 divide-y divide-[#ebdfe5]">
                    {[
                      { label: 'Brand', value: product.brand },
                      { label: 'Category', value: product.categoryLabel },
                      product.origin ? { label: 'Origin', value: product.origin } : null,
                      product.unit ? { label: 'Unit / Size', value: product.unit } : null,
                      product.routineStep ? { label: 'Routine Step', value: product.routineStep } : null,
                      { label: 'Availability', value: product.inStock ? 'In Stock' : 'Out of Stock' },
                    ].filter(Boolean).map(({ label, value }: any) => (
                      <div key={label} className="flex items-center py-2.5">
                        <span className="w-36 shrink-0 text-xs text-[var(--text-subtle)] font-semibold">{label}</span>
                        <span className="text-xs font-bold text-[var(--text-primary)]">{value}</span>
                      </div>
                    ))}
                    {product.details?.ingredients && (
                      <div className="py-3">
                        <p className="text-xs font-black uppercase tracking-wider text-[var(--text-subtle)] mb-2">Ingredients</p>
                        <p className="text-xs text-[var(--text-primary)] leading-6 whitespace-pre-line">{product.details.ingredients}</p>
                      </div>
                    )}
                    {product.details?.benefits && (
                      <div className="py-3">
                        <p className="text-xs font-black uppercase tracking-wider text-[var(--text-subtle)] mb-2">Benefits</p>
                        <p className="text-xs text-[var(--text-primary)] leading-6 whitespace-pre-line">{product.details.benefits}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'delivery' && (
                  <div className="space-y-4">
                    {storeSettings.productShippingMessage?.trim() && (
                      <p className="text-sm text-[var(--text-primary)]">{storeSettings.productShippingMessage}</p>
                    )}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { icon: Truck, title: 'Standard Delivery', desc: `GHS ${Number(storeSettings.standardShippingFee).toFixed(2)} · 1–3 business days` },
                        { icon: PackageCheck, title: 'Free Delivery', desc: `On orders above GHS ${Number(storeSettings.freeDeliveryThreshold).toFixed(0)}` },
                        { icon: RotateCcw, title: 'Returns Policy', desc: storeSettings.productReturnsMessage || '7-day easy return policy' },
                        { icon: ShieldCheck, title: 'Buyer Protection', desc: storeSettings.productProtectionMessage || '100% authentic products guaranteed' },
                      ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="flex gap-3 rounded-2xl border border-[#ebdfe5] bg-[#f8f1f3] p-4">
                          <Icon className="h-5 w-5 shrink-0 text-[#ff7a00] mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-[var(--text-primary)]">{title}</p>
                            <p className="text-xs text-[var(--text-subtle)] mt-0.5">{desc}</p>
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
                    <div className="w-1 h-6 bg-[#ff7a00] rounded-full" />
                    <h2 className="text-lg font-black text-[var(--text-primary)]">You May Also Like</h2>
                  </div>
                  <Link to="/shop" className="text-xs font-bold text-[#ff7a00] hover:text-[#e56a00] transition flex items-center gap-1">
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
