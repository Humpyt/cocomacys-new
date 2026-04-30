import React, { useEffect, useState } from 'react';
import { ProductCarousel } from '../components/ProductCarousel';
import { PromoBanner } from '../components/PromoBanner';
import { Link, useSearchParams } from 'react-router-dom';
import {
  api,
  type ApiProductRecord,
  formatCurrency,
  getProductDiscountLabel,
  getProductImage,
  getProductOriginalPrice,
  getProductPrice,
  getProductRating,
} from '../lib/api';
import { getImageSrc } from '../lib/images';
import { COLLECTION_IDS } from '../lib/subcategoryMap';
import {
  formatProductLabel,
  getWomenCategoryHref,
  resolveWomenCategorySlug,
  WOMEN_CATEGORY_LABELS,
} from '../lib/navigation';
import { BrandMarquee } from '../components/BrandMarquee';
interface Product {
  id: string;
  href: string;
  image: string;
  brand: string;
  name: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  promo?: string;
  rating: number;
  reviews: number;
}

const womensCategories = [
  {
    image: '/women/dresses.jpeg',
    title: 'Dresses',
    href: getWomenCategoryHref('dresses'),
  },
  {
    image: '/women/women-blouse.png',
    title: 'Blouses',
    href: getWomenCategoryHref('blouses'),
  },
  {
    image: '/women/handbag.png',
    title: 'Handbags',
    href: getWomenCategoryHref('bags'),
  },
  {
    image: '/women/ladies-shoes.png',
    title: 'Shoes',
    href: getWomenCategoryHref('shoes'),
  },
  {
    image: '/uploads/women_dkny_dresses_16_us_90/image_1.jpeg',
    title: 'Coats',
    href: getWomenCategoryHref('coats'),
  },
];

function mapProduct(product: ApiProductRecord): Product {
  const price = formatCurrency(getProductPrice(product));
  const originalPrice = getProductOriginalPrice(product);

  return {
    id: String(product.id),
    href: `/product?id=${encodeURIComponent(String(product.id))}`,
    image: getImageSrc(getProductImage(product)),
    brand: formatProductLabel(product.brand, product.category),
    name: product.name || '',
    price,
    originalPrice: originalPrice != null ? formatCurrency(originalPrice) : undefined,
    discount: getProductDiscountLabel(product),
    promo: product.promo ?? undefined,
    rating: getProductRating(product),
    reviews: product.reviews ?? 0,
  };
}

export function Women() {
  const [searchParams] = useSearchParams();
  const activeCategory = resolveWomenCategorySlug(searchParams.get('category'));
  const activeCollectionId = activeCategory
    ? COLLECTION_IDS.women.subcategories[activeCategory]
    : COLLECTION_IDS.women.id;
  const activeCategoryLabel = activeCategory ? WOMEN_CATEGORY_LABELS[activeCategory] : null;
  const pageTitle = activeCategoryLabel ? `Women's ${activeCategoryLabel}` : "Women's Clothing";
  const sectionTitle = activeCategoryLabel ? `Shop ${activeCategoryLabel}` : 'Shop by Category';
  const carouselTitle = activeCategoryLabel ? `Trending in ${activeCategoryLabel}` : "Trending in Women's";

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const listParams = activeCategory
      ? { collection_id: activeCollectionId }
      : { gender: 'women' as const };
    api.products.list(listParams)
      .then(({ products }) => {
        setProducts(products.map(mapProduct));
        const seen = new Set<string>();
        const unique: string[] = [];
        for (const p of products) {
          const b = p.brand?.trim();
          if (b && !seen.has(b)) {
            seen.add(b);
            unique.push(b);
          }
        }
        setBrands(unique);
      })
      .catch(() => {
        setProducts([]);
        setBrands([]);
      })
      .finally(() => setLoading(false));
  }, [activeCollectionId, activeCategory]);

  return (
    <main>
      {/* Women's Hero Banner */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden flex items-center">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=2000"
            alt="Women's Fashion"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 p-8 md:p-16 max-w-2xl text-white">
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4">{pageTitle}</h1>
            <p className="text-xl md:text-2xl mb-8">
              {activeCategoryLabel
                ? `Explore the latest ${activeCategoryLabel.toLowerCase()} and everyday favorites.`
                : 'Discover the latest trends and everyday essentials.'}
            </p>
            <Link
              to="/women"
              className="inline-flex bg-white text-black px-8 py-3 font-bold hover:bg-gray-100 transition-colors"
            >
              Shop New Arrivals
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-2xl font-bold mb-6">{sectionTitle}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {womensCategories.map((category) => (
            <Link to={category.href} key={category.title} className="group cursor-pointer">
              <div className="aspect-[3/4] overflow-hidden mb-3">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-bold text-center group-hover:underline">{category.title}</h3>
            </Link>
          ))}
        </div>
      </div>

      <PromoBanner
        image="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000"
        title="The Dress Shop"
        subtitle="From casual midis to elegant gowns, find your perfect fit."
        buttonText="Shop Dresses"
        to={getWomenCategoryHref('dresses')}
        align="right"
      />

      {!loading && products.length > 0 ? (
        <ProductCarousel
          title={carouselTitle}
          products={products}
          displayMode="grid"
        />
      ) : (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500">
            {loading ? 'Loading...' : "No women's products yet. Visit /admin to add products."}
          </p>
        </div>
      )}

      {brands.length > 0 && <BrandMarquee brands={brands} />}
    </main>
  );
}
