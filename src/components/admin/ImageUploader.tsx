import React, { useRef, useState } from 'react';
import { api } from '../../lib/api';
import { X, Upload } from 'lucide-react';

interface ImageUploaderProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({ value = [], onChange, maxImages = 10 }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (value.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const fileArray = Array.from(files);
      const result = await api.upload.multiple(fileArray);
      const newUrls = result.files.map(f => f.url);
      onChange([...value, ...newUrls]);
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
          dragOver ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="text-gray-400" size={28} />
            <p className="text-sm text-gray-600 font-medium">
              Drop images here or click to browse
            </p>
            <p className="text-xs text-gray-400">
              JPEG, PNG, GIF, WebP up to 10MB each &middot; Max {maxImages} images
            </p>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {value.length > 0 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-3">
          {value.map((url, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-black bg-opacity-60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="text-white" size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
