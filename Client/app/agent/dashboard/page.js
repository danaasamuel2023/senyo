'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, DollarSign, Package, TrendingUp, Users, Settings,
  Eye, RefreshCw, Calendar, Clock, Award, Zap, ArrowRight,
  CheckCircle, AlertCircle, X, Loader2, ExternalLink, Copy
} from 'lucide-react';

const AgentDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    today: { orders: 0, revenue: 0, earnings: 0 },
    month: { orders: 0, revenue: 0, earnings: 0 },
    commissionRate: 5,
    totalWithdrawn: 0,
    agentStatus: 'pending',
    agentLevel: 'Agent'
  });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!token || user.role !== 'agent') {
      router.push('/SignIn');
      return false;
    }
    
    setUserData(user);
    return true;
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5001'
        : 'https://unlimitedata.onrender.com';

      const response = await fetch(`${API_URL}/api/agent/dashboard`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('authToken')
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        showNotification('Failed to load dashboard data', 'error');
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      showNotification('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const getStoreUrl = () => {
    const identifier = userData?.agentMetadata?.customSlug || userData?.agentMetadata?.agentCode;
    return identifier ? `/agent-store/${identifier}` : '';
  };

  const copyStoreUrl = () => {
    const url = `${window.location.origin}${getStoreUrl()}`;
    navigator.clipboard.writeText(url);
    showNotification('Store URL copied!', 'success');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-green-600/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-600 border-r-green-500 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-green-600 to-green-800 animate-pulse flex items-center justify-center">
              <Award className="w-6 h-6 text-white animate-bounce" strokeWidth={2.5} />
        </div>
      </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-green-600 animate-pulse">
              Agent Dashboard
            </h1>
            <div className="flex items-center justify-center space-x-2 text-green-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Loading your agent dashboard...</span>
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
          <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-[2px] shadow-2xl">
            <div className="bg-gray-950 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/30 via-transparent to-black/50"></div>
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-green-600/10 blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-2xl">
                        <Award className="w-7 h-7 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Agent Dashboard</h1>
                        <p className="text-green-400 text-sm font-medium">
                          {userData?.name} • {stats.agentLevel} • {stats.agentStatus}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Manage your store, track earnings, and grow your business
                      </p>
                      {getStoreUrl() && (
                        <div className="flex items-center space-x-2 bg-black/40 rounded-lg px-3 py-2">
                          <span className="text-green-400 text-sm font-medium">Store URL:</span>
                          <code className="text-white text-sm font-mono">
                            {typeof window !== 'undefined' ? `${window.location.origin}${getStoreUrl()}` : ''}
                          </code>
                          <button
                            onClick={copyStoreUrl}
                            className="p-1 hover:bg-green-600/20 rounded transition-colors"
                          >
                            <Copy className="w-4 h-4 text-green-400" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => window.open(getStoreUrl(), '_blank')}
                      className="group bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-6 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                    >
                      <Eye className="w-5 h-5" />
                      <span>View Store</span>
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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

        {/* Stats Grid */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Today's Earnings */}
            <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-[2px] shadow-2xl">
              <div className="bg-gray-950 rounded-2xl p-6 h-full">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-lg">
                      <DollarSign className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        GHS {stats.today.earnings.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-gray-100 font-medium text-sm">Today's Earnings</p>
                    <p className="text-gray-500 text-xs">Commission: {stats.commissionRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Orders */}
            <div className="bg-gray-900 rounded-2xl p-5 shadow-xl border border-gray-800">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow">
                    <Package className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {stats.today.orders}
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-100 font-medium text-sm">Today's Orders</p>
                  <p className="text-gray-500 text-xs">Completed sales</p>
                </div>
              </div>
            </div>

            {/* Monthly Revenue */}
            <div className="bg-gray-900 rounded-2xl p-5 shadow-xl border border-gray-800">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow">
                    <TrendingUp className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">
                      GHS {stats.month.revenue.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-100 font-medium text-sm">Monthly Revenue</p>
                  <p className="text-gray-500 text-xs">Total sales value</p>
                </div>
              </div>
            </div>

            {/* Monthly Earnings */}
            <div className="bg-gray-900 rounded-2xl p-5 shadow-xl border border-gray-800">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow">
                    <BarChart3 className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">
                      GHS {stats.month.earnings.toFixed(2)}
                    </div>
                  </div>
                </div>
                
              <div>
                  <p className="text-gray-100 font-medium text-sm">Monthly Earnings</p>
                  <p className="text-gray-500 text-xs">Total commission</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-800">
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow">
                <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Quick Actions</h2>
                <p className="text-gray-500 text-xs">Manage your agent business</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/agent/customize-store')}
                className="group bg-gray-800 hover:bg-gray-700 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 shadow-xl border border-gray-700 hover:border-green-600/50 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow group-hover:shadow-lg transition-shadow">
                    <Settings className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <p className="text-gray-300 group-hover:text-white font-medium text-xs transition-colors">Customize Store</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/agent/earnings')}
                className="group bg-gray-800 hover:bg-gray-700 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 shadow-xl border border-gray-700 hover:border-green-600/50 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow group-hover:shadow-lg transition-shadow">
                    <DollarSign className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <p className="text-gray-300 group-hover:text-white font-medium text-xs transition-colors">View Earnings</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/agent/withdraw')}
                className="group bg-gray-800 hover:bg-gray-700 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 shadow-xl border border-gray-700 hover:border-green-600/50 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow group-hover:shadow-lg transition-shadow">
                    <TrendingUp className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <p className="text-gray-300 group-hover:text-white font-medium text-xs transition-colors">Withdraw Funds</p>
                </div>
              </button>
            
              <button
                onClick={() => window.open(getStoreUrl(), '_blank')}
                className="group bg-gray-800 hover:bg-gray-700 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 shadow-xl border border-gray-700 hover:border-green-600/50 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow group-hover:shadow-lg transition-shadow">
                    <ExternalLink className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <p className="text-gray-300 group-hover:text-white font-medium text-xs transition-colors">Visit Store</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        {stats.agentStatus === 'pending' && (
          <div className="mb-6">
            <div className="bg-yellow-900/30 backdrop-blur-xl border border-yellow-600/30 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-yellow-600/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-400" />
                  </div>
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-semibold text-yellow-300">Account Under Review</p>
                  <p className="text-sm text-yellow-200/80 mt-1">
                    Your agent application is being reviewed by our team. You'll receive an email once approved.
                  </p>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
    </div>
  );
};

export default AgentDashboard;