/**
 * Update collection_id on products imported from CSV.
 *
 * Products imported via import-csv-products.cjs have a `category` column
 * like 'men_jeans', 'women_dresses' but their collection_id is NULL.
 * This script maps those categories to the correct collection IDs.
 *
 * Usage: node server/scripts/update-csv-collection-ids.cjs
 */

require('dotenv').config();
const pool = require('../db.cjs');

// Map CSV category (imported as category column) -> collection ID
const categoryToCollectionId = {
  men_jeans:      'col_74bb9be9cd10be2ee887a8e',
  men_shirts:     'col_ffd9fd01d18dcef0b63ffca',
  men_shoes:      'col_5818db7ca7ac573c2082a02',
  'men_t-shirts':   'col_98b6d5a172ebdfdb3250622',
  women_bags:     'col_4c8dcf619e2c55773345601',
  women_blouses:  'col_c0cd31e98ad00905e6f2873',
  women_dresses:  'col_69af05c60590b95d99e809c',
  women_shoes:    'col_877b745c118251a37b9c2ee',
  'women_waist-coats': 'col_db3ca016e002339afc5e22d',
  women_tops:     'col_fa23fdaf72757ede5fa8dfe',
  women_jeans:    'col_4b78af1e8cd5e6f1a0db5ea',
};

async function main() {
  console.log('=== Update collection_id for CSV products ===\n');

  let totalUpdated = 0;

  for (const [category, collectionId] of Object.entries(categoryToCollectionId)) {
    const result = await pool.query(
      'UPDATE products SET collection_id = $1 WHERE category = $2 AND collection_id IS NULL RETURNING id, name',
      [collectionId, category]
    );
    if (result.rowCount > 0) {
      console.log(`  [${category}] -> ${collectionId.substring(0, 15)}... (${result.rowCount} products)`);
      totalUpdated += result.rowCount;
    }
  }

  // Also fix products whose category is exactly 'Men' or 'Women' (top-level)
  const menResult = await pool.query(
    "UPDATE products SET collection_id = 'col_51a5bd36f91f6dbfc6e1e63' WHERE category = 'Men' AND collection_id IS NULL RETURNING id",
    []
  );
  if (menResult.rowCount > 0) console.log(`  [Men] -> col_51a5bd36f91f6dbfc6e1e63 (${menResult.rowCount} products)`);
  totalUpdated += menResult.rowCount;

  const womenResult = await pool.query(
    "UPDATE products SET collection_id = 'col_fe3b00e52346f2ca4295980' WHERE category = 'Women' AND collection_id IS NULL RETURNING id",
    []
  );
  if (womenResult.rowCount > 0) console.log(`  [Women] -> col_fe3b00e52346f2ca4295980 (${womenResult.rowCount} products)`);
  totalUpdated += womenResult.rowCount;

  console.log(`\nTotal updated: ${totalUpdated}`);

  // Verify
  const distResult = await pool.query(
    "SELECT collection_id, COUNT(*) as cnt FROM products WHERE collection_id IS NOT NULL GROUP BY collection_id ORDER BY cnt DESC"
  );
  console.log('\nDistribution:');
  distResult.rows.forEach(r => console.log(`  ${r.collection_id}: ${r.cnt}`));

  const nullResult = await pool.query("SELECT COUNT(*) as cnt FROM products WHERE collection_id IS NULL");
  console.log(`\nProducts still without collection_id: ${nullResult.rows[0].cnt}`);

  await pool.end();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
