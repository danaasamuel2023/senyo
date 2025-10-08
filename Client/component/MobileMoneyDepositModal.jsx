import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastNotification';
import { getApiEndpoint } from '@/utils/apiConfig';
import { 
  X, Smartphone, DollarSign, CheckCircle, AlertCircle, 
  Loader2, CreditCard, Banknote, Wifi, Signal
} from 'lucide-react';

const MobileMoneyDepositModal = ({ isOpen, onClose, currentBalance, onDepositSuccess }) => {
  const router = useRouter();
  const { success, error: showError } = useToast();
  
  // State management
  const [step, setStep] = useState(1); // 1: Amount, 2: Details, 3: Confirmation, 4: Processing
  const [loading, setLoading] = useState(false);
  const [networks, setNetworks] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    phoneNumber: '',
    network: '',
    description: ''
  });
  const [validation, setValidation] = useState({
    amount: { valid: true, message: '' },
    phoneNumber: { valid: true, message: '' },
    network: { valid: true, message: '' }
  });

  // Load supported networks on component mount
  useEffect(() => {
    if (isOpen) {
      loadSupportedNetworks();
    }
  }, [isOpen]);

  const loadSupportedNetworks = async () => {
    try {
      const response = await fetch(getApiEndpoint('/api/wallet/networks'));
      const data = await response.json();
      
      if (data.success) {
        setNetworks(data.data);
      } else {
        showError('Failed to load mobile money networks');
      }
    } catch (error) {
      console.error('Error loading networks:', error);
      showError('Failed to load mobile money networks');
    }
  };

  const validateAmount = (amount) => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount < 5) {
      return { valid: false, message: 'Minimum deposit amount is GHS 5' };
    }
    if (numAmount > 10000) {
      return { valid: false, message: 'Maximum deposit amount is GHS 10,000' };
    }
    return { valid: true, message: '' };
  };

  const validatePhoneNumber = (phoneNumber, network) => {
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return { valid: false, message: 'Invalid phone number format. Use 0XXXXXXXXX' };
    }
    
    // Network-specific validation
    if (network === 'MTN' && !phoneNumber.startsWith('024') && !phoneNumber.startsWith('054') && !phoneNumber.startsWith('055') && !phoneNumber.startsWith('059')) {
      return { valid: false, message: 'Invalid MTN number. MTN numbers start with 024, 054, 055, or 059' };
    }
    
    if (network === 'VODAFONE' && !phoneNumber.startsWith('020') && !phoneNumber.startsWith('050')) {
      return { valid: false, message: 'Invalid Vodafone number. Vodafone numbers start with 020 or 050' };
    }
    
    if (network === 'AIRTELTIGO' && !phoneNumber.startsWith('026') && !phoneNumber.startsWith('056')) {
      return { valid: false, message: 'Invalid AirtelTigo number. AirtelTigo numbers start with 026 or 056' };
    }
    
    return { valid: true, message: '' };
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    if (field === 'amount') {
      setValidation(prev => ({ ...prev, amount: validateAmount(value) }));
    } else if (field === 'phoneNumber') {
      setValidation(prev => ({ ...prev, phoneNumber: validatePhoneNumber(value, formData.network) }));
    } else if (field === 'network') {
      setSelectedNetwork(value);
      setFormData(prev => ({ ...prev, network: value }));
      // Re-validate phone number with new network
      if (formData.phoneNumber) {
        setValidation(prev => ({ ...prev, phoneNumber: validatePhoneNumber(formData.phoneNumber, value) }));
      }
    }
  };

  const handleNext = () => {
    if (step === 1) {
      // Validate amount
      const amountValidation = validateAmount(formData.amount);
      if (!amountValidation.valid) {
        setValidation(prev => ({ ...prev, amount: amountValidation }));
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate phone number and network
      const phoneValidation = validatePhoneNumber(formData.phoneNumber, formData.network);
      if (!phoneValidation.valid) {
        setValidation(prev => ({ ...prev, phoneNumber: phoneValidation }));
        return;
      }
      if (!formData.network) {
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

  const handleDeposit = async () => {
    setLoading(true);
    setStep(4);
    
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication required');
      }

      // Use existing Paystack integration for mobile money deposits
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      const response = await fetch(getApiEndpoint('/api/v1/deposit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': authToken
        },
        body: JSON.stringify({
          userId: userData.id || userData._id,
          amount: parseFloat(formData.amount),
          email: userData.email,
          totalAmountWithFee: parseFloat(formData.amount) // No fee for now
        })
      });

      const data = await response.json();

      if (data.success && data.data?.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error(data.message || 'Deposit failed');
      }
    } catch (error) {
      console.error('Deposit error:', error);
      showError(error.message || 'Deposit failed. Please try again.');
      setStep(3); // Go back to confirmation step
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({ amount: '', phoneNumber: '', network: '', description: '' });
    setValidation({ amount: { valid: true, message: '' }, phoneNumber: { valid: true, message: '' }, network: { valid: true, message: '' } });
    setSelectedNetwork('');
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
              <Smartphone className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Mobile Money Deposit</h2>
              <p className="text-sm text-gray-400">Add funds to your wallet</p>
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
            <span>Amount</span>
            <span>Details</span>
            <span>Confirm</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Amount */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Deposit Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="Enter amount (GHS 5 - 10,000)"
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

              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Current Balance:</span>
                  <span className="text-[#FFCC08] font-bold">{formatCurrency(currentBalance)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-400">After Deposit:</span>
                  <span className="text-green-400 font-bold">
                    {formatCurrency(currentBalance + parseFloat(formData.amount || 0))}
                  </span>
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={!formData.amount || !validation.amount.valid}
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
                  Mobile Money Network
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {networks.map((network) => (
                    <button
                      key={network.id}
                      onClick={() => handleInputChange('network', network.code)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        selectedNetwork === network.code
                          ? 'border-[#FFCC08] bg-[#FFCC08]/10'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-center">
                        <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center">
                          <Signal className="w-4 h-4 text-black" />
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
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="0XXXXXXXXX"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-[#FFCC08] focus:ring-1 focus:ring-[#FFCC08] transition-colors"
                  />
                </div>
                {!validation.phoneNumber.valid && (
                  <p className="mt-2 text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validation.phoneNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Add a note about this deposit"
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
                  disabled={!formData.phoneNumber || !formData.network || !validation.phoneNumber.valid}
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
                  <CreditCard className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Confirm Deposit</h3>
                <p className="text-gray-400">Please review your deposit details</p>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-[#FFCC08] font-bold">{formatCurrency(formData.amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Network:</span>
                  <span className="text-white font-medium">{formData.network}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Phone Number:</span>
                  <span className="text-white font-medium">
                    {formData.phoneNumber.substring(0, 4)}****{formData.phoneNumber.substring(8)}
                  </span>
                </div>
                {formData.description && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Description:</span>
                    <span className="text-white font-medium text-right">{formData.description}</span>
                  </div>
                )}
              </div>

              <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-200 font-medium">Important Notice</p>
                    <p className="text-xs text-yellow-300 mt-1">
                      You will receive a prompt on your phone to confirm this payment. 
                      Please ensure you have sufficient balance in your {formData.network} account.
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
                  onClick={handleDeposit}
                  disabled={loading}
                  className="flex-1 bg-[#FFCC08] text-black font-bold py-3 rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Deposit'
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
                <h3 className="text-lg font-bold text-white mb-2">Processing Deposit</h3>
                <p className="text-gray-400">
                  Please wait while we process your mobile money deposit...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMoneyDepositModal;
