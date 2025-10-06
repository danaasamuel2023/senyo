'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home, Package, DollarSign, Wallet, Settings, Plus,
  RefreshCw, ChevronRight, Store, CheckCircle, Clock,
  XCircle, AlertCircle, TrendingUp, Info, Eye,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { getApiEndpoint } from '@/utils/apiConfig';

const AgentWithdrawals = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);
  const [walletData, setWalletData] = useState({
    available: 0.80,
    pending: 12.70,
    totalWithdrawn: 50.00,
    minWithdrawal: 10.00
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

  useEffect(() => {
    loadWithdrawals();
  }, [selectedStatus]);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const API_URL = getApiEndpoint('');
      
      const response = await fetch(`${API_URL}/api/agent/withdrawals?status=${selectedStatus}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWithdrawals(data.withdrawals || []);
      } else {
        console.error('Failed to load withdrawals:', response.statusText);
        setWithdrawals([]);
      }
    } catch (error) {
      console.error('Failed to load withdrawals:', error);
    } finally {
      setLoading(false);
    }
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

  const getStatusBadge = (status, processingTime = null) => {
    switch (status) {
      case 'completed':
        return (
          <div>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
              <CheckCircle className="w-3 h-3 mr-1" />
              completed
            </span>
          </div>
        );
      case 'processing':
        return (
          <div>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-300">
              <RefreshCw className="w-3 h-3 mr-1" />
              processing
            </span>
            {processingTime && (
              <div className="text-xs text-gray-400 mt-1">{processingTime}</div>
            )}
          </div>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-900 text-orange-300">
            <Clock className="w-3 h-3 mr-1" />
            pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-900 text-gray-300">
            <XCircle className="w-3 h-3 mr-1" />
            cancelled
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

  const getActionButtons = (withdrawal) => {
    if (withdrawal.status === 'processing' || withdrawal.status === 'pending') {
      return (
        <div className="flex space-x-2">
          <button className="text-blue-400 hover:text-blue-300 text-sm">
            Verify
          </button>
          <button className="text-red-400 hover:text-red-300 text-sm">
            Cancel
          </button>
        </div>
      );
    }
    return null;
  };

  const filteredWithdrawals = selectedStatus === 'all' 
    ? withdrawals 
    : withdrawals.filter(w => w.status === selectedStatus);

  const statusCounts = {
    all: withdrawals.length,
    completed: withdrawals.filter(w => w.status === 'completed').length,
    pending: withdrawals.filter(w => w.status === 'pending').length,
    processing: withdrawals.filter(w => w.status === 'processing').length,
    failed: withdrawals.filter(w => w.status === 'failed').length,
    cancelled: withdrawals.filter(w => w.status === 'cancelled').length
  };

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
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <DollarSign className="w-5 h-5" />
                {!sidebarCollapsed && <span>Transactions</span>}
              </a>
            </li>
            <li>
              <a
                href="/agent/withdrawals"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-yellow-600 text-black"
              >
                <Wallet className="w-5 h-5" />
                {!sidebarCollapsed && <span>Withdrawals</span>}
                {!sidebarCollapsed && <ChevronRight className="w-4 h-4 ml-auto" />}
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
              <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Withdrawals</h1>
            <p className="text-gray-400">Manage your earnings and withdrawal requests</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-yellow-400 font-medium">Available Balance</h3>
                  <Wallet className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-yellow-400">
                  {formatCurrency(walletData.available)}
                </p>
                <p className="text-yellow-300 text-sm mt-1">Ready to withdraw</p>
              </div>

            <div className="bg-orange-900 border border-orange-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-orange-400 font-medium">Pending</h3>
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-2xl font-bold text-orange-400">
                {formatCurrency(walletData.pending)}
              </p>
              <p className="text-orange-300 text-sm mt-1">Being processed</p>
            </div>

              <div className="bg-black border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-yellow-400 font-medium">Total Withdrawn</h3>
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-yellow-400">
                  {formatCurrency(walletData.totalWithdrawn)}
                </p>
                <p className="text-yellow-300 text-sm mt-1">All time</p>
              </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 font-medium">Min. Withdrawal</h3>
                <Info className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(walletData.minWithdrawal)}
              </p>
              <p className="text-gray-300 text-sm mt-1">Required minimum</p>
            </div>
          </div>

          {/* Request Withdrawal Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowWithdrawalModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Request Withdrawal</span>
            </button>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-yellow-600 text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {count > 0 && status !== 'all' && (
                  <span className="ml-1">({count})</span>
                )}
              </button>
            ))}
          </div>

          {/* Withdrawals Table */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Net Amount
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
                  ) : filteredWithdrawals.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="text-center">
                          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-white mb-2">No Withdrawals Found</h3>
                          <p className="text-gray-400">
                            {selectedStatus === 'all' 
                              ? "You haven't made any withdrawal requests yet." 
                              : `No ${selectedStatus} withdrawals found.`}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredWithdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {formatDate(withdrawal.date)}
                          </div>
                          <div className="text-sm text-gray-400">
                            {formatTime(withdrawal.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {withdrawal.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                            <span className="text-sm text-white">{withdrawal.method}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {formatCurrency(withdrawal.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400">
                            {formatCurrency(withdrawal.fee)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-400">
                            {formatCurrency(withdrawal.netAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(withdrawal.status, withdrawal.processingTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getActionButtons(withdrawal)}
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

      {/* Withdrawal Request Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Request Withdrawal</h3>
              <button
                onClick={() => setShowWithdrawalModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">
                Available Balance: <span className="text-green-400 font-medium">{formatCurrency(walletData.available)}</span>
              </p>
              <p className="text-gray-400 text-sm mb-4">
                Minimum Withdrawal: <span className="text-white font-medium">{formatCurrency(walletData.minWithdrawal)}</span>
              </p>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (₵)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={walletData.minWithdrawal}
                  max={walletData.available}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Withdrawal Method
                </label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account Details
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter phone number or account number"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowWithdrawalModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg transition-colors"
                >
                  Request Withdrawal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentWithdrawals;
