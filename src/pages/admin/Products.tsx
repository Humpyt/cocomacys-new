import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, type ApiProductRecord, formatCurrency, getProductPrice, getProductImage, isProductOnSale } from '../../lib/api';
import { getImageSrc } from '../../lib/images';

export function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ApiProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const pageSize = 20;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { products: prods } = await api.products.list({ limit: 200, order: 'created_at DESC' });
      setProducts(prods);
      setTotal(prods.length);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = products.filter(p => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(s) ||
      p.brand?.toLowerCase().includes(s) ||
      p.category?.toLowerCase().includes(s)
    );
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.products.delete(deleteId);
      setDeleteId(null);
      await fetchProducts();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} products</p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-sm"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by name, brand, or category..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-16">Image</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Brand</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Price</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    Loading products...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    {search ? 'No products match your search.' : 'No products yet.'}
                  </td>
                </tr>
              ) : (
                paginated.map(product => {
                  const onSale = isProductOnSale(product);
                  const img = getProductImage(product);
                  return (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {img ? (
                          <img
                            src={getImageSrc(img)}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{product.brand || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{product.category || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold">{formatCurrency(getProductPrice(product))}</span>
                        {onSale && <span className="ml-2 text-xs text-green-600 font-medium">Sale</span>}
                      </td>
                      <td className="px-4 py-3">
                        {onSale ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Clearance</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                            className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteId(Number(product.id))}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium px-2">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product?</h3>
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone. The product will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
