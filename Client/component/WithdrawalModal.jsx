import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastNotification';
import { getApiEndpoint } from '../utils/apiConfig';
import { 
  X, Smartphone, DollarSign, CheckCircle, AlertCircle, 
  Loader2, CreditCard, Banknote, Wifi, Signal, Building2,
  ArrowUpRight, Eye, EyeOff
} from 'lucide-react';

const WithdrawalModal = ({ isOpen, onClose, currentBalance, onWithdrawalSuccess }) => {
  const router = useRouter();
  const { success, error: showError } = useToast();
  
  // State management
  const [step, setStep] = useState(1); // 1: Method, 2: Details, 3: Confirmation, 4: Processing
  const [loading, setLoading] = useState(false);
  const [withdrawalMethod, setWithdrawalMethod] = useState(''); // 'bank' or 'mobile'
  const [banks, setBanks] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    accountNumber: '',
    accountName: '',
    bankId: '',
    network: '',
    description: ''
  });
  const [validation, setValidation] = useState({
    amount: { valid: true, message: '' },
    accountNumber: { valid: true, message: '' },
    accountName: { valid: true, message: '' },
    bankId: { valid: true, message: '' },
    network: { valid: true, message: '' }
  });
  const [showAccountName, setShowAccountName] = useState(false);
  const [verifiedAccountName, setVerifiedAccountName] = useState('');

  // Load supported banks on component mount
  useEffect(() => {
    if (isOpen) {
      loadSupportedBanks();
    }
  }, [isOpen]);

  const loadSupportedBanks = async () => {
    try {
      const response = await fetch(getApiEndpoint('/api/wallet/banks'));
      const data = await response.json();
      
      if (data.success) {
        setBanks(data.data);
      } else {
        showError('Failed to load banks list');
      }
    } catch (error) {
      console.error('Error loading banks:', error);
      showError('Failed to load banks list');
    }
  };

  const validateAmount = (amount) => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount < 10) {
      return { valid: false, message: 'Minimum withdrawal amount is GHS 10' };
    }
    if (numAmount > currentBalance) {
      return { valid: false, message: 'Insufficient balance' };
    }
    if (numAmount > 50000) {
      return { valid: false, message: 'Maximum withdrawal amount is GHS 50,000' };
    }
    return { valid: true, message: '' };
  };

  const validateAccountNumber = (accountNumber, type) => {
    if (type === 'bank') {
      const bankRegex = /^[0-9]{10,16}$/;
      if (!bankRegex.test(accountNumber)) {
        return { valid: false, message: 'Invalid bank account number format' };
      }
    } else if (type === 'mobile') {
      const mobileRegex = /^0[0-9]{9}$/;
      if (!mobileRegex.test(accountNumber)) {
        return { valid: false, message: 'Invalid mobile money number format' };
      }
    }
    return { valid: true, message: '' };
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    if (field === 'amount') {
      setValidation(prev => ({ ...prev, amount: validateAmount(value) }));
    } else if (field === 'accountNumber') {
      setValidation(prev => ({ ...prev, accountNumber: validateAccountNumber(value, withdrawalMethod) }));
    }
  };

  const handleVerifyAccount = async () => {
    if (!formData.accountNumber || !formData.bankId) {
      showError('Please enter account number and select bank');
      return;
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(getApiEndpoint('/api/wallet/verify-account'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': authToken
        },
        body: JSON.stringify({
          accountNumber: formData.accountNumber,
          bankId: formData.bankId
        })
      });

      const data = await response.json();
      if (data.success) {
        setVerifiedAccountName(data.data.name);
        setShowAccountName(true);
        success('Account verified successfully!');
      } else {
        showError(data.message || 'Account verification failed');
      }
    } catch (error) {
      console.error('Account verification error:', error);
      showError('Account verification failed');
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!withdrawalMethod) {
        showError('Please select a withdrawal method');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate based on withdrawal method
      const amountValidation = validateAmount(formData.amount);
      if (!amountValidation.valid) {
        setValidation(prev => ({ ...prev, amount: amountValidation }));
        return;
      }

      const accountValidation = validateAccountNumber(formData.accountNumber, withdrawalMethod);
      if (!accountValidation.valid) {
        setValidation(prev => ({ ...prev, accountNumber: accountValidation }));
        return;
      }

      if (withdrawalMethod === 'bank' && !formData.bankId) {
        setValidation(prev => ({ ...prev, bankId: { valid: false, message: 'Please select a bank' } }));
        return;
      }

      if (withdrawalMethod === 'mobile' && !formData.network) {
        setValidation(prev => ({ ...prev, network: { valid: false, message: 'Please select a network' } }));
        return;
      }

      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleWithdraw = async () => {
    setLoading(true);
    setStep(4);
    
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication required');
      }

      const endpoint = withdrawalMethod === 'bank' 
        ? '/api/wallet/withdraw/bank' 
        : '/api/wallet/withdraw/mobile';

      const payload = withdrawalMethod === 'bank' 
        ? {
            amount: parseFloat(formData.amount),
            accountNumber: formData.accountNumber,
            accountName: formData.accountName || verifiedAccountName,
            bankId: formData.bankId
          }
        : {
            amount: parseFloat(formData.amount),
            accountNumber: formData.accountNumber,
            channel: formData.network,
            accountName: formData.accountName
          };

      const response = await fetch(getApiEndpoint(endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': authToken
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        success(`Withdrawal of GHS ${formData.amount} successful!`);
        onWithdrawalSuccess && onWithdrawalSuccess(data.data);
        handleClose();
      } else {
        throw new Error(data.message || 'Withdrawal failed');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      showError(error.message || 'Withdrawal failed. Please try again.');
      setStep(3); // Go back to confirmation step
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setWithdrawalMethod('');
    setFormData({ amount: '', accountNumber: '', accountName: '', bankId: '', network: '', description: '' });
    setValidation({ amount: { valid: true, message: '' }, accountNumber: { valid: true, message: '' }, accountName: { valid: true, message: '' }, bankId: { valid: true, message: '' }, network: { valid: true, message: '' } });
    setShowAccountName(false);
    setVerifiedAccountName('');
    onClose();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(amount || 0).replace('GHS', '₵');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md mx-auto shadow-2xl border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Withdraw Funds</h2>
              <p className="text-sm text-gray-400">Transfer money to your account</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= stepNum 
                    ? 'bg-[#FFCC08] text-black' 
                    : 'bg-gray-800 text-gray-400'
                }`}>
                  {step > stepNum ? <CheckCircle className="w-4 h-4" /> : stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    step > stepNum ? 'bg-[#FFCC08]' : 'bg-gray-800'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Method</span>
            <span>Details</span>
            <span>Confirm</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Withdrawal Method */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Choose Withdrawal Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setWithdrawalMethod('bank')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      withdrawalMethod === 'bank'
                        ? 'border-[#FFCC08] bg-[#FFCC08]/10'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-black" />
                      </div>
                      <p className="text-sm font-medium text-white">Bank Account</p>
                      <p className="text-xs text-gray-400 mt-1">Transfer to bank</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setWithdrawalMethod('mobile')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      withdrawalMethod === 'mobile'
                        ? 'border-[#FFCC08] bg-[#FFCC08]/10'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-black" />
                      </div>
                      <p className="text-sm font-medium text-white">Mobile Money</p>
                      <p className="text-xs text-gray-400 mt-1">Transfer to MoMo</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Available Balance:</span>
                  <span className="text-[#FFCC08] font-bold">{formatCurrency(currentBalance)}</span>
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={!withdrawalMethod}
                className="w-full bg-[#FFCC08] text-black font-bold py-3 rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Withdrawal Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="Enter amount (GHS 10 - 50,000)"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-[#FFCC08] focus:ring-1 focus:ring-[#FFCC08] transition-colors"
                  />
                </div>
                {!validation.amount.valid && (
                  <p className="mt-2 text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validation.amount.message}
                  </p>
                )}
              </div>

              {withdrawalMethod === 'bank' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Bank
                    </label>
                    <select
                      value={formData.bankId}
                      onChange={(e) => handleInputChange('bankId', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-[#FFCC08] focus:ring-1 focus:ring-[#FFCC08] transition-colors"
                    >
                      <option value="">Select a bank</option>
                      {banks.map((bank) => (
                        <option key={bank.id} value={bank.id}>
                          {bank.name}
                        </option>
                      ))}
                    </select>
                    {!validation.bankId.valid && (
                      <p className="mt-2 text-sm text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {validation.bankId.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Account Number
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                        placeholder="Enter account number"
                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-[#FFCC08] focus:ring-1 focus:ring-[#FFCC08] transition-colors"
                      />
                      <button
                        onClick={handleVerifyAccount}
                        disabled={!formData.accountNumber || !formData.bankId}
                        className="px-4 py-3 bg-[#FFCC08] text-black font-bold rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Verify
                      </button>
                    </div>
                    {!validation.accountNumber.valid && (
                      <p className="mt-2 text-sm text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {validation.accountNumber.message}
                      </p>
                    )}
                    {showAccountName && (
                      <div className="mt-2 p-3 bg-green-900/20 border border-green-500/20 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-400">
                            Account Name: <strong>{verifiedAccountName}</strong>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {withdrawalMethod === 'mobile' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mobile Money Network
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { name: 'MTN', logo: '/logos/mtn-logo.svg' },
                        { name: 'VODAFONE', logo: '/logos/vodafone-logo.svg' },
                        { name: 'AIRTELTIGO', logo: '/logos/airteltigo-logo.svg' }
                      ].map((network) => (
                        <button
                          key={network.name}
                          onClick={() => handleInputChange('network', network.name)}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            formData.network === network.name
                              ? 'border-[#FFCC08] bg-[#FFCC08]/10'
                              : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                          }`}
                        >
                          <div className="text-center">
                            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center p-1">
                              <img 
                                src={network.logo} 
                                alt={`${network.name} logo`}
                                className="w-6 h-6 object-contain"
                              />
                            </div>
                            <p className="text-xs font-medium text-white">{network.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    {!validation.network.valid && (
                      <p className="mt-2 text-sm text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {validation.network.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                      placeholder="0XXXXXXXXX"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-[#FFCC08] focus:ring-1 focus:ring-[#FFCC08] transition-colors"
                    />
                    {!validation.accountNumber.valid && (
                      <p className="mt-2 text-sm text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {validation.accountNumber.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Account Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.accountName}
                      onChange={(e) => handleInputChange('accountName', e.target.value)}
                      placeholder="Enter account holder name"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-[#FFCC08] focus:ring-1 focus:ring-[#FFCC08] transition-colors"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Add a note about this withdrawal"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-[#FFCC08] focus:ring-1 focus:ring-[#FFCC08] transition-colors resize-none"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.amount || !formData.accountNumber || !validation.amount.valid || !validation.accountNumber.valid}
                  className="flex-1 bg-[#FFCC08] text-black font-bold py-3 rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center">
                  <ArrowUpRight className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Confirm Withdrawal</h3>
                <p className="text-gray-400">Please review your withdrawal details</p>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-[#FFCC08] font-bold">{formatCurrency(formData.amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Method:</span>
                  <span className="text-white font-medium">
                    {withdrawalMethod === 'bank' ? 'Bank Account' : 'Mobile Money'}
                  </span>
                </div>
                {withdrawalMethod === 'bank' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Bank:</span>
                      <span className="text-white font-medium">
                        {banks.find(b => b.id === formData.bankId)?.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Account:</span>
                      <span className="text-white font-medium">
                        {formData.accountNumber.substring(0, 4)}****{formData.accountNumber.substring(8)}
                      </span>
                    </div>
                    {verifiedAccountName && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Account Name:</span>
                        <span className="text-white font-medium">{verifiedAccountName}</span>
                      </div>
                    )}
                  </>
                )}
                {withdrawalMethod === 'mobile' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Network:</span>
                      <span className="text-white font-medium">{formData.network}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Phone:</span>
                      <span className="text-white font-medium">
                        {formData.accountNumber.substring(0, 4)}****{formData.accountNumber.substring(8)}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">New Balance:</span>
                  <span className="text-green-400 font-bold">
                    {formatCurrency(currentBalance - parseFloat(formData.amount || 0))}
                  </span>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-200 font-medium">Processing Time</p>
                    <p className="text-xs text-yellow-300 mt-1">
                      {withdrawalMethod === 'bank' 
                        ? 'Bank transfers may take 1-3 business days to reflect in your account.'
                        : 'Mobile money transfers are usually instant but may take up to 24 hours.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={loading}
                  className="flex-1 bg-[#FFCC08] text-black font-bold py-3 rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Withdrawal'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Processing */}
          {step === 4 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-black animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Processing Withdrawal</h3>
                <p className="text-gray-400">
                  Please wait while we process your withdrawal request...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalModal;
