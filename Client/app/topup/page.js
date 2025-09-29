'use client'
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { 
  Info, AlertCircle, X, Copy, AlertTriangle, Zap, Star, 
  Shield, CreditCard, TrendingUp, ArrowRight, CheckCircle,
  Wallet, DollarSign, Plus, Minus, ChevronRight, Gift,
  Timer, Lock, Sparkles, BadgeCheck, ArrowUp
} from 'lucide-react';

export default function DepositPage() {
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
  
  const router = useRouter();
  
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
      const userData = localStorage.getItem('userData');
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUserId(user.id);
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
  
  // Check if API endpoint is available (optional health check)
  const checkAPIHealth = async () => {
    try {
      const response = await fetch('https://datahustle.onrender.com/api/health', {
        method: 'GET',
        mode: 'cors'
      });
      return response.ok;
    } catch (error) {
      console.warn('API health check failed:', error);
      return false;
    }
  };
  
  const handleDeposit = async (e) => {
    e.preventDefault();
    
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
    
    try {
      // Fixed API endpoint - ensure this matches your actual backend route
      const API_BASE = 'https://datahustle.onrender.com';
      
      // Log for debugging
      console.log('Making deposit request to:', `${API_BASE}/api/v1/deposit`);
      console.log('Request data:', {
        userId,
        amount: depositAmount,
        totalAmountWithFee: parseFloat(totalAmount),
        email: userEmail
      });
      
      const response = await axios.post(`${API_BASE}/api/v1/deposit`, {
        userId,
        amount: depositAmount,
        totalAmountWithFee: parseFloat(totalAmount),
        email: userEmail
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Add auth token if needed
        },
        timeout: 30000 // 30 second timeout
      });
      
      if (response.data.paystackUrl) {
        setSuccess('Redirecting to secure payment...');
        setTimeout(() => {
          window.location.href = response.data.paystackUrl;
        }, 1000);
      }
    } catch (error) {
      console.error('Deposit error:', error);
      
      // Handle specific error status codes
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        console.log('Error response status:', status);
        console.log('Error response data:', errorData);
        
        if (status === 404) {
          setError('Service temporarily unavailable. Please try again later or contact support.');
          console.error('API endpoint not found. Please check if the deposit endpoint exists on the server.');
        } else if (status === 400) {
          setError(errorData?.message || 'Invalid request. Please check your input and try again.');
        } else if (status === 401) {
          setError('Authentication failed. Please login again.');
          setTimeout(() => router.push('/SignIn'), 2000);
        } else if (status === 403) {
          setError('Access denied. Please contact support.');
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
        // Request was made but no response received
        console.error('No response from server:', error.request);
        setError('No response from server. Please check your internet connection.');
      } else {
        // Something else went wrong
        console.error('Request error:', error.message);
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Copy mobile money number to clipboard
  const copyMomoNumber = () => {
    navigator.clipboard.writeText('0597760914');
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess(''), 2000);
  };
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-red-50 to-white">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-red-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 border-r-red-400 animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-red-500 to-red-600 animate-pulse flex items-center justify-center">
              <Wallet className="w-8 h-8 text-white animate-bounce" strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-red-600 font-medium">Verifying authentication...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50/30 to-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-red-100/30 to-red-200/30 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-red-100/30 to-pink-100/30 blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                UNLIMITED DATA GH
              </h1>
            </div>
            <p className="text-gray-600 font-medium">Top Up Your Account</p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-2xl border border-red-100 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg">
                      <CreditCard className="w-6 h-6 text-red-500" strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Add Funds</h2>
                      <p className="text-white/90 text-sm">Quick & Secure Payment</p>
                    </div>
                  </div>
                  
                  <Link 
                    href="/howtodeposite" 
                    className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white font-medium rounded-xl hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
                  >
                    <Info size={16} />
                    <span>Help</span>
                  </Link>
                </div>
                
                {/* Balance Display (if you have balance data) */}
                <div className="mt-4 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-white/90 text-sm">Current Balance</span>
                    <span className="text-white font-bold text-lg">₵0.00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Info Alert */}
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Info className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-gray-700 text-sm">
                      <span className="font-semibold text-gray-900">Need assistance?</span> View our{' '}
                      <Link href="/howtodeposite" className="text-red-600 hover:text-red-700 underline font-semibold">
                        deposit guide
                      </Link>
                      {' '}for step-by-step instructions
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Display with Manual Option */}
              {error && (
                <div className="mb-6 animate-fadeIn">
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                    <div className="flex items-start space-x-3 mb-3">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-red-700 text-sm font-medium">{error}</span>
                    </div>
                    
                    {/* Show manual deposit option if API fails */}
                    {error.includes('unavailable') && (
                      <div className="mt-3 pt-3 border-t border-red-200">
                        <p className="text-gray-700 text-sm font-semibold mb-2">Alternative Deposit Method:</p>
                        <div className="bg-white p-3 rounded-lg space-y-2">
                          <p className="text-sm text-gray-600">
                            Send payment via MoMo to: <span className="font-bold text-gray-900">0597760914</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Name: <span className="font-bold text-gray-900">KOJO Frimpong</span>
                          </p>
                          <p className="text-sm text-red-600 font-semibold">
                            Include your email as reference
                          </p>
                        </div>
                        <a
                          href="mailto:support@unlimiteddata-gh.com?subject=Deposit%20Assistance"
                          className="mt-3 inline-flex items-center text-red-600 hover:text-red-700 font-semibold text-sm"
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
                <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 animate-fadeIn">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-green-700 text-sm font-medium">{success}</span>
                  </div>
                </div>
              )}

              {/* Quick Amount Selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold mb-3 text-gray-900">
                  Select Amount
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {quickAmounts.map((qa) => (
                    <button
                      key={qa.value}
                      type="button"
                      onClick={() => handleQuickAmount(qa.value)}
                      className={`relative p-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 ${
                        selectedAmount === qa.value
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                          : 'bg-white border-2 border-red-200 text-gray-700 hover:border-red-400'
                      }`}
                    >
                      {qa.popular && (
                        <span className="absolute -top-2 -right-2 px-2 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full">
                          Popular
                        </span>
                      )}
                      {qa.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deposit Form */}
              <form onSubmit={handleDeposit} className="space-y-6">
                <div>
                  <label htmlFor="amount" className="block text-sm font-bold mb-2 text-gray-900">
                    Or Enter Custom Amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-red-500 text-xl font-bold">₵</span>
                    </div>
                    <input
                      type="number"
                      id="amount"
                      className="pl-12 pr-4 py-4 block w-full rounded-xl bg-gray-50 border-2 border-red-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 font-bold text-lg transition-all"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={handleAmountChange}
                      min="10"
                      max="10000"
                      step="0.01"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <DollarSign className="w-5 h-5 text-red-400" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Minimum: ₵10 • Maximum: ₵10,000
                  </p>
                </div>
                
                {/* Amount Breakdown */}
                {amount && parseFloat(amount) > 0 && (
                  <div className="p-5 bg-gradient-to-br from-red-50 to-white rounded-xl border border-red-200 animate-fadeIn">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-red-500" />
                      Payment Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-700">
                        <span className="text-sm">Deposit Amount</span>
                        <span className="font-bold text-gray-900">₵{parseFloat(amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span className="text-sm flex items-center">
                          Processing Fee
                          <span className="ml-1 text-xs text-gray-500">(3%)</span>
                        </span>
                        <span className="font-bold text-gray-900">₵{fee}</span>
                      </div>
                      <div className="border-t-2 border-red-200 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900">Total Amount</span>
                          <span className="text-xl font-bold text-red-600">₵{totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !amount || parseFloat(amount) < 10}
                  className={`w-full flex items-center justify-center py-4 px-6 rounded-xl text-white font-bold transition-all duration-300 transform ${
                    isLoading || !amount || parseFloat(amount) < 10
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:scale-105 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="mr-3 animate-spin">
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full"></div>
                      </div>
                      Processing Payment...
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
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-gray-600 font-medium">256-bit Encryption</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <BadgeCheck className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-gray-600 font-medium">Verified by Paystack</span>
                  </div>
                </div>
              </div>

              {/* Footer Links */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <Link 
                    href="/myorders" 
                    className="flex items-center text-red-600 hover:text-red-700 font-semibold text-sm transition-colors"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Transaction History
                  </Link>
                  <Link 
                    href="/support" 
                    className="flex items-center text-gray-600 hover:text-red-600 font-medium text-sm transition-colors"
                  >
                    Need Help?
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Account Status Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
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
                  
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-200 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">MoMo Number:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-900">0597760914</span>
                          <button 
                            onClick={copyMomoNumber}
                            className="p-1 rounded hover:bg-white/50 transition-colors"
                          >
                            <Copy size={14} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Name:</span>
                        <span className="font-bold text-gray-900">KOJO Frimpong</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Amount:</span>
                        <span className="font-bold text-red-600 text-lg">₵100</span>
                      </div>
                    </div>
                  </div>
                  
                  {copySuccess && (
                    <p className="text-center text-green-600 text-sm font-medium mb-2 animate-fadeIn">
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
                className="flex-1 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl text-center transition-all transform hover:scale-105"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Add animations */}
      <style jsx>{`
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
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}