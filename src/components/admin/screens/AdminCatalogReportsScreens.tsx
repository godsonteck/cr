import React, { useMemo, useState } from 'react';
import { BarChart3, Check, EyeOff, Layers, Save, Trash2, TrendingUp, Plus } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useAlert } from '../../../context/AlertContext';
import { CategoryConfig, CategoryType, DepartmentType } from '../../../types';

const inputClass = 'w-full rounded-xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#2a2024] px-3 py-2.5 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-[#1E1719]';

const defaultCreateForm = {
  id: '',
  slug: '',
  name: '',
  description: '',
  department: 'beauty' as DepartmentType,
  image: '',
  isActive: true,
};

const readImageFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });

export const AdminCategoriesScreen: React.FC = () => {
  const store = useStore();
  const { showAlert } = useAlert();
  const [editing, setEditing] = useState<CategoryConfig | null>(null);
  const [form, setForm] = useState({ name: '', description: '', department: 'beauty' as DepartmentType, image: '' });
  const [createForm, setCreateForm] = useState(defaultCreateForm);

  const beginEdit = (category: CategoryConfig) => {
    setEditing(category);
    setForm({ name: category.name, description: category.description, department: category.department, image: category.image });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing || !form.name.trim()) return;
    await store.updateCategory(editing.id, {
      name: form.name.trim(),
      description: form.description.trim(),
      department: form.department,
      image: form.image || editing.image,
    });
    showAlert('Category updated', 'success');
    setEditing(null);
  };

  const createCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    const id = createForm.id.trim();
    const name = createForm.name.trim();
    const slug = createForm.slug.trim();
    const description = createForm.description.trim();

    if (!id || !name || !slug || !description || !createForm.image) {
      showAlert('Category ID, name, slug, description, and image upload are required.', 'error');
      return;
    }

    const normalizedCategory: CategoryConfig = {
      id: id as CategoryType,
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      name,
      description,
      department: createForm.department,
      image: createForm.image,
      isActive: createForm.isActive,
    };

    await store.addCategory(normalizedCategory);
    showAlert(`Category “${name}” added successfully.`, 'success');
    setCreateForm(defaultCreateForm);
  };

  const removeCategory = async (category: CategoryConfig) => {
    if (!window.confirm(`Remove the “${category.name}” category? This can affect storefront links.`)) return;
    await store.deleteCategory(category.id);
    showAlert(`Category “${category.name}” removed.`, 'success');
    if (editing?.id === category.id) setEditing(null);
  };

  const toggle = async (category: CategoryConfig) => {
    await store.toggleCategory(category.id);
    showAlert(`${category.name} ${category.isActive ? 'hidden from' : 'shown on'} the storefront`, 'success');
  };

  const handleImageUpload = async (file: File | null, target: 'create' | 'edit') => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      showAlert('Please upload a JPG, PNG, WEBP, or GIF image.', 'error');
      return;
    }

    try {
      const dataUrl = await readImageFile(file);
      if (target === 'create') {
        setCreateForm(prev => ({ ...prev, image: dataUrl }));
      } else {
        setForm(prev => ({ ...prev, image: dataUrl }));
      }
      showAlert('Image uploaded successfully.', 'success');
    } catch {
      showAlert('The image could not be processed. Please try another file.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 border-b border-stone-200 pb-6 dark:border-[#2e2428] sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B27A52]">Catalog</p><h1 className="mt-1 font-serif text-3xl font-bold text-[#1E1719] dark:text-stone-100">Categories</h1><p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Control the collections customers use to browse your catalog.</p></div>
        <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-600">{store.categories.filter(category => category.isActive).length} active</span>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-[#2e2428] dark:bg-[#201b1a]"><Layers className="h-5 w-5 text-[#B27A52]" /><p className="mt-3 text-2xl font-bold">{store.categories.length}</p><p className="text-xs text-stone-500">Total categories</p></div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-[#2e2428] dark:bg-[#201b1a]"><Check className="h-5 w-5 text-emerald-600" /><p className="mt-3 text-2xl font-bold">{store.categories.filter(category => category.isActive).length}</p><p className="text-xs text-stone-500">Visible to customers</p></div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-[#2e2428] dark:bg-[#201b1a]"><EyeOff className="h-5 w-5 text-amber-600" /><p className="mt-3 text-2xl font-bold">{store.categories.filter(category => !category.isActive).length}</p><p className="text-xs text-stone-500">Hidden categories</p></div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          {store.categories.map(category => (
            <div key={category.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-[#2e2428] dark:bg-[#201b1a]">
              <img src={category.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
              <div className="min-w-0 flex-1"><p className="font-bold text-stone-900 dark:text-stone-100">{category.name}</p><p className="text-xs text-stone-500">{category.department} · /{category.slug}</p></div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${category.isActive ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'}`}>{category.isActive ? 'Visible' : 'Hidden'}</span>
              <button className="rounded-xl border border-[var(--border-color)] px-3 py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-soft)]" onClick={() => beginEdit(category)}>Edit</button>
              <button className="rounded-xl border border-[var(--border-color)] px-3 py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-soft)]" onClick={() => void toggle(category)}>{category.isActive ? 'Hide' : 'Show'}</button>
              <button className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600" onClick={() => void removeCategory(category)} aria-label={`Delete ${category.name}`}><Trash2 className="mr-1 inline h-3.5 w-3.5" />Remove</button>
            </div>
          ))}
        </div>
        <div className="space-y-5">
          <form onSubmit={createCategory} className="h-fit space-y-4 rounded-2xl border border-stone-200 bg-white p-5 dark:border-[#2e2428] dark:bg-[#201b1a]">
            <div className="flex items-center justify-between gap-2"><h2 className="font-bold">Add category</h2><span className="inline-flex items-center gap-1 rounded-full bg-[#F3E5D8] px-2 py-1 text-[10px] font-bold text-[#6B3B2E]"><Plus className="h-3 w-3" />New</span></div>
            <label className="block text-xs font-bold text-stone-600">ID<input className={`${inputClass} mt-1`} placeholder="e.g. bath-body" value={createForm.id} onChange={event => setCreateForm({ ...createForm, id: event.target.value })} /></label>
            <label className="block text-xs font-bold text-stone-600">Name<input className={`${inputClass} mt-1`} placeholder="Category name" value={createForm.name} onChange={event => setCreateForm({ ...createForm, name: event.target.value })} /></label>
            <label className="block text-xs font-bold text-stone-600">Slug<input className={`${inputClass} mt-1`} placeholder="category-slug" value={createForm.slug} onChange={event => setCreateForm({ ...createForm, slug: event.target.value })} /></label>
            <label className="block text-xs font-bold text-stone-600">Department<select className={`${inputClass} mt-1`} value={createForm.department} onChange={event => setCreateForm({ ...createForm, department: event.target.value as DepartmentType })}><option value="beauty">Beauty</option><option value="groceries">Groceries</option></select></label>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-600">Category image</label>
              <input type="file" accept="image/*" onChange={(event) => void handleImageUpload(event.target.files?.[0] || null, 'create')} className="block w-full cursor-pointer text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#1E1719] file:px-3 file:py-2 file:text-sm file:font-bold file:text-white" />
              {createForm.image && <img src={createForm.image} alt="Category preview" className="mt-2 h-24 w-full rounded-xl object-cover" />}
            </div>
            <label className="block text-xs font-bold text-stone-600">Description<textarea className={`${inputClass} mt-1 min-h-24`} placeholder="Short customer-facing description" value={createForm.description} onChange={event => setCreateForm({ ...createForm, description: event.target.value })} /></label>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E1719] px-4 py-2.5 text-sm font-bold text-white"><Plus className="h-4 w-4" />Add category</button>
          </form>
          <form onSubmit={save} className="h-fit space-y-4 rounded-2xl border border-stone-200 bg-white p-5 dark:border-[#2e2428] dark:bg-[#201b1a]">
            <h2 className="font-bold">{editing ? `Edit ${editing.name}` : 'Select a category'}</h2>
            {editing ? <>
              <label className="block text-xs font-bold text-stone-600">Name<input className={`${inputClass} mt-1`} value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></label>
              <label className="block text-xs font-bold text-stone-600">Department<select className={`${inputClass} mt-1`} value={form.department} onChange={event => setForm({ ...form, department: event.target.value as DepartmentType })}><option value="beauty">Beauty</option><option value="groceries">Groceries</option></select></label>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-600">Update image</label>
                <input type="file" accept="image/*" onChange={(event) => void handleImageUpload(event.target.files?.[0] || null, 'edit')} className="block w-full cursor-pointer text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#1E1719] file:px-3 file:py-2 file:text-sm file:font-bold file:text-white" />
                {form.image && <img src={form.image} alt="Category preview" className="mt-2 h-24 w-full rounded-xl object-cover" />}
              </div>
              <label className="block text-xs font-bold text-stone-600">Description<textarea className={`${inputClass} mt-1 min-h-28`} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} /></label>
              <div className="flex gap-2"><button className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1E1719] px-4 py-2.5 text-sm font-bold text-white"><Save className="h-4 w-4" />Save changes</button><button type="button" className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-bold" onClick={() => setEditing(null)}>Cancel</button></div>
            </> : <p className="text-sm text-stone-500">Choose Edit on a category to update its name, department, or customer-facing description.</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export const AdminAnalyticsScreen: React.FC = () => {
  const { orders, products } = useStore();
  const revenue = orders.reduce((total, order) => total + Number(order.total || 0), 0);
  const averageOrder = orders.length ? revenue / orders.length : 0;
  const productSales = useMemo(() => {
    const totals = new Map<string, number>();
    orders.forEach(order => order.items.forEach(item => totals.set(item.product.id, (totals.get(item.product.id) || 0) + item.quantity)));
    return products.map(product => ({ product, quantity: totals.get(product.id) || 0 })).filter(row => row.quantity > 0).sort((a, b) => b.quantity - a.quantity).slice(0, 8);
  }, [orders, products]);
  const maxQuantity = productSales[0]?.quantity || 1;

  return (
    <div className="space-y-6">
      <header className="border-b border-stone-200 pb-6 dark:border-[#2e2428]"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B27A52]">Reports</p><h1 className="mt-1 font-serif text-3xl font-bold text-[#1E1719] dark:text-stone-100">Sales analytics</h1><p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Live performance from orders and catalog activity.</p></header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Revenue" value={`GHS ${revenue.toFixed(2)}`} icon={TrendingUp} /><Metric label="Orders" value={orders.length} icon={BarChart3} /><Metric label="Average order" value={`GHS ${averageOrder.toFixed(2)}`} icon={TrendingUp} /><Metric label="Catalog items" value={products.length} icon={Layers} /></div>
      <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-[#2e2428] dark:bg-[#201b1a]"><h2 className="font-bold text-stone-900 dark:text-stone-100">Top products by units sold</h2><div className="mt-5 space-y-4">{productSales.map(({ product, quantity }) => <div key={product.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4"><div className="min-w-0"><div className="flex justify-between gap-3 text-sm"><span className="truncate font-semibold">{product.name}</span><span className="font-bold">{quantity}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-[#B27A52]" style={{ width: `${(quantity / maxQuantity) * 100}%` }} /></div></div></div>)}{productSales.length === 0 && <p className="py-8 text-center text-sm text-stone-500">Sales data will appear after the first order.</p>}</div></section>
    </div>
  );
};

function Metric({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-[#2e2428] dark:bg-[#201b1a]"><Icon className="h-5 w-5 text-[#B27A52]" /><p className="mt-3 text-2xl font-bold text-stone-900 dark:text-stone-100">{value}</p><p className="mt-1 text-xs text-stone-500">{label}</p></div>;
}
