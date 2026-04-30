import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, ChevronRight, ChevronDown, Layers } from 'lucide-react';
import { api, type ApiCollectionRecord } from '../../lib/api';

interface TreeNode {
  collection: ApiCollectionRecord;
  children: TreeNode[];
}

function buildTree(collections: ApiCollectionRecord[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  for (const c of collections) {
    map.set(c.id, { collection: c, children: [] });
  }

  for (const c of collections) {
    const node = map.get(c.id)!;
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function flattenTree(nodes: TreeNode[], depth = 0): { node: TreeNode; depth: number }[] {
  const result: { node: TreeNode; depth: number }[] = [];
  for (const n of nodes) {
    result.push({ node: n, depth });
    result.push(...flattenTree(n.children, depth + 1));
  }
  return result;
}

export function Collections() {
  const [collections, setCollections] = useState<ApiCollectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    try {
      const cols = await api.collections.list();
      setCollections(cols);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  const toggleCollapse = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const tree = buildTree(collections);

  // Filter: show matching nodes + full ancestry
  const searchLower = search.toLowerCase();
  const filteredRoots = !search
    ? tree
    : tree.filter(r => nodeMatchesSearch(r, searchLower));

  function nodeMatchesSearch(node: TreeNode, q: string): boolean {
    if (node.collection.title?.toLowerCase().includes(q)) return true;
    if (node.collection.handle?.toLowerCase().includes(q)) return true;
    return node.children.some(c => nodeMatchesSearch(c, q));
  }

  function filterNode(node: TreeNode, q: string): TreeNode | null {
    const self = node.collection.title?.toLowerCase().includes(q) ||
                 node.collection.handle?.toLowerCase().includes(q);
    const filteredChildren = node.children
      .map(c => filterNode(c, q))
      .filter(Boolean) as TreeNode[];
    if (self || filteredChildren.length > 0) {
      return { ...node, children: filteredChildren };
    }
    return null;
  }

  const displayRoots = search
    ? tree.map(r => filterNode(r, searchLower)).filter(Boolean) as TreeNode[]
    : filteredRoots;

  const flat = flattenTree(displayRoots);

  // Auto-expand all when searching
  const allDisplayIds = new Set(flat.map(f => f.node.collection.id));

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.collections.delete(deleteId);
      setDeleteId(null);
      await fetchCollections();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
          <p className="text-gray-500 text-sm mt-1">{collections.length} collections</p>
        </div>
        <Link
          to="/admin/collections/new"
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-sm"
        >
          <Plus size={18} />
          Add Collection
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search collections..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="px-4 py-12 text-center text-gray-400">Loading...</div>
        ) : flat.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-400">
            {search ? 'No collections match your search.' : 'No collections yet.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {flat.map(({ node, depth }) => {
              const c = node.collection;
              const isCollapsed = collapsed.has(c.id);
              const hasChildren = node.children.length > 0;
              const expandable = hasChildren || c.parent_id === null;
              const showExpanded = search
                ? !isCollapsed
                : expandable && !isCollapsed;

              return (
                <div
                  key={c.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  style={{ paddingLeft: `${16 + depth * 24}px` }}
                >
                  {/* Expand/collapse */}
                  <button
                    onClick={() => hasChildren && toggleCollapse(c.id)}
                    className={`shrink-0 ${hasChildren ? 'cursor-pointer text-gray-500' : 'text-transparent'}`}
                  >
                    {hasChildren ? (
                      showExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>

                  {/* Icon or thumbnail */}
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                    {c.image ? (
                      <img src={c.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Layers size={18} className="text-gray-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 text-sm truncate">{c.title}</span>
                      {depth === 0 && (
                        <span className="text-[10px] font-bold uppercase text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Root</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                      {c.handle && <span>/ {c.handle}</span>}
                      <span>{(c as any).product_count ?? 0} products</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      to={`/admin/collections/${c.id}/edit`}
                      className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      onClick={() => setDeleteId(c.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Collection?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Products in this collection will keep their collection_id but it will point to a deleted collection. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} disabled={deleting}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700 disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
