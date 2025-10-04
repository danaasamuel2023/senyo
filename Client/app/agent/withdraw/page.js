'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, DollarSign, CreditCard, Phone, Building, User,
  CheckCircle, AlertCircle, X, Loader2, TrendingUp, Clock,
  Shield, Info, ArrowRight
} from 'lucide-react';

const AgentWithdraw = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState(null);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [notification, setNotification] = useState(null);
  
  const [withdrawalData, setWithdrawalData] = useState({
    amount: '',
    withdrawalMethod: 'bank',
    accountDetails: {
      bankName: '',
      accountName: '',
      accountNumber: '',
      momoNumber: ''
    }
  });

  useEffect(() => {
    checkAuth();
    loadWithdrawalData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!token || user.role !== 'agent') {
      router.push('/SignIn');
      return false;
    }
    
    setUserData(user);
    return true;
  };

  const loadWithdrawalData = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5001'
        : 'https://unlimitedata.onrender.com';

      // Get earnings to calculate available balance
      const earningsResponse = await fetch(`${API_URL}/api/agent/earnings`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('authToken')
        }
      });

      if (earningsResponse.ok) {
        const earningsData = await earningsResponse.json();
        const totalEarnings = earningsData.earnings.totalEarnings;
        const totalWithdrawn = userData?.agentMetadata?.totalWithdrawn || 0;
        setAvailableBalance(totalEarnings - totalWithdrawn);
      }

      // Load withdrawal history
      const withdrawalHistory = userData?.agentMetadata?.withdrawalHistory || [];
      setWithdrawalHistory(withdrawalHistory);

    } catch (error) {
      console.error('Failed to load withdrawal data:', error);
      showNotification('Failed to load withdrawal data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('accountDetails.')) {
      const field = name.split('.')[1];
      setWithdrawalData(prev => ({
        ...prev,
        accountDetails: {
          ...prev.accountDetails,
          [field]: value
        }
      }));
    } else {
      setWithdrawalData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!withdrawalData.amount || withdrawalData.amount <= 0) {
      showNotification('Please enter a valid amount', 'error');
      return;
    }

    if (withdrawalData.amount > availableBalance) {
      showNotification('Insufficient balance', 'error');
      return;
    }

    if (withdrawalData.withdrawalMethod === 'bank') {
      if (!withdrawalData.accountDetails.bankName || !withdrawalData.accountDetails.accountName || !withdrawalData.accountDetails.accountNumber) {
        showNotification('Please fill in all bank account details', 'error');
        return;
      }
    } else if (withdrawalData.withdrawalMethod === 'momo') {
      if (!withdrawalData.accountDetails.momoNumber) {
        showNotification('Please enter your mobile money number', 'error');
        return;
      }
    }

    setSubmitting(true);
    try {
      const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5001'
        : 'https://unlimitedata.onrender.com';

      const response = await fetch(`${API_URL}/api/agent/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('authToken')
        },
        body: JSON.stringify(withdrawalData)
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Withdrawal request submitted successfully!', 'success');
        setWithdrawalData({
          amount: '',
          withdrawalMethod: 'bank',
          accountDetails: {
            bankName: '',
            accountName: '',
            accountNumber: '',
            momoNumber: ''
          }
        });
        // Refresh data
        await loadWithdrawalData();
      } else {
        showNotification(data.msg || 'Withdrawal request failed', 'error');
      }
    } catch (error) {
      console.error('Withdrawal request error:', error);
      showNotification('Withdrawal request failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-green-600/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-600 border-r-green-500 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-green-600 to-green-800 animate-pulse flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white animate-bounce" strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-green-600 animate-pulse">
              Loading Withdrawal
            </h1>
            <div className="flex items-center justify-center space-x-2 text-green-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Preparing withdrawal form...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-green-600/10 to-green-800/10 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-green-800/10 to-black blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg flex items-center space-x-3 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => router.push('/agent/dashboard')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Withdraw Earnings</h1>
              <p className="text-gray-400 mt-1">Request withdrawal of your commission earnings</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Withdrawal Form */}
          <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-800">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow">
                <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Request Withdrawal</h2>
                <p className="text-gray-500 text-xs">Submit your withdrawal request</p>
              </div>
            </div>

            {/* Available Balance */}
            <div className="mb-6 p-4 bg-gradient-to-r from-green-600/20 to-green-800/20 rounded-xl border border-green-600/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm font-medium">Available Balance</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(availableBalance)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Withdrawal Amount (GHS)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={withdrawalData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="1"
                    max={availableBalance}
                    step="0.01"
                    className="pl-10 pr-4 py-3 block w-full rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-600 focus:border-green-600"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: GHS 1.00 • Maximum: {formatCurrency(availableBalance)}
                </p>
              </div>

              {/* Withdrawal Method */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Withdrawal Method
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 bg-gray-800 rounded-xl border border-gray-700 hover:border-green-600/50 transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="withdrawalMethod"
                      value="bank"
                      checked={withdrawalData.withdrawalMethod === 'bank'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-green-600 focus:ring-green-600"
                    />
                    <div className="flex items-center space-x-2">
                      <Building className="w-5 h-5 text-gray-400" />
                      <span className="text-white font-medium">Bank Transfer</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-gray-800 rounded-xl border border-gray-700 hover:border-green-600/50 transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="withdrawalMethod"
                      value="momo"
                      checked={withdrawalData.withdrawalMethod === 'momo'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-green-600 focus:ring-green-600"
                    />
                    <div className="flex items-center space-x-2">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-white font-medium">Mobile Money</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Account Details */}
              {withdrawalData.withdrawalMethod === 'bank' ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-300">Bank Account Details</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      name="accountDetails.bankName"
                      value={withdrawalData.accountDetails.bankName}
                      onChange={handleInputChange}
                      placeholder="e.g., GCB Bank, Ecobank"
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-600 focus:border-green-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Account Name
                    </label>
                    <input
                      type="text"
                      name="accountDetails.accountName"
                      value={withdrawalData.accountDetails.accountName}
                      onChange={handleInputChange}
                      placeholder="Account holder name"
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-600 focus:border-green-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      name="accountDetails.accountNumber"
                      value={withdrawalData.accountDetails.accountNumber}
                      onChange={handleInputChange}
                      placeholder="Bank account number"
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-600 focus:border-green-600"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mobile Money Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="accountDetails.momoNumber"
                      value={withdrawalData.accountDetails.momoNumber}
                      onChange={handleInputChange}
                      placeholder="+233501234567"
                      className="pl-10 pr-4 py-3 block w-full rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-600 focus:border-green-600"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || availableBalance <= 0}
                className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    <span>Submit Withdrawal Request</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Withdrawal History */}
          <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-800">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow">
                <Clock className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Withdrawal History</h2>
                <p className="text-gray-500 text-xs">Your recent withdrawal requests</p>
              </div>
            </div>

            {withdrawalHistory.length > 0 ? (
              <div className="space-y-3">
                {withdrawalHistory.slice(0, 5).map((withdrawal, index) => (
                  <div key={index} className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          withdrawal.status === 'completed' ? 'bg-green-500' :
                          withdrawal.status === 'pending' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                        <span className="text-sm font-medium text-white capitalize">
                          {withdrawal.status}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-green-400">
                        {formatCurrency(withdrawal.amount)}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>{withdrawal.withdrawalMethod === 'bank' ? 'Bank Transfer' : 'Mobile Money'}</p>
                      <p>{formatDate(withdrawal.requestedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-300 text-sm font-medium">No withdrawal history</p>
                <p className="text-gray-500 text-xs mt-1">Your withdrawal requests will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Important Information */}
        <div className="mt-6 bg-blue-900/20 border border-blue-600/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>Important Information</span>
          </h3>
          <ul className="space-y-2 text-sm text-blue-200">
            <li className="flex items-start space-x-2">
              <span>•</span>
              <span>Withdrawal requests are processed within 24-48 hours during business days</span>
            </li>
            <li className="flex items-start space-x-2">
              <span>•</span>
              <span>Minimum withdrawal amount is GHS 1.00</span>
            </li>
            <li className="flex items-start space-x-2">
              <span>•</span>
              <span>Ensure your account details are correct to avoid delays</span>
            </li>
            <li className="flex items-start space-x-2">
              <span>•</span>
              <span>You can only withdraw your available commission earnings</span>
            </li>
            <li className="flex items-start space-x-2">
              <span>•</span>
              <span>Contact support if you have any issues with your withdrawal</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AgentWithdraw;
