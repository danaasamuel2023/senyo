'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Phone, Database, CreditCard, Clock, Search, Filter, X, 
  Zap, Activity, Sparkles, TrendingUp, RefreshCw, CheckCircle, 
  AlertCircle, Wifi, Signal, CircleDot, Timer, Calendar,
  ArrowUpRight, ArrowDownRight, Copy, Check, Shield, Flame
} from 'lucide-react';

// API Configuration
const API_CONFIG = {
  GEONETTECH: {
    BASE_URL: 'https://testhub.geonettech.site/api/v1/checkOrderStatus/:ref',
    API_KEY: '42|tjhxBxaWWe4mPUpxXN1uIk0KTxypvlSqOIOQWz6K162aa0d6'
  },
  TELCEL: {
    API_URL: 'https://iget.onrender.com/api/developer/orders/reference/:orderRef',
    API_KEY: '4cb6763274e86173d2c22c120493ca67b6185039f826f4aa43bb3057db50f858'
  },
  Unlimiteddata: {
    BASE_URL: 'https://unlimitedata.onrender.com/api/v1'
  }
};

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Utility Functions
const formatCurrency = (amount) => 
  new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2
  }).format(amount);

const formatDate = (dateString) => 
  new Date(dateString).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

const formatDataSize = (capacity) => 
  capacity >= 1000 ? `${capacity / 1000}MB` : `${capacity}GB`;

const formatCountdown = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Network Configuration
const NETWORK_CONFIG = {
  YELLO: {
    name: 'MTN',
    gradient: 'from-red-500 to-rose-600',
    lightBg: 'bg-red-50',
    darkBg: 'bg-red-900/20',
    icon: '📱',
    color: 'red'
  },
  TELECEL: {
    name: 'Telecel',
    gradient: 'from-red-400 to-pink-600',
    lightBg: 'bg-rose-50',
    darkBg: 'bg-rose-900/20',
    icon: '📡',
    color: 'rose'
  },
  AT_PREMIUM: {
    name: 'AirtelTigo Premium',
    gradient: 'from-red-600 to-rose-700',
    lightBg: 'bg-red-50',
    darkBg: 'bg-red-900/20',
    icon: '🌟',
    color: 'red'
  },
  airteltigo: {
    name: 'AirtelTigo',
    gradient: 'from-rose-500 to-red-600',
    lightBg: 'bg-rose-50',
    darkBg: 'bg-rose-900/20',
    icon: '📶',
    color: 'rose'
  },
  at: {
    name: 'AirtelTigo Standard',
    gradient: 'from-red-500 to-red-700',
    lightBg: 'bg-red-50',
    darkBg: 'bg-red-900/20',
    icon: '📞',
    color: 'red'
  }
};

// Status Configuration
const STATUS_CONFIG = {
  pending: {
    gradient: 'from-gray-400 to-gray-600',
    bg: 'bg-gray-100 dark:bg-gray-900/50',
    border: 'border-gray-300',
    text: 'text-gray-700 dark:text-gray-300',
    icon: Clock,
    animation: 'animate-pulse'
  },
  completed: {
    gradient: 'from-red-500 to-rose-600',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-300',
    text: 'text-red-700 dark:text-red-400',
    icon: CheckCircle,
    animation: ''
  },
  failed: {
    gradient: 'from-gray-600 to-gray-800',
    bg: 'bg-gray-100 dark:bg-gray-900/50',
    border: 'border-gray-400',
    text: 'text-gray-800 dark:text-gray-300',
    icon: X,
    animation: ''
  },
  processing: {
    gradient: 'from-red-400 to-rose-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-300',
    text: 'text-red-700 dark:text-red-400',
    icon: Activity,
    animation: 'animate-spin'
  },
  refunded: {
    gradient: 'from-rose-400 to-pink-600',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    border: 'border-rose-300',
    text: 'text-rose-700 dark:text-rose-400',
    icon: RefreshCw,
    animation: ''
  },
  waiting: {
    gradient: 'from-gray-400 to-gray-600',
    bg: 'bg-gray-100 dark:bg-gray-900/50',
    border: 'border-gray-300',
    text: 'text-gray-700 dark:text-gray-400',
    icon: Timer,
    animation: 'animate-pulse'
  }
};

