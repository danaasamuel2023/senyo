'use client'
import React, { useState, useEffect } from 'react';
import { Zap, Star, AlertTriangle, CheckCircle, X, Info, Shield, Phone, CreditCard, ArrowRight, Sparkles, Wifi } from 'lucide-react';

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
            : 'bg-blue-500 text-white border-blue-400'
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

// Purchase Modal Component
const PurchaseModal = ({ isOpen, onClose, bundle, phoneNumber, setPhoneNumber, onPurchase, error, isLoading }) => {
  if (!isOpen || !bundle) return null;

  const handlePhoneNumberChange = (e) => {
    let formatted = e.target.value.replace(/\D/g, '');
    
    if (!formatted.startsWith('0') && formatted.length > 0) {
      formatted = '0' + formatted;
    }
    
    if (formatted.length > 10) {
      formatted = formatted.substring(0, 10);
    }
    
    setPhoneNumber(formatted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
        {/* Modal header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 rounded-t-3xl flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Wifi className="w-6 h-6 mr-2" />
            Purchase {bundle.capacity}GB
          </h3>
          <button onClick={onClose} className="text-white hover:text-white/70 p-2 rounded-xl hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Modal content */}
        <div className="px-6 py-6">
          {/* Bundle Info */}
          <div className="bg-blue-50 rounded-2xl p-5 mb-5 border border-blue-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-medium">Data Bundle:</span>
              <span className="text-blue-600 font-bold text-lg">{bundle.capacity}GB</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-medium">Service:</span>
              <span className="text-blue-600 font-bold">iShare Premium</span>
            </div>
            <div className="flex justify-between items-center border-t border-blue-200 pt-3">
              <span className="text-gray-900 font-bold">Total Price:</span>
              <span className="text-blue-600 font-bold text-xl">GH₵{bundle.price}</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-5 p-4 rounded-2xl flex items-start bg-red-50 border border-red-200">
              <X className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-red-700 text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Phone Number Form */}
          <div className="mb-5">
            <label className="block text-sm font-bold mb-3 text-gray-800">
              Enter Recipient Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="w-5 h-5 text-blue-500" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                className="pl-12 pr-4 py-4 block w-full rounded-2xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-lg transition-all"
                placeholder="0XXXXXXXXX"
                required
                autoFocus
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">AirtelTigo numbers only (026, 056, 027, 057, 023, 053)</p>
          </div>

          {/* Warning */}
          <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-amber-800 text-sm font-medium">
                  <strong>Important:</strong> Verify your number carefully. No refunds for wrong numbers.
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
              className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base shadow-lg"
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

const ServiceInfoModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
        {/* Modal header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 rounded-t-3xl flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            iShare Premium Service
          </h3>
          <button onClick={onClose} className="text-white hover:text-white/70 p-2 rounded-xl hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Modal content */}
        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4 text-gray-700">
            <div className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-3 mt-2 flex-shrink-0"></div>
              <p><strong className="text-gray-900">Premium instant service</strong> - Guaranteed API processing</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-3 mt-2 flex-shrink-0"></div>
              <p>Works with AirtelTigo numbers (026, 056, 027, 057, 023, 053)</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-3 mt-2 flex-shrink-0"></div>
              <p>No refunds for incorrect phone numbers</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-3 mt-2 flex-shrink-0"></div>
              <p>30-day validity for all bundles</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-3 mt-2 flex-shrink-0"></div>
              <p>Premium processing - Never delayed</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl mt-5">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-blue-800 text-sm font-medium">
                iShare Premium guarantees instant processing through our premium API channel.
              </p>
            </div>
          </div>
        </div>
        
        {/* Modal footer */}
        <div className="px-6 py-5 border-t border-gray-100 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-2xl transition-all transform hover:scale-105 shadow-lg"
          >
            Continue
          </button>
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
            <div className="absolute top-0 w-16 h-16 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 animate-pulse flex items-center justify-center">
              <Wifi className="w-6 h-6 text-white animate-bounce" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <h4 className="text-xl font-bold text-gray-900 mb-2">Processing...</h4>
        <p className="text-gray-600">Please wait while we process your order</p>
      </div>
    </div>
  );
};

const iShareBundleSelect = () => {
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
    { value: '1', label: '1GB', capacity: '1', price: '3.95', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '2', label: '2GB', capacity: '2', price: '8.35', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '3', label: '3GB', capacity: '3', price: '13.25', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '4', label: '4GB', capacity: '4', price: '16.50', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '5', label: '5GB', capacity: '5', price: '19.50', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '6', label: '6GB', capacity: '6', price: '23.50', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '8', label: '8GB', capacity: '8', price: '30.50', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '10', label: '10GB', capacity: '10', price: '38.50', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '12', label: '12GB', capacity: '12', price: '45.50', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '15', label: '15GB', capacity: '15', price: '57.50', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '25', label: '25GB', capacity: '25', price: '95.00', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '30', label: '30GB', capacity: '30', price: '115.00', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '40', label: '40GB', capacity: '40', price: '151.00', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '50', label: '50GB', capacity: '50', price: '190.00', network: 'AT_PREMIUM', inStock: inventoryAvailable }
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

  // Function to validate AirtelTigo phone number (iShare uses same network)
  const validatePhoneNumber = (number) => {
    const airtelTigoPrefixes = ['026', '056', '027', '057', '023', '053'];
    const cleanNumber = number.replace(/[\s-]/g, '');
    
    if (cleanNumber.startsWith('0')) {
      return cleanNumber.length === 10 && airtelTigoPrefixes.includes(cleanNumber.substring(0, 3));
    }
    
    return false;
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

    setSelectedBundle(bundle.value);
    setPendingPurchase(bundle);
    setPhoneNumber(''); // Reset phone number
    setError(''); // Clear any previous errors
    setIsPurchaseModalOpen(true);
  };

  // Process the actual purchase
  const processPurchase = async () => {
    if (!pendingPurchase) return;
    
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid AirtelTigo number (026, 056, 027, 057, 023, 053)');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://datahustle.onrender.com/api/v1/data/purchase-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userData.id,
          phoneNumber: phoneNumber,
          network: 'AT_PREMIUM',
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
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
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-xl">
                <Wifi className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                iShare Premium
              </h1>
            </div>
            <p className="text-gray-600 text-lg">Premium 30-Day Data Bundles • Instant Delivery</p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                    <Shield className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Premium Service</h2>
                    <p className="text-blue-100 text-lg">Guaranteed instant delivery • Best prices</p>
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
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-50 border-2 border-blue-200 text-blue-700 font-bold rounded-2xl hover:bg-blue-100 transition-all text-base"
                >
                  <Info className="h-5 w-5" />
                  <span>Premium Service Information</span>
                </button>
              </div>

              {/* Bundle Selection Grid */}
              <div>
                <h3 className="text-2xl font-bold mb-6 text-gray-900 text-center">
                  Choose Your Data Package
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {bundles.map((bundle) => (
                    <button
                      key={bundle.value}
                      type="button"
                      onClick={() => handleBundleSelect(bundle)}
                      disabled={!bundle.inStock}
                      className={`p-6 rounded-2xl text-center transition-all transform hover:scale-105 border-2 ${
                        bundle.inStock
                          ? 'bg-white border-blue-200 hover:border-blue-400 hover:shadow-xl cursor-pointer'
                          : 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="text-3xl font-bold mb-2 text-gray-900">{bundle.label}</div>
                      <div className="text-blue-600 font-bold text-2xl mb-2">GH₵{bundle.price}</div>
                      {!bundle.inStock && (
                        <div className="text-red-500 text-sm font-bold">Out of Stock</div>
                      )}
                      {bundle.inStock && (
                        <div className="inline-flex items-center text-blue-600 text-sm font-semibold bg-blue-50 px-3 py-1 rounded-full">
                          <span>Buy Now</span>
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Important Notice */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl">
                <div className="flex items-start">
                  <Shield className="w-6 h-6 text-blue-600 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3">Premium Benefits</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700">
                      <p className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Guaranteed instant processing
                      </p>
                      <p className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Premium API channel
                      </p>
                      <p className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        30-day validity for all bundles
                      </p>
                      <p className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Works with all AirtelTigo numbers
                      </p>
                    </div>
                    <p className="text-amber-700 text-sm font-semibold mt-4 bg-amber-50 p-3 rounded-xl border border-amber-200">
                      ⚠️ No refunds for wrong numbers - Please verify carefully
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default iShareBundleSelect;