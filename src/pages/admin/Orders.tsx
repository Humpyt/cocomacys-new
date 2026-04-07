import React from 'react';
import { ShoppingBag } from 'lucide-react';

export function Orders() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-1">Manage customer orders.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="text-gray-400" size={28} />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Orders management coming soon</h2>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Order management functionality is under development. Check back later.
        </p>
      </div>
    </div>
  );
}
