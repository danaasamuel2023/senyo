'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard, Smartphone, Building2, Wallet, CheckCircle,
  AlertCircle, Loader2, Lock, Shield, Clock, Info,
  ChevronDown, ChevronUp, Eye, EyeOff, Phone, Mail,
  User, Calendar, DollarSign, Receipt, ArrowRight
} from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, order, onPaymentSuccess }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);

  // Payment form states
  const [paymentForm, setPaymentForm] = useState({
    phoneNumber: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    bankAccount: '',
    bankCode: '',
    accountName: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadPaymentMethods();
    }
  }, [isOpen]);

  const loadPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5001'
        : 'https://unlimitedata.onrender.com';

      const response = await fetch(`${API_URL}/api/payments/methods`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setPaymentMethods(data.paymentMethods);
        // Auto-select wallet if available
        const walletMethod = data.paymentMethods.find(m => m.id === 'wallet' && m.available);
        if (walletMethod) {
          setSelectedMethod(walletMethod);
        }
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handlePayment = async () => {
    if (!selectedMethod || !order) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5001'
        : 'https://unlimitedata.onrender.com';

      // Handle wallet payments directly
      if (selectedMethod.id === 'wallet') {
        const paymentData = {
          orderId: order.id,
          paymentMethod: 'wallet',
          amount: order.totalAmount || order.amount
        };

        const response = await fetch(`${API_URL}/api/payments/initialize`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(paymentData)
        });

        const data = await response.json();

        if (data.success) {
          showNotification('Payment processed successfully!', 'success');
          onPaymentSuccess(data.payment);
          onClose();
        } else {
          showNotification(data.message || 'Payment failed', 'error');
        }
        return;
      }

      // Initialize PayStack payment for other methods
      const paymentData = {
        orderId: order.id,
        paymentMethod: selectedMethod.id,
        amount: order.totalAmount || order.amount,
        email: userData.email || 'customer@example.com',
        phoneNumber: paymentForm.phoneNumber,
        metadata: {
          customerName: userData.name || 'Customer',
          productName: order.product
        }
      };

      const response = await fetch(`${API_URL}/api/payments/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to PayStack payment page
        window.location.href = data.payment.authorizationUrl;
      } else {
        showNotification(data.message || 'Payment initialization failed', 'error');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      showNotification('Error processing payment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentProvider = () => {
    switch (selectedMethod?.id) {
      case 'mobile_money':
        return 'MTN Mobile Money'; // Default, could be selected from UI
      case 'card':
        return 'Visa'; // Default, could be detected from card number
      case 'bank_transfer':
        return 'GCB Bank'; // Default, could be selected from UI
      default:
        return 'Account Balance';
    }
  };

  const calculateFees = () => {
    if (!selectedMethod || !order) return 0;
    const amount = order.totalAmount || order.amount;
    return amount * selectedMethod.fees;
  };

  const getTotalAmount = () => {
    if (!order) return 0;
    const amount = order.totalAmount || order.amount;
    return amount + calculateFees();
  };

  const PaymentMethodCard = ({ method }) => (
    <div
      onClick={() => setSelectedMethod(method)}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
        selectedMethod?.id === method.id
          ? 'border-[#FFCC08] bg-[#FFCC08]/5'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{method.icon}</div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {method.name}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {method.processingTime}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {method.fees > 0 ? `${(method.fees * 100).toFixed(1)}% fee` : 'No fees'}
          </p>
          {method.walletBalance !== null && (
            <p className="text-sm font-medium text-[#FFCC08]">
              ₵{method.walletBalance.toFixed(2)} available
            </p>
          )}
        </div>
      </div>

      {!method.available && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">
            {method.id === 'wallet' ? 'Insufficient balance' : 'Currently unavailable'}
          </p>
        </div>
      )}
    </div>
  );

  const MobileMoneyForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Phone Number
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            value={paymentForm.phoneNumber}
            onChange={(e) => setPaymentForm({...paymentForm, phoneNumber: e.target.value})}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
            placeholder="+233 24 123 4567"
          />
        </div>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h5 className="font-medium text-blue-900 dark:text-blue-100">
              How Mobile Money works:
            </h5>
            <ul className="text-sm text-blue-800 dark:text-blue-200 mt-1 space-y-1">
              <li>• You'll receive a payment prompt on your phone</li>
              <li>• Enter your Mobile Money PIN to confirm</li>
              <li>• Payment is processed instantly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const CardForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Card Number
        </label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={paymentForm.cardNumber}
            onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
            placeholder="1234 5678 9012 3456"
            maxLength="19"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Expiry Date
          </label>
          <input
            type="text"
            value={paymentForm.expiryDate}
            onChange={(e) => setPaymentForm({...paymentForm, expiryDate: e.target.value})}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
            placeholder="MM/YY"
            maxLength="5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            CVV
          </label>
          <div className="relative">
            <input
              type={showCardDetails ? "text" : "password"}
              value={paymentForm.cvv}
              onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
              placeholder="123"
              maxLength="4"
            />
            <button
              type="button"
              onClick={() => setShowCardDetails(!showCardDetails)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showCardDetails ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Cardholder Name
        </label>
        <input
          type="text"
          value={paymentForm.cardName}
          onChange={(e) => setPaymentForm({...paymentForm, cardName: e.target.value})}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
          placeholder="John Doe"
        />
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <h5 className="font-medium text-green-900 dark:text-green-100">
              Secure Payment
            </h5>
            <p className="text-sm text-green-800 dark:text-green-200 mt-1">
              Your card details are encrypted and secure. We never store your full card information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const BankTransferForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Account Number
        </label>
        <input
          type="text"
          value={paymentForm.bankAccount}
          onChange={(e) => setPaymentForm({...paymentForm, bankAccount: e.target.value})}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
          placeholder="1234567890"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Bank
        </label>
        <select
          value={paymentForm.bankCode}
          onChange={(e) => setPaymentForm({...paymentForm, bankCode: e.target.value})}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
        >
          <option value="">Select Bank</option>
          <option value="GCB">GCB Bank</option>
          <option value="ECO">Ecobank</option>
          <option value="STB">Stanbic Bank</option>
          <option value="FID">Fidelity Bank</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Account Name
        </label>
        <input
          type="text"
          value={paymentForm.accountName}
          onChange={(e) => setPaymentForm({...paymentForm, accountName: e.target.value})}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
          placeholder="John Doe"
        />
      </div>

      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
        <div className="flex items-start space-x-3">
          <Clock className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div>
            <h5 className="font-medium text-yellow-900 dark:text-yellow-100">
              Processing Time
            </h5>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
              Bank transfers may take 1-3 hours to process. You'll receive a confirmation once completed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Complete Payment
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Secure payment processing
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="mx-6 mt-4">
            <div className={`px-4 py-3 rounded-xl shadow-lg border ${
              notification.type === 'success' ? 'bg-green-500/90 border-green-400' :
              notification.type === 'error' ? 'bg-red-500/90 border-red-400' :
              'bg-blue-500/90 border-blue-400'
            } text-white flex items-center space-x-3`}>
              {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Order Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Product:</span>
                <span className="text-gray-900 dark:text-white">{order?.product}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="text-gray-900 dark:text-white">₵{order?.amount?.toFixed(2)}</span>
              </div>
              {calculateFees() > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Fees:</span>
                  <span className="text-gray-900 dark:text-white">₵{calculateFees().toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg border-t border-gray-200 dark:border-gray-600 pt-2">
                <span className="text-gray-900 dark:text-white">Total:</span>
                <span className="text-[#FFCC08]">₵{getTotalAmount().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h4>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <PaymentMethodCard key={method.id} method={method} />
              ))}
            </div>
          </div>

          {/* Wallet Payment Display */}
          {selectedMethod && selectedMethod.id === 'wallet' && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                Wallet Payment
              </h4>
              <div className="p-4 bg-[#FFCC08]/10 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Wallet className="w-6 h-6 text-[#FFCC08]" />
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      Pay with Wallet Balance
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Available: ₵{selectedMethod.walletBalance?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Form */}
          {selectedMethod && selectedMethod.id !== 'wallet' && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                {selectedMethod.name} Details
              </h4>
              
              {selectedMethod.id === 'mobile_money' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={paymentForm.phoneNumber}
                        onChange={(e) => setPaymentForm({...paymentForm, phoneNumber: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="+233 24 123 4567"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-blue-900 dark:text-blue-100">
                          PayStack Payment
                        </h5>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 mt-1 space-y-1">
                          <li>• You'll be redirected to PayStack's secure payment page</li>
                          <li>• Choose your preferred mobile money provider</li>
                          <li>• Complete payment securely</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(selectedMethod.id === 'card' || selectedMethod.id === 'bank_transfer') && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-green-900 dark:text-green-100">
                        Secure PayStack Payment
                      </h5>
                      <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                        You'll be redirected to PayStack's secure payment page where you can safely enter your card or bank details.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Security Notice */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="flex items-start space-x-3">
              <Lock className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white">
                  Secure Payment
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={!selectedMethod || loading}
              className="flex-1 px-4 py-3 bg-[#FFCC08] text-black rounded-xl font-semibold hover:bg-yellow-500 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {selectedMethod?.id === 'wallet' 
                      ? `Pay ₵${getTotalAmount().toFixed(2)}` 
                      : `Pay with PayStack ₵${getTotalAmount().toFixed(2)}`
                    }
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
