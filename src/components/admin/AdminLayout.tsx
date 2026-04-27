import React, { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Home, ShoppingBag, LogOut, Layers, Tag, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/collections', icon: Layers, label: 'Collections' },
  { to: '/admin/clearance', icon: Tag, label: 'Clearance' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/homepage-sections', icon: Home, label: 'Homepage' },
  { to: '/admin/import', icon: Upload, label: 'Import' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-800">
          <img src="/coco-logo.png" alt="Cocomacys" className="h-10 w-auto object-contain" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Sign Out */}
        <div className="px-4 py-5 border-t border-gray-800">
          {user && (
            <div className="flex items-center gap-3 mb-3 px-3">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white text-sm font-bold">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.name}</p>
                <p className="text-gray-500 text-xs truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
