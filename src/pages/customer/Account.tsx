import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { formatCurrency } from '../../lib/api';

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

  const handleLogout = async () => {
    await logout();
    navigate('/customer/login', { replace: true });
  };

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
              <Link to="/customer/account" className="block font-bold text-sm hover:underline">Account Overview</Link>
              <Link to="/customer/orders" className="block text-sm text-gray-600 hover:text-black hover:underline">My Orders</Link>
            </nav>

            <button
              onClick={handleLogout}
              className="mt-6 w-full border border-black py-2 text-sm font-bold hover:bg-black hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <h1 className="text-2xl font-serif font-bold mb-6">Account Overview</h1>

          {/* Order History */}
          <div className="bg-white border border-gray-200 rounded p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Recent Orders</h2>
              {orders.length > 0 && (
                <Link to="/customer/orders" className="text-sm underline">View all orders</Link>
              )}
            </div>

            {loadingOrders ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-100 rounded"></div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No orders yet.</p>
                <Link to="/" className="inline-block mt-4 bg-black text-white px-6 py-2 font-bold text-sm hover:bg-gray-800">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-sm">Order #{order.id}</p>
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
                    {order.items && order.items[0] && (
                      <div className="flex items-center gap-3">
                        {order.items[0].images?.[0] && (
                          <img
                            src={order.items[0].images[0]}
                            alt={order.items[0].name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <p className="text-sm text-gray-600">
                          {order.items[0].name}
                          {order.items.length > 1 && ` +${order.items.length - 1} more item${order.items.length > 2 ? 's' : ''}`}
                        </p>
                      </div>
                    )}
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