// Components
const StatCard = ({ title, value, icon: Icon, color, subValue }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className={`${color} backdrop-blur-sm rounded-2xl p-4 border border-white/20`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-white/80 uppercase tracking-wider font-medium">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {subValue && <p className="text-xs text-white/60 mt-1">{subValue}</p>}
      </div>
      <Icon className="w-8 h-8 text-white/30" />
    </div>
  </motion.div>
);

const PurchaseCard = ({ purchase, onCheckStatus, checkingStatus, onCopy, copiedRef, onClick }) => {
  const network = NETWORK_CONFIG[purchase.network] || NETWORK_CONFIG.at;
  const status = STATUS_CONFIG[purchase.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="relative bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-red-200 dark:border-red-900/50 hover:border-red-400 dark:hover:border-red-700 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-xl"
    >
      {/* Red accent bar */}
      <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${network.gradient} rounded-l-2xl`} />
      
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start space-x-4">
          {/* Network icon */}
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${network.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform`}>
            <Flame className="w-7 h-7" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {formatDataSize(purchase.capacity)} Data Bundle
              </h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.border} ${status.text} border`}>
                <StatusIcon className={`w-3 h-3 mr-1 ${status.animation}`} />
                {purchase.status}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Phone className="w-4 h-4 text-red-500" />
                <span>{purchase.phoneNumber}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Wifi className="w-4 h-4 text-red-500" />
                <span>{network.name}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-red-500" />
                <span>{formatDate(purchase.createdAt)}</span>
              </div>
              
              {purchase.geonetReference && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs">Ref:</span>
                  <code className="text-xs bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded text-red-700 dark:text-red-400">
                    {purchase.geonetReference}
                  </code>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopy(purchase.geonetReference, purchase._id);
                    }}
                    className="ml-1 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    {copiedRef === purchase._id ? (
                      <Check className="w-3 h-3 text-red-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              )}
            </div>
            
            {purchase.lastChecked && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                Last checked: {formatDate(purchase.lastChecked)}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-3">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(purchase.price)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Amount paid</p>
          </div>
          
          {purchase.geonetReference && purchase.network !== 'at' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onCheckStatus(purchase._id);
              }}
              disabled={checkingStatus[purchase._id]}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm transition-all disabled:opacity-50 shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${checkingStatus[purchase._id] ? 'animate-spin' : ''}`} />
              <span>{checkingStatus[purchase._id] ? 'Checking...' : 'Check Status'}</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Main Component
