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

// Enhanced MTN Package Card with modern design
const MTNPackageCard = ({ bundle, onClick, disabled, isGridView = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  if (!isGridView) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="flex items-center p-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FFCC08] to-yellow-600 rounded-xl flex items-center justify-center mr-4">
            <span className="font-black text-black text-xl">{bundle.capacity}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">{bundle.capacity}GB Data</h3>
            <p className="text-gray-600 text-sm">MTN • 90 Days Validity</p>
          </div>
          <div className="text-right mr-4">
            <p className="text-2xl font-bold text-[#FFCC08]">₵{bundle.price}</p>
            <p className="text-gray-500 text-sm">₵{(bundle.price / bundle.capacity).toFixed(2)}/GB</p>
          </div>
          <button
            onClick={() => onClick(bundle)}
            disabled={disabled}
            className="px-6 py-2 bg-gradient-to-r from-[#FFCC08] to-yellow-600 text-black rounded-xl hover:from-yellow-500 hover:to-yellow-700 transition-all font-bold disabled:opacity-50"
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
      {/* Header with MTN branding */}
      <div className="bg-gradient-to-br from-[#FFCC08] to-yellow-600 p-4 relative overflow-hidden">
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
          <p className="text-white/80 text-sm">MTN Data</p>
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
            <span className="text-green-600 font-semibold">90 Days</span>
          </div>
          
          <div className="pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick(bundle);
              }}
              disabled={disabled}
              className="w-full py-2.5 bg-gradient-to-r from-[#FFCC08] to-yellow-600 text-black rounded-xl hover:from-yellow-500 hover:to-yellow-700 transition-all font-bold disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Hover overlay */}
      {isHovered && !disabled && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFCC08]/10 to-yellow-600/10 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl p-3 shadow-lg">
            <Eye className="w-6 h-6 text-[#FFCC08]" />
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
    
    if (!formatted.startsWith('0') && formatted.length > 0) {
      formatted = '0' + formatted;
    }
    
    if (formatted.length > 10) {
      formatted = formatted.substring(0, 10);
    }
    
    setPhoneNumber(formatted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
        {/* Modal header */}
        <div className="bg-gradient-to-r from-[#FFCC08] to-yellow-600 px-6 py-5 rounded-t-3xl flex justify-between items-center">
          <h3 className="text-xl font-bold text-black flex items-center">
            <Signal className="w-6 h-6 mr-2" />
            Purchase {bundle.capacity}GB
          </h3>
          <button onClick={onClose} className="text-black hover:text-gray-700 p-2 rounded-xl hover:bg-black/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Modal content */}
        <div className="px-6 py-6">
          {/* Bundle Info */}
          <div className="mb-5">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#FFCC08] to-yellow-600 rounded-2xl flex flex-col items-center justify-center shadow-lg">
              <span className="font-black text-black text-3xl">{bundle.capacity}</span>
              <span className="font-bold text-black text-xs -mt-1">GB</span>
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-2xl p-5 mb-5 border-2 border-[#FFCC08]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-medium">Data Bundle:</span>
              <span className="text-black font-bold text-lg">{bundle.capacity}GB</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-medium">Duration:</span>
              <span className="text-black font-bold">90 days</span>
            </div>
            <div className="flex justify-between items-center border-t-2 border-[#FFCC08] pt-3">
              <span className="text-black font-bold">Total Price:</span>
              <span className="text-black font-bold text-xl bg-[#FFCC08] px-3 py-1 rounded-lg">₵{bundle.price}</span>
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
            <label className="block text-sm font-bold mb-3 text-black">
              Enter MTN Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="w-5 h-5 text-[#FFCC08]" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                className="pl-12 pr-4 py-4 block w-full rounded-2xl bg-gray-50 border-2 border-gray-200 text-black placeholder-gray-400 focus:ring-3 focus:ring-[#FFCC08] focus:border-[#FFCC08] font-semibold text-lg transition-all"
                placeholder="0XXXXXXXXX"
                required
                autoFocus
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">Format: 0 followed by 9 digits</p>
          </div>

          {/* Warning */}
          <div className="mb-5 p-4 bg-yellow-50 border-2 border-[#FFCC08] rounded-2xl">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-black mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-black text-sm font-medium">
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
              className="flex-1 py-4 px-6 bg-gradient-to-r from-[#FFCC08] to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold rounded-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base shadow-lg"
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
            <div className="absolute top-0 w-16 h-16 rounded-full border-4 border-transparent border-t-[#FFCC08] animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#FFCC08] to-yellow-600 animate-pulse flex items-center justify-center">
              <Signal className="w-6 h-6 text-black animate-bounce" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <h4 className="text-xl font-bold text-black mb-2">Processing...</h4>
        <p className="text-gray-600">Please wait while we process your order</p>
      </div>
    </div>
  );
};

