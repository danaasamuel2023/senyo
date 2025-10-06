'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, CreditCard, ShoppingCart, Award, Clock, Mail, Phone, Calendar,
  Wallet, CheckCircle, RefreshCw, AlertCircle, Percent, TrendingUp, Moon,
  Sun, Activity, Target, Star, ArrowUp, DollarSign, BarChart3, Zap,
  Sparkles, Trophy, Shield, TrendingDown, ChevronRight, Bell, Settings,
  LogOut, Briefcase, Package, Users, Flame, Crown, Gem, Rocket,
  Globe, Wifi, Edit3, Save, X, Eye, EyeOff, Download, Upload,
  Lock, Unlock, Trash2, Plus, Minus, Copy, ExternalLink
} from 'lucide-react';

// API Configuration
const getApiEndpoint = (path) => {
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const baseUrl = isLocalhost ? 'http://localhost:5001' : 'https://unlimitedata.onrender.com';
  return `${baseUrl}${path}`;
};

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`p-4 rounded-2xl shadow-2xl flex items-center backdrop-blur-xl border-2 max-w-sm ${
        type === 'success' 
          ? 'bg-green-500 text-white border-green-400' 
          : type === 'error' 
            ? 'bg-red-500 text-white border-red-400' 
            : 'bg-[#FFCC08] text-black border-yellow-500'
      }`}>
        <div className="mr-3">
          {type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : type === 'error' ? (
            <X className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
        </div>
        <div className="flex-grow">
          <p className="font-semibold">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 hover:scale-110 transition-transform">
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, title, value, subtitle, trend, trendValue, featured = false, onClick }) => (
  <div 
    className={`group relative overflow-hidden cursor-pointer ${
      featured 
        ? 'bg-gradient-to-br from-[#FFCC08]/20 to-black/50 border-[#FFCC08]/50' 
        : 'bg-gradient-to-br from-gray-800/30 to-black/50 border-gray-700/50'
    } backdrop-blur-xl rounded-2xl p-6 border hover:border-[#FFCC08]/50 transition-all duration-300 hover:scale-105 hover:shadow-[#FFCC08]/20 hover:shadow-2xl`}
    onClick={onClick}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFCC08]/10 rounded-full blur-3xl group-hover:bg-[#FFCC08]/20 transition-opacity animate-pulse"></div>
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${
          featured 
            ? 'bg-[#FFCC08]' 
            : 'bg-gradient-to-br from-gray-700 to-gray-800'
          } rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-[#FFCC08]/30 transition-all`}>
          <Icon className={`w-6 h-6 ${featured ? 'text-black' : 'text-[#FFCC08]'}`} />
        </div>
        {trend && (
          <div className={`flex items-center ${trendValue > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trendValue > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm ml-1">{Math.abs(trendValue)}%</span>
          </div>
        )}
      </div>
      <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
      <p className="text-2xl font-bold text-white group-hover:text-[#FFCC08] transition-colors">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
    </div>
  </div>
);

// Progress Bar Component
const ProgressBar = ({ value, max = 100, height = "h-2", yellowTheme = true }) => (
  <div className={`bg-gray-800 ${height} rounded-full overflow-hidden`}>
    <div 
      className={`${
        yellowTheme 
          ? 'bg-gradient-to-r from-[#FFCC08] to-[#FFD700]' 
          : 'bg-gradient-to-r from-gray-600 to-gray-500'
        } h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
      style={{ width: `${(value / max) * 100}%` }}
    >
      <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
    </div>
  </div>
);

// Achievement Badge Component
const AchievementBadge = ({ icon: Icon, title, description, unlocked = true, progress = 0 }) => (
  <div className={`p-4 rounded-xl border transition-all duration-300 ${
    unlocked 
      ? 'bg-gradient-to-br from-[#FFCC08]/10 to-black/30 border-[#FFCC08]/30 hover:border-[#FFCC08]/50 hover:shadow-lg hover:shadow-[#FFCC08]/10' 
      : 'bg-gray-800/30 border-gray-700/30 opacity-50'
    }`}>
    <div className="flex items-start space-x-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        unlocked 
          ? 'bg-[#FFCC08] shadow-lg shadow-[#FFCC08]/30' 
          : 'bg-gray-700'
        }`}>
        <Icon className={`w-5 h-5 ${unlocked ? 'text-black' : 'text-white'}`} />
      </div>
      <div className="flex-1">
        <h4 className="text-white font-semibold text-sm">{title}</h4>
        <p className="text-gray-400 text-xs mt-1">{description}</p>
        {progress > 0 && progress < 100 && (
          <div className="mt-2">
            <ProgressBar value={progress} max={100} height="h-1" />
            <p className="text-xs text-gray-500 mt-1">{progress}% complete</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Loading Overlay Component
const LoadingOverlay = ({ isLoading, message = "Loading..." }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-xs w-full mx-auto text-center shadow-2xl">
        <div className="flex justify-center mb-5">
          <div className="relative w-16 h-16">
            <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>
            <div className="absolute top-0 w-16 h-16 rounded-full border-4 border-transparent border-t-[#FFCC08] animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#FFCC08] to-[#FFD700] animate-pulse flex items-center justify-center">
              <User className="w-6 h-6 text-black animate-bounce" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <h4 className="text-xl font-bold text-gray-900 mb-2">{message}</h4>
        <p className="text-gray-600">Please wait while we process your request</p>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const router = useRouter();
  
  // State Management
  const [userData, setUserData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  
  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });
  
  // Load user stats - simplified version
  const loadUserStats = useCallback(async () => {
    if (!userData) return;
    
    setLoading(true);
    try {
      // Create mock user stats for now
      const mockStats = {
        userInfo: {
          name: userData.name || 'User',
          email: userData.email || 'user@example.com',
          phone: userData.phone || 'Not provided',
          walletBalance: userData.walletBalance || 0,
          accountAge: userData.createdAt ? Math.floor((new Date() - new Date(userData.createdAt)) / (1000 * 60 * 60 * 24)) : 0,
          registrationDate: userData.createdAt || new Date().toISOString()
        },
        orderStats: {
          totalOrders: 0,
          successfulOrders: 0,
          successRate: 100
        },
        depositStats: {
          totalAmount: 0,
          numberOfDeposits: 0
        }
      };
      
      setUserStats(mockStats);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'An error occurred while loading profile');
    } finally {
      setLoading(false);
    }
  }, [userData]);

  // Check authentication and load data
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const userDataStr = localStorage.getItem('userData');
      
      if (token && userDataStr) {
        try {
          const user = JSON.parse(userDataStr);
          setUserData(user);
          // Don't call loadUserStats here - it will be called by the separate useEffect
        } catch (error) {
          console.error('Auth initialization error:', error);
          router.push('/SignIn');
        }
      } else {
        router.push('/SignIn');
      }
    };
    
    checkAuth();
  }, [router]);
  
  // Add CSS for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      .animate-slide-in {
        animation: slideIn 0.3s ease-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fade-in {
        animation: fadeIn 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Load user stats when userData changes
  useEffect(() => {
    if (userData) {
      loadUserStats();
    }
  }, [userData, loadUserStats]);
  
  // Function to show toast
  const showToast = (message, type = 'success') => {
    setToast({
      visible: true,
      message,
      type
    });
  };
  
  // Function to hide toast
  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      visible: false
    }));
  };
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    router.push('/SignIn');
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserStats();
    setRefreshing(false);
    showToast('Profile data refreshed successfully', 'success');
  };
  
  // Handle edit profile
  const handleEditProfile = () => {
    setEditData({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || ''
    });
    setIsEditing(true);
  };
  
  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(getApiEndpoint('/api/v1/user/profile'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      });
      
      if (response.ok) {
        const updatedUser = { ...userData, ...editData };
        setUserData(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        setIsEditing(false);
        showToast('Profile updated successfully', 'success');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
      showToast('Failed to update profile', 'error');
    }
  };
  
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
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-[#FFCC08]/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FFCC08] border-r-[#FFCC08]/60 animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#FFCC08] to-[#FFD700] animate-pulse flex items-center justify-center">
              <User className="w-8 h-8 text-black animate-bounce" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Profile</h2>
          <p className="text-[#FFCC08]">Preparing your data...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#FFCC08]/20 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#FFCC08]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-[#FFCC08]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Data</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRefresh}
                className="px-6 py-3 bg-[#FFCC08] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#FFCC08]/30 transition-all"
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Retry
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all"
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
  
  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-[#FFCC08]/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FFCC08] border-r-[#FFCC08]/60 animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#FFCC08] to-[#FFD700] animate-pulse flex items-center justify-center">
              <User className="w-8 h-8 text-black animate-bounce" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Profile</h2>
          <p className="text-[#FFCC08]">Preparing your data...</p>
        </div>
      </div>
    );
  }
  
  if (!userStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-[#FFCC08]/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FFCC08] border-r-[#FFCC08]/60 animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#FFCC08] to-[#FFD700] animate-pulse flex items-center justify-center">
              <User className="w-8 h-8 text-black animate-bounce" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Statistics</h2>
          <p className="text-[#FFCC08]">Preparing your analytics...</p>
        </div>
      </div>
    );
  }
  
  const isAdmin = userData?.role === 'admin';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden pb-20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-[#FFCC08]/5 to-[#FFD700]/5 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-[#FFD700]/5 to-black blur-3xl"></div>
      </div>

      {/* Toast Notification */}
      {toast.visible && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
      
      {/* Loading Overlay */}
      <LoadingOverlay isLoading={refreshing} message="Refreshing Profile..." />

      {/* Main Content */}
      <div className="relative z-10 px-3 sm:px-4 py-3 sm:py-4 max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="p-2.5 hover:bg-gray-800/50 rounded-xl transition-colors"
              >
                <ArrowUp className="w-5 h-5 text-[#FFCC08] rotate-90" />
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-[#FFCC08] to-[#FFD700] rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Profile Dashboard</h1>
                <p className="text-gray-400 mt-1">Manage your account and view statistics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-[#FFCC08] ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleEditProfile}
                className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors"
              >
                <Edit3 className="w-5 h-5 text-[#FFCC08]" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-4 sm:p-6 mb-6 border border-gray-700/50">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-[#FFCC08] to-[#FFD700] rounded-2xl flex items-center justify-center shadow-2xl">
                <User className="w-12 h-12 text-black" />
              </div>
              {userStats.orderStats.successRate >= 80 && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#FFCC08] to-[#FFD700] rounded-full flex items-center justify-center border-2 border-black animate-bounce">
                  <Crown className="w-4 h-4 text-black" />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">{userData.name}</h2>
                {isAdmin && (
                  <span className="px-3 py-1 bg-[#FFCC08] text-black text-xs font-bold rounded-full animate-pulse">
                    ADMIN
                  </span>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 text-sm text-gray-400">
                <div className="flex items-center hover:text-[#FFCC08] transition-colors">
                  <Mail className="w-4 h-4 mr-2" />
                  {userData.email}
                </div>
                <div className="flex items-center hover:text-[#FFCC08] transition-colors">
                  <Phone className="w-4 h-4 mr-2" />
                  {userData.phone || 'Not provided'}
                </div>
                <div className="flex items-center hover:text-[#FFCC08] transition-colors">
                  <Calendar className="w-4 h-4 mr-2" />
                  Since {formatDate(userData.createdAt || new Date())}
                </div>
              </div>
              
              {derivedStats && (
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg hover:border-[#FFCC08]/50 transition-all">
                    <p className="text-xs text-gray-400 mb-1">Performance</p>
                    <p className="text-lg font-bold text-[#FFCC08]">{derivedStats.performanceScore}%</p>
                  </div>
                  <div className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg hover:border-[#FFCC08]/50 transition-all">
                    <p className="text-xs text-gray-400 mb-1">Level</p>
                    <p className="text-lg font-bold text-[#FFCC08]">{derivedStats.engagementLevel}</p>
                  </div>
                  <div className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg hover:border-[#FFCC08]/50 transition-all">
                    <p className="text-xs text-gray-400 mb-1">Daily Avg</p>
                    <p className="text-lg font-bold text-[#FFCC08]">{derivedStats.dailyAverage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {['overview', 'orders', 'financial', 'achievements'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-[#FFCC08] text-black shadow-lg shadow-[#FFCC08]/30'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Rocket className="w-6 h-6 text-[#FFCC08] mr-2" />
                Order Distribution
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Successful</span>
                    <span className="text-white font-medium">{userStats.orderStats.successfulOrders}</span>
                  </div>
                  <ProgressBar value={userStats.orderStats.successfulOrders} max={userStats.orderStats.totalOrders} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Pending</span>
                    <span className="text-white font-medium">{userStats.orderStats.totalOrders - userStats.orderStats.successfulOrders}</span>
                  </div>
                  <ProgressBar value={userStats.orderStats.totalOrders - userStats.orderStats.successfulOrders} max={userStats.orderStats.totalOrders} yellowTheme={false} />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Zap className="w-6 h-6 text-[#FFCC08] mr-2" />
                Performance Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-black/50 rounded-xl border border-gray-700 hover:border-[#FFCC08]/50 transition-all">
                  <Activity className="w-6 h-6 text-[#FFCC08] mb-2" />
                  <p className="text-2xl font-bold text-white">{derivedStats?.dailyAverage || 0}</p>
                  <p className="text-xs text-gray-400">Daily avg orders</p>
                </div>
                <div className="p-4 bg-black/50 rounded-xl border border-gray-700 hover:border-[#FFCC08]/50 transition-all">
                  <Target className="w-6 h-6 text-[#FFCC08] mb-2" />
                  <p className="text-2xl font-bold text-white">{derivedStats?.completionRate || 0}%</p>
                  <p className="text-xs text-gray-400">Completion rate</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Gem className="w-7 h-7 text-[#FFCC08] mr-3" />
              Financial Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-green-950/30 to-black/30 rounded-xl border border-green-900/30 hover:border-green-500/50 transition-all group">
                <Wallet className="w-8 h-8 text-green-400 mb-3 group-hover:animate-bounce" />
                <p className="text-gray-400 text-sm mb-1">Current Balance</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(userStats.userInfo.walletBalance)}</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-[#FFCC08]/10 to-black/30 rounded-xl border border-[#FFCC08]/30 hover:border-[#FFCC08]/50 transition-all group">
                <CreditCard className="w-8 h-8 text-[#FFCC08] mb-3 group-hover:animate-bounce" />
                <p className="text-gray-400 text-sm mb-1">Total Deposits</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(userStats.depositStats.totalAmount)}</p>
                <p className="text-xs text-gray-500 mt-1">{userStats.depositStats.numberOfDeposits} transactions</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-orange-950/30 to-black/30 rounded-xl border border-orange-900/30 hover:border-orange-500/50 transition-all group">
                <TrendingUp className="w-8 h-8 text-orange-400 mb-3 group-hover:animate-bounce" />
                <p className="text-gray-400 text-sm mb-1">Avg Deposit</p>
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
              progress={userStats.userInfo.accountAge > 90 ? 100 : (userStats.userInfo.accountAge / 90) * 100}
            />
            <AchievementBadge
              icon={Crown}
              title="High Performer"
              description="Maintained 80%+ success rate"
              unlocked={userStats.orderStats.successRate >= 80}
              progress={userStats.orderStats.successRate}
            />
            <AchievementBadge
              icon={Zap}
              title="Power User"
              description="Completed 50+ orders"
              unlocked={userStats.orderStats.totalOrders >= 50}
              progress={userStats.orderStats.totalOrders >= 50 ? 100 : (userStats.orderStats.totalOrders / 50) * 100}
            />
            <AchievementBadge
              icon={Shield}
              title="Trusted Member"
              description="Verified account with consistent activity"
              unlocked={userStats.orderStats.successfulOrders >= 20}
              progress={userStats.orderStats.successfulOrders >= 20 ? 100 : (userStats.orderStats.successfulOrders / 20) * 100}
            />
            <AchievementBadge
              icon={Flame}
              title="On Fire"
              description="Active for 30+ consecutive days"
              unlocked={userStats.userInfo.accountAge >= 30}
              progress={userStats.userInfo.accountAge >= 30 ? 100 : (userStats.userInfo.accountAge / 30) * 100}
            />
            <AchievementBadge
              icon={Rocket}
              title="Rocket Speed"
              description="Averaging 2+ orders per day"
              unlocked={derivedStats && parseFloat(derivedStats.dailyAverage) >= 2}
              progress={derivedStats ? Math.min((parseFloat(derivedStats.dailyAverage) / 2) * 100, 100) : 0}
            />
          </div>
        )}

        {/* Admin Ranking Section */}
        {isAdmin && userStats.ranking && (
          <div className="mt-6 bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-[#FFCC08]/30">
            <div className="flex items-center mb-6">
              <Award className="w-8 h-8 text-[#FFCC08] mr-3 animate-pulse" />
              <div>
                <h3 className="text-2xl font-bold text-white">Leaderboard Ranking</h3>
                <p className="text-gray-400 text-sm">Administrator access only</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-[#FFCC08]/20 to-black/30 rounded-xl border border-[#FFCC08]/30">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFCC08] to-[#FFD700] mb-2">
                  #{userStats.ranking.position}
                </div>
                <p className="text-gray-400">Global Position</p>
                <p className="text-sm text-gray-500 mt-1">Out of {formatNumber(userStats.ranking.outOf)} users</p>
              </div>
              
              <div className="col-span-2 space-y-4">
                <div className="p-4 bg-black/50 rounded-xl border border-gray-700">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Percentile Ranking</span>
                    <span className="text-white font-bold">Top {userStats.ranking.percentile}%</span>
                  </div>
                  <ProgressBar value={100 - userStats.ranking.percentile} />
                </div>
                
                <div className="p-4 bg-gradient-to-r from-[#FFCC08]/10 to-black/20 rounded-xl border border-[#FFCC08]/20">
                  <p className="text-gray-400 text-sm leading-relaxed">
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
      
      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08]"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-[#FFCC08] to-[#FFD700] hover:from-[#FFD700] hover:to-[#FFCC08] text-black font-bold rounded-xl text-center transition-all transform hover:scale-105"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;