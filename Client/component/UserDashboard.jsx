import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastNotification';
import { useTheme } from '../app/providers/ThemeProvider';
import MobileNavbar from './nav';
import MobileMoneyDepositModal from './MobileMoneyDepositModal';
import { getApiEndpoint as getCentralizedApiEndpoint } from '../utils/envConfig';
import { 
  CreditCard, Package, Database, DollarSign, TrendingUp, X, 
  AlertCircle, PlusCircle, User, BarChart2, Clock, Eye, Zap, 
  Activity, Sparkles, ArrowUpRight, Star, Award, Shield, Info, 
  Timer, Wifi, Signal, Bell, Settings, LogOut, RefreshCw,
  Loader2, ChevronRight, Cpu, Home, Menu,
  Rocket, Globe2, Layers3, ArrowUp, Users, Target, Send,
  ChevronDown, ChevronUp, Globe, Flame, CheckCircle, Smartphone,
  ArrowRight, TrendingDown, Layers, Server, Calendar, Plus,
  Navigation, Compass, MapPin, Search, Filter, Sun, Moon
} from 'lucide-react';

// Animation Components
const AnimatedCounter = ({ value, duration = 1000 }) => {
const [count, setCount] = useState(0);

useEffect(() => {
  let start = 0;
  const end = parseInt(value) || 0;
  if (!end) {
    setCount(0);
    return;
  }
  const increment = Math.ceil(end / (duration / 16));
  const timer = setInterval(() => {
    start += increment;
    if (start >= end) {
      setCount(end);
      clearInterval(timer);
    } else {
      setCount(start);
    }
  }, 16);
  return () => clearInterval(timer);
}, [value, duration]);

return <span>{count}</span>;
};

const CurrencyCounter = ({ value, duration = 1500 }) => {
const [count, setCount] = useState(0);

useEffect(() => {
  let start = 0;
  const end = parseFloat(value) || 0;
  if (!end) {
    setCount(0);
    return;
  }
  const increment = end / (duration / 16);
  const timer = setInterval(() => {
    start += increment;
    if (start >= end) {
      setCount(end);
      clearInterval(timer);
    } else {
      setCount(start);
    }
  }, 16);
  return () => clearInterval(timer);
}, [value, duration]);

return <span>₵{count.toFixed(2)}</span>;
};




// API Configuration - Use centralized config
const getApiEndpoint = (path) => {
  return getCentralizedApiEndpoint(path);
};

const API_ENDPOINTS = {
DASHBOARD: '/api/v1/data/user-dashboard/',
REFRESH: '/api/v1/auth/refresh-token'
};

// Network Configuration
const NETWORKS = [
{ 
  id: 'mtn', 
  name: 'MTN', 
  fullName: 'MTN Ghana',
  tagline: 'Everywhere you go',
  gradient: 'from-[#FFCC08] to-yellow-500',
  bgGradient: 'from-[#FFCC08]/20 to-yellow-500/20',
  route: '/mtnup2u',
  logo: (
    <svg viewBox="0 0 100 60" className="w-full h-full">
      <ellipse cx="50" cy="30" rx="45" ry="25" fill="#000000"/>
      <text x="50" y="38" textAnchor="middle" className="fill-[#FFCC08] font-bold text-2xl">MTN</text>
    </svg>
  )
},
{ 
  id: 'airteltigo', 
  name: 'AT',
  fullName: 'AT Ghana',
  tagline: 'Life is Simple',
  gradient: 'from-red-500 via-red-600 to-blue-600',
  bgGradient: 'from-red-500/20 to-blue-600/20',
  route: '/at-ishare',
  logo: (
    <svg viewBox="0 0 100 60" className="w-full h-full">
      <circle cx="30" cy="30" r="20" fill="#ED1C24" opacity="0.9"/>
      <circle cx="70" cy="30" r="20" fill="#0066CC" opacity="0.9"/>
      <text x="50" y="38" textAnchor="middle" className="fill-white font-bold text-2xl stroke-black" strokeWidth="1">AT</text>
    </svg>
  )
},
{ 
  id: 'telecel', 
  name: 'Telecel',
  fullName: 'Telecel Ghana',
  tagline: 'Total communications',
  gradient: 'from-red-600 to-red-700',
  bgGradient: 'from-red-600/20 to-red-700/20',
  route: '/TELECEL',
  logo: (
    <svg viewBox="0 0 120 60" className="w-full h-full">
      <path d="M20,35 L35,15 L50,35 L65,15 L80,35 L95,15" stroke="#DC2626" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <text x="60" y="50" textAnchor="middle" className="fill-red-600 font-bold text-lg">Telecel</text>
    </svg>
  )
}
];

