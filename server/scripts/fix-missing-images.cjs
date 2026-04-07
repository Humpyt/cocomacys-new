/**
 * fix-missing-images.cjs
 *
 * Fixes products with empty images by matching image files in
 * ecommerce_products_for_developer/public/Products/ to products in the DB.
 *
 * Images are matched by brand name and product type (shoes, shirts, dresses, etc.)
 * and copied to /uploads/ with a unique filename.
 *
 * Usage: node server/scripts/fix-missing-images.cjs
 */

const fs = require('fs');
const path = require('path');

const DB = require('../db.cjs');

const ECOMMERCE_BASE = path.join(__dirname, '../../ecommerce_products_for_developer');
const PUBLIC_PRODUCTS = path.join(ECOMMERCE_BASE, 'public/Products');
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// ─── Helpers ────────────────────────────────────────────────────────────────

function endsWith(str, suffix) {
  return str && suffix && str.toLowerCase().endsWith(suffix.toLowerCase());
}

function getProductsBaseType(category, name = '') {
  if (!category) return null;
  const c = category.toLowerCase();
  if (c === 'men' || c === 'women') {
    // Infer product type from name for top-level categories
    const combined = (name || '').toLowerCase();
    if (combined.includes('shoe')) return 'shoes';
    if (combined.includes('shirt')) return 'shirts';
    if (combined.includes('t-shirt') || combined.includes('tshirt')) return 'tshirts';
    if (combined.includes('jean')) return 'jeans';
    if (combined.includes('dress')) return 'dresses';
    if (combined.includes('blouse')) return 'blouses';
    if (combined.includes('bag') || combined.includes('handbag')) return 'bags';
    if (combined.includes('waistcoat') || combined.includes('waist-coat')) return 'waistcoats';
    return null;
  }
  if (c.includes('shirt')) return 'shirts';
  if (c.includes('t-shirt') || c.includes('tshirt')) return 'tshirts';
  if (c.includes('shoe')) return 'shoes';
  if (c.includes('jean')) return 'jeans';
  if (c.includes('dress')) return 'dresses';
  if (c.includes('blouse') || c.includes('top')) return 'blouses';
  if (c.includes('bag')) return 'bags';
  if (c.includes('waistcoat') || c.includes('waist-coat')) return 'waistcoats';
  return null;
}

