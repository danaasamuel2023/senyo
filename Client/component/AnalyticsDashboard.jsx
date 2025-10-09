'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, DollarSign, Users, ShoppingCart, 
  Package, Eye, Star, Calendar, Clock, Target, Award,
  PieChart, LineChart, Activity, Zap, Wifi, Shield,
  AlertCircle, CheckCircle, Loader2, Download, RefreshCw
} from 'lucide-react';
import { getApiEndpoint } from '../utils/apiConfig';

const AnalyticsDashboard = ({ agentId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [agentId, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const API_URL = getApiEndpoint('');

      const response = await fetch(`${API_URL}/api/agent/analytics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
        setChartData(data.chartData);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-GH').format(num);
  };

  const getPercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingUp className="w-4 h-4 rotate-180" />;
    return <Activity className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFCC08]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Store Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your store performance and customer insights
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <button
            onClick={loadAnalytics}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-r from-[#FFCC08] to-yellow-600 rounded-2xl p-[2px] shadow-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {formatCurrency(analytics?.totalRevenue || 0)}
                </p>
                <div className={`flex items-center space-x-1 mt-2 ${getChangeColor(getPercentageChange(analytics?.totalRevenue, analytics?.previousRevenue))}`}>
                  {getChangeIcon(getPercentageChange(analytics?.totalRevenue, analytics?.previousRevenue))}
                  <span className="text-sm font-medium">
                    {Math.abs(getPercentageChange(analytics?.totalRevenue, analytics?.previousRevenue)).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {formatNumber(analytics?.totalOrders || 0)}
              </p>
              <div className={`flex items-center space-x-1 mt-2 ${getChangeColor(getPercentageChange(analytics?.totalOrders, analytics?.previousOrders))}`}>
                {getChangeIcon(getPercentageChange(analytics?.totalOrders, analytics?.previousOrders))}
                <span className="text-sm font-medium">
                  {Math.abs(getPercentageChange(analytics?.totalOrders, analytics?.previousOrders)).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Avg Order Value</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(analytics?.averageOrderValue || 0)}
              </p>
              <div className={`flex items-center space-x-1 mt-2 ${getChangeColor(getPercentageChange(analytics?.averageOrderValue, analytics?.previousAOV))}`}>
                {getChangeIcon(getPercentageChange(analytics?.averageOrderValue, analytics?.previousAOV))}
                <span className="text-sm font-medium">
                  {Math.abs(getPercentageChange(analytics?.averageOrderValue, analytics?.previousAOV)).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Conversion Rate</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {(analytics?.conversionRate || 0).toFixed(1)}%
              </p>
              <div className={`flex items-center space-x-1 mt-2 ${getChangeColor(getPercentageChange(analytics?.conversionRate, analytics?.previousConversionRate))}`}>
                {getChangeIcon(getPercentageChange(analytics?.conversionRate, analytics?.previousConversionRate))}
                <span className="text-sm font-medium">
                  {Math.abs(getPercentageChange(analytics?.conversionRate, analytics?.previousConversionRate)).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#FFCC08]"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">Revenue chart will be implemented with Recharts</p>
            </div>
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Orders Trend</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Orders</span>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">Orders chart will be implemented with Recharts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products and Customer Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Selling Products</h3>
            <Award className="w-5 h-5 text-[#FFCC08]" />
          </div>
          <div className="space-y-4">
            {analytics?.topProducts?.slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFCC08] to-yellow-500 flex items-center justify-center text-black font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{product.network} {product.capacity}GB</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#FFCC08]">{formatCurrency(product.revenue)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{product.sales} sales</p>
                </div>
              </div>
            ))}
            {(!analytics?.topProducts || analytics.topProducts.length === 0) && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No sales data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Insights</h3>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Total Customers</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unique buyers</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(analytics?.customerCount || 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Repeat Customers</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Customer retention</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(analytics?.repeatCustomers || 0)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {analytics?.customerRetentionRate?.toFixed(1)}% retention
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Store Views</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Page visits</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(analytics?.storeViews || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFCC08] to-yellow-500 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 text-black" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Avg Processing Time</h4>
            <p className="text-2xl font-bold text-[#FFCC08] mb-1">
              {analytics?.avgProcessingTime || 0}m
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Order fulfillment</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Success Rate</h4>
            <p className="text-2xl font-bold text-green-600 mb-1">
              {(analytics?.successRate || 0).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Successful orders</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Customer Satisfaction</h4>
            <p className="text-2xl font-bold text-blue-600 mb-1">
              {(analytics?.customerSatisfaction || 0).toFixed(1)}/5
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Average rating</p>
          </div>
        </div>
      </div>

      {/* Export Data */}
      <div className="flex justify-end">
        <button className="flex items-center space-x-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
          <Download className="w-4 h-4" />
          <span>Export Analytics Data</span>
        </button>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
