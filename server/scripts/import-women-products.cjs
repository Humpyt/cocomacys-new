// Import women's products from CSV on Desktop
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const pool = require('../db.cjs');

const CSV_PATH = 'C:\\Users\\Cavemo\\Desktop\\New folder\\ecommerce_products\\women_products.csv';
const IMAGES_BASE = 'C:\\Users\\Cavemo\\Desktop\\New folder\\ecommerce_products';
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

async function copyImages(srcPaths, gender, productName) {
  const paths = srcPaths.split('|').filter(Boolean);
  const result = [];
  for (const p of paths) {
    const trimmed = p.trim();
    const src = path.join(IMAGES_BASE, trimmed);
    if (!fs.existsSync(src)) {
      console.log(`  SKIP: image not found: ${src}`);
      continue;
    }
    const timestamp = Date.now();
    const dirName = `${gender.toLowerCase()}_${slugify(productName)}_${timestamp}`;
    const destDir = path.join(UPLOADS_DIR, dirName);
    fs.mkdirSync(destDir, { recursive: true });
    const fileName = path.basename(trimmed);
    const destPath = path.join(destDir, fileName);
    fs.copyFileSync(src, destPath);
    result.push(`/uploads/${dirName}/${fileName}`);
  }
  return result;
}

async function main() {
  const rows = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Found ${rows.length} products in CSV\n`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const name = (row.product_name || '').trim();
    const price = parseFloat(row.price);
    const brand = (row.brand || '').trim();
    const gender = (row.gender || 'Women').trim();
    const rawCategory = (row.category || 'dresses').trim();
    const category = `${gender.toLowerCase()}_${rawCategory.toLowerCase()}`;
    const shortDesc = (row.short_description || '').trim();
    const longDesc = (row.long_description || '').trim();
    const colors = row.color ? [row.color.trim()] : [];
    const sizes = row.size
      ? row.size.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const imagePathsRaw = (row.image_paths || '').trim();

    if (!name || isNaN(price)) {
      console.log(`SKIP: ${name || 'UNKNOWN'} — missing name or price`);
      skipped++;
      continue;
    }

    process.stdout.write(`${name} (${brand}) — USh ${price.toLocaleString()}... `);

    // Copy images
    const imagePaths = imagePathsRaw ? await copyImages(imagePathsRaw, gender, name) : [];

    // Check if product already exists
    const existing = await pool.query(
      'SELECT * FROM products WHERE name = $1 AND price = $2',
      [name, price]
    );

    if (existing.rows.length > 0) {
      const prod = existing.rows[0];
      const mergedColors = [...new Set([...(prod.colors || []), ...colors])];
      const mergedSizes = [...new Set([...(prod.sizes || []), ...sizes])];
      const mergedImages = [...new Set([...(prod.images || []), ...imagePaths])];

      await pool.query(
        `UPDATE products SET colors = $1, sizes = $2, images = $3, updated_at = NOW() WHERE id = $4`,
        [JSON.stringify(mergedColors), JSON.stringify(mergedSizes), mergedImages, prod.id]
      );
      console.log('UPDATED');
      updated++;
    } else {
      await pool.query(
        `INSERT INTO products (name, brand, description, details, price, category, colors, sizes, images, rating, reviews)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [name, brand, shortDesc, longDesc, price, category,
         JSON.stringify(colors), JSON.stringify(sizes), imagePaths,
         0, 0]
      );
      console.log('INSERTED');
      inserted++;
    }
  }

  console.log(`\nDone: ${inserted} inserted, ${updated} updated, ${skipped} skipped`);
  await pool.end();
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
