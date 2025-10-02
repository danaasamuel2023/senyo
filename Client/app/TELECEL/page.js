'use client'
import React, { useState, useEffect } from 'react';
import { Zap, Star, AlertTriangle, CheckCircle, X, Info, Shield, Phone, CreditCard, ArrowRight, Wifi, Signal, Smartphone } from 'lucide-react';

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`p-4 rounded-2xl shadow-2xl flex items-center backdrop-blur-xl border-2 max-w-sm ${
        type === 'success' 
          ? 'bg-green-500 text-white border-green-400' 
          : type === 'error' 
            ? 'bg-red-500 text-white border-red-400' 
            : 'bg-red-600 text-white border-red-500'
      }`}>
        <div className="mr-3">
          {type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : type === 'error' ? (
            <X className="h-5 w-5" />
          ) : (
            <Info className="h-5 w-5" />
          )}
        </div>
        <div className="flex-grow">
          <p className="font-semibold">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 hover:scale-110 transition-transform">
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

// Telecel Logo Component - Red theme
const TelecelLogo = ({ className = "w-12 h-12" }) => (
  <div className={`${className} bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg`}>
    <span className="font-black text-white text-xl">T</span>
  </div>
);

// Service Information Modal
const ServiceInfoModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
        {/* Modal header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5 rounded-t-3xl flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2" />
            Service Notice
          </h3>
          <button onClick={onClose} className="text-white hover:text-white/70 p-2 rounded-xl hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Modal content */}
        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4 text-gray-700">
            <div className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-red-600 mr-3 mt-2 flex-shrink-0"></div>
              <p><strong className="text-gray-900">Not instant service</strong> - delivery times vary</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-red-600 mr-3 mt-2 flex-shrink-0"></div>
              <p>For urgent data, consider other immediate options</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-red-600 mr-3 mt-2 flex-shrink-0"></div>
              <p>Please be patient - orders may take time to process</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-red-600 mr-3 mt-2 flex-shrink-0"></div>
              <p>Not suitable for instant bundle needs</p>
            </div>
          </div>
          
          <div className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl mt-5">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-gray-800 text-sm font-medium">
                Thank you for your patience and understanding.
              </p>
            </div>
          </div>
        </div>
        
        {/* Modal footer */}
        <div className="px-6 py-5 border-t-2 border-gray-100 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-2xl transition-all transform hover:scale-105 shadow-lg"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// Purchase Modal Component
const PurchaseModal = ({ isOpen, onClose, bundle, phoneNumber, setPhoneNumber, onPurchase, error, isLoading }) => {
  if (!isOpen || !bundle) return null;

  const handlePhoneNumberChange = (e) => {
    let formatted = e.target.value.replace(/\D/g, '');
    
    if (formatted.length > 10) {
      formatted = formatted.substring(0, 10);
    }
    
    setPhoneNumber(formatted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
        {/* Modal header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5 rounded-t-3xl flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Smartphone className="w-6 h-6 mr-2" />
            Purchase {bundle.capacity}GB
          </h3>
          <button onClick={onClose} className="text-white hover:text-white/70 p-2 rounded-xl hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Modal content */}
        <div className="px-6 py-6">
          {/* Bundle Info */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 mb-5 border-2 border-red-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-medium">Data Bundle:</span>
              <span className="text-red-700 font-bold text-lg">{bundle.capacity}GB</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-medium">Network:</span>
              <span className="text-red-700 font-bold">Telecel</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-medium">Duration:</span>
              <span className="text-green-600 font-bold">No-Expiry</span>
            </div>
            <div className="flex justify-between items-center border-t-2 border-red-200 pt-3">
              <span className="text-gray-900 font-bold">Total Price:</span>
              <span className="text-red-700 font-bold text-xl">GH₵{bundle.price}</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-5 p-4 rounded-2xl flex items-start bg-red-50 border-2 border-red-200">
              <X className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-red-700 text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Phone Number Form */}
          <div className="mb-5">
            <label className="block text-sm font-bold mb-3 text-gray-800">
              Enter Telecel Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="w-5 h-5 text-red-600" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                className="pl-12 pr-4 py-4 block w-full rounded-2xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-3 focus:ring-red-400 focus:border-red-400 font-semibold text-lg transition-all"
                placeholder="020XXXXXXX or 050XXXXXXX"
                required
                autoFocus
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">Format: 020 or 050 followed by 7 digits</p>
          </div>

          {/* Warning */}
          <div className="mb-5 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-amber-800 text-sm font-medium">
                  <strong>Important:</strong> Only 020 or 050 numbers supported. Verify carefully - no refunds.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all text-base"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onPurchase}
              disabled={isLoading || !phoneNumber || phoneNumber.length !== 10}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Purchase Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading Overlay
const LoadingOverlay = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-xs w-full mx-auto text-center shadow-2xl">
        <div className="flex justify-center mb-5">
          <div className="relative w-16 h-16">
            <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>
            <div className="absolute top-0 w-16 h-16 rounded-full border-4 border-transparent border-t-red-600 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-red-600 to-red-700 animate-pulse flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white animate-bounce" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <h4 className="text-xl font-bold text-gray-900 mb-2">Processing...</h4>
        <p className="text-gray-600">Please wait while we process your order</p>
      </div>
    </div>
  );
};

const TelecelBundleSelect = () => {
  const [selectedBundle, setSelectedBundle] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState(null);
  
  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });
  
  // Manual inventory control
  const inventoryAvailable = true;
  
  const bundles = [
    { capacity: '5', label: '5GB', mb: '5000', price: '19.50', network: 'TELECEL', inStock: inventoryAvailable },
    { capacity: '8', label: '8GB', mb: '8000', price: '34.64', network: 'TELECEL', inStock: inventoryAvailable },
    { capacity: '10', label: '10GB', mb: '10000', price: '36.50', network: 'TELECEL', inStock: inventoryAvailable },
    { capacity: '12', label: '12GB', mb: '12000', price: '43.70', network: 'TELECEL', inStock: inventoryAvailable },
    { capacity: '15', label: '15GB', mb: '15000', price: '52.85', network: 'TELECEL', inStock: inventoryAvailable },
    { capacity: '20', label: '20GB', mb: '20000', price: '69.80', network: 'TELECEL', inStock: inventoryAvailable },
    { capacity: '25', label: '25GB', mb: '25000', price: '86.75', network: 'TELECEL', inStock: inventoryAvailable },
    { capacity: '30', label: '30GB', mb: '30000', price: '103.70', network: 'TELECEL', inStock: inventoryAvailable },
    { capacity: '35', label: '35GB', mb: '35000', price: '120.65', network: 'TELECEL', inStock: inventoryAvailable },
    { capacity: '40', label: '40GB', mb: '40000', price: '137.60', network: 'TELECEL', inStock: inventoryAvailable },
    { capacity: '45', label: '45GB', mb: '45000', price: '154.55', network: 'TELECEL', inStock: inventoryAvailable },
    { capacity: '50', label: '50GB', mb: '50000', price: '171.50', network: 'TELECEL', inStock: inventoryAvailable },
    { capacity: '100', label: '100GB', mb: '100000', price: '341.00', network: 'TELECEL', inStock: inventoryAvailable }
  ];

  // Get user data from localStorage on component mount
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  // Add CSS for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      .animate-slide-in {
        animation: slideIn 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Function to validate Telecel phone number format
  const validatePhoneNumber = (number) => {
    const cleanNumber = number.replace(/[\s-]/g, '');
    const telecelPattern = /^(020|050)\d{7}$/;
    return telecelPattern.test(cleanNumber);
  };

  // Function to show toast
  const showToast = (message, type = 'success') => {
    setToast({
      visible: true,
      message,
      type
    });
  };

  // Function to hide toast
  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      visible: false
    }));
  };

  // Handle bundle selection - opens purchase modal
  const handleBundleSelect = (bundle) => {
    if (!bundle.inStock) {
      showToast('This bundle is currently out of stock', 'error');
      return;
    }

    if (!userData || !userData.id) {
      showToast('Please login to continue', 'error');
      return;
    }

    setPendingPurchase(bundle);
    setPhoneNumber(''); // Reset phone number
    setError(''); // Clear any previous errors
    setIsPurchaseModalOpen(true);
  };

  // Process the actual purchase
  const processPurchase = async () => {
    if (!pendingPurchase) return;
    
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid Telecel number (020 or 050 followed by 7 digits)');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://unlimitedata.onrender.com/api/v1/data/purchase-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userData.id,
          phoneNumber: phoneNumber,
          network: pendingPurchase.network,
          capacity: parseInt(pendingPurchase.capacity),
          price: parseFloat(pendingPurchase.price)
        })
      });
      
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        showToast(`${pendingPurchase.capacity}GB purchased successfully for ${phoneNumber}!`, 'success');
        setSelectedBundle('');
        setPhoneNumber('');
        setError('');
        setIsPurchaseModalOpen(false);
        setPendingPurchase(null);
      } else {
        throw new Error(data.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      const errorMessage = error.message || 'Purchase failed. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50">
      {/* Toast Notification */}
      {toast.visible && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
      
      {/* Loading Overlay */}
      <LoadingOverlay isLoading={isLoading} />
      
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <ServiceInfoModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={() => {
              setIsModalOpen(false);
            }}
          />

          <PurchaseModal
            isOpen={isPurchaseModalOpen}
            onClose={() => {
              setIsPurchaseModalOpen(false);
              setPendingPurchase(null);
              setPhoneNumber('');
              setError('');
            }}
            bundle={pendingPurchase}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            onPurchase={processPurchase}
            error={error}
            isLoading={isLoading}
          />
          
          {/* Header with Telecel Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-3xl flex items-center justify-center shadow-xl">
                <span className="font-black text-white text-3xl">TELECEL</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Premium Data Bundles</h1>
            <p className="text-red-600 font-semibold text-lg">Connect • Communicate • Create</p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center">
                    <Signal className="w-7 h-7 text-red-600" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Select Your Data Package</h2>
                    <p className="text-red-100 text-lg">Choose your preferred bundle & buy instantly</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              {/* Service info button */}
              <div className="mb-8 flex justify-center">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-50 border-2 border-red-300 text-red-700 font-bold rounded-2xl hover:bg-red-100 transition-all text-base"
                >
                  <Info className="h-5 w-5" />
                  <span>Service Information</span>
                </button>
              </div>

              {/* Bundle Selection Grid */}
              <div>
                <h3 className="text-2xl font-bold mb-6 text-gray-900 text-center">
                  Available Data Packages
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {bundles.map((bundle) => (
                    <button
                      key={bundle.capacity}
                      type="button"
                      onClick={() => handleBundleSelect(bundle)}
                      disabled={!bundle.inStock}
                      className={`p-6 rounded-2xl text-center transition-all transform hover:scale-105 border-2 ${
                        bundle.inStock
                          ? 'bg-white border-red-300 hover:border-red-500 hover:bg-red-50 hover:shadow-xl cursor-pointer'
                          : 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="mb-1">
                        <TelecelLogo className="w-8 h-8 mx-auto mb-3" />
                      </div>
                      <div className="text-3xl font-bold mb-2 text-gray-900">{bundle.label}</div>
                      <div className="text-red-600 font-bold text-2xl mb-2">GH₵{bundle.price}</div>
                      {!bundle.inStock && (
                        <div className="text-red-500 text-sm font-bold">Out of Stock</div>
                      )}
                      {bundle.inStock && (
                        <div className="inline-flex items-center text-white text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 px-3 py-1 rounded-full">
                          <span>Buy Now</span>
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Important Notice */}
              <div className="mt-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-2xl">
                <div className="flex items-start">
                  <AlertTriangle className="w-6 h-6 text-amber-600 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3">Important Notice</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700">
                      <p className="flex items-center">
                        <Info className="w-4 h-4 text-blue-500 mr-2" />
                        Only 020 or 050 numbers supported
                      </p>
                      <p className="flex items-center">
                        <X className="w-4 h-4 text-red-500 mr-2" />
                        Not instant service - delivery takes time
                      </p>
                      <p className="flex items-center">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mr-2" />
                        No refunds for wrong numbers
                      </p>
                      <p className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Verify number carefully before purchase
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Telecel Branding Footer */}
              <div className="mt-8 text-center">
                <div className="inline-flex items-center space-x-2 text-gray-600">
                  <TelecelLogo className="w-10 h-10" />
                  <span className="font-semibold">Powered by Telecel Ghana • Your Network of Choice</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelecelBundleSelect;