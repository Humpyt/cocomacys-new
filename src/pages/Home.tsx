import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeroSection } from '../components/HeroSection';
import { ProductCarousel } from '../components/ProductCarousel';
import { PromoBanner } from '../components/PromoBanner';
import { CategorySection } from '../components/CategorySection';
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
  isProductOnSale,
} from '../lib/api';
import { getImageSrc } from '../lib/images';
import { getMenCategoryHref, getWomenCategoryHref } from '../lib/navigation';
import { COLLECTION_IDS } from '../lib/subcategoryMap';

function toCardProps(product: ApiProductRecord) {
  const image = getImageSrc(getProductImage(product));
  const price = getProductPrice(product);
  const originalPrice = getProductOriginalPrice(product);

  return {
    id: String(product.id),
    image,
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

const HOMEPAGE_CATEGORY_SECTIONS: Array<{
  key: string;
  title: string;
  subtitle: string;
  image: string;
  collectionId: string;
  gender: 'men' | 'women';
  categorySlug: string;
  reverse: boolean;
}> = [
  {
    key: 'women-shoes',
    title: "Women's Shoes",
    subtitle: 'Step into style',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.women.subcategories.shoes,
    gender: 'women',
    categorySlug: 'shoes',
    reverse: false,
  },
  {
    key: 'men-shoes',
    title: "Men's Shoes",
    subtitle: 'Fresh finds for every day',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.men.subcategories.shoes,
    gender: 'men',
    categorySlug: 'shoes',
    reverse: true,
  },
  {
    key: 'women-bags',
    title: 'Handbags',
    subtitle: 'Your perfect carry-along',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.women.subcategories.bags,
    gender: 'women',
    categorySlug: 'bags',
    reverse: false,
  },
  {
    key: 'men-shirts',
    title: "Men's Shirts",
    subtitle: 'Tailored to a tee',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.men.subcategories.shirts,
    gender: 'men',
    categorySlug: 'shirts',
    reverse: true,
  },
  {
    key: 'women-blouses',
    title: 'Blouses',
    subtitle: 'Effortlessly polished',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc7f6f80?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.women.subcategories.blouses,
    gender: 'women',
    categorySlug: 'blouses',
    reverse: false,
  },
  {
    key: 'men-tshirts',
    title: "Men's T-Shirts",
    subtitle: 'Easy layers, endless style',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.men.subcategories.tshirts,
    gender: 'men',
    categorySlug: 'tshirts',
    reverse: true,
  },
  {
    key: 'women-dresses',
    title: 'Dresses',
    subtitle: 'From desk to dinner',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.women.subcategories.dresses,
    gender: 'women',
    categorySlug: 'dresses',
    reverse: false,
  },
  {
    key: 'men-jeans',
    title: "Men's Jeans",
    subtitle: 'Built for comfort',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.men.subcategories.jeans,
    gender: 'men',
    categorySlug: 'jeans',
    reverse: true,
  },
];

export function Home() {
  const [allProducts, setAllProducts] = useState<ApiProductRecord[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<ApiProductRecord[]>([]);
  const [clearanceProducts, setClearanceProducts] = useState<ApiProductRecord[]>([]);
  const [discoverProducts, setDiscoverProducts] = useState<ApiProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.products
      .list({ limit: 200, order: 'created_at DESC' })
      .then(({ products }) => {
        setAllProducts(products);
        const withImages = products.filter(p => p.images && p.images.length > 0);
        setTrendingProducts(withImages.slice(0, 6));
        setClearanceProducts(withImages.filter(isProductOnSale).slice(0, 6));
        setDiscoverProducts(withImages.filter(p => !isProductOnSale(p)).slice(0, 6));
      })
      .catch(err => {
        console.error('Homepage data fetch error:', err);
        setError(getErrorMessage(err, 'Failed to load homepage data.'));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
          <strong>Error loading products:</strong> {error}
        </div>
      )}

      {!loading && trendingProducts.length === 0 && clearanceProducts.length === 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 m-4 rounded">
          <strong>No products loaded.</strong> Check console (F12) for API errors.
          <br />
          <span className="text-sm">Trending: {trendingProducts.length} | Clearance: {clearanceProducts.length}</span>
        </div>
      )}

      <HeroSection />

      {HOMEPAGE_CATEGORY_SECTIONS.map(section => {
        const { key, ...sectionProps } = section;
        return <CategorySection key={key} {...sectionProps} />;
      })}

      <PromoBanner
        image="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=2000"
        title="Spring layers<br/>for every day"
        subtitle="Fresh blouses, soft knits, and polished tops for the season ahead."
        buttonText="Shop tops"
        to={getWomenCategoryHref('tops')}
        align="left"
      />

      <PromoBanner
        image="https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&q=80&w=2000"
        title="Denim for him<br/>& her 30% OFF"
        subtitle="Shop fits & trends for the season ahead."
        buttonText="Shop denim"
        to={getWomenCategoryHref('jeans')}
        align="left"
      />

      <PromoBanner
        image="https://images.unsplash.com/photo-1518605368461-1e1e111e1b6a?auto=format&fit=crop&q=80&w=2000"
        title="Men's shirt rotation"
        subtitle="Clean tailored fits and everyday staples for work or weekends."
        buttonText="Shop shirts"
        to={getMenCategoryHref('shirts')}
        align="left"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-[#fdf3e7] p-8 flex flex-col md:flex-row items-center justify-between rounded-sm">
          <div className="flex-1 text-center md:text-left mb-6 md:mb-0">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
              <span className="text-orange-600 text-2xl">*</span>
              <span className="text-2xl font-bold tracking-wider">Star Rewards</span>
            </div>
            <h2 className="text-4xl font-serif font-bold text-orange-600 mb-2 italic">CHALLENGE</h2>
            <div className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 inline-block mb-4">SPRING STYLE EDITION</div>
            <h3 className="text-5xl font-serif mb-2">Get <span className="font-bold">$10</span></h3>
            <h4 className="text-3xl font-serif mb-4">in Star Money*</h4>
            <p className="text-lg mb-6">when you shop any 2 of these 5 categories.</p>
            <Link to="/contact" className="inline-flex bg-black text-white px-6 py-2 font-bold mb-4">Track your progress</Link>
            <p className="text-xs text-gray-600 mb-2">*That's 1,000 bonus points. <Link to="/contact" className="underline">Exclusions & details</Link></p>
            <p className="text-sm font-bold">Not a Star Rewards member? <Link to="/contact" className="underline">Join for free</Link></p>
          </div>
        </div>
      </div>

      <ProductCarousel
        title="Trending now"
        products={trendingProducts.map(toCardProps)}
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-black text-white p-12 text-center flex flex-col items-center justify-center">
          <h2 className="text-5xl md:text-7xl font-serif font-bold italic mb-2">Clearance 40-70% <span className="text-3xl md:text-5xl not-italic">OFF</span></h2>
          <p className="text-xl mb-8">Get it before it's gone!</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/women" className="bg-white text-black px-8 py-2 font-bold hover:bg-gray-200">Women</Link>
            <Link to="/men" className="bg-white text-black px-8 py-2 font-bold hover:bg-gray-200">Men</Link>
            <Link to={getWomenCategoryHref('dresses')} className="bg-white text-black px-8 py-2 font-bold hover:bg-gray-200">Dresses</Link>
            <Link to={getMenCategoryHref('shoes')} className="bg-white text-black px-8 py-2 font-bold hover:bg-gray-200">Shoes</Link>
            <Link to={getWomenCategoryHref('bags')} className="bg-white text-black px-8 py-2 font-bold hover:bg-gray-200">Handbags</Link>
            <Link to={getMenCategoryHref('shirts')} className="bg-white text-black px-8 py-2 font-bold hover:bg-gray-200">Shirts</Link>
          </div>
        </div>
      </div>

      <ProductCarousel
        title="Shop clearance now"
        products={clearanceProducts.map(toCardProps)}
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border border-gray-300 flex flex-col md:flex-row items-center p-6">
          <div className="flex items-center space-x-4 mb-6 md:mb-0">
            <span className="text-orange-600 text-3xl">*</span>
            <span className="text-2xl font-bold tracking-wider">STAR REWARDS</span>
          </div>
          <div className="flex-1 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="w-32 h-20 bg-orange-600 rounded-md shadow-md mr-6 transform -rotate-6"></div>
              <div>
                <h3 className="text-3xl font-serif font-bold italic mb-1">Enjoy 30% OFF</h3>
                <p className="text-xl font-bold mb-2">on macys.com purchases today</p>
                <p className="text-xs text-gray-600">when you open & use a Macy's Card. Discount in store varies. Subject to credit approval. <Link to="/contact" className="underline">Exclusions & details</Link></p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <Link to="/contact" className="border border-black px-6 py-2 font-bold mb-2 hover:bg-gray-50">Check if I prequalify</Link>
              <p className="text-xs text-gray-600">No risk to your credit score</p>
            </div>
          </div>
        </div>
      </div>

      <ProductCarousel
        title="Discover more options"
        products={discoverProducts.map(toCardProps)}
      />

      <ProductCarousel
        title="Recently viewed items"
        products={trendingProducts.slice(0, 2).map(toCardProps)}
      />
    </main>
  );
}
