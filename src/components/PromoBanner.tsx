import { Link } from 'react-router-dom';

interface PromoBannerProps {
  image: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  to?: string;
  align?: 'left' | 'center' | 'right';
  textColor?: string;
  height?: string;
}

export function PromoBanner({
  image,
  title,
  subtitle,
  buttonText,
  to,
  align = 'center',
  textColor = 'text-white',
  height = 'aspect-[21/9] md:aspect-[21/7]'
}: PromoBannerProps) {
  
  const alignClasses = {
    left: 'items-start text-left pl-8 md:pl-16',
    center: 'items-center text-center',
    right: 'items-end text-right pr-8 md:pr-16'
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      <Link to={to || '/product'} className={`relative w-full ${height} bg-gray-100 overflow-hidden group cursor-pointer block`}>
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className={`absolute inset-0 flex flex-col justify-center p-6 bg-black/20 ${alignClasses[align]} ${textColor}`}>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-2 leading-tight" dangerouslySetInnerHTML={{ __html: title }}></h2>
          {subtitle && <p className="text-sm md:text-base mb-6 font-medium">{subtitle}</p>}
          <button className="bg-white text-black px-6 py-2 font-bold hover:bg-gray-100 transition-colors text-sm">
            {buttonText}
          </button>
        </div>
      </Link>
    </div>
  );
}