// Normalize brand name for matching
function normalizeBrand(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

// Check if image filename matches a product's brand
function brandMatchesImage(brand, imgFilename) {
  if (!brand) return false;
  const normBrand = normalizeBrand(brand);
  const normImg = normalizeBrand(imgFilename);

  // Direct contains check
  if (normImg.includes(normBrand) || normBrand.includes(normImg)) return true;

  // Known aliases
  const aliases = {
    'polo ralph lauren': ['polo'],
    'ralph lauren': ['polo'],
    'charles tyrwhitt': ['charles tyrwhitt', 'charles'],
    'hawes & curtis': ['hawes & curtis', 'hawes'],
    'dresse the population': ['dresse', 'dresse the population'],
    'betsey johnson': ['betsey johnson', 'besty johnson'],
    'vince camuto': ['vince camuto', 'vince'],
    'tommy hilfiger': ['tommy hilfiger', 'tommy'],
    'nine west': ['nine west', 'nine'],
    'style & co': ['style & co', 'style &amp; co', 'style'],
    'on.34th': ['on.34th', 'on 34th', 'on.34th'],
    'stacy adams': ['stacy adams', 'stacy'],
    'steve madden': ['steve madden'],
    'calvin klein': ['calvin klein', 'calvin'],
    'donna karan': ['donna karan'],
    'anne klein': ['anne klein'],
    'karl lagerfeld': ['karl lagerfeld'],
  };

  const variants = aliases[normBrand] || [normBrand];
  return variants.some(v => normImg.includes(v) || v.includes(normImg.split(' ')[0]));
}

// ─── Image-to-product mapping ───────────────────────────────────────────────

const IMAGE_DIRS = {
  men: {
    shoes: path.join(PUBLIC_PRODUCTS, 'Men/shoes'),
    shirts: path.join(PUBLIC_PRODUCTS, 'Men/Shirts'),
    tshirts: path.join(PUBLIC_PRODUCTS, 'Men/T-Shirts'),
    jeans: path.join(PUBLIC_PRODUCTS, 'Men/jeans'),
  },
  women: {
    shoes: path.join(PUBLIC_PRODUCTS, 'Women/shoes'),
    dresses: path.join(PUBLIC_PRODUCTS, 'Women/dresses'),
    blouses: path.join(PUBLIC_PRODUCTS, 'Women/blouses'),
    bags: path.join(PUBLIC_PRODUCTS, 'Women/bags'),
    waistcoats: path.join(PUBLIC_PRODUCTS, 'Women/waist-coats'),
  }
};

// Build a list of all available image files by category
function getAvailableImages() {
  const images = { men: {}, women: {} };

  for (const [gender, categories] of Object.entries(IMAGE_DIRS)) {
    for (const [prodType, dir] of Object.entries(categories)) {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir).filter(f =>
        !f.startsWith('.') && !f.endsWith('.json') && !f.endsWith('.gitkeep')
      );
      images[gender][prodType] = files.map(f => path.join(dir, f));
    }
  }

  return images;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Fix Missing Product Images ===\n');

  const availableImages = getAvailableImages();
  console.log('Available images by type:');
  for (const [gender, categories] of Object.entries(availableImages)) {
    for (const [type, files] of Object.entries(categories)) {
      console.log(`  ${gender}/${type}: ${files.length} images`);
    }
  }
  console.log();

  const uploadsDir = UPLOADS_DIR;
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Get products with empty images
  const emptyResult = await DB.query(`
    SELECT id, name, brand, category
    FROM products
    WHERE images = '{}' OR array_length(images, 1) IS NULL
    ORDER BY category, brand, name
  `);

  console.log(`Found ${emptyResult.rows.length} products with empty images\n`);

  if (emptyResult.rows.length === 0) {
    console.log('No products need fixing. Exiting.');
    await DB.end();
    return;
  }

  let updated = 0;
  let skipped = 0;

  // Track which images we've assigned per brand per type to spread them around
  const usedByBrand = {};

  for (const product of emptyResult.rows) {
    const { id, name, brand, category } = product;
    const gender = category === 'Men' ? 'men' : category === 'Women' ? 'women' : null;
    const prodType = getProductsBaseType(category, name);

    if (!gender || !prodType) {
      skipped++;
      continue;
    }

    const imagesForType = availableImages[gender]?.[prodType] || [];
    if (imagesForType.length === 0) {
      skipped++;
      continue;
    }

    // Try to find an image by brand match
    let matchedFile = null;
    const brandKey = normalizeBrand(brand) + '_' + prodType;

    if (brand) {
      // First try: find brand-exact match not yet used by this brand
      for (const imgPath of imagesForType) {
        const imgBasename = path.basename(imgPath);
        if (brandMatchesImage(brand, imgBasename)) {
          // Track usage per brand to spread images around
          if (!usedByBrand[brandKey]) usedByBrand[brandKey] = 0;
          if (usedByBrand[brandKey] < 2) {
            matchedFile = imgPath;
            usedByBrand[brandKey]++;
            break;
          }
        }
      }

      // Second try: any brand match (even if already used by this brand)
      if (!matchedFile) {
        for (const imgPath of imagesForType) {
          const imgBasename = path.basename(imgPath);
          if (brandMatchesImage(brand, imgBasename)) {
            matchedFile = imgPath;
            break;
          }
        }
      }
    }

    // Final fallback: any image of this product type
    if (!matchedFile) {
      matchedFile = imagesForType[0];
    }

    if (!matchedFile) {
      skipped++;
      continue;
    }

    // Copy image to uploads/
    const ext = path.extname(matchedFile);
    const safeName = `product_${id}_${Date.now()}${ext}`;
    const destPath = path.join(uploadsDir, safeName);

    try {
      fs.copyFileSync(matchedFile, destPath);
    } catch (err) {
      console.error(`  Failed to copy ${matchedFile}: ${err.message}`);
      skipped++;
      continue;
    }

    const imagePath = `/${safeName}`;

    await DB.query(
      `UPDATE products SET images = ARRAY[$1]::text[], updated_at = NOW() WHERE id = $2`,
      [imagePath, id]
    );

    updated++;
    console.log(`  [${id}] ${brand} ${name} → ${imagePath}`);
  }

  console.log(`\nDone: ${updated} products updated, ${skipped} skipped (no matching images found)`);
  await DB.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  DB.end();
  process.exit(1);
});
