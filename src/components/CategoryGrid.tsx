import React from 'react';
import { Link } from 'react-router-dom';

interface CategoryItem {
  image: string;
  title: string;
}

interface CategoryGridProps {
  items: CategoryItem[];
}

export function CategoryGrid({ items }: CategoryGridProps) {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <Link to="/product" key={index} className="group cursor-pointer">
            <div className="relative aspect-[3/4] overflow-hidden mb-3 bg-gray-100">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
            <h3 className="font-medium text-sm md:text-base group-hover:underline">{item.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
