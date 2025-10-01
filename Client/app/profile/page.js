'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Percent,
  TrendingUp,
  Moon,
  Sun,
  Activity,
  Target,
  Star,
  ArrowUp,
  DollarSign,
  BarChart3,
  Zap,
  Sparkles,
  Trophy,
  Shield,
  TrendingDown,
  ChevronRight,
  Bell,
  Settings,
  LogOut,
  Briefcase,
  Package,
  Users,
  Flame,
  Crown,
  Gem,
  Rocket,
  Zap as Lightning,
  Globe,
  Wifi
} from 'lucide-react';

// Animated Logo Component
const AnimatedLogo = () => (
  <div className="relative inline-flex items-center">
    <div className="relative">
      <span className="text-2xl font-black text-white tracking-tight">
        <span className="inline-block animate-pulse">Unlimited</span>
        <span className="text-red-500 inline-block">Data</span>
      </span>
      <span className="ml-2 text-sm font-bold text-red-400">GH</span>
      <div className="absolute -inset-1 bg-red-500/20 blur-xl animate-pulse"></div>
    </div>
    <Wifi className="w-5 h-5 text-red-500 ml-2 animate-bounce" />
  </div>
);

// Custom hook for theme management
const useTheme = () => {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    }
  }, []);

  return { darkMode, toggleDarkMode: () => {} };
};

