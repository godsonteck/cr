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
  if (!isOpen || !product) return null;

  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract' | 'set'>('add');
  const [quantityInput, setQuantityInput] = useState<number>(10);
  const [reason, setReason] = useState<InventoryMovement['reason']>('Stock received');
  const [notes, setNotes] = useState('');

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
        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-stone-100 text-stone-800">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Change Stock Quantity</h3>
              <p className="text-xs text-stone-500">Record when you receive new items or count the shop</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Preview */}
        <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-100">
          <img src={product.image} alt="" className="w-12 h-12 rounded-xl object-cover bg-white shrink-0 border border-stone-200" />
          <div className="min-w-0 flex-1 text-xs">
            <p className="font-bold text-stone-900 truncate">{product.name}</p>
            <p className="text-stone-500">{product.brand} • Currently in shop: <strong>{currentStock} units</strong></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Action type */}
          <div>
            <label className="block font-bold text-stone-700 mb-1.5">What are you doing?</label>
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
                  className={`p-2 rounded-xl border text-[11px] font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    adjustmentType === opt.id 
                      ? 'border-stone-900 bg-stone-100 text-stone-900' 
                      : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
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
            <label className="block font-bold text-stone-700 mb-1.5">
              {adjustmentType === 'set' ? 'New Total Number of Items' : 'Number of Items to Add/Remove'}
            </label>
            <input
              type="number"
              min="0"
              required
              value={quantityInput}
              onChange={e => setQuantityInput(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:border-stone-900 outline-none"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block font-bold text-stone-700 mb-1.5">Why are you changing this?</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:border-stone-900 outline-none"
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
            <label className="block font-bold text-stone-700 mb-1.5">Extra Note (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Received new shipment at Accra warehouse"
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-stone-900 outline-none"
            />
          </div>

          {/* Summary Box */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between font-mono text-xs">
            <span className="text-stone-500">New Shop Total:</span>
            <span className="font-bold text-sm text-stone-900">
              {currentStock} ➔ <span className="text-emerald-700">{calculatedNew} items left</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-200 rounded-xl font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1E1719] hover:bg-[#33282C] text-[#FAF6F0] rounded-xl font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
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
