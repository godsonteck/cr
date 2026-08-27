import React, { useState, useEffect } from 'react';
import { Product, CategoryType } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { 
  X, 
  Save, 
  Image as ImageIcon, 
  Sparkles, 
  DollarSign, 
  Layers, 
  Tag, 
  Package, 
  Check, 
  Plus, 
  Trash2,
  HelpCircle
} from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const BEAUTY_IMAGE_PRESETS = [
  { label: 'The Ordinary Serum', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80' },
  { label: 'CeraVe Cream Tub', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80' },
  { label: 'COSRX Snail Mucin', url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80' },
  { label: 'Lancôme Luxury Perfume', url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80' },
  { label: 'Dove Body Wash & Lotion', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80' },
  { label: 'Makeup Foundation & Palette', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80' },
  { label: 'Beauty Blender & Sponge', url: 'https://images.unsplash.com/photo-1587754256282-a11d04e3472d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Caudalie Essence', url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80' },
  { label: 'Chanel Luxury Fragrance', url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80' },
  { label: 'Hydrating Face Cream', url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80' }
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit
}) => {
  const { addProduct, updateProduct, brands } = useStore();
  const { showToast } = useToast();

  const isEditing = !!productToEdit;

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('The Ordinary');
  const [newBrandInput, setNewBrandInput] = useState('');
  const [category, setCategory] = useState<CategoryType>('skincare');
  const [categoryLabel, setCategoryLabel] = useState('Facial Serum');
  const [price, setPrice] = useState<number>(120);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [discountBadge, setDiscountBadge] = useState<string>('');
  const [unit, setUnit] = useState('30ml Dropper Bottle');
  const [image, setImage] = useState(BEAUTY_IMAGE_PRESETS[0].url);
  const [description, setDescription] = useState('');
  const [highlights, setHighlights] = useState<string[]>(['100% Authentic Formula', 'Accra Same-Day Dispatch']);
  const [newHighlight, setNewHighlight] = useState('');
  const [badge, setBadge] = useState<Product['badge']>('Bestseller');
  const [inStock, setInStock] = useState(true);
  const [stockCount, setStockCount] = useState(50);
  const [origin, setOrigin] = useState('Made in Canada');
  
  // Details
  const [howToUse, setHowToUse] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [benefits, setBenefits] = useState('');

  // Populate on edit
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setBrand(productToEdit.brand);
      setCategory(productToEdit.category);
      setCategoryLabel(productToEdit.categoryLabel || 'Beauty Care');
      setPrice(productToEdit.price);
      setOriginalPrice(productToEdit.originalPrice);
      setDiscountBadge(productToEdit.discountBadge || '');
      setUnit(productToEdit.unit || 'Standard Size');
      setImage(productToEdit.image);
      setDescription(productToEdit.description);
      setHighlights(productToEdit.highlights && productToEdit.highlights.length > 0 ? productToEdit.highlights : ['100% Authentic Product']);
      setBadge(productToEdit.badge);
      setInStock(productToEdit.inStock);
      setStockCount(productToEdit.stockCount || 20);
      setOrigin(productToEdit.origin || 'Imported Genuine');
      setHowToUse(productToEdit.details?.howToUse || '');
      setIngredients(productToEdit.details?.ingredients || '');
      setBenefits(productToEdit.details?.benefits || '');
    } else {
      // Default reset
      setName('');
      setBrand(brands[1] || 'The Ordinary');
      setCategory('skincare');
      setCategoryLabel('Facial Serum');
      setPrice(150);
      setOriginalPrice(undefined);
      setDiscountBadge('');
      setUnit('30ml Bottle');
      setImage(BEAUTY_IMAGE_PRESETS[0].url);
      setDescription('High-potency original beauty formula for clear, radiant skin in Ghana.');
      setHighlights(['100% Guaranteed Authentic', 'Direct Imported Stock', 'Fast Accra Doorstep Delivery']);
      setBadge('New In');
      setInStock(true);
      setStockCount(40);
      setOrigin('Genuine Original');
      setHowToUse('Apply evenly on clean skin morning and evening.');
      setIngredients('Aqua, Vitamin Complex, Antioxidants, Botanical Extracts.');
      setBenefits('Hydrates, protects barrier, and enhances natural glow.');
    }
  }, [productToEdit, isOpen, brands]);

  if (!isOpen) return null;

  const handleAddHighlight = () => {
    if (newHighlight.trim()) {
      setHighlights(prev => [...prev, newHighlight.trim()]);
      setNewHighlight('');
    }
  };

  const handleRemoveHighlight = (idx: number) => {
    setHighlights(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Product name is required');
      return;
    }

    const finalBrand = brand === '__NEW__' && newBrandInput.trim() ? newBrandInput.trim() : brand;

    const productPayload = {
      name: name.trim(),
      brand: finalBrand,
      category,
      categoryLabel: categoryLabel.trim() || 'Beauty Item',
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      discountBadge: discountBadge.trim() || undefined,
      unit: unit.trim() || 'Standard Pack',
      image,
      images: [image],
      description: description.trim(),
      highlights: highlights.length > 0 ? highlights : ['Original Brand Quality'],
      badge: badge || undefined,
      inStock,
      stockCount: Number(stockCount),
      origin: origin.trim(),
      rating: productToEdit ? productToEdit.rating : 5.0,
      reviewCount: productToEdit ? productToEdit.reviewCount : 0,
      details: {
        howToUse: howToUse.trim(),
        ingredients: ingredients.trim(),
        benefits: benefits.trim()
      }
    };

    if (isEditing && productToEdit) {
      updateProduct(productToEdit.id, productPayload);
      showToast(`Updated product: ${name}`);
    } else {
      addProduct(productPayload);
      showToast(`New product added to catalog: ${name}`);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 relative max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-gray-900">
              {isEditing ? `Edit Product: ${productToEdit.name}` : 'Add New Cosmetic or Fragrance Product'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Control stock, pricing, image, and details across the entire store.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">Product Title / Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Niacinamide 10% + Zinc 1% (60ml)"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3D52]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Brand Name *</label>
              <select
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3D52]"
              >
                {brands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
                <option value="__NEW__">+ Add New Brand Name...</option>
              </select>

              {brand === '__NEW__' && (
                <input
                  type="text"
                  placeholder="Enter brand name"
                  value={newBrandInput}
                  onChange={e => setNewBrandInput(e.target.value)}
                  className="mt-2 w-full px-3 py-2 bg-white border border-[#8A3D52] rounded-lg text-xs"
                />
              )}
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Store Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as CategoryType)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3D52]"
              >
                <option value="skincare">Skincare</option>
                <option value="makeup">Makeup</option>
                <option value="fragrances">Fragrances</option>
                <option value="body-care">Body Care</option>
                <option value="beauty-essentials">Beauty Essentials</option>
                <option value="everyday-essentials">Everyday Essentials</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Subcategory / Type Tag</label>
              <input
                type="text"
                value={categoryLabel}
                onChange={e => setCategoryLabel(e.target.value)}
                placeholder="e.g. Facial Serum, EDP, Cleanser"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3D52]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Size / Unit Package</label>
              <input
                type="text"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="e.g. 50ml Jar, 100ml Bottle, 454g Tub"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3D52]"
              />
            </div>

          </div>

          {/* Pricing & Stock Section */}
          <div className="bg-[#FAF6F4] p-4 rounded-2xl border border-rose-100/90 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-[#8A3D52]" />
              <span>Pricing & Inventory Control</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Selling Price (GHS) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Original Price (GHS)</label>
                <input
                  type="number"
                  step="0.01"
                  value={originalPrice || ''}
                  onChange={e => setOriginalPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="e.g. 200.00"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Stock Units *</label>
                <input
                  type="number"
                  required
                  value={stockCount}
                  onChange={e => {
                    const count = parseInt(e.target.value) || 0;
                    setStockCount(count);
                    if (count === 0) setInStock(false);
                    else setInStock(true);
                  }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">In Stock Status</label>
                <button
                  type="button"
                  onClick={() => setInStock(!inStock)}
                  className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    inStock ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${inStock ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                  <span>{inStock ? 'In Stock' : 'Out of Stock'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Promo Badge</label>
                <select
                  value={badge || ''}
                  onChange={e => setBadge((e.target.value as any) || undefined)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs"
                >
                  <option value="">No Badge</option>
                  <option value="Bestseller">Bestseller</option>
                  <option value="New In">New In</option>
                  <option value="CR Exclusive">CR Exclusive</option>
                  <option value="Sale">Sale</option>
                  <option value="100% Authentic">100% Authentic</option>
                  <option value="Popular">Popular</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Discount Tag (e.g. -15%)</label>
                <input
                  type="text"
                  value={discountBadge}
                  onChange={e => setDiscountBadge(e.target.value)}
                  placeholder="e.g. -15% or SAVE GHS 30"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg"
                />
              </div>
            </div>

          </div>

          {/* Product Image & Preset Picker */}
          <div className="space-y-3">
            <label className="block font-bold text-gray-700 mb-1">Product Image URL *</label>
            <div className="flex items-center gap-3">
              <input
                type="url"
                required
                value={image}
                onChange={e => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                <img src={image} alt="Preview" className="w-full h-full object-contain" onError={() => {}} />
              </div>
            </div>

            {/* Presets */}
            <div>
              <span className="text-[11px] font-bold text-gray-500 block mb-1.5">Or Choose from Curated Beauty Image Presets:</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {BEAUTY_IMAGE_PRESETS.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setImage(preset.url)}
                    className={`p-1.5 rounded-xl border text-[10px] text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                      image === preset.url ? 'border-[#8A3D52] bg-rose-50/80 font-bold text-[#8A3D52]' : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <img src={preset.url} alt="" className="w-6 h-6 rounded-md object-contain shrink-0" />
                    <span className="truncate">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Descriptions & Highlights */}
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Short Description *</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Detailed description of benefits, texture, and origin..."
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8A3D52]"
              />
            </div>

            {/* Highlights List */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">Key Feature Highlights</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newHighlight}
                  onChange={e => setNewHighlight(e.target.value)}
                  placeholder="e.g. 100% Genuine batch verified"
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddHighlight}
                  className="px-3 py-2 bg-gray-800 text-white rounded-lg font-bold text-xs hover:bg-black cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {highlights.map((h, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 bg-rose-50 text-[#8A3D52] border border-rose-100 px-2.5 py-1 rounded-lg text-[11px]">
                    <span>{h}</span>
                    <button type="button" onClick={() => handleRemoveHighlight(idx)} className="text-rose-400 hover:text-rose-700">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Deep Skin Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block font-bold text-gray-700 mb-1">How to Use</label>
                <textarea
                  rows={2}
                  value={howToUse}
                  onChange={e => setHowToUse(e.target.value)}
                  placeholder="Application routine..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Key Ingredients</label>
                <textarea
                  rows={2}
                  value={ingredients}
                  onChange={e => setIngredients(e.target.value)}
                  placeholder="Aqua, Ceramides, Zinc..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Benefits</label>
                <textarea
                  rows={2}
                  value={benefits}
                  onChange={e => setBenefits(e.target.value)}
                  placeholder="Hydrates, clears tone..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                />
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#8A3D52] hover:bg-[#732F42] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Save Product Changes' : 'Publish Product to Store'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
