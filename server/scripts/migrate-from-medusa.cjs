/**
 * Migrate products from Medusa's `product` table to Express's `products` table
 *
 * Medusa schema: id, title, handle, subtitle, description, thumbnail, collection_id, metadata, created_at
 * Express schema: id, name, brand, description, price, original_price, discount, promo, rating, reviews,
 *                  images, colors, sizes, types, features, details, category, collection_id, created_at, updated_at
 *
 * Note: Medusa stores products in `product` table (singular), Express uses `products` (plural)
 */

require('dotenv').config();
const { Pool } = require('pg');

const MEDUSA_POOL = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cocomacys',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
});

const EXPRESS_POOL = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cocomacys',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
});

// Map Express collection handles to Medusa collection IDs
// We need to query Medusa's product_collection table to get this mapping
async function getCollectionMapping() {
  const result = await MEDUSA_POOL.query(`
    SELECT pc.id, pc.handle, pc.title
    FROM product_collection pc
    WHERE pc.deleted_at IS NULL
  `);

  const mapping = {};
  result.rows.forEach(row => {
    mapping[row.handle] = row.id;
  });

  console.log('Available Medusa collections:', Object.keys(mapping));
  return mapping;
}

// Get collection ID from handle
function getCollectionIdFromHandle(handle, collectionMapping) {
  // Direct match
  if (collectionMapping[handle]) {
    return collectionMapping[handle];
  }

  // Try with women- or men- prefix
  for (const [key, id] of Object.entries(collectionMapping)) {
    if (key.includes(handle) || handle.includes(key)) {
      return id;
    }
  }

  return null;
}

// Format value for PostgreSQL array column (text[]) - returns proper format
function formatArrayColumn(value) {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return '{}'; // PostgreSQL empty array syntax
  }
  // Escape any special characters and wrap with curly braces
  const escaped = value.map(v => {
    const str = String(v);
    // Escape backslashes and single quotes
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  });
  return `{${escaped.map(v => `'${v}'`).join(',')}}`;
}

// Format value for JSONB column - returns JSON string
function formatJsonbColumn(value) {
  if (!value) return '[]';
  if (Array.isArray(value)) return JSON.stringify(value);
  return JSON.stringify(value);
}

// Map product to Express format
function mapProduct(medusaProduct, collectionMapping) {
  const { title, handle, description, thumbnail, collection_id, metadata, created_at } = medusaProduct;

  // Try to determine brand from handle/title or metadata
  let brand = 'Unknown Brand';
  if (handle) {
    // Try to extract brand from handle (e.g., "mng-shoes" -> "MNG")
    const parts = handle.split('-');
    if (parts.length > 0) {
      brand = parts[0].toUpperCase();
      if (brand === 'MNG') brand = 'MNG';
      else if (brand === 'CALVIN') brand = 'Calvin Klein';
      else if (brand === 'RALPH') brand = 'Ralph Lauren';
      else if (brand === 'TOMMY') brand = 'Tommy Hilfiger';
      else if (brand === 'DKNY') brand = 'DKNY';
      else if (brand === 'MICHAEL') brand = 'Michael Kors';
    }
  }

  // Get price from metadata if available
  const meta = metadata || {};
  let price = meta.price || 99.99;
  let original_price = meta.original_price || null;
  let discount = meta.discount || null;
  let promo = meta.promo || null;
  let rating = meta.rating || 0;
  let reviews = meta.reviews || 0;

  // Format price (Medusa prices are in cents)
  const priceFormatted = price;

  // Determine category from collection
  let category = 'General';
  if (collection_id) {
    // Find the collection handle
    for (const [handle, id] of Object.entries(collectionMapping)) {
      if (id === collection_id) {
        if (handle.includes('women')) category = 'Women';
        else if (handle.includes('men')) category = 'Men';
        else if (handle.includes('dress')) category = 'Dresses';
        else if (handle.includes('shoe')) category = 'Shoes';
        else if (handle.includes('bag')) category = 'Bags';
        else if (handle.includes('top')) category = 'Tops';
        else if (handle.includes('jean')) category = 'Jeans';
        else category = handle;
        break;
      }
    }
  }

  return {
    name: title || 'Unnamed Product',
    brand,
    description: description || '',
    price: priceFormatted,
    original_price: original_price || null,
    discount: discount || null,
    promo: promo || null,
    rating: rating || 0,
    reviews: reviews || 0,
    images: thumbnail ? [thumbnail] : [],
    colors: meta.colors || [],
    sizes: meta.sizes || [],
    types: [],
    features: [],
    details: '',
    category,
    collection_id: collection_id,
    created_at: created_at || new Date(),
    updated_at: new Date(),
  };
}

