import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard, ProductCardProps } from './ProductCard';
import { CategorySectionSkeleton } from './CategorySectionSkeleton';
import {
  api,
  type ApiProductRecord,
  formatCurrency,
  getErrorMessage,
  getProductDiscountLabel,
  getProductImage,
  getProductOriginalPrice,
  getProductPrice,
  getProductRating,
} from '../lib/api';
import { getWomenCategoryHref, getMenCategoryHref } from '../lib/navigation';

interface CategorySectionProps {
  title: string;
  subtitle?: string;
  image: string;
  collectionId: string;
  gender: 'men' | 'women';
  reverse?: boolean;
  limit?: number;
}

function toCardProps(product: ApiProductRecord): ProductCardProps {
  const image = getProductImage(product);
  const price = getProductPrice(product);
  const originalPrice = getProductOriginalPrice(product);

  return {
    id: String(product.id),
    image: image ?? '',
    brand: product.brand || product.category || 'Brand',
    name: product.name,
    price: formatCurrency(price),
    originalPrice: originalPrice != null ? formatCurrency(originalPrice) : undefined,
    discount: getProductDiscountLabel(product),
    rating: getProductRating(product),
    reviews: product.reviews ?? 0,
    colors: product.colors.length > 0 ? product.colors : undefined,
    promo: product.promo ?? undefined,
  };
}

export function CategorySection({
  title,
  subtitle,
  image,
  collectionId,
  gender,
  reverse = false,
  limit = 6,
}: CategorySectionProps) {
  const [products, setProducts] = useState<ApiProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api.products
      .list({ collection_id: collectionId, gender, limit, order: 'created_at DESC' })
      .then(({ products }) => {
        if (!cancelled) {
          setProducts(products);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(getErrorMessage(err, 'Failed to load products.'));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [collectionId, gender, limit]);

  const ctaHref = gender === 'women' ? getWomenCategoryHref(collectionId) : getMenCategoryHref(collectionId);

  if (loading) {
    return <CategorySectionSkeleton reverse={reverse} />;
  }

  if (error) {
    return (
      <div className={`max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 ${reverse ? '' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className={`bg-gray-100 animate-pulse aspect-[3/4] md:aspect-auto md:col-span-1 ${reverse ? 'md:order-last' : ''}`} />
          <div className="bg-[#fdf3e7] p-8 lg:p-16 flex flex-col justify-center md:col-span-1">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Image side — order-last when reversed */}
        <div className={`md:col-span-1 overflow-hidden ${reverse ? 'md:order-last' : ''}`}>
          <img
            src={image}
            alt={title}
            className="w-full aspect-[3/4] md:aspect-[4/5] object-cover object-center"
          />
        </div>

        {/* Content side */}
        <div className="md:col-span-1 bg-[#fdf3e7] flex flex-col justify-center p-8 lg:p-16">
          {subtitle && (
            <p className="uppercase tracking-widest text-sm text-gray-500 mb-2">{subtitle}</p>
          )}
          <h2 className="text-3xl lg:text-4xl font-serif font-bold mb-6">{title}</h2>

          {products.length === 0 ? (
            <p className="text-gray-500 text-sm">No products found.</p>
          ) : (
            <div className="relative group">
              <div className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar">
                {products.map(product => (
                  <div key={product.id} className="snap-start shrink-0 w-[200px] md:w-[240px]">
                    <ProductCard {...toCardProps(product)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 text-right">
            <Link
              to={ctaHref}
              className="text-sm font-bold underline hover:text-gray-600"
            >
              Shop all {title} &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
