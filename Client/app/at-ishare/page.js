'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap, Star, AlertTriangle, CheckCircle, X, Info, Shield, Phone, CreditCard, 
  ArrowRight, Wifi, Signal, Smartphone, ArrowUpDown, ArrowUp, ArrowDown,
  Search, Filter, Grid, List, SortAsc, SortDesc, Package, TrendingUp,
  DollarSign, Calendar, Clock, Loader2, Eye, ShoppingCart, Heart
} from 'lucide-react';

// API Configuration
const getApiEndpoint = (path) => {
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const baseUrl = isLocalhost ? 'http://localhost:5001' : 'https://unlimitedata.onrender.com';
  return `${baseUrl}${path}`;
};

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`p-4 rounded-2xl shadow-2xl flex items-center backdrop-blur-xl border-2 max-w-sm ${
        type === 'success' 
          ? 'bg-green-500 text-white border-green-400' 
          : type === 'error' 
            ? 'bg-red-500 text-white border-red-400' 
            : 'bg-[#FFCC08] text-black border-yellow-500'
      }`}>
        <div className="mr-3">
          {type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : type === 'error' ? (
            <X className="h-5 w-5" />
          ) : (
            <Info className="h-5 w-5" />
          )}
        </div>
        <div className="flex-grow">
          <p className="font-semibold">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 hover:scale-110 transition-transform">
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

// Enhanced AT Package Card with modern design
const ATPackageCard = ({ bundle, onClick, disabled, isGridView = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  if (!isGridView) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="flex items-center p-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#ED1C24] to-[#0066CC] rounded-xl flex items-center justify-center mr-4">
            <span className="font-black text-white text-xl">{bundle.capacity}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">{bundle.capacity}GB Data</h3>
            <p className="text-gray-600 text-sm">AirtelTigo Premium • No Expiry</p>
          </div>
          <div className="text-right mr-4">
            <p className="text-2xl font-bold text-[#ED1C24]">₵{bundle.price}</p>
            <p className="text-gray-500 text-sm">₵{(bundle.price / bundle.capacity).toFixed(2)}/GB</p>
          </div>
          <button
            onClick={() => onClick(bundle)}
            disabled={disabled}
            className="px-6 py-2 bg-gradient-to-r from-[#ED1C24] to-[#0066CC] text-white rounded-xl hover:from-red-600 hover:to-blue-600 transition-all font-bold disabled:opacity-50"
          >
            Buy Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onClick={() => !disabled && onClick(bundle)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with AT branding */}
      <div className="bg-gradient-to-br from-[#ED1C24] to-[#0066CC] p-4 relative overflow-hidden">
        <div className="absolute top-2 right-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Star className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2">
            <span className="font-black text-white text-2xl">{bundle.capacity}</span>
          </div>
          <h3 className="text-white font-bold text-lg">{bundle.capacity}GB</h3>
          <p className="text-white/80 text-sm">AT Premium</p>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Price</span>
            <span className="text-2xl font-bold text-gray-900">₵{bundle.price}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Per GB</span>
            <span className="text-gray-700 font-semibold">₵{(bundle.price / bundle.capacity).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Validity</span>
            <span className="text-green-600 font-semibold">No Expiry</span>
          </div>
          
          <div className="pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick(bundle);
              }}
              disabled={disabled}
              className="w-full py-2.5 bg-gradient-to-r from-[#ED1C24] to-[#0066CC] text-white rounded-xl hover:from-red-600 hover:to-blue-600 transition-all font-bold disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Hover overlay */}
      {isHovered && !disabled && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#ED1C24]/10 to-[#0066CC]/10 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl p-3 shadow-lg">
            <Eye className="w-6 h-6 text-[#ED1C24]" />
          </div>
        </div>
      )}
      
      {!bundle.inStock && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-white font-bold bg-red-500 px-3 py-1 rounded-lg">Out of Stock</div>
        </div>
      )}
    </div>
  );
};

