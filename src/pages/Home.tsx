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
  getProductImage,
  getProductPrice,
  getProductRating,
  isProductOnSale,
} from '../lib/api';
import { getImageSrc } from '../lib/images';
import { COLLECTION_IDS } from '../lib/subcategoryMap';
import { formatProductLabel, getMenCategoryHref } from '../lib/navigation';

function toCardProps(product: ApiProductRecord) {
  const image = getImageSrc(getProductImage(product));
  const price = getProductPrice(product);

  return {
    id: String(product.id),
    image,
    brand: formatProductLabel(product.brand, product.category) || 'Brand',
    name: product.name,
    price: formatCurrency(price),
    rating: getProductRating(product),
    reviews: product.reviews ?? 0,
    colors: product.colors.length > 0 ? product.colors : undefined,
  };
}

const STRIP_CATEGORIES = [
  { key: 'women-shoes',  title: "Women's Shoes",  image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=200', gender: 'women' as const, categorySlug: 'shoes'   },
  { key: 'men-shoes',   title: "Men's Shoes",    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200', gender: 'men'   as const, categorySlug: 'shoes'   },
  { key: 'women-bags',  title: 'Handbags',        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=200', gender: 'women' as const, categorySlug: 'bags'    },
  { key: 'men-shirts',  title: "Men's Shirts",   image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=200', gender: 'men'   as const, categorySlug: 'shirts'  },
  { key: 'women-blouses',title:'Blouses',         image: '/women/women-blouse.png', gender: 'women' as const, categorySlug: 'blouses' },
  { key: 'men-tshirts', title: "Men's T-Shirts", image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200', gender: 'men'   as const, categorySlug: 'tshirts' },
  { key: 'women-dresses',title:'Dresses',         image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=200', gender: 'women' as const, categorySlug: 'dresses' },
  { key: 'men-jeans',   title: "Men's Jeans",    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=200', gender: 'men'   as const, categorySlug: 'jeans'   },
];

const LOVED_TABS = [
  { key: 'dressy', label: 'Dressy looks' },
  { key: 'handbags', label: 'Spring handbags' },
  { key: 'new-arrivals', label: 'New arrivals' },
] as const;

type LovedTabKey = (typeof LOVED_TABS)[number]['key'];

export function Home() {
  const [mensProducts, setMensProducts] = useState<ApiProductRecord[]>([]);
  const [womensPicks, setWomensPicks] = useState<ApiProductRecord[]>([]);
  const [discoverProducts, setDiscoverProducts] = useState<ApiProductRecord[]>([]);
  const [lovedProducts, setLovedProducts] = useState<ApiProductRecord[]>([]);
  const [lovedTab, setLovedTab] = useState<LovedTabKey>('dressy');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenProducts = api.products.list({
      collection_id: COLLECTION_IDS.men.subcategories.shirts,
      limit: 50,
      order: 'created_at DESC',
    }).then(({ products }) => products.filter(p => p.images && p.images.length > 0));

    const fetchMenShoes = api.products.list({
      collection_id: COLLECTION_IDS.men.subcategories.shoes,
      limit: 50,
      order: 'created_at DESC',
    }).then(({ products }) => products.filter(p => p.images && p.images.length > 0));

    const fetchWomenPicks = api.products.list({
      gender: 'women',
      limit: 50,
      order: 'created_at DESC',
    }).then(({ products }) => products.filter(p => p.images && p.images.length > 0));

    const fetchDiscover = api.products.list({
      limit: 100,
      order: 'created_at DESC',
    }).then(({ products }) => products.filter(p => p.images && p.images.length > 0 && !isProductOnSale(p)).slice(0, 6));

    Promise.all([fetchMenProducts, fetchMenShoes, fetchWomenPicks, fetchDiscover])
      .then(([menShirts, menShoes, womenPicks, discover]) => {
        const combinedMen = [...menShirts, ...menShoes].sort(() => Math.random() - 0.5);
        setMensProducts(combinedMen.slice(0, 8));
        setWomensPicks(womenPicks.sort(() => Math.random() - 0.5).slice(0, 8));
        setDiscoverProducts(discover);
      })
      .catch(err => {
        console.error('Homepage data fetch error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (lovedTab === 'new-arrivals') {
      api.products.list({ limit: 6, order: 'created_at DESC' })
        .then(({ products }) => setLovedProducts(products.filter(p => p.images && p.images.length > 0).slice(0, 6)));
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

      <ProductCarousel
        title="Discover more options"
        products={discoverProducts.map(toCardProps)}
      />

      <ProductCarousel
        title="Women's Picks"
        products={womensPicks.map(toCardProps)}
      />
    </main>
  );
}
