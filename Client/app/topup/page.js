'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import {
  Wallet, DollarSign, CreditCard, Shield, CheckCircle, X, AlertTriangle,
  Info, Zap, Star, TrendingUp, ArrowRight, Plus, Minus, ChevronRight,
  Gift, Timer, Lock, Sparkles, BadgeCheck, ArrowUp, Phone, Copy,
  RefreshCw, Loader2, Smartphone, Target, Flame, Eye, EyeOff,
  History, Settings, HelpCircle, ExternalLink, Download, Upload
} from 'lucide-react';

// API Configuration
const getApiEndpoint = (path) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://unlimitedata.onrender.com';
  return `${baseUrl}${path}`;
};

// Enhanced Phone Number Validation
const validatePhoneNumber = (number, network = 'all') => {
  const cleanNumber = number.replace(/[\s-]/g, '');
  
  const patterns = {
    mtn: /^(024|054|055|057|059)\d{7}$/,
    vodafone: /^(020|050)\d{7}$/,
    airteltigo: /^(026|027)\d{7}$/,
    telecel: /^(020|050)\d{7}$/,
    all: /^(024|054|055|057|059|020|050|026|027)\d{7}$/
  };
  
  return patterns[network].test(cleanNumber);
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

// Enhanced Amount Input Component
const AmountInput = ({ value, onChange, onQuickSelect, selectedAmount, quickAmounts }) => {
  const [showCustom, setShowCustom] = useState(false);
  
  return (
    <div className="space-y-4">
      {/* Quick Amount Selection */}
      <div>
        <label className="block text-sm font-bold mb-3 text-white">
          Quick Amount Selection
        </label>
        <div className="grid grid-cols-3 gap-3">
          {quickAmounts.map((qa) => (
            <button
              key={qa.value}
              type="button"
              onClick={() => onQuickSelect(qa.value)}
              className={`relative p-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 ${
                selectedAmount === qa.value
                  ? 'bg-gradient-to-r from-[#FFCC08] to-[#FFD700] text-black shadow-lg'
                  : 'bg-white/10 backdrop-blur-sm border border-[#FFCC08]/30 text-white hover:border-[#FFCC08]'
              }`}
            >
              {qa.popular && (
                <span className="absolute -top-2 -right-2 px-2 py-1 bg-[#FFCC08] text-black text-xs font-bold rounded-full">
                  Popular
                </span>
              )}
              {qa.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Amount Input */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-bold text-white">
            Custom Amount
          </label>
          <button
            type="button"
            onClick={() => setShowCustom(!showCustom)}
            className="text-[#FFCC08] hover:text-[#FFD700] text-sm font-medium flex items-center space-x-1"
          >
            {showCustom ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showCustom ? 'Hide' : 'Show'} Custom</span>
          </button>
        </div>
        
        {showCustom && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-[#FFCC08] text-xl font-bold">₵</span>
            </div>
            <input
              type="number"
              value={value}
              onChange={onChange}
              placeholder="Enter amount"
              className="pl-12 pr-4 py-4 block w-full rounded-xl bg-white/10 backdrop-blur-sm border border-[#FFCC08]/30 text-white placeholder-white/50 focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08] font-bold text-lg transition-all"
              min="10"
              max="10000"
              step="0.01"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <DollarSign className="w-5 h-5 text-[#FFCC08]" />
            </div>
          </div>
        )}
        
        <p className="mt-2 text-xs text-white/60">
          Minimum: ₵10 • Maximum: ₵10,000
        </p>
      </div>
    </div>
  );
};

// Payment Summary Component
const PaymentSummary = ({ amount, fee, totalAmount, isLoading }) => {
  if (!amount || parseFloat(amount) <= 0) return null;
  
  return (
    <div className="p-5 bg-gradient-to-br from-[#FFCC08]/10 to-[#FFD700]/10 rounded-xl border border-[#FFCC08]/30 backdrop-blur-sm animate-fade-in">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center">
        <TrendingUp className="w-4 h-4 mr-2 text-[#FFCC08]" />
        Payment Summary
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between text-white/80">
          <span className="text-sm">Deposit Amount</span>
          <span className="font-bold text-white">₵{parseFloat(amount).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-white/80">
          <span className="text-sm flex items-center">
            Processing Fee
            <span className="ml-1 text-xs text-white/60">(3%)</span>
          </span>
          <span className="font-bold text-white">₵{fee}</span>
        </div>
        <div className="border-t-2 border-[#FFCC08]/30 pt-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-white">Total Amount</span>
            <span className="text-xl font-bold text-[#FFCC08]">₵{totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading Overlay Component
const LoadingOverlay = ({ isLoading, message = "Processing..." }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-xs w-full mx-auto text-center shadow-2xl">
        <div className="flex justify-center mb-5">
          <div className="relative w-16 h-16">
            <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>
            <div className="absolute top-0 w-16 h-16 rounded-full border-4 border-transparent border-t-[#FFCC08] animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#FFCC08] to-[#FFD700] animate-pulse flex items-center justify-center">
              <Wallet className="w-6 h-6 text-black animate-bounce" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <h4 className="text-xl font-bold text-gray-900 mb-2">{message}</h4>
        <p className="text-gray-600">Please wait while we process your request</p>
      </div>
    </div>
  );
};

const TopUpPage = () => {
  const router = useRouter();
  
  // State Management
  const [amount, setAmount] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [fee, setFee] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [accountStatus, setAccountStatus] = useState('');
  const [disableReason, setDisableReason] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [walletLimits, setWalletLimits] = useState({});
  
  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });
  
  // Quick amount options
  const quickAmounts = [
    { value: 10, label: '₵10', popular: false },
    { value: 20, label: '₵20', popular: false },
    { value: 50, label: '₵50', popular: true },
    { value: 100, label: '₵100', popular: true },
    { value: 200, label: '₵200', popular: false },
    { value: 500, label: '₵500', popular: false }
  ];
  
  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') return;
      
      const userData = localStorage.getItem('userData');
      const authToken = localStorage.getItem('authToken');
      
      if (userData && authToken) {
        try {
          const user = JSON.parse(userData);
          const userId = user.id || user._id;
          console.log('TopUp auth check:', { user, userId, email: user.email });
          setUserId(userId);
          setUserEmail(user.email);
          setIsAuthenticated(true);
          
          if (user.isDisabled) {
            setAccountStatus('disabled');
            setDisableReason(user.disableReason || 'Account has been disabled');
          } else if (user.approvalStatus === 'pending') {
            setAccountStatus('pending');
          } else if (user.approvalStatus === 'rejected') {
            setAccountStatus('not-approved');
            setDisableReason(user.rejectionReason || 'Your account requires approval.');
          }
          
          // Load wallet balance and limits
          loadWalletData();
        } catch (err) {
          console.error('Error parsing user data:', err);
          router.push('/SignIn');
        }
      } else {
        router.push('/SignIn');
      }
    };
    
    checkAuth();
  }, [router]);
  
  // Load wallet data
  const loadWalletData = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(getApiEndpoint('/api/wallet/balance'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentBalance(data.balance || 0);
        setWalletLimits(data.limits || {});
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };
  
  // Calculate fee and total amount when deposit amount changes
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      const depositAmount = parseFloat(amount);
      const feeAmount = depositAmount * 0.03; // 3% fee
      const total = depositAmount + feeAmount;
      setFee(feeAmount.toFixed(2));
      setTotalAmount(total.toFixed(2));
    } else {
      setFee('');
      setTotalAmount('');
    }
  }, [amount]);
  
  // CSS animations are handled via Tailwind classes
  // Removed direct DOM manipulation for SSR compatibility
  
  // Handle quick amount selection
  const handleQuickAmount = useCallback((value) => {
    setAmount(value.toString());
    setSelectedAmount(value);
  }, []);
  
  // Handle custom amount input
  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    // Clear selected quick amount if user types custom amount
    const numValue = parseFloat(value);
    if (!quickAmounts.find(qa => qa.value === numValue)) {
      setSelectedAmount(null);
    } else {
      setSelectedAmount(numValue);
    }
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
  
  // Enhanced retry function with exponential backoff and retry-after header support
  const retryRequest = async (requestFn, maxRetries = 3, baseDelay = 5000) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        if (error.response?.status === 429 && attempt < maxRetries - 1) {
          // Check for retry-after header first
          const retryAfter = error.response.headers['retry-after'];
          let delay = baseDelay * Math.pow(2, attempt);
          
          if (retryAfter) {
            delay = parseInt(retryAfter) * 1000; // Convert to milliseconds
          }
          
          // Cap the delay at 60 seconds for better rate limit handling
          delay = Math.min(delay, 60000);
          
          console.log(`Rate limited, retrying in ${delay/1000}s... (attempt ${attempt + 1}/${maxRetries})`);
          showToast(`Rate limited. Retrying in ${Math.ceil(delay/1000)} seconds...`, 'warning');
          
          // Show loading state during retry
          setIsLoading(true);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded due to rate limiting');
  };

  // Debounce function to prevent rapid successive requests
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [windowStart, setWindowStart] = useState(Date.now());
  const [circuitBreakerOpen, setCircuitBreakerOpen] = useState(false);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const DEBOUNCE_DELAY = 30000; // 30 seconds between requests to prevent rate limiting
  const MAX_REQUESTS_PER_MINUTE = 3; // Very conservative limit to match server
  const RATE_LIMIT_WINDOW = 60000; // 1 minute window
  const CIRCUIT_BREAKER_THRESHOLD = 3; // Open circuit after 3 consecutive failures
  const CIRCUIT_BREAKER_TIMEOUT = 300000; // 5 minutes before trying again

  const handleDeposit = async (e) => {
    e.preventDefault();
    
    // Skip all rate limiting checks in development
    if (process.env.NODE_ENV === 'development') {
      // Skip rate limiting, proceed directly
    } else {
      // Check circuit breaker
      if (circuitBreakerOpen) {
        setError('Service temporarily unavailable due to repeated failures. Please try again later.');
        showToast('Service temporarily unavailable. Please try again later.', 'error');
        return;
      }
      
      // Check if currently rate limited
      if (isRateLimited) {
        setError('Please wait before making another request. Rate limit is currently active.');
        showToast('Rate limit is active. Please wait before trying again.', 'error');
        return;
      }
    }
    
    // Check debounce to prevent rapid successive requests
    const now = Date.now();
    if (now - lastRequestTime < DEBOUNCE_DELAY) {
      const remainingTime = Math.ceil((DEBOUNCE_DELAY - (now - lastRequestTime)) / 1000);
      setError(`Please wait ${remainingTime} second${remainingTime > 1 ? 's' : ''} before making another request.`);
      showToast(`Please wait ${remainingTime} second${remainingTime > 1 ? 's' : ''} before trying again.`, 'error');
      return;
    }
    
    // Check rate limiting window
    if (now - windowStart > RATE_LIMIT_WINDOW) {
      // Reset window
      setWindowStart(now);
      setRequestCount(0);
    }
    
    if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
      const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - (now - windowStart)) / 1000);
      setError(`Rate limit exceeded. Please wait ${remainingTime} second${remainingTime > 1 ? 's' : ''} before trying again.`);
      showToast(`Rate limit exceeded. Please wait ${remainingTime} second${remainingTime > 1 ? 's' : ''} before trying again.`, 'error');
      setIsRateLimited(true);
      
      // Auto-clear rate limit after window expires
      setTimeout(() => {
        setIsRateLimited(false);
        setRequestCount(0);
        setWindowStart(Date.now());
        setError('');
        showToast('Rate limit cleared. You can try again now.', 'success');
      }, RATE_LIMIT_WINDOW - (now - windowStart));
      return;
    }
    
    const depositAmount = parseFloat(amount);
    
    if (!amount || depositAmount < 10) {
      setError('Minimum deposit amount is ₵10');
      return;
    }
    
    if (depositAmount > 10000) {
      setError('Maximum deposit amount is ₵10,000');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    setLastRequestTime(now);
    setRequestCount(prev => prev + 1);
    
    try {
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem('authToken');
      
      const depositData = {
        userId,
        amount: depositAmount,
        totalAmountWithFee: parseFloat(totalAmount),
        email: userEmail
      };
      
      console.log('Deposit request data:', depositData);
      
      const response = await retryRequest(async () => {
        return await axios.post(getApiEndpoint('/api/v1/deposit'), depositData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 30000
        });
      });
      
      if (response.data.paystackUrl) {
        setSuccess('Redirecting to secure payment...');
        showToast('Redirecting to secure payment...', 'success');
        // Reset consecutive failures on success
        setConsecutiveFailures(0);
        setTimeout(() => {
          window.location.href = response.data.paystackUrl;
        }, 1000);
      }
    } catch (error) {
      console.error('Deposit error:', error);
      
      // Increment consecutive failures
      setConsecutiveFailures(prev => {
        const newCount = prev + 1;
        
        // Open circuit breaker if threshold reached
        if (newCount >= CIRCUIT_BREAKER_THRESHOLD) {
          setCircuitBreakerOpen(true);
          showToast('Service temporarily unavailable due to repeated failures. Please try again later.', 'error');
          
          // Auto-close circuit breaker after timeout
          setTimeout(() => {
            setCircuitBreakerOpen(false);
            setConsecutiveFailures(0);
            showToast('Service restored. You can try again now.', 'success');
          }, CIRCUIT_BREAKER_TIMEOUT);
        }
        
        return newCount;
      });
      
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 404) {
          setError('Service temporarily unavailable. Please try again later or contact support.');
        } else if (status === 400) {
          setError(errorData?.message || 'Invalid request. Please check your input and try again.');
        } else if (status === 401) {
          setError('Authentication failed. Please login again.');
          setTimeout(() => router.push('/SignIn'), 2000);
        } else if (status === 403) {
          setError('Access denied. Please contact support.');
        } else if (status === 429) {
          setIsRateLimited(true);
          setError('Too many requests. Please wait a moment and try again.');
          showToast('Rate limit exceeded. Please wait before trying again.', 'error');
          
          // Auto-clear rate limit after 2 minutes
          setTimeout(() => {
            setIsRateLimited(false);
            setError('');
            showToast('Rate limit cleared. You can try again now.', 'success');
          }, 120000);
        } else if (status === 500 || status === 502 || status === 503) {
          setError('Server error. Please try again later.');
        } else if (errorData?.error === 'Account is disabled') {
          setAccountStatus('disabled');
          setDisableReason(errorData.disableReason || 'Account disabled');
          setShowApprovalModal(true);
        } else if (errorData?.error === 'Account not approved') {
          if (errorData.approvalStatus === 'pending') {
            setAccountStatus('pending');
          } else {
            setAccountStatus('not-approved');
            setDisableReason(errorData.reason || 'Account requires approval');
          }
          setShowApprovalModal(true);
        } else {
          setError(errorData?.error || errorData?.message || 'Failed to process deposit. Please try again.');
        }
      } else if (error.request) {
        setError('No response from server. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      
      showToast(error.message || 'Deposit failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Copy mobile money number to clipboard
  const copyMomoNumber = () => {
    navigator.clipboard.writeText('0597760914');
    setCopySuccess('Copied!');
    showToast('Mobile money number copied to clipboard!', 'success');
    setTimeout(() => setCopySuccess(''), 2000);
  };
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-950 to-black">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-[#FFCC08]/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FFCC08] border-r-[#FFCC08]/60 animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#FFCC08] to-[#FFD700] animate-pulse flex items-center justify-center">
              <Wallet className="w-8 h-8 text-black animate-bounce" strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-[#FFCC08] font-medium">Verifying authentication...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden pb-20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-[#FFCC08]/5 to-[#FFD700]/5 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-[#FFD700]/5 to-black blur-3xl"></div>
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
      <LoadingOverlay isLoading={isLoading} message="Processing Payment..." />

      {/* Main Content */}
      <div className="relative z-10 px-3 sm:px-4 py-3 sm:py-4 max-w-2xl mx-auto">
        
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
              <div className="w-12 h-12 bg-gradient-to-br from-[#FFCC08] to-[#FFD700] rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Top Up Wallet</h1>
                <p className="text-gray-400 mt-1">Add funds to your account</p>
              </div>
            </div>
          </div>

          {/* Current Balance Card */}
          <div className="bg-gradient-to-r from-[#FFCC08]/10 to-[#FFD700]/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 mb-6 border border-[#FFCC08]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FFCC08] to-[#FFD700] rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-white/80 text-sm">Current Balance</p>
                  <p className="text-white font-bold text-xl">₵{currentBalance.toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={loadWalletData}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-[#FFCC08]" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-4 sm:p-6">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-[#FFCC08] to-[#FFD700] p-4 sm:p-6 rounded-2xl mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-black/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-black/20 backdrop-blur-sm flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-black" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-black">Add Funds</h2>
                    <p className="text-black/90 text-sm">Quick & Secure Payment</p>
                  </div>
                </div>
                
                <Link 
                  href="/howtodeposite" 
                  className="flex items-center space-x-2 px-4 py-2 bg-black/20 backdrop-blur-sm text-black font-medium rounded-xl hover:bg-black/30 transition-all duration-300 transform hover:scale-105"
                >
                  <Info size={16} />
                  <span>Help</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Circuit Breaker Status */}
          {circuitBreakerOpen && (
            <div className="mb-6 animate-fade-in">
              <div className="p-4 rounded-xl bg-red-50/10 backdrop-blur-sm border border-red-500/30">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-grow">
                    <span className="text-red-200 text-sm font-medium">
                      Service temporarily unavailable due to repeated failures. Please try again in 5 minutes.
                    </span>
                    <div className="mt-2 w-full bg-red-500/20 rounded-full h-2">
                      <div className="bg-red-400 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rate Limit Status */}
          {isRateLimited && !circuitBreakerOpen && (
            <div className="mb-6 animate-fade-in">
              <div className="p-4 rounded-xl bg-orange-50/10 backdrop-blur-sm border border-orange-500/30">
                <div className="flex items-start space-x-3">
                  <Timer className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-grow">
                    <span className="text-orange-200 text-sm font-medium">
                      Rate limit is active. Please wait before trying again.
                    </span>
                    <div className="mt-2 w-full bg-orange-500/20 rounded-full h-2">
                      <div className="bg-orange-400 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
                    </div>
                    <div className="mt-2 text-xs text-orange-300">
                      Requests used: {requestCount}/{MAX_REQUESTS_PER_MINUTE} per minute
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && !isRateLimited && !circuitBreakerOpen && (
            <div className="mb-6 animate-fade-in">
              <div className="p-4 rounded-xl bg-red-50/10 backdrop-blur-sm border border-red-500/30">
                <div className="flex items-start space-x-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-red-200 text-sm font-medium">{error}</span>
                </div>
                
                {/* Show manual deposit option if API fails */}
                {error.includes('unavailable') && (
                  <div className="mt-3 pt-3 border-t border-red-500/30">
                    <p className="text-white/80 text-sm font-semibold mb-2">Alternative Deposit Method:</p>
                    <div className="bg-white/5 p-3 rounded-lg space-y-2">
                      <p className="text-sm text-white/60">
                        Send payment via MoMo to: <span className="font-bold text-white">0597760914</span>
                      </p>
                      <p className="text-sm text-white/60">
                        Name: <span className="font-bold text-white">KOJO Frimpong</span>
                      </p>
                      <p className="text-sm text-[#FFCC08] font-semibold">
                        Include your email as reference
                      </p>
                    </div>
                    <a
                      href="mailto:support@unlimiteddata-gh.com?subject=Deposit%20Assistance"
                      className="mt-3 inline-flex items-center text-[#FFCC08] hover:text-[#FFD700] font-semibold text-sm"
                    >
                      Contact Support for Help
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Display */}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-50/10 backdrop-blur-sm border border-green-500/30 animate-fade-in">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-green-200 text-sm font-medium">{success}</span>
              </div>
            </div>
          )}

          {/* Deposit Form */}
          <form onSubmit={handleDeposit} className="space-y-6">
            {/* Amount Input */}
            <AmountInput
              value={amount}
              onChange={handleAmountChange}
              onQuickSelect={handleQuickAmount}
              selectedAmount={selectedAmount}
              quickAmounts={quickAmounts}
            />
            
            {/* Payment Summary */}
            <PaymentSummary
              amount={amount}
              fee={fee}
              totalAmount={totalAmount}
              isLoading={isLoading}
            />
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !amount || parseFloat(amount) < 10 || isRateLimited || circuitBreakerOpen}
              className={`w-full flex items-center justify-center py-4 px-6 rounded-xl text-black font-bold transition-all duration-300 transform ${
                isLoading || !amount || parseFloat(amount) < 10 || isRateLimited || circuitBreakerOpen
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#FFCC08] to-[#FFD700] hover:from-[#FFD700] hover:to-[#FFCC08] hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="mr-3 animate-spin">
                    <div className="w-5 h-5 border-3 border-black/30 border-t-black rounded-full"></div>
                  </div>
                  Processing Payment...
                </>
              ) : circuitBreakerOpen ? (
                <>
                  <AlertTriangle className="mr-2 w-5 h-5" />
                  Service Unavailable
                </>
              ) : isRateLimited ? (
                <>
                  <Timer className="mr-2 w-5 h-5" />
                  Rate Limited - Please Wait
                </>
              ) : (
                <>
                  <Shield className="mr-2 w-5 h-5" />
                  Pay with Paystack
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Security Features */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/5 backdrop-blur-sm rounded-xl">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-[#FFCC08]" />
                <span className="text-xs text-white/60 font-medium">256-bit Encryption</span>
              </div>
            </div>
            <div className="p-3 bg-white/5 backdrop-blur-sm rounded-xl">
              <div className="flex items-center space-x-2">
                <BadgeCheck className="w-4 h-4 text-[#FFCC08]" />
                <span className="text-xs text-white/60 font-medium">Verified by Paystack</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <Link 
                href="/myorders" 
                className="flex items-center text-[#FFCC08] hover:text-[#FFD700] font-semibold text-sm transition-colors"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Transaction History
              </Link>
              <Link 
                href="/support" 
                className="flex items-center text-white/60 hover:text-[#FFCC08] font-medium text-sm transition-colors"
              >
                Need Help?
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Account Status Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  {accountStatus === 'pending' ? 'Account Activation Required' : 
                   accountStatus === 'disabled' ? 'Account Disabled' : 
                   'Account Approval Required'}
                </h2>
              </div>
              <button 
                onClick={() => setShowApprovalModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="mb-6">
              {accountStatus === 'disabled' ? (
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <p className="text-red-700 text-sm">
                    <span className="font-semibold">Reason:</span> {disableReason}
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 mb-4">
                    {accountStatus === 'pending' ? 
                      'Activate your account with a one-time payment of ₵100' : 
                      'Your account requires approval. Complete verification:'}
                  </p>
                  
                  <div className="bg-gradient-to-r from-[#FFCC08]/10 to-[#FFD700]/10 p-4 rounded-xl border border-[#FFCC08]/30 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">MoMo Number:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-900">0204120633</span>
                          <button 
                            onClick={copyMomoNumber}
                            className="p-1 rounded hover:bg-white/50 transition-colors"
                          >
                            <Copy size={14} className="text-[#FFCC08]" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Name:</span>
                        <span className="font-bold text-gray-900">SUNU MANFRED</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Amount:</span>
                        <span className="font-bold text-[#FFCC08] text-lg">₵100</span>
                      </div>
                    </div>
                  </div>
                  
                  {copySuccess && (
                    <p className="text-center text-green-600 text-sm font-medium mb-2 animate-fade-in">
                      {copySuccess}
                    </p>
                  )}
                  
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-yellow-800 text-sm text-center font-semibold">
                      ⚠️ Use your email/phone as reference
                    </p>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
              >
                Close
              </button>
              
              <a
                href="mailto:support@unlimiteddata-gh.com"
                className="flex-1 py-3 px-4 bg-gradient-to-r from-[#FFCC08] to-[#FFD700] hover:from-[#FFD700] hover:to-[#FFCC08] text-black font-bold rounded-xl text-center transition-all transform hover:scale-105"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopUpPage;