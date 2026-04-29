import { Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getColorHex } from '../lib/images';

export interface ProductCardProps {
  id?: string;
  href?: string;
  image: string;
  brand: string;
  name: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  rating: number;
  reviews: number;
  colors?: string[];
  promo?: string;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: number) => void;
}

export function ProductCard({ id, href, image, brand, name, price, originalPrice, discount, rating, reviews, colors, promo, isWishlisted, onToggleWishlist }: ProductCardProps) {
  const productUrl = href || (id != null ? `/product?id=${encodeURIComponent(id)}` : '/product');
  const numericId = id != null ? Number(id) : 0;
  return (
    <Link to={productUrl} className="flex flex-col group cursor-pointer font-sans min-w-[200px] max-w-[280px]">
      <div className="relative aspect-[3/4] mb-3 overflow-hidden bg-gray-100">
        <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <button
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-50"
          onClick={(e) => {
            e.preventDefault();
            onToggleWishlist?.(numericId);
          }}
        >
          <Heart size={18} fill={isWishlisted ? "#ef4444" : "none"} className={isWishlisted ? "text-red-500" : "text-gray-600"} />
        </button>
      </div>
      
      <div className="flex flex-col flex-1">
        <span className="font-bold text-sm mb-1">{brand}</span>
        <span className="text-sm text-gray-700 mb-2 line-clamp-2">{name}</span>
        
        <div className="mt-auto">
          <div className="flex items-baseline space-x-2 mb-1">
            <span className="font-bold text-gray-900">{price}</span>
            {originalPrice && <span className="text-sm text-gray-500 line-through">{originalPrice}</span>}
            {discount && <span className="text-sm text-orange-600">({discount})</span>}
          </div>
          
          {promo && <div className="text-xs text-orange-600 mb-2">{promo}</div>}
          
          {rating > 0 && (
            <div className="flex items-center space-x-1 mb-2">
              <div className="flex text-black">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} fill={i < Math.floor(rating) ? "currentColor" : "none"} className={i < Math.floor(rating) ? "text-black" : "text-gray-300"} />
                ))}
              </div>
              <span className="text-xs text-gray-500">{rating} ({reviews})</span>
            </div>
          )}
          
          {colors && colors.length > 0 && (
            <div className="flex space-x-1 mt-1">
              {colors.map((color, i) => (
                <div key={i} className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: getColorHex(color) }}></div>
              ))}
              {colors.length > 4 && <span className="text-xs text-gray-500 ml-1">+{colors.length - 4}</span>}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
