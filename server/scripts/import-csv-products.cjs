/**
 * Import products + images from ecommerce_products_for_developer CSV files.
 *
 * Reads men_products.csv and women_products.csv, copies images to /uploads/,
 * and inserts/updates product rows in the database.
 *
 * Usage: node server/scripts/import-csv-products.cjs
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../db.cjs');
const csv = require('csv-parser');

const ECOMMERCE_BASE = path.join(__dirname, '../../ecommerce_products_for_developer');
const CSV_IMAGES_BASE = path.join(ECOMMERCE_BASE, 'product_images');
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

const MEN_CSV = path.join(ECOMMERCE_BASE, 'men_products.csv');
const WOMEN_CSV = path.join(ECOMMERCE_BASE, 'women_products.csv');

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function normalizeBackslash(str) {
  return str.replace(/\\/g, '/');
}

/**
 * Try to find an image file by fuzzy-matching the folder name.
 * The CSV paths sometimes have slight differences from actual folder names
 * (e.g., truncated names, missing/extra underscores, price embedded differently).
 */
function findImageFolder(basePath, csvFolderName) {
  // Try exact path first
  const exact = path.join(basePath, csvFolderName);
  if (fs.existsSync(exact)) return exact;

  // csvFolderName looks like: "Men/levis_dark_blue_jeans_sizes_31x3240x3438x34and40x32_350-380k_1"
  // Try matching just the folder name (last segment) against directories in basePath
  const parts = csvFolderName.split('/');
  const folderName = parts[parts.length - 1];
  const genderFolder = parts.length > 1 ? parts[0] : null;
  const searchBase = genderFolder ? path.join(basePath, genderFolder) : basePath;

  if (!fs.existsSync(searchBase)) return null;

  const candidates = fs.readdirSync(searchBase).filter(f => {
    return fs.statSync(path.join(searchBase, f)).isDirectory();
  });

  // 1) Exact-ish match (ignore case, ignore _jpeg vs _jpg)
  const normalized = folderName.toLowerCase().replace(/_jpeg$/, '_jpg').replace(/\.jpeg$/, '.jpg');
  for (const cand of candidates) {
    const cNorm = cand.toLowerCase().replace(/_jpeg$/, '_jpg').replace(/\.jpeg$/, '.jpg');
    if (cNorm === normalized) return path.join(searchBase, cand);
  }

  // 2) Check if the CSV folder name is a prefix of the candidate
  for (const cand of candidates) {
    const cNorm = cand.toLowerCase().replace(/_jpeg$/, '_jpg').replace(/\.jpeg$/, '.jpg');
    if (cNorm.startsWith(normalized) || normalized.startsWith(cNorm)) {
      return path.join(searchBase, cand);
    }
  }

  // 3) Try matching by the first few words (brand + key product name parts)
  const folderLower = folderName.toLowerCase();
  for (const cand of candidates) {
    const candLower = cand.toLowerCase();
    // Extract first 2 "words" (non-digit, non-size sequences)
    const words = folderLower.split(/[_\s]+/).filter(w => w.length > 3 && !/^\d/.test(w));
    if (words.length >= 2 && words.slice(0, 2).every(w => candLower.includes(w))) {
      return path.join(searchBase, cand);
    }
  }

  return null;
}

