import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatCurrency } from '../../lib/api';
import { CustomerSidebar } from '../../components/CustomerSidebar';
import { Package, Heart, Clock, ChevronRight } from 'lucide-react';

interface Order {
  id: string;
  created_at: string;
  status: string;
  payment_status: string;
  total: number;
  subtotal: number;
  items: Array<{
    id: string;
    name: string;
    brand: string;
    quantity: number;
    unit_price: number;
    images: string[];
  }>;
}

export function Account() {
  const { customer, logout } = useCustomerAuth();
  const navigate = useNavigate();
  const { items: wishlistItems } = useWishlist();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!customer) {
      navigate('/customer/login', { replace: true });
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders?customer_id=${customer.id}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch {
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [customer, navigate]);

  if (!customer) return null;

  const latestOrder = orders[0];
  const greeting = customer.name ? `Welcome back, ${customer.name.split(' ')[0]}` : 'Welcome back';

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: Package, color: 'bg-orange-50 text-orange-600' },
    { label: 'Wishlist Items', value: wishlistItems.length, icon: Heart, color: 'bg-red-50 text-red-500' },
    {
      label: 'Latest Order',
      value: latestOrder ? latestOrder.status.replace(/^\w/, c => c.toUpperCase()) : '—',
      icon: Clock,
      color: 'bg-green-50 text-green-600',
    },
  ];

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <CustomerSidebar activePage="account" />

        {/* Main Content */}
        <div className="flex-1">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl font-serif font-bold text-gray-900">{greeting}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {stats.map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Browse Women', href: '/women' },
              { label: 'Browse Men', href: '/men' },
              { label: 'My Orders', href: '/customer/orders' },
              { label: 'My Wishlist', href: '/customer/wishlist' },
            ].map(link => (
              <Link
                key={link.label}
                to={link.href}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:border-orange-300 hover:bg-orange-50 transition-colors"
              >
                {link.label}
                <ChevronRight size={14} className="text-gray-400" />
              </Link>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
              {orders.length > 0 && (
                <Link to="/customer/orders" className="text-sm text-orange-600 hover:underline font-medium">View all</Link>
              )}
            </div>

            {loadingOrders ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-100 rounded-lg" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10">
                <Package size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No orders yet.</p>
                <Link
                  to="/women"
                  className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-orange-700 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    {/* Product thumbnail */}
                    <div className="w-14 h-14 shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                      {order.items?.[0]?.images?.[0] ? (
                        <img
                          src={order.items[0].images[0]}
                          alt={order.items[0].name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package size={20} />
                        </div>
                      )}
                    </div>

                    {/* Order info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm">Order #{order.id}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'long', day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-sm">{formatCurrency(order.total / 100)}</p>
                          <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
                            order.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                            order.status === 'delivered' ? 'bg-blue-50 text-blue-700' :
                            order.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {order.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      {order.items && order.items[0] && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {order.items[0].name}
                          {order.items.length > 1 && ` +${order.items.length - 1} more`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
