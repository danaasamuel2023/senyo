'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, withAuth } from '../../utils/auth';
import {
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  AlertCircle,
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
  Package,
  Eye,
  Copy,
  X,
  ArrowLeft,
  Hash,
  Phone,
  Globe,
  Smartphone,
  MoreHorizontal
} from 'lucide-react';

// API Configuration
const getApiEndpoint = (path) => {
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const baseUrl = isLocalhost ? 'http://localhost:5001' : 'https://unlimitedata.onrender.com';
  return `${baseUrl}${path}`;
};

// Animation Components
const AnimatedCounter = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (!end) {
      setCount(0);
      return;
    }
    const increment = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <span>{count}</span>;
};

const CurrencyCounter = ({ value, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = parseFloat(value) || 0;
    if (!end) {
      setCount(0);
      return;
    }
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <span>₵{count.toFixed(2)}</span>;
};

// Skeleton Loader
const SkeletonLoader = () => (
  <div className="animate-pulse">
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ hasFilters, onClearFilters, onPurchase }) => (
  <div className="text-center py-16">
    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#FFCC08]/20 to-yellow-600/20 flex items-center justify-center">
      <Package className="w-12 h-12 text-[#FFCC08]" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">
      {hasFilters ? 'No Orders Match Your Filters' : 'No Orders Yet'}
    </h3>
    <p className="text-gray-400 mb-8 max-w-md mx-auto">
      {hasFilters 
        ? 'Try adjusting your search criteria or clear filters to see all orders'
        : 'Start your data journey by purchasing your first data bundle'
      }
    </p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="px-6 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors font-medium"
        >
          Clear Filters
        </button>
      )}
      <button
        onClick={onPurchase}
        className="px-6 py-3 bg-gradient-to-r from-[#FFCC08] to-yellow-600 text-black rounded-xl hover:from-yellow-500 hover:to-yellow-700 transition-all font-bold shadow-lg"
      >
        Purchase Data
      </button>
    </div>
  </div>
);

// Order Details Modal
const OrderDetailsModal = ({ order, isOpen, onClose }) => {
  const [copied, setCopied] = useState('');

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FFCC08] to-yellow-600 p-6 text-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Order Details</h3>
                <p className="text-black/70">Reference: {order.reference?.slice(0, 12)}...</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 transition-colors flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-center">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
              order.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {order.status === 'completed' ? <CheckCircle className="w-4 h-4 mr-2" /> :
               order.status === 'failed' ? <XCircle className="w-4 h-4 mr-2" /> :
               order.status === 'pending' ? <Clock className="w-4 h-4 mr-2" /> :
               <AlertCircle className="w-4 h-4 mr-2" />}
              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
            </span>
          </div>

          {/* Order Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Hash className="w-4 h-4 text-[#FFCC08]" />
                <span className="text-sm font-medium text-gray-400">Reference</span>
              </div>
              <div className="flex items-center space-x-2">
                <p className="font-mono text-sm text-white flex-1">
                  {order.reference}
                </p>
                <button
                  onClick={() => copyToClipboard(order.reference, 'reference')}
                  className={`p-2 rounded-lg transition-colors ${
                    copied === 'reference' 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Wifi className="w-4 h-4 text-[#FFCC08]" />
                <span className="text-sm font-medium text-gray-400">Type</span>
              </div>
              <p className="font-medium text-white capitalize">{order.type}</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-4 h-4 text-[#FFCC08]" />
                <span className="text-sm font-medium text-gray-400">Amount</span>
              </div>
              <p className="font-bold text-lg text-white">₵{order.amount?.toFixed(2)}</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-[#FFCC08]" />
                <span className="text-sm font-medium text-gray-400">Date & Time</span>
              </div>
              <p className="font-medium text-white">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MyOrdersPage = () => {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  
  // Debug authentication state
  useEffect(() => {
    console.log('MyOrdersPage Auth State:', { isAuthenticated, user, authLoading });
  }, [isAuthenticated, user, authLoading]);
  
  // State Management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notification, setNotification] = useState(null);
  const [animateStats, setAnimateStats] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalSpent: 0
  });

  // Memoized values
  const hasActiveFilters = useMemo(() => {
    return searchTerm || filterStatus !== 'all';
  }, [searchTerm, filterStatus]);

  // Utility Functions
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const checkAuth = useCallback(() => {
    console.log('checkAuth called:', { authLoading, isAuthenticated, user: !!user });
    
    if (authLoading) {
      console.log('Auth still loading, waiting...');
      return false; // Still loading
    }
    
    // Check localStorage as fallback
    if (!isAuthenticated || !user) {
      console.log('useAuth failed, checking localStorage...');
      try {
        const token = localStorage.getItem('authToken');
        const userDataStr = localStorage.getItem('userData');
        
        console.log('localStorage check:', { hasToken: !!token, hasUserData: !!userDataStr });
        
        if (token && userDataStr) {
          const userData = JSON.parse(userDataStr);
          console.log('Parsed userData:', userData);
          if (userData && (userData.id || userData._id)) {
            console.log('localStorage auth valid, setting user data');
            setUserData(userData);
            return true;
          } else {
            console.log('UserData missing ID fields:', { id: userData?.id, _id: userData?._id });
          }
        }
      } catch (error) {
        console.error('Error checking localStorage auth:', error);
      }
      
      console.log('No valid auth found, redirecting to SignIn');
      // Redirect to signin with return path
      router.push(`/SignIn?redirect=${encodeURIComponent('/myorders')}`);
      return false;
    }
    
    console.log('useAuth successful, setting user data');
    console.log('User from useAuth:', user);
    setUserData(user);
    return true;
  }, [isAuthenticated, user, authLoading, router]);

  const loadOrders = useCallback(async () => {
    if (!checkAuth()) return;
    
    setRefreshing(true);
    try {
      // Ensure user is available after checkAuth
      const userId = user?.id || user?._id || userData?.id || userData?._id;
      console.log('loadOrders user check:', { 
        user, 
        userData, 
        userId,
        hasUserId: !!userId 
      });
      
      if (!userId) {
        console.error('User ID not found in authentication context');
        showNotification('User authentication error. Please sign in again.', 'error');
        router.push('/SignIn');
        return;
      }
      
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(
        getApiEndpoint(`/api/v1/user-transactions/${userId}?limit=1000`),
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const transactions = data.data?.transactions || [];
        setOrders(transactions);
        calculateStats(transactions);
        setAnimateStats(true);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      showNotification('Failed to load order history. Please try again.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [checkAuth, showNotification, router, user]);

  const calculateStats = useCallback((ordersList) => {
    const newStats = {
      totalOrders: ordersList.length,
      completed: ordersList.filter(o => o.status === 'completed').length,
      pending: ordersList.filter(o => o.status === 'pending').length,
      failed: ordersList.filter(o => o.status === 'failed').length,
      totalSpent: ordersList.reduce((sum, o) => sum + (o.amount || 0), 0)
    };
    setStats(newStats);
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.amount?.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    setFilteredOrders(filtered);
    calculateStats(filtered);
  }, [orders, searchTerm, filterStatus, calculateStats]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterStatus('all');
  }, []);

  const verifyTransaction = async (transactionId) => {
    if (!userData) return;
    
    setVerifyingId(transactionId);
    
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(
        getApiEndpoint(`/api/v1/verify-pending-transaction/${transactionId}`),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        showNotification('Transaction verified successfully!', 'success');
        setOrders(prev => 
          prev.map(t => t._id === transactionId ? { ...t, status: 'completed' } : t)
        );
      } else {
        throw new Error('Verification failed');
      }
    } catch (err) {
      showNotification('Verification failed. Please try again.', 'error');
    } finally {
      setVerifyingId(null);
    }
  };

  const getStatusIcon = useCallback((status) => {
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
  }, []);

  const getStatusColor = useCallback((status) => {
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
  }, []);

  // Effects
  useEffect(() => {
    // Only load orders after auth loading is complete
    if (!authLoading) {
      console.log('Auth loading complete, calling loadOrders');
      loadOrders();
    } else {
      console.log('Auth still loading, waiting...');
    }
  }, [loadOrders, authLoading]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Listen for pull-to-refresh events
  useEffect(() => {
    const handleRefreshOrders = () => {
      try {
        loadOrders();
      } catch (error) {
        console.error('Error refreshing orders:', error);
      }
    };

    window.addEventListener('refreshOrders', handleRefreshOrders);
    return () => window.removeEventListener('refreshOrders', handleRefreshOrders);
  }, [loadOrders]);

  // Loading State - Show loading while auth is being checked
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[#FFCC08]/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FFCC08] animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center">
              <Package className="w-6 h-6 text-black" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#FFCC08] mb-2">UNLIMITEDDATA GH</h1>
          <div className="flex items-center justify-center space-x-2 text-yellow-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">
              {authLoading ? 'Checking authentication...' : 'Loading orders...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden pb-20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-[#FFCC08]/5 to-yellow-600/5 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-yellow-600/5 to-black blur-3xl"></div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg flex items-center space-x-3 backdrop-blur-xl ${
          notification.type === 'success' 
            ? 'bg-green-500/90 text-white' 
            : 'bg-red-500/90 text-white'
        }`}>
          {notification.type === 'success' ? 
            <CheckCircle className="w-5 h-5" /> : 
            <AlertCircle className="w-5 h-5" />
          }
          <span className="font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal 
        order={selectedOrder}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />

      {/* Main Content */}
      <div className="relative z-10 px-3 sm:px-4 py-3 sm:py-4 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="p-2.5 hover:bg-gray-800/50 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#FFCC08]" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">My Orders</h1>
                <p className="text-gray-400 mt-1">Track all your transactions</p>
              </div>
            </div>

            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <button
                onClick={loadOrders}
                className="p-2.5 bg-gray-800/50 rounded-xl hover:bg-gray-700/50 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-[#FFCC08] ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
            <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Total Orders</div>
              <div className="text-lg sm:text-2xl font-bold text-white">
                {animateStats ? <AnimatedCounter value={stats.totalOrders} /> : stats.totalOrders}
              </div>
            </div>
            
            <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border-l-4 border-green-500">
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Completed</div>
              <div className="text-lg sm:text-2xl font-bold text-green-400">
                {animateStats ? <AnimatedCounter value={stats.completed} /> : stats.completed}
              </div>
            </div>
            
            <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border-l-4 border-yellow-500">
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Pending</div>
              <div className="text-lg sm:text-2xl font-bold text-yellow-400">
                {animateStats ? <AnimatedCounter value={stats.pending} /> : stats.pending}
              </div>
            </div>
            
            <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border-l-4 border-red-500">
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Failed</div>
              <div className="text-lg sm:text-2xl font-bold text-red-400">
                {animateStats ? <AnimatedCounter value={stats.failed} /> : stats.failed}
              </div>
            </div>
            
            <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Total Spent</div>
              <div className="text-lg sm:text-2xl font-bold text-purple-400">
                {animateStats ? <CurrencyCounter value={stats.totalSpent} /> : `₵${stats.totalSpent.toFixed(0)}`}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08] text-white placeholder-gray-400"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 bg-gray-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08] text-white"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              <button
                onClick={loadOrders}
                disabled={refreshing}
                className="px-4 py-2.5 bg-gradient-to-r from-[#FFCC08] to-yellow-600 text-black rounded-xl hover:from-yellow-500 hover:to-yellow-700 transition-all font-bold disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl shadow-sm overflow-hidden">
          {refreshing ? (
            <div className="p-8">
              <SkeletonLoader />
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 sm:px-6 text-sm font-semibold text-gray-300">Date</th>
                    <th className="text-left py-4 px-4 sm:px-6 text-sm font-semibold text-gray-300">Type</th>
                    <th className="text-left py-4 px-4 sm:px-6 text-sm font-semibold text-gray-300">Amount</th>
                    <th className="text-left py-4 px-4 sm:px-6 text-sm font-semibold text-gray-300">Reference</th>
                    <th className="text-left py-4 px-4 sm:px-6 text-sm font-semibold text-gray-300">Status</th>
                    <th className="text-left py-4 px-4 sm:px-6 text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors">
                      <td className="py-4 px-4 sm:px-6 text-sm text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center space-x-2">
                          <Wifi className="w-4 h-4 text-[#FFCC08]" />
                          <span className="text-sm font-medium text-white capitalize">{order.type}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 font-medium text-white">
                        ₵{order.amount?.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center space-x-2">
                          <Hash className="w-4 h-4 text-[#FFCC08]" />
                          <span className="font-mono text-sm text-white">
                            {order.reference?.slice(0, 12)}...
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getStatusColor(order.status)
                        }`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailsModal(true);
                            }}
                            className="text-[#FFCC08] hover:text-yellow-500 text-sm font-medium flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          {order.status === 'pending' && (
                            <button
                              onClick={() => verifyTransaction(order._id)}
                              disabled={verifyingId === order._id}
                              className="text-green-400 hover:text-green-500 text-sm font-medium flex items-center space-x-1"
                            >
                              {verifyingId === order._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCheck className="w-4 h-4" />
                              )}
                              <span>{verifyingId === order._id ? 'Verifying...' : 'Verify'}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState 
              hasFilters={hasActiveFilters}
              onClearFilters={clearFilters}
              onPurchase={() => router.push('/mtnup2u')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;