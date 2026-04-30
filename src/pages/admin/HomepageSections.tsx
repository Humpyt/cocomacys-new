import React, { useEffect, useState, useCallback } from 'react';
import { Check, X, Search, Plus } from 'lucide-react';
import { api, type HomepageSection, type ApiProductRecord, type ApiCollectionRecord } from '../../lib/api';
import { getImageSrc } from '../../lib/images';
import { formatProductLabel } from '../../lib/navigation';

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [createKey, setCreateKey] = useState('');
  const [createTitle, setCreateTitle] = useState('');
  const [deleteKey, setDeleteKey] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ sections: sectionList }, productsData, collectionsData] = await Promise.all([
        api.homepageSections.list(),
        api.products.list({ limit: 200 }),
        api.collections.list(),
      ]);

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

  const handleCreate = async () => {
    if (!createKey.trim() || !createTitle.trim()) return;
    setSaving(true);
    try {
      await api.homepageSections.create({ key: createKey.trim(), title: createTitle.trim() });
      await loadData();
      setShowCreateModal(false);
      setCreateKey('');
      setCreateTitle('');
    } catch (err) {
      console.error('Failed to create section:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (key: string) => {
    if (!editTitle.trim()) return;
    setSaving(true);
    try {
      await api.homepageSections.update(key, { title: editTitle.trim() });
      await loadData();
      setEditKey(null);
    } catch (err) {
      console.error('Failed to update section:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (key: string) => {
    setSaving(true);
    try {
      await api.homepageSections.delete(key);
      await loadData();
      setDeleteKey(null);
    } catch (err) {
      console.error('Failed to delete section:', err);
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homepage Sections</h1>
          <p className="text-gray-500 text-sm mt-1">Manage homepage sections and assign products.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-sm"
        >
          <Plus size={18} />
          Add Section
        </button>
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
                  {editKey === section.key ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500"
                        autoFocus
                      />
                      <button onClick={() => handleEdit(section.key)}
                        className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-semibold">
                        Save
                      </button>
                      <button onClick={() => setEditKey(null)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{section.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{section.key}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setEditKey(section.key); setEditTitle(section.title); }}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteKey(section.key)}
                    className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => openPicker(section.key, section.productIds)}
                    className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Assign Products ({section.productIds.length})
                  </button>
                </div>
              </div>

              {section.products && section.products.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {section.products.map(product => (
                    <div key={product.id} className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200 px-3 py-2">
                      {product.images?.[0] ? (
                        <img
                          src={getImageSrc(product.images[0])}
                          alt={product.name}
                          loading="lazy"
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
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
                          loading="lazy"
                          className="w-10 h-10 rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">{formatProductLabel(product.brand, product.category) || '—'}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

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

      {/* Create Section Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Homepage Section</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Key *</label>
                <input type="text" value={createKey} onChange={e => setCreateKey(e.target.value)}
                  placeholder="e.g. best_sellers"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Title *</label>
                <input type="text" value={createTitle} onChange={e => setCreateTitle(e.target.value)}
                  placeholder="e.g. Best Sellers"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreate} disabled={saving}
                className="px-4 py-2 rounded-lg bg-orange-600 text-white font-medium text-sm hover:bg-orange-700 disabled:opacity-50">
                {saving ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteKey !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Section?</h3>
            <p className="text-gray-500 text-sm mb-6">
              This will delete the "{sections.find(s => s.key === deleteKey)?.title}" section permanently.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteKey(null)} disabled={saving}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button onClick={() => handleDeleteSection(deleteKey)} disabled={saving}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700 disabled:opacity-50">
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
