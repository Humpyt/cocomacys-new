import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { api, type ApiCollectionRecord } from '../../lib/api';

export function CollectionForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [handle, setHandle] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      api.collections.get(id)
        .then((col: ApiCollectionRecord) => {
          setTitle(col.title || '');
          setHandle(col.handle || '');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  useEffect(() => {
    if (!isEdit) {
      setHandle(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  }, [title, isEdit]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !handle.trim()) {
      setError('Title and handle are required.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      if (isEdit && id) {
        await api.collections.update(id, { title: title.trim(), handle: handle.trim() });
      } else {
        await api.collections.create({ title: title.trim(), handle: handle.trim() });
      }
      navigate('/admin/collections');
    } catch (err) {
      setError('Failed to save collection.');
      console.error(err);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Delete this collection?')) return;
    setDeleting(true);
    try {
      await api.collections.delete(id);
      navigate('/admin/collections');
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
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/admin/collections')}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Collection' : 'Add Collection'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
            placeholder="e.g. Summer Collection"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Handle *</label>
          <input type="text" value={handle} onChange={e => setHandle(e.target.value)} required
            placeholder="e.g. summer-collection"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
          <p className="mt-1 text-xs text-gray-400">URL-friendly slug. Auto-generated from title.</p>
        </div>

        <div className="flex items-center justify-between pt-4">
          {isEdit && (
            <button type="button" onClick={handleDelete} disabled={deleting}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold text-sm disabled:opacity-50">
              <Trash2 size={16} />
              {deleting ? 'Deleting...' : 'Delete Collection'}
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button type="button" onClick={() => navigate('/admin/collections')}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 disabled:opacity-50">
              <Save size={16} />
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Collection'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
