'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  CreditCard, Package, Database, DollarSign, TrendingUp, Calendar, X, 
  AlertCircle, PlusCircle, User, BarChart2, ChevronDown, ChevronUp, 
  Clock, Eye, Globe, Zap, Activity, Sparkles, ArrowUpRight, Star, 
  Target, Flame, Award, Shield, Info, Timer, CheckCircle, Wifi,
  Smartphone, Signal, ArrowRight, Bell, Settings, LogOut, RefreshCw,
  TrendingDown, Loader2, ChevronRight, Layers, Cpu, Server
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AnimatedCounter, CurrencyCounter } from './Animation';
import DailySalesChart from '@/app/week/page';

// Constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://unlimitedata.onrender.com';
const API_ENDPOINTS = {
  DASHBOARD: '/api/v1/data/user-dashboard/',
  REFRESH: '/api/v1/auth/refresh-token'
};

const NETWORKS = [
  { 
    id: 'mtn', 
    name: 'MTN', 
    fullName: 'MTN Ghana',
    tagline: 'Everywhere you go',
    gradient: 'from-[#FFCC08] to-yellow-500',
    bgGradient: 'from-[#FFCC08]/20 to-yellow-500/20',
    logoSvg: (
      <svg viewBox="0 0 100 60" className="w-full h-full">
        <ellipse cx="50" cy="30" rx="45" ry="25" fill="#FFCC08"/>
        <text x="50" y="38" textAnchor="middle" className="fill-black font-bold text-2xl">MTN</text>
      </svg>
    ),
    color: 'yellow'
  },
  { 
    id: 'airteltigo', 
    name: 'AT', 
    fullName: 'AT Ghana',
    tagline: 'Life is Simple',
    gradient: 'from-red-500 to-blue-600',
    bgGradient: 'from-red-500/20 to-blue-600/20',
    logoSvg: (
      <svg viewBox="0 0 100 60" className="w-full h-full">
        <circle cx="30" cy="30" r="25" fill="#ED1C24"/>
        <circle cx="70" cy="30" r="25" fill="#0066CC"/>
        <text x="50" y="38" textAnchor="middle" className="fill-white font-bold text-2xl">AT</text>
      </svg>
    ),
    color: 'red-blue'
  },
  { 
    id: 'telecel', 
    name: 'Telecel', 
    fullName: 'Telecel Ghana',
    tagline: 'Total communications',
    gradient: 'from-blue-600 to-blue-800',
    bgGradient: 'from-blue-600/20 to-blue-800/20',
    logoSvg: (
      <svg viewBox="0 0 120 60" className="w-full h-full">
        <path d="M20,30 L40,10 L60,30 L80,10 L100,30" stroke="#0052CC" strokeWidth="4" fill="none"/>
        <text x="60" y="48" textAnchor="middle" className="fill-blue-600 font-bold text-lg">Telecel</text>
      </svg>
    ),
    color: 'blue'
  }
];

const QUICK_ACTIONS = [
  { icon: Package, label: 'New Order', path: '/datamart', gradient: 'from-[#FFCC08] to-yellow-600' },
  { icon: BarChart2, label: 'Analytics', path: '/reports', gradient: 'from-gray-700 to-gray-900' },
  { icon: Clock, label: 'History', path: '/orders', gradient: 'from-yellow-600 to-yellow-700' },
  { icon: CreditCard, label: 'Top Up', path: '/topup', gradient: 'from-black to-gray-800' },
  { icon: Shield, label: 'Support', path: '/support', gradient: 'from-[#FFCC08] to-yellow-600' },
  { icon: User, label: 'Profile', path: '/profile', gradient: 'from-gray-800 to-black' }
];

