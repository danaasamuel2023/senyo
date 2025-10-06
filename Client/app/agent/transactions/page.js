'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home, Package, DollarSign, Wallet, Settings, Plus,
  RefreshCw, Download, Filter, Eye, ChevronRight,
  Store, CheckCircle, Clock, XCircle, AlertCircle,
  TrendingUp, BarChart3, Users, Calendar
} from 'lucide-react';
import { getApiEndpoint } from '@/utils/apiConfig';

const AgentTransactions = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    totalOrders: 0,
    avgOrderValue: 0
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    loadTransactions();
  }, [selectedStatus]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const API_URL = getApiEndpoint('');
      
      const response = await fetch(`${API_URL}/api/agent/orders?status=${selectedStatus}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.orders || []);
        calculateSummary(data.orders || []);
      } else {
        console.error('Failed to load transactions:', response.statusText);
        setTransactions([]);
        calculateSummary([]);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (transactions) => {
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalProfit = transactions.reduce((sum, t) => sum + t.profit, 0);
    const totalOrders = transactions.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    setSummary({
      totalRevenue,
      totalProfit,
      totalOrders,
      avgOrderValue
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-900 text-orange-300">
            <Clock className="w-3 h-3 mr-1" />
            pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900 text-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-900 text-gray-300">
            <AlertCircle className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
    }
  };

  const filteredTransactions = selectedStatus === 'all' 
    ? transactions 
    : transactions.filter(t => t.status === selectedStatus);

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
                href="/agent/dashboard"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <Home className="w-5 h-5" />
                {!sidebarCollapsed && <span>Dashboard</span>}
              </a>
            </li>
            <li>
              <a
                href="/agent/products"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <Package className="w-5 h-5" />
                {!sidebarCollapsed && <span>Products</span>}
              </a>
            </li>
            <li>
              <a
                href="/agent/transactions"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-yellow-600 text-black"
              >
                <DollarSign className="w-5 h-5" />
                {!sidebarCollapsed && <span>Transactions</span>}
                {!sidebarCollapsed && <ChevronRight className="w-4 h-4 ml-auto" />}
              </a>
            </li>
            <li>
              <a
                href="/agent/withdrawals"
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
          <button className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
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
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
                <RefreshCw className="w-5 h-5 text-gray-400" />
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
              <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Transactions</h1>
            <p className="text-gray-400">View and manage your store transactions</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-600 rounded-lg">
                  <DollarSign className="w-5 h-5 text-black" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {formatCurrency(summary.totalRevenue)}
              </h3>
              <p className="text-gray-400 text-sm">Total Revenue</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-600 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {formatCurrency(summary.totalProfit)}
              </h3>
              <p className="text-gray-400 text-sm">Total Profit</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-black rounded-lg">
                  <Package className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {summary.totalOrders}
              </h3>
              <p className="text-gray-400 text-sm">Total Orders</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-600 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {formatCurrency(summary.avgOrderValue)}
              </h3>
              <p className="text-gray-400 text-sm">Avg Order Value</p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">Filters</span>
              </div>
              <div className="flex space-x-2">
                {['all', 'completed', 'pending', 'failed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-yellow-600 text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Profit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="text-center">
                          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-white mb-2">No Transactions Found</h3>
                          <p className="text-gray-400">
                            {selectedStatus === 'all' 
                              ? "You haven't made any transactions yet." 
                              : `No ${selectedStatus} transactions found.`}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {transaction.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {formatDate(transaction.date)}
                          </div>
                          <div className="text-sm text-gray-400">
                            {formatTime(transaction.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {transaction.customer.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {transaction.customer.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {transaction.product.network}
                          </div>
                          <div className="text-sm text-gray-400">
                            {transaction.product.capacity}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {formatCurrency(transaction.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-400">
                            {formatCurrency(transaction.profit)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-blue-400 hover:text-blue-300">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AgentTransactions;
