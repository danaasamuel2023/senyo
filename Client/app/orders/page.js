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
  capacity >= 1000 ? `${capacity / 1000}GB` : `${capacity}MB`;

const formatCountdown = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Network Configuration - YELLOW & BLACK THEME
const NETWORK_CONFIG = {
  YELLO: {
    name: 'MTN',
    gradient: 'from-[#FFCC08] to-yellow-500',
    lightBg: 'bg-yellow-50',
    darkBg: 'bg-yellow-900/20',
    icon: '📱',
    color: 'yellow'
  },
  TELECEL: {
    name: 'Telecel',
    gradient: 'from-yellow-400 to-[#FFCC08]',
    lightBg: 'bg-yellow-50',
    darkBg: 'bg-yellow-900/20',
    icon: '📡',
    color: 'yellow'
  },
  AT_PREMIUM: {
    name: 'AirtelTigo Premium',
    gradient: 'from-[#FFCC08] to-yellow-600',
    lightBg: 'bg-yellow-50',
    darkBg: 'bg-yellow-900/20',
    icon: '🌟',
    color: 'yellow'
  },
  airteltigo: {
    name: 'AirtelTigo',
    gradient: 'from-yellow-500 to-[#FFCC08]',
    lightBg: 'bg-yellow-50',
    darkBg: 'bg-yellow-900/20',
    icon: '📶',
    color: 'yellow'
  },
  at: {
    name: 'AirtelTigo Standard',
    gradient: 'from-[#FFCC08] to-yellow-500',
    lightBg: 'bg-yellow-50',
    darkBg: 'bg-yellow-900/20',
    icon: '📞',
    color: 'yellow'
  }
};

