import React, { useState } from 'react';
import { X, Package, ArrowUpRight, ArrowDownRight, Check, Sparkles } from 'lucide-react';
import { Product, InventoryMovement } from '../../../types';

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSaveAdjustment: (movement: Omit<InventoryMovement, 'id' | 'timestamp'>) => void;
}

export const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
  isOpen,
  onClose,
  product,
  onSaveAdjustment,
}) => {
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract' | 'set'>('add');
  const [quantityInput, setQuantityInput] = useState<number>(10);
  const [reason, setReason] = useState<InventoryMovement['reason']>('Stock received');
  const [notes, setNotes] = useState('');

  if (!isOpen || !product) return null;

  const currentStock = product.stockCount || 0;

  const calculateNewStock = () => {
    if (adjustmentType === 'add') return currentStock + quantityInput;
    if (adjustmentType === 'subtract') return Math.max(0, currentStock - quantityInput);
    return Math.max(0, quantityInput);
  };

  const calculatedNew = calculateNewStock();
  const netDelta = calculatedNew - currentStock;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAdjustment({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      previousQuantity: currentStock,
      adjustment: netDelta,
      newQuantity: calculatedNew,
      reason,
      actor: 'Shop Manager',
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fadeIn">
      <div 
        className="w-full max-w-md clay-modal p-6 sm:p-7 space-y-6 text-stone-900 dark:text-stone-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-200/60 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="clay-icon-pod h-10 w-10 text-[#B27A52]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-stone-900 dark:text-stone-100 text-base">Update stock</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">Record when you receive new items or count the shop</p>
            </div>
          </div>
          <button onClick={onClose} className="clay-card-sm p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Preview */}
        <div className="flex items-center gap-3 p-3 neu-sunken-sm">
          <img src={product.image} alt="" className="w-12 h-12 rounded-xl object-cover bg-white shrink-0 shadow-sm" />
          <div className="min-w-0 flex-1 text-xs">
            <p className="font-bold text-stone-900 dark:text-stone-100 truncate">{product.name}</p>
            <p className="text-stone-500 dark:text-stone-400">{product.brand} • Currently in shop: <strong>{currentStock} units</strong></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Action type */}
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5">What are you doing?</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'add', label: '+ Add Stock', icon: ArrowUpRight },
                { id: 'subtract', label: '- Remove Stock', icon: ArrowDownRight },
                { id: 'set', label: '= Set Exact Total', icon: Sparkles },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAdjustmentType(opt.id as any)}
                  className={`p-2.5 rounded-2xl text-[11px] font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    adjustmentType === opt.id 
                      ? 'clay-btn-primary py-2 text-white' 
                      : 'clay-btn-secondary py-2 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <opt.icon className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              {adjustmentType === 'set' ? 'New Total Number of Items' : 'Number of Items to Add/Remove'}
            </label>
            <input
              type="number"
              min="0"
              required
              value={quantityInput}
              onChange={e => setQuantityInput(Math.max(0, parseInt(e.target.value) || 0))}
              className="neu-input font-bold"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5">Why are you changing this?</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value as any)}
              className="neu-input cursor-pointer font-semibold"
            >
              <option value="Stock received">Received new stock from supplier / wholesaler</option>
              <option value="Sale">Sold items manually in shop</option>
              <option value="Damaged">Item got broken or damaged</option>
              <option value="Expired">Item expired / removed from shelf</option>
              <option value="Manual adjustment">Counted shop stock and corrected number</option>
              <option value="Returned">Customer returned item back to shop</option>
              <option value="Correction">Fixed a mistake in the count</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5">Extra Note (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optional note about this stock change"
              className="neu-input"
            />
          </div>

          {/* Summary Box */}
          <div className="p-3 neu-sunken-sm flex items-center justify-between font-mono text-xs">
            <span className="text-stone-500 dark:text-stone-400 font-semibold">New Shop Total:</span>
            <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
              {currentStock} ➔ <span className="text-emerald-600 dark:text-emerald-400">{calculatedNew} items left</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="clay-btn-secondary py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="clay-btn-primary py-2 px-4"
            >
              <Check className="w-4 h-4" />
              <span>Save New Stock Count</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
