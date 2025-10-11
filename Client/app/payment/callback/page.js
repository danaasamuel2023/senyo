'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, ArrowRight, Wallet, RefreshCw } from 'lucide-react';

const PaymentCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying payment...');
  const [transactionData, setTransactionData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const reference = searchParams.get('reference');
        const trxref = searchParams.get('trxref');
        
        if (!reference && !trxref) {
          setStatus('error');
          setError('No payment reference found');
          return;
        }

        const paymentReference = reference || trxref;
        
        // Get auth token
        const token = localStorage.getItem('authToken');
        if (!token) {
          setStatus('error');
          setError('Authentication required');
          return;
        }

        // Verify payment with our backend
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://unlimitedata.onrender.com';
        const response = await fetch(`${API_URL}/api/v1/verify-payment?reference=${paymentReference}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('Payment completed successfully!');
          setTransactionData(data.data);
          
          // Redirect to wallet page after 3 seconds
          setTimeout(() => {
            router.push('/wallet');
          }, 3000);
        } else {
          setStatus('error');
          setError(data.message || 'Payment verification failed');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setStatus('error');
        setError('Failed to verify payment. Please try again.');
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  const handleRetry = () => {
    setStatus('loading');
    setMessage('Verifying payment...');
    setError('');
    setTransactionData(null);
    
    // Retry verification
    const verifyPayment = async () => {
      try {
        const reference = searchParams.get('reference');
        const trxref = searchParams.get('trxref');
        const paymentReference = reference || trxref;
        
        const token = localStorage.getItem('authToken');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://unlimitedata.onrender.com';
        
        const response = await fetch(`${API_URL}/api/v1/verify-payment?reference=${paymentReference}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('Payment completed successfully!');
          setTransactionData(data.data);
          
          setTimeout(() => {
            router.push('/wallet');
          }, 3000);
        } else {
          setStatus('error');
          setError(data.message || 'Payment verification failed');
        }
      } catch (err) {
        setStatus('error');
        setError('Failed to verify payment. Please try again.');
      }
    };

    verifyPayment();
  };

  const handleGoToWallet = () => {
    router.push('/wallet');
  };

  const handleGoToTopup = () => {
    router.push('/topup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-8 text-center border border-gray-700/50">
          {/* Loading State */}
          {status === 'loading' && (
            <>
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="w-20 h-20 rounded-full border-4 border-gray-200/20"></div>
                <div className="absolute top-0 w-20 h-20 rounded-full border-4 border-transparent border-t-[#FFCC08] animate-spin"></div>
                <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#FFCC08] to-[#FFD700] animate-pulse flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-black animate-spin" strokeWidth={2.5} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verifying Payment</h2>
              <p className="text-gray-400 mb-6">{message}</p>
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-[#FFCC08] to-[#FFD700] h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
              <p className="text-gray-400 mb-6">{message}</p>
              
              {transactionData && (
                <div className="bg-gray-700/30 rounded-xl p-4 mb-6 text-left">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount:</span>
                      <span className="text-white font-bold">₵{transactionData.amount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reference:</span>
                      <span className="text-white font-mono text-sm">{transactionData.reference}</span>
                    </div>
                    {transactionData.newBalance && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">New Balance:</span>
                        <span className="text-[#FFCC08] font-bold">₵{transactionData.newBalance.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <button
                  onClick={handleGoToWallet}
                  className="w-full flex items-center justify-center py-3 px-6 rounded-xl bg-gradient-to-r from-[#FFCC08] to-[#FFD700] text-black font-bold hover:from-[#FFD700] hover:to-[#FFCC08] transition-all duration-300 transform hover:scale-105"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  View Wallet
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <p className="text-gray-400 text-sm">
                  Redirecting to wallet in 3 seconds...
                </p>
              </div>
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
              <p className="text-gray-400 mb-6">{error}</p>
              
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full flex items-center justify-center py-3 px-6 rounded-xl bg-gradient-to-r from-[#FFCC08] to-[#FFD700] text-black font-bold hover:from-[#FFD700] hover:to-[#FFCC08] transition-all duration-300 transform hover:scale-105"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Retry Verification
                </button>
                
                <button
                  onClick={handleGoToTopup}
                  className="w-full flex items-center justify-center py-3 px-6 rounded-xl bg-gray-700/50 text-white font-bold hover:bg-gray-600/50 transition-all duration-300"
                >
                  Try Another Deposit
                </button>
                
                <button
                  onClick={handleGoToWallet}
                  className="w-full flex items-center justify-center py-3 px-6 rounded-xl bg-gray-700/50 text-white font-bold hover:bg-gray-600/50 transition-all duration-300"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Go to Wallet
                </button>
              </div>
            </>
          )}
        </div>
        
        {/* Support Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Need help? Contact{' '}
            <a 
              href="mailto:support@unlimiteddata-gh.com" 
              className="text-[#FFCC08] hover:text-[#FFD700] font-medium"
            >
              support@unlimiteddata-gh.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;