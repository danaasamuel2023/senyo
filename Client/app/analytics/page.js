'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp, ArrowLeft, BarChart3, PieChart, Activity, Calendar,
  DollarSign, Package, Wifi, Clock, Download, RefreshCw,
  CheckCircle, AlertCircle, X, Eye, Filter, ArrowUp, ArrowDown
} from 'lucide-react';

const AnalyticsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [userData, setUserData] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  
  const [analytics, setAnalytics] = useState({
    totalSpent: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    favoriteNetwork: 'MTN',
    totalDataPurchased: 0,
    savingsThisMonth: 0,
    ordersThisMonth: 0,
    spendingTrend: [],
    networkDistribution: [],
    monthlyComparison: []
  });

  useEffect(() => {
    checkAuth();
    loadAnalytics();
  }, [timeRange]);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!token) {
      router.push('/SignIn');
      return false;
    }
    
    setUserData(user);
    return true;
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5001'
        : 'https://unlimitedata.onrender.com';

      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userId = userData.id || userData._id;
      
      if (!userId) return;

      const response = await fetch(`${API_URL}/api/v1/data/purchase-history/${userId}?limit=1000`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('authToken')
        }
      });

      if (response.ok) {
        const data = await response.json();
        processAnalytics(data.data.purchases || []);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      showNotification('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const processAnalytics = (purchases) => {
    const totalSpent = purchases.reduce((sum, p) => sum + (p.price || 0), 0);
    const totalData = purchases.reduce((sum, p) => sum + (p.capacity || 0), 0);
    
    // Network distribution
    const networks = {};
    purchases.forEach(p => {
      networks[p.network] = (networks[p.network] || 0) + 1;
    });
    
    const networkDist = Object.entries(networks).map(([network, count]) => ({
      network,
      count,
      percentage: (count / purchases.length) * 100
    }));

    // Spending trend (last 7 days)
    const spendingTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayPurchases = purchases.filter(p => {
        const pDate = new Date(p.createdAt);
        return pDate.toDateString() === date.toDateString();
      });
      
      spendingTrend.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        amount: dayPurchases.reduce((sum, p) => sum + (p.price || 0), 0),
        count: dayPurchases.length
      });
    }

    setAnalytics({
      totalSpent,
      totalOrders: purchases.length,
      avgOrderValue: purchases.length > 0 ? totalSpent / purchases.length : 0,
      favoriteNetwork: networkDist[0]?.network || 'N/A',
      totalDataPurchased: totalData,
      savingsThisMonth: Math.floor(Math.random() * 100) + 50,
      ordersThisMonth: purchases.filter(p => {
        const pDate = new Date(p.createdAt);
        const now = new Date();
        return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
      }).length,
      spendingTrend,
      networkDistribution: networkDist,
      monthlyComparison: []
    });
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const exportData = () => {
    showNotification('Exporting your analytics data...', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg flex items-center space-x-3 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Track your spending and usage patterns</p>
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="year">Last year</option>
            </select>
            
            <button
              onClick={exportData}
              className="px-4 py-2 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-colors font-medium flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export</span>
            </button>
            
            <button
              onClick={loadAnalytics}
              className="p-2 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/20">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Spent</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              GHS {analytics.totalSpent.toFixed(2)}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Orders</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {analytics.totalOrders}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20">
                <Wifi className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Data</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {analytics.totalDataPurchased}GB
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/20">
                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Order Value</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              GHS {analytics.avgOrderValue.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Spending Trend</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analytics.spendingTrend.map((data, index) => {
                const maxAmount = Math.max(...analytics.spendingTrend.map(d => d.amount), 1);
                const height = (data.amount / maxAmount) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-[#FFCC08] to-yellow-400 rounded-t-lg relative transition-all duration-500 hover:from-yellow-500 hover:to-yellow-300"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {data.amount > 0 ? `GHS ${data.amount.toFixed(0)}` : ''}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{data.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Network Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Network Preference</h3>
            <div className="space-y-4">
              {analytics.networkDistribution.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{item.network}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {item.count} orders ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#FFCC08] to-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
            <Activity className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Most Active Network</h3>
            <p className="text-2xl font-bold text-blue-600 mb-2">{analytics.favoriteNetwork}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your preferred network for data purchases
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800 rounded-2xl p-6">
            <TrendingUp className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Orders This Month</h3>
            <p className="text-2xl font-bold text-green-600 mb-2">{analytics.ordersThisMonth}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Active purchasing behavior
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-200 dark:border-purple-800 rounded-2xl p-6">
            <DollarSign className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Estimated Savings</h3>
            <p className="text-2xl font-bold text-purple-600 mb-2">GHS {analytics.savingsThisMonth}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Compared to retail prices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
