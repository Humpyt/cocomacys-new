import React, { useEffect, useState } from 'react';
import { Package, Tag, ShoppingBag } from 'lucide-react';
import { api } from '../../lib/api';
import { isProductOnSale } from '../../lib/api';

interface Stats {
  totalProducts: number;
  clearanceProducts: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, clearanceProducts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.products.list({ limit: 100 })
      .then(({ products }) => {
        const clearance = products.filter(isProductOnSale).length;
        setStats({ totalProducts: products.length, clearanceProducts: clearance });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to the Cocomacys admin panel.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
            <Package className="text-orange-600" size={22} />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{loading ? '—' : stats.totalProducts}</p>
            <p className="text-gray-500 text-sm mt-0.5">Total Products</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
            <Tag className="text-green-600" size={22} />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{loading ? '—' : stats.clearanceProducts}</p>
            <p className="text-gray-500 text-sm mt-0.5">On Clearance</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <ShoppingBag className="text-blue-600" size={22} />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">—</p>
            <p className="text-gray-500 text-sm mt-0.5">Total Orders</p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <a href="/admin/products" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-center">
            <Package className="text-gray-700" size={24} />
            <span className="text-sm font-medium text-gray-700">Products</span>
          </a>
          <a href="/admin/products/new" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-center">
            <Package className="text-gray-700" size={24} />
            <span className="text-sm font-medium text-gray-700">Add Product</span>
          </a>
          <a href="/admin/homepage-sections" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-center">
            <Package className="text-gray-700" size={24} />
            <span className="text-sm font-medium text-gray-700">Homepage</span>
          </a>
          <a href="/" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-center">
            <ShoppingBag className="text-gray-700" size={24} />
            <span className="text-sm font-medium text-gray-700">View Store</span>
          </a>
        </div>
      </div>
    </div>
  );
}
