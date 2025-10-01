'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  AlertCircle,
  Moon,
  Sun,
  Zap,
  Activity,
  TrendingUp,
  DollarSign,
  Calendar,
  Search,
  Loader2,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Database,
  Wifi,
  Signal,
  Timer,
  CheckCheck,
  AlertTriangle,
  Package
} from 'lucide-react';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://unlimitedata.onrender.com';
const API_ENDPOINTS = {
  TRANSACTIONS: '/api/v1/user-transactions',
  VERIFY: '/api/v1/verify-pending-transaction'
};

// Constants
const TRANSACTION_EXPIRY_HOURS = 5;
const NOTIFICATION_DURATION = 5000;
const PAGE_SIZE = 100;

const TransactionsPage = () => {
  const router = useRouter();
  
  // Core state
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [userData, setUserData] = useState(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    pages: 0
  });
  
  // UI state
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [verifyingId, setVerifyingId] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });
  const [darkMode, setDarkMode] = useState(true); // Default to dark for black theme

  // Initialize theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDarkMode = localStorage.getItem('darkMode');
      const prefersDark = savedDarkMode !== null 
        ? savedDarkMode === 'true'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      setDarkMode(prefersDark || true); // Force dark for black theme
      document.documentElement.classList.toggle('dark', prefersDark || true);
    }
  }, []);

  // Authentication check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      const userDataStr = localStorage.getItem('userData');
      
      if (!token) {
        router.push('/SignIn');
        return;
      }
      
      setAuthToken(token);
      
      if (userDataStr) {
        try {
          const parsedUserData = JSON.parse(userDataStr);
          setUserData(parsedUserData);
        } catch (err) {
          console.error('Error parsing user data:', err);
          localStorage.removeItem('userData');
          router.push('/SignIn');
        }
      } else {
        router.push('/SignIn');
      }
    }
  }, [router]);

  // Fetch transactions
  const fetchTransactions = useCallback(async (isRefresh = false) => {
    if (!authToken || !userData) return;
    
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    
    try {
      const userId = userData.id;
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });
      
      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.TRANSACTIONS}/${userId}?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      if (response.data.success) {
        setTransactions(response.data.data.transactions || []);
        setPagination(response.data.data.pagination || pagination);
      } else {
        throw new Error(response.data.message || 'Failed to fetch transactions');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        showNotification('Session expired. Please login again.', 'error');
        localStorage.clear();
        router.push('/SignIn');
      } else {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to load transactions';
        setError(errorMsg);
        showNotification(errorMsg, 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authToken, userData, pagination.page, pagination.limit, statusFilter, searchQuery]);

  // Load transactions on mount and filter changes
  useEffect(() => {
    if (userData && authToken) {
      fetchTransactions();
    }
  }, [authToken, userData, pagination.page, statusFilter, searchQuery]);

  // Verify transaction
  const verifyTransaction = async (transactionId, createdAt) => {
    if (!authToken || !userData) return;
    
    // Check expiry
    if (isTransactionExpired(createdAt)) {
      showNotification('Transaction expired. Please contact support.', 'error');
      return;
    }
    
    setVerifyingId(transactionId);
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.VERIFY}/${transactionId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      if (response.data.success) {
        showNotification('Transaction verified successfully!', 'success');
        setTransactions(prev => 
          prev.map(t => t._id === transactionId ? { ...t, status: 'completed' } : t)
        );
      } else {
        throw new Error(response.data.message || 'Verification failed');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Verification failed. Please try again.';
      showNotification(errorMsg, 'error');
    } finally {
      setVerifyingId(null);
    }
  };

  // Utility functions
  const isTransactionExpired = useCallback((createdAt) => {
    const transactionTime = new Date(createdAt);
    const currentTime = new Date();
    const hoursDiff = (currentTime - transactionTime) / (1000 * 60 * 60);
    return hoursDiff > TRANSACTION_EXPIRY_HOURS;
  }, []);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, NOTIFICATION_DURATION);
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleString('en-GH', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(amount || 0);
  }, []);

  // Status display configuration
  const getStatusDisplay = useCallback((status) => {
    const statusMap = {
      completed: {
        icon: <CheckCircle className="w-5 h-5" />,
        color: 'text-green-400 bg-green-950/50 border-green-800',
        text: 'Completed'
      },
      pending: {
        icon: <Clock className="w-5 h-5" />,
        color: 'text-yellow-400 bg-yellow-950/50 border-yellow-800',
        text: 'Pending'
      },
      failed: {
        icon: <XCircle className="w-5 h-5" />,
        color: 'text-red-400 bg-red-950/50 border-red-800',
        text: 'Failed'
      }
    };
    
    return statusMap[status] || {
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'text-gray-400 bg-gray-800 border-gray-700',
      text: status || 'Unknown'
    };
  }, []);

  // Calculate statistics
  const transactionStats = useMemo(() => ({
    total: transactions.length,
    completed: transactions.filter(t => t.status === 'completed').length,
    pending: transactions.filter(t => t.status === 'pending').length,
    failed: transactions.filter(t => t.status === 'failed').length,
    totalAmount: transactions.reduce((sum, t) => sum + (t.status === 'completed' ? t.amount : 0), 0)
  }), [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          t.reference?.toLowerCase().includes(query) ||
          t.type?.toLowerCase().includes(query) ||
          t.amount?.toString().includes(query)
        );
      }
      return true;
    });
  }, [transactions, searchQuery]);

  // Page handlers
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleRefresh = () => {
    fetchTransactions(true);
  };

  // Loading state
  if (!userData || !authToken || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-black via-gray-950 to-black">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-red-900/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 border-r-red-400 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-red-500 to-red-600 animate-pulse flex items-center justify-center">
              <Database className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-2xl font-black text-red-500 animate-pulse mb-2">
            UNLIMITEDDATA GH
          </h1>
          <p className="text-gray-400 font-medium">Loading transactions...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-red-900/10 to-red-600/10 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-red-800/10 to-black blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-2xl p-6 border border-red-500/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Wallet className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white flex items-center">
                  Transaction History
                </h1>
                <p className="text-red-100 text-sm mt-1">Monitor your data purchases</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-3 rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300 border border-white/20 disabled:opacity-50"
                aria-label="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-900 backdrop-blur-lg p-4 rounded-xl shadow-xl border border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-red-950/50 flex items-center justify-center">
                <Package className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">Total</p>
                <p className="text-xl font-black text-white">{transactionStats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 backdrop-blur-lg p-4 rounded-xl shadow-xl border border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-green-950/50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">Completed</p>
                <p className="text-xl font-black text-white">{transactionStats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 backdrop-blur-lg p-4 rounded-xl shadow-xl border border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-950/50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">Pending</p>
                <p className="text-xl font-black text-white">{transactionStats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 backdrop-blur-lg p-4 rounded-xl shadow-xl border border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-red-950/50 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">Failed</p>
                <p className="text-xl font-black text-white">{transactionStats.failed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 backdrop-blur-lg p-4 rounded-xl shadow-xl border border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-red-950/50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">Total Value</p>
                <p className="text-lg font-black text-white">{formatCurrency(transactionStats.totalAmount)}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="mb-6 bg-gray-900 backdrop-blur-lg rounded-xl shadow-xl p-4 border border-gray-800">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>
            
            <select
              className="px-4 py-3 bg-black text-white border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              value={statusFilter}
              onChange={handleStatusChange}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg font-semibold disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
        
        {/* Notification */}
        {notification.show && (
          <div className={`mb-6 p-4 rounded-xl flex items-center shadow-lg backdrop-blur-lg border transition-all duration-300 ${
            notification.type === 'success' 
              ? 'bg-green-950/50 text-green-400 border-green-800' 
              : 'bg-red-950/50 text-red-400 border-red-800'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        )}
        
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/50 text-red-400 rounded-xl flex items-center backdrop-blur-lg border border-red-800 shadow-lg">
            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}
        
        {/* Transactions Table/Cards */}
        <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gradient-to-r from-gray-900 to-gray-950">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <Search className="w-12 h-12 text-gray-600 mb-4" />
                        <p className="text-gray-400 text-lg font-medium">No transactions found</p>
                        <p className="text-gray-600 text-sm mt-1">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const status = getStatusDisplay(transaction.status);
                    const expired = transaction.status === 'pending' && isTransactionExpired(transaction.createdAt);
                    
                    return (
                      <tr key={transaction._id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-white capitalize">
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-red-400">
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-400 font-mono truncate max-w-[200px]">
                            {transaction.reference}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${status.color}`}>
                            {status.icon}
                            <span className="ml-2">{status.text}</span>
                            {expired && <span className="ml-2 text-red-400">(Expired)</span>}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {transaction.status === 'pending' && (
                            <button
                              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                expired 
                                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                  : verifyingId === transaction._id
                                    ? 'bg-red-950/50 text-red-400 border border-red-800'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                              }`}
                              disabled={verifyingId === transaction._id || expired}
                              onClick={() => !expired && verifyTransaction(transaction._id, transaction.createdAt)}
                            >
                              {verifyingId === transaction._id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Verifying...
                                </>
                              ) : expired ? (
                                <>
                                  <AlertTriangle className="w-4 h-4 mr-2" />
                                  Expired
                                </>
                              ) : (
                                <>
                                  <CheckCheck className="w-4 h-4 mr-2" />
                                  Verify
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden">
            {filteredTransactions.length === 0 ? (
              <div className="p-10 text-center">
                <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 font-medium">No transactions found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {filteredTransactions.map((transaction) => {
                  const status = getStatusDisplay(transaction.status);
                  const expired = transaction.status === 'pending' && isTransactionExpired(transaction.createdAt);
                  
                  return (
                    <div key={transaction._id} className="p-4 hover:bg-gray-800/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold text-white capitalize">{transaction.type}</div>
                          <div className="text-sm text-gray-400 mt-1">
                            {formatDate(transaction.createdAt)}
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold border ${status.color}`}>
                          {status.icon}
                          <span className="ml-1">{status.text}</span>
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500 text-sm">Amount:</span>
                          <span className="font-bold text-red-400">{formatCurrency(transaction.amount)}</span>
                        </div>
                        <div className="text-xs text-gray-500 font-mono truncate">
                          Ref: {transaction.reference}
                        </div>
                      </div>
                      
                      {transaction.status === 'pending' && (
                        <button
                          className={`w-full mt-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                            expired 
                              ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                              : verifyingId === transaction._id
                                ? 'bg-red-950/50 text-red-400 border border-red-800'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                          disabled={verifyingId === transaction._id || expired}
                          onClick={() => !expired && verifyTransaction(transaction._id, transaction.createdAt)}
                        >
                          {verifyingId === transaction._id ? 'Verifying...' : expired ? 'Expired' : 'Verify Now'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center mt-8 space-x-4">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-3 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-2">
              {[...Array(Math.min(5, pagination.pages))].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                      pageNum === pagination.page
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="p-3 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;