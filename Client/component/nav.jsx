'use client'
import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
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
  Phone,
  MessageSquare,
  Bell,
  Package,
  Sun,
  Moon,
  Users,
  HelpCircle,
  Crown,
  Lock
} from 'lucide-react';

// Constants
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
  BULK: '/bulk-purchase'
};

// Quick Actions for Navigation Button
const QUICK_ACTIONS = [
  {
    id: 'mtn',
    icon: Phone,
    label: 'MTN Data',
    path: '/mtnup2u',
    color: 'from-[#FFCC08] to-yellow-500'
  },
  {
    id: 'airteltigo',
    icon: Globe,
    label: 'AirtelTigo',
    path: '/at-ishare',
    color: 'from-red-500 to-blue-600'
  },
  {
    id: 'telecel',
    icon: Layers,
    label: 'Telecel',
    path: '/TELECEL',
    color: 'from-blue-600 to-blue-800'
  },
  {
    id: 'topup',
    icon: Wallet,
    label: 'Top Up',
    path: '/topup',
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'transactions',
    icon: ShoppingCart,
    label: 'Orders',
    path: '/myorders',
    color: 'from-purple-500 to-pink-600'
  },
  {
    id: 'bulk',
    icon: Package,
    label: 'Bulk Purchase',
    path: '/bulk-purchase',
    color: 'from-orange-500 to-red-600'
  }
];

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
    }
  ],
  support: [
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

  useEffect(() => {
    const checkAuth = () => {
      try {
        if (typeof window === 'undefined') return;
        
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const user = JSON.parse(localStorage.getItem(USER_DATA_KEY) || '{}');
        
        setIsAuthenticated(!!token);
        setUserData(user);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUserData(null);
      }
    };

    checkAuth();
    
    if (typeof window !== 'undefined') {
      const handleStorageChange = () => checkAuth();
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      [AUTH_TOKEN_KEY, USER_DATA_KEY].forEach(key => {
        localStorage.removeItem(key);
      });
      setIsAuthenticated(false);
      setUserData(null);
      window.location.href = '/';
    }
  }, []);

  return { isAuthenticated, userData, logout };
};

// Custom Hook: Notifications
const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Mock notifications for demo
    const mockNotifications = [
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
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => n.unread).length);
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
const NavItem = memo(({ 
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

  const handleClick = useCallback(() => {
    if (disabled) return;
    if (onClick) {
      onClick();
    } else if (path) {
      router.push(path);
      setIsMobileMenuOpen(false);
    }
  }, [disabled, onClick, path, router, setIsMobileMenuOpen]);

  if (!shouldShow) return null;

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      aria-label={`${text}${isActive ? ' (current page)' : ''}${disabled ? ' (coming soon)' : ''}`}
      aria-current={isActive ? 'page' : undefined}
      className={`
        relative flex items-center w-full py-3.5 px-5 
        transition-all duration-300 group touch-manipulation
        focus:outline-none focus:ring-2 focus:ring-[#FFCC08] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
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
});

// Section Heading Component
const SectionHeading = memo(({ title, icon: Icon }) => (
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
));

// Notification Panel Component
const NotificationPanel = memo(({ notifications, unreadCount, markAsRead, showNotifications }) => (
  <div className={`fixed sm:absolute top-16 sm:top-full right-2 sm:right-0 sm:mt-2 w-[calc(100vw-2rem)] sm:w-80 md:w-96 max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 transform transition-all duration-300 z-50 ${
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
));

// Quick Navigation Panel Component
const QuickNavigationPanel = memo(({ showQuickNav, setShowQuickNav }) => {
  const router = useRouter();

  const handleNavigate = useCallback((path) => {
    router.push(path);
    setShowQuickNav(false);
  }, [router, setShowQuickNav]);

  return (
    <div className={`fixed sm:absolute top-16 sm:top-full left-2 sm:left-0 sm:mt-2 w-[calc(100vw-2rem)] sm:w-80 md:w-96 max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 transform transition-all duration-300 z-50 overflow-hidden ${
      showQuickNav ? 'translate-y-0 opacity-100 visible' : '-translate-y-4 opacity-0 invisible'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-[#FFCC08]/10 to-yellow-500/10">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-[#FFCC08]" />
          <h3 className="font-bold text-gray-900 dark:text-white">Quick Actions</h3>
        </div>
        <p className="text-xs text-gray-500 mt-1">Fast access to popular services</p>
      </div>
      
      {/* Quick Actions Grid */}
      <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 max-h-96 overflow-y-auto">
        {QUICK_ACTIONS.map((action, index) => (
          <button
            key={action.id}
            onClick={() => handleNavigate(action.path)}
            className={`relative p-3 sm:p-4 rounded-xl bg-gradient-to-br ${action.color} text-white hover:scale-105 active:scale-95 transition-all duration-300 group overflow-hidden`}
            style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both` }}
          >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <div className="relative z-10 flex flex-col items-center text-center space-y-1 sm:space-y-2">
              <div className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <action.icon size={18} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs font-bold leading-tight">{action.label}</span>
            </div>
          </button>
        ))}
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <p className="text-[10px] text-center text-gray-500 dark:text-gray-400">
          <Sparkles className="inline w-3 h-3 mr-1 text-[#FFCC08]" />
          Quick access to your favorite services
        </p>
      </div>
    </div>
  );
});

