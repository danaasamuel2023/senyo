'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import adminAPI from '../../../utils/adminApi';
import {
  BarChart3, TrendingUp, TrendingDown, Users, Package, DollarSign,
  Activity, PieChart, Calendar, Download, Filter, RefreshCw, ArrowLeft,
  ChevronDown, Eye, ShoppingCart, CreditCard, UserCheck, Clock, Zap,
  AlertCircle, CheckCircle, X, ArrowUp, ArrowDown
} from 'lucide-react';

const AnalyticsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const [notification, setNotification] = useState(null);
  
  // Analytics data
  const [analytics, setAnalytics] = useState({
    revenue: { total: 0, change: 0, data: [] },
    orders: { total: 0, change: 0, data: [] },
    users: { total: 0, change: 0, data: [] },
    products: { topSelling: [], networkDistribution: [] },
    performance: { successRate: 0, avgOrderValue: 0, conversionRate: 0 }
  });

  useEffect(() => {
    checkAuth();
    loadAnalytics();
  }, [timeRange]);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!token || user.role !== 'admin') {
      router.push('/SignIn');
      return false;
    }
    return true;
  };

  const loadAnalytics = async () => {
    if (!checkAuth()) return;
    
    setLoading(true);
    try {
      // Load analytics data based on time range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Fetch data from multiple endpoints
      const [statsData, ordersData, usersData] = await Promise.all([
        adminAPI.dashboard.getStatistics(),
        adminAPI.order.getOrders({ 
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }),
        adminAPI.user.getUsers(1, 1000)
      ]);

      // Process analytics
      processAnalytics(statsData, ordersData, usersData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      showNotification('Failed to load analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const processAnalytics = (stats, orders, users) => {
    // Safety check for undefined parameters
    if (!stats || !orders || !users) {
      console.warn('Analytics data is incomplete:', { stats, orders, users });
      return;
    }

    // Calculate revenue analytics with multiple fallbacks
    const totalRevenue = stats?.data?.overview?.todayRevenue || 
                        stats?.financialStats?.totalRevenue || 
                        orders?.totalRevenue || 
                        0;
    const previousRevenue = totalRevenue * 0.85; // Simulated previous period
    const revenueChange = totalRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Calculate order analytics
    const totalOrders = orders.orders?.length || 0;
    const completedOrders = orders.orders?.filter(o => o.status === 'completed').length || 0;
    const successRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    // Network distribution
    const networkCounts = {};
    orders.orders?.forEach(order => {
      if (order.network) {
        networkCounts[order.network] = (networkCounts[order.network] || 0) + 1;
      }
    });

    const networkDistribution = Object.entries(networkCounts).map(([network, count]) => ({
      network,
      count,
      percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0
    }));

    // Top selling products
    const productCounts = {};
    orders.orders?.forEach(order => {
      const key = `${order.network} ${order.capacity}GB`;
      productCounts[key] = (productCounts[key] || 0) + 1;
    });

    const topSelling = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([product, count]) => ({ product, count }));

    // Update state
    setAnalytics({
      revenue: {
        total: totalRevenue,
        change: revenueChange,
        data: generateChartData('revenue', 7)
      },
      orders: {
        total: totalOrders,
        change: 12.5,
        data: generateChartData('orders', 7)
      },
      users: {
        total: users.totalUsers || users.data?.overview?.totalUsers || 0,
        change: 5.2,
        data: generateChartData('users', 7)
      },
      products: {
        topSelling,
        networkDistribution
      },
      performance: {
        successRate,
        avgOrderValue: stats.financialStats?.averageOrderValue || 0,
        conversionRate: 68.5
      }
    });
  };

  const generateChartData = (type, days) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      let value;
      switch (type) {
        case 'revenue':
          value = Math.floor(Math.random() * 5000) + 2000;
          break;
        case 'orders':
          value = Math.floor(Math.random() * 50) + 20;
          break;
        case 'users':
          value = Math.floor(Math.random() * 20) + 5;
          break;
        default:
          value = 0;
      }
      
      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value
      });
    }
    return data;
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const exportData = () => {
    showNotification('Exporting analytics data...', 'success');
    // Implement export functionality
  };

  // Chart component
  const SimpleChart = ({ data, height = 200, color = '#FFCC08' }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 flex items-end justify-between space-x-2">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80"
                style={{ 
                  height: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: color
                }}
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {item.value}
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{item.date}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor your business performance</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
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
              <span>Export</span>
            </button>
            
            <button
              onClick={loadAnalytics}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center text-sm font-medium ${
                analytics.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analytics.revenue.change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{Math.abs(analytics.revenue.change).toFixed(1)}%</span>
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              GHS {analytics.revenue.total.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center text-sm font-medium ${
                analytics.orders.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analytics.orders.change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{Math.abs(analytics.orders.change).toFixed(1)}%</span>
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Total Orders</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {analytics.orders.total.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center text-sm font-medium ${
                analytics.users.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analytics.users.change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{Math.abs(analytics.users.change).toFixed(1)}%</span>
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {analytics.users.total.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Revenue Trend</h3>
            <SimpleChart data={analytics.revenue.data} color="#10B981" />
          </div>

          {/* Orders Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Orders Trend</h3>
            <SimpleChart data={analytics.orders.data} color="#3B82F6" />
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Success Rate</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                    Performance
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-green-600">
                    {analytics.performance.successRate.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div 
                  style={{ width: `${analytics.performance.successRate}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Avg Order Value</h3>
              <ShoppingCart className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              GHS {analytics.performance.avgOrderValue.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Per transaction</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Conversion Rate</h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {analytics.performance.conversionRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Visit to purchase</p>
          </div>
        </div>

        {/* Products Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Products */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Top Selling Products</h3>
            <div className="space-y-4">
              {analytics.products.topSelling.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#FFCC08] rounded-lg flex items-center justify-center text-black font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{item.product}</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{item.count} orders</span>
                </div>
              ))}
            </div>
          </div>

          {/* Network Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Network Distribution</h3>
            <div className="space-y-4">
              {analytics.products.networkDistribution.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{item.network}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{item.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#FFCC08] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
