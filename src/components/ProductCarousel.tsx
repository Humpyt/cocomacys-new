import React from 'react';
import { ProductCard } from './ProductCard';

interface ProductCarouselProps {
  title: string;
  tabs?: string[];
  products: any[];
  displayMode?: 'carousel' | 'grid';
}

export function ProductCarousel({ title, tabs, products, displayMode = 'carousel' }: ProductCarouselProps) {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <h2 className="text-2xl font-serif font-bold mb-6">{title}</h2>

      {tabs && displayMode === 'carousel' && (
        <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`px-4 py-1.5 text-sm font-bold whitespace-nowrap rounded-full ${
                index === 0 ? 'bg-black text-white' : 'bg-white text-black border border-gray-300 hover:border-black'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {displayMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </div>
      ) : (
        <div className="relative group">
          <div className="flex space-x-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
            {products.map((product, index) => (
              <div key={index} className="snap-start shrink-0 w-[200px] md:w-[240px] lg:w-[280px]">
                <ProductCard {...product} />
              </div>
            ))}
          </div>

          <button className="absolute left-0 top-1/3 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <span className="text-xl">&lt;</span>
          </button>
          <button className="absolute right-0 top-1/3 -translate-y-1/2 translate-x-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <span className="text-xl">&gt;</span>
          </button>
        </div>
      )}
    </div>
  );
}