// Status Configuration - YELLOW & BLACK
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
    gradient: 'from-[#FFCC08] to-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-[#FFCC08]',
    text: 'text-yellow-700 dark:text-yellow-400',
    icon: CheckCircle,
    animation: ''
  },
  failed: {
    gradient: 'from-gray-800 to-black',
    bg: 'bg-gray-100 dark:bg-gray-900/50',
    border: 'border-gray-400',
    text: 'text-gray-800 dark:text-gray-300',
    icon: X,
    animation: ''
  },
  processing: {
    gradient: 'from-yellow-400 to-[#FFCC08]',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-300',
    text: 'text-yellow-700 dark:text-yellow-400',
    icon: Activity,
    animation: 'animate-spin'
  },
  refunded: {
    gradient: 'from-yellow-400 to-yellow-600',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-300',
    text: 'text-yellow-700 dark:text-yellow-400',
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

// Components - MOBILE OPTIMIZED
const StatCard = ({ title, value, icon: Icon, color, subValue }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className={`${color} backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] sm:text-xs text-white/80 uppercase tracking-wider font-medium">{title}</p>
        <p className="text-lg sm:text-2xl font-bold text-white mt-0.5 sm:mt-1">{value}</p>
        {subValue && <p className="text-[10px] sm:text-xs text-white/60 mt-0.5 sm:mt-1">{subValue}</p>}
      </div>
      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white/30" />
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
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className="relative bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#FFCC08]/30 dark:border-yellow-900/50 hover:border-[#FFCC08] dark:hover:border-yellow-700 transition-all duration-300 cursor-pointer group shadow-md hover:shadow-lg"
    >
      {/* Yellow accent bar */}
      <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${network.gradient} rounded-l-xl sm:rounded-l-2xl`} />
      
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-start space-x-3 sm:space-x-4">
          {/* Network icon */}
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${network.gradient} flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg group-hover:scale-110 transition-transform`}>
            <Flame className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1.5 sm:mb-2">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                {formatDataSize(purchase.capacity)} Data
              </h3>
              <span className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${status.bg} ${status.border} ${status.text} border flex-shrink-0`}>
                <StatusIcon className={`w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 ${status.animation}`} />
                <span className="hidden xs:inline">{purchase.status}</span>
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-[#FFCC08]" />
                <span className="truncate">{purchase.phoneNumber}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-[#FFCC08]" />
                <span className="truncate">{network.name}</span>
              </div>
              
              <div className="hidden sm:flex items-center space-x-1">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#FFCC08]" />
                <span>{formatDate(purchase.createdAt)}</span>
              </div>
            </div>
            
            {purchase.geonetReference && (
              <div className="flex items-center space-x-1 mt-1.5 sm:mt-2">
                <span className="text-[10px] sm:text-xs text-gray-500">Ref:</span>
                <code className="text-[10px] sm:text-xs bg-yellow-50 dark:bg-yellow-900/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[#FFCC08] truncate max-w-[120px] sm:max-w-none">
                  {purchase.geonetReference}
                </code>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy(purchase.geonetReference, purchase._id);
                  }}
                  className="ml-1 text-gray-500 hover:text-[#FFCC08] transition-colors"
                >
                  {copiedRef === purchase._id ? (
                    <Check className="w-3 h-3 text-[#FFCC08]" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(purchase.price)}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Amount paid</p>
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
              className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#FFCC08] hover:bg-yellow-500 text-black rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all disabled:opacity-50 shadow-md"
            >
              <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${checkingStatus[purchase._id] ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">{checkingStatus[purchase._id] ? 'Checking...' : 'Check'}</span>
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
          `${API_CONFIG.Unlimiteddata.BASE_URL}/data/purchase-history/${userId}`,
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
      <div className="min-h-screen bg-gradient-to-br from-white via-yellow-50 to-white dark:from-gray-900 dark:via-yellow-950 dark:to-gray-900 flex items-center justify-center p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border border-[#FFCC08]/30 dark:border-yellow-900 text-center max-w-md w-full"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#FFCC08] to-yellow-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
            <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-black" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">UnlimitedData GH</h2>
          <p className="mb-4 sm:mb-6 text-sm sm:text-base text-gray-600 dark:text-gray-400">You need to be logged in to view your purchases.</p>
          <button 
            onClick={() => router.push('/SignIn')}
            className="bg-gradient-to-r from-[#FFCC08] to-yellow-500 hover:from-yellow-500 hover:to-[#FFCC08] text-black font-bold py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl sm:rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 w-full text-sm sm:text-base"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-yellow-50 to-white dark:from-gray-900 dark:via-yellow-950 dark:to-gray-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-gradient-to-br from-[#FFCC08]/20 to-yellow-400/20 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-20 -left-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-gradient-to-br from-yellow-400/20 to-[#FFCC08]/20 blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header - MOBILE OPTIMIZED */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-8"
        >
          <div className="bg-white dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#FFCC08]/30 dark:border-yellow-900/50 shadow-xl sm:shadow-2xl">
            <div className="flex flex-col gap-3 sm:gap-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#FFCC08] to-yellow-500 flex items-center justify-center shadow-lg">
                  <Database className="w-6 h-6 sm:w-7 sm:h-7 text-black" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">Purchase History</h1>
                  <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 truncate">Track your data purchases</p>
                </div>
              </div>
              
              {/* Auto-update timer - MOBILE OPTIMIZED */}
              {!state.loading && state.purchases.length > 0 && (
                <div className="flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/20 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 text-[#FFCC08] ${Object.keys(state.checkingStatus).length > 0 ? 'animate-spin' : ''}`} />
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      Next: <span className="font-mono text-[#FFCC08]">{formatCountdown(state.nextUpdateIn)}</span>
                    </span>
                  </div>
                  <button
                    onClick={batchCheckStatuses}
                    disabled={Object.keys(state.checkingStatus).length > 0}
                    className="text-[10px] sm:text-xs bg-[#FFCC08] hover:bg-yellow-500 text-black px-2 sm:px-3 py-1 rounded-md sm:rounded-lg transition-colors font-medium"
                  >
                    Update
                  </button>
                </div>
              )}
            </div>
            
            {/* Stats Grid - MOBILE OPTIMIZED */}
            {!state.loading && !state.error && state.purchases.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mt-4 sm:mt-6">
                <StatCard title="Total" value={stats.total} icon={Database} color="bg-white/80 dark:bg-gray-900/50" />
                <StatCard title="Done" value={stats.completed} icon={CheckCircle} color="bg-[#FFCC08]/20" />
                <StatCard title="Pending" value={stats.pending} icon={Clock} color="bg-gray-500/20" />
                <StatCard title="Failed" value={stats.failed} icon={X} color="bg-gray-700/20" />
                <StatCard title="Total" value={formatCurrency(stats.totalAmount)} icon={TrendingUp} color="bg-yellow-500/20" />
                <StatCard title="Today" value={formatCurrency(stats.todayAmount)} icon={Calendar} color="bg-[#FFCC08]/30" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Main Content - MOBILE OPTIMIZED */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-[#FFCC08]/30 dark:border-yellow-900/50 overflow-hidden shadow-xl sm:shadow-2xl"
        >
          {/* Search and Filters - MOBILE OPTIMIZED */}
          {!state.loading && !state.error && state.purchases.length > 0 && (
            <div className="p-3 sm:p-6 border-b border-yellow-100 dark:border-yellow-900/30">
              <div className="flex flex-col gap-2 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    value={state.searchTerm}
                    onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                    placeholder="Search purchases..."
                    className="w-full pl-9 sm:pl-12 pr-9 sm:pr-10 py-2 sm:py-3 text-sm sm:text-base bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent transition-all"
                  />
                  {state.searchTerm && (
                    <button
                      onClick={() => setState(prev => ({ ...prev, searchTerm: '' }))}
                      className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" />
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => setState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
                  className={`flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-medium transition-all text-sm sm:text-base ${
                    state.showFilters 
                      ? 'bg-[#FFCC08] text-black' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4 p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl sm:rounded-2xl">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Status</label>
                        <select
                          value={state.filterStatus}
                          onChange={(e) => setState(prev => ({ ...prev, filterStatus: e.target.value }))}
                          className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
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
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Network</label>
                        <select
                          value={state.filterNetwork}
                          onChange={(e) => setState(prev => ({ ...prev, filterNetwork: e.target.value }))}
                          className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
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
          
          {/* Content Area - MOBILE OPTIMIZED */}
          <div className="p-3 sm:p-6">
            {state.loading ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-yellow-200 border-t-[#FFCC08] mb-4"
                />
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading purchases...</p>
              </div>
            ) : state.error ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-yellow-50 dark:bg-yellow-900/20 border border-[#FFCC08] dark:border-yellow-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-yellow-700 dark:text-yellow-400"
              >
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 mb-2" />
                <p className="text-sm sm:text-base">{state.error}</p>
              </motion.div>
            ) : state.purchases.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 sm:py-20"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Database className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">No purchases found</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                  {state.searchTerm || state.filterStatus !== 'all' || state.filterNetwork !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Start your journey today!'}
                </p>
                {(state.searchTerm || state.filterStatus !== 'all' || state.filterNetwork !== 'all') && (
                  <button
                    onClick={() => setState(prev => ({ 
                      ...prev, 
                      searchTerm: '', 
                      filterStatus: 'all', 
                      filterNetwork: 'all' 
                    }))}
                    className="bg-[#FFCC08] hover:bg-yellow-500 text-black px-5 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-medium transition-all text-sm sm:text-base"
                  >
                    Clear Filters
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <AnimatePresence>
                  {state.purchases.map((purchase) => (
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
          
          {/* Footer - MOBILE OPTIMIZED */}
          {!state.loading && !state.error && (
            <div className="border-t border-yellow-100 dark:border-yellow-900/30 p-3 sm:p-6">
              <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-[#FFCC08]" />
                <span>Powered by UnlimitedDataGH</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Purchase Detail Modal - MOBILE OPTIMIZED */}
      <AnimatePresence>
        {state.selectedPurchase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setState(prev => ({ ...prev, selectedPurchase: null }))}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#FFCC08] dark:border-yellow-900 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Purchase Details</h3>
              
              <div className="space-y-3 sm:space-y-4">
                {[
                  { label: 'Data Package', value: formatDataSize(state.selectedPurchase.capacity) },
                  { label: 'Phone Number', value: state.selectedPurchase.phoneNumber },
                  { label: 'Network', value: NETWORK_CONFIG[state.selectedPurchase.network]?.name || state.selectedPurchase.network },
                  { label: 'Status', value: state.selectedPurchase.status, capitalize: true },
                  { label: 'Amount Paid', value: formatCurrency(state.selectedPurchase.price) },
                  { label: 'Purchase Date', value: formatDate(state.selectedPurchase.createdAt) }
                ].map(({ label, value, capitalize }) => (
                  <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
                    <p className={`text-base sm:text-lg font-bold text-gray-900 dark:text-white ${capitalize ? 'capitalize' : ''}`}>
                      {value}
                    </p>
                  </div>
                ))}
                
                {state.selectedPurchase.geonetReference && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Reference</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm font-mono text-gray-900 dark:text-white truncate mr-2">
                        {state.selectedPurchase.geonetReference}
                      </p>
                      <button
                        onClick={() => copyToClipboard(state.selectedPurchase.geonetReference, state.selectedPurchase._id)}
                        className="ml-2 text-[#FFCC08] hover:text-yellow-600 flex-shrink-0"
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
                className="mt-4 sm:mt-6 w-full bg-[#FFCC08] hover:bg-yellow-500 text-black py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-medium transition-colors text-sm sm:text-base"
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