import React, { useState, useEffect } from 'react';
import { HeroSection } from '../components/HeroSection';
import { ProductCarousel } from '../components/ProductCarousel';
import { PromoBanner } from '../components/PromoBanner';
import { Link } from 'react-router-dom';
import { medusa, MedusaProduct } from '../lib/medusa';
import { COLLECTION_IDS } from '../lib/subcategoryMap';

// Helper: transform MedusaProduct to ProductCard format
function toCardProps(p: MedusaProduct) {
  return {
    image: p.thumbnail || '',
    brand: (p.collection?.title || 'Brand'),
    name: p.title,
    price: p.variants?.[0]?.prices?.[0]
      ? `$${((p.variants[0].prices[0].amount) / 100).toFixed(2)}`
      : '$0.00',
    originalPrice: undefined,
    discount: undefined,
    rating: (p.metadata?.rating as number) ?? 0,
    reviews: (p.metadata?.reviews as number) ?? 0,
    colors: (p.metadata?.colors as string[]) ?? undefined,
    promo: (p.metadata?.promo as string) ?? undefined,
  };
}

// Helper: detect clearance (compare_at_price in metadata > current price)
function isOnSale(product: MedusaProduct): boolean {
  const compareAt = product.metadata?.compare_at_price as number | undefined;
  if (!compareAt) return false;
  const current = product.variants?.[0]?.prices?.[0]?.amount ?? 0;
  return current < compareAt;
}

