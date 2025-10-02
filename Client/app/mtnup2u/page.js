'use client'
import React, { useState, useEffect } from 'react';
import { Zap, Star, AlertTriangle, CheckCircle, X, Info, Shield, Phone, CreditCard, ArrowRight, Wifi, Signal } from 'lucide-react';

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
            ? 'bg-[#FFCC08] text-black border-yellow-500' 
            : 'bg-[#FFCC08] text-black border-yellow-500'
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

// Enhanced MTN Logo Component with official branding
const MTNLogo = ({ className = "w-12 h-12", showText = true }) => (
  <div className={`${className} relative`}>
    <div className="w-full h-full bg-[#FFCC08] rounded-[50%] flex items-center justify-center shadow-xl border-2 border-black">
      {showText && (
        <span className="font-black text-black text-2xl tracking-tight">MTN</span>
      )}
    </div>
  </div>
);

// Large MTN Package Logo for bundle display
const MTNPackageLogo = ({ capacity }) => (
  <div className="relative w-20 h-20 mx-auto mb-3">
    <div className="w-full h-full bg-gradient-to-br from-[#FFCC08] to-yellow-500 rounded-2xl flex flex-col items-center justify-center shadow-lg border-2 border-black transform rotate-3 hover:rotate-0 transition-transform">
      <span className="font-black text-black text-3xl">{capacity}</span>
      <span className="font-bold text-black text-xs -mt-1">GB</span>
    </div>
    <div className="absolute -top-2 -right-2 w-6 h-6 bg-black rounded-full flex items-center justify-center">
      <Star className="w-3 h-3 text-[#FFCC08]" fill="#FFCC08" />
    </div>
  </div>
);

// Purchase Modal Component with MTN colors
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
        {/* Modal header with MTN colors */}
        <div className="bg-[#FFCC08] px-6 py-5 rounded-t-3xl flex justify-between items-center">
          <h3 className="text-xl font-bold text-black flex items-center">
            <Signal className="w-6 h-6 mr-2" />
            Purchase {bundle.capacity}GB
          </h3>
          <button onClick={onClose} className="text-black hover:text-gray-700 p-2 rounded-xl hover:bg-black/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Modal content */}
        <div className="px-6 py-6">
          {/* Bundle Info with MTN Package Logo */}
          <div className="mb-5">
            <MTNPackageLogo capacity={bundle.capacity} />
          </div>
          
          <div className="bg-yellow-50 rounded-2xl p-5 mb-5 border-2 border-[#FFCC08]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-medium">Data Bundle:</span>
              <span className="text-black font-bold text-lg">{bundle.capacity}GB</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-medium">Duration:</span>
              <span className="text-black font-bold">No-Expiry</span>
            </div>
            <div className="flex justify-between items-center border-t-2 border-[#FFCC08] pt-3">
              <span className="text-black font-bold">Total Price:</span>
              <span className="text-black font-bold text-xl bg-[#FFCC08] px-3 py-1 rounded-lg">GH₵{bundle.price}</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-5 p-4 rounded-2xl flex items-start bg-yellow-50 border-2 border-[#FFCC08]">
              <X className="w-5 h-5 text-black mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-black text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Phone Number Form */}
          <div className="mb-5">
            <label className="block text-sm font-bold mb-3 text-black">
              Enter MTN Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="w-5 h-5 text-[#FFCC08]" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                className="pl-12 pr-4 py-4 block w-full rounded-2xl bg-gray-50 border-2 border-gray-200 text-black placeholder-gray-400 focus:ring-3 focus:ring-[#FFCC08] focus:border-[#FFCC08] font-semibold text-lg transition-all"
                placeholder="0XXXXXXXXX"
                required
                autoFocus
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">Format: 0 followed by 9 digits</p>
          </div>

          {/* Warning with MTN colors */}
          <div className="mb-5 p-4 bg-yellow-50 border-2 border-[#FFCC08] rounded-2xl">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-black mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-black text-sm font-medium">
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
              className="flex-1 py-4 px-6 bg-[#FFCC08] hover:bg-yellow-500 text-black font-bold rounded-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-3 border-gray-700/30 border-t-black rounded-full animate-spin mr-2"></div>
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
        {/* Modal header with MTN amber color */}
        <div className="bg-amber-500 px-6 py-5 rounded-t-3xl flex justify-between items-center">
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
              <div className="w-2 h-2 rounded-full bg-[#FFCC08] mr-3 mt-2 flex-shrink-0"></div>
              <p><strong className="text-black">Not instant service</strong> - delivery times vary</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-[#FFCC08] mr-3 mt-2 flex-shrink-0"></div>
              <p>For urgent data, use <strong className="text-black">*138#</strong> instead</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-[#FFCC08] mr-3 mt-2 flex-shrink-0"></div>
              <p>Please be patient - orders may take time to process</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-[#FFCC08] mr-3 mt-2 flex-shrink-0"></div>
              <p>Not suitable for instant bundle needs</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 border-2 border-[#FFCC08] p-4 rounded-2xl mt-5">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-black mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-black text-sm font-medium">
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
            className="flex-1 py-3 px-4 bg-[#FFCC08] hover:bg-yellow-500 text-black font-bold rounded-2xl transition-all transform hover:scale-105 shadow-lg"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading Overlay with MTN colors
const LoadingOverlay = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-xs w-full mx-auto text-center shadow-2xl">
        <div className="flex justify-center mb-5">
          <div className="relative w-16 h-16">
            <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>
            <div className="absolute top-0 w-16 h-16 rounded-full border-4 border-transparent border-t-[#FFCC08] animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-[#FFCC08] animate-pulse flex items-center justify-center">
              <Signal className="w-6 h-6 text-black animate-bounce" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <h4 className="text-xl font-bold text-black mb-2">Processing...</h4>
        <p className="text-gray-600">Please wait while we process your order</p>
      </div>
    </div>
  );
};

const MTNBundleSelect = () => {
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
    { value: '1', label: '1GB', capacity: '1', price: '4.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '2', label: '2GB', capacity: '2', price: '9.20', network: 'YELLO', inStock: inventoryAvailable },
    { value: '3', label: '3GB', capacity: '3', price: '13.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '4', label: '4GB', capacity: '4', price: '18.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '5', label: '5GB', capacity: '5', price: '23.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '6', label: '6GB', capacity: '6', price: '27.00', network: 'YELLO', inStock: inventoryAvailable },
    { value: '8', label: '8GB', capacity: '8', price: '35.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '10', label: '10GB', capacity: '10', price: '43.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '15', label: '15GB', capacity: '15', price: '62.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '20', label: '20GB', capacity: '20', price: '83.00', network: 'YELLO', inStock: inventoryAvailable },
    { value: '25', label: '25GB', capacity: '25', price: '105.00', network: 'YELLO', inStock: inventoryAvailable },
    { value: '30', label: '30GB', capacity: '30', price: '129.00', network: 'YELLO', inStock: inventoryAvailable },
    { value: '40', label: '40GB', capacity: '40', price: '166.00', network: 'YELLO', inStock: inventoryAvailable },
    { value: '50', label: '50GB', capacity: '50', price: '207.00', network: 'YELLO', inStock: inventoryAvailable },
    { value: '100', label: '100GB', capacity: '100', price: '407.00', network: 'YELLO', inStock: inventoryAvailable }
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

  // Function to validate phone number format
  const validatePhoneNumber = (number) => {
    const cleanNumber = number.replace(/[\s-]/g, '');
    
    if (cleanNumber.startsWith('0')) {
      return cleanNumber.length === 10 && /^0\d{9}$/.test(cleanNumber);
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
      setError('Please enter a valid MTN number (10 digits starting with 0)');
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
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
          
          {/* Header with MTN Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <MTNLogo className="w-16 h-16" />
              <div>
                <h1 className="text-4xl font-bold text-black">
                  Data Bundles
                </h1>
                <p className="text-black font-semibold">Everywhere You Go</p>
              </div>
            </div>
            <p className="text-gray-600 text-lg">Non-Expiry Data Packages • Best Value</p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-100">
            {/* Header with MTN Yellow */}
            <div className="bg-[#FFCC08] p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 rounded-2xl bg-white/30 backdrop-blur flex items-center justify-center">
                  <Star className="w-6 h-6 text-black" />
                </div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center">
                    <Signal className="w-7 h-7 text-black" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-black">Select Your Bundle</h2>
                    <p className="text-black/80 text-lg">Choose data package & buy instantly</p>
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
                  className="flex items-center space-x-2 px-6 py-3 bg-amber-50 border-2 border-amber-300 text-amber-700 font-bold rounded-2xl hover:bg-amber-100 transition-all text-base"
                >
                  <Info className="h-5 w-5" />
                  <span>Service Information</span>
                </button>
              </div>

              {/* Bundle Selection Grid with Large MTN Package Logos */}
              <div>
                <h3 className="text-2xl font-bold mb-6 text-black text-center">
                  Choose Your Data Package
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {bundles.map((bundle) => (
                    <button
                      key={bundle.value}
                      type="button"
                      onClick={() => handleBundleSelect(bundle)}
                      disabled={!bundle.inStock}
                      className={`p-6 rounded-2xl text-center transition-all transform hover:scale-105 border-2 relative overflow-hidden ${
                        bundle.inStock
                          ? 'bg-white border-[#FFCC08] hover:border-yellow-500 hover:bg-yellow-50 hover:shadow-xl cursor-pointer group'
                          : 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {/* MTN Package Logo for each bundle */}
                      <div className="mb-3">
                        <MTNPackageLogo capacity={bundle.capacity} />
                      </div>
                      
                      <div className="text-black font-bold text-2xl mb-2 bg-[#FFCC08] px-3 py-1 rounded-lg inline-block">
                        GH₵{bundle.price}
                      </div>
                      
                      {!bundle.inStock && (
                        <div className="text-red-500 text-sm font-bold">Out of Stock</div>
                      )}
                      {bundle.inStock && (
                        <div className="inline-flex items-center text-black text-sm font-semibold bg-yellow-100 px-3 py-1 rounded-full mt-2 group-hover:bg-[#FFCC08] transition-colors">
                          <span>Buy Now</span>
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Important Notice with MTN colors */}
              <div className="mt-8 p-6 bg-yellow-50 border-2 border-[#FFCC08] rounded-2xl">
                <div className="flex items-start">
                  <AlertTriangle className="w-6 h-6 text-black mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-lg font-bold text-black mb-3">Important Notice</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700">
                      <p className="flex items-center">
                        <X className="w-4 h-4 text-black mr-2" />
                        Not instant service - delivery takes time
                      </p>
                      <p className="flex items-center">
                        <X className="w-4 h-4 text-black mr-2" />
                        Turbonet & Broadband SIMs not eligible
                      </p>
                      <p className="flex items-center">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mr-2" />
                        No refunds for wrong numbers
                      </p>
                      <p className="flex items-center">
                        <Info className="w-4 h-4 text-blue-500 mr-2" />
                        For urgent data, use *138# instead
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* MTN Branding Footer */}
              <div className="mt-8 text-center">
                <div className="inline-flex items-center space-x-2 text-black">
                  <MTNLogo className="w-8 h-8" showText={false} />
                  <span className="font-semibold">Powered by MTN • Everywhere You Go</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MTNBundleSelect;