// Main Component
const MobileNavbar = memo(() => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, userData, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickNav, setShowQuickNav] = useState(false);
  const [isNavbarHidden, setIsNavbarHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [forceHideNavbar, setForceHideNavbar] = useState(false);
  
  const menuRef = useRef(null);
  const notificationRef = useRef(null);
  const quickNavRef = useRef(null);


  // Check if current page should auto-hide navbar
  const shouldAutoHide = useMemo(() => 
    AUTO_HIDE_PAGES.some(page => pathname.startsWith(page)), [pathname]
  );

  useEffect(() => {
    setForceHideNavbar(shouldAutoHide);
  }, [shouldAutoHide]);

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
    setShowQuickNav(false);
  }, [pathname]);

  // Auto-hide navbar on scroll
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      setIsNavbarHidden(true);
    } else if (currentScrollY < lastScrollY || currentScrollY <= 100) {
      setIsNavbarHidden(false);
    }
    
    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    if (forceHideNavbar) {
      setIsNavbarHidden(true);
      return;
    }

    if (!forceHideNavbar) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      setIsNavbarHidden(false);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [forceHideNavbar, handleScroll]);

  // Handle body scroll lock and focus management
  useEffect(() => {
    if (isMobileMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.cssText = `
        overflow: hidden;
        position: fixed;
        width: 100%;
        top: -${scrollY}px;
      `;
      
      // Focus first element in menu for accessibility
      setTimeout(() => {
        if (menuRef.current) {
          const firstFocusable = menuRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (firstFocusable) {
            firstFocusable.focus();
          }
        }
      }, 100);
      
      return () => {
        document.body.style.cssText = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isMobileMenuOpen]);

  // Handle click outside
  const handleOutsideClick = useCallback((event) => {
    if (menuRef.current && !menuRef.current.contains(event.target) && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    if (notificationRef.current && !notificationRef.current.contains(event.target) && showNotifications) {
      setShowNotifications(false);
    }
    if (quickNavRef.current && !quickNavRef.current.contains(event.target) && showQuickNav) {
      setShowQuickNav(false);
    }
  }, [isMobileMenuOpen, showNotifications, showQuickNav]);

  const handleEscape = useCallback((event) => {
    if (event.key === 'Escape') {
      setIsMobileMenuOpen(false);
      setShowNotifications(false);
      setShowQuickNav(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [handleOutsideClick, handleEscape]);

  return (
    <>
      {/* Fixed Header - Enhanced Design */}
      <header className={`fixed top-0 left-0 w-full bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 shadow-lg shadow-black/10 backdrop-blur-sm border-b border-gray-700/50 z-50 transition-all duration-300 ${
        isNavbarHidden ? '-translate-y-full' : 'translate-y-0'
      }`}>
        <div className="flex justify-between items-center h-16 px-3 sm:px-4 max-w-screen-xl mx-auto">
          {/* Left Side: Hamburger Menu */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 sm:p-2.5 text-white hover:text-[#FFCC08] hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FFCC08] focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-menu"
          >
            <Menu size={20} strokeWidth={2.5} className="sm:w-6 sm:h-6" />
          </button>

          {/* Center: Brand Name */}
          <Link href="/" className="flex items-center group">
            <h1 className="text-lg sm:text-xl font-black text-[#FFCC08] uppercase tracking-wider group-hover:scale-105 transition-transform duration-300">
              UnlimitedData GH
            </h1>
          </Link>
          
          {/* Right Side: Action Buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Notifications Button */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 sm:p-2.5 text-white hover:text-[#FFCC08] hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FFCC08] focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              aria-expanded={showNotifications}
              aria-haspopup="true"
            >
              <Bell size={18} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse" aria-hidden="true">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Quick Navigation Button */}
            <button
              onClick={() => setShowQuickNav(!showQuickNav)}
              className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-[#FFCC08] to-yellow-500 text-black hover:from-yellow-500 hover:to-[#FFCC08] shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-300 active:scale-95 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#FFCC08] focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Quick Navigation"
              aria-expanded={showQuickNav}
              aria-haspopup="true"
            >
              <Zap size={18} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
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
        id="mobile-navigation-menu"
        role="navigation"
        aria-label="Main navigation"
        className={`fixed right-0 top-0 h-full w-[90%] xs:w-[85%] sm:w-[75%] md:w-[60%] lg:w-[50%] max-w-sm bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 shadow-2xl shadow-black/20 transform transition-all duration-500 ease-out z-50 safe-area-inset-right border-l border-gray-200/50 dark:border-gray-700/50 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="relative border-b border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-br from-[#FFCC08]/5 via-white to-[#FFCC08]/10 dark:from-[#FFCC08]/5 dark:via-gray-900 dark:to-[#FFCC08]/10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFCC08]/10 via-transparent to-yellow-500/10" />
          
          <div className="relative flex justify-between items-center p-4 px-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Navigation</h2>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all duration-300 active:scale-95"
              aria-label="Close menu"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
          
          {/* User Info */}
          {isAuthenticated && userData && (
            <div className="relative px-6 pb-6">
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center p-4 bg-gradient-to-r from-white via-[#FFCC08]/5 to-white dark:from-gray-800 dark:via-[#FFCC08]/5 dark:to-gray-800 rounded-2xl hover:shadow-xl hover:shadow-[#FFCC08]/10 transition-all duration-300 border border-[#FFCC08]/20 dark:border-[#FFCC08]/10 group hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFCC08] to-yellow-500 flex items-center justify-center text-black shadow-lg shadow-yellow-500/25 group-hover:shadow-yellow-500/40 transition-all duration-300">
                    <User size={20} strokeWidth={2.5} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 border-2 border-white dark:border-gray-900 animate-pulse shadow-sm" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="font-bold text-base text-gray-900 dark:text-white group-hover:text-[#FFCC08] transition-colors">
                    {userData.name || 'My Account'}
                  </div>
                  <div className="text-sm text-[#FFCC08] font-semibold flex items-center mt-1">
                    <Crown className="w-3 h-3 mr-1.5" />
                    {userData.role === 'admin' ? 'Administrator' : 'Premium User'}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#FFCC08] group-hover:translate-x-1 transition-all duration-300" />
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-500 scrollbar-track-transparent overscroll-contain">
          {isAuthenticated ? (
            <div className="py-4">
              {/* Main Menu */}
              <div className="mb-6">
                <SectionHeading title="Main Menu" icon={Home} />
                <div className="space-y-1">
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
                </div>
              </div>

              {/* Data Services */}
              <div className="mb-6">
                <SectionHeading title="Data Services" icon={Activity} />
                <div className="space-y-1">
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
              </div>

              {/* Finance */}
              <div className="mb-6">
                <SectionHeading title="Finance" icon={Wallet} />
                <div className="space-y-1">
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
              </div>

              {/* Support */}
              <div className="mb-6">
                <SectionHeading title="Support & More" icon={MessageSquare} />
                <div className="space-y-1">
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
              </div>

              {/* Premium Banner */}
              <div className="mx-6 mb-6 p-5 bg-gradient-to-br from-[#FFCC08] via-yellow-400 to-[#FFCC08] rounded-2xl text-black relative overflow-hidden shadow-lg shadow-yellow-500/25">
                <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/10" />
                <div className="relative z-10">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-black/20 backdrop-blur-sm rounded-xl shadow-sm">
                      <Crown className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base mb-1.5">Unlock Premium</h3>
                      <p className="text-sm opacity-90 mb-3 leading-relaxed">Unlimited transfers & exclusive deals</p>
                      <button className="px-4 py-2 bg-black text-[#FFCC08] rounded-xl text-sm font-bold hover:bg-gray-900 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg">
                        Upgrade Now →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <div className="px-6 pb-6">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center py-4 px-6 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-700 dark:text-gray-300 rounded-2xl hover:from-[#FFCC08]/10 hover:to-yellow-100 hover:text-black dark:hover:from-[#FFCC08]/10 dark:hover:to-[#FFCC08]/5 dark:hover:text-[#FFCC08] transition-all duration-300 font-semibold group hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
                >
                  <LogOut size={18} className="mr-3 group-hover:rotate-12 transition-transform duration-300" strokeWidth={2.5} />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            // Not Authenticated View
            <div className="p-6 flex flex-col items-center justify-center h-full bg-gradient-to-b from-transparent via-[#FFCC08]/5 to-[#FFCC08]/10 dark:from-transparent dark:via-[#FFCC08]/5 dark:to-[#FFCC08]/10">
              <div className="text-center mb-8 max-w-sm">
                <h2 className="text-2xl font-black bg-gradient-to-r from-[#FFCC08] via-yellow-400 to-[#FFCC08] bg-clip-text text-transparent mb-3">
                  Welcome to UnlimitedData GH
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Your premium gateway to unlimited data services across Ghana
                </p>
              </div>
              
              <div className="w-full max-w-sm space-y-3">
                <button
                  onClick={() => {
                    router.push('/SignIn');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#FFCC08] to-yellow-500 text-black rounded-2xl shadow-xl shadow-yellow-500/25 hover:shadow-2xl hover:shadow-yellow-500/30 transition-all duration-300 font-bold transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center touch-manipulation text-base"
                >
                  <Lock className="w-5 h-5 mr-3" strokeWidth={2.5} />
                  Sign In
                </button>
                
                <button
                  onClick={() => {
                    router.push('/SignUp');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-4 px-6 bg-white dark:bg-gray-800 text-black dark:text-[#FFCC08] border-2 border-[#FFCC08] rounded-2xl hover:bg-[#FFCC08]/10 dark:hover:bg-[#FFCC08]/5 transition-all duration-300 font-bold flex items-center justify-center touch-manipulation text-base hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="w-5 h-5 mr-3" strokeWidth={2.5} />
                  Create Account
                </button>
                
                <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm mt-4">
                  <Users className="w-4 h-4 text-[#FFCC08]" strokeWidth={2.5} />
                  <span>Join 10,000+ data hustlers</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Notification Panel */}
      <div ref={notificationRef}>
        <NotificationPanel
          notifications={notifications}
          unreadCount={unreadCount}
          markAsRead={markAsRead}
          showNotifications={showNotifications}
        />
      </div>

      {/* Quick Navigation Panel */}
      <div ref={quickNavRef}>
        <QuickNavigationPanel
          showQuickNav={showQuickNav}
          setShowQuickNav={setShowQuickNav}
        />
      </div>

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

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
});

// Add display name for debugging
MobileNavbar.displayName = 'MobileNavbar';

export default MobileNavbar; 