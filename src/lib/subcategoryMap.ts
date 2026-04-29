// Collection IDs — updated to Express-era IDs matching database after fix-collection-ids.cjs
export const COLLECTION_IDS = {
  women: {
    id: 'col_f7ab9ebd25600be45eb07e7',
    subcategories: {
      dresses: 'col_9705f9ba21da711154f459a',
      bags: 'col_2e17696ac975edde9ed3c00',
      blouses: 'col_cf549db679f897e799a75de',
      shoes: 'col_69cb18d7093e561fa7df787',
      tops: 'col_00ca9c5f0c7a62c5251bf67',
      jeans: 'col_d4d05f9d842fc98b48e0747',
      waitcoats: 'col_b4e869f373346e44a1c7c86',
      coats: 'col_c6dd022affa9008732b4ebb',
    },
  },
  men: {
    id: 'col_a47aa51904f001d37e0a12c',
    subcategories: {
      shirts: 'col_5150954178a45e745bb0888',
      tshirts: 'col_259c6ed74785243b869398f',
      shoes: 'col_7464720cd7ef065f81c8849',
      jeans: 'col_b7160b4efef8d6536921dc1',
      ties: 'col_e9f3a2b1c8d4756123f048a',
      bowties: 'col_a1b2c3d4e5f6071823456ab',
    },
  },
} as const
