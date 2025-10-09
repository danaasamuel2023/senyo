'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home, Package, DollarSign, Wallet, Settings, Plus,
  Copy, Share2, Eye, BarChart3, TrendingUp, TrendingDown,
  Users, Calendar, RefreshCw, Moon, Menu, ChevronRight,
  Store, ShoppingCart, LineChart, UserCheck, Clock,
  ArrowUpRight, ArrowDownRight, MoreHorizontal, Filter
} from 'lucide-react';
import { getApiEndpoint } from '../../../utils/apiConfig';
import StoreSetupWizard from '@/component/StoreSetupWizard';

const AgentDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [agentData, setAgentData] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    orders: 0,
    netProfit: 0,
    avgOrder: 0,
    walletBalance: {
      available: 0,
      pending: 0,
      totalEarnings: 0
    },
    recentCustomers: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showStoreSetup, setShowStoreSetup] = useState(false);

  useEffect(() => {
    loadAgentData();
    loadDashboardData();
  }, [selectedPeriod]);

  const loadAgentData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/SignIn');
        return;
      }

      const API_URL = getApiEndpoint('');
      const response = await fetch(`${API_URL}/api/agent/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAgentData(data.agent);
      }
    } catch (error) {
      console.error('Failed to load agent data:', error);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const API_URL = getApiEndpoint('');
      
      const response = await fetch(`${API_URL}/api/agent/analytics?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.analytics);
      } else {
        console.error('Failed to load dashboard data:', response.statusText);
        setDashboardData({
          totalSales: 0,
          orders: 0,
          netProfit: 0,
          avgOrder: 0,
          walletBalance: {
            available: 0,
            pending: 0,
            totalEarnings: 0
          },
          recentCustomers: []
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setDashboardData({
        totalSales: 0,
        orders: 0,
        netProfit: 0,
        avgOrder: 0,
        walletBalance: {
          available: 0,
          pending: 0,
          totalEarnings: 0
        },
        recentCustomers: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyStoreLink = () => {
    const storeLink = `${window.location.origin}/agent-store/${agentData?.agentCode}`;
    navigator.clipboard.writeText(storeLink);
    // Show success notification
  };

  const handleShareWhatsApp = () => {
    const storeLink = `${window.location.origin}/agent-store/${agentData?.agentCode}`;
    const message = `Check out my data bundles store: ${storeLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleViewPublicStore = () => {
    window.open(`/agent-store/${agentData?.agentCode}`, '_blank');
  };

  const handleManageProducts = () => {
    router.push('/agent/manage-store');
  };

  const handleRequestWithdrawal = () => {
    router.push('/agent/withdraw');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const getPeriodLabel = (period) => {
    const labels = {
      today: 'Today',
      week: 'This Week',
      month: 'This Month',
      all: 'All Time'
    };
    return labels[period] || period;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gray-800 transition-all duration-300 flex flex-col`}>
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-black" />
            </div>
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-yellow-400">UnlimitedData GH</h1>
            )}
          </div>
        </div>

        {/* Agent Store Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            {!sidebarCollapsed && (
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Agent Store</h2>
            )}
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4">
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-yellow-600 text-black"
              >
                <Home className="w-5 h-5" />
                {!sidebarCollapsed && <span>Dashboard</span>}
              </a>
            </li>
            <li>
              <a
                href="/agent/manage-store"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <Package className="w-5 h-5" />
                {!sidebarCollapsed && <span>Products</span>}
              </a>
            </li>
            <li>
              <a
                href="/agent/transactions"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <DollarSign className="w-5 h-5" />
                {!sidebarCollapsed && <span>Transactions</span>}
              </a>
            </li>
            <li>
              <a
                href="/agent/withdraw"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <Wallet className="w-5 h-5" />
                {!sidebarCollapsed && <span>Withdrawals</span>}
              </a>
            </li>
            <li>
              <a
                href="/agent/settings"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-5 h-5" />
                {!sidebarCollapsed && <span>Settings</span>}
              </a>
            </li>
          </ul>
        </nav>

        {/* Create Store Button */}
        <div className="p-4">
          <button 
            onClick={() => setShowStoreSetup(true)}
            className="w-full flex items-center justify-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-black px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            {!sidebarCollapsed && <span>Create Store</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
                <Moon className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
                <Menu className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {agentData?.name || 'Agent'}
                </h1>
                <p className="text-gray-400 mt-1">
                  Welcome back! Here's how your store is performing.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
                  <RefreshCw className="w-5 h-5 text-gray-400" />
                </button>
                <span className="px-3 py-1 bg-yellow-600 text-black text-sm rounded-full">Open</span>
                <span className="px-3 py-1 bg-black text-yellow-400 text-sm rounded-full">Active</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={handleCopyStoreLink}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Store Link</span>
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share on WhatsApp</span>
              </button>
              <button
                onClick={handleViewPublicStore}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>View Public Store</span>
              </button>
              <button
                onClick={handleManageProducts}
                className="flex items-center space-x-2 px-4 py-2 bg-black hover:bg-gray-800 text-yellow-400 rounded-lg transition-colors"
              >
                <Package className="w-4 h-4" />
                <span>Manage Products</span>
              </button>
            </div>

            {/* Date Range Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['today', 'week', 'month', 'all'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-yellow-600 text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {getPeriodLabel(period)}
                </button>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-600 rounded-lg">
                  <DollarSign className="w-5 h-5 text-black" />
                </div>
                <div className="flex items-center text-red-500">
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                  <span className="text-sm">0%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {formatCurrency(dashboardData.totalSales)}
              </h3>
              <p className="text-gray-400 text-sm">Total Sales</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-black rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="flex items-center text-red-500">
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                  <span className="text-sm">0</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {dashboardData.orders}
              </h3>
              <p className="text-gray-400 text-sm">Orders</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-600 rounded-lg">
                  <LineChart className="w-5 h-5 text-black" />
                </div>
                <div className="flex items-center text-red-500">
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                  <span className="text-sm">0%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {formatCurrency(dashboardData.netProfit)}
              </h3>
              <p className="text-gray-400 text-sm">Net Profit</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-black rounded-lg">
                  <Users className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="flex items-center text-red-500">
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                  <span className="text-sm">N/A</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {formatCurrency(dashboardData.avgOrder)}
              </h3>
              <p className="text-gray-400 text-sm">Avg Order</p>
            </div>
          </div>

          {/* Wallet Balance Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Wallet Balance</h2>
              <button
                onClick={handleRequestWithdrawal}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg transition-colors"
              >
                <Wallet className="w-4 h-4" />
                <span>Request Withdrawal</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-yellow-400 font-medium">Available</h3>
                  <Wallet className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-yellow-400">
                  ₵{dashboardData.walletBalance.available.toFixed(2)}
                </p>
              </div>

              <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 font-medium">Pending</h3>
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-300">
                  ₵{dashboardData.walletBalance.pending.toFixed(2)}
                </p>
              </div>

              <div className="bg-black border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-yellow-400 font-medium">Total Earnings</h3>
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-yellow-400">
                  ₵{dashboardData.walletBalance.totalEarnings.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Customers */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Recent Customers</h2>
            </div>
            <div className="p-6">
              {dashboardData.recentCustomers.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                          <span className="text-black font-semibold">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{customer.name}</h3>
                          <p className="text-gray-400 text-sm">{customer.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{formatCurrency(customer.totalSpent)}</p>
                        <p className="text-gray-400 text-sm">{customer.lastOrder}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No customers yet</p>
                  <p className="text-gray-500 text-sm">Start promoting your store to get customers</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Store Setup Wizard */}
      <StoreSetupWizard
        isOpen={showStoreSetup}
        onClose={() => setShowStoreSetup(false)}
        onComplete={(storeData) => {
          // Handle store creation
          console.log('Store created:', storeData);
          setShowStoreSetup(false);
          // You can add API call here to save store data
        }}
        agentData={agentData}
      />
    </div>
  );
};

export default AgentDashboard;