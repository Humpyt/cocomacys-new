import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { ProductCarousel } from '../components/ProductCarousel';
import { CategoryGrid } from '../components/CategoryGrid';
import { PromoBanner } from '../components/PromoBanner';
import { Link } from 'react-router-dom';

// Mock Data
const lovedProducts = [
  {
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400",
    brand: "KARL LAGERFELD PARIS",
    name: "Women's Pleated Floral Printed...",
    price: "$155.99",
    originalPrice: "$208.00",
    discount: "25% off",
    promo: "Earn $10 Star Money",
    rating: 5,
    reviews: 2
  },
  {
    image: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&q=80&w=400",
    brand: "I.N.C. International Concepts",
    name: "Women's Collarless Cotton Twe...",
    price: "$80.15",
    originalPrice: "$114.50",
    discount: "30% off",
    promo: "$10 Star Money for $100",
    rating: 4.5,
    reviews: 26,
    colors: ["#e5e7eb", "#000000", "#f3f4f6", "#d1d5db"]
  },
  {
    image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=400",
    brand: "COACH",
    name: "Chelsea Medium Leather Slim...",
    price: "$325.00",
    promo: "Earn $30 Star Money",
    rating: 4.9,
    reviews: 54,
    colors: ["#d2b48c", "#000000", "#8b4513"]
  },
  {
    image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=400",
    brand: "Sunwin",
    name: "Maddel Large Classic Tote Bag",
    price: "$98.00",
    promo: "$10 Star Money for $100",
    rating: 4.9,
    reviews: 7,
    colors: ["#000000", "#8b0000", "#556b2f", "#f5f5dc"]
  },
  {
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=400",
    brand: "COACH",
    name: "Brooklyn Medium Straw Should...",
    price: "$250.00",
    promo: "Earn $20 Star Money",
    rating: 4,
    reviews: 11,
    colors: ["#d2b48c", "#000000"]
  },
  {
    image: "https://images.unsplash.com/photo-1596462502278-27bf85033e5a?auto=format&fit=crop&q=80&w=400",
    brand: "Carolina Herrera",
    name: "3-Pc. La Bomba Eau de Parfum...",
    price: "$175.00",
    promo: "Earn $10 Star Money\nFree gift with purchase",
    rating: 4.1,
    reviews: 9
  }
];

const trendingProducts = [
  {
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400",
    brand: "Calvin Klein",
    name: "Men's Slim-Fit Wool-Blend...",
    price: "$30.00",
    originalPrice: "$85.00",
    discount: "65% off",
    promo: "$10 Star Money for $100",
    rating: 4.3,
    reviews: 207
  },
  {
    image: "https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&q=80&w=400",
    brand: "Charter Club",
    name: "Signature Bath Towel, 30\" x 56\"",
    price: "$15.00",
    originalPrice: "$30.00",
    discount: "50% off",
    promo: "$10 Star Money for $100",
    rating: 4.6,
    reviews: 907,
    colors: ["#808080", "#ffffff", "#f5f5dc", "#000000", "#000080", "#8b0000"]
  },
  {
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400",
    brand: "CHANEL",
    name: "Natural Finish Loose Powder",
    price: "$60.00",
    rating: 4.6,
    reviews: 103,
    colors: ["#f5deb3", "#deb887", "#d2b48c", "#bc8f8f", "#a0522d"]
  },
  {
    image: "https://images.unsplash.com/photo-1515347619152-145c3298c368?auto=format&fit=crop&q=80&w=400",
    brand: "Calvin Klein",
    name: "Women's Tweed Short-sleeve...",
    price: "$34.00",
    originalPrice: "$99.98",
    discount: "65% off",
    promo: "$10 Star Money for $100",
    rating: 4.2,
    reviews: 137,
    colors: ["#add8e6", "#000000", "#ffffff"]
  },
  {
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=400",
    brand: "Lauren Ralph Lauren",
    name: "Women's Stretch Cotton Boat...",
    price: "$63.00",
    promo: "Free gift with purchase",
    rating: 4.4,
    reviews: 213,
    colors: ["#008000", "#ffffff", "#000000", "#ff0000", "#add8e6"]
  },
  {
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400",
    brand: "Kenneth Cole Reaction",
    name: "Men's Techni-Cole Suit Separat...",
    price: "$54.99",
    originalPrice: "$140.00",
    discount: "59% off",
    promo: "$10 Star Money for $100",
    rating: 4.6,
    reviews: 304,
    colors: ["#000000", "#000080", "#808080", "#a9a9a9", "#2f4f4f"]
  }
];

