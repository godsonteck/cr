import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  ChevronRight,
  Check,
  Sparkles,
  Info,
  RotateCcw,
  Truck,
  ShieldCheck,
  PackageCheck,
  Clock3
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
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'shipping'>('description');

  const galleryImages = product?.images?.length ? product.images : [product?.image].filter(Boolean) as string[];

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <p className="text-xs text-stone-500">The product you are looking for does not exist in our catalog.</p>
        <Link to="/shop">
          <Button variant="primary">Return to Shop</Button>
        </Link>
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
  const allOptionsSelected = !hasOptions || product.options!.every(option => Boolean(selectedOptionValues[option.name]));
  const canPurchase = hasOptions
    ? allOptionsSelected && Boolean(activeVariant?.inStock)
    : Boolean(activeVariant?.inStock ?? product.inStock);
  const availableStock = activeVariant?.stockCount ?? product.stockCount;
  const relatedProducts = publishedProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <>
      <SEO
        title={`${product.name} | CR Mart`}
        description={`${product.name} by ${product.brand}. View price, availability, product details, and delivery information.`}
        type="product"
        productName={product.name}
        productPrice={displayPrice}
        productImage={currentImage}
        productDescription={product.description}
        productAvailability={product.inStock ? 'InStock' : 'OutOfStock'}
      />
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
        <Link to="/" className="transition hover:text-[var(--text-primary)]">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/shop" className="transition hover:text-[var(--text-primary)]">Shop</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-[var(--text-primary)]">{product.categoryLabel}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[120px_minmax(0,1fr)_440px]">
        <div className="hidden flex-col gap-3 lg:flex">
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedImage(img)}
              className={`overflow-hidden rounded-2xl border transition-all ${
                currentImage === img ? 'border-[var(--accent)] shadow-sm' : 'border-[var(--border-color)] opacity-80 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`${product.name} preview ${idx + 1}`} className="h-24 w-full object-cover" />
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-[28px] border border-[var(--border-color)] bg-[var(--bg-card)] p-3 shadow-[0_20px_45px_rgba(11,31,56,0.12)]">
            {product.badge && (
              <div className="absolute left-6 top-6 z-10">
                <Badge variant={product.badge === 'Sale' ? 'terracotta' : 'secondary'}>{product.badge}</Badge>
              </div>
            )}
            <img src={currentImage} alt={product.name} width="900" height="900" decoding="async" className="h-[min(78vw,390px)] w-full rounded-[22px] bg-[var(--bg-soft)] object-contain sm:h-[560px]" />
          </div>

          <div className="flex min-w-0 gap-3 overflow-x-auto pb-1 lg:hidden no-scrollbar">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(img)}
                className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border ${
                  currentImage === img ? 'border-[var(--accent)]' : 'border-[var(--border-color)]'
                }`}
              >
                <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <aside className="space-y-5 rounded-[28px] border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[0_20px_45px_rgba(11,31,56,0.08)] sm:p-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-subtle)]">{product.brand}</span>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
              className={`rounded-full border p-2 transition ${
                wishlisted
                  ? 'border-[#C86D51] bg-[#C86D51] text-white'
                  : 'border-[var(--border-color)] bg-[var(--bg-soft)] text-[var(--text-primary)]'
              }`}
            >
              <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-black leading-tight tracking-[-0.05em] text-[var(--text-primary)] sm:text-[2.1rem]">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--text-primary)]">{product.rating.toFixed(1)} / 5</span>
              <span className="text-[#d59a27]" aria-label={`${product.rating} out of 5 stars`}>{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
              <span>{product.reviewCount} reviews</span>
              <span className="h-4 w-px bg-[var(--border-color)]" />
              <span>{availableStock > 0 ? `${availableStock} in stock` : 'Out of stock'}</span>
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--bg-soft)] p-4">
            <div className="flex items-end gap-3">
              <span className="text-3xl font-black tracking-[-0.06em] text-[var(--text-primary)]">GHS {displayPrice.toFixed(2)}</span>
              {displayOriginalPrice && (
                <span className="text-base text-[var(--text-subtle)] line-through">GHS {displayOriginalPrice.toFixed(2)}</span>
              )}
            </div>
            {displayOriginalPrice && (
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-[#C86D51]">
                Save {Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)}%
              </p>
            )}
          </div>

          {[
            { icon: Truck, message: storeSettings.productDeliveryMessage },
            { icon: ShieldCheck, message: storeSettings.productProtectionMessage },
            { icon: PackageCheck, message: storeSettings.productReturnsMessage },
          ].filter(item => item.message?.trim()).length > 0 && (
            <div className="space-y-3 rounded-2xl border border-[var(--border-color)] bg-[rgba(122,167,255,0.04)] p-4">
              {[
                { icon: Truck, message: storeSettings.productDeliveryMessage },
                { icon: ShieldCheck, message: storeSettings.productProtectionMessage },
                { icon: PackageCheck, message: storeSettings.productReturnsMessage },
              ].filter(item => item.message?.trim()).map(({ icon: Icon, message }) => (
                <div key={message} className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                  <Icon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                  <span>{message}</span>
                </div>
              ))}
            </div>
          )}

          {product.options && product.options.length > 0 ? product.options.map(option => (
            <div key={option.name} className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-subtle)]">Choose {option.name}</p>
              <div className="flex flex-wrap gap-2">
                {option.values.map(value => {
                  const isSelected = selectedOptionValues[option.name] === value;
                  const isColor = option.name.toLowerCase() === 'color' || option.name.toLowerCase() === 'colour';
                  const swatchColor = COLOR_SWATCHES[value.toLowerCase()];
                  const matchingVariant = product.variants?.find(variant => Object.entries({ ...selectedOptionValues, [option.name]: value }).every(([key, selectedValue]) => variant.options?.[key] === selectedValue));
                  return <button key={value} type="button" onClick={() => {
                    const nextValues = { ...selectedOptionValues, [option.name]: value };
                    setSelectedOptionValues(nextValues);
                    const nextVariant = product.variants?.find(variant => Object.entries(nextValues).length === product.options?.length && Object.entries(nextValues).every(([key, selectedValue]) => variant.options?.[key] === selectedValue));
                    setSelectedVariant(nextVariant);
                  }} disabled={matchingVariant?.inStock === false} className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${isSelected ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]' : 'border-[var(--border-color)] bg-transparent text-[var(--text-primary)]'} disabled:cursor-not-allowed disabled:opacity-50`}>
                    {isColor && swatchColor && <span className="h-4 w-4 rounded-full border border-black/15" style={{ backgroundColor: swatchColor }} aria-hidden="true" />}
                    {value}
                  </button>;
                })}
              </div>
            </div>
          )) : product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-subtle)]">Choose option</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariant(variant)}
                    className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                      activeVariant?.id === variant.id
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]'
                        : 'border-[var(--border-color)] bg-transparent text-[var(--text-primary)]'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                    disabled={!variant.inStock}
                  >
                    {variant.name} · GHS {variant.price.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasOptions && (
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] px-3 py-2 text-xs text-[var(--text-muted)]">
              <span className="font-bold text-[var(--text-primary)]">Selected: </span>
              {product.options!.map(option => selectedOptionValues[option.name] || `Choose ${option.name}`).join(' / ')}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-subtle)]">
              <span>Quantity</span>
              <span>{product.unit}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center overflow-hidden rounded-full border border-[var(--border-color)] bg-[var(--bg-soft)]">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-11 w-11 text-lg font-bold text-[var(--text-primary)] transition hover:bg-[var(--bg-card)]"
                >
                  −
                </button>
                <span className="min-w-12 text-center text-sm font-bold text-[var(--text-primary)]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(availableStock || 1, quantity + 1))}
                  className="h-11 w-11 text-lg font-bold text-[var(--text-primary)] transition hover:bg-[var(--bg-card)]"
                >
                  +
                </button>
              </div>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => addToCart({ ...product, price: displayPrice, originalPrice: displayOriginalPrice, discountBadge: activeFlashDeal ? `-${activeFlashDeal.discountPercentage}%` : product.discountBadge }, quantity, activeVariant?.name, activeVariant)}
                disabled={!canPurchase}
                className="flex-1 rounded-full px-5 py-3.5 text-xs font-bold uppercase tracking-[0.14em]"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>{!canPurchase ? (allOptionsSelected ? 'Sold out' : 'Choose options') : 'Add to cart'}</span>
              </Button>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={async () => {
                if (!canPurchase) return;
                await addToCart({ ...product, price: displayPrice, originalPrice: displayOriginalPrice, discountBadge: activeFlashDeal ? `-${activeFlashDeal.discountPercentage}%` : product.discountBadge }, quantity, activeVariant?.name, activeVariant);
                navigate('/checkout');
              }}
              disabled={!canPurchase}
              className="w-full rounded-full px-5 py-3.5 text-xs font-bold uppercase tracking-[0.14em]"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{!canPurchase ? (allOptionsSelected ? 'Sold out' : 'Choose options') : 'Buy now'}</span>
            </Button>
          </div>

          {product.highlights?.length ? (
            <ul className="space-y-2 pt-2 text-sm text-[var(--text-primary)]">
              {product.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1aa773]" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </aside>
      </div>

      <div className="mt-8 rounded-[28px] border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-[0_12px_28px_rgba(11,31,56,0.04)] sm:p-6">
        <div className="flex flex-wrap gap-3 border-b border-[var(--border-color)] pb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-subtle)]">
          {['description', 'details', 'shipping'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab as 'description' | 'details' | 'shipping')}
              className={`rounded-full px-3 py-2 transition ${
                activeTab === tab ? 'bg-[var(--bg-soft)] text-[var(--text-primary)]' : 'hover:bg-[var(--bg-soft)]'
              }`}
            >
              {tab === 'description' ? 'Description' : tab === 'details' ? 'Details' : 'Shipping & returns'}
            </button>
          ))}
        </div>

        <div className="pt-5 text-sm leading-7 text-[var(--text-primary)]">
          {activeTab === 'description' && <p className="whitespace-pre-line">{product.description}</p>}

          {activeTab === 'details' && (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                {product.origin && (
                  <div className="flex justify-between gap-4 border-b border-[var(--border-color)] pb-2">
                    <span className="text-[var(--text-subtle)]">Origin</span>
                    <span className="font-semibold text-[var(--text-primary)]">{product.origin}</span>
                  </div>
                )}
                {product.unit && (
                  <div className="flex justify-between gap-4 border-b border-[var(--border-color)] pb-2">
                    <span className="text-[var(--text-subtle)]">Unit</span>
                    <span className="font-semibold text-[var(--text-primary)]">{product.unit}</span>
                  </div>
                )}
                {product.routineStep && (
                  <div className="flex justify-between gap-4 border-b border-[var(--border-color)] pb-2">
                    <span className="text-[var(--text-subtle)]">Routine step</span>
                    <span className="font-semibold capitalize text-[var(--text-primary)]">{product.routineStep}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {product.details?.ingredients && (
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-subtle)]">Ingredients</p>
                    <p className="whitespace-pre-line text-[var(--text-primary)]">{product.details.ingredients}</p>
                  </div>
                )}
                {product.details?.benefits && (
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-subtle)]">Benefits</p>
                    <p className="whitespace-pre-line text-[var(--text-primary)]">{product.details.benefits}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4">
              {storeSettings.productShippingMessage?.trim() && <p className="text-[var(--text-primary)]">{storeSettings.productShippingMessage}</p>}
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ['Standard delivery', storeSettings.standardShippingFee],
                  ['Express delivery', storeSettings.expressShippingFee],
                  ['Intercity delivery', storeSettings.intercityShippingFee],
                ].map(([label, fee]) => (
                  <div key={label} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-4">
                    <p className="text-xs font-bold text-[var(--text-primary)]">{label}</p>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">{storeSettings.currency} {Number(fee).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              {!storeSettings.productShippingMessage?.trim() && <p className="text-xs text-[var(--text-muted)]">Delivery details are set by the store and shown at checkout.</p>}
            </div>
          )}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-10 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-black tracking-[-0.05em] text-[var(--text-primary)]">You may also like</h3>
            <Link to="/shop" className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-subtle)] hover:text-[var(--text-primary)]">
              View more
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export const RoutineBuilderPage: React.FC = () => {
  const { addToCart } = useCart();
  const { products } = useStore();
  const publishedProducts = products.filter(product => product.isPublished !== false);

  // Find products matching routine steps
  const cleansers = publishedProducts.filter(p => p.routineStep === 'cleanse' || p.category === 'skincare').slice(0, 2);
  const treats = publishedProducts.filter(p => p.routineStep === 'treat' || p.id === 'the-ordinary-niacinamide');
  const hydrators = publishedProducts.filter(p => p.routineStep === 'hydrate' || p.id === 'cerave-moisturising-cream');
  const protectors = publishedProducts.filter(p => p.category === 'skincare').slice(2, 4);

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

      {/* Header */}
      <div className="mx-auto max-w-4xl rounded-3xl bg-[#1C1817] p-6 text-center text-white space-y-4 sm:p-10">
        <span className="inline-flex items-center gap-1.5 bg-[#C86D51] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
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

      {/* Routine Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Step 1: Cleanse */}
        <div className="bg-white dark:bg-[#1C1917] p-6 rounded-3xl border border-[#E6DFD7] dark:border-[#36322E] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#C86D51] uppercase">Step 01 • Cleanse</span>
            <Badge variant="espresso">Prep</Badge>
          </div>
          <h3 className="text-lg font-bold">Purify &amp; Balance</h3>
          {selectedCleanser && (
            <div className="space-y-3">
              <img src={selectedCleanser.image} alt={selectedCleanser.name} className="w-full h-40 object-cover rounded-xl" />
              <h4 className="text-xs font-bold">{selectedCleanser.name}</h4>
              <span className="text-sm font-extrabold">GHS {selectedCleanser.price.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Step 2: Treat */}
        <div className="bg-white dark:bg-[#1C1917] p-6 rounded-3xl border border-[#E6DFD7] dark:border-[#36322E] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#C86D51] uppercase">Step 02 • Treat</span>
            <Badge variant="espresso">Target</Badge>
          </div>
          <h3 className="text-lg font-bold">Concentrated Active Serum</h3>
          {selectedTreat && (
            <div className="space-y-3">
              <img src={selectedTreat.image} alt={selectedTreat.name} className="w-full h-40 object-cover rounded-xl" />
              <h4 className="text-xs font-bold">{selectedTreat.name}</h4>
              <span className="text-sm font-extrabold">GHS {selectedTreat.price.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Step 3: Hydrate */}
        <div className="bg-white dark:bg-[#1C1917] p-6 rounded-3xl border border-[#E6DFD7] dark:border-[#36322E] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#C86D51] uppercase">Step 03 • Hydrate</span>
            <Badge variant="espresso">Lock Moisture</Badge>
          </div>
          <h3 className="text-lg font-bold">Barrier Repair Cream</h3>
          {selectedHydrate && (
            <div className="space-y-3">
              <img src={selectedHydrate.image} alt={selectedHydrate.name} className="w-full h-40 object-cover rounded-xl" />
              <h4 className="text-xs font-bold">{selectedHydrate.name}</h4>
              <span className="text-sm font-extrabold">GHS {selectedHydrate.price.toFixed(2)}</span>
            </div>
          )}
        </div>

      </div>

      {/* Bottom Action Bar */}
      <div className="bg-[#1C1817] text-white p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
        <div>
          <span className="text-xs text-stone-400 font-semibold block">Complete Regimen Bundle</span>
          <span className="text-2xl font-extrabold">Total: GHS {routineTotal.toFixed(2)}</span>
        </div>

        <Button
          size="lg"
          variant="secondary"
          onClick={handleAddFullRoutine}
          className="rounded-full px-8 py-4 text-xs font-bold uppercase tracking-wider w-full sm:w-auto"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Add Full Routine to Cart</span>
        </Button>
      </div>

    </div>
  );
};