// Purchase Modal Component
const PurchaseModal = ({ isOpen, onClose, bundle, phoneNumber, setPhoneNumber, onPurchase, error, isLoading }) => {
  if (!isOpen || !bundle) return null;

  const handlePhoneNumberChange = (e) => {
    let formatted = e.target.value.replace(/\D/g, '');
    
    if (formatted.length > 10) {
      formatted = formatted.substring(0, 10);
    }
    
    setPhoneNumber(formatted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
        {/* Modal header */}
        <div className="bg-gradient-to-r from-[#ED1C24] to-[#0066CC] px-6 py-5 rounded-t-3xl flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Signal className="w-6 h-6 mr-2" />
            Purchase {bundle.capacity}GB
          </h3>
          <button onClick={onClose} className="text-white hover:text-white/70 p-2 rounded-xl hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Modal content */}
        <div className="px-6 py-6">
          {/* Bundle Info */}
          <div className="mb-5">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#ED1C24] to-[#0066CC] rounded-2xl flex flex-col items-center justify-center shadow-lg">
              <span className="font-black text-white text-3xl">{bundle.capacity}</span>
              <span className="font-bold text-white text-xs -mt-1">GB</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-blue-50 rounded-2xl p-5 mb-5 border-2 border-red-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-medium">Data Bundle:</span>
              <span className="text-gray-900 font-bold text-lg">{bundle.capacity}GB</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-medium">Duration:</span>
              <span className="text-green-600 font-bold">No Expiry</span>
            </div>
            <div className="flex justify-between items-center border-t-2 border-red-200 pt-3">
              <span className="text-gray-900 font-bold">Total Price:</span>
              <span className="text-gray-900 font-bold text-xl bg-gradient-to-r from-[#ED1C24] to-[#0066CC] text-white px-3 py-1 rounded-lg">₵{bundle.price}</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-5 p-4 rounded-2xl flex items-start bg-red-50 border-2 border-red-200">
              <X className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-red-700 text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Phone Number Form */}
          <div className="mb-5">
            <label className="block text-sm font-bold mb-3 text-gray-800">
              Enter AirtelTigo Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="w-5 h-5 text-[#ED1C24]" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                className="pl-12 pr-4 py-4 block w-full rounded-2xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-3 focus:ring-[#ED1C24] focus:border-[#ED1C24] font-semibold text-lg transition-all"
                placeholder="024XXXXXXX or 054XXXXXXX"
                required
                autoFocus
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">Format: 024, 054, 055, 057, 026, or 027 followed by 7 digits</p>
          </div>

          {/* Warning */}
          <div className="mb-5 p-4 bg-gradient-to-br from-red-50 to-blue-50 border-2 border-red-200 rounded-2xl">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-[#ED1C24] mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-800 text-sm font-medium">
                  <strong>Important:</strong> Verify your number carefully. No refunds for wrong numbers.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all text-base"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onPurchase}
              disabled={isLoading || !phoneNumber || phoneNumber.length !== 10}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-[#ED1C24] to-[#0066CC] hover:from-red-600 hover:to-blue-600 text-white font-bold rounded-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Purchase Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading Overlay
const LoadingOverlay = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-xs w-full mx-auto text-center shadow-2xl">
        <div className="flex justify-center mb-5">
          <div className="relative w-16 h-16">
            <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>
            <div className="absolute top-0 w-16 h-16 rounded-full border-4 border-transparent border-t-[#ED1C24] animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#ED1C24] to-[#0066CC] animate-pulse flex items-center justify-center">
              <Signal className="w-6 h-6 text-white animate-bounce" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <h4 className="text-xl font-bold text-gray-900 mb-2">Processing...</h4>
        <p className="text-gray-600">Please wait while we process your order</p>
      </div>
    </div>
  );
};

const ATBundleCards = () => {
  const router = useRouter();
  
  // State Management
  const [selectedBundleIndex, setSelectedBundleIndex] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [globalMessage, setGlobalMessage] = useState({ text: '', type: '' });
  const [bundleMessages, setBundleMessages] = useState({});
  const [userData, setUserData] = useState(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('capacity'); // capacity, price, value
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [error, setError] = useState('');
  
  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });

  const bundles = [
    { capacity: '1', mb: '1000', price: '3.9', network: 'AT_PREMIUM', inStock: true },
    { capacity: '2', mb: '2000', price: '8.30', network: 'AT_PREMIUM', inStock: true },
    { capacity: '3', mb: '3000', price: '13.20', network: 'AT_PREMIUM', inStock: true },
    { capacity: '4', mb: '4000', price: '16.00', network: 'AT_PREMIUM', inStock: true },
    { capacity: '5', mb: '5000', price: '19.00', network: 'AT_PREMIUM', inStock: true },
    { capacity: '6', mb: '6000', price: '23.00', network: 'AT_PREMIUM', inStock: true },
    { capacity: '8', mb: '8000', price: '30.00', network: 'AT_PREMIUM', inStock: true },
    { capacity: '10', mb: '10000', price: '37.50', network: 'AT_PREMIUM', inStock: true },
    { capacity: '12', mb: '12000', price: '42.50', network: 'AT_PREMIUM', inStock: true },
    { capacity: '15', mb: '15000', price: '54.50', network: 'AT_PREMIUM', inStock: true },
    { capacity: '25', mb: '25000', price: '87.00', network: 'AT_PREMIUM', inStock: true },
    { capacity: '30', mb: '30000', price: '110.00', network: 'AT_PREMIUM', inStock: true },
    { capacity: '40', mb: '40000', price: '145.00', network: 'AT_PREMIUM', inStock: true },
    { capacity: '50', mb: '50000', price: '180.00', network: 'AT_PREMIUM', inStock: true }
  ];

  // Get user data from localStorage on component mount
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  // Add CSS for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      .animate-slide-in {
        animation: slideIn 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Filtered and sorted bundles
  const filteredAndSortedBundles = useMemo(() => {
    let filtered = bundles.filter(bundle => 
      bundle.capacity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bundle.price.includes(searchTerm) ||
      bundle.mb.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort bundles
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'capacity':
          aValue = parseInt(a.capacity);
          bValue = parseInt(b.capacity);
          break;
        case 'price':
          aValue = parseFloat(a.price);
          bValue = parseFloat(b.price);
          break;
        case 'value':
          aValue = parseFloat(a.price) / parseInt(a.capacity);
          bValue = parseFloat(b.price) / parseInt(b.capacity);
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return filtered;
  }, [bundles, searchTerm, sortBy, sortOrder]);

  // Function to validate phone number format for Airtel Tigo
  const validatePhoneNumber = (number) => {
    const cleanNumber = number.replace(/[\s-]/g, '');
    const airtelTigoPrefixes = ['024', '054', '055', '057','026','027'];
    return cleanNumber.length === 10 && 
           airtelTigoPrefixes.some(prefix => cleanNumber.startsWith(prefix));
  };
  
  // Function to show toast
  const showToast = (message, type = 'success') => {
    setToast({
      visible: true,
      message,
      type
    });
  };

  // Function to hide toast
  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      visible: false
    }));
  };

  // Handle bundle selection - opens purchase modal
  const handleBundleSelect = (bundle) => {
    if (!bundle.inStock) {
      showToast('This bundle is currently out of stock', 'error');
      return;
    }

    if (!userData || !userData.id) {
      showToast('Please login to continue', 'error');
      return;
    }

    setPendingPurchase(bundle);
    setPhoneNumber(''); // Reset phone number
    setError(''); // Clear any previous errors
    setIsPurchaseModalOpen(true);
  };

  // Process the actual purchase
  const processPurchase = async () => {
    if (!pendingPurchase) return;
    
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid AirtelTigo number (024, 054, 055, 057, 026, or 027 followed by 7 digits)');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(getApiEndpoint('/api/v1/data/purchase-data'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userData.id,
          phoneNumber: phoneNumber,
          network: pendingPurchase.network,
          capacity: parseInt(pendingPurchase.capacity),
          price: parseFloat(pendingPurchase.price)
        })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        showToast(`${pendingPurchase.capacity}GB purchased successfully for ${phoneNumber}!`, 'success');
        setPhoneNumber('');
        setError('');
        setIsPurchaseModalOpen(false);
        setPendingPurchase(null);
      } else {
        throw new Error(data.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      const errorMessage = error.message || 'Purchase failed. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden pb-20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-[#ED1C24]/5 to-[#0066CC]/5 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-[#0066CC]/5 to-black blur-3xl"></div>
      </div>

      {/* Toast Notification */}
      {toast.visible && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
      
      {/* Loading Overlay */}
      <LoadingOverlay isLoading={isLoading} />
      
      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => {
          setIsPurchaseModalOpen(false);
          setPendingPurchase(null);
          setPhoneNumber('');
          setError('');
        }}
        bundle={pendingPurchase}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        onPurchase={processPurchase}
        error={error}
        isLoading={isLoading}
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
                <ArrowRight className="w-5 h-5 text-[#ED1C24] rotate-180" />
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-[#ED1C24] to-[#0066CC] rounded-xl flex items-center justify-center">
                <span className="font-black text-white text-lg">AT</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">AT Premium Bundles</h1>
                <p className="text-gray-400 mt-1">Life is Simple • No Expiry Data</p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search bundles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ED1C24] text-white placeholder-gray-400"
                />
              </div>

              {/* Sort by Capacity */}
              <button
                onClick={() => handleSort('capacity')}
                className={`px-4 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 ${
                  sortBy === 'capacity' 
                    ? 'bg-gradient-to-r from-[#ED1C24] to-[#0066CC] text-white' 
                    : 'bg-gray-900/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Capacity</span>
                {sortBy === 'capacity' && (
                  sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                )}
              </button>

              {/* Sort by Price */}
              <button
                onClick={() => handleSort('price')}
                className={`px-4 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 ${
                  sortBy === 'price' 
                    ? 'bg-gradient-to-r from-[#ED1C24] to-[#0066CC] text-white' 
                    : 'bg-gray-900/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Price</span>
                {sortBy === 'price' && (
                  sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                )}
              </button>

              {/* Sort by Value */}
              <button
                onClick={() => handleSort('value')}
                className={`px-4 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 ${
                  sortBy === 'value' 
                    ? 'bg-gradient-to-r from-[#ED1C24] to-[#0066CC] text-white' 
                    : 'bg-gray-900/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Value</span>
                {sortBy === 'value' && (
                  sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center justify-center mt-4">
              <div className="bg-gray-900/50 rounded-xl p-1 flex">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                    viewMode === 'grid' ? 'bg-gradient-to-r from-[#ED1C24] to-[#0066CC] text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  <span>Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                    viewMode === 'list' ? 'bg-gradient-to-r from-[#ED1C24] to-[#0066CC] text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span>List</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bundles Grid/List */}
        <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-4 sm:p-6">
          {filteredAndSortedBundles.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6' 
              : 'space-y-4'
            }>
              {filteredAndSortedBundles.map((bundle) => (
                <ATPackageCard
                  key={bundle.capacity}
                  bundle={bundle}
                  onClick={handleBundleSelect}
                  disabled={!bundle.inStock}
                  isGridView={viewMode === 'grid'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#ED1C24]/20 to-[#0066CC]/20 flex items-center justify-center">
                <Package className="w-12 h-12 text-[#ED1C24]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Bundles Found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your search criteria</p>
              <button
                onClick={() => setSearchTerm('')}
                className="px-6 py-3 bg-gradient-to-r from-[#ED1C24] to-[#0066CC] text-white rounded-xl hover:from-red-600 hover:to-blue-600 transition-all font-bold"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Important Notice */}
        <div className="mt-6 p-4 sm:p-6 bg-gradient-to-br from-red-50/10 to-blue-50/10 backdrop-blur-xl rounded-2xl border border-[#ED1C24]/20">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-[#ED1C24] mr-4 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-lg font-bold text-white mb-3">Important Notice</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-300">
                <p className="flex items-center">
                  <Info className="w-4 h-4 text-blue-400 mr-2" />
                  Only AirtelTigo numbers supported (024, 054, 055, 057, 026, 027)
                </p>
                <p className="flex items-center">
                  <X className="w-4 h-4 text-red-400 mr-2" />
                  Not instant service - delivery takes time
                </p>
                <p className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mr-2" />
                  No refunds for wrong numbers
                </p>
                <p className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Verify number carefully before purchase
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATBundleCards;