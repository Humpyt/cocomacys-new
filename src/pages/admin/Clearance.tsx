import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, X, Trash2 } from 'lucide-react';
import { api, formatCurrency, type ClearanceItem, type ApiProductRecord } from '../../lib/api';

export function Clearance() {
  const [items, setItems] = useState<ClearanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState<ApiProductRecord[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [discountPercent, setDiscountPercent] = useState('30');
  const [saving, setSaving] = useState(false);
  const [removeId, setRemoveId] = useState<number | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.clearance.list();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const filtered = items.filter(item => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (item.title?.toLowerCase().includes(s) || item.brand?.toLowerCase().includes(s));
  });

  const openModal = async () => {
    setShowModal(true);
    try {
      const data = await api.products.list({ limit: 200 });
      setProducts(data.products.filter(p => {
        const originalPrice = p.original_price ? Number(p.original_price) : null;
        const price = Number(p.price);
        return !(originalPrice && originalPrice > price);
      }));
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const handleAddToClearance = async () => {
    if (!selectedProductId) return;
    setSaving(true);
    try {
      const product = products.find(p => p.id === selectedProductId);
      const price = Number(product?.price || 0);
      const compareAtPrice = Math.round(price / (1 - Number(discountPercent) / 100));
      await api.clearance.set(selectedProductId, true, compareAtPrice);
      await loadItems();
      setShowModal(false);
      setSelectedProductId(null);
      setDiscountPercent('30');
      setProductSearch('');
    } catch (err) {
      console.error('Failed to add clearance:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (productId: number) => {
    setSaving(true);
    try {
      await api.clearance.set(productId, false);
      await loadItems();
      setRemoveId(null);
    } catch (err) {
      console.error('Failed to remove clearance:', err);
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (!productSearch) return true;
    const s = productSearch.toLowerCase();
    return p.name?.toLowerCase().includes(s) || p.brand?.toLowerCase().includes(s);
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clearance</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} clearance items</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-sm"
        >
          <Plus size={18} />
          Add to Clearance
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search clearance items..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Brand</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Price</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Compare At</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Discount</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  {search ? 'No clearance items match your search.' : 'No clearance items.'}
                </td></tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.title}</td>
                    <td className="px-4 py-3 text-gray-600">{item.brand || '—'}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3 text-gray-500 line-through">
                      {item.compare_at_price ? formatCurrency(item.compare_at_price) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                        {item.discount || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setRemoveId(item.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove from clearance"
                        >
                          <Trash2 size={16} />
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

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add to Clearance</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Discount %</label>
              <input type="number" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)}
                min="1" max="99" placeholder="30"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search products..."
                value={productSearch} onChange={e => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500" />
            </div>

            <div className="flex-1 overflow-y-auto max-h-64 border border-gray-200 rounded-lg">
              {filteredProducts.slice(0, 50).map(product => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProductId(Number(product.id))}
                  className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-100 hover:bg-gray-50 ${
                    selectedProductId === Number(product.id) ? 'bg-orange-50 border-l-2 border-l-orange-600' : ''
                  }`}
                >
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.brand} — {formatCurrency(Number(product.price))}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-gray-200">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleAddToClearance} disabled={saving || !selectedProductId}
                className="px-4 py-2 rounded-lg bg-orange-600 text-white font-medium text-sm hover:bg-orange-700 disabled:opacity-50">
                {saving ? 'Adding...' : `Add (${discountPercent}% off)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {removeId !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Remove from Clearance?</h3>
            <p className="text-gray-500 text-sm mb-6">This will remove the clearance discount from this product.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRemoveId(null)} disabled={saving}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button onClick={() => handleRemove(removeId)} disabled={saving}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700 disabled:opacity-50">
                {saving ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
