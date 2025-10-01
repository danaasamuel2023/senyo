'use client'
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  LayoutDashboard, 
  Layers, 
  User,
  CreditCard,
  LogOut,
  ChevronRight,
  ShoppingCart,
  BarChart2,
  Menu,
  X,
  Zap,
  Sparkles,
  Activity,
  TrendingUp,
  Settings,
  Wallet,
  Globe,
  Shield,
  ArrowRight,
  Star,
  Flame,
  Phone,
  MessageSquare,
  Bell,
  Package,
  Sun,
  Moon,
  Cpu,
  Signal,
  Wifi,
  Server,
  Users,
  FileText,
  HelpCircle,
  Crown,
  Rocket,
  Gift,
  ChevronDown,
  Lock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload,
  Database
} from 'lucide-react';

// Constants
const THEME_KEY = 'app_theme';
const USER_DATA_KEY = 'userData';
const AUTH_TOKEN_KEY = 'authToken';
const NOTIFICATION_CHECK_INTERVAL = 60000; // 1 minute

// Service URLs
const SERVICES = {
  AIRTELTIGO: '/at-ishare',
  MTN: '/mtnup2u',
  TELECEL: '/TELECEL',
  BULK: '/bulk-purchase',
  AT_BIGTIME: '/at-big-time'
};

// Navigation structure
const NAVIGATION_CONFIG = {
  main: [
    { id: 'dashboard', icon: LayoutDashboard, text: 'Dashboard', path: '/', requiresAuth: true },
    { id: 'admin', icon: Shield, text: 'Admin Panel', path: '/admin', requiresAuth: true, requiresRole: 'admin', badge: 'ADMIN' }
  ],
  services: [
    { id: 'airteltigo', icon: Globe, text: 'AirtelTigo', path: SERVICES.AIRTELTIGO, gradient: 'from-red-500 to-blue-600' },
    { id: 'mtn', icon: Phone, text: 'MTN Data', path: SERVICES.MTN, gradient: 'from-yellow-400 to-yellow-600' },
    { id: 'telecel', icon: Layers, text: 'Telecel', path: SERVICES.TELECEL, isNew: true, gradient: 'from-blue-600 to-blue-800' },
    { id: 'bulk', icon: Package, text: 'Bulk Purchase', path: SERVICES.BULK, badge: 'HOT', gradient: 'from-red-600 to-orange-600' },
    { id: 'bigtime', icon: Sparkles, text: 'AT Big Time', path: SERVICES.AT_BIGTIME, disabled: true, gradient: 'from-purple-600 to-pink-600' }
  ],
  finance: [
    { id: 'topup', icon: CreditCard, text: 'Top Up Wallet', path: '/topup', requiresAuth: true },
    { id: 'transactions', icon: ShoppingCart, text: 'Transactions', path: '/myorders', requiresAuth: true },
    { id: 'analytics', icon: TrendingUp, text: 'Analytics', path: '/analytics', requiresAuth: true }
  ],
  support: [
    { id: 'reports', icon: BarChart2, text: 'Reports', path: '/reports', disabled: true },
    { id: 'settings', icon: Settings, text: 'Settings', path: '/settings' },
    { id: 'help', icon: HelpCircle, text: 'Help Center', path: '/help' }
  ]
};

// Custom hooks
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const user = JSON.parse(localStorage.getItem(USER_DATA_KEY) || '{}');
        
        setIsAuthenticated(!!token);
        setUserData(user);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    
    // Listen for storage changes (for multi-tab sync)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const logout = useCallback(() => {
    [AUTH_TOKEN_KEY, USER_DATA_KEY, 'data.user', 'user', 'token'].forEach(key => {
      localStorage.removeItem(key);
    });
    setIsAuthenticated(false);
    setUserData(null);
    window.location.href = '/';
  }, []);

  return { isAuthenticated, userData, isLoading, logout };
};

const useTheme = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }, [theme]);

  return { theme, toggleTheme };
};

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Simulate fetching notifications
    const fetchNotifications = async () => {
      // In production, fetch from API
      setUnreadCount(3);
      setNotifications([
        { id: 1, title: 'New MTN Bundle', message: 'Special 50GB offer available', unread: true },
        { id: 2, title: 'Wallet Top Up', message: 'Successfully added GHS 100', unread: true },
        { id: 3, title: 'System Update', message: 'New features available', unread: true }
      ]);
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, NOTIFICATION_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  return { notifications, unreadCount, markAsRead };
};

