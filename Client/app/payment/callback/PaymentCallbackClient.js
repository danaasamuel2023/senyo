'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

export default function PaymentCallbackClient({ searchParams }) {
  const router = useRouter();
  const [status, setStatus] = useState('processing'); // processing, success, failed
  const [message, setMessage] = useState('');
  const [transactionData, setTransactionData] = useState(null);

  useEffect(() => {
    const handlePaymentCallback = async () => {
      console.log('🔍 Payment callback processing started');
      let reference = searchParams?.reference;
      const source = searchParams?.source;
      const trxref = searchParams?.trxref;
      
      // Fix duplicate reference issue - take only the first one if comma-separated
      if (reference && reference.includes(',')) {
        reference = reference.split(',')[0].trim();
        console.log('🔧 Fixed duplicate reference:', reference);
      }
      
      console.log('🔍 URL params:', { reference, source, trxref });

      // Check if we've already processed this reference to prevent loops
      const processedRefs = JSON.parse(localStorage.getItem('processedPayments') || '[]');
      if (processedRefs.includes(reference)) {
        console.log('🔄 Payment already processed, redirecting to dashboard');
        router.push('/');
        return;
      }

      if (!reference) {
        console.log('❌ No reference found');
        setStatus('failed');
        setMessage('No payment reference found');
        return;
      }

      try {
        console.log('Payment callback received:', { reference, source });

        // Call our internal API route for payment verification
        console.log('Calling internal payment callback API');
        
        const response = await fetch(`/api/payment/callback?reference=${reference}&source=${source || ''}&trxref=${trxref || ''}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const paymentData = await response.json();
        console.log('Payment verification response:', paymentData);

        if (paymentData.success) {
          // Update user wallet balance in localStorage using backend-provided balance
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          const backendBalance = paymentData.data.newBalance;
          
          if (backendBalance !== undefined) {
            // Use the balance from backend verification (more accurate)
            userData.walletBalance = backendBalance;
            localStorage.setItem('userData', JSON.stringify(userData));
            console.log('✅ Wallet balance updated from backend:', backendBalance);
          } else {
            // Fallback: calculate locally if backend doesn't provide balance
            const currentBalance = userData.walletBalance || 0;
            const paymentAmount = paymentData.data.amount || 0;
            const newBalance = currentBalance + paymentAmount;
            
            userData.walletBalance = newBalance;
            localStorage.setItem('userData', JSON.stringify(userData));
            console.log('⚠️ Wallet balance calculated locally:', newBalance);
          }
        }

        const result = {
          success: paymentData.success,
          data: paymentData.data,
          status: response.status
        };
        
        console.log('Payment verification completed:', result);
        
        // Convert result to fetch-like response format
        const apiResponse = {
          ok: result.success,
          status: result.status,
          json: async () => result.data
        };

        console.log('API response status:', apiResponse.status);
        const data = await apiResponse.json();
        console.log('Payment verification response:', { response: apiResponse.status, data });

        if (apiResponse.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'Payment successful! Your wallet has been credited.');
          setTransactionData(data.data);
          
          // Mark this payment as processed to prevent loops
          const processedRefs = JSON.parse(localStorage.getItem('processedPayments') || '[]');
          processedRefs.push(reference);
          localStorage.setItem('processedPayments', JSON.stringify(processedRefs));
          
          // Redirect to dashboard after 2 seconds (reduced from 3)
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          setStatus('failed');
          
          // Handle different error types with user-friendly messages
          if (data.error === 'Transaction not found') {
            setMessage('This payment reference was not found. Please contact support if you completed a payment.');
          } else if (data.error === 'Invalid transaction reference format') {
            setMessage('Invalid payment reference format. Please contact support.');
          } else if (data.error === 'Backend verification failed') {
            if (data.data?.status === 'pending') {
              setMessage('Payment verification is pending. Please check your wallet balance or try again later.');
            } else {
              setMessage('Payment verification failed. Please contact support if you completed a payment.');
            }
          } else if (data.message === 'Payment not completed' && data.data?.status === 'abandoned') {
            setMessage('Payment was not completed. Please try again or contact support if you believe this is an error.');
          } else if (data.message === 'Payment not completed') {
            setMessage('Payment verification is still pending. Please wait a moment and refresh the page.');
          } else {
            setMessage(data.error || data.message || 'Payment verification failed. Please contact support.');
          }
          console.error('Payment verification failed:', data);
        }
      } catch (error) {
        console.error('Payment callback error:', error);
        setStatus('failed');
        setMessage('An error occurred while verifying your payment. Please try again or contact support.');
      }
    };

    // Add a small delay to ensure DOM is ready
    setTimeout(handlePaymentCallback, 100);
  }, [searchParams, router]);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <AlertCircle className="w-16 h-16 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-500';
      case 'success':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 text-center border border-gray-800">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>

          {/* Status Title */}
          <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
            {status === 'processing' && 'Processing Payment...'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'failed' && 'Payment Failed'}
          </h1>

          {/* Message */}
          <p className="text-gray-300 mb-6">
            {message}
          </p>

          {/* Transaction Details */}
          {transactionData && (
            <div className="bg-gray-800/50 rounded-xl p-4 mb-6 text-left">
              <h3 className="text-white font-semibold mb-3">Transaction Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Reference:</span>
                  <span className="text-white font-mono">{transactionData.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white">₵{transactionData.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400 capitalize">{transactionData.status}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'success' && (
              <div className="text-sm text-gray-400">
                Redirecting to dashboard in 2 seconds...
              </div>
            )}
            
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#FFCC08] to-[#FFD700] hover:from-[#FFD700] hover:to-[#FFCC08] text-black font-bold rounded-xl transition-all transform hover:scale-105"
            >
              Go to Dashboard
            </button>

            {status === 'failed' && (
              <button
                onClick={() => router.push('/topup')}
                className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all"
              >
                Try Again
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>Need help? Contact our support team</p>
          <a 
            href="mailto:support@www.unlimiteddatagh.com" 
            className="text-[#FFCC08] hover:text-[#FFD700] transition-colors"
          >
            support@www.unlimiteddatagh.com
          </a>
        </div>
      </div>
    </div>
  );
}
