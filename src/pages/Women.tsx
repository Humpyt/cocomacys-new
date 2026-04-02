import React from 'react';
import { ProductCarousel } from '../components/ProductCarousel';
import { CategoryGrid } from '../components/CategoryGrid';
import { PromoBanner } from '../components/PromoBanner';
import { Link } from 'react-router-dom';

// Mock Data for Women's Page
const womensProducts = [
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
    image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&q=80&w=400",
    brand: "Tommy Hilfiger",
    name: "Women's V-Neck Midi Dress",
    price: "$89.50",
    promo: "Earn $10 Star Money",
    rating: 4.7,
    reviews: 89,
    colors: ["#000080", "#ff0000", "#ffffff"]
  },
  {
    image: "https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&q=80&w=400",
    brand: "DKNY",
    name: "Women's Faux-Leather Moto Jacket",
    price: "$120.00",
    originalPrice: "$150.00",
    discount: "20% off",
    rating: 4.8,
    reviews: 156,
    colors: ["#000000", "#8b0000"]
  }
];

const womensCategories = [
  {
    image: "https://images.unsplash.com/photo-1515347619152-145c3298c368?auto=format&fit=crop&q=80&w=600",
    title: "Dresses"
  },
  {
    image: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&q=80&w=600",
    title: "Tops"
  },
  {
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600",
    title: "Jeans"
  },
  {
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=600",
    title: "Activewear"
  },
  {
    image: "https://images.unsplash.com/photo-1564859228273-274232fdb516?auto=format&fit=crop&q=80&w=600",
    title: "Swimwear"
  },
  {
    image: "https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&q=80&w=600",
    title: "Coats & Jackets"
  },
  {
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=600",
    title: "Handbags"
  },
  {
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600",
    title: "Shoes"
  }
];

export function Women() {
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
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative z-10 p-8 md:p-16 max-w-2xl text-white">
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4">Women's Clothing</h1>
            <p className="text-xl md:text-2xl mb-8">Discover the latest trends and everyday essentials.</p>
            <button className="bg-white text-black px-8 py-3 font-bold hover:bg-gray-100 transition-colors">
              Shop New Arrivals
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {womensCategories.map((category, index) => (
            <Link to="/product" key={index} className="group cursor-pointer">
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
        align="right"
      />

      <ProductCarousel 
        title="Trending in Women's" 
        tabs={["Best Sellers", "New Arrivals", "Sale"]}
        products={womensProducts} 
      />

      {/* Featured Brands */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Featured Brands</h2>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-70">
          <h3 className="text-2xl font-serif font-bold tracking-widest">CALVIN KLEIN</h3>
          <h3 className="text-2xl font-serif font-bold tracking-widest">RALPH LAUREN</h3>
          <h3 className="text-2xl font-serif font-bold tracking-widest">MICHAEL KORS</h3>
          <h3 className="text-2xl font-serif font-bold tracking-widest">TOMMY HILFIGER</h3>
          <h3 className="text-2xl font-serif font-bold tracking-widest">DKNY</h3>
        </div>
      </div>
    </main>
  );
}
