import React, { useEffect, useState } from 'react';
import { Package, Tag, ShoppingBag, DollarSign } from 'lucide-react';
import { api, formatCurrency, type AdminOrder } from '../../lib/api';

interface Stats {
  totalProducts: number;
  clearanceProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: AdminOrder[];
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    clearanceProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.products.list({ limit: 200 }),
      api.orders.admin({ limit: 5 }),
      api.orders.admin({ limit: 1000 }),
    ])
      .then(([productsData, recentData, allData]) => {
        const clearance = productsData.products.filter(
          p => p.original_price !== null && Number(p.original_price) > Number(p.price)
        ).length;
        const revenue = allData.orders.reduce(
          (sum, o) => sum + parseFloat(o.total || '0'),
          0
        );
        setStats({
          totalProducts: productsData.products.length,
          clearanceProducts: clearance,
          totalOrders: allData.total,
          totalRevenue: revenue,
          recentOrders: recentData.orders.slice(0, 5),
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to the Cocomacys admin panel.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Package className="text-orange-600" size={22} />}
          iconBg="bg-orange-100"
          value={loading ? '—' : stats.totalProducts}
          label="Total Products"
        />
        <StatCard
          icon={<Tag className="text-green-600" size={22} />}
          iconBg="bg-green-100"
          value={loading ? '—' : stats.clearanceProducts}
          label="On Clearance"
        />
        <StatCard
          icon={<ShoppingBag className="text-blue-600" size={22} />}
          iconBg="bg-blue-100"
          value={loading ? '—' : stats.totalOrders}
          label="Total Orders"
        />
        <StatCard
          icon={<DollarSign className="text-emerald-600" size={22} />}
          iconBg="bg-emerald-100"
          value={loading ? '—' : formatCurrency(stats.totalRevenue)}
          label="Total Revenue"
        />
      </div>

      <div className="mt-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Recent Orders</h2>
          <a href="/admin/orders" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
            View all
          </a>
        </div>
        {loading ? (
          <div className="px-6 py-8 text-center text-gray-400">Loading...</div>
        ) : stats.recentOrders.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400">No orders yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Order</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Customer</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Total</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map(order => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">#{order.id}</td>
                  <td className="px-6 py-3 text-gray-600">{order.email || '—'}</td>
                  <td className="px-6 py-3 font-medium">{formatCurrency(parseFloat(order.total || '0'))}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {order.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickLink href="/admin/products" icon={<Package size={24} />} label="Products" />
          <QuickLink href="/admin/products/new" icon={<Package size={24} />} label="Add Product" />
          <QuickLink href="/admin/collections" icon={<Package size={24} />} label="Collections" />
          <QuickLink href="/admin/orders" icon={<ShoppingBag size={24} />} label="Orders" />
          <QuickLink href="/admin/clearance" icon={<Tag size={24} />} label="Clearance" />
          <QuickLink href="/admin/homepage-sections" icon={<Package size={24} />} label="Homepage" />
          <QuickLink href="/admin/import" icon={<Package size={24} />} label="Import" />
          <QuickLink href="/" icon={<ShoppingBag size={24} />} label="View Store" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, iconBg, value, label }: {
  icon: React.ReactNode;
  iconBg: string;
  value: string | number;
  label: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-gray-500 text-sm mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function QuickLink({ href, icon, label }: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a href={href} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-center">
      <div className="text-gray-700">{icon}</div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </a>
  );
}
