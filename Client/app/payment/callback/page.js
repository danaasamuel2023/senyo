'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, ArrowRight, Clock, Wallet } from 'lucide-react';

const PaymentCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error, pending
  const [message, setMessage] = useState('Processing your payment...');
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const reference = searchParams.get('reference');
    const source = searchParams.get('source');

    if (!reference) {
      setStatus('error');
      setMessage('No payment reference found');
      return;
    }

    // Verify payment with backend
    verifyPayment(reference);
  }, [searchParams]);

  const verifyPayment = async (reference) => {
    try {
      setMessage('Verifying your payment with Paystack...');
      
      const token = localStorage.getItem('authToken');
      const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      const baseUrl = isLocalhost ? 'http://localhost:5001' : 'https://unlimitedata.onrender.com';
      
      const response = await fetch(`${baseUrl}/api/v1/verify-payment?reference=${reference}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Payment verification response:', data);

      if (data.success) {
        setStatus('success');
        setMessage('Payment completed successfully! Your wallet has been updated.');
        setPaymentData(data.data);
        
        // Update localStorage with new user data and balance
        if (typeof window !== 'undefined') {
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          if (data.data.newBalance !== undefined) {
            userData.walletBalance = data.data.newBalance;
          }
          localStorage.setItem('userData', JSON.stringify(userData));
        }

        // Redirect to dashboard after 5 seconds
        setTimeout(() => {
          router.push('/');
        }, 5000);
      } else {
        // Handle pending payments
        if (data.message?.includes('pending') || data.message?.includes('still processing')) {
          setStatus('pending');
          setMessage('Payment is still being processed. Please wait...');
          
          // Retry verification after 10 seconds
          setTimeout(() => {
            verifyPayment(reference);
          }, 10000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Payment verification failed');
        }
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('error');
      setMessage('Failed to verify payment. Please check your connection and try again.');
    }
  };

  const handleGoToDashboard = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Status Icon */}
          <div className="mb-6">
            {status === 'loading' && (
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            )}
            {status === 'pending' && (
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100">
                <Clock className="w-10 h-10 text-yellow-600 animate-pulse" />
              </div>
            )}
          </div>

          {/* Status Message */}
          <h1 className={`text-2xl font-bold mb-4 ${
            status === 'success' ? 'text-green-600' : 
            status === 'error' ? 'text-red-600' : 
            status === 'pending' ? 'text-yellow-600' :
            'text-blue-600'
          }`}>
            {status === 'loading' && 'Processing Payment'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'error' && 'Payment Failed'}
            {status === 'pending' && 'Payment Processing'}
          </h1>

          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {/* Payment Details */}
          {paymentData && status === 'success' && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center mb-3">
                <Wallet className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-gray-800">Payment Details</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium text-green-600">₵{paymentData.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reference:</span>
                  <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                    {paymentData.reference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-green-600 font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Completed
                  </span>
                </div>
                {paymentData.newBalance !== undefined && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span>New Balance:</span>
                      <span className="font-bold text-gray-800">₵{paymentData.newBalance}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleGoToDashboard}
            className="w-full flex items-center justify-center py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
          >
            {status === 'success' ? (
              <>
                Go to Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </>
            ) : (
              'Try Again'
            )}
          </button>

          {/* Auto-redirect notice */}
          {status === 'success' && (
            <p className="text-sm text-gray-500 mt-4">
              Redirecting to dashboard in 5 seconds...
            </p>
          )}
          
          {/* Pending payment notice */}
          {status === 'pending' && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-700 text-sm">
                  Payment is being processed. Please wait...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentCallbackPage;