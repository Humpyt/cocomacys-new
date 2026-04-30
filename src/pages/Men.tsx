import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ProductCard } from '../components/ProductCard';
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
  getMenCategoryHref,
  resolveMenCategorySlug,
  MEN_CATEGORY_LABELS,
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

const mensCategories = [
  {
    image: '/men product category images/mens shirt.png',
    title: 'Shirts',
    href: getMenCategoryHref('shirts'),
  },
  {
    image: '/men product category images/t-shirts.jpeg',
    title: 'T-Shirts',
    href: getMenCategoryHref('tshirts'),
  },
  {
    image: '/men product category images/shoes.png',
    title: 'Shoes',
    href: getMenCategoryHref('shoes'),
  },
  {
    image: '/men product category images/Jeans.jpeg',
    title: 'Jeans',
    href: getMenCategoryHref('jeans'),
  },
  {
    image: '/men product category images/ties.png',
    title: 'Ties',
    href: getMenCategoryHref('ties'),
  },
  {
    image: '/men product category images/bow-ties.png',
    title: 'Bow-ties',
    href: getMenCategoryHref('bowties'),
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

export function Men() {
  const [searchParams] = useSearchParams();
  const activeCategory = resolveMenCategorySlug(searchParams.get('category'));
  const activeCollectionId = activeCategory
    ? COLLECTION_IDS.men.subcategories[activeCategory]
    : COLLECTION_IDS.men.id;
  const activeCategoryLabel = activeCategory ? MEN_CATEGORY_LABELS[activeCategory] : null;
  const pageTitle = activeCategoryLabel ? `Men's ${activeCategoryLabel}` : "Men's Clothing";
  const sectionTitle = activeCategoryLabel ? `Shop ${activeCategoryLabel}` : 'Shop by Category';

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const LIMIT = 50;

  const listParams = activeCategory
    ? { collection_id: activeCollectionId, limit: LIMIT, order: 'created_at DESC' as const }
    : { gender: 'men' as const, limit: LIMIT, order: 'created_at DESC' as const };

  // Initial load + reset on category change
  useEffect(() => {
    setLoading(true);
    setOffset(0);
    setHasMore(true);
    setProducts([]);
    setBrands([]);

    api.products.list({ ...listParams, offset: 0 })
      .then(({ products: prods }) => {
        setProducts(prods.map(mapProduct));
        setHasMore(prods.length >= LIMIT);
        setOffset(LIMIT);
        const seen = new Set<string>();
        const unique: string[] = [];
        for (const p of prods) {
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

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const { products: newProds } = await api.products.list({ ...listParams, offset });
      setProducts(prev => [...prev, ...newProds.map(mapProduct)]);
      setOffset(prev => prev + LIMIT);
      setHasMore(newProds.length >= LIMIT);
    } catch {
      // keep existing products
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, offset, listParams]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <main>
      {/* Men's Hero Banner */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden flex items-center">
          <img
            src="https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=2000"
            alt="Men's Fashion"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative z-10 p-8 md:p-16 max-w-2xl text-white">
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4">{pageTitle}</h1>
            <p className="text-xl md:text-2xl mb-8">
              {activeCategoryLabel
                ? `Explore the latest ${activeCategoryLabel.toLowerCase()} and everyday essentials.`
                : 'Elevate your everyday style with our latest collections.'}
            </p>
            <Link
              to="/men"
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
          {mensCategories.map((category) => (
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
        image="https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&q=80&w=2000"
        title="The Shirt Collection"
        subtitle="From crisp dress shirts to relaxed casuals, find your fit."
        buttonText="Shop Shirts"
        to={getMenCategoryHref('shirts')}
        align="right"
      />

      {/* Products Grid */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">
          {activeCategoryLabel ? `All ${activeCategoryLabel}` : "All Men's"}
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No products yet. Visit /admin to add products.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(product => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            {loadingMore && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black" />
              </div>
            )}

            {!hasMore && products.length > 0 && (
              <p className="text-center text-gray-400 text-sm py-8">
                Showing all {products.length} products
              </p>
            )}

            <div ref={sentinelRef} className="h-4" />
          </>
        )}
      </div>

      {brands.length > 0 && <BrandMarquee brands={brands} />}
    </main>
  );
}