export default function DataPurchases() {
  const router = useRouter();
  const [state, setState] = useState({
    purchases: [],
    allPurchases: [],
    loading: true,
    error: null,
    searchTerm: '',
    filterStatus: 'all',
    filterNetwork: 'all',
    showFilters: false,
    checkingStatus: {},
    lastAutoUpdate: null,
    nextUpdateIn: AUTO_REFRESH_INTERVAL,
    copiedRef: null,
    selectedPurchase: null
  });

  const userId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      return userData.id;
    } catch {
      return null;
    }
  }, []);

  const checkOrderStatus = useCallback(async (purchase) => {
    if (!purchase.geonetReference || purchase.network === 'at') return purchase;
    
    try {
      let response, status;
      
      if (purchase.network === 'TELECEL') {
        const url = API_CONFIG.TELCEL.API_URL.replace(':orderRef', purchase.geonetReference);
        response = await axios.get(url, { headers: { 'X-API-Key': API_CONFIG.TELCEL.API_KEY } });
        status = response.data.data.order.status;
      } else {
        const url = API_CONFIG.GEONETTECH.BASE_URL.replace(':ref', purchase.geonetReference);
        response = await axios.get(url, { headers: { Authorization: `Bearer ${API_CONFIG.GEONETTECH.API_KEY}` } });
        status = response.data.data.status;
      }
      
      return { ...purchase, ...(status !== purchase.status && { status }), lastChecked: new Date().toISOString() };
    } catch (error) {
      console.error(`Status check failed for ${purchase._id}:`, error);
      return purchase;
    }
  }, []);

  const batchCheckStatuses = useCallback(async () => {
    const pendingPurchases = state.allPurchases.filter(p => 
      ['pending', 'processing', 'waiting'].includes(p.status)
    );
    
    if (!pendingPurchases.length) return;
    
    setState(prev => ({
      ...prev,
      checkingStatus: pendingPurchases.reduce((acc, p) => ({ ...acc, [p._id]: true }), prev.checkingStatus)
    }));
    
    try {
      const updated = await Promise.all(pendingPurchases.map(checkOrderStatus));
      setState(prev => ({
        ...prev,
        allPurchases: prev.allPurchases.map(p => 
          updated.find(u => u._id === p._id) || p
        ),
        checkingStatus: {},
        lastAutoUpdate: new Date()
      }));
    } catch {
      setState(prev => ({ ...prev, checkingStatus: {} }));
    }
  }, [state.allPurchases, checkOrderStatus]);

  const manualCheckStatus = useCallback(async (purchaseId) => {
    const purchase = state.allPurchases.find(p => p._id === purchaseId);
    if (!purchase) return;
    
    setState(prev => ({ ...prev, checkingStatus: { ...prev.checkingStatus, [purchaseId]: true } }));
    
    try {
      const updated = await checkOrderStatus(purchase);
      setState(prev => ({
        ...prev,
        allPurchases: prev.allPurchases.map(p => p._id === purchaseId ? updated : p),
        checkingStatus: { ...prev.checkingStatus, [purchaseId]: false }
      }));
    } catch {
      setState(prev => ({ 
        ...prev, 
        checkingStatus: { ...prev.checkingStatus, [purchaseId]: false } 
      }));
    }
  }, [state.allPurchases, checkOrderStatus]);

  const copyToClipboard = useCallback((text, purchaseId) => {
    navigator.clipboard.writeText(text);
    setState(prev => ({ ...prev, copiedRef: purchaseId }));
    setTimeout(() => setState(prev => ({ ...prev, copiedRef: null })), 2000);
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (!userId) {
      router.push('/SignIn');
      return;
    }
    
    const fetchPurchases = async () => {
      try {
        const { data } = await axios.get(
          `${API_CONFIG.DATAHUSTLE.BASE_URL}/data/purchase-history/${userId}`,
          { params: { page: 1, limit: 50 } }
        );
        
        if (data.status === 'success') {
          setState(prev => ({
            ...prev,
            allPurchases: data.data.purchases,
            purchases: data.data.purchases,
            loading: false
          }));
          
          setTimeout(() => batchCheckStatuses(), 2000);
        }
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: 'Failed to load purchase history. Please try again later.',
          loading: false
        }));
      }
    };

    fetchPurchases();
  }, [userId, router]);

  // Auto-refresh setup
  useEffect(() => {
    if (!state.loading && state.allPurchases.length > 0) {
      const interval = setInterval(batchCheckStatuses, AUTO_REFRESH_INTERVAL);
      const countdown = setInterval(() => {
        setState(prev => ({
          ...prev,
          nextUpdateIn: prev.nextUpdateIn <= 1000 ? AUTO_REFRESH_INTERVAL : prev.nextUpdateIn - 1000
        }));
      }, 1000);
      
      return () => {
        clearInterval(interval);
        clearInterval(countdown);
      };
    }
  }, [state.loading, state.allPurchases.length, batchCheckStatuses]);

  // Filter purchases
  useEffect(() => {
    let filtered = [...state.allPurchases];
    
    if (state.filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === state.filterStatus);
    }
    
    if (state.filterNetwork !== 'all') {
      filtered = filtered.filter(p => p.network === state.filterNetwork);
    }
    
    if (state.searchTerm.trim()) {
      const search = state.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.phoneNumber.toLowerCase().includes(search) ||
        p.geonetReference?.toLowerCase().includes(search) ||
        NETWORK_CONFIG[p.network]?.name.toLowerCase().includes(search)
      );
    }
    
    setState(prev => ({ ...prev, purchases: filtered }));
  }, [state.searchTerm, state.filterStatus, state.filterNetwork, state.allPurchases]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      total: state.purchases.length,
      completed: state.purchases.filter(p => p.status === 'completed').length,
      pending: state.purchases.filter(p => p.status === 'pending').length,
      failed: state.purchases.filter(p => p.status === 'failed').length,
      totalAmount: state.purchases.reduce((sum, p) => sum + p.price, 0),
      todayAmount: state.purchases
        .filter(p => new Date(p.createdAt).toDateString() === today)
        .reduce((sum, p) => sum + p.price, 0)
    };
  }, [state.purchases]);

  const uniqueNetworks = useMemo(() => 
    [...new Set(state.allPurchases.map(p => p.network))].sort(), 
    [state.allPurchases]
  );
  
  const uniqueStatuses = useMemo(() => 
    [...new Set(state.allPurchases.map(p => p.status))].sort(), 
    [state.allPurchases]
  );

  if (!userId && typeof window !== 'undefined') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white dark:from-gray-900 dark:via-red-950 dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-red-200 dark:border-red-900 text-center max-w-md w-full"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Shield className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">DATAHUSTLE</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">You need to be logged in to view your purchases.</p>
          <button 
            onClick={() => router.push('/SignIn')}
            className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 w-full"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white dark:from-gray-900 dark:via-red-950 dark:to-gray-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-red-400/20 to-rose-400/20 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-rose-400/20 to-pink-400/20 blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl p-6 border border-red-200 dark:border-red-900/50 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                  <Database className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Purchase History</h1>
                  <p className="text-gray-600 dark:text-gray-400">Track and manage your data purchases</p>
                </div>
              </div>
              
              {/* Auto-update timer */}
              {!state.loading && state.purchases.length > 0 && (
                <div className="flex items-center space-x-3 bg-red-50 dark:bg-red-900/20 rounded-2xl px-4 py-2">
                  <RefreshCw className={`w-4 h-4 text-red-500 ${Object.keys(state.checkingStatus).length > 0 ? 'animate-spin' : ''}`} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Next update in: <span className="font-mono text-red-500">{formatCountdown(state.nextUpdateIn)}</span>
                  </span>
                  <button
                    onClick={batchCheckStatuses}
                    disabled={Object.keys(state.checkingStatus).length > 0}
                    className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition-colors"
                  >
                    Update Now
                  </button>
                </div>
              )}
            </div>
            
            {/* Stats Grid */}
            {!state.loading && !state.error && state.purchases.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
                <StatCard title="Total" value={stats.total} icon={Database} color="bg-white/80 dark:bg-gray-900/50" />
                <StatCard title="Completed" value={stats.completed} icon={CheckCircle} color="bg-red-500/20" />
                <StatCard title="Pending" value={stats.pending} icon={Clock} color="bg-gray-500/20" />
                <StatCard title="Failed" value={stats.failed} icon={X} color="bg-gray-700/20" />
                <StatCard title="Total Spent" value={formatCurrency(stats.totalAmount)} icon={TrendingUp} color="bg-rose-500/20" />
                <StatCard title="Today" value={formatCurrency(stats.todayAmount)} icon={Calendar} color="bg-red-600/20" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-red-200 dark:border-red-900/50 overflow-hidden shadow-2xl"
        >
          {/* Search and Filters */}
          {!state.loading && !state.error && state.purchases.length > 0 && (
            <div className="p-6 border-b border-red-100 dark:border-red-900/30">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={state.searchTerm}
                    onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                    placeholder="Search by phone, reference, or network..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                  {state.searchTerm && (
                    <button
                      onClick={() => setState(prev => ({ ...prev, searchTerm: '' }))}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" />
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => setState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
                  className={`flex items-center justify-center px-6 py-3 rounded-2xl font-medium transition-all ${
                    state.showFilters 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                  <motion.span
                    animate={{ rotate: state.showFilters ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-2"
                  >
                    ▼
                  </motion.span>
                </button>
              </div>
              
              <AnimatePresence>
                {state.showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                        <select
                          value={state.filterStatus}
                          onChange={(e) => setState(prev => ({ ...prev, filterStatus: e.target.value }))}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="all">All Statuses</option>
                          {uniqueStatuses.map(status => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Network</label>
                        <select
                          value={state.filterNetwork}
                          onChange={(e) => setState(prev => ({ ...prev, filterNetwork: e.target.value }))}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="all">All Networks</option>
                          {uniqueNetworks.map(network => (
                            <option key={network} value={network}>
                              {NETWORK_CONFIG[network]?.name || network}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          {/* Content Area */}
          <div className="p-6">
            {state.loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 rounded-full border-4 border-red-200 border-t-red-500 mb-4"
                />
                <p className="text-gray-600 dark:text-gray-400">Loading your purchases...</p>
              </div>
            ) : state.error ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-red-700 dark:text-red-400"
              >
                <AlertCircle className="w-6 h-6 mb-2" />
                <p>{state.error}</p>
              </motion.div>
            ) : state.purchases.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Database className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No purchases found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {state.searchTerm || state.filterStatus !== 'all' || state.filterNetwork !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Start your DATAHUSTLE journey today!'}
                </p>
                {(state.searchTerm || state.filterStatus !== 'all' || state.filterNetwork !== 'all') && (
                  <button
                    onClick={() => setState(prev => ({ 
                      ...prev, 
                      searchTerm: '', 
                      filterStatus: 'all', 
                      filterNetwork: 'all' 
                    }))}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-medium transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {state.purchases.map((purchase, index) => (
                    <PurchaseCard
                      key={purchase._id}
                      purchase={purchase}
                      onCheckStatus={manualCheckStatus}
                      checkingStatus={state.checkingStatus}
                      onCopy={copyToClipboard}
                      copiedRef={state.copiedRef}
                      onClick={() => setState(prev => ({ ...prev, selectedPurchase: purchase }))}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
          
          {/* Footer */}
          {!state.loading && !state.error && (
            <div className="border-t border-red-100 dark:border-red-900/30 p-6">
              <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
                <Flame className="w-4 h-4 text-red-500" />
                <span>Powered by UnlimitedDataGH</span>
                <span className="text-gray-400 dark:text-gray-600">•</span>
                <span>Need help? Contact support</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Purchase Detail Modal */}
      <AnimatePresence>
        {state.selectedPurchase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setState(prev => ({ ...prev, selectedPurchase: null }))}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full border border-red-200 dark:border-red-900 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Purchase Details</h3>
              
              <div className="space-y-4">
                {[
                  { label: 'Data Package', value: formatDataSize(state.selectedPurchase.capacity) },
                  { label: 'Phone Number', value: state.selectedPurchase.phoneNumber },
                  { label: 'Network', value: NETWORK_CONFIG[state.selectedPurchase.network]?.name || state.selectedPurchase.network },
                  { label: 'Status', value: state.selectedPurchase.status, capitalize: true },
                  { label: 'Amount Paid', value: formatCurrency(state.selectedPurchase.price) },
                  { label: 'Purchase Date', value: formatDate(state.selectedPurchase.createdAt) }
                ].map(({ label, value, capitalize }) => (
                  <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
                    <p className={`text-lg font-bold text-gray-900 dark:text-white ${capitalize ? 'capitalize' : ''}`}>
                      {value}
                    </p>
                  </div>
                ))}
                
                {state.selectedPurchase.geonetReference && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reference</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-mono text-gray-900 dark:text-white">
                        {state.selectedPurchase.geonetReference}
                      </p>
                      <button
                        onClick={() => copyToClipboard(state.selectedPurchase.geonetReference, state.selectedPurchase._id)}
                        className="ml-2 text-red-500 hover:text-red-600"
                      >
                        {state.copiedRef === state.selectedPurchase._id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setState(prev => ({ ...prev, selectedPurchase: null }))}
                className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl font-medium transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}