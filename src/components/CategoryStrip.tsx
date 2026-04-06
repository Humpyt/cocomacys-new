import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { getWomenCategoryHref, getMenCategoryHref } from '../lib/navigation';

interface CategoryStripProps {
  sections: Array<{
    key: string;
    title: string;
    image: string;
    gender: 'men' | 'women';
    categorySlug: string;
  }>;
}

export function CategoryStrip({ sections }: CategoryStripProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: number) => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({ left: 300 * direction, behavior: 'smooth' });
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Shop by category</p>

        <div className="relative flex items-center">
          {/* Left arrow */}
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            className="hidden md:flex shrink-0 w-10 h-10 bg-white border border-gray-300 rounded-full items-center justify-center mr-4 hover:bg-gray-50 z-10"
          >
            <span className="text-lg">&lsaquo;</span>
          </button>

          {/* Scrollable cards */}
          <div
            ref={scrollRef}
            className="flex space-x-6 overflow-x-auto pb-2 snap-x snap-start hide-scrollbar"
          >
            {sections.map(section => {
              const href = section.gender === 'women'
                ? getWomenCategoryHref(section.categorySlug)
                : getMenCategoryHref(section.categorySlug);

              return (
                <Link
                  key={section.key}
                  to={href}
                  className="group shrink-0 flex flex-col items-center cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-2 group-hover:scale-105 transition-transform duration-200">
                    <img
                      src={section.image}
                      alt={section.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-medium text-center text-gray-800 group-hover:underline">
                    {section.title}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right arrow */}
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            className="hidden md:flex shrink-0 w-10 h-10 bg-white border border-gray-300 rounded-full items-center justify-center ml-4 hover:bg-gray-50 z-10"
          >
            <span className="text-lg">&rsaquo;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
