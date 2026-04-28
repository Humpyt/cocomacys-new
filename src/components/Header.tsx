import React, { useState, useRef, useEffect } from 'react';
import { Search, Gift, ShoppingBag, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useCart } from '../context/CartContext';

export function Header() {
  const { customer, logout } = useCustomerAuth();
  const { itemCount, openDrawer } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  return (
    <header className="border-b border-gray-200 font-sans">
      {/* Top Bar */}
      <div className="bg-black text-white text-xs py-2 px-4 flex justify-between items-center overflow-x-auto whitespace-nowrap">
        <div className="flex space-x-6 mx-auto max-w-[1440px] w-full px-4 sm:px-6 lg:px-8">
          <span className="font-bold">TODAY'S DEALS:</span>
          <span>Up to 60% off Easter deals</span>
          <span>Up to 40% off women's sandals</span>
          <span>Up to 70% off styles for her</span>
          <span>Buy 1, get 1 free toys</span>
          <Link to="/" className="underline ml-auto">See All &gt;</Link>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <button className="lg:hidden" onClick={() => setMobileMenuOpen(true)}><Menu size={24} /></button>
          <Link to="/" className="flex items-center">
            <img src="/coco-logo.png" alt="Cocomacys" className="h-12 w-auto object-contain" />
          </Link>
        </div>

        <div className="flex-1 max-w-2xl mx-8 hidden lg:block">
          <div className="relative">
            <input
              type="text"
              placeholder="What are you looking for?"
              className="w-full border border-gray-300 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:border-black"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>

        <div className="flex items-center space-x-6 flex-1 justify-end text-sm">
          <div className="hidden lg:flex items-center space-x-2">
            <span className="text-gray-600 text-xs text-right leading-tight">See more of<br/>what you love</span>
            {customer ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="bg-black text-white px-4 py-1.5 rounded font-bold flex items-center gap-2"
                >
                  <span>{customer.name?.[0]?.toUpperCase() || customer.email[0].toUpperCase()}</span>
                  <span>{customer.name?.split(' ')[0] || 'Account'}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-bold text-sm truncate">{customer.name || 'My Account'}</p>
                      <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                    </div>
                    <Link
                      to="/customer/account"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-50 font-medium"
                    >
                      Account
                    </Link>
                    <Link
                      to="/customer/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-600"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/customer/login" className="bg-black text-white px-4 py-1.5 rounded font-bold">
                Sign In
              </Link>
            )}
          </div>
          <div className="hidden lg:flex items-center space-x-1 cursor-pointer">
            <Gift size={20} />
            <span className="font-medium">Registry</span>
          </div>
          <div className="cursor-pointer relative" onClick={openDrawer}>
            <ShoppingBag size={24} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {itemCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 hidden lg:flex items-center text-sm font-medium">
        <div className="flex items-center space-x-1 cursor-pointer">
          <Menu size={20} />
          <span>Shop All</span>
        </div>
        <div className="flex space-x-6 ml-8">
          <Link to="/women" className="hover:underline">Women</Link>
          <Link to="/men" className="hover:underline">Men</Link>
          <Link to="/women?category=shoes" className="hover:underline">Shoes</Link>
          <Link to="/women?category=bags" className="hover:underline">Handbags</Link>
          <Link to="/contact" className="hover:underline">Contact</Link>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)}><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                <Link to="/women" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-lg font-medium hover:bg-gray-100 rounded">Women</Link>
                <Link to="/men" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-lg font-medium hover:bg-gray-100 rounded">Men</Link>
                <Link to="/women?category=shoes" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-lg font-medium hover:bg-gray-100 rounded">Shoes</Link>
                <Link to="/women?category=bags" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-lg font-medium hover:bg-gray-100 rounded">Handbags</Link>
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-lg font-medium hover:bg-gray-100 rounded">Contact</Link>
              </div>
              <hr className="my-4" />
              {customer ? (
                <div className="space-y-1">
                  <div className="px-4 py-3 border-b">
                    <p className="font-bold truncate">{customer.name || 'My Account'}</p>
                    <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                  </div>
                  <Link to="/customer/account" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 hover:bg-gray-100 rounded">Account</Link>
                  <Link to="/customer/orders" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 hover:bg-gray-100 rounded">Orders</Link>
                  <button onClick={() => { setMobileMenuOpen(false); logout(); }} className="w-full text-left px-4 py-3 text-gray-600 hover:bg-gray-100 rounded">Sign Out</button>
                </div>
              ) : (
                <Link to="/customer/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center bg-black text-white px-4 py-3 rounded font-bold">Sign In</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
