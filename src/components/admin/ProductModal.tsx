import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product, CategoryType, DepartmentType, ProductOption, ProductVariant } from '../../types';
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
  Sliders,
  Upload,
  Star,
  ImageOff
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

type VariantDraft = ProductVariant & { optionValues: Record<string, string> };

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
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState('');
  const [badge, setBadge] = useState<Product['badge']>('Bestseller');
  const [inStock, setInStock] = useState(true);
  const [isPublished, setIsPublished] = useState(true);
  const [stockCount, setStockCount] = useState(50);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [variants, setVariants] = useState<VariantDraft[]>([]);
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
      // Populate uploaded images from existing product
      const existingImgs = productToEdit.images && productToEdit.images.length > 0
        ? productToEdit.images
        : [productToEdit.image];
      setUploadedImages(existingImgs);
      setDescription(productToEdit.description);
      setHighlights(productToEdit.highlights || []);
      setBadge(productToEdit.badge);
      setInStock(productToEdit.inStock);
      setIsPublished(productToEdit.isPublished !== false);
      setStockCount(productToEdit.stockCount || 20);
      setOptions(productToEdit.options || []);
      setVariants((productToEdit.variants || []).map(variant => ({
        ...variant,
        optionValues: variant.options || {},
      })));
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
      setUploadedImages([]);
      setDescription('');
      setHighlights([]);
      setBadge('New In');
      setInStock(true);
      setIsPublished(true);
      setStockCount(40);
      setOptions([]);
      setVariants([]);
      setOrigin('');
      setHowToUse('Apply gently on clean skin morning and evening.');
      setIngredients('Natural plant extracts and vitamins.');
      setBenefits('Leaves skin smooth, hydrated, and glowing.');
    }
  }, [productToEdit, isOpen, brands]);

  if (!isOpen) return null;

  // ---- Image Upload Handlers ----
  const readFileAsDataURL = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const processFiles = async (files: FileList | File[]) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const validFiles = Array.from(files).filter(f => validTypes.includes(f.type) && f.size <= 5 * 1024 * 1024);
    if (validFiles.length === 0) {
      showToast('Please use JPG, PNG, or WEBP images under 5MB');
      return;
    }
    const dataUrls = await Promise.all(validFiles.map(readFileAsDataURL));
    setUploadedImages(prev => {
      const merged = [...prev, ...dataUrls];
      if (merged.length === 1 || !prev.includes(image)) setImage(merged[0]);
      return merged;
    });
    // Set primary image to first uploaded if none set yet
    setImage(prev => prev === BEAUTY_IMAGE_PRESETS[0].url && dataUrls.length > 0 ? dataUrls[0] : prev);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const handleRemoveImage = (idx: number) => {
    setUploadedImages(prev => {
      const next = prev.filter((_, i) => i !== idx);
      if (image === prev[idx]) setImage(next[0] || '');
      return next;
    });
  };

  const handleSetPrimary = (url: string) => {
    setImage(url);
  };
  // ---- End Image Upload Handlers ----

  const handleAddHighlight = () => {
    if (newHighlight.trim()) {
      setHighlights(prev => [...prev, newHighlight.trim()]);
      setNewHighlight('');
    }
  };

  const handleRemoveHighlight = (idx: number) => {
    setHighlights(prev => prev.filter((_, i) => i !== idx));
  };

  const addOption = () => setOptions(prev => [...prev, { name: '', values: [] }]);
  const addVariant = () => setVariants(prev => [...prev, {
    id: `variant-${Date.now()}-${prev.length}`,
    name: '',
    price: Number(price) || 0,
    inStock: true,
    stockCount: 0,
    optionValues: Object.fromEntries(options.map(option => [option.name, ''])),
  }]);

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
      image: image || (uploadedImages[0] || BEAUTY_IMAGE_PRESETS[0].url),
      images: uploadedImages.length > 0 ? uploadedImages : [image],
      description: description.trim(),
      highlights: highlights.length > 0 ? highlights : ['100% Original & Authentic'],
      badge: badge || undefined,
      inStock,
      isPublished,
      stockCount: Number(stockCount),
      options: options.filter(option => option.name.trim() && option.values.length > 0),
      variants: variants.map(({ optionValues, ...variant }) => ({
        ...variant,
        name: Object.values(optionValues).filter(Boolean).join(' / ') || variant.name,
        options: optionValues,
      })),
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

              <div className="space-y-4 rounded-2xl border border-[#E8E2D8] bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">Options and price variations</h3>
                    <p className="mt-1 text-[11px] text-stone-500">Add options such as Color, Size, or Type / Range, then set a price and stock count for each combination.</p>
                  </div>
                  <button type="button" onClick={addOption} className="flex shrink-0 items-center gap-1 rounded-lg bg-stone-900 px-3 py-2 text-[10px] font-bold text-white"><Plus className="h-3 w-3" /> Add option</button>
                </div>

                {options.map((option, index) => (
                  <div key={index} className="grid grid-cols-[1fr_1.5fr_auto] items-end gap-2">
                    <label className="text-[10px] font-bold text-stone-600">Option name<input value={option.name} onChange={e => setOptions(prev => prev.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} placeholder="Color, Size, Type" className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-2 text-xs text-stone-900" /></label>
                    <label className="text-[10px] font-bold text-stone-600">Values, separated by commas<input value={option.values.join(', ')} onChange={e => setOptions(prev => prev.map((item, i) => i === index ? { ...item, values: e.target.value.split(',').map(value => value.trim()).filter(Boolean) } : item))} placeholder="Red, Blue, Black" className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-2 text-xs text-stone-900" /></label>
                    <button type="button" onClick={() => setOptions(prev => prev.filter((_, i) => i !== index))} className="rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove option"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}

                {options.length > 0 && <div className="space-y-3 border-t border-stone-100 pt-4">
                  <div className="flex items-center justify-between"><h4 className="text-xs font-bold text-stone-800">Variant combinations</h4><button type="button" onClick={addVariant} className="flex items-center gap-1 rounded-lg border border-stone-200 px-3 py-2 text-[10px] font-bold text-stone-700 hover:border-stone-900"><Plus className="h-3 w-3" /> Add combination</button></div>
                  {variants.map((variant, index) => <div key={variant.id} className="rounded-xl border border-stone-200 bg-stone-50 p-3"><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {options.map(option => <label key={option.name} className="text-[10px] font-bold text-stone-600">{option.name}<select value={variant.optionValues[option.name] || ''} onChange={e => setVariants(prev => prev.map((item, i) => i === index ? { ...item, optionValues: { ...item.optionValues, [option.name]: e.target.value } } : item))} className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2 py-2 text-xs text-stone-900"><option value="">Choose</option>{option.values.map(value => <option key={value} value={value}>{value}</option>)}</select></label>)}
                    <label className="text-[10px] font-bold text-stone-600">Price (GHS)<input type="number" min="0" step="0.01" value={variant.price} onChange={e => setVariants(prev => prev.map((item, i) => i === index ? { ...item, price: Number(e.target.value) || 0 } : item))} className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2 py-2 text-xs font-bold text-stone-900" /></label>
                    <label className="text-[10px] font-bold text-stone-600">Stock<input type="number" min="0" value={variant.stockCount || 0} onChange={e => setVariants(prev => prev.map((item, i) => i === index ? { ...item, stockCount: Number(e.target.value) || 0, inStock: Number(e.target.value) > 0 } : item))} className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2 py-2 text-xs font-bold text-stone-900" /></label>
                    <button type="button" onClick={() => setVariants(prev => prev.filter((_, i) => i !== index))} className="self-end rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove combination"><Trash2 className="h-4 w-4" /></button>
                  </div></div>)}
                  {variants.length === 0 && <p className="text-[11px] text-stone-500">No combinations yet. Add one for each sellable variation.</p>}
                </div>}
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
            <div className="space-y-5">

              {/* Drag & Drop Upload Zone */}
              <div>
                <label className="block font-bold text-stone-900 text-sm mb-1">Product Pictures</label>
                <p className="text-[11px] text-stone-500 mb-3">
                  Upload clear pictures of the product. The first picture (or the one marked with a star ★) becomes the main image that customers see. You can upload multiple pictures.
                </p>

                {/* Drop Zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#1E1719] bg-stone-100 scale-[1.01]'
                      : 'border-stone-300 bg-stone-50 hover:bg-stone-100 hover:border-stone-400'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    className="sr-only"
                    onChange={handleFileInputChange}
                  />
                  <Upload className={`w-8 h-8 mx-auto mb-2 transition-colors ${
                    isDragging ? 'text-[#1E1719]' : 'text-stone-400'
                  }`} />
                  <p className="font-bold text-stone-700 text-sm">
                    {isDragging ? 'Drop your pictures here' : 'Click to choose pictures, or drag and drop them here'}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">JPG, PNG, WEBP — up to 5MB per image</p>
                </div>
              </div>

              {/* Uploaded Image Gallery */}
              {uploadedImages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700">
                      {uploadedImages.length} picture{uploadedImages.length > 1 ? 's' : ''} uploaded
                    </span>
                    <span className="text-[11px] text-stone-400">Click ★ to set main picture · Click 🗑 to remove</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {uploadedImages.map((url, idx) => (
                      <div
                        key={idx}
                        className={`relative group rounded-2xl overflow-hidden border-2 transition-all ${
                          image === url
                            ? 'border-[#1E1719] shadow-md ring-2 ring-[#1E1719]/20'
                            : 'border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Product image ${idx + 1}`}
                          className="w-full aspect-square object-cover bg-stone-100"
                        />

                        {/* Primary badge */}
                        {image === url && (
                          <div className="absolute top-1.5 left-1.5 bg-[#1E1719] text-[#FAF6F0] text-[9px] font-bold px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-[#C89B3C] text-[#C89B3C]" />
                            <span>Main</span>
                          </div>
                        )}

                        {/* Actions overlay on hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {image !== url && (
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); handleSetPrimary(url); }}
                              className="p-1.5 bg-white/90 hover:bg-white rounded-lg text-stone-900 cursor-pointer"
                              title="Set as main picture"
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); handleRemoveImage(idx); }}
                            className="p-1.5 bg-white/90 hover:bg-red-100 rounded-lg text-rose-600 cursor-pointer"
                            title="Remove this picture"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add more button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-2xl border-2 border-dashed border-stone-300 hover:border-stone-400 hover:bg-stone-50 flex flex-col items-center justify-center gap-1 text-stone-400 hover:text-stone-600 transition-all cursor-pointer"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-[10px] font-bold">Add more</span>
                    </button>
                  </div>
                </div>
              )}

              {/* No images yet */}
              {uploadedImages.length === 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5">
                  <ImageOff className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-800">No picture uploaded yet</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Products without a picture are less likely to be purchased. Upload at least one clear product photo.
                    </p>
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-1.5">
                <p className="text-xs font-bold text-stone-700">📸 Tips for great product photos:</p>
                <ul className="text-[11px] text-stone-500 space-y-1 list-disc list-inside">
                  <li>Use a plain white or light background</li>
                  <li>Make sure the product is in focus and well-lit</li>
                  <li>Show the front label clearly so customers can read it</li>
                  <li>Add multiple angles — front, side, and back</li>
                </ul>
              </div>

            </div>
          )}

          {/* TAB 4: USAGE & DETAILS */}
          {activeSection === 'details' && (
            <div className="space-y-5">

              {/* Key Selling Points / Highlights */}
              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D8] space-y-3">
                <div>
                  <label className="block font-bold text-stone-900 text-sm mb-0.5">Key Selling Points</label>
                  <p className="text-[11px] text-stone-500">
                    Add short punchy reasons customers will love this product. E.g. "100% Original", "Dermatologist Tested", "Free from Parabens".
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newHighlight}
                    onChange={e => setNewHighlight(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddHighlight();
                      }
                    }}
                    placeholder="e.g. Verified genuine batch from Canada"
                    className="flex-1 px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:border-stone-900 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="px-4 py-2.5 bg-[#1E1719] text-[#FAF6F0] rounded-xl font-bold text-xs cursor-pointer hover:bg-[#33282C] flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {highlights.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {highlights.map((h, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 bg-white text-stone-800 border border-stone-200 px-3 py-1.5 rounded-xl text-[11px] font-semibold shadow-2xs">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{h}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(idx)}
                          className="text-stone-300 hover:text-rose-500 transition-colors ml-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-stone-400 italic">No selling points added yet. Add at least one above.</p>
                )}
              </div>

              {/* How to Use */}
              <div className="space-y-1.5">
                <label className="block font-bold text-stone-900 text-sm">How to Use This Product</label>
                <p className="text-[11px] text-stone-500">Write simple step-by-step instructions. Customers will see this on the product page.</p>
                <textarea
                  rows={4}
                  value={howToUse}
                  onChange={e => setHowToUse(e.target.value)}
                  placeholder="e.g. Apply a few drops to entire face morning and evening before heavier creams. Avoid direct eye contact."
                  className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:bg-white focus:border-stone-900 resize-y leading-relaxed"
                />
                <p className="text-[10px] text-stone-400 text-right">{howToUse.length} characters</p>
              </div>

              {/* Ingredients */}
              <div className="space-y-1.5">
                <label className="block font-bold text-stone-900 text-sm">What It Contains (Ingredients)</label>
                <p className="text-[11px] text-stone-500">List the main ingredients or contents. Customers trust products that are transparent about what is inside.</p>
                <textarea
                  rows={4}
                  value={ingredients}
                  onChange={e => setIngredients(e.target.value)}
                  placeholder="e.g. Aqua (Water), Niacinamide 10%, Pentylene Glycol, Zinc PCA 1%, Dimethyl Isosorbide, Tamarindus Indica Seed Gum..."
                  className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:bg-white focus:border-stone-900 resize-y leading-relaxed"
                />
                <p className="text-[10px] text-stone-400 text-right">{ingredients.length} characters</p>
              </div>

              {/* Benefits */}
              <div className="space-y-1.5">
                <label className="block font-bold text-stone-900 text-sm">Benefits for the Customer</label>
                <p className="text-[11px] text-stone-500">What result will the customer see or feel? Write it clearly. E.g. "Reduces pore size and controls shine within 2 weeks."</p>
                <textarea
                  rows={3}
                  value={benefits}
                  onChange={e => setBenefits(e.target.value)}
                  placeholder="e.g. Clarifies skin texture, controls shine, and supports skin barrier balance after consistent use."
                  className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:bg-white focus:border-stone-900 resize-y leading-relaxed"
                />
              </div>

              {/* Country of Origin */}
              <div className="space-y-1.5">
                <label className="block font-bold text-stone-900 text-sm">Made In (Country of Origin)</label>
                <p className="text-[11px] text-stone-500">Where was this product manufactured? This builds customer trust.</p>
                <input
                  type="text"
                  value={origin}
                  onChange={e => setOrigin(e.target.value)}
                  placeholder="e.g. Made in South Korea, Made in Canada, Made in Ghana"
                  className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:bg-white focus:border-stone-900"
                />
              </div>

              {/* Info callout */}
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-2.5">
                <div className="p-1 bg-blue-100 rounded-lg mt-0.5 shrink-0">
                  <Globe className="w-3.5 h-3.5 text-blue-700" />
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  <strong>Where customers see this:</strong> The "How to Use", "Ingredients" and "Benefits" text appears on your product page under a tabbed section. A full, detailed product page builds more customer confidence and leads to more sales.
                </p>
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