const MTNBundleSelect = () => {
  const router = useRouter();
  
  // State Management
  const [selectedBundle, setSelectedBundle] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('capacity'); // capacity, price, value
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  
  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });
  
  // Manual inventory control
  const inventoryAvailable = true;
  
  const bundles = [
    { value: '1', label: '1GB', capacity: '1', price: '4.5', network: 'YELLO', inStock: inventoryAvailable },
    { value: '2', label: '2GB', capacity: '2', price: '8.9', network: 'YELLO', inStock: inventoryAvailable },
    { value: '3', label: '3GB', capacity: '3', price: '12.9', network: 'YELLO', inStock: inventoryAvailable },
    { value: '4', label: '4GB', capacity: '4', price: '16.9', network: 'YELLO', inStock: inventoryAvailable },
    { value: '5', label: '5GB', capacity: '5', price: '23', network: 'YELLO', inStock: inventoryAvailable },
    { value: '6', label: '6GB', capacity: '6', price: '27.00', network: 'YELLO', inStock: inventoryAvailable },
    { value: '8', label: '8GB', capacity: '8', price: '35.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '10', label: '10GB', capacity: '10', price: '43.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '15', label: '15GB', capacity: '15', price: '62.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '20', label: '20GB', capacity: '20', price: '83.00', network: 'YELLO', inStock: inventoryAvailable },
    { value: '25', label: '25GB', capacity: '25', price: '105.00', network: 'YELLO', inStock: inventoryAvailable },
    { value: '30', label: '30GB', capacity: '30', price: '129.00', network: 'YELLO', inStock: inventoryAvailable },
    { value: '40', label: '40GB', capacity: '40', price: '166.00', network: 'YELLO', inStock: inventoryAvailable },
    { value: '50', label: '50GB', capacity: '50', price: '207.00', network: 'YELLO', inStock: inventoryAvailable },
    { value: '100', label: '100GB', capacity: '100', price: '407.00', network: 'YELLO', inStock: inventoryAvailable }
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
      bundle.label.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Function to validate phone number format
  const validatePhoneNumber = (number) => {
    const cleanNumber = number.replace(/[\s-]/g, '');
    
    if (cleanNumber.startsWith('0')) {
      return cleanNumber.length === 10 && /^0\d{9}$/.test(cleanNumber);
    }
    
    return false;
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

    setSelectedBundle(bundle.value);
    setPendingPurchase(bundle);
    setPhoneNumber(''); // Reset phone number
    setError(''); // Clear any previous errors
    setIsPurchaseModalOpen(true);
  };

  // Process the actual purchase
  const processPurchase = async () => {
    if (!pendingPurchase) return;
    
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid MTN number (10 digits starting with 0)');
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
        setSelectedBundle('');
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
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-[#FFCC08]/5 to-yellow-600/5 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-yellow-600/5 to-black blur-3xl"></div>
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
                <ArrowRight className="w-5 h-5 text-[#FFCC08] rotate-180" />
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-[#FFCC08] to-yellow-600 rounded-xl flex items-center justify-center">
                <span className="font-black text-black text-lg">MTN</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">MTN Data Bundles</h1>
                <p className="text-gray-400 mt-1">Everywhere You Go • Best Value</p>
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
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08] text-white placeholder-gray-400"
                />
              </div>

              {/* Sort by Capacity */}
              <button
                onClick={() => handleSort('capacity')}
                className={`px-4 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 ${
                  sortBy === 'capacity' 
                    ? 'bg-[#FFCC08] text-black' 
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
                    ? 'bg-[#FFCC08] text-black' 
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
                    ? 'bg-[#FFCC08] text-black' 
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
                    viewMode === 'grid' ? 'bg-[#FFCC08] text-black' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  <span>Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                    viewMode === 'list' ? 'bg-[#FFCC08] text-black' : 'text-gray-300 hover:text-white'
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
                <MTNPackageCard
                  key={bundle.value}
                  bundle={bundle}
                  onClick={handleBundleSelect}
                  disabled={!bundle.inStock}
                  isGridView={viewMode === 'grid'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#FFCC08]/20 to-yellow-600/20 flex items-center justify-center">
                <Package className="w-12 h-12 text-[#FFCC08]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Bundles Found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your search criteria</p>
              <button
                onClick={() => setSearchTerm('')}
                className="px-6 py-3 bg-gradient-to-r from-[#FFCC08] to-yellow-600 text-black rounded-xl hover:from-yellow-500 hover:to-yellow-700 transition-all font-bold"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Important Notice */}
        <div className="mt-6 p-4 sm:p-6 bg-yellow-50/10 backdrop-blur-xl rounded-2xl border border-[#FFCC08]/20">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-[#FFCC08] mr-4 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-lg font-bold text-white mb-3">Important Notice</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-300">
                <p className="flex items-center">
                  <X className="w-4 h-4 text-red-400 mr-2" />
                  Not instant service - delivery takes time
                </p>
                <p className="flex items-center">
                  <X className="w-4 h-4 text-red-400 mr-2" />
                  Turbonet & Broadband SIMs not eligible
                </p>
                <p className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mr-2" />
                  No refunds for wrong numbers
                </p>
                <p className="flex items-center">
                  <Info className="w-4 h-4 text-blue-400 mr-2" />
                  For urgent data, use *138# instead
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MTNBundleSelect;