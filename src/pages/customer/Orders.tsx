import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { formatCurrency } from '../../lib/api';

interface OrderItem {
  id: string;
  name: string;
  brand: string;
  quantity: number;
  unit_price: number;
  images: string[];
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  payment_status: string;
  total: number;
  subtotal: number;
  shipping_address: unknown;
  items: OrderItem[];
}

export function CustomerOrders() {
  const { customer } = useCustomerAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customer, navigate]);

  if (!customer) return null;

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
              <Link to="/customer/orders" className="block font-bold text-sm hover:underline">My Orders</Link>
              <Link to="/customer/wishlist" className="block text-sm text-gray-600 hover:text-black hover:underline">My Wishlist</Link>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <h1 className="text-2xl font-serif font-bold mb-6">My Orders</h1>

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded"></div>)}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 border border-gray-200 rounded">
              <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
              <Link to="/" className="inline-block bg-black text-white px-6 py-2 font-bold text-sm hover:bg-gray-800">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border border-gray-200 rounded p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold">Order #{order.id}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(order.total / 100)}</p>
                      <p className={`text-xs font-bold ${
                        order.status === 'confirmed' ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {order.status.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {order.items.map(item => (
                        <div key={item.id} className="shrink-0">
                          {item.images?.[0] && (
                            <img
                              src={item.images[0]}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          )}
                          <p className="text-xs mt-1 max-w-16 truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
