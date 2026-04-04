// Collection IDs — populated from database after running create-subcategory-collections.ts
export const COLLECTION_IDS = {
  women: {
    id: 'pcol_01KNC0YTRA3X7VDBVE7TNBMPSM',
    subcategories: {
      dresses: 'col_c38n5314q7',
      bags: 'col_tr0vvrizgv',
      blouses: 'col_zg0eh6rvgtb',
      shoes: 'col_4fzaa9iqv0z',
      tops: 'col_d5ybc7qv3b',
      jeans: 'col_959ihwizfv',
      waitcoats: 'col_v7zkbevix6s',
    },
  },
  men: {
    id: 'pcol_01KNC0YTRZGJ5MJWBPKFKXMYVE',
    subcategories: {
      shirts: 'col_vlvodd3v1k',
      tshirts: 'col_hpur805a3ar',
      shoes: 'col_wfdow0w6tl7',
      jeans: 'col_87x5vrgkj6k',
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