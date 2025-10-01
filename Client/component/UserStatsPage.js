'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  CreditCard, 
  ShoppingCart, 
  Award, 
  Clock, 
  Mail, 
  Phone, 
  Calendar, 
  Wallet,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Activity,
  Target,
  Star,
  BarChart3,
  Zap,
  Trophy,
  Shield,
  TrendingDown,
  Bell,
  Settings,
  LogOut,
  Flame,
  Crown,
  Gem,
  Rocket,
  Wifi,
  DollarSign,
  CheckCircle
} from 'lucide-react';

// Constants
const API_BASE_URL = 'https://unlimitedata.onrender.com/api/v1';
const TABS = ['overview', 'orders', 'financial', 'achievements'];

// Animated Logo Component
const AnimatedLogo = () => (
  <div className="relative inline-flex items-center">
    <div className="relative">
      <span className="text-xl md:text-2xl font-black text-white tracking-tight">
        <span className="inline-block animate-pulse">Unlimited</span>
        <span className="text-red-500 inline-block animate-pulse ml-1">Data</span>
      </span>
      <span className="ml-2 text-xs md:text-sm font-bold text-red-400">GH</span>
      <div className="absolute -inset-1 bg-red-500/10 blur-2xl animate-pulse"></div>
    </div>
    <Wifi className="w-4 h-4 md:w-5 md:h-5 text-red-500 ml-2 animate-pulse" />
  </div>
);

// Loading Spinner Component
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <div className="mb-8">
        <AnimatedLogo />
      </div>
      <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-6">
        <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
        <div className="absolute inset-0 border-t-4 border-red-500 rounded-full animate-spin"></div>
      </div>
      <h2 className="text-lg md:text-xl font-semibold text-white mb-2">{message}</h2>
      <p className="text-red-400 text-sm md:text-base">Please wait...</p>
    </div>
  </div>
);

// Error Display Component
const ErrorDisplay = ({ error, onRetry, onLogout }) => (
  <div className="min-h-screen bg-black flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-zinc-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-red-500/20 p-6 md:p-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Error Loading Data</h2>
        <p className="text-zinc-400 mb-6 text-sm md:text-base">{error}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onRetry}
            className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all text-sm md:text-base"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Retry
          </button>
          <button
            onClick={onLogout}
            className="px-4 md:px-6 py-2 md:py-3 bg-zinc-800 text-white font-semibold rounded-xl hover:bg-zinc-700 transition-all text-sm md:text-base"
          >
            <LogOut className="w-4 h-4 inline mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ icon: Icon, title, value, subtitle, trend, trendValue, featured = false }) => (
  <div className={`group relative overflow-hidden ${
    featured 
      ? 'bg-gradient-to-br from-red-950/40 to-black border-red-500/40' 
      : 'bg-gradient-to-br from-zinc-900/80 to-black border-zinc-800'
  } backdrop-blur-xl rounded-xl p-4 md:p-6 border hover:border-red-500/50 transition-all duration-300 hover:scale-[1.02]`}>
    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-opacity"></div>
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 md:w-12 md:h-12 ${
          featured 
            ? 'bg-gradient-to-br from-red-600 to-red-800' 
            : 'bg-zinc-800'
        } rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center text-xs md:text-sm ${trendValue > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trendValue > 0 ? <TrendingUp className="w-3 h-3 md:w-4 md:h-4" /> : <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />}
            <span className="ml-1">{Math.abs(trendValue)}%</span>
          </div>
        )}
      </div>
      <p className="text-zinc-500 text-xs md:text-sm font-medium mb-1">{title}</p>
      <p className="text-xl md:text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-xs text-zinc-600 mt-2">{subtitle}</p>}
    </div>
  </div>
);

// Progress Bar Component
const ProgressBar = ({ value, max = 100, label, color = "red" }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const colorClasses = {
    red: 'from-red-600 to-red-400',
    green: 'from-green-600 to-green-400',
    yellow: 'from-yellow-600 to-yellow-400',
    gray: 'from-zinc-700 to-zinc-600'
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-zinc-500">{label}</span>
          <span className="text-white font-medium">{value}</span>
        </div>
      )}
      <div className="bg-zinc-900 h-2 rounded-full overflow-hidden">
        <div 
          className={`bg-gradient-to-r ${colorClasses[color]} h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

// Achievement Badge Component
const AchievementBadge = ({ icon: Icon, title, description, unlocked = true }) => (
  <div className={`p-4 rounded-xl border transition-all duration-300 ${
    unlocked 
      ? 'bg-gradient-to-br from-red-950/20 to-black border-red-500/30 hover:border-red-400/50 hover:shadow-lg hover:shadow-red-500/10' 
      : 'bg-zinc-900/30 border-zinc-800/30 opacity-50 grayscale'
  }`}>
    <div className="flex items-start space-x-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        unlocked 
          ? 'bg-gradient-to-br from-red-600 to-red-800' 
          : 'bg-zinc-800'
      }`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <h4 className="text-white font-semibold text-sm">{title}</h4>
        <p className="text-zinc-500 text-xs mt-1">{description}</p>
      </div>
    </div>
  </div>
);

