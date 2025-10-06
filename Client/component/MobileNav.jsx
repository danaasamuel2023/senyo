'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../app/providers/ThemeProvider';
import {
  Home,
  ShoppingCart,
  User,
  Menu,
  X,
  Settings,
  LogOut,
  Wallet,
  Package,
  TrendingUp,
  Sun,
  Moon,
  ChevronRight,
  Search,
  Bell,
  Store,
  Shield,
  Phone,
  MessageSquare,
  ArrowLeft,
  QrCode,
  Grid3x3,
  Zap
} from 'lucide-react';

export default function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  // Check authentication and user data
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, [pathname]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    if (isMenuOpen || isSearchOpen) {
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isSearchOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUserData(null);
    setIsMenuOpen(false);
    router.push('/SignIn');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/', requireAuth: true },
    { icon: Store, label: 'Store', path: '/store', badge: 'NEW' },
    { icon: Package, label: 'MTN Data', path: '/mtnup2u' },
    { icon: Phone, label: 'AirtelTigo', path: '/at-ishare' },
    { icon: Zap, label: 'Telecel', path: '/TELECEL', badge: 'NEW' },
    { icon: Grid3x3, label: 'Bulk Purchase', path: '/bulk-purchase', badge: 'HOT' },
    { icon: Wallet, label: 'Top Up', path: '/topup', requireAuth: true },
    { icon: ShoppingCart, label: 'My Orders', path: '/myorders', requireAuth: true },
    { icon: TrendingUp, label: 'Analytics', path: '/analytics', requireAuth: true },
    { icon: Settings, label: 'Settings', path: '/settings', requireAuth: true },
  ];

  // Hide on certain pages
  const hideNavPaths = ['/admin', '/agent/dashboard'];
  if (hideNavPaths.some(path => pathname.startsWith(path))) {
    return null;
  }

  return (
    <>
      {/* Mobile Header */}
      <header 
        className={`
          fixed top-0 left-0 right-0 z-50 md:hidden
          transition-all duration-300 safe-top
          ${scrolled 
            ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-lg' 
            : 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-lg'
          }
        `}
      >
        <div className="flex items-center justify-between px-4 h-14">
          {/* Left Section - Menu & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 -ml-2 rounded-xl touch-target active:scale-95 transition-transform"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#FFCC08] to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-black font-black text-sm">UD</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight">UnlimitedData</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">Premium Data</span>
              </div>
            </Link>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-1">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-xl touch-target active:scale-95 transition-transform"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            {userData && (
              <button
                onClick={() => router.push('/notifications')}
                className="p-2 rounded-xl touch-target active:scale-95 transition-transform relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl touch-target active:scale-95 transition-transform"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar - Expandable */}
        <div 
          ref={searchRef}
          className={`
            absolute top-full left-0 right-0 bg-white dark:bg-gray-950 
            border-t border-gray-200 dark:border-gray-800
            transition-all duration-300 overflow-hidden
            ${isSearchOpen ? 'h-16' : 'h-0'}
          `}
        >
          <form onSubmit={handleSearch} className="flex items-center px-4 h-16">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services, orders..."
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
              autoFocus={isSearchOpen}
            />
            <button
              type="submit"
              className="ml-2 px-4 py-2 bg-[#FFCC08] text-black rounded-xl font-semibold active:scale-95 transition-transform"
            >
              Search
            </button>
          </form>
        </div>
      </header>

      {/* Slide-out Menu */}
      <div
        className={`
          fixed inset-0 z-[60] md:hidden transition-all duration-300
          ${isMenuOpen ? 'visible' : 'invisible'}
        `}
      >
        {/* Backdrop */}
        <div 
          className={`
            absolute inset-0 bg-black transition-opacity duration-300
            ${isMenuOpen ? 'opacity-50' : 'opacity-0'}
          `}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu Panel */}
        <aside
          ref={menuRef}
          className={`
            absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw]
            bg-white dark:bg-gray-950 
            transition-transform duration-300 transform
            ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            shadow-2xl overflow-y-auto
          `}
        >
          {/* User Profile Section */}
          <div className="bg-gradient-to-br from-[#FFCC08] to-yellow-600 p-6 safe-top">
            {userData ? (
              <div className="space-y-3">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{userData.name || userData.email}</p>
                  <p className="text-white/80 text-sm">{userData.phone || userData.email}</p>
                </div>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <Wallet className="w-4 h-4" />
                  <span>Balance: ₵{userData.balance || '0.00'}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">Welcome!</p>
                  <p className="text-white/80 text-sm">Sign in to access all features</p>
                </div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push('/SignIn');
                  }}
                  className="w-full py-2 bg-white/20 text-white rounded-lg font-semibold active:scale-95 transition-transform"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {userData && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push('/topup');
                  }}
                  className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl active:scale-95 transition-transform"
                >
                  <Wallet className="w-5 h-5 mb-1 text-[#FFCC08]" />
                  <span className="text-xs">Top Up</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push('/qr-pay');
                  }}
                  className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl active:scale-95 transition-transform"
                >
                  <QrCode className="w-5 h-5 mb-1 text-[#FFCC08]" />
                  <span className="text-xs">QR Pay</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push('/support');
                  }}
                  className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl active:scale-95 transition-transform"
                >
                  <MessageSquare className="w-5 h-5 mb-1 text-[#FFCC08]" />
                  <span className="text-xs">Support</span>
                </button>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <nav className="p-4">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                const isDisabled = item.requireAuth && !userData;

                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      if (!isDisabled) {
                        setIsMenuOpen(false);
                        router.push(item.path);
                      } else {
                        router.push('/SignIn');
                      }
                    }}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-xl
                      transition-all duration-200 active:scale-98
                      ${isActive 
                        ? 'bg-[#FFCC08] text-black' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-900'
                      }
                      ${isDisabled ? 'opacity-50' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className={`
                          px-2 py-0.5 text-[10px] font-bold rounded-full
                          ${item.badge === 'NEW' ? 'bg-green-500 text-white' : ''}
                          ${item.badge === 'HOT' ? 'bg-red-500 text-white' : ''}
                        `}>
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Admin Access */}
          {userData?.role === 'admin' && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push('/admin');
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl active:scale-95 transition-transform"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">Admin Panel</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Logout */}
          {userData && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 safe-bottom">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold active:scale-95 transition-transform"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* App Version */}
          <div className="p-4 text-center text-xs text-gray-500 dark:text-gray-400">
            UnlimitedData GH v2.0.0
          </div>
        </aside>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-14 md:hidden safe-top" />
    </>
  );
}