// Quick Actions Configuration
const QUICK_ACTIONS = [
{ icon: Package, label: 'Store', path: '/store', gradient: 'from-[#FFCC08] to-yellow-600' },
{ icon: BarChart2, label: 'Analytics', path: '/reports', gradient: 'from-black to-gray-900' },
{ icon: Clock, label: 'History', path: '/orders', gradient: 'from-yellow-600 to-yellow-700' },
{ icon: CreditCard, label: 'Top Up', path: '/topup', gradient: 'from-black to-gray-800' },
{ icon: Shield, label: 'Support', path: '/support', gradient: 'from-[#FFCC08] to-yellow-600' },
{ icon: User, label: 'Profile', path: '/profile', gradient: 'from-gray-800 to-black' },
{ icon: Award, label: 'Become Agent', path: '/agent-signup', gradient: 'from-[#FFCC08] to-yellow-600' }
];

const DashboardPage = () => {
const router = useRouter();
const { success, error: showError, info } = useToast();
const { theme, toggleTheme } = useTheme();

// State Management
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [userName, setUserName] = useState('');
const [error, setError] = useState(null);
const [showNotice, setShowNotice] = useState(true);
const [animateStats, setAnimateStats] = useState(false);
const [selectedNetwork, setSelectedNetwork] = useState(null);
const [showSalesChart, setShowSalesChart] = useState(false);
const [salesPeriod, setSalesPeriod] = useState('7d');
const [showMobileMoneyDeposit, setShowMobileMoneyDeposit] = useState(false);

// API Data State
const [stats, setStats] = useState({
  balance: 0,
  todayOrders: 0,
  todayGbSold: 0,
  todayRevenue: 0,
  recentTransactions: [],
  weeklyTrend: 0,
  monthlyGrowth: 0
});

// Memoized Values
const greeting = useMemo(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}, []);

// Utility Functions
const formatCurrency = useCallback((value) => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0).replace('GHS', '₵');
}, []);

const formatDataCapacity = useCallback((capacity) => {
  if (!capacity) return '0';
  if (capacity >= 1000) {
    return `${(capacity / 1000).toFixed(1)}`;
  }
  return `${capacity}`;
}, []);

// Navigation Functions
const navigationHandlers = useMemo(() => ({
  orders: () => {
    router.push('/orders');
  },
  myOrders: () => {
    router.push('/myorders');
  },
  topup: () => {
    router.push('/topup');
  },
  registerFriend: () => {
    router.push('/registerFriend');
  },
  verificationServices: () => {
    router.push('/verification-services');
  },
  store: () => {
    router.push('/store');
  },
  profile: () => {
    router.push('/profile');
  },
  settings: () => {
    router.push('/settings');
  },
  analytics: () => {
    router.push('/reports');
  },
  support: () => {
    router.push('/support');
  },
  network: (networkId) => {
    if (!networkId) return;
    const selectedNet = NETWORKS.find(n => n.id === networkId);
    if (selectedNet) {
      router.push(selectedNet.route);
    }
  }
}), [router]);

