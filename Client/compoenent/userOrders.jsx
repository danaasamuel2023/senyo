'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  Loader2, ChevronRight, ChevronDown, Calendar, Phone, Database, 
  CreditCard, Clock, Tag, Search, Filter, X, Info, Zap, Star,
  Flame, TrendingUp, Shield, AlertCircle, CheckCircle, Package
} from 'lucide-react';

// API constants
const GEONETTECH_BASE_URL = 'https://orders.geonettech.com/api/v1';
const API_KEY = '21|rkrw7bcoGYjK8irAOTMaZ8sc1LRHYcwjuZnZmMNw4a6196f1';
const API_BASE_URL = 'https://datahustle.onrender.com/api/v1';

// Format currency as GHS
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2
  }).format(amount);
};

// Network display names mapping
const networkNames = {
  'YELLO': 'MTN',
  'TELECEL': 'Telecel',
  'AT_PREMIUM': 'AirtelTigo Premium',
  'airteltigo': 'AirtelTigo',
  'at': 'AirtelTigo Standard'
};

// Network logo colors - Updated for better contrast
const networkColors = {
  'YELLO': 'bg-yellow-500 shadow-yellow-500/25',
  'TELECEL': 'bg-red-600 shadow-red-600/25',
  'AT_PREMIUM': 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25',
  'airteltigo': 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/25',
  'at': 'bg-blue-500 shadow-blue-500/25'
};

// Status badge color mapping - Modern red theme with gradients
const statusColors = {
  'pending': 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold shadow-md',
  'completed': 'bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-md',
  'failed': 'bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold shadow-md',
  'processing': 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-md',
  'refunded': 'bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold shadow-md',
  'waiting': 'bg-gradient-to-r from-gray-400 to-gray-600 text-white font-bold shadow-md',
  'unknown': 'bg-gradient-to-r from-gray-500 to-gray-700 text-white font-bold shadow-md',
  'error checking': 'bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-md'
};

// Status icons mapping
const statusIcons = {
  'pending': Clock,
  'completed': CheckCircle,
  'failed': X,
  'processing': Loader2,
  'refunded': CreditCard,
  'waiting': Clock
};

