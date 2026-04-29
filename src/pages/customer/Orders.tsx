import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { formatCurrency } from '../../lib/api';
import { CustomerSidebar } from '../../components/CustomerSidebar';
import { Package } from 'lucide-react';

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
        <CustomerSidebar activePage="orders" />

        {/* Main Content */}
        <div className="flex-1">
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-6">My Orders</h1>

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>)}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
              <Package size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
              <Link to="/women" className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-orange-700 transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-900">Order #{order.id}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(order.total / 100)}</p>
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

                  {order.items && order.items.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {order.items.map(item => (
                        <div key={item.id} className="shrink-0">
                          <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden">
                            {item.images?.[0] && (
                              <img
                                src={item.images[0]}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            )}
                          </div>
                          <p className="text-xs mt-1 max-w-[4rem] truncate text-gray-700">{item.name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
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
