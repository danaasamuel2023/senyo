'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ATBundleCards = () => {
  const [selectedBundleIndex, setSelectedBundleIndex] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [globalMessage, setGlobalMessage] = useState({ text: '', type: '' });
  const [bundleMessages, setBundleMessages] = useState({});
  const [userData, setUserData] = useState(null);

  // Get user data from localStorage on component mount
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  const bundles = [
    { capacity: '1', mb: '1000', price: '3.9', network: 'AT_PREMIUM' },
    { capacity: '2', mb: '2000', price: '8.30', network: 'AT_PREMIUM' },
    { capacity: '3', mb: '3000', price: '13.20', network: 'AT_PREMIUM' },
    { capacity: '4', mb: '4000', price: '16.00', network: 'AT_PREMIUM' },
    { capacity: '5', mb: '5000', price: '19.00', network: 'AT_PREMIUM' },
    { capacity: '6', mb: '6000', price: '23.00', network: 'AT_PREMIUM' },
    { capacity: '8', mb: '8000', price: '30.00', network: 'AT_PREMIUM' },
    { capacity: '10', mb: '10000', price: '37.50', network: 'AT_PREMIUM' },
    { capacity: '12', mb: '12000', price: '42.50', network: 'AT_PREMIUM' },
    { capacity: '15', mb: '15000', price: '54.50', network: 'AT_PREMIUM' },
    { capacity: '25', mb: '25000', price: '87.00', network: 'AT_PREMIUM' },
    { capacity: '30', mb: '30000', price: '110.00', network: 'AT_PREMIUM' },
    { capacity: '40', mb: '40000', price: '145.00', network: 'AT_PREMIUM' },
    { capacity: '50', mb: '50000', price: '180.00', network: 'AT_PREMIUM' }
  ];

  // Enhanced AT Logo SVG with official colors
  const ATLogo = () => (
    <svg width="80" height="80" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="atGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#ED1C24', stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:'#0066CC', stopOpacity:1}} />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="85" fill="#ffffff" stroke="url(#atGradient)" strokeWidth="3"/>
      <circle cx="70" cy="100" r="25" fill="#ED1C24" opacity="0.9"/>
      <circle cx="130" cy="100" r="25" fill="#0066CC" opacity="0.9"/>
      <text x="100" y="115" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="55" fill="#ffffff" stroke="#000000" strokeWidth="1">AT</text>
      <text x="100" y="155" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="18" fill="url(#atGradient)">PREMIUM</text>
    </svg>
  );

  // Large Package Logo Component for bundles
  const ATPackageLogo = ({ capacity }) => (
    <div className="relative w-24 h-24 mx-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-[#ED1C24] to-[#0066CC] rounded-2xl opacity-20 animate-pulse"></div>
      <div className="relative w-full h-full bg-white rounded-2xl flex flex-col items-center justify-center shadow-xl border-2 border-transparent bg-gradient-to-br from-[#ED1C24] via-purple-600 to-[#0066CC] p-[2px]">
        <div className="w-full h-full bg-white rounded-2xl flex flex-col items-center justify-center">
          <span className="font-black text-4xl bg-gradient-to-r from-[#ED1C24] to-[#0066CC] bg-clip-text text-transparent">{capacity}</span>
          <span className="font-bold text-sm text-gray-700 -mt-1">GB</span>
          <div className="flex mt-1">
            <div className="w-2 h-2 bg-[#ED1C24] rounded-full mx-0.5"></div>
            <div className="w-2 h-2 bg-[#0066CC] rounded-full mx-0.5"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleSelectBundle = (index) => {
    setSelectedBundleIndex(index === selectedBundleIndex ? null : index);
    setPhoneNumber('');
    // Clear any error messages for this bundle
    setBundleMessages(prev => ({ ...prev, [index]: null }));
  };

  // Function to validate phone number format for Airtel Tigo
  const validatePhoneNumber = (number) => {
    // Remove any spaces or dashes
    const cleanNumber = number.replace(/[\s-]/g, '');
    
    // Airtel Tigo prefixes: 024, 054, 055, 057, 026, 027
    const airtelTigoPrefixes = ['024', '054', '055', '057','026','027'];
    
    // Check if number starts with valid Airtel Tigo prefix and is 10 digits
    return cleanNumber.length === 10 && 
           airtelTigoPrefixes.some(prefix => cleanNumber.startsWith(prefix));
  };
  
  // Format phone number as user types
  const formatPhoneNumber = (input) => {
    // Remove all non-numeric characters
    let formatted = input.replace(/\D/g, '');
    
    // Limit to correct length (10 digits total)
    if (formatted.length > 10) {
      formatted = formatted.substring(0, 10);
    }
    
    return formatted;
  };

  const handlePhoneNumberChange = (e) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setPhoneNumber(formattedNumber);
  };

  const handlePurchase = async (bundle, index) => {
    // Clear previous messages
    setBundleMessages(prev => ({ ...prev, [index]: null }));
    setGlobalMessage({ text: '', type: '' });
    
    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      setBundleMessages(prev => ({ 
        ...prev, 
        [index]: { 
          text: 'Please enter a valid Airtel Tigo phone number (024, 054, 055, 057, 026, or 027 followed by 7 digits)', 
          type: 'error' 
        } 
      }));
      return;
    }

    if (!userData || !userData.id) {
      setGlobalMessage({ text: 'User not authenticated. Please login to continue.', type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post('https://datamartbackened.onrender.com/api/v1/data/purchase-data', {
        userId: userData.id,
        phoneNumber: phoneNumber,
        network: bundle.network,
        capacity: bundle.capacity, // Sending MB value as capacity
        price: parseFloat(bundle.price)
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status === 'success') {
        setGlobalMessage({ 
          text: `${bundle.capacity}GB data bundle purchased successfully for ${phoneNumber}`, 
          type: 'success' 
        });
        setSelectedBundleIndex(null);
        setPhoneNumber('');
        
        // Auto-scroll to the top to see the success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setBundleMessages(prev => ({ 
        ...prev, 
        [index]: { 
          text: error.response?.data?.message || 'Failed to purchase data bundle', 
          type: 'error' 
        } 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
      {/* Header with gradient */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-[#ED1C24] to-[#0066CC] bg-clip-text text-transparent">
          AT Premium Bundles
        </h1>
        <p className="text-gray-600 text-lg">Life is Simple • Choose Your Data Package</p>
      </div>
      
      {globalMessage.text && (
        <div className={`mb-6 p-4 rounded-lg shadow-lg ${globalMessage.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 'bg-red-100 text-red-800 border-l-4 border-red-500'}`}>
          <div className="flex items-center">
            <div className="mr-3">
              {globalMessage.type === 'success' ? (
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <span className="font-medium">{globalMessage.text}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {bundles.map((bundle, index) => (
          <div key={index} className="flex flex-col">
            <div 
              className={`flex bg-gradient-to-br from-[#ED1C24] to-[#0066CC] text-white w-full rounded-t-2xl flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${selectedBundleIndex === index ? 'rounded-b-none' : 'rounded-b-2xl'} relative overflow-hidden`}
              onClick={() => handleSelectBundle(index)}
            >
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16"></div>
              </div>
              
              <div className="flex flex-col items-center justify-center w-full p-4 space-y-3 relative z-10">
                {/* Large Package Logo */}
                <ATPackageLogo capacity={bundle.capacity} />
                
                <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                  {bundle.capacity} GB
                </h3>
              </div>
              
              <div className="grid grid-cols-2 text-white relative z-10" 
                   style={{ 
                     background: 'linear-gradient(135deg, rgba(237,28,36,0.9) 0%, rgba(0,102,204,0.9) 100%)',
                     borderRadius: selectedBundleIndex === index ? '0' : '0 0 1rem 1rem' 
                   }}>
                <div className="flex flex-col items-center justify-center p-3 text-center border-r border-r-white/30">
                  <p className="text-xl font-bold">GH₵ {bundle.price}</p>
                  <p className="text-sm opacity-90">Price</p>
                </div>
                <div className="flex flex-col items-center justify-center p-3 text-center">
                  <p className="text-xl font-bold">No-Expiry</p>
                  <p className="text-sm opacity-90">Duration</p>
                </div>
              </div>
            </div>
            
            {selectedBundleIndex === index && (
              <div className="bg-gradient-to-br from-[#ED1C24] to-[#0066CC] p-[2px] rounded-b-2xl">
                <div className="bg-white p-4 rounded-b-2xl">
                  {bundleMessages[index] && (
                    <div className={`mb-3 p-3 rounded-lg ${bundleMessages[index].type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800 border-l-4 border-red-500'}`}>
                      <div className="flex items-center">
                        {bundleMessages[index].type === 'error' && (
                          <svg className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        )}
                        <span className="text-sm">{bundleMessages[index].text}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Airtel Tigo Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 border-2 border-gray-200 focus:outline-none focus:border-[#ED1C24] focus:bg-white transition-all"
                        placeholder="024XXXXXXX or 054XXXXXXX"
                        value={phoneNumber}
                        onChange={handlePhoneNumberChange}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg width="20" height="20" viewBox="0 0 40 40">
                          <circle cx="15" cy="20" r="8" fill="#ED1C24" opacity="0.8"/>
                          <circle cx="25" cy="20" r="8" fill="#0066CC" opacity="0.8"/>
                        </svg>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Must start with 024, 054, 055, 057, 026, or 027 followed by 7 digits</p>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePurchase(bundle, index);
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-bold transition-all transform hover:scale-105 active:scale-95"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : 'Purchase Bundle'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Footer branding */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center space-x-2">
          <div className="flex">
            <div className="w-3 h-3 bg-[#ED1C24] rounded-full"></div>
            <div className="w-3 h-3 bg-[#0066CC] rounded-full -ml-1"></div>
          </div>
          <span className="text-gray-600 font-semibold">Powered by AirtelTigo • Life is Simple</span>
        </div>
      </div>
    </div>
  );
};

export default ATBundleCards;