const clearanceProducts = [
  {
    image: "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&q=80&w=400",
    brand: "J.A. Henckels",
    name: "Dynamic Stainless Steel 14-Pc...",
    price: "Now $98.96",
    originalPrice: "$380.00",
    discount: "73% off",
    promo: "$10 Star Money for $100",
    rating: 4,
    reviews: 77
  },
  {
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400",
    brand: "The North Face",
    name: "Men's Canyonlands Half Zip...",
    price: "Now $40.00",
    originalPrice: "$80.00",
    discount: "50% off",
    promo: "$10 Star Money for $100",
    rating: 4.8,
    reviews: 682
  },
  {
    image: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=400",
    brand: "GreenPan",
    name: "Reserve Healthy Ceramic...",
    price: "Now $329.99",
    originalPrice: "$680.00",
    discount: "51% off",
    promo: "Earn $30 Star Money",
    rating: 4.5,
    reviews: 579,
    colors: ["#000000", "#d3d3d3"]
  },
  {
    image: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=400",
    brand: "Anchor Hocking",
    name: "Rosewater 3-Pc. Mixing Bowl Set",
    price: "Now $14.93",
    originalPrice: "$43.00",
    discount: "65% off",
    promo: "$10 Star Money for $100",
    rating: 2.8,
    reviews: 27
  },
  {
    image: "https://images.unsplash.com/photo-1615486171448-4af4e0311488?auto=format&fit=crop&q=80&w=400",
    brand: "Anchor Hocking",
    name: "20-Piece Bake, Store & Mix Set",
    price: "Now $42.86",
    originalPrice: "$143.00",
    discount: "70% off",
    promo: "$10 Star Money for $100",
    rating: 2.9,
    reviews: 41
  },
  {
    image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=400",
    brand: "UGG®",
    name: "LAST ACT! Corey Reversible...",
    price: "Now $59.93 - $89.93",
    originalPrice: "$120.00",
    discount: "50% off",
    promo: "$10 Star Money for $100",
    rating: 4.6,
    reviews: 173
  }
];

const springCategories = [
  {
    image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=600",
    title: "Warm-weather outfits for the family"
  },
  {
    image: "https://images.unsplash.com/photo-1564859228273-274232fdb516?auto=format&fit=crop&q=80&w=600",
    title: "Swimwear in every style"
  },
  {
    image: "https://images.unsplash.com/photo-1502307100811-6bdc0981a85b?auto=format&fit=crop&q=80&w=600",
    title: "Chic cover-ups to go from the pool to lunch"
  },
  {
    image: "https://images.unsplash.com/photo-1515347619152-145c3298c368?auto=format&fit=crop&q=80&w=600",
    title: "Sun care essentials"
  }
];

const denimCategories = [
  {
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600",
    title: "Wide leg silhouettes"
  },
  {
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600",
    title: "Men's baggy & relaxed silhouettes"
  },
  {
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600",
    title: "Matching sets"
  },
  {
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600",
    title: "Long-length shorts"
  }
];

export function Home() {
  return (
    <main>
      <HeroSection />
      
      <ProductCarousel 
        title="Loved by us, picked for you" 
        tabs={["New arrivals", "Deals for you", "Dressy looks", "Just in: swim", "Spring handbags", "Home refresh"]}
        products={lovedProducts} 
      />
      
      <PromoBanner 
        image="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=2000"
        title="Spring break finds<br/>for fun in the sun"
        buttonText="Shop now"
        align="left"
      />
      
      <CategoryGrid items={springCategories} />
      
      <PromoBanner 
        image="https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&q=80&w=2000"
        title="Denim for him<br/>& her 30% OFF"
        subtitle="Shop fits & trends for the season ahead."
        buttonText="Shop by category ▼"
        align="left"
      />
      
      <CategoryGrid items={denimCategories} />
      
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
        products={trendingProducts} 
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
        products={clearanceProducts} 
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
        products={lovedProducts.slice(0, 5)} 
      />
      
      <ProductCarousel 
        title="Recently viewed items" 
        products={trendingProducts.slice(0, 2)} 
      />
      
    </main>
  );
}
