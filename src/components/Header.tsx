import React from 'react';
import { Search, MapPin, Gift, ShoppingBag, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="border-b border-gray-200 font-sans">
      {/* Top Bar */}
      <div className="bg-black text-white text-xs py-2 px-4 flex justify-between items-center overflow-x-auto whitespace-nowrap">
        <div className="flex space-x-6 mx-auto max-w-[1440px] w-full px-4 sm:px-6 lg:px-8">
          <span className="font-bold">TODAY'S DEALS:</span>
          <span>Up to 60% off Easter deals</span>
          <span>Up to 40% off women's sandals</span>
          <span>Up to 70% off styles for her</span>
          <span>Buy 1, get 1 free toys</span>
          <Link to="/" className="underline ml-auto">See All &gt;</Link>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <button className="lg:hidden"><Menu size={24} /></button>
          <Link to="/" className="flex items-center">
            <img src="/coco-logo.png" alt="Cocomacys" className="h-12 w-auto object-contain" />
          </Link>
        </div>

        <div className="flex-1 max-w-2xl mx-8 hidden lg:block">
          <div className="relative">
            <input
              type="text"
              placeholder="What are you looking for?"
              className="w-full border border-gray-300 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:border-black"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>

        <div className="flex items-center space-x-6 flex-1 justify-end text-sm">
          <div className="hidden lg:flex items-center space-x-2">
            <span className="text-gray-600 text-xs text-right leading-tight">See more of<br/>what you love</span>
            <button className="bg-black text-white px-4 py-1.5 rounded font-bold">Sign In</button>
          </div>
          <div className="hidden lg:flex items-center space-x-1 cursor-pointer">
            <Gift size={20} />
            <span className="font-medium">Registry</span>
          </div>
          <div className="cursor-pointer relative">
            <ShoppingBag size={24} />
            <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">0</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 hidden lg:flex items-center text-sm font-medium">
        <div className="flex items-center space-x-1 cursor-pointer">
          <Menu size={20} />
          <span>Shop All</span>
        </div>
        <div className="flex space-x-6 ml-8">
          <Link to="/women" className="hover:underline">Women</Link>
          <Link to="/men" className="hover:underline">Men</Link>
          <Link to="/women?category=shoes" className="hover:underline">Shoes</Link>
          <Link to="/women?category=bags" className="hover:underline">Handbags</Link>
          <Link to="/contact" className="hover:underline">Contact</Link>
        </div>
      </nav>
    </header>
  );
}
