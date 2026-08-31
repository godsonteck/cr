import React, { useState, useEffect } from 'react';
import { Product, CategoryType, DepartmentType } from '../../types';
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
  Eye,
  EyeOff,
  Globe,
  Sliders
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
  { label: 'Chanel Luxury Fragrance', url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80' },
  { label: 'Royal Jasmine Rice (5kg)', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Pure Vegetable Cooking Oil', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80' }
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit
}) => {
  const { addProduct, updateProduct, brands } = useStore();
  const { showToast } = useToast();

  const isEditing = !!productToEdit;

  const [activeSection, setActiveSection] = useState<'general' | 'pricing' | 'media' | 'details'>('general');

  const [name, setName] = useState('');
  const [department, setDepartment] = useState<DepartmentType>('beauty');
  const [brand, setBrand] = useState('The Ordinary');
  const [newBrandInput, setNewBrandInput] = useState('');
  const [category, setCategory] = useState<CategoryType>('skincare');
  const [categoryLabel, setCategoryLabel] = useState('Facial Serum');
  const [price, setPrice] = useState<number>(120);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [discountBadge, setDiscountBadge] = useState<string>('');
  const [unit, setUnit] = useState('30ml Bottle');
  const [image, setImage] = useState(BEAUTY_IMAGE_PRESETS[0].url);
  const [description, setDescription] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState('');
  const [badge, setBadge] = useState<Product['badge']>('Bestseller');
  const [inStock, setInStock] = useState(true);
  const [isPublished, setIsPublished] = useState(true);
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
      setDepartment(productToEdit.department || 'beauty');
      setBrand(productToEdit.brand);
      setCategory(productToEdit.category);
      setCategoryLabel(productToEdit.categoryLabel || 'Beauty Item');
      setPrice(productToEdit.price);
      setOriginalPrice(productToEdit.originalPrice);
      setDiscountBadge(productToEdit.discountBadge || '');
      setUnit(productToEdit.unit || 'Standard Size');
      setImage(productToEdit.image);
      setDescription(productToEdit.description);
      setHighlights(productToEdit.highlights || []);
      setBadge(productToEdit.badge);
      setInStock(productToEdit.inStock);
      setIsPublished(productToEdit.isPublished !== false);
      setStockCount(productToEdit.stockCount || 20);
      setOrigin(productToEdit.origin || '');
      setHowToUse(productToEdit.details?.howToUse || '');
      setIngredients(productToEdit.details?.ingredients || '');
      setBenefits(productToEdit.details?.benefits || '');
    } else {
      setName('');
      setDepartment('beauty');
      setBrand(brands[1] || 'The Ordinary');
      setCategory('skincare');
      setCategoryLabel('Facial Serum');
      setPrice(150);
      setOriginalPrice(undefined);
      setDiscountBadge('');
      setUnit('30ml Bottle');
      setImage(BEAUTY_IMAGE_PRESETS[0].url);
      setDescription('');
      setHighlights([]);
      setBadge('New In');
      setInStock(true);
      setIsPublished(true);
      setStockCount(40);
      setOrigin('');
      setHowToUse('Apply gently on clean skin morning and evening.');
      setIngredients('Natural plant extracts and vitamins.');
      setBenefits('Leaves skin smooth, hydrated, and glowing.');
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
      showToast('Please type a product name');
      return;
    }

    const finalBrand = brand === '__NEW__' && newBrandInput.trim() ? newBrandInput.trim() : brand;

    const productPayload = {
      name: name.trim(),
      brand: finalBrand,
      department,
      category,
      categoryLabel: categoryLabel.trim() || 'Retail Item',
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      discountBadge: discountBadge.trim() || undefined,
      unit: unit.trim() || 'Standard Pack',
      image,
      images: [image],
      description: description.trim(),
      highlights: highlights.length > 0 ? highlights : ['100% Original & Authentic'],
      badge: badge || undefined,
      inStock,
      isPublished,
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
      showToast(`Added new product to shop: ${name}`);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
                {isEditing ? `Edit Item: ${productToEdit.name}` : 'Add New Item to Shop'}
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
              }`}>
                {isPublished ? 'Visible to Customers' : 'Hidden / Draft'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Fill in the name, price in Ghana Cedis, stock quantity, and picture for this product.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-stone-100 pb-3 mb-4 text-xs font-bold">
          {[
            { id: 'general', label: '1. Basic Info & Section' },
            { id: 'pricing', label: '2. Price & Stock Quantity' },
            { id: 'media', label: '3. Product Picture' },
            { id: 'details', label: '4. How to Use & Details' },
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveSection(t.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeSection === t.id 
                  ? 'bg-[#1E1719] text-[#FAF6F0] shadow-xs' 
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
          
          {/* TAB 1: BASIC INFO */}
          {activeSection === 'general' && (
            <div className="space-y-4">
              
              {/* Department Switcher */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <label className="block font-bold text-stone-900">Which section does this product belong to?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDepartment('beauty');
                      setCategory('skincare');
                    }}
                    className={`p-3 rounded-xl border text-left font-bold transition-all ${
                      department === 'beauty' 
                        ? 'border-stone-900 bg-white text-stone-900 ring-2 ring-stone-900/10 shadow-xs' 
                        : 'border-stone-200 bg-white/60 text-stone-600'
                    }`}
                  >
                    <p className="text-xs">Beauty & Cosmetics</p>
                    <p className="text-[10px] font-normal text-stone-500">Skincare, Fragrances, Makeup, Lotions</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDepartment('groceries');
                      setCategory('rice-grains');
                    }}
                    className={`p-3 rounded-xl border text-left font-bold transition-all ${
                      department === 'groceries' 
                        ? 'border-stone-900 bg-white text-stone-900 ring-2 ring-stone-900/10 shadow-xs' 
                        : 'border-stone-200 bg-white/60 text-stone-600'
                    }`}
                  >
                    <p className="text-xs">Groceries & Household Essentials</p>
                    <p className="text-[10px] font-normal text-stone-500">Rice, Cooking Oils, Spices, Pantry Food</p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Niacinamide 10% + Zinc 1% (60ml)"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:bg-white focus:border-stone-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Brand Name *</label>
                  <select
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-stone-900 outline-none"
                  >
                    {brands.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                    <option value="__NEW__">+ Type a New Brand Name...</option>
                  </select>

                  {brand === '__NEW__' && (
                    <input
                      type="text"
                      placeholder="Type the brand name here"
                      value={newBrandInput}
                      onChange={e => setNewBrandInput(e.target.value)}
                      className="mt-2 w-full px-3 py-2 bg-white border border-stone-900 rounded-lg text-xs"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as CategoryType)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-stone-900 outline-none"
                  >
                    {department === 'beauty' ? (
                      <>
                        <option value="skincare">Skincare</option>
                        <option value="makeup">Makeup</option>
                        <option value="fragrances">Perfumes & Fragrances</option>
                        <option value="body-care">Body Care & Lotions</option>
                        <option value="beauty-tools">Beauty Tools</option>
                      </>
                    ) : (
                      <>
                        <option value="rice-grains">Rice & Grains</option>
                        <option value="cooking-oils">Cooking Oils</option>
                        <option value="seasoning-spices">Seasoning & Spices</option>
                        <option value="beverages">Beverages & Milk</option>
                        <option value="household-care">Household Cleaning</option>
                        <option value="daily-essentials">Daily Essentials</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Type of Product</label>
                  <input
                    type="text"
                    value={categoryLabel}
                    onChange={e => setCategoryLabel(e.target.value)}
                    placeholder="e.g. Face Serum, Body Cream, Perfume"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-stone-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Pack Size / Bottle Size</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    placeholder="e.g. 30ml Bottle, 500ml Tub, 5kg Bag"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-stone-900 outline-none"
                  />
                </div>

              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Product Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Explain what this product does, how it feels, and why customers will love it..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-stone-900 outline-none"
                />
              </div>

              {/* Show on website toggle */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900">Show on Online Shop</h4>
                  <p className="text-[11px] text-stone-500">
                    When turned ON, customers can see and buy this product on your website.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublished(!isPublished)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isPublished ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span>{isPublished ? 'Visible to Customers' : 'Hidden (Draft)'}</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: PRICING & STOCK */}
          {activeSection === 'pricing' && (
            <div className="space-y-4">
              
              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E2D8] space-y-4">
                <h3 className="font-bold text-stone-900 flex items-center gap-1.5 text-sm">
                  <DollarSign className="w-4 h-4 text-[#C89B3C]" />
                  <span>Selling Price (in Ghana Cedis)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Price to Sell (GHS) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={price}
                      onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl font-bold text-base text-stone-900 focus:border-stone-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Old Price (Before Discount)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={originalPrice || ''}
                      onChange={e => setOriginalPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="e.g. 200.00"
                      className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Discount Tag (e.g. -15%)</label>
                    <input
                      type="text"
                      value={discountBadge}
                      onChange={e => setDiscountBadge(e.target.value)}
                      placeholder="e.g. -15% OFF"
                      className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Stock Inventory */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-4">
                <h3 className="font-bold text-stone-900 flex items-center gap-1.5 text-sm">
                  <Package className="w-4 h-4 text-[#C89B3C]" />
                  <span>Stock Quantity in Shop</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">How many items do you have? *</label>
                    <input
                      type="number"
                      required
                      value={stockCount}
                      onChange={e => {
                        const count = parseInt(e.target.value) || 0;
                        setStockCount(count);
                        setInStock(count > 0);
                      }}
                      className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl font-bold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">In Stock Status</label>
                    <button
                      type="button"
                      onClick={() => setInStock(!inStock)}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        inStock ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${inStock ? 'bg-emerald-600' : 'bg-red-600'}`} />
                      <span>{inStock ? 'Available for Sale' : 'Out of Stock'}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Special Badge</label>
                    <select
                      value={badge || ''}
                      onChange={e => setBadge((e.target.value as any) || undefined)}
                      className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-xs"
                    >
                      <option value="">No Badge</option>
                      <option value="Bestseller">Bestseller (Top Seller)</option>
                      <option value="New In">New In (Just Arrived)</option>
                      <option value="CR Exclusive">CR Exclusive</option>
                      <option value="Sale">On Sale</option>
                      <option value="100% Authentic">100% Authentic</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: PICTURES */}
          {activeSection === 'media' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Picture Link / Web Address *</label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    required
                    value={image}
                    onChange={e => setImage(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-stone-900 outline-none"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    <img src={image} alt="Preview" className="w-full h-full object-contain" onError={() => {}} />
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-stone-500 block mb-2">Or Click Any Sample Picture Below to Use It:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BEAUTY_IMAGE_PRESETS.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImage(preset.url)}
                      className={`p-2 rounded-xl border text-[11px] text-left flex items-center gap-2 transition-all cursor-pointer ${
                        image === preset.url ? 'border-stone-900 bg-stone-100 font-bold text-stone-900' : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <img src={preset.url} alt="" className="w-8 h-8 rounded-lg object-contain shrink-0 bg-white" />
                      <span className="truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: USAGE & DETAILS */}
          {activeSection === 'details' && (
            <div className="space-y-4">
              
              {/* Feature Highlights */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">Key Selling Points (e.g. 100% Original)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newHighlight}
                    onChange={e => setNewHighlight(e.target.value)}
                    placeholder="e.g. Verified genuine batch from Canada"
                    className="flex-1 px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="px-4 py-2 bg-[#1E1719] text-[#FAF6F0] rounded-xl font-bold text-xs cursor-pointer hover:bg-[#33282C]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {highlights.map((h, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 bg-stone-100 text-stone-800 border border-stone-200 px-3 py-1 rounded-xl text-[11px] font-semibold">
                      <span>{h}</span>
                      <button type="button" onClick={() => handleRemoveHighlight(idx)} className="text-stone-400 hover:text-stone-700">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">How to Use</label>
                  <textarea
                    rows={3}
                    value={howToUse}
                    onChange={e => setHowToUse(e.target.value)}
                    placeholder="Instructions for customer..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Ingredients (What it contains)</label>
                  <textarea
                    rows={3}
                    value={ingredients}
                    onChange={e => setIngredients(e.target.value)}
                    placeholder="e.g. Natural oils, Vitamin C..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Benefits for Customer</label>
                  <textarea
                    rows={3}
                    value={benefits}
                    onChange={e => setBenefits(e.target.value)}
                    placeholder="e.g. Hydrates skin and clears blemishes..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Made in (Country of Origin)</label>
                <input
                  type="text"
                  value={origin}
                  onChange={e => setOrigin(e.target.value)}
                  placeholder="e.g. Made in Ghana, Made in Canada, Made in UK"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none"
                />
              </div>

            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-stone-300 text-stone-700 hover:bg-stone-50 rounded-xl font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1E1719] hover:bg-[#33282C] text-[#FAF6F0] rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Publish Item on Shop'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
