'use client'
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Package, Database, DollarSign, TrendingUp, Calendar, X, 
  AlertCircle, PlusCircle, User, BarChart2, ChevronDown, ChevronUp, 
  Clock, Eye, Globe, Zap, Activity, Sparkles, ArrowUpRight, Star, 
  Target, Flame, Award, Shield, Info, Timer, CheckCircle, Wifi,
  Smartphone, Signal, ArrowRight, Bell, Settings, LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AnimatedCounter, CurrencyCounter } from './Animation';
import DailySalesChart from '@/app/week/page';

const DashboardPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    balance: 0,
    todayOrders: 0,
    todayGbSold: 0,
    todayRevenue: 0,
    recentTransactions: []
  });
  
  const [animateStats, setAnimateStats] = useState(false);
  const [showSalesChart, setShowSalesChart] = useState(false);
  const [salesPeriod, setSalesPeriod] = useState('7d');
  const [showNotice, setShowNotice] = useState(true);

  const ViewAll = () => {
    router.push('/orders');
  };

  const navigateToTransactions = () => {
    router.push('/myorders');
  };

  const navigateToTopup = () => {
    router.push('/topup');
  };
  
  const navigateToregisterFriend = () => {
    router.push('/registerFriend');
  }
  
  const navigateToVerificationServices = () => {
    router.push('/verification-services');
  }

  const navigateToNetwork = (network) => {
    switch(network) {
      case 'mtn':
        router.push('/mtnup2u');
        break;
      case 'airteltigo':
        router.push('/at-ishare');
        break;
      case 'telecel':
        router.push('/TELECEL');
        break;
      default:
        router.push('/');
    }
  };

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) {
      router.push('/SignUp');
      return;
    }

    try {
      const userData = JSON.parse(userDataString);
      
      // Validate userData has required fields
      if (!userData || !userData.id) {
        console.error('Invalid user data structure:', userData);
        setError('Invalid user data. Please login again.');
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
        setTimeout(() => router.push('/SignUp'), 2000);
        return;
      }
      
      setUserName(userData.name || 'User');
      
      // Debug log
      console.log('User ID:', userData.id);
      console.log('User Data:', userData);
      
      fetchDashboardData(userData.id);
    } catch (err) {
      console.error('Error parsing user data:', err);
      setError('Session error. Please login again.');
      localStorage.removeItem('userData');
      localStorage.removeItem('authToken');
      setTimeout(() => router.push('/SignUp'), 2000);
    }
    
    const noticeDismissed = localStorage.getItem('dataDeliveryNoticeDismissed');
    if (noticeDismissed === 'true') {
      setShowNotice(false);
    }
  }, [router]);

  const fetchDashboardData = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate userId
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      // Get auth token
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No authentication token found');
      }
      
      // Simple URL construction - avoiding template literal issues
      // Using the original API for now since backend hasn't been migrated
      const baseUrl = 'https://datahustle.onrender.com';
      const endpoint = '/api/v1/data/user-dashboard/';
      const fullUrl = baseUrl + endpoint + userId;
      
      console.log('Fetching from URL:', fullUrl);
      console.log('User ID:', userId);
      console.log('Auth Token exists:', !!authToken);
      
      // Make the API call
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + authToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      // Check if response is ok
      if (!response.ok) {
        if (response.status === 401) {
          const errorMsg = 'Authentication failed. Please login again.';
          console.error(errorMsg);
          setError(errorMsg);
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          setTimeout(() => router.push('/SignUp'), 2000);
          return;
        }
        
        if (response.status === 404) {
          setError('Dashboard data not found.');
        } else if (response.status >= 500) {
          setError('Server error. Please try again later.');
        } else {
          setError('Unable to load dashboard (Error ' + response.status + ')');
        }
        
        // Still set default values so dashboard is usable
        setStats({
          balance: 0,
          todayOrders: 0,
          todayGbSold: 0,
          todayRevenue: 0,
          recentTransactions: []
        });
        setLoading(false);
        setAnimateStats(true);
        return;
      }
      
      // Parse response
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      if (responseData && responseData.status === 'success' && responseData.data) {
        const data = responseData.data;
        const userBalance = data.userBalance || 0;
        const todayOrders = data.todayOrders || {};
        
        setStats({
          balance: userBalance,
          todayOrders: todayOrders.count || 0,
          todayGbSold: todayOrders.totalGbSold || 0,
          todayRevenue: todayOrders.totalValue || 0,
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
            network: order.network
          }))
        });
        
        setError(null);
        setLoading(false);
        setTimeout(() => {
          setAnimateStats(true);
        }, 300);
      } else {
        // Handle cases where response is success but data structure is different
        console.warn('Unexpected response structure:', responseData);
        setError('Data format issue. Using default values.');
        
        setStats({
          balance: 0,
          todayOrders: 0,
          todayGbSold: 0,
          todayRevenue: 0,
          recentTransactions: []
        });
        setLoading(false);
        setAnimateStats(true);
      }
    } catch (error) {
      console.error('Error in fetchDashboardData:', error);
      
      // Detailed error messages
      let errorMessage = 'Unable to load dashboard data.';
      
      if (error.message === 'User ID is required') {
        errorMessage = 'Invalid session. Please login again.';
        setTimeout(() => router.push('/SignUp'), 2000);
      } else if (error.message === 'No authentication token found') {
        errorMessage = 'Not authenticated. Please login.';
        setTimeout(() => router.push('/SignUp'), 2000);
      } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Check your internet connection.';
      } else if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Server might be slow.';
      } else {
        errorMessage = 'Error: ' + error.message;
      }
      
      setError(errorMessage);
      
      // Set default values to keep dashboard functional
      setStats({
        balance: 0,
        todayOrders: 0,
        todayGbSold: 0,
        todayRevenue: 0,
        recentTransactions: []
      });
      
      setLoading(false);
      setAnimateStats(true);
    }
  };

  const formatDataCapacity = (capacity) => {
    if (capacity >= 1000) {
      return (capacity / 1000).toFixed(1);
    }
    return capacity;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(value);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning'; 
    if (hour < 18) return 'Good afternoon'; 
    return 'Good evening'; 
  };

  const toggleSalesChart = () => {
    setShowSalesChart(!showSalesChart);
  };

  const handleSalesPeriodChange = (period) => {
    setSalesPeriod(period);
  };

  const dismissNotice = () => {
    setShowNotice(false);
    localStorage.setItem('dataDeliveryNoticeDismissed', 'true');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-red-50 to-white">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-3 border-red-200/20"></div>
            <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-red-500 border-r-red-400 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-red-500 to-red-600 animate-pulse flex items-center justify-center">
              <Zap className="w-6 h-6 text-white animate-bounce" strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-red-600 animate-pulse">
              UNLIMITEDDATA GH
            </h1>
            <div className="flex items-center justify-center space-x-2 text-red-400">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Loading your dashboard...</span>
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50/30 to-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-red-100/20 to-red-200/20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-red-100/20 to-pink-100/20 blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4">
        
        {/* Error Notification */}
        {error && (
          <div className="mb-4 animate-fadeInDown">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium text-red-800">Connection Error</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                      if (userData.id) fetchDashboardData(userData.id);
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-700 underline font-medium"
                  >
                    Try Again
                  </button>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="flex-shrink-0 text-red-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Data Delivery Notice */}
        {showNotice && (
          <div className="mb-6 animate-fadeInDown">
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-1">
              <div className="bg-white rounded-xl p-4 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                        <Timer className="w-5 h-5 text-red-600" strokeWidth={2.5} />
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                            <Info className="w-5 h-5 text-red-500" />
                            <span>Important: Service Information</span>
                          </h3>
                          
                          <div className="space-y-3">
                            <p className="text-gray-700 text-sm leading-relaxed">
                              Please note that <span className="font-semibold text-red-600">data bundles are not delivered instantly</span>. 
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Timer className="w-5 h-5 text-red-500" />
                                  <span className="text-sm font-semibold text-gray-900">Delivery Time</span>
                                </div>
                                <p className="text-red-600 text-lg font-bold">5 min - 4 hours</p>
                                <p className="text-gray-600 text-xs mt-1">Depending on network conditions</p>
                              </div>
                              
                              <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Clock className="w-5 h-5 text-red-500" />
                                  <span className="text-sm font-semibold text-gray-900">Business Hours</span>
                                </div>
                                <p className="text-red-600 text-lg font-bold">8:00 AM - 9:00 PM</p>
                                <div className="space-y-1 mt-2">
                                  <p className="text-gray-700 text-xs">• Orders within hours: Same day</p>
                                  <p className="text-gray-700 text-xs">• After 9 PM: Next morning</p>
                                  <p className="text-gray-600 text-xs">• 7 days a week service</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={dismissNotice}
                          className="ml-4 text-gray-400 hover:text-red-600 transition-colors"
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

        {/* Hero Section */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-black/5">
              <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 lg:mb-0">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg">
                      <Zap className="w-6 h-6 text-red-500" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">UNLIMITEDDATA GH</h1>
                      <p className="text-white/90 text-sm">Dashboard</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-white">
                      {getGreeting()}, {userName}!
                    </h2>
                    <p className="text-sm text-white/90">
                      Ready to start your hustle?
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button 
                    onClick={navigateToTopup}
                    className="group bg-white hover:bg-white/90 text-red-600 font-medium py-3 px-5 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>Top Up</span>
                  </button>
                  
                  <button 
                    onClick={() => router.push('/orders')}
                    className="group bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium py-3 px-5 rounded-xl border border-white/30 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                  >
                    <Package className="w-5 h-5" />
                    <span>Orders</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Balance Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-xl border border-red-100">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                      <DollarSign className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Account Balance</p>
                      <p className="text-gray-500 text-xs">Available funds</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-red-500" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-gray-900">
                    {animateStats ? 
                      <CurrencyCounter value={stats.balance} duration={1500} /> : 
                      formatCurrency(0)
                    }
                  </div>
                  <button
                    onClick={navigateToTopup}
                    className="inline-flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span className="text-sm">Add Funds</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Orders Today */}
            <div className="bg-white rounded-2xl p-5 shadow-xl border border-red-100">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center shadow">
                    <Package className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {animateStats ? 
                        <AnimatedCounter value={stats.todayOrders} duration={1200} /> : 
                        "0"
                      }
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-900 font-medium text-sm">Orders Today</p>
                  <p className="text-gray-500 text-xs">Active transactions</p>
                </div>
              </div>
            </div>

            {/* Revenue Today */}
            <div className="bg-white rounded-2xl p-5 shadow-xl border border-red-100">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center shadow">
                    <TrendingUp className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">
                      {animateStats ? 
                        <CurrencyCounter value={stats.todayRevenue} duration={1500} /> : 
                        formatCurrency(0)
                      }
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-900 font-medium text-sm">Revenue Today</p>
                  <p className="text-gray-500 text-xs">Total earnings</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Network Selection */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-red-100">
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow">
                <Signal className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Quick Order</h2>
                <p className="text-gray-500 text-xs">Choose your network</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* MTN */}
              <button 
                onClick={() => navigateToNetwork('mtn')}
                className="group bg-gradient-to-br from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 rounded-xl p-5 transition-all duration-300 transform hover:scale-105 shadow-lg relative overflow-hidden"
              >
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-white/90 flex items-center justify-center shadow">
                    <span className="text-sm font-bold text-yellow-600">MTN</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">MTN Data</p>
                    <p className="text-white/90 text-xs">Fast delivery</p>
                  </div>
                </div>
              </button>

              {/* AirtelTigo */}
              <button 
                onClick={() => navigateToNetwork('airteltigo')}
                className="group bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl p-5 transition-all duration-300 transform hover:scale-105 shadow-lg relative overflow-hidden"
              >
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-white/90 flex items-center justify-center shadow">
                    <span className="text-xs font-bold text-blue-600">A-Tigo</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">AirtelTigo</p>
                    <p className="text-white/90 text-xs">Reliable network</p>
                  </div>
                </div>
              </button>

              {/* Telecel */}
              <button 
                onClick={() => navigateToNetwork('telecel')}
                className="group bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl p-5 transition-all duration-300 transform hover:scale-105 shadow-lg relative overflow-hidden"
              >
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-white/90 flex items-center justify-center shadow">
                    <span className="text-sm font-bold text-red-600">TEL</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Telecel</p>
                    <p className="text-white/90 text-xs">Best value</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
            <div className="p-6 border-b border-red-100 bg-gradient-to-r from-red-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow">
                    <Activity className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                    <p className="text-gray-500 text-xs">Latest transactions</p>
                  </div>
                </div>
                
                <button 
                  onClick={ViewAll}
                  className="group flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow"
                >
                  <span className="text-sm">View All</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {stats.recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentTransactions.slice(0, 5).map((transaction, index) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-white rounded-xl hover:shadow-md transition-all duration-200 border border-red-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center shadow">
                          <Database className="w-5 h-5 text-white" strokeWidth={2} />
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium text-sm">{transaction.customer}</p>
                          <p className="text-gray-500 text-xs">{transaction.gb}GB • {transaction.method}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-gray-900 font-bold text-sm">{formatCurrency(transaction.amount)}</p>
                        <p className="text-gray-500 text-xs">{transaction.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-xl bg-red-50 flex items-center justify-center mb-4">
                    <Database className="w-8 h-8 text-red-300" />
                  </div>
                  <p className="text-gray-700 text-sm font-medium">No transactions yet</p>
                  <p className="text-gray-500 text-xs mt-1">Start your hustle journey!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { icon: Package, label: 'New Order', path: '/datamart', gradient: 'from-red-500 to-red-600' },
            { icon: BarChart2, label: 'Analytics', path: '/reports', gradient: 'from-red-400 to-red-500' },
            { icon: Clock, label: 'History', path: '/orders', gradient: 'from-red-600 to-red-700' },
            { icon: CreditCard, label: 'Top Up', onClick: navigateToTopup, gradient: 'from-red-500 to-pink-500' },
            { icon: AlertCircle, label: 'Support', path: '/support', gradient: 'from-red-400 to-red-500' },
            { icon: User, label: 'Profile', path: '/profile', gradient: 'from-red-500 to-red-600' }
          ].map((action, index) => (
            <button
              key={index}
              onClick={action.onClick || (() => router.push(action.path))}
              className="group bg-white hover:shadow-xl rounded-xl p-4 transition-all duration-300 transform hover:scale-105 shadow-lg border border-red-100 relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="relative z-10 text-center space-y-2">
                <div className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow group-hover:bg-white transition-colors`}>
                  <action.icon className="w-5 h-5 text-white group-hover:text-red-500" strokeWidth={2} />
                </div>
                <p className="text-gray-700 font-medium text-xs group-hover:text-white">{action.label}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Add fadeInDown animation */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInDown {
          animation: fadeInDown 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;