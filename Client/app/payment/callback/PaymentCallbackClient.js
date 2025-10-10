'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

export default function PaymentCallbackClient({ searchParams }) {
  const router = useRouter();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing your payment...');
  const [transactionData, setTransactionData] = useState(null);
  
  // Use ref to prevent duplicate processing
  const hasProcessed = useRef(false);
  const processingRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate execution
    if (hasProcessed.current || processingRef.current) {
      console.log('🔄 Already processed or processing, skipping');
      return;
    }

    const handlePaymentCallback = async () => {
      try {
        processingRef.current = true;
        console.log('🔍 Payment callback processing started');

        // Extract and clean reference
        let reference = searchParams?.reference;
        const source = searchParams?.source;
        const trxref = searchParams?.trxref;

        // Fix duplicate reference issue
        if (reference && typeof reference === 'string' && reference.includes(',')) {
          reference = reference.split(',')[0].trim();
          console.log('🔧 Fixed duplicate reference:', reference);
        }

        console.log('🔍 URL params:', { reference, source, trxref });

        // Validate reference
        if (!reference) {
          console.log('❌ No reference found');
          setStatus('failed');
          setMessage('No payment reference found. Please contact support.');
          return;
        }

        // Check localStorage with error handling
        const getFromStorage = (key, defaultValue = '[]') => {
          try {
            return JSON.parse(localStorage.getItem(key) || defaultValue);
          } catch (error) {
            console.error(`Error reading ${key} from localStorage:`, error);
            return JSON.parse(defaultValue);
          }
        };

        const setToStorage = (key, value) => {
          try {
            localStorage.setItem(key, JSON.stringify(value));
          } catch (error) {
            console.error(`Error writing ${key} to localStorage:`, error);
          }
        };

        // Check if already processed
        const processedRefs = getFromStorage('processedPayments');
        if (processedRefs.includes(reference)) {
          console.log('🔄 Payment already processed, redirecting');
          router.push('/');
          return;
        }

        // Mark as processing
        const processingRefs = getFromStorage('processingPayments');
        if (!processingRefs.includes(reference)) {
          processingRefs.push(reference);
          setToStorage('processingPayments', processingRefs);
        }

        // Call payment verification API
        console.log('📞 Calling payment verification API');
        const apiUrl = `/api/payment/callback?reference=${encodeURIComponent(reference)}&source=${encodeURIComponent(source || '')}&trxref=${encodeURIComponent(trxref || '')}`;
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const paymentData = await response.json();
        console.log('📦 Payment verification response:', paymentData);

        // Handle successful payment
        if (response.ok && paymentData.success) {
          console.log('✅ Payment verification successful');

          // Update wallet balance
          try {
            const userData = getFromStorage('userData', '{}');
            const backendBalance = paymentData.data?.newBalance;

            if (backendBalance !== undefined) {
              userData.walletBalance = backendBalance;
              console.log('✅ Wallet balance updated from backend:', backendBalance);
            } else {
              const currentBalance = userData.walletBalance || 0;
              const paymentAmount = paymentData.data?.amount || 0;
              userData.walletBalance = currentBalance + paymentAmount;
              console.log('⚠️ Wallet balance calculated locally:', userData.walletBalance);
            }

            setToStorage('userData', userData);
          } catch (error) {
            console.error('Error updating wallet balance:', error);
          }

          setStatus('success');
          setMessage(paymentData.message || 'Payment successful! Your wallet has been credited.');
          setTransactionData(paymentData.data);

          // Mark as processed
          const updatedProcessedRefs = getFromStorage('processedPayments');
          if (!updatedProcessedRefs.includes(reference)) {
            updatedProcessedRefs.push(reference);
            setToStorage('processedPayments', updatedProcessedRefs);
          }

          // Remove from processing list
          const updatedProcessingRefs = getFromStorage('processingPayments');
          setToStorage('processingPayments', updatedProcessingRefs.filter(ref => ref !== reference));

          // Redirect after delay
          setTimeout(() => {
            router.push('/');
          }, 2000);

        } else {
          // Handle payment failure
          console.log('❌ Payment verification failed');
          setStatus('failed');

          // Determine appropriate error message
          let errorMessage = 'Payment verification failed. Please contact support.';

          if (paymentData.error === 'Transaction not found') {
            errorMessage = 'This payment reference was not found. Please contact support if you completed a payment.';
          } else if (paymentData.error === 'Invalid transaction reference format') {
            errorMessage = 'Invalid payment reference format. Please contact support.';
          } else if (paymentData.error === 'Backend verification failed') {
            errorMessage = paymentData.data?.status === 'pending'
              ? 'Payment verification is pending. Please check your wallet balance or try again later.'
              : 'Payment verification failed. Please contact support if you completed a payment.';
          } else if (paymentData.message === 'Payment not completed' && paymentData.data?.status === 'abandoned') {
            errorMessage = 'Payment was not completed. Please try again or contact support if you believe this is an error.';
          } else if (paymentData.message === 'Payment not completed') {
            errorMessage = 'Payment verification is still pending. Please wait a moment and refresh the page.';
          } else if (paymentData.error || paymentData.message) {
            errorMessage = paymentData.error || paymentData.message;
          }

          setMessage(errorMessage);

          // Remove from processing list
          const updatedProcessingRefs = getFromStorage('processingPayments');
          setToStorage('processingPayments', updatedProcessingRefs.filter(ref => ref !== reference));
        }

      } catch (error) {
        console.error('💥 Payment callback error:', error);
        setStatus('failed');
        setMessage('An error occurred while verifying your payment. Please try again or contact support.');

        // Cleanup processing state
        try {
          const reference = searchParams?.reference;
          if (reference) {
            const processingRefs = JSON.parse(localStorage.getItem('processingPayments') || '[]');
            localStorage.setItem('processingPayments', JSON.stringify(
              processingRefs.filter(ref => ref !== reference)
            ));
          }
        } catch (cleanupError) {
          console.error('Error during cleanup:', cleanupError);
        }
      } finally {
        processingRef.current = false;
        hasProcessed.current = true;
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(handlePaymentCallback, 100);

    return () => {
      clearTimeout(timeoutId);
    };
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

  const getStatusTitle = () => {
    switch (status) {
      case 'processing':
        return 'Processing Payment...';
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      default:
        return 'Payment Status';
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
            {getStatusTitle()}
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
                {transactionData.reference && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reference:</span>
                    <span className="text-white font-mono text-xs break-all">{transactionData.reference}</span>
                  </div>
                )}
                {transactionData.amount !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white">₵{transactionData.amount}</span>
                  </div>
                )}
                {transactionData.status && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-green-400 capitalize">{transactionData.status}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'success' && (
              <div className="text-sm text-gray-400 mb-2">
                Redirecting to dashboard in 2 seconds...
              </div>
            )}
            
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#FFCC08] to-[#FFD700] hover:from-[#FFD700] hover:to-[#FFCC08] text-black font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95"
            >
              Go to Dashboard
            </button>

            {status === 'failed' && (
              <button
                onClick={() => router.push('/topup')}
                className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all active:scale-95"
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
            href="mailto:support@unlimiteddatagh.com" 
            className="text-[#FFCC08] hover:text-[#FFD700] transition-colors"
          >
            support@unlimiteddatagh.com
          </a>
        </div>
      </div>
    </div>
  );
}