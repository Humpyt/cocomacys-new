/**
 * Shared Express API client for the storefront.
 * Keeps frontend consumers aligned with the live PostgreSQL-backed API contract.
 */

const API_BASE = '/api';

type NumericValue = number | string;

export interface ApiProductRecord {
  id: number;
  name: string;
  brand: string | null;
  description: string | null;
  price: NumericValue;
  original_price: NumericValue | null;
  discount: string | null;
  promo: string | null;
  rating: NumericValue | null;
  reviews: number;
  images: string[];
  colors: string[];
  sizes: string[];
  types: string[];
  features: string[];
  details: string | null;
  category: string | null;
  collection_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiCollectionRecord {
  id: string;
  title: string;
  handle: string;
  parent_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ProductListParams {
  collection_id?: string;
  category?: string;
  gender?: 'men' | 'women';
  limit?: number;
  order?: string;
}

export interface ProductInput {
  name: string;
  brand?: string;
  description?: string;
  details?: string;
  price: number;
  original_price?: number | null;
  discount?: string;
  promo?: string;
  rating?: number;
  reviews?: number;
  images?: string[];
  colors?: string[];
  sizes?: string[];
  types?: string[];
  features?: string[];
  category?: string;
  collection_id?: string | null;
}

export interface HomepageSection {
  key: string;
  title: string;
  productIds: number[];
}

export interface AdminOrder {
  id: number;
  cart_id: number;
  customer_id: number;
  email: string;
  shipping_address: Record<string, unknown> | null;
  billing_address: Record<string, unknown> | null;
  shipping_method: Record<string, unknown> | null;
  subtotal: string;
  tax: string;
  total: string;
  status: string;
  payment_status: string;
  items: Array<{
    id: number;
    product_id: number;
    quantity: number;
    unit_price: string;
    name: string;
    brand: string | null;
    images: string[];
  }>;
  created_at: string;
  updated_at: string;
}

export interface ClearanceItem {
  id: number;
  title: string;
  brand: string | null;
  price: number;
  is_clearance: boolean;
  compare_at_price: number | null;
  discount: string | null;
}

export interface ImportResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export interface ImportPreview {
  preview: true;
  columns: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toNumber(value: NumericValue | null | undefined, fallback = 0): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function toOptionalNumber(value: NumericValue | null | undefined): number | null {
  if (value == null || value === '') {
    return null;
  }

  const parsed = toNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

async function readErrorMessage(res: Response): Promise<string> {
  const fallback = `API error ${res.status}`;
  const contentType = res.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      const payload: unknown = await res.json();
      if (isRecord(payload)) {
        const message =
          typeof payload.error === 'string'
            ? payload.error
            : typeof payload.message === 'string'
              ? payload.message
              : null;

        if (message) {
          return `API error ${res.status}: ${message}`;
        }
      }
    } catch {
      return fallback;
    }

    return fallback;
  }

  try {
    const text = (await res.text()).trim();
    return text ? `API error ${res.status}: ${text}` : fallback;
  } catch {
    return fallback;
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  return res.json() as Promise<T>;
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export function formatCurrency(amount: number, currencyCode = 'UGX'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('UGX', 'USh');
}

export function getProductPrice(product: ApiProductRecord): number {
  return toNumber(product.price);
}

export function getProductOriginalPrice(product: ApiProductRecord): number | null {
  return toOptionalNumber(product.original_price);
}

export function getProductRating(product: ApiProductRecord): number {
  return toNumber(product.rating);
}

export function getProductImage(product: ApiProductRecord): string | null {
  return product.images[0] ?? null;
}

export function isProductOnSale(product: ApiProductRecord): boolean {
  const originalPrice = getProductOriginalPrice(product);
  return originalPrice != null && getProductPrice(product) < originalPrice;
}

export function getProductDiscountLabel(product: ApiProductRecord): string | undefined {
  if (product.discount) {
    return product.discount;
  }

  const price = getProductPrice(product);
  const originalPrice = getProductOriginalPrice(product);

  if (originalPrice == null || originalPrice <= price) {
    return undefined;
  }

  return `${Math.round(((originalPrice - price) / originalPrice) * 100)}% off`;
}

export const api = {
  products: {
    list: async (params: ProductListParams = {}): Promise<{ products: ApiProductRecord[] }> => {
      const searchParams = new URLSearchParams();

      if (params.collection_id) {
        searchParams.set('collection_id', params.collection_id);
      }

      if (params.category) {
        searchParams.set('category', params.category);
      }

      if (params.limit) {
        searchParams.set('limit', String(params.limit));
      }

      if (params.order) {
        searchParams.set('order', params.order);
      }

      if (params.gender) {
        searchParams.set('gender', params.gender);
      }

      const query = searchParams.toString();
      const path = `/products${query ? `?${query}` : ''}`;
      const products = await apiFetch<ApiProductRecord[]>(path);

      return { products };
    },

    get: async (id: string): Promise<ApiProductRecord> => {
      return apiFetch<ApiProductRecord>(`/products/${id}`);
    },

    create: async (data: ProductInput): Promise<ApiProductRecord> => {
      return apiFetch<ApiProductRecord>('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: Partial<ProductInput>): Promise<ApiProductRecord> => {
      return apiFetch<ApiProductRecord>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number): Promise<void> => {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
    },
  },

  collections: {
    list: async (): Promise<ApiCollectionRecord[]> => {
      return apiFetch<ApiCollectionRecord[]>('/collections');
    },

    get: async (id: string): Promise<ApiCollectionRecord> => {
      return apiFetch<ApiCollectionRecord>(`/collections/${id}`);
    },

    create: async (data: { title: string; handle?: string; parent_id?: string | null; metadata?: Record<string, unknown> }): Promise<ApiCollectionRecord> => {
      return apiFetch<ApiCollectionRecord>('/collections', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: { title?: string; handle?: string; parent_id?: string | null; metadata?: Record<string, unknown> }): Promise<ApiCollectionRecord> => {
      return apiFetch<ApiCollectionRecord>(`/collections/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string): Promise<void> => {
      await apiFetch(`/collections/${id}`, { method: 'DELETE' });
    },
  },

  upload: {
    single: async (file: File): Promise<{ url: string; filename: string }> => {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      return res.json();
    },

    multiple: async (files: File[]): Promise<{ files: Array<{ url: string; filename: string }> }> => {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      const res = await fetch(`${API_BASE}/upload/multiple`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      return res.json();
    },
  },

  orders: {
    admin: async (params: { status?: string; limit?: number; offset?: number } = {}): Promise<{ orders: AdminOrder[]; total: number }> => {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.set('status', params.status);
      if (params.limit) searchParams.set('limit', String(params.limit));
      if (params.offset) searchParams.set('offset', String(params.offset));
      const query = searchParams.toString();
      return apiFetch<{ orders: AdminOrder[]; total: number }>(`/orders/admin${query ? `?${query}` : ''}`);
    },

    updateStatus: async (id: number, status: string): Promise<void> => {
      await apiFetch(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },
  },

  clearance: {
    list: async (): Promise<ClearanceItem[]> => {
      return apiFetch<ClearanceItem[]>('/clearance');
    },

    set: async (productId: number, is_clearance: boolean, compare_at_price?: number): Promise<ClearanceItem> => {
      return apiFetch<ClearanceItem>(`/clearance/${productId}/clearance`, {
        method: 'POST',
        body: JSON.stringify({ is_clearance, compare_at_price }),
      });
    },

    bulkSet: async (product_ids: number[], is_clearance: boolean, compare_at_price?: number): Promise<{ updated: number; products: ClearanceItem[] }> => {
      return apiFetch<{ updated: number; products: ClearanceItem[] }>('/clearance/bulk-clearance', {
        method: 'POST',
        body: JSON.stringify({ product_ids, is_clearance, compare_at_price }),
      });
    },
  },

  auth: {
    me: async (): Promise<unknown> => {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    logout: async (): Promise<void> => {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    },
  },

  homepageSections: {
    list: async (): Promise<{ sections: HomepageSection[] }> => {
      return apiFetch<{ sections: HomepageSection[] }>('/homepage-sections');
    },
    assignProducts: async (sectionKey: string, productIds: number[]): Promise<void> => {
      await apiFetch(`/homepage-sections/${sectionKey}/assign`, {
        method: 'PUT',
        body: JSON.stringify({ productIds }),
      });
    },
    create: async (data: { key: string; title: string; productIds?: number[] }): Promise<HomepageSection> => {
      return apiFetch<HomepageSection>('/homepage-sections', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (sectionKey: string, data: { title: string }): Promise<HomepageSection> => {
      return apiFetch<HomepageSection>(`/homepage-sections/${sectionKey}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    delete: async (sectionKey: string): Promise<void> => {
      await apiFetch(`/homepage-sections/${sectionKey}`, { method: 'DELETE' });
    },
  },

  import: {
    upload: async (file: File, preview = false): Promise<ImportResult | ImportPreview> => {
      const formData = new FormData();
      formData.append('file', file);
      const query = preview ? '?preview=true' : '';
      const res = await fetch(`${API_BASE}/import${query}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) throw new Error(`Import failed: ${res.status}`);
      return res.json();
    },

    downloadTemplate: (): void => {
      window.open(`${API_BASE}/import/template`, '_blank');
    },
  },
};
