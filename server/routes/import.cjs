const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pool = require('../db.cjs');
const requireAuth = require('../middleware/requireAuth.cjs');
const csv = require('csv-parser');
const XLSX = require('xlsx');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const CSV_IMAGES_BASE = path.join(__dirname, '../../ecommerce_products_for_developer/product_images');

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

async function copyImage(srcPath, gender, productName) {
  const src = path.join(CSV_IMAGES_BASE, srcPath);
  if (!fs.existsSync(src)) {
    return null;
  }

  const timestamp = Date.now();
  const dirName = `${gender.toLowerCase()}_${slugify(productName)}_${timestamp}`;
  const destDir = path.join(UPLOADS_DIR, dirName);
  fs.mkdirSync(destDir, { recursive: true });

  const fileName = path.basename(srcPath);
  const destPath = path.join(destDir, fileName);

  fs.copyFileSync(src, destPath);
  return `/uploads/${dirName}/${fileName}`;
}

// GET /api/import/template — download empty CSV template
router.get('/template', requireAuth, (req, res) => {
  const headers = 'product_name,price,brand,gender,category,short_description,long_description,color,size,image_paths';
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="import_template.csv"');
  res.send(headers + '\n');
});

router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];
  const summary = { inserted: 0, updated: 0, skipped: 0, errors: [] };

  const ext = path.extname(req.file.originalname).toLowerCase();
  const isExcel = ext === '.xlsx' || ext === '.xls';

  if (isExcel) {
    try {
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      results.push(...jsonData);
    } catch (err) {
      return res.status(400).json({ error: `Failed to parse Excel file: ${err.message}` });
    }
  } else {
    const bufferStr = req.file.buffer.toString('utf-8');
    await new Promise((resolve, reject) => {
      const stream = require('stream');
      const s = new stream.Readable();
      s.push(bufferStr);
      s.push(null);

      s.pipe(csv())
        .on('data', (row) => results.push(row))
        .on('end', resolve)
        .on('error', reject);
    });
  }

  // Preview mode — return first 10 parsed rows without importing
  if (req.query.preview === 'true') {
    return res.json({
      preview: true,
      columns: Object.keys(results[0] || {}),
      rows: results.slice(0, 10),
      totalRows: results.length,
    });
  }

  for (const row of results) {
    try {
      const name = row.product_name?.trim();
      const price = parseFloat(row.price);
      const brand = row.brand?.trim() || '';
      const gender = row.gender?.trim() || '';
      const category = gender && row.category
        ? `${gender.toLowerCase()}_${row.category.trim().toLowerCase()}`
        : (row.category?.trim() || '');
      const shortDesc = row.short_description?.trim() || '';
      const longDesc = row.long_description?.trim() || '';
      const colors = row.color ? [row.color.trim()] : [];
      const sizes = row.size
        ? row.size.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      const imagePathsRaw = row.image_paths?.trim() || '';

      if (!name || isNaN(price)) {
        summary.skipped++;
        summary.errors.push(`Row skipped: missing name or price`);
        continue;
      }

      const existing = await pool.query(
        'SELECT * FROM products WHERE name = $1 AND price = $2',
        [name, price]
      );

      const importedImagePaths = [];
      if (imagePathsRaw) {
        const rawPaths = imagePathsRaw.split('|').filter(Boolean);
        for (const p of rawPaths) {
          const copied = await copyImage(p.trim(), gender, name);
          if (copied) importedImagePaths.push(copied);
        }
      }

      if (existing.rows.length > 0) {
        const prod = existing.rows[0];
        const mergedColors = [...new Set([...(prod.colors || []), ...colors])];
        const mergedSizes = [...new Set([...(prod.sizes || []), ...sizes])];
        const mergedImages = [...new Set([...(prod.images || []), ...importedImagePaths])];

        await pool.query(
          `UPDATE products SET
            colors = $1,
            sizes = $2,
            images = $3,
            updated_at = NOW()
          WHERE id = $4`,
          [JSON.stringify(mergedColors), JSON.stringify(mergedSizes), JSON.stringify(mergedImages), prod.id]
        );
        summary.updated++;
      } else {
        await pool.query(
          `INSERT INTO products
            (name, brand, description, details, price, category, colors, sizes, images, rating, reviews)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [
            name, brand, shortDesc, longDesc, price, category,
            JSON.stringify(colors), JSON.stringify(sizes), JSON.stringify(importedImagePaths),
            0, 0
          ]
        );
        summary.inserted++;
      }
    } catch (err) {
      summary.errors.push(`Row error: ${err.message}`);
      summary.skipped++;
    }
  }

  res.json(summary);
});

module.exports = router;