// Main Dashboard Component
function UserStatsPage() {
  const router = useRouter();
  
  // State Management
  const [authState, setAuthState] = useState({
    token: null,
    userData: null,
    isAuthenticated: false,
    loading: true
  });
  
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Initialize authentication
  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem('authToken');
        const userDataStr = localStorage.getItem('userData');

        if (token && userDataStr) {
          const userData = JSON.parse(userDataStr);
          setAuthState({
            token,
            userData,
            isAuthenticated: true,
            loading: false
          });
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
        router.push('/login');
      }
    };

    initAuth();
  }, [router]);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    router.push('/login');
  }, [router]);

  // Fetch user statistics
  const fetchUserStats = useCallback(async (showRefreshing = false) => {
    if (!authState.token || !authState.userData) return;
    
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/user-stats/${authState.userData.id}`,
        {
          headers: {
            'Authorization': `Bearer ${authState.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }
        throw new Error(`Failed to fetch data (${response.status})`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setUserStats(data.data);
        setError(null);
      } else {
        throw new Error(data.message || 'Invalid data received');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authState.token, authState.userData, logout]);

  // Fetch data when authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.userData && authState.token) {
      fetchUserStats();
    }
  }, [authState.isAuthenticated, authState.userData, authState.token, fetchUserStats]);

  // Calculate derived statistics
  const derivedStats = useMemo(() => {
    if (!userStats) return null;
    
    const { orderStats, userInfo } = userStats;
    
    const performanceScore = Math.round(
      (orderStats.successRate * 0.6) + 
      (Math.min(orderStats.totalOrders / 100, 1) * 40)
    );
    
    const engagementLevel = 
      orderStats.totalOrders > 100 ? 'Elite' :
      orderStats.totalOrders > 50 ? 'High' :
      orderStats.totalOrders > 20 ? 'Active' : 'Growing';
    
    const dailyAverage = userInfo.accountAge > 0 
      ? (orderStats.totalOrders / userInfo.accountAge).toFixed(2)
      : '0';
    
    const completionRate = orderStats.totalOrders > 0
      ? ((orderStats.successfulOrders / orderStats.totalOrders) * 100).toFixed(1)
      : '0';

    return {
      performanceScore,
      engagementLevel,
      dailyAverage,
      completionRate
    };
  }, [userStats]);

  // Formatting utilities
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || '0';
  };

  // Loading state
  if (authState.loading || loading) {
    return <LoadingSpinner message="Loading Dashboard" />;
  }

  // Error state
  if (error) {
    return <ErrorDisplay error={error} onRetry={() => fetchUserStats()} onLogout={logout} />;
  }

  // No data state
  if (!userStats) {
    return <LoadingSpinner message="Initializing..." />;
  }

  const { userInfo, orderStats, depositStats, ranking } = userStats;
  const isAdmin = authState.userData?.role === 'admin';

  return (
    <div className="min-h-screen bg-black relative">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-red-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <AnimatedLogo />
            
            <div className="flex items-center space-x-2 md:space-x-3">
              <button 
                className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button 
                className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={() => fetchUserStats(true)}
                disabled={refreshing}
                className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs md:text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 md:w-4 md:h-4 inline mr-1 md:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Sync
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-red-950/40 via-black to-red-950/40 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-2xl border border-red-900/30 p-4 md:p-8 mb-4 md:mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-transparent to-red-600/5"></div>
          <div className="relative">
            <div className="flex items-center mb-2">
              <Flame className="w-4 h-4 md:w-5 md:h-5 text-red-400 mr-2 animate-pulse" />
              <span className="text-xs md:text-sm font-medium text-red-400 uppercase tracking-wider">Performance Hub</span>
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-1 md:mb-2">
              Analytics <span className="text-red-500">Dashboard</span>
            </h1>
            <p className="text-zinc-400 text-sm md:text-lg">Real-time insights powered by UnlimitedData GH</p>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="bg-gradient-to-br from-zinc-900/80 to-black backdrop-blur-xl rounded-xl md:rounded-2xl shadow-2xl border border-zinc-800 p-4 md:p-8 mb-4 md:mb-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 md:gap-8">
            <div className="relative">
              <div className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-red-600 via-red-700 to-black rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/20">
                <User className="w-10 h-10 md:w-14 md:h-14 text-white" />
              </div>
              {orderStats.successRate >= 80 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center border-2 border-black">
                  <Crown className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 md:gap-3 mb-2">
                <h2 className="text-xl md:text-3xl font-bold text-white">{userInfo.name}</h2>
                {isAdmin && (
                  <span className="px-2 md:px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold rounded-full animate-pulse">
                    ADMIN
                  </span>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-2 md:gap-4 text-xs md:text-sm text-zinc-500">
                <div className="flex items-center hover:text-red-400 transition-colors">
                  <Mail className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  {userInfo.email}
                </div>
                <div className="flex items-center hover:text-red-400 transition-colors">
                  <Phone className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  {userInfo.phoneNumber}
                </div>
                <div className="flex items-center hover:text-red-400 transition-colors">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Since {formatDate(userInfo.registrationDate)}
                </div>
              </div>
              
              {derivedStats && (
                <div className="flex flex-wrap gap-2 md:gap-4 mt-4 md:mt-6">
                  <div className="px-3 md:px-4 py-1.5 md:py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-red-500/50 transition-all">
                    <p className="text-xs text-zinc-500 mb-0.5 md:mb-1">Performance</p>
                    <p className="text-base md:text-lg font-bold text-red-400">{derivedStats.performanceScore}%</p>
                  </div>
                  <div className="px-3 md:px-4 py-1.5 md:py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-red-500/50 transition-all">
                    <p className="text-xs text-zinc-500 mb-0.5 md:mb-1">Level</p>
                    <p className="text-base md:text-lg font-bold text-red-400">{derivedStats.engagementLevel}</p>
                  </div>
                  <div className="px-3 md:px-4 py-1.5 md:py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-red-500/50 transition-all">
                    <p className="text-xs text-zinc-500 mb-0.5 md:mb-1">Daily Avg</p>
                    <p className="text-base md:text-lg font-bold text-red-400">{derivedStats.dailyAverage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 md:space-x-2 mb-4 md:mb-8 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-medium transition-all whitespace-nowrap text-sm md:text-base ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30'
                  : 'bg-zinc-900/50 text-zinc-500 hover:text-white hover:bg-zinc-800/50 border border-zinc-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-8">
            <StatCard
              icon={Wallet}
              title="Wallet Balance"
              value={formatCurrency(userInfo.walletBalance)}
              featured={true}
              trend
              trendValue={12}
            />
            <StatCard
              icon={ShoppingCart}
              title="Total Orders"
              value={formatNumber(orderStats.totalOrders)}
              subtitle={`${orderStats.successfulOrders} successful`}
            />
            <StatCard
              icon={Trophy}
              title="Success Rate"
              value={`${orderStats.successRate}%`}
              subtitle={`${derivedStats?.completionRate}% completion`}
              featured={orderStats.successRate >= 80}
              trend
              trendValue={5}
            />
            <StatCard
              icon={Clock}
              title="Account Age"
              value={`${userInfo.accountAge} days`}
              subtitle="Active member"
            />
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            <div className="bg-gradient-to-br from-zinc-900/80 to-black backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-6 border border-zinc-800">
              <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 flex items-center">
                <Rocket className="w-5 h-5 md:w-6 md:h-6 text-red-400 mr-2" />
                Order Distribution
              </h3>
              <div className="space-y-4">
                <ProgressBar 
                  value={orderStats.successfulOrders} 
                  max={orderStats.totalOrders}
                  label="Successful"
                  color="green"
                />
                <ProgressBar 
                  value={orderStats.totalOrders - orderStats.successfulOrders} 
                  max={orderStats.totalOrders}
                  label="Pending"
                  color="yellow"
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-zinc-900/80 to-black backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-6 border border-zinc-800">
              <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 flex items-center">
                <Zap className="w-5 h-5 md:w-6 md:h-6 text-red-400 mr-2" />
                Performance Metrics
              </h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="p-3 md:p-4 bg-black/50 rounded-lg md:rounded-xl border border-zinc-800 hover:border-red-500/50 transition-all">
                  <Activity className="w-5 h-5 md:w-6 md:h-6 text-red-400 mb-1 md:mb-2" />
                  <p className="text-xl md:text-2xl font-bold text-white">{derivedStats?.dailyAverage || 0}</p>
                  <p className="text-xs text-zinc-500">Daily avg</p>
                </div>
                <div className="p-3 md:p-4 bg-black/50 rounded-lg md:rounded-xl border border-zinc-800 hover:border-red-500/50 transition-all">
                  <Target className="w-5 h-5 md:w-6 md:h-6 text-red-400 mb-1 md:mb-2" />
                  <p className="text-xl md:text-2xl font-bold text-white">{derivedStats?.completionRate || 0}%</p>
                  <p className="text-xs text-zinc-500">Completion</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="bg-gradient-to-br from-zinc-900/80 to-black backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-8 border border-zinc-800">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center">
              <Gem className="w-6 h-6 md:w-7 md:h-7 text-red-400 mr-2 md:mr-3" />
              Financial Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="p-4 md:p-6 bg-gradient-to-br from-green-950/30 to-black rounded-lg md:rounded-xl border border-green-900/30 hover:border-green-500/50 transition-all">
                <Wallet className="w-6 h-6 md:w-8 md:h-8 text-green-400 mb-2 md:mb-3" />
                <p className="text-zinc-500 text-xs md:text-sm mb-1">Current Balance</p>
                <p className="text-2xl md:text-3xl font-bold text-white">{formatCurrency(userInfo.walletBalance)}</p>
              </div>
              <div className="p-4 md:p-6 bg-gradient-to-br from-red-950/30 to-black rounded-lg md:rounded-xl border border-red-900/30 hover:border-red-500/50 transition-all">
                <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-red-400 mb-2 md:mb-3" />
                <p className="text-zinc-500 text-xs md:text-sm mb-1">Total Deposits</p>
                <p className="text-2xl md:text-3xl font-bold text-white">{formatCurrency(depositStats.totalAmount)}</p>
                <p className="text-xs text-zinc-600 mt-1">{depositStats.numberOfDeposits} transactions</p>
              </div>
              <div className="p-4 md:p-6 bg-gradient-to-br from-orange-950/30 to-black rounded-lg md:rounded-xl border border-orange-900/30 hover:border-orange-500/50 transition-all">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-orange-400 mb-2 md:mb-3" />
                <p className="text-zinc-500 text-xs md:text-sm mb-1">Avg Deposit</p>
                <p className="text-2xl md:text-3xl font-bold text-white">
                  {formatCurrency(depositStats.numberOfDeposits > 0 ? depositStats.totalAmount / depositStats.numberOfDeposits : 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <AchievementBadge
              icon={Star}
              title="Early Adopter"
              description="Joined the platform in its early days"
              unlocked={userInfo.accountAge > 90}
            />
            <AchievementBadge
              icon={Crown}
              title="High Performer"
              description="Maintained 80%+ success rate"
              unlocked={orderStats.successRate >= 80}
            />
            <AchievementBadge
              icon={Zap}
              title="Power User"
              description="Completed 50+ orders"
              unlocked={orderStats.totalOrders >= 50}
            />
            <AchievementBadge
              icon={Shield}
              title="Trusted Member"
              description="Verified account with consistent activity"
              unlocked={orderStats.successfulOrders >= 20}
            />
            <AchievementBadge
              icon={Flame}
              title="On Fire"
              description="Active for 30+ consecutive days"
              unlocked={userInfo.accountAge >= 30}
            />
            <AchievementBadge
              icon={Rocket}
              title="Rocket Speed"
              description="Averaging 2+ orders per day"
              unlocked={derivedStats && parseFloat(derivedStats.dailyAverage) >= 2}
            />
          </div>
        )}

        {/* Admin Ranking Section */}
        {isAdmin && ranking && (
          <div className="mt-4 md:mt-8 bg-gradient-to-br from-zinc-900/80 to-black backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-8 border border-red-500/30">
            <div className="flex items-center mb-4 md:mb-6">
              <Award className="w-6 h-6 md:w-8 md:h-8 text-red-400 mr-2 md:mr-3 animate-pulse" />
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white">Leaderboard Ranking</h3>
                <p className="text-zinc-500 text-xs md:text-sm">Administrator access only</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="text-center p-4 md:p-6 bg-gradient-to-br from-red-950/30 to-black rounded-lg md:rounded-xl border border-red-500/30">
                <div className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-2">
                  #{ranking.position}
                </div>
                <p className="text-zinc-500 text-sm md:text-base">Global Position</p>
                <p className="text-xs md:text-sm text-zinc-600 mt-1">Out of {formatNumber(ranking.outOf)} users</p>
              </div>
              
              <div className="col-span-1 md:col-span-2 space-y-4">
                <div className="p-3 md:p-4 bg-black/50 rounded-lg md:rounded-xl border border-zinc-800">
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-zinc-500">Percentile Ranking</span>
                    <span className="text-white font-bold">Top {ranking.percentile}%</span>
                  </div>
                  <ProgressBar value={100 - ranking.percentile} color="red" />
                </div>
                
                <div className="p-3 md:p-4 bg-gradient-to-r from-red-950/20 to-black/20 rounded-lg md:rounded-xl border border-red-900/20">
                  <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
                    {ranking.position <= 10 ? 
                      "🏆 Elite tier! This account represents the pinnacle of UnlimitedData GH platform engagement." :
                    ranking.position <= 50 ?
                      "⭐ Outstanding performance! Consistently exceeding platform averages." :
                    ranking.position <= 100 ?
                      "💎 Excellent standing! Strong engagement metrics across all categories." :
                      "📈 Solid performance with room for growth. Keep up the momentum!"
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Export the component
export default UserStatsPage;