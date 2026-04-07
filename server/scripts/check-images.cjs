require('dotenv').config();
const fs = require('fs');
const pool = require('../db.cjs');

async function checkImages() {
  const result = await pool.query('SELECT id, name, images FROM products WHERE array_length(images, 1) > 0');

  const broken = [];
  const quoted = [];
  let ok = 0;

  for (const row of result.rows) {
    for (const img of row.images) {
      // Check if path has embedded single quotes
      if (img.includes("'")) {
        quoted.push({ id: row.id, name: row.name, img });
        break;
      }
      // Check if file exists
      const imgPath = img.startsWith('/') ? img.slice(1) : img;
      if (!fs.existsSync(imgPath)) {
        broken.push({ id: row.id, name: row.name, img, path: imgPath });
        break;
      }
    }
    if (!quoted.find(q => q.id === row.id) && !broken.find(b => b.id === row.id)) {
      ok++;
    }
  }

  console.log('Products with all images OK:', ok);
  console.log('Products with quoted paths:', quoted.length);
  console.log('Products with missing files:', broken.length);
  if (quoted.length > 0) console.log('Quoted samples:', quoted.slice(0, 3));
  if (broken.length > 0) console.log('Broken samples:', broken.slice(0, 3));

  await pool.end();
}

checkImages();
