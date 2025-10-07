'use client'
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../app/providers/ThemeProvider';
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
  Database,
  Store
} from 'lucide-react';

// Constants
const THEME_KEY = 'app_theme';
const USER_DATA_KEY = 'userData';
const AUTH_TOKEN_KEY = 'authToken';
const NOTIFICATION_CHECK_INTERVAL = 60000;

// Pages where navbar should auto-hide
const AUTO_HIDE_PAGES = [
  '/checkout',
  '/payment',
  '/admin',
  '/settings',
  '/profile',
  '/reports',
  '/analytics'
];

// Service URLs
const SERVICES = {
  AIRTELTIGO: '/at-ishare',
  MTN: '/mtnup2u',
  TELECEL: '/TELECEL',
  BULK: '/bulk-purchase',
  AT_BIGTIME: '/at-big-time'
};

// Navigation configuration
const NAVIGATION_CONFIG = {
  main: [
    { 
      id: 'dashboard', 
      icon: LayoutDashboard, 
      text: 'Dashboard', 
      path: '/', 
      requiresAuth: true 
    },
    { 
      id: 'store', 
      icon: Store, 
      text: 'Store', 
      path: '/store', 
      badge: 'NEW' 
    },
    { 
      id: 'agent-store', 
      icon: Store, 
      text: 'Manage Store', 
      path: '/agent/manage-store', 
      requiresAuth: true, 
      requiresRole: 'agent', 
      badge: 'AGENT' 
    },
    { 
      id: 'admin-agent-stores', 
      icon: Store, 
      text: 'Agent Stores', 
      path: '/admin/agent-stores', 
      requiresAuth: true, 
      requiresRole: 'admin', 
      badge: 'ADMIN' 
    },
    { 
      id: 'admin', 
      icon: Shield, 
      text: 'Admin Panel', 
      path: '/admin', 
      requiresAuth: true, 
      requiresRole: 'admin', 
      badge: 'ADMIN' 
    }
  ],
  services: [
    { 
      id: 'airteltigo', 
      icon: Globe, 
      text: 'AirtelTigo', 
      path: SERVICES.AIRTELTIGO, 
      gradient: 'from-red-500 to-blue-600' 
    },
    { 
      id: 'mtn', 
      icon: Phone, 
      text: 'MTN Data', 
      path: SERVICES.MTN, 
      gradient: 'from-[#FFCC08] to-yellow-500' 
    },
    { 
      id: 'telecel', 
      icon: Layers, 
      text: 'Telecel', 
      path: SERVICES.TELECEL, 
      isNew: true, 
      gradient: 'from-blue-600 to-blue-800' 
    },
    { 
      id: 'bulk', 
      icon: Package, 
      text: 'Bulk Purchase', 
      path: SERVICES.BULK, 
      badge: 'HOT', 
      gradient: 'from-[#FFCC08] to-orange-500' 
    },
    { 
      id: 'bigtime', 
      icon: Sparkles, 
      text: 'AT Big Time', 
      path: SERVICES.AT_BIGTIME, 
      disabled: true, 
      gradient: 'from-purple-600 to-pink-600' 
    }
  ],
  finance: [
    { 
      id: 'topup', 
      icon: CreditCard, 
      text: 'Top Up Wallet', 
      path: '/topup', 
      requiresAuth: true 
    },
    { 
      id: 'transactions', 
      icon: ShoppingCart, 
      text: 'Transactions', 
      path: '/myorders', 
      requiresAuth: true 
    },
    { 
      id: 'analytics', 
      icon: TrendingUp, 
      text: 'Analytics', 
      path: '/analytics', 
      requiresAuth: true 
    }
  ],
  support: [
    { 
      id: 'reports', 
      icon: BarChart2, 
      text: 'Reports', 
      path: '/reports', 
      disabled: true 
    },
    { 
      id: 'settings', 
      icon: Settings, 
      text: 'Settings', 
      path: '/settings' 
    },
    { 
      id: 'help', 
      icon: HelpCircle, 
      text: 'Help Center', 
      path: '/help' 
    }
  ]
};

// Custom Hook: Authentication
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check if we're on the client side
        if (typeof window === 'undefined') return;
        
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
    
    // Only add event listener on client side
    if (typeof window !== 'undefined') {
      const handleStorageChange = () => checkAuth();
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      [AUTH_TOKEN_KEY, USER_DATA_KEY, 'data.user', 'user', 'token'].forEach(key => {
        localStorage.removeItem(key);
      });
      setIsAuthenticated(false);
      setUserData(null);
      window.location.href = '/';
    }
  }, []);

  return { isAuthenticated, userData, isLoading, logout };
};

