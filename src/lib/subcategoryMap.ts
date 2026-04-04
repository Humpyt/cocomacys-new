// Collection IDs — replace with actual IDs from Medusa admin after running create-subcategory-collections.ts
export const COLLECTION_IDS = {
  women: {
    id: 'women-collection-id',
    subcategories: {
      dresses: 'women-dresses-collection-id',
      bags: 'women-bags-collection-id',
      blouses: 'women-blouses-collection-id',
      shoes: 'women-shoes-collection-id',
      tops: 'women-tops-collection-id',
      jeans: 'women-jeans-collection-id',
      waitcoats: 'women-waitcoats-collection-id',
    },
  },
  men: {
    id: 'men-collection-id',
    subcategories: {
      shirts: 'men-shirts-collection-id',
      tshirts: 'men-t-shirts-collection-id',
      shoes: 'men-shoes-collection-id',
      jeans: 'men-jeans-collection-id',
    },
  },
} as const

// Homepage section → collection ID(s) mapping
export interface SectionConfig {
  collectionIds: string[]
  sortBy?: 'created_at' | 'updated_at'
  sortOrder?: 'asc' | 'desc'
  filterClearance?: boolean  // if true, filter to compare_at_price > price
  limit?: number
}

export const HOMEPAGE_SECTIONS = {
  // "Loved by us" tabs
  'new-arrivals': {
    collectionIds: [COLLECTION_IDS.women.id, COLLECTION_IDS.men.id],
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit: 6,
  },
  'deals-for-you': {
    collectionIds: [COLLECTION_IDS.women.id, COLLECTION_IDS.men.id],
    filterClearance: true,
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit: 6,
  },
  'dressy-looks': {
    collectionIds: [COLLECTION_IDS.women.subcategories.dresses],
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit: 6,
  },
  'spring-handbags': {
    collectionIds: [COLLECTION_IDS.women.subcategories.bags],
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit: 6,
  },
  // Carousels
  'trending-now': {
    collectionIds: [COLLECTION_IDS.women.id, COLLECTION_IDS.men.id],
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit: 6,
  },
  'shop-clearance': {
    collectionIds: [COLLECTION_IDS.women.id, COLLECTION_IDS.men.id],
    filterClearance: true,
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit: 6,
  },
  'discover-more': {
    collectionIds: [COLLECTION_IDS.women.id, COLLECTION_IDS.men.id],
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit: 6,
  },
  // Denim promo
  'denim-women': {
    collectionIds: [COLLECTION_IDS.women.subcategories.jeans],
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit: 4,
  },
  'denim-men': {
    collectionIds: [COLLECTION_IDS.men.subcategories.jeans],
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit: 4,
  },
  // Star Rewards
  'star-shoes': {
    collectionIds: [
      COLLECTION_IDS.women.subcategories.shoes,
      COLLECTION_IDS.men.subcategories.shoes,
    ],
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit: 4,
  },
  'star-dresses': {
    collectionIds: [COLLECTION_IDS.women.subcategories.dresses],
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit: 4,
  },
  'star-handbags': {
    collectionIds: [COLLECTION_IDS.women.subcategories.bags],
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit: 4,
  },
} as const