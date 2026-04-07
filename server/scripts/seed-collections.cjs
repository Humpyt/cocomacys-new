require('dotenv').config();
const pool = require('../db.cjs');

const collections = [
  // Women categories
  { title: 'Women', handle: 'women', parent_id: null },
  { title: 'Dresses', handle: 'women-dresses', parent_id: null },
  { title: 'Bags', handle: 'women-bags', parent_id: null },
  { title: 'Blouses', handle: 'women-blouses', parent_id: null },
  { title: 'Shoes', handle: 'women-shoes', parent_id: null },
  { title: 'Tops', handle: 'women-tops', parent_id: null },
  { title: 'Jeans', handle: 'women-jeans', parent_id: null },
  { title: 'Waistcoats', handle: 'women-waistcoats', parent_id: null },
  // Men categories
  { title: 'Men', handle: 'men', parent_id: null },
  { title: 'Shirts', handle: 'men-shirts', parent_id: null },
  { title: 'T-Shirts', handle: 'men-tshirts', parent_id: null },
  { title: 'Shoes', handle: 'men-shoes', parent_id: null },
  { title: 'Jeans', handle: 'men-jeans', parent_id: null },
];

async function seed() {
  for (const col of collections) {
    await pool.query(
      `INSERT INTO collections (title, handle, parent_id) VALUES ($1, $2, $3)
       ON CONFLICT (handle) DO NOTHING`,
      [col.title, col.handle, col.parent_id]
    );
    console.log(`Created/exists: ${col.handle}`);
  }
  await pool.end();
}

seed().then(() => console.log('Done!')).catch(e => { console.error(e); process.exit(1); });