// Custom hook for authentication
const useAuth = () => {
  const [authState, setAuthState] = useState({
    token: null,
    userData: null,
    isAuthenticated: false,
    loading: true
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      const userDataStr = localStorage.getItem('userData');

      if (token && userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          setAuthState({
            token,
            userData,
            isAuthenticated: true,
            loading: false
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
  }, []);

  return { ...authState, logout };
};

// Stat card component with black/red theme
const StatCard = ({ icon: Icon, title, value, subtitle, trend, trendValue, featured = false }) => (
  <div className={`group relative overflow-hidden ${
    featured 
      ? 'bg-gradient-to-br from-red-950/50 to-black/50 border-red-500/50' 
      : 'bg-gradient-to-br from-zinc-900/90 to-black/90 border-zinc-800/50'
    } backdrop-blur-xl rounded-2xl p-6 border hover:border-red-500/50 transition-all duration-300 hover:scale-105 hover:shadow-red-500/20 hover:shadow-2xl`}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-opacity animate-pulse"></div>
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${
          featured 
            ? 'bg-gradient-to-br from-red-600 to-red-800' 
            : 'bg-gradient-to-br from-zinc-800 to-zinc-900'
          } rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-red-500/30 transition-all`}>
          <Icon className={`w-6 h-6 ${featured ? 'text-white' : 'text-red-400'}`} />
        </div>
        {trend && (
          <div className={`flex items-center ${trendValue > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trendValue > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm ml-1">{Math.abs(trendValue)}%</span>
          </div>
        )}
      </div>
      <p className="text-zinc-500 text-sm font-medium mb-1">{title}</p>
      <p className="text-2xl font-bold text-white group-hover:text-red-400 transition-colors">{value}</p>
      {subtitle && <p className="text-xs text-zinc-600 mt-2">{subtitle}</p>}
    </div>
  </div>
);

// Progress bar component with red theme
const ProgressBar = ({ value, max = 100, height = "h-2", redTheme = true }) => (
  <div className={`bg-zinc-900 ${height} rounded-full overflow-hidden`}>
    <div 
      className={`${
        redTheme 
          ? 'bg-gradient-to-r from-red-600 to-red-400' 
          : 'bg-gradient-to-r from-zinc-700 to-zinc-600'
        } h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
      style={{ width: `${(value / max) * 100}%` }}
    >
      <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
    </div>
  </div>
);

// Achievement badge component with black/red theme
const AchievementBadge = ({ icon: Icon, title, description, unlocked = true }) => (
  <div className={`p-4 rounded-xl border transition-all duration-300 ${
    unlocked 
      ? 'bg-gradient-to-br from-red-950/30 to-black/30 border-red-500/30 hover:border-red-400/50 hover:shadow-lg hover:shadow-red-500/10' 
      : 'bg-zinc-900/30 border-zinc-800/30 opacity-50'
    }`}>
    <div className="flex items-start space-x-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        unlocked 
          ? 'bg-gradient-to-br from-red-600 to-red-800 shadow-lg shadow-red-500/30' 
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

// Main component
function UserStatsPage() {
  const { darkMode } = useTheme();
  const { token, userData, isAuthenticated, loading: authLoading, logout } = useAuth();
  
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate derived stats
  const derivedStats = useMemo(() => {
    if (!userStats) return null;
    
    const performanceScore = Math.round(
      (userStats.orderStats.successRate * 0.6) + 
      (Math.min(userStats.orderStats.totalOrders / 100, 1) * 40)
    );
    
    const engagementLevel = 
      userStats.orderStats.totalOrders > 100 ? 'Elite' :
      userStats.orderStats.totalOrders > 50 ? 'High' :
      userStats.orderStats.totalOrders > 20 ? 'Active' : 'Growing';
    
    const dailyAverage = userStats.userInfo.accountAge > 0 
      ? (userStats.orderStats.totalOrders / userStats.userInfo.accountAge).toFixed(2)
      : 0;
    
    return {
      performanceScore,
      engagementLevel,
      dailyAverage,
      completionRate: ((userStats.orderStats.successfulOrders / Math.max(userStats.orderStats.totalOrders, 1)) * 100).toFixed(1)
    };
  }, [userStats]);

  // Fetch user stats
  const fetchUserStats = useCallback(async (showRefreshing = false) => {
    if (!token || !userData) return;
    
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    
    try {
      const response = await fetch(
        `https://unlimitedata.onrender.com/api/v1/user-stats/${userData.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUserStats(data.data);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to fetch user statistics');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'An error occurred while fetching user statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, userData, logout]);

  useEffect(() => {
    if (isAuthenticated && userData && token) {
      fetchUserStats();
    } else if (!authLoading && !isAuthenticated && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, [isAuthenticated, userData, token, authLoading, fetchUserStats]);

  // Format functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <AnimatedLogo />
          </div>
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
            <div className="absolute inset-0 border-t-4 border-red-500 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Dashboard</h2>
          <p className="text-red-400">Preparing your statistics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-red-500/20 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Data</h2>
            <p className="text-zinc-400 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => fetchUserStats()}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all"
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Retry
              </button>
              <button
                onClick={logout}
                className="px-6 py-3 bg-zinc-800 text-white font-semibold rounded-xl hover:bg-zinc-700 transition-all"
              >
                <LogOut className="w-4 h-4 inline mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userStats) return null;

  const isAdmin = userData?.role === 'admin';

  return (
    <div className="min-h-screen bg-black">
      {/* Animated background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-red-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <AnimatedLogo />
            
            <div className="flex items-center space-x-3">
              <button className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => fetchUserStats(true)}
                disabled={refreshing}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 inline mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Sync
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-red-950/50 via-black to-red-950/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-red-900/30 p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-red-600/10"></div>
          <div className="relative">
            <div className="flex items-center mb-2">
              <Flame className="w-5 h-5 text-red-400 mr-2 animate-pulse" />
              <span className="text-sm font-medium text-red-400 uppercase tracking-wider">Performance Hub</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-2">
              Analytics <span className="text-red-500">Dashboard</span>
            </h1>
            <p className="text-zinc-400 text-lg">Real-time insights powered by UnlimitedData GH</p>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-800/50 p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            <div className="relative">
              <div className="w-28 h-28 bg-gradient-to-br from-red-600 via-red-700 to-black rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/20">
                <User className="w-14 h-14 text-white" />
              </div>
              {userStats.orderStats.successRate >= 80 && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center border-2 border-black animate-bounce">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                <h2 className="text-3xl font-bold text-white">{userStats.userInfo.name}</h2>
                {isAdmin && (
                  <span className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold rounded-full animate-pulse">
                    ADMIN
                  </span>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 text-sm text-zinc-500">
                <div className="flex items-center hover:text-red-400 transition-colors">
                  <Mail className="w-4 h-4 mr-2" />
                  {userStats.userInfo.email}
                </div>
                <div className="flex items-center hover:text-red-400 transition-colors">
                  <Phone className="w-4 h-4 mr-2" />
                  {userStats.userInfo.phoneNumber}
                </div>
                <div className="flex items-center hover:text-red-400 transition-colors">
                  <Calendar className="w-4 h-4 mr-2" />
                  Since {formatDate(userStats.userInfo.registrationDate)}
                </div>
              </div>
              
              {derivedStats && (
                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-red-500/50 transition-all">
                    <p className="text-xs text-zinc-500 mb-1">Performance</p>
                    <p className="text-lg font-bold text-red-400">{derivedStats.performanceScore}%</p>
                  </div>
                  <div className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-red-500/50 transition-all">
                    <p className="text-xs text-zinc-500 mb-1">Level</p>
                    <p className="text-lg font-bold text-red-400">{derivedStats.engagementLevel}</p>
                  </div>
                  <div className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-red-500/50 transition-all">
                    <p className="text-xs text-zinc-500 mb-1">Daily Avg</p>
                    <p className="text-lg font-bold text-red-400">{derivedStats.dailyAverage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          {['overview', 'orders', 'financial', 'achievements'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Wallet}
              title="Wallet Balance"
              value={formatCurrency(userStats.userInfo.walletBalance)}
              featured={true}
              trend
              trendValue={12}
            />
            <StatCard
              icon={ShoppingCart}
              title="Total Orders"
              value={formatNumber(userStats.orderStats.totalOrders)}
              subtitle={`${userStats.orderStats.successfulOrders} successful`}
            />
            <StatCard
              icon={Trophy}
              title="Success Rate"
              value={`${userStats.orderStats.successRate}%`}
              subtitle={derivedStats ? `${derivedStats.completionRate}% completion` : ''}
              featured={userStats.orderStats.successRate >= 80}
              trend
              trendValue={5}
            />
            <StatCard
              icon={Clock}
              title="Account Age"
              value={`${userStats.userInfo.accountAge} days`}
              subtitle="Active member"
            />
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/50">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Rocket className="w-6 h-6 text-red-400 mr-2" />
                Order Distribution
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-zinc-500">Successful</span>
                    <span className="text-white font-medium">{userStats.orderStats.successfulOrders}</span>
                  </div>
                  <ProgressBar value={userStats.orderStats.successfulOrders} max={userStats.orderStats.totalOrders} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-zinc-500">Pending</span>
                    <span className="text-white font-medium">{userStats.orderStats.totalOrders - userStats.orderStats.successfulOrders}</span>
                  </div>
                  <ProgressBar value={userStats.orderStats.totalOrders - userStats.orderStats.successfulOrders} max={userStats.orderStats.totalOrders} redTheme={false} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/50">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Lightning className="w-6 h-6 text-red-400 mr-2" />
                Performance Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-black/50 rounded-xl border border-zinc-800 hover:border-red-500/50 transition-all">
                  <Activity className="w-6 h-6 text-red-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{derivedStats?.dailyAverage || 0}</p>
                  <p className="text-xs text-zinc-500">Daily avg orders</p>
                </div>
                <div className="p-4 bg-black/50 rounded-xl border border-zinc-800 hover:border-red-500/50 transition-all">
                  <Target className="w-6 h-6 text-red-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{derivedStats?.completionRate || 0}%</p>
                  <p className="text-xs text-zinc-500">Completion rate</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-xl rounded-2xl p-8 border border-zinc-800/50">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Gem className="w-7 h-7 text-red-400 mr-3" />
              Financial Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-green-950/30 to-black/30 rounded-xl border border-green-900/30 hover:border-green-500/50 transition-all group">
                <Wallet className="w-8 h-8 text-green-400 mb-3 group-hover:animate-bounce" />
                <p className="text-zinc-500 text-sm mb-1">Current Balance</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(userStats.userInfo.walletBalance)}</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-red-950/30 to-black/30 rounded-xl border border-red-900/30 hover:border-red-500/50 transition-all group">
                <CreditCard className="w-8 h-8 text-red-400 mb-3 group-hover:animate-bounce" />
                <p className="text-zinc-500 text-sm mb-1">Total Deposits</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(userStats.depositStats.totalAmount)}</p>
                <p className="text-xs text-zinc-600 mt-1">{userStats.depositStats.numberOfDeposits} transactions</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-orange-950/30 to-black/30 rounded-xl border border-orange-900/30 hover:border-orange-500/50 transition-all group">
                <TrendingUp className="w-8 h-8 text-orange-400 mb-3 group-hover:animate-bounce" />
                <p className="text-zinc-500 text-sm mb-1">Avg Deposit</p>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(userStats.depositStats.numberOfDeposits > 0 ? userStats.depositStats.totalAmount / userStats.depositStats.numberOfDeposits : 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AchievementBadge
              icon={Star}
              title="Early Adopter"
              description="Joined the platform in its early days"
              unlocked={userStats.userInfo.accountAge > 90}
            />
            <AchievementBadge
              icon={Crown}
              title="High Performer"
              description="Maintained 80%+ success rate"
              unlocked={userStats.orderStats.successRate >= 80}
            />
            <AchievementBadge
              icon={Zap}
              title="Power User"
              description="Completed 50+ orders"
              unlocked={userStats.orderStats.totalOrders >= 50}
            />
            <AchievementBadge
              icon={Shield}
              title="Trusted Member"
              description="Verified account with consistent activity"
              unlocked={userStats.orderStats.successfulOrders >= 20}
            />
            <AchievementBadge
              icon={Flame}
              title="On Fire"
              description="Active for 30+ consecutive days"
              unlocked={userStats.userInfo.accountAge >= 30}
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
        {isAdmin && userStats.ranking && (
          <div className="mt-8 bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-xl rounded-2xl p-8 border border-red-500/30">
            <div className="flex items-center mb-6">
              <Award className="w-8 h-8 text-red-400 mr-3 animate-pulse" />
              <div>
                <h3 className="text-2xl font-bold text-white">Leaderboard Ranking</h3>
                <p className="text-zinc-500 text-sm">Administrator access only</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-red-950/30 to-black/30 rounded-xl border border-red-500/30">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-2">
                  #{userStats.ranking.position}
                </div>
                <p className="text-zinc-500">Global Position</p>
                <p className="text-sm text-zinc-600 mt-1">Out of {formatNumber(userStats.ranking.outOf)} users</p>
              </div>
              
              <div className="col-span-2 space-y-4">
                <div className="p-4 bg-black/50 rounded-xl border border-zinc-800">
                  <div className="flex justify-between mb-2">
                    <span className="text-zinc-500">Percentile Ranking</span>
                    <span className="text-white font-bold">Top {userStats.ranking.percentile}%</span>
                  </div>
                  <ProgressBar value={100 - userStats.ranking.percentile} />
                </div>
                
                <div className="p-4 bg-gradient-to-r from-red-950/20 to-black/20 rounded-xl border border-red-900/20">
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {userStats.ranking.position <= 10 ? 
                      "🏆 Elite tier! This account represents the pinnacle of UnlimitedData GH platform engagement." :
                    userStats.ranking.position <= 50 ?
                      "⭐ Outstanding performance! Consistently exceeding platform averages." :
                    userStats.ranking.position <= 100 ?
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

export default UserStatsPage;