export function Home() {
  // Product state for each section
  const [lovedProducts, setLovedProducts] = useState<MedusaProduct[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<MedusaProduct[]>([]);
  const [clearanceProducts, setClearanceProducts] = useState<MedusaProduct[]>([]);
  const [discoverProducts, setDiscoverProducts] = useState<MedusaProduct[]>([]);
  const [denimWomen, setDenimWomen] = useState<MedusaProduct[]>([]);
  const [denimMen, setDenimMen] = useState<MedusaProduct[]>([]);
  const [starShoes, setStarShoes] = useState<MedusaProduct[]>([]);
  const [starDresses, setStarDresses] = useState<MedusaProduct[]>([]);
  const [starHandbags, setStarHandbags] = useState<MedusaProduct[]>([]);
  const [lovedTab, setLovedTab] = useState<'new-arrivals' | 'deals' | 'dressy' | 'handbags'>('new-arrivals');

  // Trending (new arrivals across both collections, sorted by created_at desc)
  useEffect(() => {
    medusa.products.list({ limit: 6, order: 'created_at:desc' }).then(r => setTrendingProducts(r.products));
  }, []);

  // Clearance (all products, filter client-side for on-sale, take 6)
  useEffect(() => {
    medusa.products.list({ limit: 100, order: 'created_at:desc' }).then(r => {
      setClearanceProducts(r.products.filter(isOnSale).slice(0, 6));
    });
  }, []);

  // Discover more (all products NOT on clearance, sorted by created_at desc, take 6)
  useEffect(() => {
    medusa.products.list({ limit: 20, order: 'created_at:desc' }).then(r => {
      setDiscoverProducts(r.products.filter(p => !isOnSale(p)).slice(0, 6));
    });
  }, []);

  // Denim (women and men jeans subcategories)
  useEffect(() => {
    medusa.products.list({ collection_id: COLLECTION_IDS.women.subcategories.jeans, limit: 4 }).then(r => setDenimWomen(r.products));
    medusa.products.list({ collection_id: COLLECTION_IDS.men.subcategories.jeans, limit: 4 }).then(r => setDenimMen(r.products));
  }, []);

  // Star Rewards sections
  useEffect(() => {
    medusa.products.list({ collection_id: COLLECTION_IDS.women.subcategories.shoes, limit: 4 }).then(r => setStarShoes(prev => [...prev, ...r.products]));
    medusa.products.list({ collection_id: COLLECTION_IDS.men.subcategories.shoes, limit: 4 }).then(r => setStarShoes(prev => [...prev, ...r.products]));
  }, []);

  useEffect(() => {
    medusa.products.list({ collection_id: COLLECTION_IDS.women.subcategories.dresses, limit: 4 }).then(r => setStarDresses(r.products));
  }, []);

  useEffect(() => {
    medusa.products.list({ collection_id: COLLECTION_IDS.women.subcategories.bags, limit: 4 }).then(r => setStarHandbags(r.products));
  }, []);

  // Loved tab products (changes when tab changes)
  useEffect(() => {
    if (lovedTab === 'new-arrivals') {
      medusa.products.list({ limit: 6, order: 'created_at:desc' }).then(r => setLovedProducts(r.products.slice(0, 6)));
    } else if (lovedTab === 'deals') {
      medusa.products.list({ limit: 20, order: 'created_at:desc' }).then(r => {
        setLovedProducts(r.products.filter(isOnSale).slice(0, 6));
      });
    } else if (lovedTab === 'dressy') {
      medusa.products.list({ collection_id: COLLECTION_IDS.women.subcategories.dresses, limit: 6, order: 'created_at:desc' }).then(r => setLovedProducts(r.products));
    } else if (lovedTab === 'handbags') {
      medusa.products.list({ collection_id: COLLECTION_IDS.women.subcategories.bags, limit: 6, order: 'created_at:desc' }).then(r => setLovedProducts(r.products));
    }
  }, [lovedTab]);

  return (
    <main>
      <HeroSection />

      <ProductCarousel
        title="Loved by us, picked for you"
        tabs={["New arrivals", "Deals for you", "Dressy looks", "Spring handbags"]}
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
        subtitle="Shop fits & trends for the season ahead."
        buttonText="Shop by category ▼"
        align="left"
      />

      <PromoBanner
        image="https://images.unsplash.com/photo-1518605368461-1e1e111e1b6a?auto=format&fit=crop&q=80&w=2000"
        title="World Soccer HQ"
        subtitle="Dedicated team gear worthy of every fan."
        buttonText="Shop now"
        align="left"
      />

      {/* Star Rewards Challenge Banner */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-[#fdf3e7] p-8 flex flex-col md:flex-row items-center justify-between rounded-sm">
          <div className="flex-1 text-center md:text-left mb-6 md:mb-0">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
              <span className="text-orange-600 text-2xl">★</span>
              <span className="text-2xl font-bold tracking-wider">Star Rewards</span>
            </div>
            <h2 className="text-4xl font-serif font-bold text-orange-600 mb-2 italic">CHALLENGE</h2>
            <div className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 inline-block mb-4">SPRING STYLE EDITION</div>
            <h3 className="text-5xl font-serif mb-2">Get <span className="font-bold">$10</span></h3>
            <h4 className="text-3xl font-serif mb-4">in Star Money*</h4>
            <p className="text-lg mb-6">when you shop any 2 of these 5 categories.</p>
            <button className="bg-black text-white px-6 py-2 font-bold mb-4">Track your progress</button>
            <p className="text-xs text-gray-600 mb-2">*That's 1,000 bonus points. <a href="#" className="underline">Exclusions & details</a></p>
            <p className="text-sm font-bold">Not a Star Rewards member? <a href="#" className="underline">Join for free</a></p>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-4">
            <Link to="/product" className="flex flex-col items-center cursor-pointer group">
              <img src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=300" alt="Shoes" className="w-full aspect-square object-cover rounded-full mb-2 group-hover:opacity-90" />
              <span className="text-sm underline">Women's & Men's Shoes</span>
            </Link>
            <Link to="/product" className="flex flex-col items-center cursor-pointer group">
              <img src="https://images.unsplash.com/photo-1596462502278-27bf85033e5a?auto=format&fit=crop&q=80&w=300" alt="Fragrance" className="w-full aspect-square object-cover rounded-full mb-2 group-hover:opacity-90" />
              <span className="text-sm underline">Fragrance</span>
            </Link>
            <Link to="/product" className="flex flex-col items-center cursor-pointer group">
              <img src="https://images.unsplash.com/photo-1515347619152-145c3298c368?auto=format&fit=crop&q=80&w=300" alt="Dresses" className="w-full aspect-square object-cover rounded-full mb-2 group-hover:opacity-90" />
              <span className="text-sm underline">Dresses</span>
            </Link>
            <Link to="/product" className="flex flex-col items-center cursor-pointer group">
              <img src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=300" alt="Handbags" className="w-full aspect-square object-cover rounded-full mb-2 group-hover:opacity-90" />
              <span className="text-sm underline">Handbags</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Anticipated Arrivals */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black text-white p-8 flex flex-col justify-center items-center text-center">
            <div className="w-32 h-32 border-2 border-white rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl font-serif">★</span>
            </div>
            <h2 className="text-3xl font-serif mb-4">This season's<br/>most anticipated<br/>arrivals from the<br/>best brands.</h2>
          </div>
          <Link to="/product" className="group cursor-pointer">
            <div className="aspect-square overflow-hidden mb-4">
              <img src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600" alt="DIOR" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <h3 className="font-bold text-lg mb-1">DIOR</h3>
            <p className="text-sm">J'adore l'Or essence featuring notes of jasmine, rose & ylang-ylang.</p>
          </Link>
          <Link to="/product" className="group cursor-pointer">
            <div className="aspect-square overflow-hidden mb-4">
              <img src="https://images.unsplash.com/photo-1615486171448-4af4e0311488?auto=format&fit=crop&q=80&w=600" alt="Fiesta" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <h3 className="font-bold text-lg mb-1">Fiesta</h3>
            <p className="text-sm">Celebrating 90 years & introducing the new 2026 color: Lavender.</p>
          </Link>
        </div>
      </div>

      <ProductCarousel
        title="Trending now"
        products={trendingProducts.map(toCardProps)}
      />

      {/* Clearance Banner */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-black text-white p-12 text-center flex flex-col items-center justify-center">
          <h2 className="text-5xl md:text-7xl font-serif font-bold italic mb-2">Clearance 40-70% <span className="text-3xl md:text-5xl not-italic">OFF</span></h2>
          <p className="text-xl mb-8">Get it before it's gone!</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-black px-8 py-2 font-bold hover:bg-gray-200">Women</button>
            <button className="bg-white text-black px-8 py-2 font-bold hover:bg-gray-200">Men</button>
            <button className="bg-white text-black px-8 py-2 font-bold hover:bg-gray-200">Kids & Baby</button>
            <button className="bg-white text-black px-8 py-2 font-bold hover:bg-gray-200">Shoes</button>
            <button className="bg-white text-black px-8 py-2 font-bold hover:bg-gray-200">Home</button>
            <button className="bg-white text-black px-8 py-2 font-bold hover:bg-gray-200">Shop All</button>
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
          <div className="flex items-center space-x-4 mb-6 md:mb-0 md:mr-8">
            <span className="text-orange-600 text-3xl">★</span>
            <span className="text-2xl font-bold tracking-wider">STAR REWARDS</span>
          </div>
          <div className="flex-1 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="w-32 h-20 bg-orange-600 rounded-md shadow-md mr-6 transform -rotate-6"></div>
              <div>
                <h3 className="text-3xl font-serif font-bold italic mb-1">Enjoy 30% OFF</h3>
                <p className="text-xl font-bold mb-2">on macys.com purchases today</p>
                <p className="text-xs text-gray-600">when you open & use a Macy's Card. Discount in store varies. Subject to credit approval. <a href="#" className="underline">Exclusions & details</a></p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <button className="border border-black px-6 py-2 font-bold mb-2 hover:bg-gray-50">Check if I prequalify</button>
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
