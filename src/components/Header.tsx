import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useCart } from '../context/CartContext';
import { api, formatCurrency, getProductPrice, type ApiProductRecord } from '../lib/api';
import { getImageSrc } from '../lib/images';

export function Header() {
  const { customer, logout } = useCustomerAuth();
  const { itemCount, openDrawer } = useCart();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ApiProductRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchRefMobile = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>();

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    setIsSearching(true);
    try {
      const { products } = await api.products.list({ search: q.trim(), limit: 8 });
      setSearchResults(products);
      setSearchOpen(true);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => performSearch(value), 300);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
      (e.currentTarget as HTMLInputElement).blur();
    }
  };

  const selectResult = (productId: number) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/product?id=${encodeURIComponent(String(productId))}`);
  };

  // Close search on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const inDesktop = searchRef.current?.contains(e.target as Node);
      const inMobile = searchRefMobile.current?.contains(e.target as Node);
      if (!inDesktop && !inMobile) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
          <span className="font-bold">THE COCO EDIT:</span>
          <span>Handpicked styles, delivered fresh weekly</span>
          <span>Quality pieces from the world's best brands</span>
          <span>Curated fashion — no filler, just flair</span>
          <span>Shop Forest Mall · Lugogo · BF-10</span>
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

        <div className="flex-1 max-w-2xl mx-8 hidden lg:block" ref={searchRef}>
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => { if (searchResults.length > 0) setSearchOpen(true); }}
              className="w-full border border-gray-300 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:border-black"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />

            {/* Search Results Dropdown */}
            {searchOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-6 text-center text-gray-500 text-sm">
                    No products found for "{searchQuery}"
                  </div>
                ) : (
                  <>
                    <div className="max-h-[420px] overflow-y-auto">
                      {searchResults.map(product => (
                        <button
                          key={product.id}
                          onClick={() => selectResult(Number(product.id))}
                          className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
                        >
                          <div className="w-12 h-12 shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                            <img
                              src={getImageSrc(product.images?.[0])}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const t = e.target as HTMLImageElement;
                                t.style.display = 'none';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.brand || product.category || '—'}</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 shrink-0">
                            {formatCurrency(getProductPrice(product))}
                          </p>
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50">
                      <p className="text-xs text-gray-400">
                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} — type more to refine
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
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

      {/* Mobile Search */}
      <div className="px-4 pb-3 lg:hidden" ref={searchRefMobile}>
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="What are you looking for?"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => { if (searchResults.length > 0) setSearchOpen(true); }}
            className="w-full border border-gray-300 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-black"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />

          {searchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black" />
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-6 text-center text-gray-500 text-sm">
                  No products found for "{searchQuery}"
                </div>
              ) : (
                <>
                  <div className="max-h-[340px] overflow-y-auto">
                    {searchResults.map(product => (
                      <button
                        key={product.id}
                        onClick={() => selectResult(Number(product.id))}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
                      >
                        <div className="w-10 h-10 shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                          <img
                            src={getImageSrc(product.images?.[0])}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const t = e.target as HTMLImageElement;
                              t.style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.brand || product.category || '—'}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 shrink-0">
                          {formatCurrency(getProductPrice(product))}
                        </p>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
                    <p className="text-xs text-gray-400">
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 hidden lg:flex items-center text-sm font-medium">
        <Link to="/" className="flex items-center space-x-1 hover:underline">
          <Menu size={20} />
          <span>Home</span>
        </Link>
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
