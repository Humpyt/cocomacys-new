import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { api, type ApiProductRecord, type ProductInput, type ApiCollectionRecord } from '../../lib/api';
import { ImageUploader } from '../../components/admin/ImageUploader';

interface FormState {
  name: string;
  brand: string;
  description: string;
  details: string;
  price: string;
  original_price: string;
  discount: string;
  promo: string;
  category: string;
  collection_id: string;
  images: string[];
  colors: string;
  sizes: string;
  types: string;
  features: string;
  rating: string;
  reviews: string;
}

const initialForm: FormState = {
  name: '',
  brand: '',
  description: '',
  details: '',
  price: '',
  original_price: '',
  discount: '',
  promo: '',
  category: '',
  collection_id: '',
  images: [],
  colors: '',
  sizes: '',
  types: '',
  features: '',
  rating: '0',
  reviews: '0',
};

export function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormState>(initialForm);
  const [collections, setCollections] = useState<ApiCollectionRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.collections.list().then((cols) => setCollections(cols));
    if (isEdit && id) {
      api.products.get(id)
        .then((p: ApiProductRecord) => {
          setForm({
            name: p.name || '',
            brand: p.brand || '',
            description: p.description || '',
            details: p.details || '',
            price: String(p.price || ''),
            original_price: p.original_price != null ? String(p.original_price) : '',
            discount: p.discount || '',
            promo: p.promo || '',
            category: p.category || '',
            collection_id: p.collection_id || '',
            images: p.images || [],
            colors: (p.colors || []).join(', '),
            sizes: (p.sizes || []).join(', '),
            types: (p.types || []).join(', '),
            features: (p.features || []).join(', '),
            rating: String(p.rating || '0'),
            reviews: String(p.reviews || '0'),
          });
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const parseArray = (val: string) =>
    val.split(',').map(s => s.trim()).filter(Boolean);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Product name is required.'); return; }
    if (!form.price || isNaN(Number(form.price))) { setError('A valid price is required.'); return; }

    setError(null);
    setSaving(true);

    const payload: ProductInput = {
      name: form.name.trim(),
      brand: form.brand.trim() || undefined,
      description: form.description.trim() || undefined,
      details: form.details.trim() || undefined,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : undefined,
      discount: form.discount.trim() || undefined,
      promo: form.promo.trim() || undefined,
      category: form.category.trim() || undefined,
      collection_id: form.collection_id || undefined,
      images: form.images,
      colors: parseArray(form.colors),
      sizes: parseArray(form.sizes),
      types: parseArray(form.types),
      features: parseArray(form.features),
      rating: Number(form.rating) || 0,
      reviews: Number(form.reviews) || 0,
    };

    try {
      if (isEdit && id) {
        await api.products.update(Number(id), payload);
      } else {
        await api.products.create(payload);
      }
      navigate('/admin/products');
    } catch (err) {
      setError('Failed to save product. Please try again.');
      console.error(err);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Delete this product? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.products.delete(Number(id));
      navigate('/admin/products');
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{isEdit ? `Editing product #${id}` : 'Create a new product'}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                required
                placeholder="e.g. Navy Blue T-Shirts"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Brand</label>
              <input
                type="text"
                value={form.brand}
                onChange={set('brand')}
                placeholder="e.g. Polo Ralph Lauren"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={set('category')}
                placeholder="e.g. men_t-shirts"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
              />
              <p className="mt-1 text-xs text-gray-400">e.g. men_t-shirts, women_dresses</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={set('description')}
                rows={3}
                placeholder="Brief product description..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Details</label>
              <textarea
                value={form.details}
                onChange={set('details')}
                rows={3}
                placeholder="Detailed product information..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Pricing</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Price (USh) *</label>
              <input
                type="number"
                value={form.price}
                onChange={set('price')}
                required
                min="0"
                step="100"
                placeholder="200000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Original Price</label>
              <input
                type="number"
                value={form.original_price}
                onChange={set('original_price')}
                min="0"
                step="100"
                placeholder="300000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Discount Label</label>
              <input
                type="text"
                value={form.discount}
                onChange={set('discount')}
                placeholder="e.g. 30% off"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Promo Label</label>
              <input
                type="text"
                value={form.promo}
                onChange={set('promo')}
                placeholder="e.g. Buy 1 Get 1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </section>

        {/* Collection */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Collection Assignment</h2>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Assign to Collection</label>
            <select
              value={form.collection_id}
              onChange={set('collection_id')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
            >
              <option value="">— No collection —</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">Assigning a collection makes the product appear on the relevant category page.</p>
          </div>
        </section>

        {/* Images */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Product Images</h2>
          <ImageUploader
            value={form.images}
            onChange={urls => setForm(prev => ({ ...prev, images: urls }))}
          />
        </section>

        {/* Variants & Attributes */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Variants & Attributes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Colors</label>
              <input
                type="text"
                value={form.colors}
                onChange={set('colors')}
                placeholder="Navy, White, Red (comma-separated)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Sizes</label>
              <input
                type="text"
                value={form.sizes}
                onChange={set('sizes')}
                placeholder="S, M, L, XL (comma-separated)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Types</label>
              <input
                type="text"
                value={form.types}
                onChange={set('types')}
                placeholder="e.g. Casual, Formal (comma-separated)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Features</label>
              <input
                type="text"
                value={form.features}
                onChange={set('features')}
                placeholder="e.g. Breathable, Eco-friendly"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Rating (0–5)</label>
              <input
                type="number"
                value={form.rating}
                onChange={set('rating')}
                min="0"
                max="5"
                step="0.1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Review Count</label>
              <input
                type="number"
                value={form.reviews}
                onChange={set('reviews')}
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold text-sm disabled:opacity-50"
            >
              <Trash2 size={16} />
              {deleting ? 'Deleting...' : 'Delete Product'}
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
