require('dotenv').config();
const pool = require('../db.cjs');

async function fixQuotedPaths() {
  // Strip leading/trailing single quotes from all image paths stored in TEXT[]
  // PostgreSQL array: trim both leading and trailing single quotes from each element
  const result = await pool.query(`
    UPDATE products
    SET images = (
      SELECT ARRAY_AGG(trim(BOTH '''' FROM img)::text)
      FROM unnest(products.images) AS img
    )
    WHERE array_length(images, 1) > 0
    AND (images[1] LIKE '''%')
    RETURNING id, name, images[1]
  `);

  console.log('Fixed quoted paths for:', result.rowCount, 'products');
  if (result.rows.length > 0) {
    console.log('Sample after fix:', result.rows[0]);
  }
  await pool.end();
}

fixQuotedPaths();