function copyProductImages(imagePathsStr, gender, productName, productId) {
  if (!imagePathsStr || !imagePathsStr.trim()) return [];

  const dirName = `${gender.toLowerCase()}_${slugify(productName)}_${productId}`;
  const destDir = path.join(UPLOADS_DIR, dirName);
  fs.mkdirSync(destDir, { recursive: true });

  const rawPaths = imagePathsStr.split('|').filter(p => p.trim());
  const importedPaths = [];

  for (const p of rawPaths) {
    const cleanPath = p.trim();
    // Normalize backslashes to forward slashes
    const normalizedPath = normalizeBackslash(cleanPath);
    // Strip "product_images/" prefix if present
    const relativePath = normalizedPath.replace(/^product_images\//, '');
    const src = path.join(CSV_IMAGES_BASE, relativePath);

    if (fs.existsSync(src)) {
      const fileName = path.basename(src);
      const destPath = path.join(destDir, fileName);
      fs.copyFileSync(src, destPath);
      importedPaths.push(`/uploads/${dirName}/${fileName}`);
    } else {
      // Try fuzzy matching
      const parts = relativePath.split('/');
      const folderSearch = parts.slice(0, parts.length - 1).join('/');
      const foundFolder = findImageFolder(CSV_IMAGES_BASE, folderSearch);
      if (foundFolder) {
        const fileName = path.basename(src);
        const fuzzySrc = path.join(foundFolder, fileName);
        if (fs.existsSync(fuzzySrc)) {
          const destPath = path.join(destDir, fileName);
          fs.copyFileSync(fuzzySrc, destPath);
          importedPaths.push(`/uploads/${dirName}/${fileName}`);
          continue;
        }
        // Try same folder with any image file
        const files = fs.readdirSync(foundFolder).filter(f => /\.(jpeg|jpg|png)$/i.test(f));
        if (files.length > 0) {
          const fuzzySrc2 = path.join(foundFolder, files[0]);
          const destPath = path.join(destDir, files[0]);
          fs.copyFileSync(fuzzySrc2, destPath);
          importedPaths.push(`/uploads/${dirName}/${files[0]}`);
          continue;
        }
      }
      console.warn(`  [WARN] Image not found: ${src}`);
    }
  }

  return importedPaths;
}

function formatArrayColumn(value) {
  if (!value || !Array.isArray || value.length === 0) return '{}';
  const escaped = value.map(v => String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'"));
  return `{${escaped.map(v => `'${v}'`).join(',')}}`;
}

function formatJsonbColumn(value) {
  if (!value) return '[]';
  if (Array.isArray(value)) return JSON.stringify(value);
  return JSON.stringify(value);
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

async function upsertProduct(product) {
  const {
    id, product_name, brand, category, gender, size, color,
    price, short_description, long_description, image_paths
  } = product;

  const categorySlug = gender && category
    ? `${gender.toLowerCase()}_${category.trim().toLowerCase()}`
    : (category?.trim() || '');

  const colors = color ? [color.trim()] : [];
  const sizes = size
    ? size.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const importedImages = copyProductImages(image_paths, gender, product_name, id);

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
        colors = $1, sizes = $2, images = $3, updated_at = NOW()
      WHERE id = $4
    `, [
      JSON.stringify(mergedColors),
      JSON.stringify(mergedSizes),
      mergedImages,
      prod.id
    ]);
    return 'updated';
  } else {
    await pool.query(`
      INSERT INTO products
        (name, brand, description, details, price, category, colors, sizes, images, rating, reviews)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      (product_name ?? '').trim(), brand?.trim() || '', short_description?.trim() || '',
      long_description?.trim() || '', parseFloat(price), categorySlug,
      JSON.stringify(colors), JSON.stringify(sizes), importedImages,
      0, 0
    ]);
    return 'inserted';
  }
}

async function main() {
  console.log('=== CSV Product Import ===\n');

  const menRows = await importCSV(MEN_CSV);
  const womenRows = await importCSV(WOMEN_CSV);
  console.log(`Men: ${menRows.length} products | Women: ${womenRows.length} products\n`);

  const summary = { inserted: 0, updated: 0, skipped: 0, errors: 0 };

  for (const row of menRows) {
    try {
      const result = await upsertProduct(row);
      if (result === 'inserted') { summary.inserted++; process.stdout.write('+'); }
      else if (result === 'updated') { summary.updated++; process.stdout.write('U'); }
    } catch (err) {
      summary.errors++;
      console.error(`\n  [ERROR] ${row.product_name}: ${err.message}`);
    }
  }

  for (const row of womenRows) {
    try {
      const result = await upsertProduct(row);
      if (result === 'inserted') { summary.inserted++; process.stdout.write('+'); }
      else if (result === 'updated') { summary.updated++; process.stdout.write('U'); }
    } catch (err) {
      summary.errors++;
      console.error(`\n  [ERROR] ${row.product_name}: ${err.message}`);
    }
  }

  console.log('\n');
  console.log(`=== Summary ===`);
  console.log(`Inserted: ${summary.inserted}`);
  console.log(`Updated:  ${summary.updated}`);
  console.log(`Errors:    ${summary.errors}`);

  const { rows } = await pool.query('SELECT COUNT(*) as count FROM products');
  console.log(`\nTotal products in DB: ${rows[0].count}`);

  await pool.end();
  process.exit(summary.errors > 0 ? 1 : 0);
}

main().catch(err => { console.error(err); process.exit(1); });
