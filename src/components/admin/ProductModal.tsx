import React, { useEffect, useRef, useState } from 'react';
import { Product, CategoryConfig, CategoryType, DepartmentType, ProductOption, ProductVariant } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { Layers, Image as ImageIcon, Plus, Save, Trash2, Upload, X } from 'lucide-react';

interface ProductModalProps { isOpen: boolean; onClose: () => void; productToEdit?: Product | null; }
type VariantDraft = ProductVariant & { optionValues: Record<string, string> };

const categoriesByDepartment: Record<DepartmentType, { value: CategoryType; label: string }[]> = {
  beauty: [
    { value: 'skincare', label: 'Skincare' }, { value: 'makeup', label: 'Makeup' }, { value: 'fragrances', label: 'Fragrances' },
    { value: 'body-care', label: 'Body care' }, { value: 'beauty-tools', label: 'Beauty tools' },
  ],
  groceries: [
    { value: 'rice-grains', label: 'Rice and grains' }, { value: 'cooking-oils', label: 'Cooking oils' },
    { value: 'seasoning-spices', label: 'Seasoning and spices' }, { value: 'beverages', label: 'Drinks' },
    { value: 'household-care', label: 'Household care' }, { value: 'daily-essentials', label: 'Daily essentials' },
  ],
};
const fieldClass = 'mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-900 outline-none transition focus:border-[#B27A52] focus:ring-2 focus:ring-[#B27A52]/15';

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, productToEdit }) => {
  const { addProduct, updateProduct, brands, addBrand, deleteBrand, categories: storeCategories, addCategory, deleteCategory } = useStore();
  const { showToast } = useToast();
  const [name, setName] = useState(''); const [department, setDepartment] = useState<DepartmentType>('beauty');
  const [brand, setBrand] = useState(''); const [newBrandInput, setNewBrandInput] = useState(''); const [category, setCategory] = useState<CategoryType>('skincare');
  const [categoryLabel, setCategoryLabel] = useState(''); const [price, setPrice] = useState(0); const [deliveryPrice, setDeliveryPrice] = useState<number | undefined>(); const [originalPrice, setOriginalPrice] = useState<number | undefined>();
  const [catalogOpen, setCatalogOpen] = useState(false); const [newBrandName, setNewBrandName] = useState(''); const [newCategoryId, setNewCategoryId] = useState(''); const [newCategoryName, setNewCategoryName] = useState(''); const [newCategoryImage, setNewCategoryImage] = useState('');
  const [discountBadge, setDiscountBadge] = useState(''); const [unit, setUnit] = useState(''); const [image, setImage] = useState(''); const [uploadedImages, setUploadedImages] = useState<string[]>([]); const [isDragging, setIsDragging] = useState(false); const fileInputRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState(''); const [highlights, setHighlights] = useState<string[]>([]); const [badge, setBadge] = useState<Product['badge']>(); const [inStock, setInStock] = useState(true); const [isPublished, setIsPublished] = useState(true); const [stockCount, setStockCount] = useState(0);
  const [options, setOptions] = useState<ProductOption[]>([]); const [variants, setVariants] = useState<VariantDraft[]>([]); const [origin, setOrigin] = useState(''); const [howToUse, setHowToUse] = useState(''); const [ingredients, setIngredients] = useState(''); const [benefits, setBenefits] = useState(''); const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (productToEdit) {
      const product = productToEdit;
      setName(product.name); setDepartment(product.department || 'beauty'); setBrand(product.brand); setCategory(product.category); setCategoryLabel(product.categoryLabel || ''); setPrice(product.price); setDeliveryPrice(product.deliveryPrice); setOriginalPrice(product.originalPrice); setDiscountBadge(product.discountBadge || ''); setUnit(product.unit || ''); setImage(product.image || ''); setUploadedImages(product.images?.length ? product.images : product.image ? [product.image] : []); setDescription(product.description); setHighlights(product.highlights || []); setBadge(product.badge); setInStock(product.inStock); setIsPublished(product.isPublished !== false); setStockCount(product.stockCount || 0); setOptions(product.options || []); setVariants((product.variants || []).map(variant => ({ ...variant, optionValues: variant.options || {} }))); setOrigin(product.origin || ''); setHowToUse(product.details?.howToUse || ''); setIngredients(product.details?.ingredients || ''); setBenefits(product.details?.benefits || '');
    } else {
      setName(''); setDepartment('beauty'); setBrand(brands[1] || brands[0] || ''); setNewBrandInput(''); setCategory('skincare'); setCategoryLabel(''); setPrice(0); setDeliveryPrice(undefined); setOriginalPrice(undefined); setDiscountBadge(''); setUnit(''); setImage(''); setUploadedImages([]); setDescription(''); setHighlights([]); setBadge(undefined); setInStock(true); setIsPublished(true); setStockCount(0); setOptions([]); setVariants([]); setOrigin(''); setHowToUse(''); setIngredients(''); setBenefits('');
    }
  }, [isOpen, productToEdit, brands]);

  if (!isOpen) return null;

  const readImage = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => {
      const result = String(event.target?.result || '');
      const preview = new Image();
      preview.onload = () => {
        const max = 960;
        const scale = Math.min(1, max / Math.max(preview.width, preview.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(preview.width * scale);
        canvas.height = Math.round(preview.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(preview, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          resolve(result);
        }
      };
      preview.onerror = () => resolve(result);
      preview.src = result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const processFiles = async (files: FileList | File[]) => { const valid = Array.from(files).filter(file => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) && file.size <= 10 * 1024 * 1024); if (!valid.length) { showToast('Please choose a JPG, PNG, WEBP, or GIF image under 10MB.'); return; } try { const images = await Promise.all(valid.map(readImage)); setUploadedImages(previous => [...previous, ...images]); setImage(previous => previous || images[0]); showToast('Photo added'); } catch { showToast('Could not read that photo. Please try again.'); } };
  const removeImage = (index: number) => setUploadedImages(previous => { const next = previous.filter((_, itemIndex) => itemIndex !== index); if (image === previous[index]) setImage(next[0] || ''); return next; });
  const addOption = () => setOptions(previous => [...previous, { name: '', values: [] }]);
  const addPresetOption = (optionName: string, values: string[]) => { if (!options.some(option => option.name.toLowerCase() === optionName.toLowerCase())) setOptions(previous => [...previous, { name: optionName, values }]); };
  const unusedCategoryIds = categoriesByDepartment[department].filter(item => !storeCategories.some(existing => existing.id === item.value));
  const readCategoryImage = (file: File) => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result || '')); reader.onerror = reject; reader.readAsDataURL(file); });
  const createBrand = async () => { const value = newBrandName.trim(); if (!value) return; await addBrand(value); setBrand(value); setNewBrandName(''); showToast(`Added brand: ${value}`); };
  const removeSelectedBrand = async () => { if (!brand || !window.confirm(`Remove ${brand} from the brand list?`)) return; await deleteBrand(brand); setBrand(brands.find(value => value !== brand) || ''); showToast(`Removed brand: ${brand}`); };
  const createCategory = async () => {
    if (!newCategoryId || !newCategoryName.trim() || !newCategoryImage) { showToast('Choose a category, name, and image first'); return; }
    const item = categoriesByDepartment[department].find(value => value.value === newCategoryId);
    if (!item) return;
    const categoryData: CategoryConfig = { id: item.value, slug: newCategoryId, name: newCategoryName.trim(), department, image: newCategoryImage, description: `${newCategoryName.trim()} products`, isActive: true };
    await addCategory(categoryData); setCategory(item.value); setNewCategoryId(''); setNewCategoryName(''); setNewCategoryImage(''); showToast(`Added category: ${categoryData.name}`);
  };
  const removeSelectedCategory = async () => { const selected = storeCategories.find(item => item.id === category); if (!selected || !window.confirm(`Remove ${selected.name} from the category list?`)) return; await deleteCategory(selected.id); setCategory(categoriesByDepartment[department].find(item => item.value !== selected.id)?.value || 'skincare'); showToast(`Removed category: ${selected.name}`); };
  const generateVariants = () => {
    const validOptions = options.filter(option => option.name.trim() && option.values.length);
    if (!validOptions.length) {
      showToast('Add an option and its values first');
      return;
    }
    const combinations = validOptions.reduce<Record<string, string>[]>(
      (result, option) => result.flatMap(existing => option.values.map(value => ({ ...existing, [option.name]: value }))),
      [{}]
    );
    setVariants(combinations.map((optionValues, index) => ({
      id: `variant-${Date.now()}-${index}`,
      name: Object.values(optionValues).join(' / '),
      price,
      inStock: true,
      stockCount: stockCount || 0,
      image: uploadedImages[index] || uploadedImages[0] || image || '',
      optionValues,
    })));
    showToast(`Generated ${combinations.length} variations`);
  };

  const addManualVariant = () => {
    setVariants(previous => [
      ...previous,
      {
        id: `variant-${Date.now()}-${previous.length}`,
        name: `Variation ${previous.length + 1}`,
        price: price || 0,
        inStock: true,
        stockCount: stockCount || 0,
        image: uploadedImages[previous.length] || uploadedImages[0] || image || '',
        optionValues: {},
      },
    ]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) { showToast('Enter a product name'); return; }
    if (!image && !uploadedImages.length) { showToast('Upload at least one product photo'); return; }
    if (price <= 0) { showToast('Enter a selling price'); return; }
    if (options.some(option => !option.name.trim() || !option.values.length)) { showToast('Complete or remove each product option'); return; }
    if (options.length && !variants.length) { showToast('Click "Create combinations" to generate your variations'); return; }

    const primaryImage = image || uploadedImages[0];
    const cleanOptions = options.filter(option => option.name.trim() && option.values.length);
    const finalBrand = brand === '__NEW__' ? newBrandInput.trim() : brand;
    const payload = {
      name: name.trim(),
      brand: finalBrand || 'Unbranded',
      department,
      category,
      categoryLabel: categoryLabel.trim() || 'Retail Item',
      price,
      ...(deliveryPrice === undefined ? {} : { deliveryPrice }),
      originalPrice: originalPrice || undefined,
      discountBadge: discountBadge.trim() || undefined,
      unit: unit.trim() || 'Standard Pack',
      image: primaryImage,
      images: uploadedImages.length ? uploadedImages : [primaryImage],
      description: description.trim(),
      highlights: highlights.length ? highlights : ['Original and authentic', 'Quality inspected'],
      badge: badge || undefined,
      inStock,
      isPublished,
      stockCount,
      options: cleanOptions,
      variants: variants.map(({ optionValues, ...variant }) => ({
        ...variant,
        name: variant.name.trim() || Object.values(optionValues).filter(Boolean).join(' / ') || 'Variation',
        options: optionValues,
        price: Number(variant.price) || price,
        stockCount: Number(variant.stockCount) ?? stockCount,
        inStock: (Number(variant.stockCount) ?? stockCount) > 0,
        image: variant.image || primaryImage,
      })),
      origin: origin.trim(),
      rating: productToEdit?.rating || 5,
      reviewCount: productToEdit?.reviewCount || 0,
      details: {
        howToUse: howToUse.trim(),
        ingredients: ingredients.trim(),
        benefits: benefits.trim(),
      },
    };
    setIsSaving(true);
    try {
      if (productToEdit) {
        await updateProduct(productToEdit.id, payload);
        showToast(`Updated ${name}`);
      } else {
        await addProduct(payload);
        showToast(`Added ${name}`);
      }
      onClose();
    } catch (err: any) {
      const errMsg = err?.data?.error || err?.message || 'Could not save the product. Please check the details and try again.';
      showToast(errMsg);
    } finally {
      setIsSaving(false);
    }
  };
  const categories = storeCategories.filter(item => item.department === department).length
    ? storeCategories.filter(item => item.department === department).map(item => ({ value: item.id, label: item.name }))
    : categoriesByDepartment[department];
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1e1719]/65 p-3 font-sans backdrop-blur-sm sm:p-6"><div className="mx-auto flex min-h-full max-w-4xl items-center justify-center"><div className="flex max-h-[94vh] w-full flex-col overflow-hidden rounded-2xl bg-[#fffdfb] shadow-2xl" onClick={event => event.stopPropagation()}>
      <header className="flex items-start justify-between border-b border-stone-200 px-5 py-5 sm:px-7"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#B27A52]">Products</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-[#1E1719]">{productToEdit ? 'Edit product' : 'Add a product'}</h2><p className="mt-1 text-sm text-stone-500">Add the details customers need to buy this item.</p></div><button type="button" onClick={onClose} disabled={isSaving} aria-label="Close" className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-900"><X className="h-5 w-5" /></button></header>
      <form onSubmit={handleSubmit} className="flex-1 space-y-6 overflow-y-auto px-5 py-6 text-sm sm:px-7">
        <section className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <div>
            <p className="font-bold text-stone-900">Product photos <span className="text-rose-600">*</span></p>
            <p className="mt-1 text-xs text-stone-500">Upload one or more photos. Click any photo below to set as the cover.</p>
            <div
              onDragOver={event => { event.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={event => { event.preventDefault(); setIsDragging(false); void processFiles(event.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`mt-3 flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed p-3 transition ${isDragging ? 'border-[#B27A52] bg-[#fbf3ec]' : 'border-stone-300 bg-stone-50 hover:border-stone-400'}`}
            >
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="sr-only" onChange={event => { if (event.target.files) void processFiles(event.target.files); }} />
              {image ? (
                <div className="relative h-full w-full overflow-hidden rounded-lg">
                  <img src={image} alt="Main product preview" className="h-full w-full object-cover" />
                  <span className="absolute bottom-2 left-2 rounded-md bg-stone-900/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                    Main Cover
                  </span>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-7 w-7 text-[#B27A52]" />
                  <p className="mt-2 text-xs font-bold text-stone-700">Choose photos</p>
                  <p className="mt-1 text-[11px] text-stone-400">JPG, PNG, WEBP, or GIF</p>
                </div>
              )}
            </div>

            {uploadedImages.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-stone-700">All photos ({uploadedImages.length})</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B27A52] hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Add more
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {uploadedImages.map((url, index) => (
                    <div
                      key={index}
                      onClick={() => setImage(url)}
                      title={image === url ? 'Current main photo' : 'Click to set as main photo'}
                      className={`group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                        image === url ? 'border-[#B27A52] ring-2 ring-[#B27A52]/20' : 'border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <img src={url} alt={`Product photo ${index + 1}`} className="h-full w-full object-cover" />
                      {image === url && (
                        <span className="absolute inset-x-0 bottom-0 bg-[#B27A52] py-0.5 text-center text-[8px] font-bold text-white uppercase">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                        aria-label={`Remove photo ${index + 1}`}
                        className="absolute right-0.5 top-0.5 rounded bg-white/90 p-1 text-rose-600 opacity-0 group-hover:opacity-100 transition shadow-xs"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-stone-300 text-stone-400 hover:border-[#B27A52] hover:text-[#B27A52] transition"
                    title="Upload more photos"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <label className="block font-bold text-stone-800">
              Product name <span className="text-rose-600">*</span>
              <input required value={name} onChange={event => setName(event.target.value)} placeholder="Example: Hydrating Face Cream" className={`${fieldClass} text-base`} />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="font-bold text-stone-800">
                  Brand
                  <select value={brand} onChange={event => setBrand(event.target.value)} className={`${fieldClass} font-normal`}>
                    {brands.map(value => <option key={value} value={value}>{value}</option>)}
                    <option value="__NEW__">Add a new brand</option>
                  </select>
                </label>
                <div className="mt-2 flex gap-2">
                  <input value={newBrandName} onChange={event => setNewBrandName(event.target.value)} placeholder="New brand name" className={`${fieldClass} mt-0 font-normal`} />
                  <button type="button" onClick={() => void createBrand()} className="shrink-0 rounded-lg bg-stone-900 px-3 text-xs font-bold text-white">Add</button>
                </div>
                <button type="button" onClick={() => void removeSelectedBrand()} className="mt-1 text-xs text-rose-600 hover:underline">Delete selected brand</button>
              </div>

              <label className="font-bold text-stone-800">
                Pack size / Default unit
                <input value={unit} onChange={event => setUnit(event.target.value)} placeholder="Example: 30ml, 500g, 1 piece" className={`${fieldClass} font-normal`} />
              </label>
            </div>

            <div>
              <p className="font-bold text-stone-800">Where should it appear?</p>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => { setDepartment('beauty'); setCategory('skincare'); }} className={`rounded-lg border px-3 py-2.5 text-left font-semibold ${department === 'beauty' ? 'border-[#B27A52] bg-[#fbf3ec] text-[#6B3B2E]' : 'border-stone-300 bg-white text-stone-600'}`}>Beauty</button>
                <button type="button" onClick={() => { setDepartment('groceries'); setCategory('rice-grains'); }} className={`rounded-lg border px-3 py-2.5 text-left font-semibold ${department === 'groceries' ? 'border-[#B27A52] bg-[#fbf3ec] text-[#6B3B2E]' : 'border-stone-300 bg-white text-stone-600'}`}>Groceries</button>
              </div>
              <button type="button" onClick={() => setCatalogOpen(!catalogOpen)} className="mt-2 text-xs font-bold text-[#8A3D52] hover:underline">{catalogOpen ? 'Hide' : 'Manage'} categories</button>
              {catalogOpen && (
                <div className="mt-3 space-y-2 rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <select value={newCategoryId} onChange={event => setNewCategoryId(event.target.value)} className="rounded-lg border border-stone-300 bg-white px-2 py-2 text-xs">
                      <option value="">Choose a category to add</option>
                      {unusedCategoryIds.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                    <input value={newCategoryName} onChange={event => setNewCategoryName(event.target.value)} placeholder="Category name" className="rounded-lg border border-stone-300 px-2 py-2 text-xs" />
                  </div>
                  <div className="flex gap-2">
                    <input type="file" accept="image/*" onChange={event => { const file = event.target.files?.[0]; if (file) void readCategoryImage(file).then(setNewCategoryImage); }} className="min-w-0 flex-1 text-xs" />
                    <button type="button" onClick={() => void createCategory()} className="rounded-lg bg-stone-900 px-3 py-2 text-xs font-bold text-white">Create</button>
                  </div>
                  {newCategoryImage && <img src={newCategoryImage} alt="New category preview" className="h-14 w-14 rounded object-cover" />}
                  <button type="button" onClick={() => void removeSelectedCategory()} className="text-xs text-rose-600 hover:underline">Delete selected category</button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="border-t border-stone-200 pt-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-stone-900">Base price and stock</h3>
            <p className="mt-1 text-xs text-stone-500">Default pricing if no specific variation is chosen.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="font-bold text-stone-800">
              Selling price (GHS) <span className="text-rose-600">*</span>
              <input type="number" min="0" step="0.01" required value={price || ''} onChange={event => setPrice(Number(event.target.value) || 0)} className={`${fieldClass} text-base font-bold`} />
            </label>
            <label className="font-bold text-stone-800">
              Units in stock <span className="text-rose-600">*</span>
              <input type="number" min="0" required value={stockCount} onChange={event => { const count = Number(event.target.value) || 0; setStockCount(count); setInStock(count > 0); }} className={`${fieldClass} text-base font-bold`} />
            </label>
            <label className="font-bold text-stone-800">
              Category
              <select value={category} onChange={event => setCategory(event.target.value as CategoryType)} className={`${fieldClass} font-normal`}>
                {categories.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="font-bold text-stone-800">
              Old price <span className="font-normal text-stone-400">(optional)</span>
              <input type="number" min="0" step="0.01" value={originalPrice || ''} onChange={event => setOriginalPrice(event.target.value ? Number(event.target.value) : undefined)} placeholder="Show a discount" className={`${fieldClass} font-normal`} />
            </label>
            <label className="font-bold text-stone-800">
              Delivery price <span className="font-normal text-stone-400">(optional)</span>
              <input type="number" min="0" step="0.01" value={deliveryPrice ?? ''} onChange={event => setDeliveryPrice(event.target.value ? Number(event.target.value) : undefined)} placeholder="Use the normal delivery price" className={`${fieldClass} font-normal`} />
            </label>
          </div>
        </section>

        {/* Variations & Pricing Section */}
        <section className="border-t border-stone-200 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-[#B27A52]" />
                <h3 className="text-lg font-bold text-stone-900">Product Variations & Photos</h3>
              </div>
              <p className="mt-1 text-xs text-stone-500">
                Add different options (e.g. 30ml vs 100ml, Colors, Weights) with their own prices and photos.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addManualVariant}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
              >
                <Plus className="h-3.5 w-3.5" /> Add Variation
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 space-y-4">
            <div>
              <p className="text-xs font-bold text-stone-800 uppercase tracking-wider">Option attributes</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" onClick={() => addPresetOption('Color', ['Red', 'Blue', 'Black'])} className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50">
                  + Add colour
                </button>
                <button type="button" onClick={() => addPresetOption('Size', ['Small', 'Medium', 'Large'])} className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50">
                  + Add size
                </button>
                <button type="button" onClick={() => addPresetOption('Volume', ['30ml', '50ml', '100ml'])} className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50">
                  + Add volume
                </button>
                <button type="button" onClick={addOption} className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50">
                  + Custom option
                </button>
                {options.length > 0 && (
                  <button type="button" onClick={generateVariants} className="rounded-lg bg-stone-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-stone-800 transition">
                    Generate Combinations
                  </button>
                )}
              </div>

              {options.map((option, index) => (
                <div key={index} className="mt-2.5 grid grid-cols-[1fr_2fr_auto] gap-2 items-center">
                  <input
                    aria-label="Option name"
                    value={option.name}
                    onChange={event => setOptions(previous => previous.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))}
                    placeholder="Option name (e.g. Size)"
                    className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium"
                  />
                  <input
                    aria-label="Option values"
                    value={option.values.join(', ')}
                    onChange={event => setOptions(previous => previous.map((item, itemIndex) => itemIndex === index ? { ...item, values: event.target.value.split(',').map(value => value.trim()).filter(Boolean) } : item))}
                    placeholder="Values separated by commas (e.g. 30ml, 50ml, 100ml)"
                    className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setOptions(previous => previous.filter((_, itemIndex) => itemIndex !== index))}
                    aria-label="Remove option"
                    className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Individual Variations Table */}
            {variants.length > 0 ? (
              <div className="pt-2 border-t border-stone-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    Configured Variations ({variants.length})
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Customize the photo, price, and stock for each item.
                  </p>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {variants.map((v, vIdx) => (
                    <div
                      key={v.id || vIdx}
                      className="grid grid-cols-1 sm:grid-cols-[auto_1fr_120px_90px_auto] items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 shadow-xs"
                    >
                      {/* Variant Photo & Image Selector */}
                      <div className="relative group shrink-0">
                        <div className="relative h-14 w-14 rounded-lg border border-stone-300 overflow-hidden bg-stone-100 flex items-center justify-center">
                          {v.image ? (
                            <img src={v.image} alt={v.name} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-stone-400" />
                          )}
                        </div>
                        <label
                          className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center bg-black/60 text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 rounded-lg transition-opacity"
                          title="Upload new photo for this variation"
                        >
                          <Upload className="h-3.5 w-3.5 mb-0.5" />
                          Change
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const compressed = await readImage(file);
                                  setVariants(prev => prev.map((item, idx) => idx === vIdx ? { ...item, image: compressed } : item));
                                  if (!uploadedImages.includes(compressed)) {
                                    setUploadedImages(prev => [...prev, compressed]);
                                  }
                                  showToast(`Photo updated for ${v.name}`);
                                } catch {
                                  showToast('Could not load variant image');
                                }
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* Variant Name & Photo Quick Picker */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Variation Name</label>
                        <input
                          value={v.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setVariants(prev => prev.map((item, idx) => idx === vIdx ? { ...item, name: val } : item));
                          }}
                          placeholder="e.g. 50ml, Rose Gold, 1kg"
                          className="mt-1 w-full rounded-md border border-stone-300 px-2.5 py-1.5 text-xs font-semibold text-stone-900 focus:border-[#B27A52] outline-none"
                        />
                        {uploadedImages.length > 1 && (
                          <div className="mt-1.5 flex items-center gap-1.5 overflow-x-auto py-0.5">
                            <span className="text-[10px] text-stone-400 shrink-0">Pick photo:</span>
                            {uploadedImages.map((imgUrl, imgIdx) => (
                              <button
                                key={imgIdx}
                                type="button"
                                title={`Assign gallery photo ${imgIdx + 1}`}
                                onClick={() => setVariants(prev => prev.map((item, idx) => idx === vIdx ? { ...item, image: imgUrl } : item))}
                                className={`h-6 w-6 rounded border overflow-hidden shrink-0 transition ${
                                  v.image === imgUrl ? 'border-[#B27A52] ring-2 ring-[#B27A52]/40' : 'border-stone-200 opacity-60 hover:opacity-100'
                                }`}
                              >
                                <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Variant Price */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Price (GHS)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={v.price}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setVariants(prev => prev.map((item, idx) => idx === vIdx ? { ...item, price: val } : item));
                          }}
                          className="mt-1 w-full rounded-md border border-stone-300 px-2.5 py-1.5 text-xs font-bold text-stone-900 focus:border-[#B27A52] outline-none"
                        />
                      </div>

                      {/* Variant Stock */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Stock</label>
                        <input
                          type="number"
                          min="0"
                          value={v.stockCount ?? 0}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setVariants(prev => prev.map((item, idx) => idx === vIdx ? { ...item, stockCount: val, inStock: val > 0 } : item));
                          }}
                          className="mt-1 w-full rounded-md border border-stone-300 px-2.5 py-1.5 text-xs font-semibold text-stone-900 focus:border-[#B27A52] outline-none"
                        />
                      </div>

                      {/* Delete Variant */}
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => setVariants(prev => prev.filter((_, idx) => idx !== vIdx))}
                          title="Delete variation"
                          className="rounded-lg p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">
                No variations configured yet. Click "+ Add Variation" or add attributes and click "Generate Combinations".
              </p>
            )}
          </div>
        </section>

        <section className="border-t border-stone-200 pt-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-stone-900">Product description</h3>
            <p className="mt-1 text-xs text-stone-500">Use a few simple sentences to explain the product.</p>
          </div>
          <textarea required rows={4} value={description} onChange={event => setDescription(event.target.value)} placeholder="Example: A light face cream that helps dry skin feel soft and hydrated." className={fieldClass} />
          <div className="mt-4 flex items-center justify-between rounded-lg bg-stone-50 p-3">
            <div>
              <p className="font-bold text-stone-800">Show this product in the shop</p>
              <p className="mt-0.5 text-xs text-stone-500">Customers can see and buy it when this is on.</p>
            </div>
            <button type="button" onClick={() => setIsPublished(!isPublished)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
              {isPublished ? 'On' : 'Off'}
            </button>
          </div>
        </section>

        <details className="border-t border-stone-200 pt-5">
          <summary className="cursor-pointer list-none font-bold text-stone-800">
            More product details <span className="font-normal text-stone-400">(optional)</span>
          </summary>
          <div className="mt-4 space-y-5">
            <label className="block font-bold text-stone-800">
              Product type
              <input value={categoryLabel} onChange={event => setCategoryLabel(event.target.value)} placeholder="Example: Face cream" className={`${fieldClass} font-normal`} />
            </label>
            <label className="block font-bold text-stone-800">
              Made in
              <input value={origin} onChange={event => setOrigin(event.target.value)} placeholder="Example: Ghana" className={`${fieldClass} font-normal`} />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="font-bold text-stone-800">
                How to use
                <textarea rows={3} value={howToUse} onChange={event => setHowToUse(event.target.value)} placeholder="Simple instructions" className={`${fieldClass} font-normal`} />
              </label>
              <label className="font-bold text-stone-800">
                Ingredients
                <textarea rows={3} value={ingredients} onChange={event => setIngredients(event.target.value)} placeholder="List the main ingredients" className={`${fieldClass} font-normal`} />
              </label>
            </div>
            <label className="block font-bold text-stone-800">
              Benefits
              <textarea rows={3} value={benefits} onChange={event => setBenefits(event.target.value)} placeholder="What will this product help with?" className={`${fieldClass} font-normal`} />
            </label>
            <div>
              <p className="font-bold text-stone-800">Small label</p>
              <select value={badge || ''} onChange={event => setBadge((event.target.value as Product['badge']) || undefined)} className={`${fieldClass} max-w-xs font-normal`}>
                <option value="">No label</option>
                <option value="Bestseller">Bestseller</option>
                <option value="New In">New arrival</option>
                <option value="CR Exclusive">CR exclusive</option>
                <option value="Sale">Sale</option>
              </select>
            </div>
          </div>
        </details>

        <footer className="sticky bottom-0 -mx-5 flex items-center justify-between border-t border-stone-200 bg-[#fffdfb]/95 px-5 py-4 backdrop-blur sm:-mx-7 sm:px-7">
          <button type="button" onClick={onClose} disabled={isSaving} className="rounded-lg border border-stone-300 px-4 py-2.5 font-bold text-stone-700 hover:bg-stone-50">
            Cancel
          </button>
          <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-[#1E1719] px-5 py-2.5 font-bold text-white hover:bg-[#33282C] disabled:opacity-60">
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : productToEdit ? 'Save product' : 'Add product'}
          </button>
        </footer>
      </form>
    </div></div></div>
  );
};
