require('dotenv').config();
const pool = require('../db.cjs');

async function fixImagePaths() {
  const result = await pool.query(
    "SELECT id, images FROM products WHERE array_length(images, 1) > 0 AND images[1] LIKE '/product_%'"
  );

  let updated = 0;
  for (const row of result.rows) {
    const fixedImages = row.images.map(img => {
      if (img.startsWith('/product_')) {
        return '/uploads' + img;
      }
      return img;
    });

    await pool.query(
      'UPDATE products SET images = $1 WHERE id = $2',
      [fixedImages, row.id]
    );
    updated++;
  }

  console.log(`Fixed image paths for ${updated} products`);
  await pool.end();
}

fixImagePaths();