async function migrateProducts() {
  console.log('Starting product migration from Medusa to Express...\n');

  try {
    // Get collection mapping
    const collectionMapping = await getCollectionMapping();

    // Fetch all products from Medusa
    const medusaProducts = await MEDUSA_POOL.query(`
      SELECT p.id, p.title, p.handle, p.description, p.thumbnail,
             p.collection_id, p.metadata, p.created_at
      FROM product p
      WHERE p.deleted_at IS NULL
      ORDER BY p.created_at DESC
    `);

    console.log(`Found ${medusaProducts.rows.length} products in Medusa\n`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const medusaProduct of medusaProducts.rows) {
      try {
        const expressProduct = mapProduct(medusaProduct, collectionMapping);

        // Check if product already exists (by name + brand)
        const existing = await EXPRESS_POOL.query(
          'SELECT id FROM products WHERE name = $1 AND brand = $2',
          [expressProduct.name, expressProduct.brand]
        );

        if (existing.rows.length > 0) {
          // Update existing
          await EXPRESS_POOL.query(`
            UPDATE products SET
              name = $1, brand = $2, description = $3, price = $4,
              original_price = $5, discount = $6, promo = $7, rating = $8,
              reviews = $9, images = $10, colors = $11, sizes = $12,
              details = $13, category = $14, collection_id = $15, updated_at = NOW()
            WHERE id = $16
          `, [
            expressProduct.name, expressProduct.brand, expressProduct.description,
            expressProduct.price, expressProduct.original_price, expressProduct.discount,
            expressProduct.promo, expressProduct.rating, expressProduct.reviews,
            formatArrayColumn(expressProduct.images),
            formatJsonbColumn(expressProduct.colors),
            formatJsonbColumn(expressProduct.sizes),
            expressProduct.details,
            expressProduct.category, expressProduct.collection_id,
            existing.rows[0].id
          ]);
          console.log(`  UPDATED: ${expressProduct.name} (${expressProduct.brand})`);
        } else {
          // Insert new
          // images and features are text[] (PostgreSQL array), use formatArrayColumn
          // colors, sizes, types are JSONB, use formatJsonbColumn
          await EXPRESS_POOL.query(`
            INSERT INTO products (name, brand, description, price, original_price, discount,
              promo, rating, reviews, images, colors, sizes, types, features, details,
              category, collection_id, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
          `, [
            expressProduct.name, expressProduct.brand, expressProduct.description,
            expressProduct.price, expressProduct.original_price, expressProduct.discount,
            expressProduct.promo, expressProduct.rating, expressProduct.reviews,
            formatArrayColumn(expressProduct.images),
            formatJsonbColumn(expressProduct.colors),
            formatJsonbColumn(expressProduct.sizes),
            formatJsonbColumn(expressProduct.types),
            formatArrayColumn(expressProduct.features),
            expressProduct.details,
            expressProduct.category, expressProduct.collection_id,
            expressProduct.created_at, expressProduct.updated_at
          ]);
          console.log(`  INSERTED: ${expressProduct.name} (${expressProduct.brand})`);
        }
        migrated++;
      } catch (err) {
        console.error(`  ERROR migrating ${medusaProduct.title}: ${err.message}`);
        errors++;
      }
    }

    console.log(`\n=== Migration Complete ===`);
    console.log(`Migrated: ${migrated}`);
    console.log(`Errors: ${errors}`);

    // Verify
    const expressCount = await EXPRESS_POOL.query('SELECT COUNT(*) as count FROM products');
    console.log(`\nTotal products in Express: ${expressCount.rows[0].count}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await MEDUSA_POOL.end();
    await EXPRESS_POOL.end();
    process.exit(0);
  }
}

migrateProducts();
