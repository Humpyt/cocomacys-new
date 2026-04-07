-- Homepage sections: allows admins to assign products to homepage display sections
CREATE TABLE homepage_sections (
  id SERIAL PRIMARY KEY,
  section_key VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL,
  product_ids INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO homepage_sections (section_key, title, product_ids) VALUES
  ('new-arrivals', 'New Arrivals', '{}'),
  ('deals-for-you', 'Deals for You', '{}'),
  ('dressy-looks', 'Dressy Looks', '{}'),
  ('spring-handbags', 'Spring Handbags', '{}'),
  ('trending-now', 'Trending Now', '{}'),
  ('shop-clearance', 'Shop Clearance', '{}'),
  ('discover-more', 'Discover More', '{}'),
  ('denim-women', 'Denim Women', '{}'),
  ('denim-men', 'Denim Men', '{}'),
  ('star-shoes', 'Star Shoes', '{}'),
  ('star-dresses', 'Star Dresses', '{}'),
  ('star-handbags', 'Star Handbags', '{}');

CREATE INDEX idx_homepage_sections_key ON homepage_sections (section_key);
