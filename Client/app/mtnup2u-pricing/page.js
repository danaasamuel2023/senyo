'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MTNUp2UPricing = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState(null);

  // Current MTN prices with 0.5 GHS profit margin
  const mtnPrices = [
    { capacity: '1', mb: '1000', price: '4.7', description: 'MTN 1GB Data Bundle' },
    { capacity: '2', mb: '2000', price: '8.9', description: 'MTN 2GB Data Bundle' },
    { capacity: '3', mb: '3000', price: '13.0', description: 'MTN 3GB Data Bundle' },
    { capacity: '4', mb: '4000', price: '17.0', description: 'MTN 4GB Data Bundle' },
    { capacity: '5', mb: '5000', price: '21.0', description: 'MTN 5GB Data Bundle' },
    { capacity: '6', mb: '6000', price: '25.1', description: 'MTN 6GB Data Bundle' },
    { capacity: '7', mb: '7000', price: '29.0', description: 'MTN 7GB Data Bundle' },
    { capacity: '8', mb: '8000', price: '33.3', description: 'MTN 8GB Data Bundle' },
    { capacity: '10', mb: '10000', price: '41.5', description: 'MTN 10GB Data Bundle' },
    { capacity: '15', mb: '15000', price: '62.0', description: 'MTN 15GB Data Bundle' },
    { capacity: '20', mb: '20000', price: '82.5', description: 'MTN 20GB Data Bundle' },
    { capacity: '25', mb: '25000', price: '103.0', description: 'MTN 25GB Data Bundle' },
    { capacity: '30', mb: '30000', price: '123.5', description: 'MTN 30GB Data Bundle' },
    { capacity: '40', mb: '40000', price: '164.5', description: 'MTN 40GB Data Bundle' },
    { capacity: '50', mb: '50000', price: '205.5', description: 'MTN 50GB Data Bundle' },
    { capacity: '60', mb: '60000', price: '246.5', description: 'MTN 60GB Data Bundle' },
    { capacity: '80', mb: '80000', price: '328.5', description: 'MTN 80GB Data Bundle' },
    { capacity: '100', mb: '100000', price: '410.5', description: 'MTN 100GB Data Bundle' }
  ];

  // API base URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://unlimitedata.onrender.com';

  // Load packages on component mount
  useEffect(() => {
    setPackages(mtnPrices);
    setLoading(false);
  }, []);

  // Function to calculate price per GB
  const pricePerGB = (mb, price) => {
    const gbValue = parseInt(mb) / 1000;
    return (parseFloat(price) / gbValue).toFixed(2);
  };

  // Function to determine if a plan is popular (for highlighting)
  const isPopular = (capacity) => {
    return ['5', '10', '20'].includes(capacity);
  };

  // Function to validate phone number
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(0|\+233)[2-9]\d{8}$/;
    return phoneRegex.test(phone);
  };

  // Function to handle package selection
  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setPurchaseStatus(null);
  };

  // Function to handle purchase
  const handlePurchase = async () => {
    if (!selectedPackage) {
      setPurchaseStatus({ type: 'error', message: 'Please select a package' });
      return;
    }

    if (!phoneNumber) {
      setPurchaseStatus({ type: 'error', message: 'Please enter your phone number' });
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setPurchaseStatus({ type: 'error', message: 'Please enter a valid Ghana phone number' });
      return;
    }

    setPurchasing(true);
    setPurchaseStatus(null);

    try {
      const response = await axios.post(`${API_URL}/api/v1/order`, {
        network: 'MTN',
        capacity: parseInt(selectedPackage.capacity),
        phoneNumber: phoneNumber,
        amount: parseFloat(selectedPackage.price),
        packageType: 'MTN Up2U',
        description: selectedPackage.description
      });

      if (response.data.success) {
        setPurchaseStatus({ 
          type: 'success', 
          message: `Order placed successfully! Order ID: ${response.data.orderId}` 
        });
        setPhoneNumber('');
        setSelectedPackage(null);
      } else {
        setPurchaseStatus({ 
          type: 'error', 
          message: response.data.message || 'Purchase failed' 
        });
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setPurchaseStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Network error. Please try again.' 
      });
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading MTN Up2U packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            MTN Up2U Data Bundles
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Purchase MTN data bundles instantly. Enter your phone number and select your preferred package.
          </p>
        </div>

        {/* Purchase Form */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Purchase Data Bundle</h2>
          
          {/* Phone Number Input */}
          <div className="mb-4">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input type="tel"
              id="phoneNumber" name="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number (e.g., 0241234567)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Format: 0241234567 or +233241234567</p>
          </div>

          {/* Selected Package Display */}
          {selectedPackage && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-blue-900">Selected Package:</h3>
              <p className="text-blue-800">
                {selectedPackage.description} - {selectedPackage.price} GHS
              </p>
            </div>
          )}

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={!selectedPackage || !phoneNumber || purchasing}
            className={`w-full py-3 px-4 rounded-md font-medium ${
              !selectedPackage || !phoneNumber || purchasing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {purchasing ? 'Processing...' : 'Purchase Bundle'}
          </button>

          {/* Purchase Status */}
          {purchaseStatus && (
            <div className={`mt-4 p-3 rounded-md ${
              purchaseStatus.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {purchaseStatus.message}
            </div>
          )}
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {packages.map((pkg, idx) => (
            <div
              key={`package-${pkg.capacity}`}
              onClick={() => handleSelectPackage(pkg)}
              className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all duration-200 ${
                selectedPackage?.capacity === pkg.capacity
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:shadow-lg hover:scale-105'
              } ${isPopular(pkg.capacity) ? 'border-l-4 border-blue-500' : ''}`}
            >
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-gray-900">{pkg.capacity}GB</span>
                  {isPopular(pkg.capacity) && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-2">{parseInt(pkg.mb).toLocaleString()} MB</p>
                <p className="text-lg font-semibold text-blue-600 mb-1">{pkg.price} GHS</p>
                <p className="text-xs text-gray-400">{pricePerGB(pkg.mb, pkg.price)} GHS/GB</p>
                <div className="mt-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    selectedPackage?.capacity === pkg.capacity
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedPackage?.capacity === pkg.capacity ? 'Selected' : 'Select'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Information Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">How to Purchase:</h4>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                <li>Enter your MTN phone number</li>
                <li>Select your preferred data package</li>
                <li>Click "Purchase Bundle"</li>
                <li>Data will be credited to your number instantly</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Terms & Conditions:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Valid for MTN Ghana numbers only</li>
                <li>Data expires based on MTN's policy</li>
                <li>No refunds after successful purchase</li>
                <li>Prices are subject to change</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MTNUp2UPricing;