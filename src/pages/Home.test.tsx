import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Home } from './Home';
import { COLLECTION_IDS } from '../lib/subcategoryMap';
import type { ApiProductRecord } from '../lib/api';

const { productsListMock } = vi.hoisted(() => ({
  productsListMock: vi.fn(),
}));

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api');

  return {
    ...actual,
    api: {
      ...actual.api,
      products: {
        ...actual.api.products,
        list: productsListMock,
      },
    },
  };
});

function makeProduct(overrides: Partial<ApiProductRecord> = {}): ApiProductRecord {
  return {
    id: 1,
    name: 'Fresh Arrival',
    brand: 'Coco',
    description: 'A featured product',
    price: 50,
    original_price: null,
    discount: null,
    promo: null,
    rating: 4.5,
    reviews: 12,
    images: ['https://example.com/product.jpg'],
    colors: ['#111111'],
    sizes: [],
    types: [],
    features: [],
    details: '',
    category: 'Women',
    collection_id: COLLECTION_IDS.women.id,
    created_at: '2026-04-04T12:00:00.000Z',
    updated_at: '2026-04-04T12:00:00.000Z',
    ...overrides,
  };
}

describe('Home page', () => {
  beforeEach(() => {
    productsListMock.mockReset();
  });

  it('fetches products through the shared API client with limit 200', async () => {
    const freshArrival = makeProduct();
    const saleSpotlight = makeProduct({
      id: 2,
      name: 'Sale Spotlight',
      price: 40,
      original_price: 80,
      collection_id: COLLECTION_IDS.women.id,
    });
    const regularPick = makeProduct({
      id: 3,
      name: 'Regular Pick',
      price: 65,
      original_price: null,
      collection_id: COLLECTION_IDS.men.id,
    });

    // Mock returns products for any collection query
    productsListMock.mockResolvedValue({
      products: [freshArrival, saleSpotlight, regularPick],
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(productsListMock).toHaveBeenCalledWith({ limit: 200, order: 'created_at DESC' });
    });

    expect(await screen.findAllByText('Fresh Arrival')).not.toHaveLength(0);
  });

  it('renders CategoryStrip with category links and fetches trending products', async () => {
    const womenShoesProduct = makeProduct({
      id: 10,
      name: 'Women Shoes Product',
      collection_id: COLLECTION_IDS.women.subcategories.shoes,
    });
    const menShoesProduct = makeProduct({
      id: 11,
      name: 'Men Shoes Product',
      collection_id: COLLECTION_IDS.men.subcategories.shoes,
    });

    productsListMock.mockImplementation(async (params?: { collection_id?: string; gender?: string; limit?: number; order?: string }) => {
      // Main homepage products fetch (limit 200)
      if (params?.limit === 200) {
        return { products: [womenShoesProduct, menShoesProduct] };
      }

      // Loved tab fetch (new-arrivals default)
      if (params?.limit === 6 && params?.order === 'created_at DESC') {
        return { products: [womenShoesProduct, menShoesProduct] };
      }

      return { products: [] };
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(productsListMock).toHaveBeenCalledWith({ limit: 200, order: 'created_at DESC' });
      expect(productsListMock).toHaveBeenCalledWith({ limit: 6, order: 'created_at DESC' });
    });

    // Verify CategoryStrip renders with category links (use exact match to avoid multiple matches)
    expect(await screen.findByText("Women's Shoes", { exact: true })).toBeInTheDocument();
    expect(await screen.findByText("Men's Shoes", { exact: true })).toBeInTheDocument();
    expect(await screen.findAllByText('Handbags')).toHaveLength(4); // Multiple Handbags in the page
  });
});
