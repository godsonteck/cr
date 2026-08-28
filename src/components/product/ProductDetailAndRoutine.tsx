import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  ChevronRight,
  Check,
  Sparkles,
  Info,
  RotateCcw
} from 'lucide-react';
import { PRODUCTS } from '../../data/products';
import { ProductCard } from '../home/DepartmentStorefronts';
import { Button, Badge } from '../common/UIPrimitives';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const product = useMemo(() => {
    return PRODUCTS.find(p => p.id === productId);
  }, [productId]);

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'howToUse'>('description');

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
  const relatedProducts = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-12">

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-[#6E6763]">
        <Link to="/" className="hover:text-[#1C1817]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-[#1C1817]">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/category/${product.category}`} className="hover:text-[#1C1817] uppercase">{product.categoryLabel}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#1C1817] dark:text-stone-200 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* PDP Main Purchase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-white dark:bg-[#1C1917] border border-[#E6DFD7] dark:border-[#36322E] relative shadow-md">
            <img src={currentImage} alt={product.name} className="w-full h-full object-cover" />

            {product.badge && (
              <div className="absolute top-4 left-4">
                <Badge variant={product.badge === 'Sale' ? 'terracotta' : 'espresso'}>
                  {product.badge}
                </Badge>
              </div>
            )}
          </div>

          {/* Thumbnail list */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    currentImage === img ? 'border-[#C86D51]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Panel */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-[#6E6763] mb-2 font-bold uppercase tracking-wider">
              <span>{product.brand}</span>
              <span>{product.unit}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1817] dark:text-stone-100 leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Pricing & Stock */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1917] border border-[#E6DFD7] dark:border-[#36322E] flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[#1C1817] dark:text-stone-100">
                  GHS {product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-stone-400 line-through">
                    GHS {product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-stone-400">Inclusive of all local taxes</span>
            </div>

            <Badge variant={product.inStock ? 'botanical' : 'terracotta'}>
              {product.inStock ? `In Stock (${product.stockCount})` : 'Sold Out'}
            </Badge>
          </div>

          {/* Highlights */}
          {product.highlights && product.highlights.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6E6763]">Key Highlights:</span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300">
                    <Check className="w-4 h-4 text-[#C86D51] shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions (Quantity + Add to Cart + Wishlist) */}
          <div className="space-y-4 pt-4 border-t border-[#E6DFD7] dark:border-[#36322E]">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#E6DFD7] dark:border-[#36322E] rounded-full p-1 bg-white dark:bg-[#1C1917]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold text-[#1C1817] dark:text-stone-200">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  +
                </button>
              </div>

              <Button
                size="lg"
                variant={product.department === 'beauty' ? 'primary' : 'botanical'}
                onClick={() => addToCart(product, quantity)}
                className="flex-1 rounded-full py-3.5 text-xs font-bold uppercase tracking-wider"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart • GHS {(product.price * quantity).toFixed(2)}</span>
              </Button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-full border transition-all ${
                  wishlisted
                    ? 'bg-[#C86D51] border-[#C86D51] text-white'
                    : 'border-[#E6DFD7] text-stone-600 hover:bg-stone-100 dark:border-[#36322E] dark:text-stone-300'
                }`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Delivery & Assurance */}
          <div className="grid grid-cols-2 gap-4 pt-4 text-xs">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-[#1C1917] border border-[#E6DFD7] dark:border-[#36322E]">
              <Truck className="w-5 h-5 text-[#C86D51]" />
              <div>
                <strong className="block text-stone-900 dark:text-stone-200">Accra Dispatch</strong>
                <span className="text-[10px] text-stone-400">Same-day or 24hr delivery</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-[#1C1917] border border-[#E6DFD7] dark:border-[#36322E]">
              <ShieldCheck className="w-5 h-5 text-[#4A5D4E]" />
              <div>
                <strong className="block text-stone-900 dark:text-stone-200">100% Genuine</strong>
                <span className="text-[10px] text-stone-400">Authenticity Guaranteed</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Product Details Tabs */}
      <div className="bg-white dark:bg-[#1C1917] rounded-3xl border border-[#E6DFD7] dark:border-[#36322E] p-6 sm:p-8 space-y-6">
        <div className="flex border-b border-[#E6DFD7] dark:border-[#36322E] gap-6 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'description' ? 'border-[#C86D51] text-[#C86D51]' : 'border-transparent text-stone-400'
            }`}
          >
            Description
          </button>
          {product.details?.ingredients && (
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'ingredients' ? 'border-[#C86D51] text-[#C86D51]' : 'border-transparent text-stone-400'
              }`}
            >
              Ingredients &amp; Sourcing
            </button>
          )}
          {product.details?.howToUse && (
            <button
              onClick={() => setActiveTab('howToUse')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'howToUse' ? 'border-[#C86D51] text-[#C86D51]' : 'border-transparent text-stone-400'
              }`}
            >
              How to Use / Prepare
            </button>
          )}
        </div>

        <div className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
          {activeTab === 'description' && <p>{product.description}</p>}
          {activeTab === 'ingredients' && <p>{product.details?.ingredients}</p>}
          {activeTab === 'howToUse' && <p>{product.details?.howToUse}</p>}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6">
          <h3 className="text-xl font-extrabold uppercase text-[#1C1817] dark:text-stone-100">
            You May Also Like
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(rel => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export const RoutineBuilderPage: React.FC = () => {
  const { addToCart } = useCart();

  // Find products matching routine steps
  const cleansers = PRODUCTS.filter(p => p.routineStep === 'cleanse' || p.category === 'skincare').slice(0, 2);
  const treats = PRODUCTS.filter(p => p.routineStep === 'treat' || p.id === 'the-ordinary-niacinamide');
  const hydrators = PRODUCTS.filter(p => p.routineStep === 'hydrate' || p.id === 'cerave-moisturising-cream');
  const protectors = PRODUCTS.filter(p => p.category === 'skincare').slice(2, 4);

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
      <div className="bg-[#1C1817] text-white p-8 sm:p-12 rounded-3xl text-center max-w-4xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 bg-[#C86D51] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          Interactive Regimen Tool
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold uppercase">
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
