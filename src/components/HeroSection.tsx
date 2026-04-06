import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMenCategoryHref, getWomenCategoryHref } from '../lib/navigation';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=2000',
    title: 'Spring Fashion',
    subtitle: "Discover the season's freshest looks",
    buttonText: 'Shop Now',
    link: '/women',
  },
  {
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=2000',
    title: "Men's Essentials",
    subtitle: 'Elevate your everyday style',
    buttonText: 'Shop Men',
    link: '/men',
  },
  {
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=2000',
    title: 'Handbag Highlights',
    subtitle: 'Fresh carryalls and polished finishing touches',
    buttonText: 'Shop Handbags',
    link: getWomenCategoryHref('bags'),
  },
  {
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&q=80&w=2000',
    title: 'Layering Essentials',
    subtitle: 'Outer layers and polished toppers for the season',
    buttonText: 'Shop Layers',
    link: getWomenCategoryHref('waistcoats'),
  },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      {/* Hero Slider */}
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-lg mb-8 group">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        ))}

        {/* Text Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-4 drop-shadow-lg">
            {slides[current].title}
          </h1>
          <p className="text-lg md:text-2xl mb-8 drop-shadow-md">
            {slides[current].subtitle}
          </p>
          <Link
            to={slides[current].link}
            className="bg-white text-black px-10 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            {slides[current].buttonText}
          </Link>
        </div>

        {/* Arrow Buttons */}
        <button
          type="button"
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} className="text-black" />
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Next slide"
        >
          <ChevronRight size={24} className="text-black" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition-all ${i === current ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Bonus Days Banner */}
      <div className="border border-orange-600 flex flex-col md:flex-row items-center mb-12">
        <div className="bg-white px-8 py-4 flex flex-col items-center justify-center border-r border-orange-600 min-w-[200px]">
          <h3 className="text-2xl font-serif font-bold text-orange-600">Bonus Days</h3>
          <p className="text-sm font-bold">Now-Apr. 6</p>
        </div>
        <div className="flex-1 px-8 py-4 flex flex-col md:flex-row items-center justify-between bg-gray-50">
          <div>
            <h4 className="text-xl font-bold mb-1">Get $10 in Star Money <span className="italic text-orange-600">faster</span></h4>
            <p className="text-xs text-gray-600">(that's 1,000 points) for every qualifying $75 spent with a Macy's Card or $100 spent as a Bronze member. Exclusions & details</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <span className="text-orange-600 text-xl">*</span>
            <span className="font-bold text-lg tracking-wider">Star Rewards</span>
          </div>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {/* Women's Shoes */}
        <Link to={getWomenCategoryHref('shoes')} className="relative aspect-[3/4] bg-gray-100 group cursor-pointer overflow-hidden block">
          <img
            src="/homeposters/ladies-shoes.png"
            alt="Women's Shoes"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-4 left-4 bg-white text-black text-xs font-bold px-2 py-1">30% OFF</div>
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-2xl font-serif font-bold mb-1">Walk This Way</h3>
            <p className="text-sm opacity-90">Fresh sandals and everyday picks you'll live in.</p>
          </div>
        </Link>

        {/* Women's Blouses */}
        <Link to={getWomenCategoryHref('blouses')} className="relative aspect-[3/4] bg-gray-100 group cursor-pointer overflow-hidden block">
          <img
            src="/homeposters/women-blouse.png"
            alt="Women's Blouses"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-4 left-4 bg-white text-black text-xs font-bold px-2 py-1">20% OFF</div>
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-2xl font-serif font-bold mb-1">Top That</h3>
            <p className="text-sm opacity-90">Effortless blouses for the season ahead.</p>
          </div>
        </Link>

        {/* Handbags */}
        <Link to={getWomenCategoryHref('bags')} className="relative aspect-[3/4] bg-gray-100 group cursor-pointer overflow-hidden block">
          <img
            src="/homeposters/handbag.png"
            alt="Handbags"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-4 left-4 bg-white text-black text-xs font-bold px-2 py-1">25% OFF</div>
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-2xl font-serif font-bold mb-1">Bag This</h3>
            <p className="text-sm opacity-90">Polished carryalls worth the carry.</p>
          </div>
        </Link>

        {/* Men's Shirts */}
        <Link to={getMenCategoryHref('shirts')} className="relative aspect-[3/4] bg-gray-100 group cursor-pointer overflow-hidden block">
          <img
            src="/homeposters/mens-shirt.png"
            alt="Men's Shirts"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-4 left-4 bg-white text-black text-xs font-bold px-2 py-1">30% OFF</div>
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-2xl font-serif font-bold mb-1">Button It Up</h3>
            <p className="text-sm opacity-90">From kickoff to the office — shirts that mean business.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
