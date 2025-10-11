'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Wallet, Plus, ArrowRight, RefreshCw, History, TrendingUp, 
  DollarSign, Eye, EyeOff, CreditCard, Smartphone, Banknote,
  CheckCircle, XCircle, Clock, AlertCircle
} from 'lucide-react';

const WalletPage = () => {
  const router = useRouter();
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') return;
      
      const userData = localStorage.getItem('userData');
      const authToken = localStorage.getItem('authToken');
      
      if (userData && authToken) {
        setIsAuthenticated(true);
        loadWalletData();
      } else {
        router.push('/SignIn');
      }
    };
    
    checkAuth();
  }, [router]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://unlimitedata.onrender.com';
      
      // Load wallet balance
      const balanceResponse = await fetch(`${API_URL}/api/wallet/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        setWalletData(balanceData);
      }
      
      // Load recent transactions
      const transactionsResponse = await fetch(`${API_URL}/api/wallet/transactions?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions || []);
      }
      
    } catch (error) {
      console.error('Error loading wallet data:', error);
      setError('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return `₵${Math.abs(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <Plus className="w-5 h-5 text-green-400" />;
      case 'purchase':
        return <CreditCard className="w-5 h-5 text-blue-400" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTransactionStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
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

      {/* Main Content */}
      <div className="relative z-10 px-4 py-6 max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
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
                <h1 className="text-2xl sm:text-3xl font-bold text-white">My Wallet</h1>
                <p className="text-gray-400 mt-1">Manage your account balance</p>
              </div>
            </div>
            <button
              onClick={loadWalletData}
              disabled={loading}
              className="p-2.5 hover:bg-gray-800/50 rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-[#FFCC08] ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-[#FFCC08]/10 to-[#FFD700]/10 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-[#FFCC08]/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FFCC08] to-[#FFD700] rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-black" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Current Balance</p>
                <div className="flex items-center space-x-2">
                  <p className="text-white font-bold text-2xl">
                    {showBalance ? formatAmount(walletData?.balance || 0) : '₵••••••'}
                  </p>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {showBalance ? (
                      <EyeOff className="w-4 h-4 text-white/60" />
                    ) : (
                      <Eye className="w-4 h-4 text-white/60" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-sm">Currency</p>
              <p className="text-white font-bold">GHS</p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex space-x-3">
            <button
              onClick={() => router.push('/topup')}
              className="flex-1 flex items-center justify-center py-3 px-4 bg-gradient-to-r from-[#FFCC08] to-[#FFD700] text-black font-bold rounded-xl hover:from-[#FFD700] hover:to-[#FFCC08] transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Deposit
            </button>
            <button
              onClick={() => router.push('/wallet/transactions')}
              className="flex-1 flex items-center justify-center py-3 px-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              <History className="w-5 h-5 mr-2" />
              History
            </button>
          </div>
        </div>

        {/* Wallet Stats */}
        {walletData?.stats && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800/30 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Total Deposits</p>
                  <p className="text-white font-bold">{formatAmount(walletData.stats.totalDeposits)}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Total Spent</p>
                  <p className="text-white font-bold">{formatAmount(walletData.stats.totalSpent)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <History className="w-5 h-5 mr-2 text-[#FFCC08]" />
              Recent Transactions
            </h2>
            <button
              onClick={() => router.push('/wallet/transactions')}
              className="text-[#FFCC08] hover:text-[#FFD700] font-medium text-sm flex items-center"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-700/50 rounded-xl"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700/50 rounded mb-2"></div>
                      <div className="h-3 bg-gray-700/30 rounded w-2/3"></div>
                    </div>
                    <div className="h-4 bg-gray-700/50 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-xl bg-gray-700/20 hover:bg-gray-700/30 transition-colors">
                  <div className="w-12 h-12 bg-gray-700/50 rounded-xl flex items-center justify-center">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-white font-medium">
                        {transaction.description || `${transaction.type} transaction`}
                      </p>
                      {getTransactionStatusIcon(transaction.status)}
                    </div>
                    <p className="text-white/60 text-sm">
                      {formatDate(transaction.createdAt)}
                    </p>
                    {transaction.reference && (
                      <p className="text-white/40 text-xs font-mono">
                        {transaction.reference}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'}{formatAmount(transaction.amount)}
                    </p>
                    {transaction.balanceAfter && (
                      <p className="text-white/60 text-sm">
                        Balance: {formatAmount(transaction.balanceAfter)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-white/60 mb-4">No transactions yet</p>
              <button
                onClick={() => router.push('/topup')}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#FFCC08] to-[#FFD700] text-black font-bold rounded-xl hover:from-[#FFD700] hover:to-[#FFCC08] transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Make Your First Deposit
              </button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-500/10 backdrop-blur-sm border border-red-500/30">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-red-200 text-sm font-medium">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
