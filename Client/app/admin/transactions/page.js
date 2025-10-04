'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import adminAPI from '../../../utils/adminApi';
import {
  CreditCard, Search, Filter, Download, RefreshCw, ArrowLeft,
  CheckCircle, XCircle, Clock, AlertCircle, DollarSign,
  Calendar, ChevronDown, Eye, ExternalLink, Copy, X,
  TrendingUp, TrendingDown, Wallet, ShieldCheck
} from 'lucide-react';

const TransactionsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGateway, setFilterGateway] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({
    totalAmount: 0,
    deposits: 0,
    payments: 0,
    refunds: 0
  });

  useEffect(() => {
    checkAuth();
    loadTransactions();
  }, [filterType, filterStatus, filterGateway, dateRange]);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!token || user.role !== 'admin') {
      router.push('/SignIn');
      return false;
    }
    return true;
  };

  const loadTransactions = async () => {
    if (!checkAuth()) return;
    
    setLoading(true);
    try {
      const filters = {
        type: filterType === 'all' ? '' : filterType,
        status: filterStatus === 'all' ? '' : filterStatus,
        gateway: filterGateway === 'all' ? '' : filterGateway,
        startDate: dateRange.start,
        endDate: dateRange.end,
        search: searchTerm,
        limit: 100
      };

      const response = await adminAPI.transaction.getTransactions(filters);
      setTransactions(response.transactions);
      
      // Calculate stats
      const stats = {
        totalAmount: 0,
        deposits: response.amountByType?.deposit || 0,
        payments: response.amountByType?.payment || 0,
        refunds: response.amountByType?.refund || 0
      };
      stats.totalAmount = stats.deposits + stats.payments - stats.refunds;
      setStats(stats);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      showNotification('Failed to load transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleVerifyPaystack = async (reference) => {
    try {
      const response = await adminAPI.transaction.verifyPaystackPayment(reference);
      if (response.verified) {
        showNotification('Payment verified successfully', 'success');
      } else {
        showNotification('Payment verification failed', 'error');
      }
      loadTransactions();
    } catch (error) {
      console.error('Failed to verify payment:', error);
      showNotification('Failed to verify payment', 'error');
    }
  };

  const handleUpdateStatus = async (transactionId, newStatus) => {
    try {
      await adminAPI.transaction.updateTransactionStatus(transactionId, newStatus);
      showNotification('Transaction status updated', 'success');
      loadTransactions();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Failed to update status:', error);
      showNotification('Failed to update transaction status', 'error');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard', 'success');
  };

  const exportTransactions = () => {
    showNotification('Exporting transactions...', 'success');
    // Implement export functionality
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'refund':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
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

      {/* Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Transaction Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Transaction ID</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="font-medium text-gray-900 dark:text-white">{selectedTransaction._id}</p>
                    <button
                      onClick={() => copyToClipboard(selectedTransaction._id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Reference</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="font-medium text-gray-900 dark:text-white">{selectedTransaction.reference}</p>
                    <button
                      onClick={() => copyToClipboard(selectedTransaction.reference)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    GHS {selectedTransaction.amount.toFixed(2)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getTypeIcon(selectedTransaction.type)}
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {selectedTransaction.type}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusColor(selectedTransaction.status)
                    }`}>
                      {getStatusIcon(selectedTransaction.status)}
                      <span className="ml-1 capitalize">{selectedTransaction.status}</span>
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Gateway</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-1 capitalize">
                    {selectedTransaction.gateway}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">User</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {selectedTransaction.userId?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedTransaction.userId?.email}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {new Date(selectedTransaction.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedTransaction.metadata && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Metadata</p>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedTransaction.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                {selectedTransaction.gateway === 'paystack' && (
                  <button
                    onClick={() => handleVerifyPaystack(selectedTransaction.reference)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Payment</span>
                  </button>
                )}
                
                <div className="flex items-center space-x-2">
                  <select
                    onChange={(e) => handleUpdateStatus(selectedTransaction._id, e.target.value)}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
                    defaultValue=""
                  >
                    <option value="" disabled>Update Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor all financial transactions</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Total Volume</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              GHS {stats.totalAmount.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Deposits</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              GHS {stats.deposits.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Payments</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              GHS {stats.payments.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Refunds</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              GHS {stats.refunds.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadTransactions()}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08] transition-all"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="payment">Payments</option>
              <option value="refund">Refunds</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={filterGateway}
              onChange={(e) => setFilterGateway(e.target.value)}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
            >
              <option value="all">All Gateways</option>
              <option value="paystack">Paystack</option>
              <option value="wallet">Wallet</option>
              <option value="admin-deposit">Admin Deposit</option>
            </select>

            <div className="flex items-center space-x-2">
              <button
                onClick={exportTransactions}
                className="px-4 py-2.5 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-colors font-medium flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={loadTransactions}
                className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Reference</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">User</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Gateway</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {transaction.reference.slice(0, 20)}...
                        </span>
                        <button
                          onClick={() => copyToClipboard(transaction.reference)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <Copy className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {transaction.userId?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {transaction.userId?.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(transaction.type)}
                        <span className="text-sm capitalize">{transaction.type}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                      GHS {transaction.amount.toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getStatusColor(transaction.status)
                      }`}>
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1 capitalize">{transaction.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {transaction.gateway}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {transactions.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No transactions found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
