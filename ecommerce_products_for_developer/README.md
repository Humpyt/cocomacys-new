# E-Commerce Product Data — Developer Handoff

## File Locations

```
D:\...\ecommerce_products_for_developer\
├── README.md               ← You are here
├── men_products.csv        ← Men's clothing products (37 rows)
├── women_products.csv      ← Women's clothing products (100 rows)
└── product_images\         ← All product images organized by gender
    ├── Men\
    │   ├── levis_dark_blue_jeans\
    │   │   ├── image_1.jpg
    │   │   └── image_2.jpg
    │   └── ...
    └── Women\
        └── ...
```

---

## CSV Columns

| Column | Description |
|---|---|
| `id` | Auto-increment integer, unique across both CSVs (Men 1-37, Women 38-137) |
| `product_name` | Clean product name (e.g., "Levis Dark Blue Jeans") |
| `brand` | Brand name (e.g., "Levis", "Calvin Klein", "Zara") |
| `category` | Subcategory: jeans, shirts, t-shirts, shoes, bags, blouses, dresses, waist-coats |
| `gender` | "Men" or "Women" |
| `size` | Size string — waist×inseam (31x32), US (9.5 US), UK (11G UK), or alpha (S, M, XL) |
| `color` | Color (e.g., "Dark Blue", "Black", "Maroon") |
| `price` | Integer price in local currency units (e.g., 380000 = Rp 380,000) |
| `short_description` | 1-2 sentence e-commerce blurb |
| `long_description` | 3-5 sentence SEO paragraph |
| `image_paths` | Pipe-separated **relative** paths to product images |

---

## Quick Start: Import Into Your Database

### Step 1 — Copy Images to Your Server

Copy the entire `product_images/` folder to your web server's static/media directory. Then update the image paths in the CSVs to match your server's URL structure.

For example, if your server serves images at `https://yourstore.com/static/media/`, replace `product_images\` with `https://yourstore.com/static/media/` in the `image_paths` column — or handle this in your application code at runtime.

### Step 2 — Parse Image Paths

```python
def parse_image_paths(image_paths_str):
    """Returns a list of image paths from a pipe-separated string."""
    if not image_paths_str:
        return []
    return [p.strip() for p in image_paths_str.split('|') if p.strip()]
```

### Step 3 — Import Both CSVs

```python
import csv

MEN_CSV = r"D:\...\ecommerce_products_for_developer\men_products.csv"
WOMEN_CSV = r"D:\...\ecommerce_products_for_developer\women_products.csv"

for csv_path in [MEN_CSV, WOMEN_CSV]:
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            product = {
                'id'          : int(row['id']),
                'name'        : row['product_name'],
                'brand'       : row['brand'],
                'category'    : row['category'],
                'gender'      : row['gender'],
                'size'        : row['size'],
                'color'       : row['color'],
                'price'       : int(row['price']),
                'short_desc'  : row['short_description'],
                'long_desc'   : row['long_description'],
                'images'      : parse_image_paths(row['image_paths']),
            }

            # Example Django ORM:
            # Product.objects.create(**product)

            # Example SQLAlchemy:
            # db.session.add(Product(**product))
```

---

## URL Slug Generation

Generate URL-safe slugs from product names:

```python
import re

def make_slug(name):
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s]+', '-', slug)
    slug = slug.strip('-')
    return slug

# Example:
# make_slug("Levis Dark Blue Jeans (31x32, 40x34, 38x34, 40x32)")
# Returns: "levis-dark-blue-jeans-31x32-40x34-38x34-40x32"
```

---

## Before Publishing — Check These

1. **Image paths** — `image_paths` are currently relative (e.g., `product_images\Men\levis_dark_blue_jeans\image_1.jpg`). Either copy `product_images/` to your web root and reference them as-is, or convert to absolute URLs.

2. **Descriptions** — Template-generated. A copywriter should review/adjust key product descriptions before launch, especially for high-value items.

3. **Image quality** — Images scraped from Bing. Review before publishing; some may be generic lifestyle shots rather than clean product photos.

4. **Brand names** — A few products (~10) have no recognizable brand from the source filename. These appear with only color + category as product name (e.g., "Black Bags", "Light Blue Blouses"). Consider adding brand manually or leaving as-is.

5. **Size format** — Sizes are parsed directly from filenames and vary in format:
   - Jeans: `31x32, 40x34` (waist×inseam, comma-separated)
   - US sizes: `9.5 US`, `12 US`
   - UK sizes: `11G UK`, `6D UK`
   - Alpha: `S`, `M`, `XL`, `XXL`, `PM` ( petite medium)

6. **Duplicate names** — Some products share the same name but differ in size or price (e.g., same "Charles Tyrwhitt Blue Shirts" at different prices). Use `id` as the unique key, not `product_name`.

7. **Gender split** — Two separate CSVs by gender. `id` values are globally unique across both files.

---

## Image Folder Structure

Images are organized as one subfolder per product:

```
product_images/
├── Men/
│   ├── levis_dark_blue_jeans_1/     ← product id 1
│   │   ├── image_1.jpeg
│   │   └── image_2.jpeg
│   ├── charles_tyrwhitt_blue_shirts_2/   ← product id 2
│   │   └── image_1.jpeg
│   └── ...
└── Women/
    ├── aldo_black_bags_38/           ← product id 38
    │   └── image_1.jpeg
    └── ...
```

---

## Stats

| Metric | Count |
|---|---|
| Total products | 137 |
| Men products | 37 |
| Women products | 100 |
| Product image folders | 253 |
| Total images | 263 |
| Avg images per product | ~1.9 |
| Categories | 8 (jeans, shirts, t-shirts, shoes, bags, blouses, dresses, waist-coats) |
| Brands represented | ~40 |
