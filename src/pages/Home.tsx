import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeroSection } from '../components/HeroSection';
import { ProductCarousel } from '../components/ProductCarousel';
import { PromoBanner } from '../components/PromoBanner';
import { CategoryStrip } from '../components/CategoryStrip';
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
import { COLLECTION_IDS } from '../lib/subcategoryMap';
import { getMenCategoryHref } from '../lib/navigation';

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

const STRIP_CATEGORIES = [
  { key: 'women-shoes',  title: "Women's Shoes",  image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=200', gender: 'women' as const, categorySlug: 'shoes'   },
  { key: 'men-shoes',   title: "Men's Shoes",    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200', gender: 'men'   as const, categorySlug: 'shoes'   },
  { key: 'women-bags',  title: 'Handbags',        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=200', gender: 'women' as const, categorySlug: 'bags'    },
  { key: 'men-shirts',  title: "Men's Shirts",   image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=200', gender: 'men'   as const, categorySlug: 'shirts'  },
  { key: 'women-blouses',title:'Blouses',         image: 'https://images.unsplash.com/photo-1596462502278-27bfdc7f6f80?auto=format&fit=crop&q=80&w=200', gender: 'women' as const, categorySlug: 'blouses' },
  { key: 'men-tshirts', title: "Men's T-Shirts", image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200', gender: 'men'   as const, categorySlug: 'tshirts' },
  { key: 'women-dresses',title:'Dresses',         image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=200', gender: 'women' as const, categorySlug: 'dresses' },
  { key: 'men-jeans',   title: "Men's Jeans",    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=200', gender: 'men'   as const, categorySlug: 'jeans'   },
];

const LOVED_TABS = [
  { key: 'new-arrivals', label: 'New arrivals' },
  { key: 'deals', label: 'Deals for you' },
  { key: 'dressy', label: 'Dressy looks' },
  { key: 'handbags', label: 'Spring handbags' },
] as const;

type LovedTabKey = (typeof LOVED_TABS)[number]['key'];

export function Home() {
  const [mensProducts, setMensProducts] = useState<ApiProductRecord[]>([]);
  const [clearanceProducts, setClearanceProducts] = useState<ApiProductRecord[]>([]);
  const [discoverProducts, setDiscoverProducts] = useState<ApiProductRecord[]>([]);
  const [lovedProducts, setLovedProducts] = useState<ApiProductRecord[]>([]);
  const [lovedTab, setLovedTab] = useState<LovedTabKey>('new-arrivals');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.products
      .list({ limit: 200, order: 'created_at DESC' })
      .then(({ products }) => {
        const withImages = products.filter(p => p.images && p.images.length > 0);
        setMensProducts(withImages.filter(p => {
          const cid = p.collection_id;
          return cid === COLLECTION_IDS.men.id ||
            Object.values(COLLECTION_IDS.men.subcategories).includes(cid as typeof COLLECTION_IDS.men.subcategories[keyof typeof COLLECTION_IDS.men.subcategories]);
        }).slice(0, 6));
        setClearanceProducts(withImages.filter(isProductOnSale).slice(0, 6));
        setDiscoverProducts(withImages.filter(p => !isProductOnSale(p)).slice(0, 6));
      })
      .catch(err => {
        console.error('Homepage data fetch error:', err);
        setError(getErrorMessage(err, 'Failed to load homepage data.'));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (lovedTab === 'new-arrivals') {
      api.products.list({ limit: 6, order: 'created_at DESC' })
        .then(({ products }) => setLovedProducts(products.filter(p => p.images && p.images.length > 0).slice(0, 6)));
    } else if (lovedTab === 'deals') {
      api.products.list({ limit: 20, order: 'created_at DESC' })
        .then(({ products }) => setLovedProducts(products.filter(p => isProductOnSale(p)).slice(0, 6)));
    } else if (lovedTab === 'dressy') {
      api.products.list({ collection_id: COLLECTION_IDS.women.subcategories.dresses, limit: 6, order: 'created_at DESC' })
        .then(({ products }) => setLovedProducts(products.filter(p => p.images && p.images.length > 0)));
    } else if (lovedTab === 'handbags') {
      api.products.list({ collection_id: COLLECTION_IDS.women.subcategories.bags, limit: 6, order: 'created_at DESC' })
        .then(({ products }) => setLovedProducts(products.filter(p => p.images && p.images.length > 0)));
    }
  }, [lovedTab]);

  return (
    <main>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
          <strong>Error loading products:</strong> {error}
        </div>
      )}

      {!loading && mensProducts.length === 0 && clearanceProducts.length === 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 m-4 rounded">
          <strong>No products loaded.</strong> Check console (F12) for API errors.
          <br />
          <span className="text-sm">Men's: {mensProducts.length} | Clearance: {clearanceProducts.length}</span>
        </div>
      )}

      <HeroSection />

      <CategoryStrip sections={STRIP_CATEGORIES} />

      <ProductCarousel
        title="Loved by us, picked for you"
        tabs={LOVED_TABS.map(tab => tab.label)}
        activeTab={LOVED_TABS.find(tab => tab.key === lovedTab)?.label}
        onTabChange={(_, index) => {
          const nextTab = LOVED_TABS[index]?.key;
          if (nextTab) setLovedTab(nextTab);
        }}
        products={lovedProducts.map(toCardProps)}
      />

      <PromoBanner
        image="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=2000"
        title="Spring break finds<br/>for fun in the sun"
        buttonText="Shop now"
        align="left"
      />

      <PromoBanner
        image="https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&q=80&w=2000"
        title="Denim for him<br/>& her 30% OFF"
        subtitle="Shop fits &amp; trends for the season ahead."
        buttonText="Shop by category ▼"
        align="left"
      />

      {/* Men's Shirts Editorial Section */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
          {/* Editorial content side */}
          <div className="bg-[#1a1a2e] text-white flex flex-col justify-center p-10 lg:p-16">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-4">Collection</p>
            <h2 className="text-4xl lg:text-6xl font-serif font-bold mb-4 leading-tight">
              The Season<br />Starts Here
            </h2>
            <p className="text-gray-300 text-base mb-8 max-w-sm">
              Sharp collars, clean cuts, and fabrics that move with you — from kickoff to the office.
            </p>
            <Link
              to={getMenCategoryHref('shirts')}
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 font-bold hover:bg-gray-100 transition-colors self-start"
            >
              Shop Men's Shirts
              <span className="text-lg">&rarr;</span>
            </Link>
          </div>

          {/* Poster image side */}
          <div className="relative overflow-hidden">
            <img
              src="/horizontal_poster.jpg"
              alt="Men's Shirts Collection"
              className="w-full h-full object-cover min-h-[320px] md:min-h-[400px]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e]/30 to-transparent" />
          </div>
        </div>
      </div>

      <ProductCarousel
        title="Men's Section"
        products={mensProducts.map(toCardProps)}
      />

      {/* Clearance Banner */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-black text-white p-12 text-center flex flex-col items-center justify-center">
          <h2 className="text-5xl md:text-7xl font-serif font-bold italic mb-2">Clearance 40-70% <span className="text-3xl md:text-5xl not-italic">OFF</span></h2>
          <p className="text-xl mb-8">Get it before it's gone!</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/women" className="bg-white text-black px-8 py-2 font-bold hover:bg-gray-200">Women</Link>
            <Link to="/men" className="bg-white text-black px-8 py-2 font-bold hover:bg-gray-200">Men</Link>
            <Link to="/women?category=dresses" className="bg-white text-black px-8 py-2 font-bold hover:bg-gray-200">Dresses</Link>
            <Link to="/men?category=shoes" className="bg-white text-black px-8 py-2 font-bold hover:bg-gray-200">Shoes</Link>
            <Link to="/women?category=bags" className="bg-white text-black px-8 py-2 font-bold hover:bg-gray-200">Handbags</Link>
            <Link to="/men?category=shirts" className="bg-white text-black px-8 py-2 font-bold hover:bg-gray-200">Shirts</Link>
          </div>
        </div>
      </div>

      <ProductCarousel
        title="Shop clearance now"
        products={clearanceProducts.map(toCardProps)}
      />

      {/* Enjoy 30% OFF Banner */}
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
        title="Men's Picks"
        products={mensProducts.slice(0, 4).map(toCardProps)}
      />
    </main>
  );
}