const DashboardPage = () => {
  const router = useRouter();
  
  // State Management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    balance: 0,
    todayOrders: 0,
    todayGbSold: 0,
    todayRevenue: 0,
    recentTransactions: [],
    weeklyTrend: 0,
    monthlyGrowth: 0
  });
  
  const [animateStats, setAnimateStats] = useState(false);
  const [showSalesChart, setShowSalesChart] = useState(false);
  const [salesPeriod, setSalesPeriod] = useState('7d');
  const [showNotice, setShowNotice] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState(null);

  // Memoized Values
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Utility Functions
  const formatDataCapacity = useCallback((capacity) => {
    if (!capacity) return '0';
    if (capacity >= 1000) {
      return `${(capacity / 1000).toFixed(1)}`;
    }
    return `${capacity}`;
  }, []);

  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  }, []);

  // Navigation Functions
  const navigationHandlers = useMemo(() => ({
    orders: () => router.push('/orders'),
    myOrders: () => router.push('/myorders'),
    topup: () => router.push('/topup'),
    registerFriend: () => router.push('/registerFriend'),
    verificationServices: () => router.push('/verification-services'),
    network: (network) => {
      const routes = {
        mtn: '/mtnup2u',
        airteltigo: '/at-ishare',
        telecel: '/TELECEL'
      };
      router.push(routes[network] || '/');
    }
  }), [router]);

  // Enhanced API call with retry logic
  const fetchDashboardData = useCallback(async (userId, retryCount = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000 * Math.pow(2, retryCount); // Exponential backoff

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
        throw new Error('No authentication token found');
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DASHBOARD}${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Request-ID': crypto.randomUUID?.() || Date.now().toString()
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 401) {
          handleAuthenticationError();
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
            method: order.method,
            amount: order.price,
            gb: formatDataCapacity(order.capacity),
            time: new Date(order.createdAt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }),
            network: order.network,
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
      
      // Set default values
      setStats(prev => ({ ...prev }));
      setAnimateStats(true);
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
    if (userData.id) {
      await fetchDashboardData(userData.id);
    }
    setRefreshing(false);
  }, [fetchDashboardData]);

  const dismissNotice = useCallback(() => {
    setShowNotice(false);
    localStorage.setItem('dataDeliveryNoticeDismissed', 'true');
  }, []);

  // Effects
  useEffect(() => {
    const initializeDashboard = async () => {
      const userDataString = localStorage.getItem('userData');
      if (!userDataString) {
        router.push('/SignUp');
        return;
      }

      try {
        const userData = JSON.parse(userDataString);
        
        if (!userData?.id) {
          throw new Error('Invalid user data');
        }
        
        setUserName(userData.name || 'User');
        await fetchDashboardData(userData.id);
      } catch (err) {
        console.error('Initialization error:', err);
        handleAuthenticationError();
      }
    };

    initializeDashboard();

    const noticeDismissed = localStorage.getItem('dataDeliveryNoticeDismissed');
    if (noticeDismissed === 'true') {
      setShowNotice(false);
    }

    // Auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      if (userData.id) {
        fetchDashboardData(userData.id);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [router, fetchDashboardData, handleAuthenticationError]);

  // Loading State with MTN colors
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[#FFCC08]/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FFCC08] border-r-yellow-500 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#FFCC08] to-yellow-600 animate-pulse flex items-center justify-center">
              <Zap className="w-6 h-6 text-black animate-bounce" strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-[#FFCC08] animate-pulse">
              UNLIMITEDDATA GH
            </h1>
            <div className="flex items-center justify-center space-x-2 text-yellow-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Initializing dashboard...</span>
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden">
      {/* Premium Animated Background with MTN Yellow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-[#FFCC08]/10 to-yellow-600/10 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-yellow-600/10 to-black blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-[#FFCC08]/5 to-transparent blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Error Notification - MTN Enhanced */}
        {error && (
          <div className="mb-4 animate-slideInDown">
            <div className="bg-yellow-950/30 backdrop-blur-xl border border-[#FFCC08]/30 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-[#FFCC08]/20 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-[#FFCC08]" />
                  </div>
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-semibold text-yellow-300">Connection Notice</p>
                  <p className="text-sm text-yellow-200/80 mt-1">{error}</p>
                  <button
                    onClick={handleRefresh}
                    className="mt-3 inline-flex items-center space-x-2 text-sm text-[#FFCC08] hover:text-yellow-300 font-medium transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                  </button>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="flex-shrink-0 text-yellow-400/60 hover:text-yellow-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Data Delivery Notice - MTN Enhanced Dark Theme */}
        {showNotice && (
          <div className="mb-6 animate-slideInDown">
            <div className="bg-gradient-to-r from-[#FFCC08] to-yellow-600 rounded-2xl p-1 shadow-2xl">
              <div className="bg-gray-950 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFCC08]/20 to-transparent"></div>
                <div className="relative z-10">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-[#FFCC08]/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                        <Timer className="w-6 h-6 text-[#FFCC08]" strokeWidth={2.5} />
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3">
                          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                            <Info className="w-5 h-5 text-[#FFCC08]" />
                            <span>Service Information</span>
                          </h3>
                          
                          <div className="space-y-3">
                            <p className="text-gray-300 text-sm leading-relaxed">
                              Important: <span className="font-semibold text-[#FFCC08]">Data bundles are not delivered instantly</span>
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-[#FFCC08]/20">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Timer className="w-5 h-5 text-[#FFCC08]" />
                                  <span className="text-sm font-semibold text-gray-100">Delivery Time</span>
                                </div>
                                <p className="text-[#FFCC08] text-lg font-bold">1min-5min</p>
                                <p className="text-gray-400 text-xs mt-1">Network dependent</p>
                              </div>
                              
                              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-[#FFCC08]/20">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Clock className="w-5 h-5 text-[#FFCC08]" />
                                  <span className="text-sm font-semibold text-gray-100">Business Hours</span>
                                </div>
                                <p className="text-[#FFCC08] text-lg font-bold">7 AM - 9 PM</p>
                                <div className="space-y-1 mt-2">
                                  <p className="text-gray-300 text-xs">• Same day delivery</p>
                                  <p className="text-gray-400 text-xs">• 7 days service</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={dismissNotice}
                          className="ml-4 text-gray-500 hover:text-[#FFCC08] transition-colors"
                          aria-label="Dismiss notice"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section - MTN Premium Dark */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-[#FFCC08] to-yellow-600 rounded-2xl p-[2px] shadow-2xl">
            <div className="bg-gray-950 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFCC08]/30 via-transparent to-black/50"></div>
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#FFCC08]/10 blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center shadow-2xl">
                        <Cpu className="w-7 h-7 text-black" strokeWidth={2.5} />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">UNLIMITEDDATA GH</h1>
                        <p className="text-[#FFCC08] text-sm font-medium">Control Center</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h2 className="text-xl font-bold text-white">
                        {greeting}, {userName}!
                      </h2>
                      <p className="text-sm text-gray-400">
                        Your hustle command center is ready
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button 
                      onClick={navigationHandlers.topup}
                      className="group bg-[#FFCC08] hover:bg-yellow-500 text-black font-semibold py-3 px-6 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                    >
                      <PlusCircle className="w-5 h-5" />
                      <span>Top Up</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <button 
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="group bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-5 rounded-xl border border-gray-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                    >
                      <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                      <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - MTN Enhanced Dark Theme */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Balance Card - MTN Premium */}
            <div className="lg:col-span-2 bg-gradient-to-r from-[#FFCC08] to-yellow-600 rounded-2xl p-[2px] shadow-2xl">
              <div className="bg-gray-950 rounded-2xl p-6 h-full">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center shadow-lg">
                        <DollarSign className="w-6 h-6 text-black" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Account Balance</p>
                        <p className="text-gray-500 text-xs">Available funds</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[#FFCC08]/20 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-[#FFCC08]" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-white">
                      {animateStats ? 
                        <CurrencyCounter value={stats.balance} duration={1500} /> : 
                        formatCurrency(0)
                      }
                    </div>
                    <button
                      onClick={navigationHandlers.topup}
                      className="inline-flex items-center space-x-2 bg-[#FFCC08] hover:bg-yellow-500 text-black font-medium py-2.5 px-5 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span className="text-sm font-semibold">Add Funds</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Today - MTN Dark Card */}
            <div className="bg-gray-900 rounded-2xl p-5 shadow-xl border border-gray-800">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center shadow">
                    <Package className="w-5 h-5 text-black" strokeWidth={2} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {animateStats ? 
                        <AnimatedCounter value={stats.todayOrders} duration={1200} /> : 
                        "0"
                      }
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-100 font-medium text-sm">Orders Today</p>
                  <p className="text-gray-500 text-xs">Active transactions</p>
                </div>
              </div>
            </div>

            {/* Revenue Today - MTN Dark Card */}
            <div className="bg-gray-900 rounded-2xl p-5 shadow-xl border border-gray-800">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center shadow">
                    <TrendingUp className="w-5 h-5 text-black" strokeWidth={2} />
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">
                      {animateStats ? 
                        <CurrencyCounter value={stats.todayRevenue} duration={1500} /> : 
                        formatCurrency(0)
                      }
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-100 font-medium text-sm">Revenue Today</p>
                  <p className="text-gray-500 text-xs">Total earnings</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Network Selection - MTN Premium with Brand Colors */}
        <div className="mb-6">
          <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-800">
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center shadow">
                <Signal className="w-5 h-5 text-black" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Quick Order</h2>
                <p className="text-gray-500 text-xs">Select network provider</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* MTN - Yellow Brand Colors */}
              <button 
                onClick={() => navigationHandlers.network('mtn')}
                onMouseEnter={() => setSelectedNetwork('mtn')}
                onMouseLeave={() => setSelectedNetwork(null)}
                className="group relative bg-gradient-to-br from-[#FFCC08] to-yellow-500 hover:from-yellow-500 hover:to-[#FFCC08] rounded-xl p-4 transition-all duration-500 transform hover:scale-105 shadow-xl border-2 border-yellow-600 hover:border-[#FFCC08] overflow-hidden"
              >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-600/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Pulse Animation on Hover */}
                {selectedNetwork === 'mtn' && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                )}
                
                <div className="relative z-10 text-center space-y-3">
                  {/* Logo Container */}
                  <div className="w-16 h-16 mx-auto rounded-xl bg-white/90 backdrop-blur-sm p-2 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-yellow-800/50 group-hover:rotate-3">
                    <div className="w-full h-full flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110">
                      <svg viewBox="0 0 100 60" className="w-full h-full">
                        <ellipse cx="50" cy="30" rx="45" ry="25" fill="#000000"/>
                        <text x="50" y="38" textAnchor="middle" className="fill-[#FFCC08] font-bold text-2xl">MTN</text>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Network Info */}
                  <div className="space-y-1">
                    <p className="text-black font-bold text-sm group-hover:text-white transition-colors duration-300">
                      MTN Ghana
                    </p>
                    <p className="text-yellow-800 text-xs group-hover:text-yellow-100 transition-colors">
                      Everywhere you go
                    </p>
                    
                    {/* Call-to-Action */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 mt-2">
                      <span className="inline-flex items-center space-x-1 text-black group-hover:text-white text-xs font-semibold">
                        <span>Order Now</span>
                        <ChevronRight className="w-3 h-3 animate-pulse" />
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Popular Badge */}
                <div className="absolute top-2 right-2 bg-black text-[#FFCC08] text-xs px-2 py-1 rounded-full font-semibold shadow-lg animate-pulse">
                  78% Market
                </div>
              </button>

              {/* AT Ghana (AirtelTigo) - Red & Blue Brand Colors */}
              <button 
                onClick={() => navigationHandlers.network('airteltigo')}
                onMouseEnter={() => setSelectedNetwork('airteltigo')}
                onMouseLeave={() => setSelectedNetwork(null)}
                className="group relative bg-gradient-to-br from-red-500 via-red-600 to-blue-600 hover:from-red-600 hover:via-red-700 hover:to-blue-700 rounded-xl p-4 transition-all duration-500 transform hover:scale-105 shadow-xl border-2 border-red-600 hover:border-blue-500 overflow-hidden"
              >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-700/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Pulse Animation on Hover */}
                {selectedNetwork === 'airteltigo' && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                )}
                
                <div className="relative z-10 text-center space-y-3">
                  {/* Logo Container */}
                  <div className="w-16 h-16 mx-auto rounded-xl bg-white/90 backdrop-blur-sm p-2 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-blue-500/50 group-hover:rotate-3">
                    <div className="w-full h-full flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110">
                      <svg viewBox="0 0 100 60" className="w-full h-full">
                        <circle cx="30" cy="30" r="20" fill="#ED1C24" opacity="0.9"/>
                        <circle cx="70" cy="30" r="20" fill="#0066CC" opacity="0.9"/>
                        <text x="50" y="38" textAnchor="middle" className="fill-white font-bold text-2xl stroke-black" strokeWidth="1">AT</text>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Network Info */}
                  <div className="space-y-1">
                    <p className="text-white font-bold text-sm group-hover:text-yellow-300 transition-colors duration-300">
                      AT Ghana
                    </p>
                    <p className="text-red-100 text-xs group-hover:text-white transition-colors">
                      Life is Simple
                    </p>
                    
                    {/* Call-to-Action */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 mt-2">
                      <span className="inline-flex items-center space-x-1 text-white text-xs font-semibold">
                        <span>Order Now</span>
                        <ChevronRight className="w-3 h-3 animate-pulse" />
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Rebranded Badge */}
                <div className="absolute top-2 right-2 bg-white/90 text-red-600 text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                  New AT
                </div>
              </button>

              {/* Telecel - Red Brand Colors (Former Vodafone) */}
              <button 
                onClick={() => navigationHandlers.network('telecel')}
                onMouseEnter={() => setSelectedNetwork('telecel')}
                onMouseLeave={() => setSelectedNetwork(null)}
                className="group relative bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl p-4 transition-all duration-500 transform hover:scale-105 shadow-xl border-2 border-red-700 hover:border-red-500 overflow-hidden"
              >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-800/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Pulse Animation on Hover */}
                {selectedNetwork === 'telecel' && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                )}
                
                <div className="relative z-10 text-center space-y-3">
                  {/* Logo Container */}
                  <div className="w-16 h-16 mx-auto rounded-xl bg-white/90 backdrop-blur-sm p-2 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-red-500/50 group-hover:rotate-3">
                    <div className="w-full h-full flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110">
                      <svg viewBox="0 0 120 60" className="w-full h-full">
                        <path d="M20,35 L35,15 L50,35 L65,15 L80,35 L95,15" stroke="#DC2626" strokeWidth="4" fill="none" strokeLinecap="round"/>
                        <text x="60" y="50" textAnchor="middle" className="fill-red-600 font-bold text-lg">Telecel</text>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Network Info */}
                  <div className="space-y-1">
                    <p className="text-white font-bold text-sm group-hover:text-yellow-300 transition-colors duration-300">
                      Telecel Ghana
                    </p>
                    <p className="text-red-100 text-xs group-hover:text-white transition-colors">
                      Total communications
                    </p>
                    
                    {/* Call-to-Action */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 mt-2">
                      <span className="inline-flex items-center space-x-1 text-white text-xs font-semibold">
                        <span>Order Now</span>
                        <ChevronRight className="w-3 h-3 animate-pulse" />
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Ex-Vodafone Badge */}
                <div className="absolute top-2 right-2 bg-white/90 text-red-600 text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                  Ex-Vodafone
                </div>
              </button>
            </div>
            
            {/* Network Stats Bar */}
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-[#FFCC08] animate-pulse" />
                  <span className="text-xs text-gray-400">Lightning fast delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-400">100% Secure & Trusted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-[#FFCC08]" />
                  <span className="text-xs text-gray-400">24/7 Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity - MTN Premium Dark */}
        <div className="mb-6">
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center shadow">
                    <Activity className="w-5 h-5 text-black" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Recent Activity</h2>
                    <p className="text-gray-500 text-xs">Latest transactions</p>
                  </div>
                </div>
                
                <button 
                  onClick={navigationHandlers.orders}
                  className="group flex items-center space-x-2 bg-[#FFCC08] hover:bg-yellow-500 text-black font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <span className="text-sm font-semibold">View All</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </div>
            
            <div className="p-6 bg-black/30">
              {stats.recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentTransactions.slice(0, 5).map((transaction, index) => (
                    <div 
                      key={transaction.id} 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900 to-gray-850 rounded-xl hover:from-gray-850 hover:to-gray-800 transition-all duration-200 border border-gray-800 hover:border-[#FFCC08]/30"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center shadow">
                          <Database className="w-5 h-5 text-black" strokeWidth={2} />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{transaction.customer}</p>
                          <p className="text-gray-500 text-xs">{transaction.gb}GB • {transaction.method}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-white font-bold text-sm">{formatCurrency(transaction.amount)}</p>
                        <p className="text-gray-500 text-xs">{transaction.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-xl bg-gray-800 flex items-center justify-center mb-4">
                    <Database className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-300 text-sm font-medium">No transactions yet</p>
                  <p className="text-gray-500 text-xs mt-1">Start your hustle journey!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions - MTN Premium Dark */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map((action, index) => (
            <button
              key={index}
              onClick={() => router.push(action.path)}
              className="group bg-gray-900 hover:bg-gray-850 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 shadow-xl border border-gray-800 hover:border-[#FFCC08]/50 relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <div className="relative z-10 text-center space-y-2">
                <div className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow group-hover:shadow-lg transition-shadow`}>
                  <action.icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <p className="text-gray-300 group-hover:text-white font-medium text-xs transition-colors">{action.label}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideInDown {
          animation: slideInDown 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;