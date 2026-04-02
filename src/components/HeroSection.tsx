import React from 'react';
import { Link } from 'react-router-dom';

export function HeroSection() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
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
            <span className="text-orange-600 text-xl">★</span>
            <span className="font-bold text-lg tracking-wider">Star Rewards</span>
          </div>
        </div>
      </div>
      
      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        <Link to="/product" className="relative aspect-[3/4] bg-gray-100 group cursor-pointer overflow-hidden block">
          <img src="https://images.unsplash.com/photo-1434389678232-040b5015ea39?auto=format&fit=crop&q=80&w=600" alt="30% OFF" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-4 left-4">
            <h3 className="text-2xl font-serif font-bold">30% OFF</h3>
            <p className="text-sm">Need-now new arrivals.</p>
          </div>
        </Link>
        <Link to="/product" className="relative aspect-[3/4] bg-gray-100 group cursor-pointer overflow-hidden block">
          <img src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600" alt="30% OFF" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-4 left-4">
            <h3 className="text-2xl font-serif font-bold">30% OFF</h3>
            <p className="text-sm">New season sandals.</p>
          </div>
        </Link>
        <Link to="/product" className="relative aspect-[3/4] bg-gray-100 group cursor-pointer overflow-hidden block">
          <img src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=600" alt="20-40% OFF" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-4 left-4">
            <h3 className="text-2xl font-serif font-bold">20-40% OFF</h3>
            <p className="text-sm">Beauty boosting arrivals.</p>
          </div>
        </Link>
        <Link to="/product" className="relative aspect-[3/4] bg-gray-100 group cursor-pointer overflow-hidden block">
          <img src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600" alt="40-70% OFF" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-4 left-4">
            <h3 className="text-2xl font-serif font-bold">40-70% OFF</h3>
            <p className="text-sm">Designer suiting from<br/>Ted Baker, Hugo Boss,<br/>Michael Kors & more.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
