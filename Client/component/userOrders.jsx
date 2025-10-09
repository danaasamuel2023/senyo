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
const GEONETTECH_BASE_URL = 'https://unlimitedata.orders.geonettech.com/api/v1';
const API_KEY = '21|rkrw7bcoGYjK8irAOTMaZ8sc1LRHYcwjuZnZmMNw4a6196f1';
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'https://unlimitedata.onrender.com'}/api/v1`;

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
  'YELLO': 'bg-[#FFCC08] shadow-yellow-500/25',
  'TELECEL': 'bg-red-600 shadow-red-600/25',
  'AT_PREMIUM': 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25',
  'airteltigo': 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/25',
  'at': 'bg-blue-500 shadow-blue-500/25'
};

// Status badge color mapping - Yellow and Black theme
const statusColors = {
  'pending': 'bg-gradient-to-r from-yellow-400 to-[#FFCC08] text-black font-bold shadow-md',
  'completed': 'bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-md',
  'failed': 'bg-gradient-to-r from-gray-800 to-black text-white font-bold shadow-md',
  'processing': 'bg-gradient-to-r from-[#FFCC08] to-yellow-500 text-black font-bold shadow-md',
  'refunded': 'bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold shadow-md',
  'waiting': 'bg-gradient-to-r from-gray-600 to-gray-800 text-white font-bold shadow-md',
  'unknown': 'bg-gradient-to-r from-gray-500 to-gray-700 text-white font-bold shadow-md',
  'error checking': 'bg-gradient-to-r from-orange-500 to-[#FFCC08] text-black font-bold shadow-md'
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
      <div className="container mx-auto px-3 py-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full overflow-hidden">
          <div className="py-12 px-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#FFCC08] to-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/25">
                <Shield className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Authentication Required</h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Please sign in to view your purchase history</p>
              <button 
                onClick={() => router.push('/SignIn')}
                className="px-6 py-2.5 bg-gradient-to-r from-[#FFCC08] to-yellow-500 hover:from-yellow-500 hover:to-[#FFCC08] text-black font-bold rounded-lg shadow-lg shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105"
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
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
      <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl w-full overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Premium Header - MOBILE OPTIMIZED */}
        <div className="relative border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-gradient-to-r from-[#FFCC08] via-yellow-400 to-[#FFCC08] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-transparent to-[#FFCC08]/20" />
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-black/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-black/10 rounded-full blur-2xl" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 sm:p-3 bg-black/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-black">Purchase History</h2>
                <p className="text-black/80 text-xs sm:text-sm mt-0.5">Track your data transactions</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-black animate-pulse" />
              <span className="text-black/90 font-medium text-sm">Live</span>
            </div>
          </div>
        </div>
        
        {/* Search and Filter Bar - MOBILE OPTIMIZED */}
        {!loading && !error && purchases.length > 0 && (
          <div className="p-3 sm:p-4 md:p-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-2 sm:gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by phone or reference..."
                  className="block w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-3 text-sm border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08] transition-all"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center group"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-[#FFCC08] transition-colors" />
                  </button>
                )}
              </div>
              
              <div className="flex gap-2">
                {/* Filter button */}
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-center px-4 py-2 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm font-medium"
                >
                  <Filter className="h-4 w-4 mr-1.5" />
                  Filters
                  {(filterStatus !== 'all' || filterNetwork !== 'all') && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-[#FFCC08] text-black text-xs rounded-full">
                      Active
                    </span>
                  )}
                  <ChevronDown className={`ml-1.5 h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Reset button */}
                {(searchTerm || filterStatus !== 'all' || filterNetwork !== 'all') && (
                  <button 
                    onClick={resetFilters}
                    className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-[#FFCC08] to-yellow-500 text-black rounded-lg hover:from-yellow-500 hover:to-[#FFCC08] shadow-md shadow-yellow-500/25 transition-all text-sm font-bold"
                  >
                    <X className="h-4 w-4 mr-1.5" />
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            {/* Expanded filters */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Status:
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="block w-full px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08]"
                  >
                    <option value="all">All Statuses</option>
                    {getUniqueStatuses().map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Network:
                  </label>
                  <select
                    value={filterNetwork}
                    onChange={(e) => setFilterNetwork(e.target.value)}
                    className="block w-full px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08]"
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
        
        {/* Content area - MOBILE OPTIMIZED */}
        <div className="p-3 sm:p-4 md:p-6">
          {/* Loading state */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-12 sm:py-16">
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#FFCC08] to-yellow-500 flex items-center justify-center shadow-xl shadow-yellow-500/25 animate-pulse">
                  <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-black animate-spin" />
                </div>
              </div>
              <div className="flex space-x-1.5 mt-4">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-2 h-2 bg-[#FFCC08] rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
              <span className="text-gray-900 dark:text-gray-100 font-semibold mt-3 text-sm">Loading purchases...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 p-4 rounded-lg flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-800 dark:text-red-200 font-bold mb-1 text-sm">Error Loading</h3>
                <p className="text-red-700 dark:text-red-300 text-xs">{error}</p>
              </div>
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                <Database className="h-10 w-10 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Purchases Found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm || filterStatus !== 'all' || filterNetwork !== 'all' 
                  ? "Try adjusting your filters" 
                  : "You haven't made any purchases yet"}
              </p>
              {searchTerm || filterStatus !== 'all' || filterNetwork !== 'all' ? (
                <button 
                  onClick={resetFilters}
                  className="px-5 py-2 bg-gradient-to-r from-[#FFCC08] to-yellow-500 hover:from-yellow-500 hover:to-[#FFCC08] text-black rounded-lg font-bold shadow-md transition-all text-sm"
                >
                  Clear Filters
                </button>
              ) : null}
            </div>
          ) : (
            <>
              {/* Mobile card list - OPTIMIZED */}
              <div className="space-y-3 sm:space-y-4">
                {purchases.map((purchase) => {
                  const StatusIcon = statusIcons[purchase.status] || Info;
                  return (
                    <div 
                      key={purchase._id} 
                      className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                    >
                      {/* Card header */}
                      <div 
                        className="p-3 sm:p-4 cursor-pointer bg-gradient-to-r from-gray-50 to-yellow-50/20 dark:from-gray-800 dark:to-yellow-900/10"
                        onClick={() => toggleExpand(purchase._id)}
                      >
                        {/* Network and data */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold shadow-md ${networkColors[purchase.network] || 'bg-gray-500'}`}>
                              <span className="text-xs sm:text-sm">{getNetworkInitials(purchase.network)}</span>
                            </div>
                            <div>
                              <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {networkNames[purchase.network] || purchase.network}
                              </div>
                              <div className="font-black text-lg sm:text-xl text-gray-900 dark:text-white">
                                {formatDataSize(purchase.capacity)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Amount</div>
                            <div className="font-bold text-base sm:text-lg text-[#FFCC08]">
                              {formatCurrency(purchase.price)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Phone and status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-[#FFCC08]" />
                            <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-semibold">
                              {purchase.phoneNumber}
                            </span>
                          </div>
                          
                          {/* Status badge or check button */}
                          {purchase.geonetReference && purchase.network !== 'at' ? (
                            <button
                              onClick={(e) => checkOrderStatus(purchase._id, purchase.geonetReference, purchase.network, e)}
                              disabled={checkingStatus[purchase._id]}
                              className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-[#FFCC08] to-yellow-500 hover:from-yellow-500 hover:to-[#FFCC08] text-black text-[10px] sm:text-xs font-bold rounded-full flex items-center shadow-md transition-all"
                            >
                              {checkingStatus[purchase._id] ? (
                                <>
                                  <Loader2 className="animate-spin h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                  <span className="hidden xs:inline">Checking</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                  <span className="hidden xs:inline">Check</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <span className={`px-2 sm:px-3 py-1 inline-flex items-center text-[10px] sm:text-xs font-bold rounded-full ${statusColors[purchase.status] || 'bg-gray-500 text-white'}`}>
                              <StatusIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                              {purchase.status || "Unknown"}
                            </span>
                          )}
                        </div>
                        
                        {/* Date and expand */}
                        <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center">
                            <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                            {formatDate(purchase.createdAt).split(',')[0]}
                          </div>
                          <div className="flex items-center text-[#FFCC08] font-medium">
                            {expandedId === purchase._id ? 'Hide' : 'View'} Details
                            {expandedId === purchase._id ? 
                              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1" /> : 
                              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                            }
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded details */}
                      {expandedId === purchase._id && (
                        <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                          <div className="bg-gradient-to-r from-yellow-50 to-[#FFCC08]/10 dark:from-yellow-900/20 dark:to-[#FFCC08]/10 p-3 rounded-lg">
                            <h4 className="font-bold text-[#FFCC08] dark:text-yellow-400 flex items-center mb-2 text-sm">
                              <Info className="h-4 w-4 mr-1.5" />
                              Transaction Details
                            </h4>
                            
                            <div className="space-y-2 text-xs sm:text-sm">
                              <div className="flex justify-between items-center py-1.5 border-b border-yellow-200/50 dark:border-yellow-800/30">
                                <span className="text-gray-600 dark:text-gray-400">Date & Time</span>
                                <span className="text-gray-900 dark:text-gray-100 font-semibold">
                                  {formatDate(purchase.createdAt)}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center py-1.5 border-b border-yellow-200/50 dark:border-yellow-800/30">
                                <span className="text-gray-600 dark:text-gray-400">Amount Paid</span>
                                <span className="text-[#FFCC08] dark:text-yellow-400 font-bold">
                                  {formatCurrency(purchase.price)}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center py-1.5 border-b border-yellow-200/50 dark:border-yellow-800/30">
                                <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
                                <span className="text-gray-900 dark:text-gray-100 font-semibold capitalize">
                                  {purchase.method || "Not specified"}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center py-1.5 border-b border-yellow-200/50 dark:border-yellow-800/30">
                                <span className="text-gray-600 dark:text-gray-400">Reference ID</span>
                                <span className="text-gray-900 dark:text-gray-100 font-mono text-[10px] sm:text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                  {purchase.geonetReference || "N/A"}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center py-1.5">
                                <span className="text-gray-600 dark:text-gray-400">Status</span>
                                <span className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded-full ${statusColors[purchase.status] || 'bg-gray-500 text-white'}`}>
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
              
              {/* Pagination - MOBILE OPTIMIZED */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center pt-4 sm:pt-6 mt-4 sm:mt-6 border-t-2 border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-0">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      pagination.currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#FFCC08] hover:text-[#FFCC08] dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <ChevronRight className="h-3.5 w-3.5 mr-1.5 rotate-180" />
                    Previous
                  </button>
                  
                  {/* Page indicator */}
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1.5 bg-gradient-to-r from-[#FFCC08] to-yellow-500 text-black rounded-lg font-bold shadow-md text-sm">
                      Page {pagination.currentPage}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">of {pagination.totalPages}</span>
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      pagination.currentPage === pagination.totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#FFCC08] hover:text-[#FFCC08] dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
                    }`}
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5 ml-1.5" />
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