export default function DataPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [allPurchases, setAllPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterNetwork, setFilterNetwork] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState({});

  const router = useRouter();
  
  // Get userId from localStorage userData object
  const getUserId = () => {
    if (typeof window === 'undefined') return null;
    
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) return null;
    
    try {
      const userData = JSON.parse(userDataString);
      return userData.id;
    } catch (err) {
      console.error('Error parsing user data:', err);
      return null;
    }
  };

  useEffect(() => {
    const userId = getUserId();
    
    if (!userId) {
      router.push('/SignIn');
      return;
    }
    
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/data/purchase-history/${userId}`, {
          params: {
            page: pagination.currentPage,
            limit: 20
          }
        });
        
        if (response.data.status === 'success') {
          const purchasesData = response.data.data.purchases;
          setAllPurchases(purchasesData);
          setPurchases(purchasesData);
          setPagination({
            currentPage: response.data.data.pagination.currentPage,
            totalPages: response.data.data.pagination.totalPages
          });
        } else {
          throw new Error('Failed to fetch purchases');
        }
      } catch (err) {
        console.error('Error fetching purchases:', err);
        setError('Failed to load purchase history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [pagination.currentPage, router]);

  // Apply filters and search
  useEffect(() => {
    if (allPurchases.length > 0) {
      let filteredPurchases = [...allPurchases];
      
      if (filterStatus !== 'all') {
        filteredPurchases = filteredPurchases.filter(purchase => purchase.status === filterStatus);
      }
      
      if (filterNetwork !== 'all') {
        filteredPurchases = filteredPurchases.filter(purchase => purchase.network === filterNetwork);
      }
      
      if (searchTerm.trim() !== '') {
        const searchLower = searchTerm.toLowerCase();
        filteredPurchases = filteredPurchases.filter(purchase => 
          purchase.phoneNumber.toLowerCase().includes(searchLower) ||
          purchase.geonetReference?.toLowerCase().includes(searchLower) ||
          networkNames[purchase.network]?.toLowerCase().includes(searchLower) ||
          purchase.network.toLowerCase().includes(searchLower)
        );
      }
      
      setPurchases(filteredPurchases);
    }
  }, [searchTerm, filterStatus, filterNetwork, allPurchases]);

  // Function to check status of a specific order
  const checkOrderStatus = async (purchaseId, geonetReference, network, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    if (!geonetReference || network === 'at') {
      return;
    }
    
    setCheckingStatus(prev => ({ ...prev, [purchaseId]: true }));
    
    try {
      const statusResponse = await axios.get(
        `${GEONETTECH_BASE_URL}/order/${geonetReference}/status`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`
          }
        }
      );
      
      const geonetStatus = statusResponse.data.data.order.status;
      
      if (geonetStatus) {
        const updatedPurchases = allPurchases.map(purchase => {
          if (purchase._id === purchaseId) {
            return { ...purchase, status: geonetStatus };
          }
          return purchase;
        });
        
        setAllPurchases(updatedPurchases);
        
        const updatedFilteredPurchases = purchases.map(purchase => {
          if (purchase._id === purchaseId) {
            return { ...purchase, status: geonetStatus };
          }
          return purchase;
        });
        
        setPurchases(updatedFilteredPurchases);
        
        if (geonetStatus === 'completed') {
          try {
            await axios.post(`${API_BASE_URL}/data/update-status/${purchaseId}`, {
              status: 'completed'
            });
          } catch (updateError) {
            console.error('Failed to update status in backend:', updateError);
          }
        }
      } else {
        const updatedPurchases = allPurchases.map(purchase => {
          if (purchase._id === purchaseId) {
            return { ...purchase, status: "unknown" };
          }
          return purchase;
        });
        
        setAllPurchases(updatedPurchases);
        setPurchases(updatedPurchases.filter(p => purchases.some(fp => fp._id === p._id)));
      }
      
    } catch (error) {
      console.error(`Failed to fetch status for purchase ${purchaseId}:`, error);
      
      const updatedPurchases = allPurchases.map(purchase => {
        if (purchase._id === purchaseId) {
          return { ...purchase, status: "error checking" };
        }
        return purchase;
      });
      
      setAllPurchases(updatedPurchases);
      setPurchases(updatedPurchases.filter(p => purchases.some(fp => fp._id === p._id)));
      
    } finally {
      setCheckingStatus(prev => ({ ...prev, [purchaseId]: false }));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: newPage
      }));
      setExpandedId(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterNetwork('all');
    setShowFilters(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const userId = getUserId();
  if (!userId && typeof window !== 'undefined') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full overflow-hidden">
          <div className="py-16 px-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-2xl shadow-red-500/30">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Authentication Required</h3>
              <p className="mb-6 text-gray-600 dark:text-gray-400">Please sign in to view your purchase history</p>
              <button 
                onClick={() => router.push('/SignIn')}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold rounded-xl shadow-xl shadow-red-500/25 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Sign In Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const getNetworkInitials = (networkCode) => {
    const name = networkNames[networkCode] || networkCode;
    return name.substring(0, 2).toUpperCase();
  };

  const formatDataSize = (capacity) => {
    return capacity >= 1000 
      ? `${capacity / 1000}GB` 
      : `${capacity}MB`;
  };

  const getUniqueNetworks = () => {
    if (!allPurchases.length) return [];
    const networks = [...new Set(allPurchases.map(purchase => purchase.network))];
    return networks.sort();
  };

  const getUniqueStatuses = () => {
    if (!allPurchases.length) return [];
    const statuses = [...new Set(allPurchases.map(purchase => purchase.status))];
    return statuses.sort();
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Premium Header with Gradient */}
        <div className="relative border-b border-gray-200 dark:border-gray-700 p-6 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-transparent to-rose-600/20" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white">Purchase History</h2>
                <p className="text-red-100 text-sm mt-1">Track all your data transactions</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <Flame className="h-5 w-5 text-yellow-300 animate-pulse" />
              <span className="text-white/90 font-medium">Live Updates</span>
            </div>
          </div>
        </div>
        
        {/* Enhanced Search and Filter Bar */}
        {!loading && !error && purchases.length > 0 && (
          <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search input with modern styling */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by phone number or reference..."
                  className="block w-full pl-10 pr-10 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center group"
                  >
                    <X className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </button>
                )}
              </div>
              
              {/* Filter button with badge */}
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 font-medium"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
                {(filterStatus !== 'all' || filterNetwork !== 'all') && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    Active
                  </span>
                )}
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Reset button with animation */}
              {(searchTerm || filterStatus !== 'all' || filterNetwork !== 'all') && (
                <button 
                  onClick={resetFilters}
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/25 transition-all duration-300 font-medium transform hover:scale-105"
                >
                  <X className="h-5 w-5 mr-2" />
                  Clear All
                </button>
              )}
            </div>
            
            {/* Expanded filters with modern cards */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Status:
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="block w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  >
                    <option value="all">All Statuses</option>
                    {getUniqueStatuses().map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Network:
                  </label>
                  <select
                    value={filterNetwork}
                    onChange={(e) => setFilterNetwork(e.target.value)}
                    className="block w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  >
                    <option value="all">All Networks</option>
                    {getUniqueNetworks().map(network => (
                      <option key={network} value={network}>
                        {networkNames[network] || network}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Content area with enhanced styling */}
        <div className="p-4 md:p-6">
          {/* Loading state with animated dots */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-16">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-2xl shadow-red-500/30 animate-pulse">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              </div>
              <div className="flex space-x-2 mt-6">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-3 h-3 bg-red-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
              <span className="text-gray-900 dark:text-gray-100 font-semibold mt-4">Loading your purchases...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 p-6 rounded-xl flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-800 dark:text-red-200 font-bold mb-1">Error Loading Purchases</h3>
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                <Database className="h-12 w-12 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Purchases Found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchTerm || filterStatus !== 'all' || filterNetwork !== 'all' 
                  ? "Try adjusting your filters to see more results" 
                  : "You haven't made any data purchases yet"}
              </p>
              {searchTerm || filterStatus !== 'all' || filterNetwork !== 'all' ? (
                <button 
                  onClick={resetFilters}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl font-bold shadow-lg transition-all duration-300"
                >
                  Clear Filters
                </button>
              ) : null}
            </div>
          ) : (
            <>
              {/* Mobile-friendly card list with enhanced design */}
              <div className="block lg:hidden space-y-4">
                {purchases.map((purchase) => {
                  const StatusIcon = statusIcons[purchase.status] || Info;
                  return (
                    <div 
                      key={purchase._id} 
                      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                    >
                      {/* Card header with gradient accent */}
                      <div 
                        className="p-5 cursor-pointer bg-gradient-to-r from-gray-50 to-red-50/20 dark:from-gray-800 dark:to-red-900/10"
                        onClick={() => toggleExpand(purchase._id)}
                      >
                        {/* Network and data badge */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg ${networkColors[purchase.network] || 'bg-gray-500'}`}>
                              {getNetworkInitials(purchase.network)}
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {networkNames[purchase.network] || purchase.network}
                              </div>
                              <div className="font-black text-xl text-gray-900 dark:text-white">
                                {formatDataSize(purchase.capacity)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Amount</div>
                            <div className="font-bold text-lg text-red-600 dark:text-red-400">
                              {formatCurrency(purchase.price)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Phone and status row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-red-500" />
                            <span className="text-gray-900 dark:text-white font-semibold">
                              {purchase.phoneNumber}
                            </span>
                          </div>
                          
                          {/* Status badge or check button */}
                          {purchase.geonetReference && purchase.network !== 'at' ? (
                            <button
                              onClick={(e) => checkOrderStatus(purchase._id, purchase.geonetReference, purchase.network, e)}
                              disabled={checkingStatus[purchase._id]}
                              className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-xs font-bold rounded-full flex items-center shadow-md transition-all duration-300 transform hover:scale-105"
                            >
                              {checkingStatus[purchase._id] ? (
                                <>
                                  <Loader2 className="animate-spin h-3 w-3 mr-1" />
                                  Checking
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  Check Status
                                </>
                              )}
                            </button>
                          ) : (
                            <span className={`px-3 py-1.5 inline-flex items-center text-xs font-bold rounded-full ${statusColors[purchase.status] || 'bg-gray-500 text-white'}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {purchase.status || "Unknown"}
                            </span>
                          )}
                        </div>
                        
                        {/* Date and expand indicator */}
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(purchase.createdAt).split(',')[0]}
                          </div>
                          <div className="flex items-center text-red-500 font-medium">
                            {expandedId === purchase._id ? 'Hide' : 'View'} Details
                            {expandedId === purchase._id ? 
                              <ChevronDown className="h-4 w-4 ml-1" /> : 
                              <ChevronRight className="h-4 w-4 ml-1" />
                            }
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded details with premium design */}
                      {expandedId === purchase._id && (
                        <div className="px-5 pb-5 pt-2 border-t-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                          <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 p-4 rounded-xl">
                            <h4 className="font-bold text-red-800 dark:text-red-200 flex items-center mb-3">
                              <Info className="h-5 w-5 mr-2" />
                              Transaction Details
                            </h4>
                            
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between items-center py-2 border-b border-red-200/50 dark:border-red-800/30">
                                <span className="text-gray-600 dark:text-gray-400">Date & Time</span>
                                <span className="text-gray-900 dark:text-gray-100 font-semibold">
                                  {formatDate(purchase.createdAt)}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center py-2 border-b border-red-200/50 dark:border-red-800/30">
                                <span className="text-gray-600 dark:text-gray-400">Amount Paid</span>
                                <span className="text-red-600 dark:text-red-400 font-bold text-lg">
                                  {formatCurrency(purchase.price)}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center py-2 border-b border-red-200/50 dark:border-red-800/30">
                                <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
                                <span className="text-gray-900 dark:text-gray-100 font-semibold capitalize">
                                  {purchase.method || "Not specified"}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center py-2 border-b border-red-200/50 dark:border-red-800/30">
                                <span className="text-gray-600 dark:text-gray-400">Reference ID</span>
                                <span className="text-gray-900 dark:text-gray-100 font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                  {purchase.geonetReference || "N/A"}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600 dark:text-gray-400">Current Status</span>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusColors[purchase.status] || 'bg-gray-500 text-white'}`}>
                                  {purchase.status || "Unknown"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Desktop table view with modern design */}
              <div className="hidden lg:block">
                <div className="overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gradient-to-r from-gray-50 to-red-50/30 dark:from-gray-800 dark:to-red-950/20">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Network
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Data Package
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Phone Number
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Status/Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {purchases.map((purchase) => {
                        const StatusIcon = statusIcons[purchase.status] || Info;
                        return (
                          <tr key={purchase._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md ${networkColors[purchase.network] || 'bg-gray-500'}`}>
                                  {getNetworkInitials(purchase.network)}
                                </div>
                                <span className="ml-3 text-sm font-semibold text-gray-900 dark:text-white">
                                  {networkNames[purchase.network] || purchase.network}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-bold text-gray-900 dark:text-white">
                                <Database className="h-3 w-3 mr-1 text-red-500" />
                                {formatDataSize(purchase.capacity)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-900 dark:text-white font-medium">
                                <Phone className="h-4 w-4 mr-2 text-red-500" />
                                {purchase.phoneNumber}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                {formatDate(purchase.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                                {formatCurrency(purchase.price)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {purchase.geonetReference && purchase.network !== 'at' ? (
                                <button
                                  onClick={(e) => checkOrderStatus(purchase._id, purchase.geonetReference, purchase.network, e)}
                                  disabled={checkingStatus[purchase._id]}
                                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                  {checkingStatus[purchase._id] ? (
                                    <>
                                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                      Checking Status
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="-ml-1 mr-2 h-4 w-4" />
                                      {purchase.status ? `Update (${purchase.status})` : 'Check Status'}
                                    </>
                                  )}
                                </button>
                              ) : (
                                <span className={`px-3 py-1.5 inline-flex items-center text-xs font-bold rounded-full ${statusColors[purchase.status] || 'bg-gray-500 text-white'}`}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {purchase.status || "Unknown"}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Modern Pagination controls */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col md:flex-row justify-between items-center pt-6 mt-6 border-t-2 border-gray-200 dark:border-gray-700 space-y-4 md:space-y-0">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                      pagination.currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-red-500 hover:text-red-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-red-500'
                    }`}
                  >
                    <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                    Previous
                  </button>
                  
                  {/* Page numbers - Desktop */}
                  <div className="hidden md:flex items-center space-x-2">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === pagination.totalPages || 
                        Math.abs(page - pagination.currentPage) <= 1
                      )
                      .map((page, index, array) => {
                        if (index > 0 && page - array[index - 1] > 1) {
                          return (
                            <React.Fragment key={`ellipsis-${page}`}>
                              <span className="px-3 py-2 text-gray-500 dark:text-gray-400">...</span>
                              <button
                                onClick={() => handlePageChange(page)}
                                className={`min-w-[40px] px-3 py-2 rounded-lg font-bold transition-all duration-300 ${
                                  pagination.currentPage === page
                                    ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25'
                                    : 'text-gray-700 bg-white border-2 border-gray-300 hover:border-red-500 hover:text-red-600 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        }
                        
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`min-w-[40px] px-3 py-2 rounded-lg font-bold transition-all duration-300 ${
                              pagination.currentPage === page
                                ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25'
                                : 'text-gray-700 bg-white border-2 border-gray-300 hover:border-red-500 hover:text-red-600 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                  </div>
                  
                  {/* Mobile page indicator */}
                  <div className="flex items-center space-x-2 md:hidden">
                    <span className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg font-bold shadow-lg">
                      Page {pagination.currentPage}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">of {pagination.totalPages}</span>
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                      pagination.currentPage === pagination.totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-red-500 hover:text-red-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-red-500'
                    }`}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}