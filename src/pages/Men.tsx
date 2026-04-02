import React from 'react';
import { ProductCarousel } from '../components/ProductCarousel';
import { CategoryGrid } from '../components/CategoryGrid';
import { PromoBanner } from '../components/PromoBanner';
import { Link } from 'react-router-dom';

// Mock Data for Men's Page
const mensProducts = [
  {
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=400",
    brand: "Calvin Klein",
    name: "Men's Slim-Fit Stretch Suit",
    price: "$199.99",
    originalPrice: "$395.00",
    discount: "49% off",
    promo: "Earn $20 Star Money",
    rating: 4.6,
    reviews: 128,
    colors: ["#000080", "#000000", "#808080"]
  },
  {
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=400",
    brand: "Polo Ralph Lauren",
    name: "Classic Fit Oxford Shirt",
    price: "$98.50",
    promo: "$10 Star Money for $100",
    rating: 4.8,
    reviews: 342,
    colors: ["#ffffff", "#add8e6", "#ffb6c1"]
  },
  {
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=400",
    brand: "Levi's",
    name: "501 Original Fit Jeans",
    price: "$59.50",
    originalPrice: "$79.50",
    discount: "25% off",
    promo: "Buy 1, Get 1 50% Off",
    rating: 4.7,
    reviews: 856,
    colors: ["#000080", "#000000", "#add8e6"]
  },
  {
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=400",
    brand: "Cole Haan",
    name: "Men's OriginalGrand Wingtip",
    price: "$110.00",
    originalPrice: "$160.00",
    discount: "31% off",
    promo: "Earn $10 Star Money",
    rating: 4.5,
    reviews: 215,
    colors: ["#8b4513", "#000000"]
  },
  {
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=400",
    brand: "Citizen",
    name: "Men's Eco-Drive Chronograph",
    price: "$250.00",
    promo: "Earn $20 Star Money",
    rating: 4.9,
    reviews: 89,
    colors: ["#c0c0c0", "#ffd700"]
  },
  {
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&q=80&w=400",
    brand: "Giorgio Armani",
    name: "Acqua di Giò Eau de Toilette",
    price: "$95.00",
    promo: "Free gift with purchase",
    rating: 4.8,
    reviews: 1205
  }
];

const mensCategories = [
  {
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600",
    title: "Shirts"
  },
  {
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600",
    title: "Pants & Jeans"
  },
  {
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600",
    title: "Suits & Separates"
  },
  {
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600",
    title: "Activewear"
  },
  {
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600",
    title: "Outerwear"
  },
  {
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=600",
    title: "Shoes"
  },
  {
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600",
    title: "Accessories"
  },
  {
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&q=80&w=600",
    title: "Cologne"
  }
];

export function Men() {
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
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          <div className="relative z-10 p-8 md:p-16 max-w-2xl text-white">
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4">Men's Clothing</h1>
            <p className="text-xl md:text-2xl mb-8">Elevate your everyday style with our latest collections.</p>
            <button className="bg-white text-black px-8 py-3 font-bold hover:bg-gray-100 transition-colors">
              Shop New Arrivals
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mensCategories.map((category, index) => (
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
        image="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=2000"
        title="The Suit Shop"
        subtitle="Look sharp for any occasion with our tailored fits."
        buttonText="Shop Suits"
        align="right"
      />

      <ProductCarousel 
        title="Trending in Men's" 
        tabs={["Best Sellers", "New Arrivals", "Sale"]}
        products={mensProducts} 
      />

      {/* Featured Brands */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Featured Brands</h2>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-70">
          <h3 className="text-2xl font-serif font-bold tracking-widest">POLO RALPH LAUREN</h3>
          <h3 className="text-2xl font-serif font-bold tracking-widest">TOMMY HILFIGER</h3>
          <h3 className="text-2xl font-serif font-bold tracking-widest">CALVIN KLEIN</h3>
          <h3 className="text-2xl font-serif font-bold tracking-widest">HUGO BOSS</h3>
          <h3 className="text-2xl font-serif font-bold tracking-widest">LEVI'S</h3>
        </div>
      </div>
    </main>
  );
}
