import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  Printer,
  Barcode,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  Layers,
  Filter,
  RefreshCw,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Scissors,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  Settings2,
  Package,
} from 'lucide-react';
import { Product, ProductVariant } from '../../../types';
import { useStore } from '../../../context/StoreContext';
import { useAlert } from '../../../context/AlertContext';
import {
  generateCode128Svg,
  generateUniqueRetailBarcode,
  LABEL_TEMPLATES,
  LabelSheetTemplate,
} from '../../../lib/barcodeGenerator';

interface BarcodeItem {
  id: string; // product-id or product-id__variant-id
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  brand: string;
  price: number;
  stockCount: number;
  barcode: string;
  image?: string;
  quantityToPrint: number;
  selected: boolean;
}

interface BarcodeLabelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProductId?: string; // If opened for a specific product
}

export const BarcodeLabelsModal: React.FC<BarcodeLabelsModalProps> = ({
  isOpen,
  onClose,
  initialProductId,
}) => {
  const { products, updateProduct, storeSettings } = useStore();
  const { showAlert } = useAlert();

  // Active view tab: 'select' (choose items & counts) or 'preview' (sheet layout)
  const [activeTab, setActiveTab] = useState<'select' | 'preview'>('select');

  // Selected template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('a4-24');
  const template = useMemo<LabelSheetTemplate>(() => {
    return LABEL_TEMPLATES.find(t => t.id === selectedTemplateId) || LABEL_TEMPLATES[1];
  }, [selectedTemplateId]);

  // Label display options
  const [showStoreName, setShowStoreName] = useState(true);
  const [showProductName, setShowProductName] = useState(true);
  const [showVariantName, setShowVariantName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showBarcodeText, setShowBarcodeText] = useState(true);
  const [showCutBorders, setShowCutBorders] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<'all' | 'beauty' | 'groceries'>('all');
  const [filterBarcodeStatus, setFilterBarcodeStatus] = useState<'all' | 'missing' | 'has_barcode'>('all');

  // Items list
  const [items, setItems] = useState<BarcodeItem[]>([]);
  const [isGeneratingBarcodes, setIsGeneratingBarcodes] = useState(false);

  // Initialize items from products and variants
  useEffect(() => {
    if (!isOpen) return;

    const list: BarcodeItem[] = [];

    (products || []).forEach(product => {
      if (product.variants && product.variants.length > 0) {
        // Add each variant as an individual barcode item
        product.variants.forEach(variant => {
          const isInitial = initialProductId ? product.id === initialProductId : true;
          list.push({
            id: `${product.id}__${variant.id}`,
            productId: product.id,
            variantId: variant.id,
            productName: product.name,
            variantName: variant.name,
            brand: product.brand,
            price: Number(variant.price || product.price || 0),
            stockCount: Number(variant.stockCount || 0),
            barcode: variant.barcode?.trim() || '',
            image: variant.image || product.image,
            quantityToPrint: isInitial ? Math.max(1, Math.min(Number(variant.stockCount || 1), 10)) : 1,
            selected: isInitial,
          });
        });
      } else {
        // Single product item
        const isInitial = initialProductId ? product.id === initialProductId : true;
        list.push({
          id: product.id,
          productId: product.id,
          productName: product.name,
          brand: product.brand,
          price: Number(product.price || 0),
          stockCount: Number(product.stockCount || 0),
          barcode: product.barcode?.trim() || '',
          image: product.image,
          quantityToPrint: isInitial ? Math.max(1, Math.min(Number(product.stockCount || 1), 10)) : 1,
          selected: isInitial,
        });
      }
    });

    setItems(list);
    if (initialProductId) {
      setActiveTab('select');
    }
  }, [isOpen, products, initialProductId]);

  // Filtered items in selection table
  const filteredItems = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return items.filter(item => {
      // Search
      const matchSearch =
        !q ||
        item.productName.toLowerCase().includes(q) ||
        (item.variantName || '').toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.barcode.toLowerCase().includes(q);

      if (!matchSearch) return false;

      // Barcode status
      if (filterBarcodeStatus === 'missing' && item.barcode) return false;
      if (filterBarcodeStatus === 'has_barcode' && !item.barcode) return false;

      return true;
    });
  }, [items, searchTerm, filterBarcodeStatus]);

  // Selected items & total labels to print
  const selectedItems = useMemo(() => items.filter(i => i.selected), [items]);
  const totalLabelsCount = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + Math.max(1, item.quantityToPrint), 0);
  }, [selectedItems]);

  const missingBarcodeCount = useMemo(() => {
    return selectedItems.filter(i => !i.barcode.trim()).length;
  }, [selectedItems]);

  // Selection toggles
  const handleToggleSelectAll = (select: boolean) => {
    setItems(prev =>
      prev.map(item => {
        const isShown = filteredItems.some(f => f.id === item.id);
        return isShown ? { ...item, selected: select } : item;
      })
    );
  };

  const handleToggleItem = (id: string) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const next = Math.max(1, Math.min(999, item.quantityToPrint + delta));
        return { ...item, quantityToPrint: next, selected: true };
      })
    );
  };

  const handleSetExactQuantity = (id: string, qty: number) => {
    const valid = Math.max(1, Math.min(999, isNaN(qty) ? 1 : qty));
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, quantityToPrint: valid, selected: true } : item))
    );
  };

  const handleUpdateBarcodeText = (id: string, newBarcode: string) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, barcode: newBarcode.trim() } : item))
    );
  };

  // Preset batch quantity buttons
  const handleApplyPresetQuantity = (mode: 'one' | 'stock' | 'five') => {
    setItems(prev =>
      prev.map(item => {
        if (!item.selected) return item;
        let qty = 1;
        if (mode === 'stock') qty = Math.max(1, Math.min(100, item.stockCount || 1));
        if (mode === 'five') qty = 5;
        return { ...item, quantityToPrint: qty };
      })
    );
    showAlert(`Applied quantity preset to ${selectedItems.length} items.`, 'success');
  };

  // Auto-generate missing barcodes and save to store database
  const handleAutoGenerateMissing = async () => {
    const missing = selectedItems.filter(i => !i.barcode.trim());
    if (missing.length === 0) {
      showAlert('All selected items already have barcodes!', 'success');
      return;
    }

    setIsGeneratingBarcodes(true);
    try {
      // Gather all existing barcodes to guarantee uniqueness
      const existingBarcodes = new Set<string>();
      products.forEach(p => {
        if (p.barcode) existingBarcodes.add(p.barcode.trim());
        (p.variants || []).forEach(v => {
          if (v.barcode) existingBarcodes.add(v.barcode.trim());
        });
      });

      // Generate a map of item ID -> new unique barcode
      const newBarcodesMap = new Map<string, string>();
      missing.forEach(item => {
        const uniqueCode = generateUniqueRetailBarcode(existingBarcodes);
        existingBarcodes.add(uniqueCode);
        newBarcodesMap.set(item.id, uniqueCode);
      });

      // Update local state immediately
      setItems(prev =>
        prev.map(item => {
          if (newBarcodesMap.has(item.id)) {
            return { ...item, barcode: newBarcodesMap.get(item.id)! };
          }
          return item;
        })
      );

      // Group updates by product to save to database
      const productsToUpdate = new Set<string>(missing.map(m => m.productId));
      let savedCount = 0;

      for (const prodId of productsToUpdate) {
        const originalProduct = products.find(p => p.id === prodId);
        if (!originalProduct) continue;

        let modified = false;
        let nextBarcode = originalProduct.barcode;
        let nextVariants = originalProduct.variants ? [...originalProduct.variants] : undefined;

        // Check if root product needed barcode
        if (newBarcodesMap.has(prodId)) {
          nextBarcode = newBarcodesMap.get(prodId);
          modified = true;
        }

        // Check if any variant of this product needed barcode
        if (nextVariants && nextVariants.length > 0) {
          nextVariants = nextVariants.map(v => {
            const variantKey = `${prodId}__${v.id}`;
            if (newBarcodesMap.has(variantKey)) {
              modified = true;
              return { ...v, barcode: newBarcodesMap.get(variantKey) };
            }
            return v;
          });
        }

        if (modified) {
          await updateProduct(prodId, {
            barcode: nextBarcode,
            ...(nextVariants ? { variants: nextVariants } : {}),
          });
          savedCount++;
        }
      }

      showAlert(
        `Generated and saved ${missing.length} unique barcode${missing.length === 1 ? '' : 's'} across ${savedCount} product${savedCount === 1 ? '' : 's'}!`,
        'success'
      );
    } catch (err: any) {
      showAlert(err?.message || 'Failed to save generated barcodes to database.', 'error');
    } finally {
      setIsGeneratingBarcodes(false);
    }
  };

  // Flattened array of individual sticker labels to print
  const flatLabels = useMemo(() => {
    const list: BarcodeItem[] = [];
    selectedItems.forEach(item => {
      const count = Math.max(1, item.quantityToPrint);
      for (let i = 0; i < count; i++) {
        list.push(item);
      }
    });
    return list;
  }, [selectedItems]);

  // Print execution
  const handlePrint = () => {
    if (flatLabels.length === 0) {
      showAlert('Please select at least one product label to print.', 'error');
      return;
    }
    if (missingBarcodeCount > 0) {
      if (
        !window.confirm(
          `${missingBarcodeCount} selected item(s) do not have a barcode number yet. Do you want to print anyway?`
        )
      ) {
        return;
      }
    }
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto font-sans animate-in fade-in duration-150">
      {/* Print Root: Hidden on screen, visible during window.print() */}
      <div id="barcode-print-root" className="hidden print:block print:w-full print:m-0 print:p-0">
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * { visibility: hidden !important; }
              #barcode-print-root, #barcode-print-root * { visibility: visible !important; }
              #barcode-print-root {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
              }
              @page {
                margin: ${template.category === 'thermal' ? '1mm' : '8mm'};
                size: ${template.category === 'thermal' ? `${template.labelWidthMm}mm ${template.labelHeightMm}mm` : 'A4 portrait'};
              }
              .barcode-label-item {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }
            }
          `
        }} />

        <div
          className="print:grid print:gap-1 print:p-2"
          style={{
            gridTemplateColumns: `repeat(${template.columns}, minmax(0, 1fr))`,
            rowGap: `${template.gapYmm || 1}mm`,
            columnGap: `${template.gapXmm || 1.5}mm`,
          }}
        >
          {flatLabels.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="barcode-label-item border border-black/80 rounded-md p-1.5 flex flex-col justify-between text-black bg-white"
              style={{
                width: `${template.labelWidthMm}mm`,
                height: `${template.labelHeightMm}mm`,
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              {/* Header: Store Name & Price */}
              <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-wider leading-none mb-0.5">
                {showStoreName && (
                  <span className="truncate max-w-[65%]">
                    {storeSettings.storeName || 'CR COSMETICS'}
                  </span>
                )}
                {showPrice && (
                  <span className="ml-auto font-black text-[9px]">
                    GH₵ {Number(item.price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Product & Variant Name */}
              {showProductName && (
                <div className="text-[8.5px] font-bold leading-tight line-clamp-1 text-black">
                  {item.productName}
                  {showVariantName && item.variantName && (
                    <span className="font-normal opacity-85 ml-1">· {item.variantName}</span>
                  )}
                </div>
              )}

              {/* SVG Barcode Graphic */}
              <div className="my-auto flex flex-col items-center justify-center min-h-0 w-full overflow-hidden">
                {item.barcode ? (
                  <div
                    className="w-full max-h-8 flex items-center justify-center overflow-hidden"
                    dangerouslySetInnerHTML={{
                      __html: generateCode128Svg(item.barcode, {
                        height: 28,
                        showText: showBarcodeText,
                        fontSize: 8,
                        quietZone: 6,
                      }),
                    }}
                  />
                ) : (
                  <div className="text-[8px] italic text-stone-500 py-1">
                    [No Barcode Assigned]
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Modal (Screen Only) */}
      <div className="print:hidden w-full max-w-5xl bg-white dark:bg-[#181314] rounded-2xl shadow-2xl border border-stone-200 dark:border-[#2e2326] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-[#2e2326] flex items-center justify-between bg-stone-50/80 dark:bg-[#1f1719]/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Barcode className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                Barcode Labels & Product Stickers
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Generate and print scannable Code 128 sticker labels for inventory & POS scanning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              disabled={flatLabels.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white text-xs font-bold shadow-sm transition disabled:opacity-40"
            >
              <Printer className="h-4 w-4" />
              Print {flatLabels.length} {flatLabels.length === 1 ? 'Label' : 'Labels'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-[#2b2023] transition"
              aria-label="Close barcode modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="px-6 border-b border-stone-200 dark:border-[#2e2326] flex items-center justify-between bg-white dark:bg-[#181314] shrink-0">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('select')}
              className={`py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
                activeTab === 'select'
                  ? 'border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              1. Select Products ({selectedItems.length} selected · {totalLabelsCount} labels)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
                activeTab === 'preview'
                  ? 'border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              2. Print Sheet Preview & Layout ({template.name})
            </button>
          </div>

          {/* Quick Missing Barcodes Alert */}
          {missingBarcodeCount > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-full border border-amber-200/60 dark:border-amber-900/40">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{missingBarcodeCount} missing barcode</span>
              <button
                type="button"
                onClick={handleAutoGenerateMissing}
                disabled={isGeneratingBarcodes}
                className="underline hover:text-amber-800 font-bold ml-1 flex items-center gap-1"
              >
                {isGeneratingBarcodes ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                Auto-generate
              </button>
            </div>
          )}
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'select' ? (
            /* TAB 1: PRODUCT SELECTION & QUANTITIES */
            <div className="space-y-4">
              {/* Batch Actions Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50 dark:bg-[#1f1719] p-3.5 rounded-xl border border-stone-200 dark:border-[#2e2326]">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleToggleSelectAll(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-[#382b2e] bg-white dark:bg-[#251d20] text-xs font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-50"
                  >
                    <CheckSquare className="h-3.5 w-3.5 text-amber-600" /> Select All ({filteredItems.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleSelectAll(false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-[#382b2e] bg-white dark:bg-[#251d20] text-xs font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-50"
                  >
                    <Square className="h-3.5 w-3.5 text-stone-400" /> Deselect All
                  </button>
                  <div className="h-4 w-px bg-stone-200 dark:bg-stone-700 mx-1 hidden sm:block" />
                  <span className="text-xs text-stone-500 font-semibold hidden md:inline">
                    Copies:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetQuantity('one')}
                    className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-[#382b2e] bg-white dark:bg-[#251d20] text-[11px] font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-50"
                  >
                    1 each
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetQuantity('stock')}
                    className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-[#382b2e] bg-white dark:bg-[#251d20] text-[11px] font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-50"
                    title="Print as many stickers as items in stock"
                  >
                    Match Stock Count
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetQuantity('five')}
                    className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-[#382b2e] bg-white dark:bg-[#251d20] text-[11px] font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-50"
                  >
                    5 each
                  </button>
                </div>

                {missingBarcodeCount > 0 && (
                  <button
                    type="button"
                    onClick={handleAutoGenerateMissing}
                    disabled={isGeneratingBarcodes}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
                  >
                    {isGeneratingBarcodes ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    Generate {missingBarcodeCount} Missing Barcodes
                  </button>
                )}
              </div>

              {/* Search & Filter Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative sm:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search by product name, brand, variation, or barcode..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-[#382b2e] bg-white dark:bg-[#1e1719] text-xs font-medium text-stone-900 dark:text-stone-100 outline-none focus:border-amber-500 transition"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div>
                  <select
                    value={filterBarcodeStatus}
                    onChange={e => setFilterBarcodeStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-[#382b2e] bg-white dark:bg-[#1e1719] text-xs font-bold text-stone-700 dark:text-stone-200 outline-none"
                  >
                    <option value="all">All Barcode Statuses</option>
                    <option value="missing">Only Missing Barcode</option>
                    <option value="has_barcode">Only With Barcode</option>
                  </select>
                </div>
              </div>

              {/* Items List Table */}
              <div className="rounded-xl border border-stone-200 dark:border-[#2e2326] overflow-hidden">
                <div className="overflow-x-auto max-h-[50vh]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-stone-50 dark:bg-[#1f1719] text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 border-b border-stone-200 dark:border-[#2e2326] sticky top-0 z-10">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">Print</th>
                        <th className="py-2.5 px-3">Product Item</th>
                        <th className="py-2.5 px-3">Barcode (Scan / Type)</th>
                        <th className="py-2.5 px-3 text-right">Price</th>
                        <th className="py-2.5 px-3 text-center">Stock</th>
                        <th className="py-2.5 px-3 text-center w-28">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-[#251d20]">
                      {filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-stone-400">
                            No products match your search or filter.
                          </td>
                        </tr>
                      ) : (
                        filteredItems.map(item => (
                          <tr
                            key={item.id}
                            className={`hover:bg-amber-50/40 dark:hover:bg-[#251d20]/50 transition ${
                              item.selected ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                            }`}
                          >
                            {/* Checkbox */}
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={() => handleToggleItem(item.id)}
                                className="h-4 w-4 rounded text-amber-600 border-stone-300 focus:ring-amber-500 cursor-pointer"
                              />
                            </td>

                            {/* Product Info */}
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2.5">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt=""
                                    className="h-8 w-8 rounded-lg object-cover bg-stone-100 dark:bg-stone-800 shrink-0 border border-stone-200 dark:border-stone-700"
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center font-bold text-xs shrink-0">
                                    {(item.productName || 'P').charAt(0)}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-bold text-stone-900 dark:text-stone-100 truncate max-w-[240px]">
                                    {item.productName}
                                  </p>
                                  <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                                    {item.brand} {item.variantName ? `· ${item.variantName}` : ''}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Barcode input */}
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1.5 max-w-[200px]">
                                <input
                                  type="text"
                                  value={item.barcode}
                                  onChange={e => handleUpdateBarcodeText(item.id, e.target.value)}
                                  placeholder="Type or scan code..."
                                  className={`w-full px-2.5 py-1 rounded-lg border font-mono text-[11px] outline-none transition ${
                                    item.barcode
                                      ? 'border-stone-200 dark:border-[#382b2e] bg-stone-50/50 dark:bg-[#1a1415] text-stone-900 dark:text-stone-100'
                                      : 'border-amber-300 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 placeholder-amber-400'
                                  }`}
                                />
                              </div>
                            </td>

                            {/* Price */}
                            <td className="py-2.5 px-3 text-right font-bold text-stone-800 dark:text-stone-200">
                              GH₵ {Number(item.price).toFixed(2)}
                            </td>

                            {/* Stock */}
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.stockCount <= 0
                                    ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                                    : item.stockCount <= 5
                                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                    : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                                }`}
                              >
                                {item.stockCount}
                              </span>
                            </td>

                            {/* Quantity Stepper */}
                            <td className="py-2.5 px-3 text-center">
                              <div className="inline-flex items-center border border-stone-200 dark:border-[#382b2e] rounded-lg overflow-hidden bg-white dark:bg-[#201b1a]">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuantity(item.id, -1)}
                                  className="px-2 py-1 text-stone-500 hover:bg-stone-100 dark:hover:bg-[#2a2024] font-bold"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min={1}
                                  max={999}
                                  value={item.quantityToPrint}
                                  onChange={e =>
                                    handleSetExactQuantity(item.id, parseInt(e.target.value, 10))
                                  }
                                  className="w-10 text-center text-xs font-bold bg-transparent outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuantity(item.id, 1)}
                                  className="px-2 py-1 text-stone-500 hover:bg-stone-100 dark:hover:bg-[#2a2024] font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Next Step Bar */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Ready to print <b>{totalLabelsCount} labels</b> across{' '}
                  <b>{selectedItems.length} products</b>.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition"
                >
                  Configure Layout & Preview <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            /* TAB 2: SHEET PREVIEW & TEMPLATE CONFIGURATION */
            <div className="space-y-6">
              {/* Template & Options Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-stone-50 dark:bg-[#1f1719] p-4 rounded-2xl border border-stone-200 dark:border-[#2e2326]">
                {/* 1. Template picker */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Label Sheet Format / Paper Size:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {LABEL_TEMPLATES.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTemplateId(t.id)}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          selectedTemplateId === t.id
                            ? 'border-amber-600 bg-amber-500/10 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500'
                            : 'border-stone-200 dark:border-[#382b2e] bg-white dark:bg-[#251d20] text-stone-700 dark:text-stone-300 hover:border-stone-300'
                        }`}
                      >
                        <p className="font-bold text-xs leading-snug">{t.name}</p>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
                          {t.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Content Toggles */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Label Elements to Print:
                  </label>
                  <div className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showStoreName}
                        onChange={e => setShowStoreName(e.target.checked)}
                        className="rounded text-amber-600 cursor-pointer"
                      />
                      <span>Store Name Header</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showProductName}
                        onChange={e => setShowProductName(e.target.checked)}
                        className="rounded text-amber-600 cursor-pointer"
                      />
                      <span>Product & Variant Name</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showPrice}
                        onChange={e => setShowPrice(e.target.checked)}
                        className="rounded text-amber-600 cursor-pointer"
                      />
                      <span>Price (GH₵)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showBarcodeText}
                        onChange={e => setShowBarcodeText(e.target.checked)}
                        className="rounded text-amber-600 cursor-pointer"
                      />
                      <span>Human-Readable Code Digits</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showCutBorders}
                        onChange={e => setShowCutBorders(e.target.checked)}
                        className="rounded text-amber-600 cursor-pointer"
                      />
                      <span>Cut Lines / Border Boxes</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Sheet Preview Container */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Print Sheet Simulation ({flatLabels.length} total stickers ·{' '}
                    {Math.ceil(flatLabels.length / template.labelsPerPage)} sheet(s))
                  </h3>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    <Printer className="h-3.5 w-3.5" /> Print Now
                  </button>
                </div>

                <div className="bg-stone-200 dark:bg-[#120d0f] p-4 sm:p-6 rounded-2xl overflow-x-auto max-h-[55vh] flex justify-center">
                  <div
                    className="bg-white text-black shadow-xl p-4 sm:p-6 transition-all"
                    style={{
                      width: template.category === 'thermal' ? '340px' : '720px',
                      minHeight: '400px',
                    }}
                  >
                    <div
                      className="grid gap-2"
                      style={{
                        gridTemplateColumns: `repeat(${template.columns}, minmax(0, 1fr))`,
                      }}
                    >
                      {flatLabels.slice(0, 36).map((item, index) => (
                        <div
                          key={`preview-${item.id}-${index}`}
                          className={`p-2 rounded flex flex-col justify-between bg-white text-black ${
                            showCutBorders ? 'border border-dashed border-stone-300' : ''
                          }`}
                          style={{
                            height: template.category === 'thermal' ? '120px' : '100px',
                          }}
                        >
                          {/* Store Name & Price */}
                          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider leading-none">
                            {showStoreName && (
                              <span className="truncate max-w-[65%] text-stone-700">
                                {storeSettings.storeName || 'CR COSMETICS'}
                              </span>
                            )}
                            {showPrice && (
                              <span className="ml-auto font-black text-[10px] text-stone-900">
                                GH₵ {Number(item.price).toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Product Name */}
                          {showProductName && (
                            <p className="text-[10px] font-bold leading-tight line-clamp-1 text-black mt-1">
                              {item.productName}
                              {showVariantName && item.variantName && (
                                <span className="font-normal opacity-85 ml-1">· {item.variantName}</span>
                              )}
                            </p>
                          )}

                          {/* Barcode SVG */}
                          <div className="my-auto flex flex-col items-center justify-center min-h-0 w-full overflow-hidden">
                            {item.barcode ? (
                              <div
                                className="w-full max-h-10 flex items-center justify-center overflow-hidden"
                                dangerouslySetInnerHTML={{
                                  __html: generateCode128Svg(item.barcode, {
                                    height: 32,
                                    showText: showBarcodeText,
                                    fontSize: 9,
                                    quietZone: 6,
                                  }),
                                }}
                              />
                            ) : (
                              <div className="text-[9px] italic text-amber-700 bg-amber-50 px-2 py-1 rounded w-full text-center">
                                Missing Barcode
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {flatLabels.length > 36 && (
                      <p className="text-center text-xs text-stone-400 mt-6 pt-4 border-t border-stone-100">
                        + {flatLabels.length - 36} more labels will be included when printing.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-[#2e2326] flex items-center justify-between bg-stone-50/80 dark:bg-[#1f1719]/80 shrink-0">
          <div className="text-xs text-stone-500 dark:text-stone-400">
            <span>
              <b>{flatLabels.length}</b> total sticker{flatLabels.length === 1 ? '' : 's'} to print
            </span>
            <span className="mx-2">·</span>
            <span>Paper: {template.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 dark:border-[#382b2e] text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#251d20] transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={flatLabels.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              <Printer className="h-4 w-4" />
              Print Labels Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