// Enhanced API call with retry logic
const fetchDashboardData = useCallback(async (userId, retryCount = 0) => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000 * Math.pow(2, retryCount);

  try {
    setError(null);
    if (retryCount === 0) {
      setLoading(true);
    }
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.warn('No authentication token found, redirecting to login');
      handleAuthenticationError();
      return;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(getApiEndpoint(`${API_ENDPOINTS.DASHBOARD}${userId}`), {
      method: 'GET',
      headers: {
        'x-auth-token': authToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Request-ID': Date.now().toString()
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 401) {
        handleAuthenticationError();
        return;
      }
      
      if (response.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
        return;
      }
      
      if (response.status >= 500 && retryCount < MAX_RETRIES) {
        console.warn(`Server error, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchDashboardData(userId, retryCount + 1);
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    if (responseData?.status === 'success' && responseData?.data) {
      const data = responseData.data;
      const todayOrders = data.todayOrders || {};
      
      setStats({
        balance: data.userBalance || 0,
        todayOrders: todayOrders.count || 0,
        todayGbSold: todayOrders.totalGbSold || 0,
        todayRevenue: todayOrders.totalValue || 0,
        weeklyTrend: data.weeklyTrend || 0,
        monthlyGrowth: data.monthlyGrowth || 0,
        recentTransactions: (todayOrders.orders || []).map(order => ({
          id: order._id,
          customer: order.phoneNumber,
          amount: order.price,
          gb: formatDataCapacity(order.capacity),
          time: new Date(order.createdAt).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          network: order.network,
          method: order.method || 'Direct',
          status: order.status || 'completed'
        }))
      });
      
      setError(null);
      setTimeout(() => setAnimateStats(true), 300);
    } else {
      throw new Error('Invalid response structure');
    }
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    
    if (error.name === 'AbortError') {
      setError('Request timeout. Server might be slow.');
    } else if (error.message.includes('User ID') || error.message.includes('authentication')) {
      handleAuthenticationError();
      return;
    } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      setError('Network error. Check your connection.');
    } else {
      setError(retryCount >= MAX_RETRIES ? 
        'Server is currently unavailable. Please try again later.' : 
        `Loading issue: ${error.message}`
      );
    }
    
    setStats(prev => ({ ...prev }));
    setAnimateStats(true);
    
    // Show success toast only on initial load
    if (retryCount === 0) {
      info('Welcome back! Dashboard loaded successfully.');
    }
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, [formatDataCapacity]);

const handleAuthenticationError = useCallback(() => {
  setError('Session expired. Please login again.');
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  setTimeout(() => router.push('/SignUp'), 2000);
}, [router]);

const handleRefresh = useCallback(async () => {
  setRefreshing(true);
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  if (userData.id || userData._id) {
    try {
      await fetchDashboardData(userData.id || userData._id);
      success('Dashboard refreshed successfully!');
    } catch (error) {
      showError('Failed to refresh dashboard. Please try again.');
    }
  } else {
    showError('User data not found. Please sign in again.');
  }
  setRefreshing(false);
}, [fetchDashboardData, success, showError]);

const dismissNotice = useCallback(() => {
  setShowNotice(false);
  localStorage.setItem('dataDeliveryNoticeDismissed', 'true');
}, []);

// Auto-dismiss error messages after 5 seconds
useEffect(() => {
  if (error) {
    const timer = setTimeout(() => {
      setError(null);
    }, 5000);
    return () => clearTimeout(timer);
  }
}, [error]);

// Effects
useEffect(() => {
  let isMounted = true;
  let refreshInterval = null;
  
  const initializeDashboard = async () => {
    // Check if we're on the client side
    if (typeof window === 'undefined') return;
    
    const userDataString = localStorage.getItem('userData');
    
    if (!userDataString) {
      if (isMounted) {
        setError('Please login to access your dashboard');
        router.push('/SignIn');
      }
      return;
    }

    try {
      const userData = JSON.parse(userDataString);
      
      if (!userData?.id && !userData?._id) {
        if (isMounted) {
          setError('Invalid user data. Please login again.');
          localStorage.removeItem('userData');
          localStorage.removeItem('authToken');
          router.push('/SignIn');
        }
        return;
      }
      
      if (isMounted) {
        setUserName(userData.name || 'User');
        await fetchDashboardData(userData.id || userData._id);
      }
    } catch (err) {
      console.error('Initialization error:', err);
      if (isMounted) {
        setError('Failed to load user data. Please login again.');
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
        router.push('/SignIn');
      }
    }
  };

  initializeDashboard();

  if (typeof window !== 'undefined') {
    const noticeDismissed = localStorage.getItem('dataDeliveryNoticeDismissed');
    if (noticeDismissed === 'true') {
      setShowNotice(false);
    }
  }

  // Auto-refresh every 5 minutes (only if component is still mounted)
  refreshInterval = setInterval(() => {
    if (isMounted && typeof window !== 'undefined') {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      if (userData.id || userData._id) {
        fetchDashboardData(userData.id || userData._id);
      }
    }
  }, 5 * 60 * 1000);

  return () => {
    isMounted = false;
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  };
}, [router, fetchDashboardData]);

// Loading State
if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-[#FFCC08]/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FFCC08] animate-spin"></div>
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center">
            <Zap className="w-6 h-6 text-black" strokeWidth={2.5} />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-[#FFCC08]">
            UNLIMITEDDATA GH
          </h1>
          <div className="flex items-center justify-center space-x-2 text-yellow-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Initializing dashboard...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

return (
  <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden pb-20">
      {/* Navigation Component */}
      <MobileNavbar />
      
      {/* Premium Background - Static for better performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-[#FFCC08]/5 to-yellow-600/5 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-yellow-600/5 to-black blur-3xl"></div>
      </div>
      
      
      {/* Main Content */}
      <div className="relative z-10 px-3 sm:px-4 pt-14 sm:pt-16 pb-3 sm:pb-4 max-w-7xl mx-auto">
        
        {/* Error Alert - Fixed Position Above Navbar */}
        {error && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-950/30 backdrop-blur-xl rounded-xl p-3 shadow-lg border border-yellow-500/20 max-w-md w-full mx-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-[#FFCC08] flex-shrink-0 mt-0.5" />
              <div className="flex-grow">
                <p className="text-xs text-yellow-200">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-2 text-xs text-[#FFCC08] font-medium flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Try Again</span>
                </button>
              </div>
              <button onClick={() => setError(null)} className="text-yellow-400/60">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        
        {/* Service Notice - Fixed Position Above Navbar */}
        {showNotice && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-[#FFCC08]/10 backdrop-blur-xl rounded-xl p-3 shadow-lg border border-[#FFCC08]/20 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3">
              <Timer className="w-5 h-5 text-[#FFCC08] flex-shrink-0" />
              <div className="flex-grow">
                <p className="text-xs text-[#FFCC08] font-bold">Delivery: 1-5 mins</p>
                <p className="text-xs text-gray-400">Service: 7AM - 9PM daily</p>
              </div>
              <button onClick={dismissNotice} className="text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Hero Section - Mobile Compact */}
        <div className="mb-4 bg-gradient-to-r from-[#FFCC08]/20 to-yellow-600/10 backdrop-blur-xl rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-white">UNLIMITEDDATA GH</h1>
                  <p className="text-xs text-[#FFCC08]">{greeting}, {userName}!</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => router.push('/store')}
                className="bg-yellow-600 hover:bg-yellow-700 text-black text-xs font-bold py-2 px-3 rounded-xl transition-colors flex items-center space-x-1"
              >
                <Package className="w-3 h-3" />
                <span>Store</span>
              </button>
              <button 
                onClick={() => router.push('/agent-signup')}
                className="bg-[#FFCC08] hover:bg-yellow-500 text-black text-xs font-bold py-2 px-3 rounded-xl transition-colors flex items-center space-x-1"
              >
                <Award className="w-3 h-3" />
                <span>Agent</span>
              </button>
              <button 
                onClick={navigationHandlers.topup}
                className="bg-[#FFCC08] text-black text-xs font-bold py-2 px-3 rounded-xl"
              >
                Top Up
              </button>
              <button 
                onClick={handleRefresh}
                className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center"
              >
                <RefreshCw className={`w-4 h-4 text-[#FFCC08] ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-[#FFCC08]" />
                ) : (
                  <Moon className="w-4 h-4 text-[#FFCC08]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid - Circular Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Balance Card - Full Width */}
          <div className="col-span-2 bg-gradient-to-br from-[#FFCC08]/20 to-yellow-600/10 backdrop-blur-xl rounded-2xl p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 text-black" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Balance</p>
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    {animateStats ? 
                      <CurrencyCounter value={stats.balance} duration={1500} /> : 
                      formatCurrency(0)
                    }
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push('/topup')}
                  className="bg-[#FFCC08] text-black font-bold py-2 px-3 rounded-full text-xs sm:text-sm hover:bg-yellow-500 transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Topup</span>
                </button>
                <button
                  onClick={() => router.push('/momo-deposit')}
                  className="bg-gray-800 text-white font-bold py-2 px-3 rounded-full text-xs sm:text-sm hover:bg-gray-700 transition-colors flex items-center space-x-1"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>MoMo</span>
                </button>
                <button
                  onClick={navigationHandlers.topup}
                  className="bg-gray-800 text-white font-bold py-2 px-3 rounded-full text-xs sm:text-sm hover:bg-gray-700 transition-colors flex items-center space-x-1"
                >
                  <CreditCard className="w-3 h-3" />
                  <span>Card</span>
                </button>
              </div>
            </div>
          </div>

          {/* Circular Stat Cards */}
          <div className="flex flex-col items-center justify-center bg-gray-800/30 backdrop-blur-xl rounded-2xl p-3 sm:p-4 h-28 sm:h-32">
            <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center mb-2">
              <Package className="w-6 sm:w-7 h-6 sm:h-7 text-black" />
            </div>
            <div className="text-base sm:text-lg font-bold text-white">
              {animateStats ? <AnimatedCounter value={stats.todayOrders} /> : "0"}
            </div>
            <p className="text-xs text-gray-400">Orders</p>
          </div>

          <div className="flex flex-col items-center justify-center bg-gray-800/30 backdrop-blur-xl rounded-2xl p-3 sm:p-4 h-28 sm:h-32">
            <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center mb-2">
              <TrendingUp className="w-6 sm:w-7 h-6 sm:h-7 text-black" />
            </div>
            <div className="text-base sm:text-lg font-bold text-white">
              {animateStats ? <CurrencyCounter value={stats.todayRevenue} /> : "₵0"}
            </div>
            <p className="text-xs text-gray-400">Revenue</p>
          </div>

          <div className="flex flex-col items-center justify-center bg-gray-800/30 backdrop-blur-xl rounded-2xl p-3 sm:p-4 h-28 sm:h-32">
            <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center mb-2">
              <Database className="w-6 sm:w-7 h-6 sm:h-7 text-black" />
            </div>
            <div className="text-base sm:text-lg font-bold text-white">
              {animateStats ? <AnimatedCounter value={stats.todayGbSold} /> : "0"} GB
            </div>
            <p className="text-xs text-gray-400">Data Sold</p>
          </div>

          <div className="flex flex-col items-center justify-center bg-gray-800/30 backdrop-blur-xl rounded-2xl p-3 sm:p-4 h-28 sm:h-32">
            <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center mb-2">
              <Activity className="w-6 sm:w-7 h-6 sm:h-7 text-black" />
            </div>
            <div className="text-base sm:text-lg font-bold text-white">
              {animateStats ? <AnimatedCounter value={stats.weeklyTrend} /> : "0"}%
            </div>
            <p className="text-xs text-gray-400">Growth</p>
          </div>
        </div>

        {/* Network Selection - Logo-based Cards */}
        <div className="mb-4">
          <h2 className="text-sm font-bold text-white mb-3 flex items-center">
            <Signal className="w-4 h-4 text-[#FFCC08] mr-2" />
            Select Network
          </h2>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {NETWORKS.map((network) => (
              <button 
                key={network.id}
                onClick={() => navigationHandlers.network(network.id)}
                onMouseEnter={() => setSelectedNetwork(network.id)}
                onMouseLeave={() => setSelectedNetwork(null)}
                className="relative bg-gray-800/50 backdrop-blur-xl rounded-2xl p-3 transition-all duration-300 transform hover:scale-105 group"
              >
                <div className="w-14 sm:w-16 h-14 sm:h-16 mx-auto rounded-full bg-white/90 p-1.5 sm:p-2 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  {network.logo}
                </div>
                
                <p className="text-xs text-white font-semibold">{network.name}</p>
                <p className="text-xs text-gray-400 hidden sm:block">{network.tagline}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Become Agent - Mobile Compact */}
        <div className="mb-4 bg-gradient-to-br from-[#FFCC08]/20 to-yellow-600/10 backdrop-blur-xl rounded-2xl p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center">
                <Award className="w-5 sm:w-6 h-5 sm:h-6 text-black" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Become an Agent</h3>
                <p className="text-xs text-[#FFCC08]">Earn 5-10% commission</p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/agent-signup')}
              className="bg-[#FFCC08] text-black font-bold py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm hover:bg-yellow-500 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Agent Stores - Mobile Compact */}
        <div className="mb-4 bg-gradient-to-br from-yellow-600/20 to-yellow-800/10 backdrop-blur-xl rounded-2xl p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-[#FFCC08]" />
              <h3 className="text-sm font-bold text-white">Agent Stores</h3>
            </div>
            <button 
              onClick={() => router.push('/store')}
              className="text-[#FFCC08] text-xs font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center">
                  <Package className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-xs font-medium text-white">Main Store</p>
                  <p className="text-xs text-gray-400">All products available</p>
                </div>
              </div>
              <button 
                onClick={() => router.push('/store')}
                className="bg-[#FFCC08] text-black text-xs font-bold py-1 px-2 rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Visit
              </button>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center">
                  <Award className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-xs font-medium text-white">Agent Stores</p>
                  <p className="text-xs text-gray-400">Personalized stores</p>
                </div>
              </div>
              <button 
                onClick={() => router.push('/agent-signup')}
                className="bg-[#FFCC08] text-black text-xs font-bold py-1 px-2 rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Become Agent
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions - Circular Buttons */}
        <div className="mb-4">
          <h2 className="text-sm font-bold text-white mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {QUICK_ACTIONS.slice(0, 6).map((action, index) => {
              const handleClick = () => {
                switch(action.label.toLowerCase()) {
                  case 'store':
                    navigationHandlers.store();
                    break;
                  case 'analytics':
                    navigationHandlers.analytics();
                    break;
                  case 'history':
                    navigationHandlers.orders();
                    break;
                  case 'top up':
                    navigationHandlers.topup();
                    break;
                  case 'support':
                    navigationHandlers.support();
                    break;
                  case 'profile':
                    navigationHandlers.profile();
                    break;
                  default:
                    router.push(action.path);
                }
              };
              
              return (
                <button
                  key={index}
                  onClick={handleClick}
                  className="flex flex-col items-center space-y-2 group"
                >
                  <div className={`w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-active:scale-95`}>
                    <action.icon className="w-5 sm:w-6 h-5 sm:h-6 text-white" strokeWidth={2} />
                  </div>
                  <p className="text-xs text-gray-300 font-medium">{action.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity - Mobile Optimized */}
        <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="p-3 sm:p-4 bg-gray-800/50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#FFCC08]" />
              <h2 className="text-sm font-bold text-white">Recent Activity</h2>
            </div>
            <button 
              onClick={navigationHandlers.orders}
              className="text-[#FFCC08] text-xs font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="p-3">
            {stats.recentTransactions.length > 0 ? (
              <div className="space-y-2">
                {stats.recentTransactions.slice(0, 3).map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-900/50 rounded-xl"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-[#FFCC08]/20 flex items-center justify-center">
                        <Database className="w-4 sm:w-5 h-4 sm:h-5 text-[#FFCC08]" />
                      </div>
                      <div>
                        <p className="text-white text-xs sm:text-sm font-medium">{transaction.customer}</p>
                        <p className="text-gray-400 text-xs">{transaction.gb}GB • {transaction.method}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-white font-bold text-xs sm:text-sm">{formatCurrency(transaction.amount)}</p>
                      <p className="text-gray-400 text-xs">{transaction.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <div className="w-14 sm:w-16 h-14 sm:h-16 mx-auto rounded-full bg-gray-800 flex items-center justify-center mb-3">
                  <Database className="w-7 sm:w-8 h-7 sm:h-8 text-gray-600" />
                </div>
                <p className="text-gray-300 text-sm">No transactions yet</p>
                <p className="text-gray-500 text-xs mt-1">Start your journey!</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Navigation - Mobile Only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl" style={{ zIndex: 50 }}>
        <div className="grid grid-cols-5 py-2">
          <button 
            onClick={() => router.push('/')}
            className="flex flex-col items-center py-1.5"
          >
            <Home className="w-5 h-5 text-[#FFCC08]" />
            <span className="text-xs text-[#FFCC08] mt-0.5 font-medium">Home</span>
          </button>
          <button 
            onClick={() => router.push('/store')}
            className="flex flex-col items-center py-1.5"
          >
            <Package className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-400 mt-0.5">Store</span>
          </button>
          <button 
            onClick={() => router.push('/orders')}
            className="flex flex-col items-center py-1.5"
          >
            <BarChart2 className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-400 mt-0.5">Orders</span>
          </button>
          <button 
            onClick={() => router.push('/profile')}
            className="flex flex-col items-center py-1.5"
          >
            <User className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-400 mt-0.5">Profile</span>
          </button>
          <button 
            onClick={() => router.push('/settings')}
            className="flex flex-col items-center py-1.5"
          >
            <Settings className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-400 mt-0.5">Settings</span>
          </button>
        </div>
      </div>

      {/* Mobile Money Deposit Modal */}
      <MobileMoneyDepositModal
        isOpen={showMobileMoneyDeposit}
        onClose={() => setShowMobileMoneyDeposit(false)}
        currentBalance={stats.balance}
        onDepositSuccess={(data) => {
          // Refresh dashboard data after successful deposit
          handleRefresh();
        }}
      />


    </div>
);
};

export default DashboardPage;