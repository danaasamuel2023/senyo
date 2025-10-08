'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Smartphone, CheckCircle, XCircle, Loader2, CreditCard, Wallet } from 'lucide-react';
import { getApiEndpoint } from '../../utils/apiConfig';

const MomoDepositPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);
  const [isValidating, setIsValidating] = useState(false);

  // Network configurations
  const networks = [
    {
      id: 'MTN',
      name: 'MTN Mobile Money',
      shortName: 'MTN',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500',
      borderColor: 'border-yellow-500',
      logo: '/logos/mtn-logo.svg',
      prefix: '024, 054, 055, 059',
      description: 'Ghana\'s leading mobile money service'
    },
    {
      id: 'VODAFONE',
      name: 'Vodafone Cash',
      shortName: 'Vodafone',
      color: 'bg-red-500',
      textColor: 'text-red-500',
      borderColor: 'border-red-500',
      logo: '/logos/vodafone-logo.svg',
      prefix: '020, 050',
      description: 'Fast and secure mobile money'
    },
    {
      id: 'AIRTELTIGO',
      name: 'AirtelTigo Money',
      shortName: 'AirtelTigo',
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
      borderColor: 'border-blue-500',
      logo: '/logos/airteltigo-logo.svg',
      prefix: '026, 027, 056, 057',
      description: 'Reliable mobile money service'
    }
  ];

  // Fetch current balance
  useEffect(() => {
    fetchCurrentBalance();
  }, []);

  const fetchCurrentBalance = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/SignIn');
        return;
      }

      const response = await fetch(getApiEndpoint('/api/user-dashboard'), {
        headers: {
          'x-auth-token': token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentBalance(data.userBalance || 0);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  // Validate phone number based on network
  const validatePhoneNumber = (phone, network) => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    switch (network) {
      case 'MTN':
        return /^(024|054|055|059)\d{7}$/.test(cleanPhone);
      case 'VODAFONE':
        return /^(020|050)\d{7}$/.test(cleanPhone);
      case 'AIRTELTIGO':
        return /^(026|027|056|057)\d{7}$/.test(cleanPhone);
      default:
        return false;
    }
  };

  // Validate amount
  const validateAmount = (amount) => {
    const numAmount = parseFloat(amount);
    return numAmount >= 1 && numAmount <= 10000;
  };

  // Handle network selection
  const handleNetworkSelect = (networkId) => {
    setSelectedNetwork(networkId);
    setPhoneNumber('');
    setError('');
  };

  // Handle phone number validation
  const handlePhoneValidation = async () => {
    if (!phoneNumber || !selectedNetwork) {
      setError('Please enter a phone number and select a network');
      return;
    }

    if (!validatePhoneNumber(phoneNumber, selectedNetwork)) {
      const network = networks.find(n => n.id === selectedNetwork);
      setError(`Invalid ${network?.shortName} number. Use format: ${network?.prefix}`);
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(getApiEndpoint('/api/v1/validate-number'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          phoneNumber,
          network: selectedNetwork
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setStep(3);
      } else {
        setError(result.error || 'Phone number validation failed');
      }
    } catch (error) {
      console.error('Validation error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  // Handle deposit submission
  const handleDeposit = async () => {
    if (!amount || !validateAmount(amount)) {
      setError('Please enter a valid amount between GHS 1 and GHS 10,000');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userId = userData.id;
      const userEmail = userData.email;

      // Validate user data
      if (!userId || !userEmail) {
        setError('User data not found. Please login again.');
        return;
      }

      // Use the new mobile money deposit endpoint
      const response = await fetch(getApiEndpoint('/api/v1/mobile-money'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          userId,
          amount: parseFloat(amount),
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          network: selectedNetwork,
          email: userEmail,
          paymentMethod: 'mobile_money'
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to Paystack payment page
        window.location.href = result.paystackUrl;
      } else {
        setError(result.error || 'Deposit failed. Please try again.');
      }
    } catch (error) {
      console.error('Deposit error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setStep(1);
    setSelectedNetwork('');
    setPhoneNumber('');
    setAmount('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-yellow-500/20">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-yellow-500" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Mobile Money Deposit</h1>
              <p className="text-sm text-gray-400">Add funds to your wallet</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Balance */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Wallet className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Current Balance</p>
                <p className="text-2xl font-bold text-white">GHS {currentBalance.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= stepNumber
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {step > stepNumber ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  stepNumber
                )}
              </div>
              {stepNumber < 4 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    step > stepNumber ? 'bg-yellow-500' : 'bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>Network</span>
          <span>Details</span>
          <span>Amount</span>
          <span>Confirm</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Step 1: Network Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Select Mobile Money Network</h2>
            
            {networks.map((network) => (
              <div
                key={network.id}
                onClick={() => handleNetworkSelect(network.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedNetwork === network.id
                    ? `${network.borderColor} bg-${network.color.replace('bg-', '')}/10`
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                    <img 
                      src={network.logo} 
                      alt={`${network.name} logo`}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{network.name}</h3>
                    <p className="text-sm text-gray-400">{network.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Prefix: {network.prefix}</p>
                  </div>
                  {selectedNetwork === network.id && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
            ))}

            {selectedNetwork && (
              <button
                onClick={() => setStep(2)}
                className="w-full bg-yellow-500 text-black font-bold py-3 px-4 rounded-xl hover:bg-yellow-400 transition-colors"
              >
                Continue
              </button>
            )}
          </div>
        )}

        {/* Step 2: Phone Number */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-lg ${networks.find(n => n.id === selectedNetwork)?.color} text-white`}>
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Enter Phone Number</h2>
                <p className="text-sm text-gray-400">
                  {networks.find(n => n.id === selectedNetwork)?.name}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={`Enter ${networks.find(n => n.id === selectedNetwork)?.shortName} number`}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: {networks.find(n => n.id === selectedNetwork)?.prefix}
                </p>
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-700 text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePhoneValidation}
                  disabled={isValidating}
                  className="flex-1 bg-yellow-500 text-black font-bold py-3 px-4 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50"
                >
                  {isValidating ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Validating...</span>
                    </div>
                  ) : (
                    'Validate'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Amount */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-yellow-500 text-black">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Enter Amount</h2>
                <p className="text-sm text-gray-400">How much do you want to deposit?</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (GHS)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  max="10000"
                  step="0.01"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: GHS 1.00 | Maximum: GHS 10,000.00
                </p>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 50, 100].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm hover:border-yellow-500 transition-colors"
                  >
                    GHS {quickAmount}
                  </button>
                ))}
              </div>

              {/* Deposit Summary */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Deposit Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network:</span>
                    <span className="text-white">
                      {networks.find(n => n.id === selectedNetwork)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phone:</span>
                    <span className="text-white">{phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white font-semibold">
                      GHS {amount || '0.00'}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-700 text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={isLoading || !amount}
                  className="flex-1 bg-yellow-500 text-black font-bold py-3 px-4 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    'Deposit'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center space-y-6">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Deposit Successful!</h2>
              <p className="text-gray-400 mb-4">
                Your deposit of <span className="text-yellow-500 font-semibold">GHS {amount}</span> has been processed successfully.
              </p>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-sm text-gray-400">New Balance</p>
                <p className="text-2xl font-bold text-white">GHS {(currentBalance + parseFloat(amount)).toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-yellow-500 text-black font-bold py-3 px-4 rounded-xl hover:bg-yellow-400 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={resetForm}
                className="w-full bg-gray-700 text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-600 transition-colors"
              >
                Make Another Deposit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MomoDepositPage;
