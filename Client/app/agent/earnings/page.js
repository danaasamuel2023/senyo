'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, DollarSign, Calendar, Filter, Download, RefreshCw,
  CheckCircle, AlertCircle, X, Loader2, TrendingUp, Package,
  Clock, Eye, BarChart3
} from 'lucide-react';

const AgentEarnings = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    totalOrders: 0,
    totalValue: 0,
    commissionRate: 5,
    orders: []
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    checkAuth();
    loadEarnings();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!token || user.role !== 'agent') {
      router.push('/SignIn');
      return false;
    }
    
    return true;
  };

  const loadEarnings = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5001'
        : 'https://unlimitedata.onrender.com';

      const queryParams = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      const response = await fetch(`${API_URL}/api/agent/earnings?${queryParams}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('authToken')
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEarnings(data.earnings);
      } else {
        showNotification('Failed to load earnings data', 'error');
      }
    } catch (error) {
      console.error('Failed to load earnings:', error);
      showNotification('Failed to load earnings data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEarnings();
    setRefreshing(false);
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyDateFilter = () => {
    loadEarnings();
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-green-600/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-600 border-r-green-500 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-green-600 to-green-800 animate-pulse flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white animate-bounce" strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-green-600 animate-pulse">
              Loading Earnings
            </h1>
            <div className="flex items-center justify-center space-x-2 text-green-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Fetching your earnings data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-green-600/10 to-green-800/10 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-green-800/10 to-black blur-3xl animate-pulse delay-1000"></div>
      </div>

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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/agent/dashboard')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">Earnings Report</h1>
                <p className="text-gray-400 mt-1">Track your commission earnings and sales performance</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors font-medium flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Earnings */}
            <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-[2px] shadow-2xl">
              <div className="bg-gray-950 rounded-2xl p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-lg">
                      <DollarSign className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">
                        {formatCurrency(earnings.totalEarnings)}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-gray-100 font-medium text-sm">Total Earnings</p>
                    <p className="text-gray-500 text-xs">Commission: {earnings.commissionRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-lg">
                    <Package className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">
                      {earnings.totalOrders}
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-100 font-medium text-sm">Total Orders</p>
                  <p className="text-gray-500 text-xs">Completed sales</p>
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">
                      {formatCurrency(earnings.totalValue)}
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-100 font-medium text-sm">Total Revenue</p>
                  <p className="text-gray-500 text-xs">Sales value</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="mb-6">
          <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-800">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow">
                <Filter className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Filter by Date Range</h2>
                <p className="text-gray-500 text-xs">Select a custom date range to view earnings</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              
              <div className="pt-6">
                <button
                  onClick={applyDateFilter}
                  className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-colors font-medium flex items-center space-x-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>Apply Filter</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="mb-6">
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow">
                    <BarChart3 className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Order History</h2>
                    <p className="text-gray-500 text-xs">Detailed breakdown of your sales</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {earnings.orders.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Network</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Commission</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-900 divide-y divide-gray-800">
                    {earnings.orders.map((order, index) => (
                      <tr key={order.id} className="hover:bg-gray-850 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{order.customer}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {order.network}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{order.capacity}GB</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{formatCurrency(order.price)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-green-400">{formatCurrency(order.commission)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400">{formatDate(order.createdAt)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-xl bg-gray-800 flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-300 text-sm font-medium">No orders found</p>
                  <p className="text-gray-500 text-xs mt-1">Try adjusting your date range</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentEarnings;
