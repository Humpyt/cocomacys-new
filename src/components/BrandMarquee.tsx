interface BrandMarqueeProps {
  brands: string[];
}

export function BrandMarquee({ brands }: BrandMarqueeProps) {
  if (brands.length === 0) return null;

  const doubled = [...brands, ...brands];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-2xl font-bold mb-8 text-center">Featured Brands</h2>
      <div className="overflow-hidden relative">
        <div className="flex gap-16 animate-marquee whitespace-nowrap">
          {doubled.map((brand, i) => (
            <h3
              key={i}
              className="text-2xl font-serif font-bold tracking-widest opacity-70 shrink-0"
            >
              {brand}
            </h3>
          ))}
        </div>
      </div>
    </div>
  );
}
