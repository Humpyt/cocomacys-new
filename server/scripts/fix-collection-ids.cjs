require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cocomacys',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
});

// Map of Medusa collection IDs to Express collection IDs
const medusaToExpressMap = {
  'pcol_01KNC0YTRA3X7VDBVE7TNBMPSM': 'col_fe3b00e52346f2ca4295980',
  'col_c38n5314q7': 'col_69af05c60590b95d99e809c',
  'col_tr0vvrizgv': 'col_4c8dcf619e2c55773345601',
  'col_zg0eh6rvgtb': 'col_c0cd31e98ad00905e6f2873',
  'col_4fzaa9iqv0z': 'col_877b745c118251a37b9c2ee',
  'col_d5ybc7qv3b': 'col_fa23fdaf72757ede5fa8dfe',
  'col_959ihwizfv': 'col_4b78af1e8cd5e6f1a0db5ea',
  'col_v7zkbevix6s': 'col_db3ca016e002339afc5e22d',
  'pcol_01KNC0YTRZGJ5MJWBPKFKXMYVE': 'col_51a5bd36f91f6dbfc6e1e63',
  'col_vlvodd3v1k': 'col_ffd9fd01d18dcef0b63ffca',
  'col_hpur805a3ar': 'col_98b6d5a172ebdfdb3250622',
  'col_wfdow0w6tl7': 'col_5818db7ca7ac573c2082a02',
  'col_87x5vrgkj6k': 'col_74bb9be9cd10be2ee887a8e',
};

async function fixCollectionIds() {
  let updated = 0;
  for (const [medusaId, expressId] of Object.entries(medusaToExpressMap)) {
    const result = await pool.query(
      'UPDATE products SET collection_id = $1 WHERE collection_id = $2',
      [expressId, medusaId]
    );
    if (result.rowCount > 0) {
      console.log(`Updated ${result.rowCount} products: ${medusaId.substring(0, 15)}... -> ${expressId.substring(0, 15)}...`);
      updated += result.rowCount;
    }
  }
  console.log(`\nTotal updated: ${updated}`);

  // Verify
  const distResult = await pool.query('SELECT DISTINCT collection_id, COUNT(*) as cnt FROM products GROUP BY collection_id ORDER BY cnt DESC');
  console.log('\nNew distribution:');
  distResult.rows.forEach(r => console.log(`  ${r.collection_id}: ${r.cnt}`));

  await pool.end();
  process.exit(0);
}

fixCollectionIds().catch(e => { console.error(e); process.exit(1); });