// Component
const MobileNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, userData, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const menuRef = useRef(null);
  const notificationRef = useRef(null);

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
    setShowSearch(false);
  }, [pathname]);

  // Handle body scroll lock
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Custom Logo Component
  const Logo = ({ size = 'default' }) => {
    const sizes = {
      small: { container: 'w-8 h-8', icon: 16, text: 'text-xs' },
      default: { container: 'w-11 h-11', icon: 20, text: 'text-sm' },
      large: { container: 'w-16 h-16', icon: 28, text: 'text-lg' }
    };
    
    const config = sizes[size] || sizes.default;
    
    return (
      <div className={`${config.container} relative bg-gradient-to-br from-red-600 via-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:shadow-xl group-hover:shadow-red-500/40 transition-all duration-300`}>
        <Wifi className="text-white absolute opacity-20" size={config.icon + 8} />
        <Database className="text-white" size={config.icon} strokeWidth={2.5} />
        <div className="absolute -inset-0.5 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
      </div>
    );
  };

  // Navigation Item Component
  const NavItem = ({ 
    icon: Icon, 
    text, 
    path, 
    onClick, 
    disabled = false, 
    badge = null, 
    isActive = false, 
    isNew = false,
    gradient = null,
    requiresAuth = false,
    requiresRole = null
  }) => {
    const shouldShow = useMemo(() => {
      if (requiresAuth && !isAuthenticated) return false;
      if (requiresRole && userData?.role !== requiresRole) return false;
      return true;
    }, [requiresAuth, requiresRole]);

    if (!shouldShow) return null;

    const handleClick = () => {
      if (disabled) return;
      if (onClick) {
        onClick();
      } else if (path) {
        router.push(path);
        setIsMobileMenuOpen(false);
      }
    };

    return (
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`
          relative flex items-center w-full py-4 px-6 
          transition-all duration-300 group
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gradient-to-r hover:from-transparent hover:to-red-500/5 cursor-pointer active:scale-[0.98]'}
          ${isActive ? 'bg-gradient-to-r from-transparent to-red-500/10 border-r-4 border-red-500' : ''}
        `}
      >
        {gradient && !disabled && (
          <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
        )}
        
        <div className={`mr-4 transition-all duration-300 relative z-10 ${
          isActive ? 'text-red-500 scale-110' : 'text-gray-500 dark:text-gray-400 group-hover:text-red-500'
        }`}>
          <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        
        <span className={`font-medium text-[15px] flex-1 text-left relative z-10 transition-colors ${
          isActive ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
        }`}>
          {text}
        </span>
        
        {badge && (
          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full uppercase tracking-wider shadow-sm animate-pulse">
            {badge}
          </span>
        )}
        
        {isNew && (
          <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full">
            NEW
          </span>
        )}
        
        {disabled && (
          <span className="px-2.5 py-0.5 text-[10px] font-medium bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
            Soon
          </span>
        )}
        
        {!disabled && !isActive && (
          <ArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
        )}
      </button>
    );
  };

  // Section Heading Component
  const SectionHeading = ({ title, icon: Icon }) => (
    <div className="px-6 py-3 mb-2 flex items-center border-l-4 border-red-500/30">
      {Icon && (
        <div className="mr-2 text-red-500">
          <Icon size={14} />
        </div>
      )}
      <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
        {title}
      </p>
    </div>
  );

  // Notification Panel
  const NotificationPanel = () => (
    <div 
      ref={notificationRef}
      className={`absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 transform transition-all duration-300 ${
        showNotifications ? 'translate-y-0 opacity-100 visible' : '-translate-y-4 opacity-0 invisible'
      }`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
        <p className="text-xs text-gray-500 mt-1">{unreadCount} unread messages</p>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <button
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                notification.unread ? 'bg-red-50/50 dark:bg-red-950/20' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  notification.unread ? 'bg-red-500' : 'bg-transparent'
                }`} />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                    {notification.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {notification.message}
                  </p>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No notifications</p>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <button className="w-full py-2 text-center text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
          View All Notifications
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 w-full bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-sm z-40 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="flex justify-between items-center h-16 px-4 max-w-screen-xl mx-auto">
          <Link href="/" className="flex items-center space-x-3 group">
            <Logo />
            <div>
              <h1 className="text-lg font-black bg-gradient-to-r from-red-600 via-red-500 to-orange-600 bg-clip-text text-transparent">
                UnlimitedData GH
              </h1>
              <p className="text-[10px] text-gray-500 font-medium -mt-1">Premium Data Services</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label="Search"
            >
              <Search size={20} className="text-gray-700 dark:text-gray-300" />
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun size={20} className="text-yellow-500 group-hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon size={20} className="text-gray-700 dark:text-gray-300 group-hover:rotate-12 transition-transform duration-300" />
              )}
            </button>
            
            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                  aria-label="Notifications"
                >
                  <Bell size={20} className="text-gray-700 dark:text-gray-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <NotificationPanel />
              </div>
            )}
            
            {/* Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700 shadow-lg shadow-red-500/25 transition-all duration-300 active:scale-95"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className={`absolute top-full left-0 w-full bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 transition-all duration-300 ${
          showSearch ? 'translate-y-0 opacity-100 visible' : '-translate-y-full opacity-0 invisible'
        }`}>
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services, data plans..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Menu */}
      <aside 
        ref={menuRef}
        className={`fixed right-0 top-0 h-full w-[85%] max-w-sm bg-white dark:bg-gray-950 shadow-2xl transform transition-all duration-500 ease-out z-50 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="relative border-b border-gray-200 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-red-50/30 dark:from-gray-900 dark:to-red-950/20">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5" />
          
          <div className="relative flex justify-between items-center p-4 px-6">
            <div className="flex items-center space-x-2">
              <Rocket className="w-5 h-5 text-red-500 animate-pulse" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Navigation</h2>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 active:scale-95"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* User Info */}
          {isAuthenticated && userData && (
            <div className="relative px-6 pb-6">
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center p-4 bg-gradient-to-r from-white to-red-50 dark:from-gray-800 dark:to-red-950/30 rounded-2xl hover:shadow-xl transition-all duration-300 border border-red-100 dark:border-red-900/50 group"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-red-500/25">
                    <User size={20} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-900 animate-pulse" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="font-bold text-gray-900 dark:text-white">
                    {userData.name || 'My Account'}
                  </div>
                  <div className="text-sm text-red-500 font-medium flex items-center">
                    <Crown className="w-3 h-3 mr-1" />
                    {userData.role === 'admin' ? 'Administrator' : 'Premium User'}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin scrollbar-thumb-red-500 scrollbar-track-transparent">
          {isAuthenticated ? (
            <div className="py-4">
              {/* Main Menu */}
              <SectionHeading title="Main Menu" icon={Home} />
              {NAVIGATION_CONFIG.main.map(item => (
                <NavItem
                  key={item.id}
                  {...item}
                  isActive={pathname === item.path}
                />
              ))}

              {/* Data Services */}
              <div className="my-6">
                <SectionHeading title="Data Services" icon={Activity} />
                {NAVIGATION_CONFIG.services.map(item => (
                  <NavItem
                    key={item.id}
                    {...item}
                    isActive={pathname === item.path}
                  />
                ))}
              </div>

              {/* Finance */}
              <div className="my-6">
                <SectionHeading title="Finance" icon={Wallet} />
                {NAVIGATION_CONFIG.finance.map(item => (
                  <NavItem
                    key={item.id}
                    {...item}
                    isActive={pathname === item.path}
                  />
                ))}
              </div>

              {/* Support */}
              <div className="my-6">
                <SectionHeading title="Support & More" icon={MessageSquare} />
                {NAVIGATION_CONFIG.support.map(item => (
                  <NavItem
                    key={item.id}
                    {...item}
                    isActive={pathname === item.path}
                  />
                ))}
                <NavItem
                  icon={theme === 'dark' ? Sun : Moon}
                  text={`Theme: ${theme === 'dark' ? 'Dark' : 'Light'}`}
                  onClick={toggleTheme}
                  badge={theme === 'dark' ? 'DARK' : 'LIGHT'}
                />
              </div>

              {/* Premium Banner */}
              <div className="mx-6 my-6 p-5 bg-gradient-to-br from-red-600 via-red-500 to-orange-600 rounded-2xl text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base mb-1">Unlock Premium</h3>
                      <p className="text-sm opacity-90 mb-3">Unlimited transfers & exclusive deals</p>
                      <button className="px-4 py-2 bg-white text-red-600 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg">
                        Upgrade Now →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <div className="mt-8 px-6 pb-6">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center py-3.5 px-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-700 dark:text-gray-300 rounded-2xl hover:from-red-50 hover:to-red-100 hover:text-red-600 dark:hover:from-red-950/20 dark:hover:to-red-950/30 dark:hover:text-red-400 transition-all duration-300 font-semibold group"
                >
                  <LogOut size={18} className="mr-2 group-hover:rotate-12 transition-transform" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            // Not Authenticated View
            <div className="p-6 flex flex-col items-center justify-center h-full bg-gradient-to-b from-transparent to-red-50/20 dark:to-red-950/10">
              <div className="text-center mb-8 max-w-xs">
                <div className="relative mx-auto mb-6">
                  <Logo size="large" />
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                </div>
                
                <h2 className="text-2xl font-black bg-gradient-to-r from-red-600 via-red-500 to-orange-600 bg-clip-text text-transparent mb-3">
                  Welcome to UnlimitedData GH
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Your premium gateway to unlimited data services across Ghana
                </p>
              </div>
              
              <div className="w-full max-w-xs space-y-3">
                <button
                  onClick={() => {
                    router.push('/SignIn');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl shadow-xl shadow-red-500/25 hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 font-bold transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Sign In
                </button>
                
                <button
                  onClick={() => {
                    router.push('/SignUp');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3.5 px-4 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800 rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-300 font-bold flex items-center justify-center"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Account
                </button>
                
                <div className="flex items-center justify-center space-x-2 text-gray-500 text-xs mt-4">
                  <Users className="w-3 h-3 text-red-400" />
                  <span>Join 10,000+ data hustlers</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="pt-16">
        {/* Content goes here */}
      </main>

      {/* Custom Styles */}
      <style jsx>{`
        /* Premium scrollbar */
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thumb-red-500::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thumb-red-500::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thumb-red-500::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #ef4444, #f97316);
          border-radius: 3px;
        }
        
        .dark .scrollbar-thumb-red-500::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #dc2626, #ea580c);
        }

        /* Smooth theme transitions */
        * {
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        /* Pulse animation */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Slide animations */
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default MobileNavbar;