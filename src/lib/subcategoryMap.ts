// Collection IDs — updated to Express-era IDs matching database after fix-collection-ids.cjs
export const COLLECTION_IDS = {
  women: {
    id: 'col_fe3b00e52346f2ca4295980',
    subcategories: {
      dresses: 'col_69af05c60590b95d99e809c',
      bags: 'col_4c8dcf619e2c55773345601',
      blouses: 'col_c0cd31e98ad00905e6f2873',
      shoes: 'col_877b745c118251a37b9c2ee',
      tops: 'col_877b745c118251a37b9c2ee',
      jeans: 'col_4b78af1e8cd5e6f1a0db5ea',
      waitcoats: 'col_db3ca016e002339afc5e22d',
    },
  },
  men: {
    id: 'col_51a5bd36f91f6dbfc6e1e63',
    subcategories: {
      shirts: 'col_ffd9fd01d18dcef0b63ffca',
      tshirts: 'col_98b6d5a172ebdfdb3250622',
      shoes: 'col_5818db7ca7ac573c2082a02',
      jeans: 'col_74bb9be9cd10be2ee887a8e',
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