// Custom Hook: Notifications
const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      // Simulated notification fetch
      setUnreadCount(3);
      setNotifications([
        { 
          id: 1, 
          title: 'New MTN Bundle', 
          message: 'Special 50GB offer available', 
          unread: true 
        },
        { 
          id: 2, 
          title: 'Wallet Top Up', 
          message: 'Successfully added GHS 100', 
          unread: true 
        },
        { 
          id: 3, 
          title: 'System Update', 
          message: 'New features available', 
          unread: true 
        }
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

// NavItem Component
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
  requiresRole = null,
  isAuthenticated = false,
  userData = null,
  setIsMobileMenuOpen
}) => {
  const router = useRouter();
  
  const shouldShow = useMemo(() => {
    if (requiresAuth && !isAuthenticated) return false;
    if (requiresRole && userData?.role !== requiresRole) return false;
    return true;
  }, [requiresAuth, requiresRole, isAuthenticated, userData]);

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
        relative flex items-center w-full py-3.5 px-5 
        transition-all duration-300 group touch-manipulation
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gradient-to-r hover:from-transparent hover:to-[#FFCC08]/5 cursor-pointer active:scale-[0.98]'}
        ${isActive ? 'bg-gradient-to-r from-transparent to-[#FFCC08]/10 border-r-4 border-[#FFCC08]' : ''}
      `}
    >
      {gradient && !disabled && (
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
      )}
      
      <div className={`mr-3 transition-all relative z-10 ${
        isActive ? 'text-[#FFCC08] scale-110' : 'text-gray-500 dark:text-gray-400 group-hover:text-[#FFCC08]'
      }`}>
        <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
      </div>
      
      <span className={`font-medium text-sm flex-1 text-left relative z-10 transition-colors ${
        isActive ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
      }`}>
        {text}
      </span>
      
      {badge && (
        <span className="px-2 py-0.5 text-[9px] font-bold bg-gradient-to-r from-[#FFCC08] to-yellow-500 text-black rounded-full uppercase tracking-wider shadow-sm animate-pulse">
          {badge}
        </span>
      )}
      
      {isNew && (
        <span className="px-2 py-0.5 text-[9px] font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full">
          NEW
        </span>
      )}
      
      {disabled && (
        <span className="px-2 py-0.5 text-[9px] font-medium bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
          Soon
        </span>
      )}
      
      {!disabled && !isActive && (
        <ArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
      )}
    </button>
  );
};

// Section Heading Component
const SectionHeading = ({ title, icon: Icon }) => (
  <div className="px-5 py-2.5 mb-1.5 flex items-center border-l-4 border-[#FFCC08]/30">
    {Icon && (
      <div className="mr-2 text-[#FFCC08]">
        <Icon size={13} />
      </div>
    )}
    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
      {title}
    </p>
  </div>
);

// Notification Panel Component
const NotificationPanel = ({ notifications, unreadCount, markAsRead, showNotifications }) => (
  <div className={`fixed sm:absolute top-16 sm:top-full right-2 sm:right-0 sm:mt-2 w-[calc(100vw-1rem)] sm:w-80 max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 transform transition-all duration-300 z-50 ${
    showNotifications ? 'translate-y-0 opacity-100 visible' : '-translate-y-4 opacity-0 invisible'
  }`}>
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
              notification.unread ? 'bg-[#FFCC08]/5 dark:bg-[#FFCC08]/10' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                notification.unread ? 'bg-[#FFCC08]' : 'bg-transparent'
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
      <button className="w-full py-2 text-center text-sm font-medium text-[#FFCC08] hover:text-yellow-600 transition-colors">
        View All Notifications
      </button>
    </div>
  </div>
);

// Main Component
const MobileNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, userData, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isNavbarHidden, setIsNavbarHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [forceHideNavbar, setForceHideNavbar] = useState(false);
  
  const menuRef = useRef(null);
  const notificationRef = useRef(null);

  // Check if current page should auto-hide navbar
  useEffect(() => {
    const shouldAutoHide = AUTO_HIDE_PAGES.some(page => pathname.startsWith(page));
    setForceHideNavbar(shouldAutoHide);
  }, [pathname]);

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
  }, [pathname]);

  // Auto-hide navbar on scroll
  useEffect(() => {
    if (forceHideNavbar) {
      setIsNavbarHidden(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsNavbarHidden(true);
      } else if (currentScrollY < lastScrollY || currentScrollY <= 100) {
        setIsNavbarHidden(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Only add scroll listener if not force hiding
    if (!forceHideNavbar) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      setIsNavbarHidden(false); // Show navbar when not force hiding
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, forceHideNavbar]);

  // Handle body scroll lock
  useEffect(() => {
    if (isMobileMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.cssText = `
        overflow: hidden;
        position: fixed;
        width: 100%;
        top: -${scrollY}px;
      `;
      return () => {
        document.body.style.cssText = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isMobileMenuOpen]);

  // Handle click outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target) && showNotifications) {
        setShowNotifications(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen, showNotifications]);

  return (
    <>
      {/* Fixed Header */}
      <header className={`fixed top-0 left-0 w-full bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-sm z-40 border-b border-gray-200/50 dark:border-gray-800/50 safe-area-inset-top transition-transform duration-300 ${
        isNavbarHidden ? '-translate-y-full' : 'translate-y-0'
      }`}>
        <div className="flex justify-between items-center h-14 sm:h-16 px-3 sm:px-6 max-w-screen-xl mx-auto">
          {/* Brand Name - No Logo */}
          <Link href="/" className="flex items-center space-x-2 group flex-1 min-w-0">
            <div className="flex-shrink-0 min-w-0 flex flex-col">
              <h1 className="text-xs sm:text-sm md:text-base font-black bg-gradient-to-r from-[#FFCC08] via-yellow-400 to-[#FFCC08] bg-clip-text text-transparent leading-tight whitespace-nowrap">
                UnlimitedData GH
              </h1>
              <p className="text-[7px] sm:text-[9px] text-gray-500 dark:text-gray-400 font-medium -mt-0.5 leading-tight hidden sm:block">
                Premium Data Services
              </p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="relative p-2 sm:p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 touch-manipulation active:scale-95 min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? (
                <Sun size={16} className="text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon size={16} className="text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 sm:p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 touch-manipulation active:scale-95 min-w-[40px] min-h-[40px] flex items-center justify-center"
                  aria-label="Notifications"
                >
                  <Bell size={16} className="text-gray-700 dark:text-gray-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-[#FFCC08] text-black text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationPanel 
                  notifications={notifications}
                  unreadCount={unreadCount}
                  markAsRead={markAsRead}
                  showNotifications={showNotifications}
                />
              </div>
            )}
            
            {/* Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-[#FFCC08] to-yellow-500 text-black hover:from-yellow-500 hover:to-[#FFCC08] shadow-lg shadow-yellow-500/25 transition-all duration-300 active:scale-95 touch-manipulation ml-0.5 sm:ml-0 min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={16} strokeWidth={2.5} /> : <Menu size={16} strokeWidth={2.5} />}
            </button>
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

      {/* Mobile Sidebar Menu */}
      <aside 
        ref={menuRef}
        className={`fixed right-0 top-0 h-full w-[85%] xs:w-[80%] sm:w-[75%] max-w-sm bg-white dark:bg-gray-950 shadow-2xl transform transition-all duration-500 ease-out z-50 safe-area-inset-right ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="relative border-b border-gray-200 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-[#FFCC08]/10 dark:from-gray-900 dark:to-[#FFCC08]/5">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFCC08]/5 via-transparent to-yellow-500/5" />
          
          <div className="relative flex justify-between items-center p-3 px-5">
            <div className="flex items-center space-x-2">
              <Rocket className="w-4 h-4 text-[#FFCC08] animate-pulse" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Navigation</h2>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 active:scale-95"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* User Info */}
          {isAuthenticated && userData && (
            <div className="relative px-5 pb-5">
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center p-3 bg-gradient-to-r from-white to-[#FFCC08]/10 dark:from-gray-800 dark:to-[#FFCC08]/5 rounded-xl hover:shadow-lg transition-all duration-300 border border-[#FFCC08]/20 dark:border-[#FFCC08]/10 group"
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FFCC08] to-yellow-500 flex items-center justify-center text-black shadow-md shadow-yellow-500/25">
                    <User size={18} strokeWidth={2.5} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-900 animate-pulse" />
                </div>
                <div className="ml-3 flex-1">
                  <div className="font-bold text-sm text-gray-900 dark:text-white">
                    {userData.name || 'My Account'}
                  </div>
                  <div className="text-xs text-[#FFCC08] font-medium flex items-center">
                    <Crown className="w-2.5 h-2.5 mr-1" />
                    {userData.role === 'admin' ? 'Administrator' : 'Premium User'}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="h-[calc(100vh-160px)] overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-500 scrollbar-track-transparent overscroll-contain">
          {isAuthenticated ? (
            <div className="py-3">
              {/* Main Menu */}
              <SectionHeading title="Main Menu" icon={Home} />
              {NAVIGATION_CONFIG.main.map(item => (
                <NavItem
                  key={item.id}
                  {...item}
                  isActive={pathname === item.path}
                  isAuthenticated={isAuthenticated}
                  userData={userData}
                  setIsMobileMenuOpen={setIsMobileMenuOpen}
                />
              ))}

              {/* Data Services */}
              <div className="my-5">
                <SectionHeading title="Data Services" icon={Activity} />
                {NAVIGATION_CONFIG.services.map(item => (
                  <NavItem
                    key={item.id}
                    {...item}
                    isActive={pathname === item.path}
                    isAuthenticated={isAuthenticated}
                    userData={userData}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                  />
                ))}
              </div>

              {/* Finance */}
              <div className="my-5">
                <SectionHeading title="Finance" icon={Wallet} />
                {NAVIGATION_CONFIG.finance.map(item => (
                  <NavItem
                    key={item.id}
                    {...item}
                    isActive={pathname === item.path}
                    isAuthenticated={isAuthenticated}
                    userData={userData}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                  />
                ))}
              </div>

              {/* Support */}
              <div className="my-5">
                <SectionHeading title="Support & More" icon={MessageSquare} />
                {NAVIGATION_CONFIG.support.map(item => (
                  <NavItem
                    key={item.id}
                    {...item}
                    isActive={pathname === item.path}
                    isAuthenticated={isAuthenticated}
                    userData={userData}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                  />
                ))}
                <NavItem
                  icon={theme === 'dark' ? Sun : Moon}
                  text={`Theme: ${theme === 'dark' ? 'Dark' : 'Light'}`}
                  onClick={toggleTheme}
                  badge={theme === 'dark' ? 'DARK' : 'LIGHT'}
                  isAuthenticated={isAuthenticated}
                  userData={userData}
                  setIsMobileMenuOpen={setIsMobileMenuOpen}
                />
              </div>

              {/* Premium Banner */}
              <div className="mx-5 my-5 p-4 bg-gradient-to-br from-[#FFCC08] via-yellow-400 to-[#FFCC08] rounded-xl text-black relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-start space-x-2.5">
                    <div className="p-1.5 bg-black/20 backdrop-blur-sm rounded-lg">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm mb-1">Unlock Premium</h3>
                      <p className="text-xs opacity-90 mb-2.5">Unlimited transfers & exclusive deals</p>
                      <button className="px-3 py-1.5 bg-black text-[#FFCC08] rounded-lg text-xs font-bold hover:bg-gray-900 transition-all duration-300 shadow-md">
                        Upgrade Now →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <div className="mt-6 px-5 pb-5">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-700 dark:text-gray-300 rounded-xl hover:from-[#FFCC08]/10 hover:to-yellow-100 hover:text-black dark:hover:from-[#FFCC08]/10 dark:hover:to-[#FFCC08]/5 dark:hover:text-[#FFCC08] transition-all duration-300 font-semibold group"
                >
                  <LogOut size={16} className="mr-2 group-hover:rotate-12 transition-transform" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            // Not Authenticated View
            <div className="p-5 flex flex-col items-center justify-center h-full bg-gradient-to-b from-transparent to-[#FFCC08]/5 dark:to-[#FFCC08]/10">
              <div className="text-center mb-6 max-w-xs">
                <h2 className="text-xl font-black bg-gradient-to-r from-[#FFCC08] via-yellow-400 to-[#FFCC08] bg-clip-text text-transparent mb-2">
                  Welcome to UnlimitedData GH
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                  Your premium gateway to unlimited data services across Ghana
                </p>
              </div>
              
              <div className="w-full max-w-xs space-y-2.5">
                <button
                  onClick={() => {
                    router.push('/SignIn');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#FFCC08] to-yellow-500 text-black rounded-xl shadow-xl shadow-yellow-500/25 hover:shadow-2xl hover:shadow-yellow-500/30 transition-all duration-300 font-bold transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center touch-manipulation text-sm"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Sign In
                </button>
                
                <button
                  onClick={() => {
                    router.push('/SignUp');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3.5 px-4 bg-white dark:bg-gray-800 text-black dark:text-[#FFCC08] border-2 border-[#FFCC08] rounded-xl hover:bg-[#FFCC08]/10 dark:hover:bg-[#FFCC08]/5 transition-all duration-300 font-bold flex items-center justify-center touch-manipulation text-sm"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Account
                </button>
                
                <div className="flex items-center justify-center space-x-2 text-gray-500 text-xs mt-3">
                  <Users className="w-3 h-3 text-[#FFCC08]" />
                  <span>Join 10,000+ data hustlers</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Custom Styles */}
      <style jsx>{`
        .safe-area-inset-top {
          padding-top: env(safe-area-inset-top);
        }
        
        .safe-area-inset-right {
          padding-right: env(safe-area-inset-right);
        }

        .touch-manipulation {
          touch-action: manipulation;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }

        .overscroll-contain {
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }

        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thumb-yellow-500::-webkit-scrollbar {
          width: 5px;
        }
        
        .scrollbar-thumb-yellow-500::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thumb-yellow-500::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #FFCC08, #fbbf24);
          border-radius: 3px;
        }

        @media (max-width: 375px) {
          .xs\\:w-\\[80\\%\\] {
            width: 80%;
          }
        }

        button, .touch-manipulation {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </>
  );
};

export default MobileNavbar;