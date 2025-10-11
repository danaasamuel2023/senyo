'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CheckCircle, XCircle, Loader2, ArrowRight, Wallet, 
  AlertTriangle, RefreshCw, Clock, Shield 
} from 'lucide-react';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://unlimitedata.onrender.com';

const PaymentVerificationPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Processing your payment...');
  const [paymentData, setPaymentData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [userBalance, setUserBalance] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 5000;

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
    
    // Get auth token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      setAuthToken(token);
    }
  }, []);

  // Verify payment function
  const verifyPayment = useCallback(async (reference, isRetry = false) => {
    try {
      if (!isRetry) {
        setMessage('Verifying your payment with Paystack...');
        setStatus('loading');
      } else {
        setIsRetrying(true);
        setMessage(`Retrying verification... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
      }
      
      const response = await fetch(
        `${API_BASE_URL}/api/v1/verify-payment?reference=${reference}`, 
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken || ''}`
          }
        }
      );

      const data = await response.json();
      console.log('Verification response:', data);

      if (data.success) {
        setStatus('success');
        setMessage('Payment verified successfully! Your wallet has been updated.');
        setPaymentData(data.data);
        
        // Update user balance
        if (data.data.newBalance !== undefined) {
          setUserBalance(data.data.newBalance);
          
          // Update localStorage
          if (typeof window !== 'undefined') {
            try {
              const storedUserData = localStorage.getItem('userData');
              const userData = storedUserData ? JSON.parse(storedUserData) : {};
              
              const updatedUserData = {
                ...userData,
                walletBalance: data.data.newBalance
              };
              
              localStorage.setItem('userData', JSON.stringify(updatedUserData));
            } catch (error) {
              console.error('Error updating localStorage:', error);
            }
          }
        }

        // Redirect after 5 seconds
        setTimeout(() => {
          router.push('/');
        }, 5000);
      } else {
        // Handle errors
        if (data.message?.includes('pending') || data.message?.includes('processing')) {
          setStatus('pending');
          setMessage('Payment is still being processed. Please wait...');
          
          if (retryCount < MAX_RETRIES) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              verifyPayment(reference, true);
            }, RETRY_DELAY);
          } else {
            setStatus('error');
            setMessage('Payment verification timed out. Please contact support if payment was successful.');
          }
        } else {
          setStatus('error');
          setMessage(data.message || 'Payment verification failed');
        }
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          verifyPayment(reference, true);
        }, RETRY_DELAY);
      } else {
        setStatus('error');
        setMessage('Failed to verify payment. Please check your connection.');
      }
    } finally {
      setIsRetrying(false);
    }
  }, [authToken, retryCount, router]);

  // Start verification when component mounts
  useEffect(() => {
    if (!mounted || !authToken) return;

    const reference = searchParams.get('reference');
    const source = searchParams.get('source');
    const trxref = searchParams.get('trxref');

    console.log('Payment params:', { reference, source, trxref });

    if (!reference) {
      setStatus('error');
      setMessage('No payment reference found in URL');
      return;
    }

    verifyPayment(reference);
  }, [mounted, authToken, searchParams, verifyPayment]);

  const handleRetry = () => {
    const reference = searchParams.get('reference');
    if (reference) {
      setRetryCount(0);
      setStatus('loading');
      verifyPayment(reference);
    }
  };

  const formatAmount = (amount) => {
    return `₵${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
        );
      case 'success':
        return (
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        );
      case 'error':
        return (
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
        );
      case 'pending':
        return (
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-yellow-100">
            <Clock className="w-12 h-12 text-yellow-600 animate-pulse" />
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading': return 'Processing Payment';
      case 'success': return 'Payment Successful!';
      case 'error': return 'Payment Verification Failed';
      case 'pending': return 'Payment Processing';
      default: return 'Processing Payment';
    }
  };

  // Show loading until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-8 text-center border border-[#FFCC08]/20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 mb-6">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-blue-600">Loading...</h1>
            <p className="text-gray-300">Initializing payment verification...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-[#FFCC08]/5 to-[#FFD700]/5 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-[#FFD700]/5 to-black blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center border border-[#FFCC08]/20">
          
          {/* Status Icon */}
          <div className="mb-6">
            {getStatusIcon()}
          </div>

          {/* Status Title */}
          <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
            {getStatusTitle()}
          </h1>

          {/* Status Message */}
          <p className="text-gray-300 mb-6 leading-relaxed">
            {message}
          </p>

          {/* Retry Indicator */}
          {isRetrying && (
            <div className="mb-6 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
                <span className="text-yellow-300 text-sm">Retrying verification...</span>
              </div>
            </div>
          )}

          {/* Payment Details */}
          {paymentData && status === 'success' && (
            <div className="bg-gradient-to-br from-[#FFCC08]/10 to-[#FFD700]/10 rounded-xl p-6 mb-6 border border-[#FFCC08]/30">
              <div className="flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-[#FFCC08] mr-2" />
                <h3 className="font-bold text-white">Payment Details</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Amount:</span>
                  <span className="font-bold text-[#FFCC08] text-lg">
                    {formatAmount(paymentData.amount)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Reference:</span>
                  <span className="font-mono text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                    {paymentData.reference}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Status:</span>
                  <span className="text-green-400 font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Completed
                  </span>
                </div>
                
                {userBalance !== null && (
                  <div className="pt-3 border-t border-[#FFCC08]/30">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">New Balance:</span>
                      <span className="font-bold text-white text-lg">
                        {formatAmount(userBalance)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'success' && (
              <>
                <button
                  onClick={() => router.push('/')}
                  className="w-full flex items-center justify-center py-3 px-6 rounded-xl bg-gradient-to-r from-[#FFCC08] to-[#FFD700] text-black font-bold hover:from-[#FFD700] hover:to-[#FFCC08] transition-all duration-300 transform hover:scale-105"
                >
                  <Wallet className="mr-2 w-5 h-5" />
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                
                <button
                  onClick={() => router.push('/myorders')}
                  className="w-full py-3 px-6 rounded-xl bg-gray-700/50 text-white font-medium hover:bg-gray-600/50 transition-all duration-300"
                >
                  View Transaction History
                </button>
              </>
            )}
            
            {status === 'error' && (
              <button
                onClick={handleRetry}
                className="w-full flex items-center justify-center py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
              >
                <RefreshCw className="mr-2 w-5 h-5" />
                Try Again
              </button>
            )}
            
            {status === 'pending' && (
              <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-300 font-medium">Payment Processing</span>
                </div>
                <p className="text-yellow-200 text-sm">
                  Your payment is being processed. This may take a few minutes.
                </p>
              </div>
            )}
          </div>

          {/* Auto-redirect notice */}
          {status === 'success' && (
            <div className="mt-6 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-sm">
                  Redirecting to dashboard in 5 seconds...
                </span>
              </div>
            </div>
          )}

          {/* Support Information */}
          {(status === 'error' || status === 'pending') && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-gray-400 text-sm mb-3">
                Need help with your payment?
              </p>
              <a
                href="mailto:support@unlimiteddata-gh.com?subject=Payment%20Verification%20Issue"
                className="inline-flex items-center text-[#FFCC08] hover:text-[#FFD700] font-medium text-sm transition-colors"
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Contact Support
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentVerificationPage;