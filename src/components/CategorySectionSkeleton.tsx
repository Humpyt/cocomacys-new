import React from 'react';

interface CategorySectionSkeletonProps {
  reverse?: boolean;
}

export function CategorySectionSkeleton({ reverse = false }: CategorySectionSkeletonProps) {
  return (
    <div className={`max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 ${reverse ? '' : ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Image skeleton */}
        <div className={`bg-gray-200 animate-pulse aspect-[3/4] md:aspect-auto md:col-span-1 ${reverse ? 'md:order-last' : ''}`} />

        {/* Content skeleton */}
        <div className="bg-[#fdf3e7] p-8 lg:p-16 flex flex-col justify-center md:col-span-1">
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-4" />
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-8" />
          <div className="flex space-x-4 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="shrink-0 w-[200px] md:w-[240px]">
                <div className="bg-gray-200 animate-pulse aspect-[3/4] rounded mb-2" />
                <div className="h-3 w-20 bg-gray-200 animate-pulse rounded mb-1" />
                <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
