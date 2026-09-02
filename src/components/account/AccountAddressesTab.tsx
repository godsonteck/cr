import React, { useState } from 'react';
import { MapPin, Plus, Edit3, Trash2 } from 'lucide-react';
import { ShippingAddress } from '../../types';
import { useAlert } from '../../context/AlertContext';

interface AccountAddressesTabProps {
  addresses: ShippingAddress[];
  onAddAddress: (address: ShippingAddress) => Promise<void>;
  onRemoveAddress: (index: number) => Promise<void>;
  onUpdateAddress: (index: number, address: ShippingAddress) => Promise<void>;
}

const emptyAddress: ShippingAddress = {
  fullName: '',
  phone: '',
  email: '',
  city: '',
  area: '',
  landmarkOrGps: '',
  deliveryNotes: '',
};

export const AccountAddressesTab: React.FC<AccountAddressesTabProps> = ({
  addresses,
  onAddAddress,
  onRemoveAddress,
  onUpdateAddress,
}) => {
  const { showAlert } = useAlert();
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ShippingAddress>(emptyAddress);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingIndex !== null) {
        await onUpdateAddress(editingIndex, form);
        showAlert('Address updated successfully', 'success');
      } else {
        await onAddAddress(form);
        showAlert('Address added successfully', 'success');
      }
      resetForm();
    } catch (error: any) {
      showAlert(error.message || 'Failed to save address', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyAddress);
    setIsAdding(false);
    setEditingIndex(null);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setForm(addresses[index]);
  };

  const handleDelete = async (index: number) => {
    if (window.confirm('Remove this address?')) {
      setLoading(true);
      try {
        await onRemoveAddress(index);
        showAlert('Address removed successfully', 'success');
      } catch (error: any) {
        showAlert(error.message || 'Failed to remove address', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="bg-white dark:bg-[#1C1917] p-6 rounded-2xl border border-[#E6DFD7] dark:border-[#36322E]">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#E6DFD7]">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-[#C86D51]" />
            <h3 className="text-base font-extrabold uppercase">Saved Addresses</h3>
          </div>
          {!isAdding && editingIndex === null && (
            <button
              onClick={() => setIsAdding(true)}
              className="text-xs font-bold bg-[#C86D51] hover:bg-[#8A3D52] text-white px-4 py-2 rounded-xl transition flex items-center gap-2"
            >
              <Plus className="w-3 h-3" />
              Add New Address
            </button>
          )}
        </div>

        {isAdding || editingIndex !== null ? (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full bg-[#F5F0EB] dark:bg-[#2B2620] text-xs p-3 rounded-xl border border-[#E6DFD7] dark:border-[#36322E]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-2">Phone</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-[#F5F0EB] dark:bg-[#2B2620] text-xs p-3 rounded-xl border border-[#E6DFD7] dark:border-[#36322E]"
                />
              </div>
            </div>

              <div>
                <label className="text-xs font-bold text-stone-600 block mb-2">Area/District</label>
                <input
                  type="text"
                  required
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  className="w-full bg-[#F5F0EB] dark:bg-[#2B2620] text-xs p-3 rounded-xl border border-[#E6DFD7] dark:border-[#36322E]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-2">Landmark or GPS</label>
                <input
                  type="text"
                  value={form.landmarkOrGps}
                  onChange={(e) => setForm({ ...form, landmarkOrGps: e.target.value })}
                  placeholder="e.g., Next to ABC Market"
                  className="w-full bg-[#F5F0EB] dark:bg-[#2B2620] text-xs p-3 rounded-xl border border-[#E6DFD7] dark:border-[#36322E]"
                />
              </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#C86D51] hover:bg-[#8A3D52] disabled:bg-stone-300 text-white text-xs font-bold py-2.5 rounded-xl transition"
              >
                {loading ? 'Saving...' : editingIndex !== null ? 'Update Address' : 'Add Address'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-stone-100 dark:bg-[#2B2620] hover:bg-stone-200 dark:hover:bg-[#36322E] text-stone-700 dark:text-stone-300 text-xs font-bold py-2.5 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4">
            {addresses && addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr, idx) => (
                  <div key={idx} className="p-4 border border-[#E6DFD7] rounded-xl text-xs space-y-2 hover:border-[#C86D51] transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold text-stone-900 dark:text-stone-100">{addr.fullName}</p>
                        <p className="text-stone-500 text-[10px]">{addr.city}</p>
                        <p className="text-stone-500 text-[10px]">{addr.area}</p>
                        <p className="text-stone-500 text-[10px]">{addr.phone}</p>
                        {addr.landmarkOrGps && <p className="text-stone-500 text-[10px]">{addr.landmarkOrGps}</p>}
                      </div>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => startEdit(idx)}
                          className="text-[#C86D51] hover:text-[#8A3D52] font-bold transition"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(idx)}
                          className="text-red-500 hover:text-red-700 font-bold transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <MapPin className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="text-xs text-stone-500 font-semibold">No saved addresses yet.</p>
                <p className="text-xs text-stone-400 mt-1">Add your first address to speed up checkout.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
