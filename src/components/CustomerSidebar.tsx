import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { User, ShoppingBag, Heart, LogOut } from 'lucide-react';

export function CustomerSidebar({ activePage }: { activePage: 'account' | 'orders' | 'wishlist' }) {
  const { customer, logout } = useCustomerAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/customer/login', { replace: true });
  };

  if (!customer) return null;

  const navItems = [
    { page: 'account' as const, label: 'Account Overview', href: '/customer/account', icon: User },
    { page: 'orders' as const, label: 'My Orders', href: '/customer/orders', icon: ShoppingBag },
    { page: 'wishlist' as const, label: 'My Wishlist', href: '/customer/wishlist', icon: Heart },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0">
            {customer.name?.[0]?.toUpperCase() || customer.email[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-sm truncate">{customer.name || 'Welcome'}</h2>
            <p className="text-xs text-gray-500 truncate">{customer.email}</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map(item => {
            const isActive = activePage === item.page;
            const Icon = item.icon;
            return (
              <Link
                key={item.page}
                to={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-orange-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-6 w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
