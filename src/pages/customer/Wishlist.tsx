import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatCurrency } from '../../lib/api';
import { getImageSrc } from '../../lib/images';
import { ProductCard } from '../../components/ProductCard';
import { CustomerSidebar } from '../../components/CustomerSidebar';
import { Heart } from 'lucide-react';
import type { WishlistItem } from '../../lib/api';

function mapToProductCard(item: WishlistItem) {
  return {
    id: String(item.product_id),
    image: getImageSrc(item.images?.[0] || ''),
    brand: item.brand || '',
    name: item.name,
    price: formatCurrency(item.price),
    rating: 0,
    reviews: 0,
  };
}

export function Wishlist() {
  const { customer } = useCustomerAuth();
  const navigate = useNavigate();
  const { items, loading, toggle } = useWishlist();

  if (!customer) {
    navigate('/customer/login', { replace: true });
    return null;
  }

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <CustomerSidebar activePage="wishlist" />

        {/* Main Content */}
        <div className="flex-1">
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-6">My Wishlist</h1>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[3/4] bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
              <Heart size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
              <Link to="/women" className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-orange-700 transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map(item => {
                const card = mapToProductCard(item);
                return (
                  <React.Fragment key={item.id}>
                    <ProductCard
                      id={card.id}
                      image={card.image}
                      brand={card.brand}
                      name={card.name}
                      price={card.price}
                      rating={card.rating}
                      reviews={card.reviews}
                      isWishlisted={true}
                      onToggleWishlist={() => toggle(item.product_id)}
                    />
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
