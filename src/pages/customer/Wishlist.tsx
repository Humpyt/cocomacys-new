import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatCurrency, getProductImage, getProductPrice } from '../../lib/api';
import { getImageSrc } from '../../lib/images';
import { ProductCard } from '../../components/ProductCard';
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
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-gray-50 rounded p-6">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
              {customer.name?.[0]?.toUpperCase() || customer.email[0].toUpperCase()}
            </div>
            <h2 className="font-bold text-lg">{customer.name || 'Welcome'}</h2>
            <p className="text-sm text-gray-500">{customer.email}</p>

            <nav className="mt-6 space-y-2">
              <Link to="/customer/account" className="block text-sm text-gray-600 hover:text-black hover:underline">Account Overview</Link>
              <Link to="/customer/orders" className="block text-sm text-gray-600 hover:text-black hover:underline">My Orders</Link>
              <Link to="/customer/wishlist" className="block font-bold text-sm hover:underline">My Wishlist</Link>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <h1 className="text-2xl font-serif font-bold mb-6">My Wishlist</h1>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[3/4] bg-gray-100 rounded"></div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 border border-gray-200 rounded">
              <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
              <Link to="/" className="inline-block bg-black text-white px-6 py-2 font-bold text-sm hover:bg-gray-800">
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
