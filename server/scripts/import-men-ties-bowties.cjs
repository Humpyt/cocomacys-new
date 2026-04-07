/**
 * Import ties and bow-ties products from men-update/Men directory.
 *
 * Reads men-update/Men/men_products.csv, copies images to /uploads/,
 * creates the ties and bow-ties collections, and inserts products.
 *
 * Usage: node server/scripts/import-men-ties-bowties.cjs
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../db.cjs');
const csv = require('csv-parser');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const SOURCE_DIR = path.join(__dirname, '../../men-update/Men');
const CSV_PATH = path.join(SOURCE_DIR, 'men_products.csv');

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function copyProductImages(imagePathsStr, productName, productId) {
  if (!imagePathsStr || !imagePathsStr.trim()) return [];

  // imagePaths look like: product_images\Men\ties_alfani_38\image_1.jpeg|product_images\Men\ties_alfani_38\image_2.jpeg
  // The folder name we need is: ties_alfani_38
  const rawPaths = imagePathsStr.split('|').filter(p => p.trim());
  const importedPaths = [];

  for (const p of rawPaths) {
    const cleanPath = p.trim().replace(/\\/g, '/');
    // Extract folder name: product_images/Men/ties_alfani_38/image_1.jpeg -> ties_alfani_38
    const parts = cleanPath.split('/');
    const folderName = parts[parts.length - 2]; // second-to-last is the folder
    const fileName = parts[parts.length - 1];

    // Look for the folder directly in SOURCE_DIR
    const srcDir = path.join(SOURCE_DIR, folderName);
    const srcFile = path.join(srcDir, fileName);

    const dirName = `${slugify(productName)}_${productId}`;
    const destDir = path.join(UPLOADS_DIR, dirName);

    if (fs.existsSync(srcDir)) {
      fs.mkdirSync(destDir, { recursive: true });
      if (fs.existsSync(srcFile)) {
        const destPath = path.join(destDir, fileName);
        fs.copyFileSync(srcFile, destPath);
        importedPaths.push(`/uploads/${dirName}/${fileName}`);
      } else {
        // Try finding any image in that folder
        const files = fs.readdirSync(srcDir).filter(f => /\.(jpeg|jpg|png)$/i.test(f));
        if (files.length > 0) {
          const destPath = path.join(destDir, files[0]);
          fs.copyFileSync(path.join(srcDir, files[0]), destPath);
          importedPaths.push(`/uploads/${dirName}/${files[0]}`);
        } else {
          console.warn(`  [WARN] No images found in folder: ${srcDir}`);
        }
      }
    } else {
      console.warn(`  [WARN] Folder not found: ${srcDir}`);
    }
  }

  return importedPaths;
}

async function createCollection(title, handle) {
  const existing = await pool.query('SELECT id FROM collections WHERE handle = $1', [handle]);
  if (existing.rows.length > 0) {
    console.log(`  Collection "${title}" already exists: ${existing.rows[0].id}`);
    return existing.rows[0].id;
  }

  const result = await pool.query(
    'INSERT INTO collections (title, handle) VALUES ($1, $2) RETURNING id',
    [title, handle]
  );
  console.log(`  Created collection "${title}": ${result.rows[0].id}`);
  return result.rows[0].id;
}

async function upsertProduct(product, collectionId) {
  const {
    product_name, brand, category, size, color,
    price, short_description, long_description, image_paths
  } = product;

  const colors = color ? [color.trim()] : [];
  const sizes = size
    ? size.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const importedImages = copyProductImages(image_paths, product_name, product.id);

  const existing = await pool.query(
    'SELECT id, colors, sizes, images FROM products WHERE name = $1 AND price = $2',
    [(product_name ?? '').trim(), parseFloat(price)]
  );

  if (existing.rows.length > 0) {
    const prod = existing.rows[0];
    const mergedColors = [...new Set([...(prod.colors || []), ...colors])];
    const mergedSizes = [...new Set([...(prod.sizes || []), ...sizes])];
    const mergedImages = [...new Set([...(prod.images || []), ...importedImages])];

    await pool.query(`
      UPDATE products SET
        colors = $1, sizes = $2, images = $3, updated_at = NOW(), collection_id = $4
      WHERE id = $5
    `, [
      JSON.stringify(mergedColors),
      JSON.stringify(mergedSizes),
      mergedImages,
      collectionId,
      prod.id
    ]);
    return 'updated';
  } else {
    await pool.query(`
      INSERT INTO products
        (name, brand, description, details, price, category, colors, sizes, images, rating, reviews, collection_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      (product_name ?? '').trim(),
      brand?.trim() || '',
      short_description?.trim() || '',
      long_description?.trim() || '',
      parseFloat(price),
      category,
      JSON.stringify(colors),
      JSON.stringify(sizes),
      importedImages,
      0,
      0,
      collectionId
    ]);
    return 'inserted';
  }
}

async function importCSV(csvPath) {
  const results = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', row => results.push(row))
      .on('end', resolve)
      .on('error', reject);
  });
  return results;
}

async function main() {
  console.log('=== Import Ties & Bow-ties from men-update ===\n');

  // Create collections
  console.log('Creating collections...');
  const tiesCollectionId = await createCollection('Ties', 'men-ties');
  const bowtiesCollectionId = await createCollection('Bow-ties', 'men-bowties');
  console.log('');

  const rows = await importCSV(CSV_PATH);
  console.log(`Total rows in CSV: ${rows.length}\n`);

  // Filter to ties and bow-ties only
  const tiesRows = rows.filter(r => r.category === 'ties');
  const bowtiesRows = rows.filter(r => r.category === 'bow-ties');

  console.log(`Ties products: ${tiesRows.length}`);
  console.log(`Bow-tie products: ${bowtiesRows.length}\n`);

  const summary = { inserted: 0, updated: 0, skipped: 0, errors: 0 };

  // Import ties
  console.log('Importing ties...');
  for (const row of tiesRows) {
    try {
      const result = await upsertProduct(row, tiesCollectionId);
      if (result === 'inserted') { summary.inserted++; console.log(`  + ${row.product_name}`); }
      else if (result === 'updated') { summary.updated++; console.log(`  U ${row.product_name}`); }
    } catch (err) {
      summary.errors++;
      console.error(`  [ERROR] ${row.product_name}: ${err.message}`);
    }
  }

  // Import bow-ties
  console.log('\nImporting bow-ties...');
  for (const row of bowtiesRows) {
    try {
      const result = await upsertProduct(row, bowtiesCollectionId);
      if (result === 'inserted') { summary.inserted++; console.log(`  + ${row.product_name}`); }
      else if (result === 'updated') { summary.updated++; console.log(`  U ${row.product_name}`); }
    } catch (err) {
      summary.errors++;
      console.error(`  [ERROR] ${row.product_name}: ${err.message}`);
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Inserted: ${summary.inserted}`);
  console.log(`Updated:  ${summary.updated}`);
  console.log(`Errors:    ${summary.errors}`);

  const { rows: countRows } = await pool.query('SELECT COUNT(*) as count FROM products');
  console.log(`\nTotal products in DB: ${countRows[0].count}`);

  await pool.end();
  process.exit(summary.errors > 0 ? 1 : 0);
}

main().catch(err => { console.error(err); process.exit(1); });
