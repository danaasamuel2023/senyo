'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  CreditCard, Smartphone, CheckCircle2, XCircle, Loader2,
  ArrowRight, Phone, AlertCircle, RefreshCw, Info, Zap, Star,
  Flame, Shield, Target, TrendingUp, Wallet, DollarSign, Eye,
  EyeOff, Copy, History, Settings, HelpCircle, ExternalLink,
  Download, Upload, Lock, BadgeCheck, Timer, Gift, Sparkles
} from 'lucide-react';

// API Configuration
const getApiEndpoint = (path) => {
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const baseUrl = isLocalhost ? 'http://localhost:5001' : 'https://unlimitedata.onrender.com';
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
            <CheckCircle2 className="h-5 w-5" />
          ) : type === 'error' ? (
            <XCircle className="h-5 w-5" />
          ) : (
            <Info className="h-5 w-5" />
          )}
        </div>
        <div className="flex-grow">
          <p className="font-semibold">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 hover:scale-110 transition-transform">
          <XCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

// Network Selection Component
const NetworkSelector = ({ selectedNetwork, onNetworkChange }) => {
  const networks = [
    { value: 'mtn', label: 'MTN Mobile Money', color: 'from-yellow-500 to-yellow-600', icon: 'M' },
    { value: 'vodafone', label: 'Vodafone Cash', color: 'from-red-500 to-red-600', icon: 'V' },
    { value: 'at', label: 'AirtelTigo Money', color: 'from-blue-500 to-blue-600', icon: 'A' }
  ];

  return (
    <div className="space-y-3">
      <label className="block text-lg font-bold text-white">
        Mobile Network
      </label>
      <div className="grid grid-cols-1 gap-3">
        {networks.map((network) => (
          <button
            key={network.value}
            type="button"
            onClick={() => onNetworkChange(network.value)}
            className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
              selectedNetwork === network.value
                ? 'border-[#FFCC08] bg-[#FFCC08]/10'
                : 'border-white/20 bg-white/5 hover:border-[#FFCC08]/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${network.color} flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">{network.icon}</span>
              </div>
              <div className="flex-grow text-left">
                <p className="text-white font-semibold">{network.label}</p>
                <p className="text-white/60 text-sm">
                  {network.value === 'mtn' && '024, 054, 055, 057, 059'}
                  {network.value === 'vodafone' && '020, 050'}
                  {network.value === 'at' && '026, 027'}
                </p>
              </div>
              {selectedNetwork === network.value && (
                <CheckCircle2 className="w-6 h-6 text-[#FFCC08]" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Amount Input Component
const AmountInput = ({ value, onChange, quickAmounts, selectedAmount, onQuickSelect }) => {
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
              <Smartphone className="w-6 h-6 text-black animate-bounce" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <h4 className="text-xl font-bold text-gray-900 mb-2">{message}</h4>
        <p className="text-gray-600">Please wait while we process your request</p>
      </div>
    </div>
  );
};

const DataHustleDeposit = () => {
  const router = useRouter();
  
  // State Management
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [network, setNetwork] = useState('mtn');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [reference, setReference] = useState('');
  const [externalRef, setExternalRef] = useState('');
  const [userId, setUserId] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('');
  const [step, setStep] = useState(1);
  const [checkReminder, setCheckReminder] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  
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

  // Get user data from localStorage on component mount
  useEffect(() => {
    try {
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserId(userData.id);
        
        // Also try to get user's phone number if available
        if (userData.phone) {
          setPhoneNumber(userData.phone);
        }
        
        // Load wallet balance
        loadWalletData();
      } else {
        setError('You need to be logged in to make a deposit');
        router.push('/SignIn');
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
      setError('Error retrieving user information');
    }
  }, [router]);

  // Load wallet data
  const loadWalletData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(getApiEndpoint('/api/wallet/balance'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };

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
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fade-in {
        animation: fadeIn 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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

  // Form validation
  const isFormValid = () => {
    if (!amount || parseFloat(amount) <= 9) {
      setError('Please enter a valid amount greater than GHS 9');
      return false;
    }
    
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return false;
    }
    
    if (!validatePhoneNumber(phoneNumber, network)) {
      setError(`Please enter a valid ${network.toUpperCase()} phone number`);
      return false;
    }
    
    if (!network) {
      setError('Please select a network');
      return false;
    }
    
    if (!userId) {
      setError('User ID not found. Please log in again');
      return false;
    }
    
    setError('');
    return true;
  };

  // Handle deposit submission
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) return;
    
    setLoading(true);
    setSuccess('');
    setError('');
    
    try {
      const response = await axios.post(getApiEndpoint('/api/v1/depositsmoolre'), {
        userId,
        amount: parseFloat(amount),
        phoneNumber,
        network,
        currency: 'GHS'
      });
      
      console.log('Deposit response:', response.data);
      
      if (response.data.success && response.data.requiresOtp) {
        setOtpRequired(true);
        setReference(response.data.reference);
        setExternalRef(response.data.externalRef);
        setSuccess('OTP code has been sent to your phone. Please enter it below.');
        setStep(2);
        showToast('OTP code sent to your phone', 'success');
      } else if (response.data.success) {
        setSuccess('Deposit initiated! Please check your phone to approve the payment.');
        setReference(response.data.reference);
        setCheckReminder(true);
        setStep(3);
        showToast('Deposit initiated successfully', 'success');
      } else {
        setError(response.data.message || 'Failed to initiate deposit');
        showToast(response.data.message || 'Failed to initiate deposit', 'error');
      }
    } catch (err) {
      console.error('Deposit error:', err);
      if (err.response && err.response.data) {
        console.error('Error response:', err.response.data);
        setError(err.response.data.error || 'An error occurred while processing your deposit');
        showToast(err.response.data.error || 'An error occurred while processing your deposit', 'error');
      } else {
        setError('Network error. Please check your connection and try again.');
        showToast('Network error. Please check your connection and try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        reference: reference,
        otpCode: otpCode,
        phoneNumber: phoneNumber
      };
      
      console.log('Sending OTP verification with:', payload);
      
      const response = await axios.post(getApiEndpoint('/api/v1/verify-otp'), payload, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('OTP verification response:', response.data);
      
      if (response.data.success) {
        setSuccess('OTP verified successfully. Please check your phone to approve the payment.');
        setOtpRequired(false);
        setCheckReminder(true);
        setStep(3);
        showToast('OTP verified successfully', 'success');
      } else {
        setError(response.data.message || 'Invalid OTP code');
        showToast(response.data.message || 'Invalid OTP code', 'error');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      
      if (err.response) {
        console.error('Error response data:', err.response.data);
        
        if (err.response.status === 400) {
          const errorMsg = err.response.data.error || 'Invalid OTP code or format';
          setError(`Verification failed: ${errorMsg}. Please check the code and try again.`);
          showToast(`Verification failed: ${errorMsg}`, 'error');
        } else if (err.response.status === 404) {
          setError('Transaction not found. Please start a new deposit.');
          showToast('Transaction not found. Please start a new deposit.', 'error');
        } else {
          setError(err.response.data.error || 'OTP verification failed');
          showToast(err.response.data.error || 'OTP verification failed', 'error');
        }
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('No response from server. Please check your connection and try again.');
        showToast('No response from server. Please check your connection and try again.', 'error');
      } else {
        console.error('Error setting up request:', err.message);
        setError('Error preparing verification request. Please try again.');
        showToast('Error preparing verification request. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check transaction status
  const checkTransactionStatus = async () => {
    if (!reference) {
      setError('Reference ID is missing. Cannot check status.');
      return;
    }
    
    setLoading(true);
    setCheckReminder(false);
    
    try {
      console.log('Checking transaction status for reference:', reference);
      
      const response = await axios.get(getApiEndpoint(`/api/v1/verify-payments?reference=${encodeURIComponent(reference)}`));
      
      console.log('Transaction status response:', response.data);
      
      if (response.data.success) {
        setTransactionStatus(response.data.data.status);
        
        if (response.data.data.status === 'completed') {
          setSuccess(`Payment of GHS ${response.data.data.amount.toFixed(2)} completed successfully!`);
          showToast(`Payment of GHS ${response.data.data.amount.toFixed(2)} completed successfully!`, 'success');
          
          // Reload wallet balance
          loadWalletData();
          
          setTimeout(() => {
            setAmount('');
            setPhoneNumber('');
            setOtpCode('');
            setReference('');
            setExternalRef('');
            setOtpRequired(false);
            setStep(1);
          }, 5000);
        } else if (response.data.data.status === 'failed') {
          setError('Payment failed. Please try again with a new deposit.');
          showToast('Payment failed. Please try again with a new deposit.', 'error');
        } else {
          setTransactionStatus('pending');
          setSuccess('Your payment is still being processed. Please complete the payment on your phone.');
          setCheckReminder(true);
          showToast('Your payment is still being processed', 'info');
        }
      } else {
        setError(response.data.message || 'Could not verify payment status');
        showToast(response.data.message || 'Could not verify payment status', 'error');
      }
    } catch (err) {
      console.error('Check status error:', err);
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        if (err.response.status === 404) {
          setError('Transaction not found. The reference may be invalid.');
          showToast('Transaction not found. The reference may be invalid.', 'error');
        } else {
          setError(err.response.data.error || 'Failed to check payment status');
          showToast(err.response.data.error || 'Failed to check payment status', 'error');
        }
      } else {
        setError('Network error while checking payment status. Please try again.');
        showToast('Network error while checking payment status. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

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
      <LoadingOverlay isLoading={loading} message="Processing Deposit..." />

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
                <Zap className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Mobile Money Deposit</h1>
                <p className="text-gray-400 mt-1">Quick & Secure Mobile Payment</p>
              </div>
            </div>
          </div>

          {/* Current Balance Card */}
          <div className="bg-gradient-to-r from-[#FFCC08]/10 to-[#FFD700]/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 mb-6 border border-[#FFCC08]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FFCC08] to-[#FFD700] rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-black" />
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
                    <h2 className="text-xl font-bold text-black">Deposit Funds</h2>
                    <p className="text-black/90 text-sm">Mobile Money Payment</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-black/80 text-sm">Step {step} of 3</p>
                  <div className="w-20 bg-black/20 rounded-full h-2 mt-1">
                    <div 
                      className="bg-black h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${(step / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50/10 backdrop-blur-sm border border-red-500/30 animate-fade-in">
              <div className="flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-red-200 text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Success Display */}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-50/10 backdrop-blur-sm border border-green-500/30 animate-fade-in">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-green-200 text-sm font-medium">{success}</span>
              </div>
            </div>
          )}

          {/* Step 1: Deposit Form */}
          {step === 1 && (
            <form onSubmit={handleDepositSubmit} className="space-y-6">
              {/* Amount Input */}
              <AmountInput
                value={amount}
                onChange={handleAmountChange}
                quickAmounts={quickAmounts}
                selectedAmount={selectedAmount}
                onQuickSelect={handleQuickAmount}
              />

              {/* Phone Number Input */}
              <div>
                <label htmlFor="phoneNumber" className="block text-lg font-bold mb-3 text-white">
                  Mobile Money Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone size={20} className="text-[#FFCC08]" />
                  </div>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="02XXXXXXXX"
                    className="pl-12 pr-4 py-4 block w-full rounded-xl bg-white/10 backdrop-blur-sm border border-[#FFCC08]/30 text-white placeholder-white/50 focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08] font-medium"
                  />
                </div>
                <p className="mt-2 text-xs text-white/60">
                  Enter your mobile money number
                </p>
              </div>

              {/* Network Selection */}
              <NetworkSelector
                selectedNetwork={network}
                onNetworkChange={setNetwork}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-4 px-6 rounded-xl shadow-xl text-black bg-gradient-to-r from-[#FFCC08] to-[#FFD700] hover:from-[#FFD700] hover:to-[#FFCC08] focus:outline-none focus:ring-4 focus:ring-[#FFCC08]/50 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 font-bold text-lg"
              >
                {loading ? (
                  <>
                    <div className="mr-3 animate-spin">
                      <Loader2 className="w-6 h-6" />
                    </div>
                    Processing Deposit...
                  </>
                ) : (
                  <>
                    <Zap className="mr-3 w-6 h-6" />
                    Initiate Deposit
                    <ArrowRight className="ml-3 w-6 h-6" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && otpRequired && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 bg-gradient-to-br from-[#FFCC08]/20 to-[#FFD700]/20 border border-[#FFCC08]/30">
                  <Smartphone size={40} className="text-[#FFCC08]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">OTP Verification</h3>
                <p className="text-white/70 font-medium">
                  We sent a 6-digit code to {phoneNumber}
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div>
                  <label htmlFor="otpCode" className="block text-lg font-bold mb-3 text-white">
                    Enter 6-digit OTP Code
                  </label>
                  <input
                    type="text"
                    id="otpCode"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                    placeholder="XXXXXX"
                    maxLength={6}
                    className="py-4 px-4 block w-full rounded-xl bg-white/10 backdrop-blur-sm border border-[#FFCC08]/30 text-white placeholder-white/50 focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08] text-center tracking-widest text-2xl font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full flex items-center justify-center py-4 px-6 rounded-xl shadow-xl text-black bg-gradient-to-r from-[#FFCC08] to-[#FFD700] hover:from-[#FFD700] hover:to-[#FFCC08] focus:outline-none focus:ring-4 focus:ring-[#FFCC08]/50 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 font-bold text-lg"
                >
                  {loading ? (
                    <>
                      <div className="mr-3 animate-spin">
                        <Loader2 className="w-6 h-6" />
                      </div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-3 w-6 h-6" />
                      Verify Code
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Step 3: Awaiting Payment */}
          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 bg-gradient-to-br from-[#FFCC08]/20 to-[#FFD700]/20 border border-[#FFCC08]/30">
                <Target size={40} className="text-[#FFCC08] animate-pulse" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">
                Awaiting Payment Approval
              </h3>
              
              <p className="text-white/70 font-medium mb-6">
                Please check your phone and follow the instructions to complete the payment.
              </p>
              
              {checkReminder && (
                <div className="p-6 rounded-xl mb-6 flex items-start bg-gradient-to-r from-[#FFCC08]/10 to-[#FFD700]/10 border border-[#FFCC08]/30 backdrop-blur-sm">
                  <div className="w-6 h-6 rounded-lg bg-[#FFCC08]/20 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <Info className="w-4 h-4 text-[#FFCC08]" />
                  </div>
                  <p className="text-[#FFCC08] font-bold">
                    Important: After approving on your phone, click "Check Payment Status" below to complete the transaction.
                  </p>
                </div>
              )}
              
              <div className="mb-6">
                <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-sm">
                  <div className="bg-gradient-to-r from-[#FFCC08] to-[#FFD700] h-3 rounded-full w-full animate-pulse shadow-lg"></div>
                </div>
              </div>

              <button
                onClick={checkTransactionStatus}
                disabled={loading}
                className="w-full flex items-center justify-center py-4 px-6 rounded-xl shadow-xl text-black bg-gradient-to-r from-[#FFCC08] to-[#FFD700] hover:from-[#FFD700] hover:to-[#FFCC08] focus:outline-none focus:ring-4 focus:ring-[#FFCC08]/50 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 font-bold text-lg mb-4"
              >
                {loading ? (
                  <>
                    <div className="mr-3 animate-spin">
                      <Loader2 className="w-6 h-6" />
                    </div>
                    Checking Status...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-3 w-6 h-6" />
                    Check Payment Status
                  </>
                )}
              </button>
              
              {transactionStatus && (
                <div className={`p-4 rounded-xl backdrop-blur-sm border font-bold ${
                  transactionStatus === 'completed' 
                    ? 'bg-gradient-to-r from-[#FFCC08]/10 to-[#FFD700]/10 border-[#FFCC08]/30 text-[#FFCC08]' 
                    : transactionStatus === 'failed' 
                      ? 'bg-gradient-to-r from-red-100/10 to-red-200/10 border-red-500/30 text-red-200' 
                      : 'bg-gradient-to-r from-yellow-100/10 to-yellow-200/10 border-yellow-500/30 text-yellow-200'
                }`}>
                  Payment status: <span className="font-black">{transactionStatus}</span>
                </div>
              )}
            </div>
          )}

          {/* Progress Footer */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm font-bold text-white/70">
                Step {step} of 3
              </div>
              {step > 1 && (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="text-sm font-bold text-[#FFCC08] hover:text-[#FFD700] transition-colors"
                >
                  ← Go back
                </button>
              )}
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 backdrop-blur-sm">
              <div 
                className="bg-gradient-to-r from-[#FFCC08] to-[#FFD700] h-2 rounded-full transition-all duration-500 shadow-lg" 
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Support Footer */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-lg bg-[#FFCC08]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4 text-[#FFCC08]" />
              </div>
              <div className="text-sm text-white/70 font-medium">
                <p>
                  Need help with your deposit? Contact support at{' '}
                  <a href="mailto:support@unlimiteddata-gh.com" className="text-[#FFCC08] hover:text-[#FFD700] font-bold transition-colors">
                    support@unlimiteddata-gh.com
                  </a>{' '}
                  or call <span className="font-bold text-white">+233 20 000 0000</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataHustleDeposit;