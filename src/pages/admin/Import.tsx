import React, { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, X } from 'lucide-react';
import { api } from '../../lib/api';

export function Import() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ columns: string[]; rows: Record<string, string>[]; totalRows: number } | null>(null);
  const [result, setResult] = useState<{ inserted: number; updated: number; skipped: number; errors: string[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (selected: File) => {
    const ext = selected.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
      setError('Only CSV and Excel (.xlsx, .xls) files are supported.');
      return;
    }
    setFile(selected);
    setError(null);
    setResult(null);

    try {
      const previewData = await api.import.upload(selected, true) as any;
      if (previewData.preview) {
        setPreview({
          columns: previewData.columns,
          rows: previewData.rows,
          totalRows: previewData.totalRows,
        });
      }
    } catch (err) {
      setError('Failed to parse file. Check the format and try again.');
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setError(null);
    try {
      const data = await api.import.upload(file, false) as any;
      setResult(data);
      setPreview(null);
      setFile(null);
    } catch (err) {
      setError('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Import Products</h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload a CSV or Excel file to bulk import products into the catalog.
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div>
          <p className="text-sm font-medium text-blue-800">Need a template?</p>
          <p className="text-xs text-blue-600 mt-0.5">Download a CSV with the expected column headers.</p>
        </div>
        <button
          onClick={() => api.import.downloadTemplate()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          <Download size={16} />
          Download Template
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {!preview && !result && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <FileSpreadsheet className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-base font-semibold text-gray-700 mb-1">
            {file ? file.name : 'Drop your file here or click to browse'}
          </p>
          <p className="text-sm text-gray-500">CSV, .xlsx, or .xls — up to 50MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            className="hidden"
          />
        </div>
      )}

      {preview && !result && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Preview</h2>
              <p className="text-sm text-gray-500">
                {preview.totalRows} rows found. Showing first {preview.rows.length}.
              </p>
            </div>
            <button onClick={() => { setFile(null); setPreview(null); }}
              className="p-2 rounded-lg hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {preview.columns.map(col => (
                    <th key={col} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {preview.columns.map(col => (
                      <td key={col} className="px-4 py-2 text-gray-700 whitespace-nowrap max-w-[200px] truncate">
                        {row[col] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleImport}
            disabled={importing}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50"
          >
            <Upload size={18} />
            {importing ? 'Importing...' : `Import ${preview.totalRows} Products`}
          </button>
        </div>
      )}

      {result && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Import Complete</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{result.inserted}</p>
              <p className="text-sm text-green-600">Inserted</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-700">{result.updated}</p>
              <p className="text-sm text-blue-600">Updated</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-gray-700">{result.skipped}</p>
              <p className="text-sm text-gray-600">Skipped</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-red-700 mb-2">Errors ({result.errors.length})</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                {result.errors.map((err, i) => (
                  <p key={i} className="text-sm text-red-600 mb-1">{err}</p>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => { setResult(null); setFile(null); setPreview(null); }}
            className="px-5 py-2.5 bg-orange-600 text-white rounded-lg font-semibold text-sm hover:bg-orange-700"
          >
            Import Another File
          </button>
        </div>
      )}

      <div className="mt-12 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Expected Columns</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {[
            { col: 'product_name', req: true, desc: 'Product name' },
            { col: 'price', req: true, desc: 'Price in USh (integer)' },
            { col: 'brand', req: false, desc: 'Brand name' },
            { col: 'gender', req: false, desc: 'men or women' },
            { col: 'category', req: false, desc: 'e.g. t-shirts, dresses' },
            { col: 'short_description', req: false, desc: 'Brief description' },
            { col: 'long_description', req: false, desc: 'Detailed description' },
            { col: 'color', req: false, desc: 'Single color name' },
            { col: 'size', req: false, desc: 'Comma-separated: S, M, L' },
            { col: 'image_paths', req: false, desc: 'Pipe-separated image paths' },
          ].map(({ col, req, desc }) => (
            <div key={col} className="flex items-center gap-2">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{col}</code>
              {req && <span className="text-xs text-red-500 font-semibold">Required</span>}
              <span className="text-xs text-gray-500">— {desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
