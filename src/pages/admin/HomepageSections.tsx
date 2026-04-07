import React, { useEffect, useState, useCallback } from 'react';
import { Check, X, Search } from 'lucide-react';
import { api, type HomepageSection, type ApiProductRecord, type ApiCollectionRecord } from '../../lib/api';
import { getImageSrc } from '../../lib/images';

interface SectionWithProducts extends HomepageSection {
  products?: ApiProductRecord[];
}

export function HomepageSections() {
  const [sections, setSections] = useState<SectionWithProducts[]>([]);
  const [allProducts, setAllProducts] = useState<ApiProductRecord[]>([]);
  const [collections, setCollections] = useState<ApiCollectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ sections: sectionList }, productsData, collectionsData] = await Promise.all([
        api.homepageSections.list(),
        api.products.list({ limit: 200 }),
        api.collections.list(),
      ]);

      // Build a map of collection_id → collection title
      const collectionMap: Record<string, string> = {};
      collectionsData.forEach(c => { collectionMap[c.id] = c.title; });

      // Attach product objects to each section
      const productMap: Record<number, ApiProductRecord> = {};
      productsData.products.forEach(p => { productMap[p.id] = p; });

      const withProducts: SectionWithProducts[] = sectionList.map(s => ({
        ...s,
        products: s.productIds
          .map(id => productMap[id])
          .filter(Boolean),
      }));

      setSections(withProducts);
      setAllProducts(productsData.products);
      setCollections(collectionsData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openPicker = (sectionKey: string, currentIds: number[]) => {
    setPickerOpen(sectionKey);
    setSelectedIds(new Set(currentIds));
    setSearch('');
  };

  const closePicker = () => {
    setPickerOpen(null);
    setSelectedIds(new Set());
    setSearch('');
  };

  const toggleProduct = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (!pickerOpen) return;
    setSaving(true);
    try {
      await api.homepageSections.assignProducts(pickerOpen, Array.from(selectedIds));
      await loadData();
      closePicker();
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = allProducts.filter(p => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(s) ||
      p.brand?.toLowerCase().includes(s) ||
      p.category?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Homepage Sections</h1>
        <p className="text-gray-500 text-sm mt-1">
          Assign products to each homepage section. Products appear on the homepage in the order selected.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map(section => (
            <div key={section.key} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{section.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{section.key}</p>
                </div>
                <button
                  onClick={() => openPicker(section.key, section.productIds)}
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                >
                  Assign Products ({section.productIds.length})
                </button>
              </div>

              {/* Currently assigned products */}
              {section.products && section.products.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {section.products.map(product => (
                    <div key={product.id} className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200 px-3 py-2">
                      {product.images?.[0] ? (
                        <img
                          src={getImageSrc(product.images[0])}
                          alt={product.name}
                          className="w-8 h-8 rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-200 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate max-w-[140px]">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.brand}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No products assigned yet.</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Product Picker Modal */}
      {pickerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Assign Products — {sections.find(s => s.key === pickerOpen)?.title}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedIds.size} product{selectedIds.size !== 1 ? 's' : ''} selected
                </p>
              </div>
              <button onClick={closePicker} className="p-2 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="px-6 py-3 border-b border-gray-100 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto px-6 py-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredProducts.map(product => {
                  const selected = selectedIds.has(Number(product.id));
                  return (
                    <button
                      key={product.id}
                      onClick={() => toggleProduct(Number(product.id))}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                        selected
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                        selected ? 'bg-orange-600 border-orange-600' : 'border-gray-300'
                      }`}>
                        {selected && <Check size={12} className="text-white" />}
                      </div>
                      {product.images?.[0] ? (
                        <img
                          src={getImageSrc(product.images[0])}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.brand || product.category || '—'}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
              <button
                onClick={closePicker}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : `Save (${selectedIds.size})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
