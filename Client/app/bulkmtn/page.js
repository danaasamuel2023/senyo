'use client'

import React, { useState, useEffect } from 'react';
import { Upload, FileText, Users, CheckCircle, AlertCircle, Download, FileUp, Info, Zap, Package } from 'lucide-react';

const BulkDataPurchase = () => {
  const [file, setFile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dataPrices, setDataPrices] = useState([]);
  const [activeTab, setActiveTab] = useState('file');
  const [userData, setUserData] = useState(null);
  const [manualEntry, setManualEntry] = useState({
    phoneNumbers: '',
    dataAmount: '1'
  });
  
  useEffect(() => {
    // Safely access localStorage
    if (typeof window !== 'undefined') {
      try {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
        setError('Failed to load user data from storage');
      }
    }
    
    // Load data prices with GH₵ currency
    setDataPrices([
      { capacity: '1', mb: '1000', price: '4.30', network: 'YELLO' },
      { capacity: '2', mb: '2000', price: '9.20', network: 'YELLO' },
      { capacity: '3', mb: '3000', price: '13.50', network: 'YELLO' },
      { capacity: '4', mb: '4000', price: '18.50', network: 'YELLO' },
      { capacity: '5', mb: '5000', price: '23.50', network: 'YELLO' },
      { capacity: '6', mb: '6000', price: '27.00', network: 'YELLO' },
      { capacity: '8', mb: '8000', price: '35.50', network: 'YELLO' },
      { capacity: '10', mb: '10000', price: '43.50', network: 'YELLO' },
      { capacity: '15', mb: '15000', price: '62.50', network: 'YELLO' },
      { capacity: '20', mb: '20000', price: '83.00', network: 'YELLO' },
      { capacity: '25', mb: '25000', price: '105.00', network: 'YELLO' },
      { capacity: '30', mb: '30000', price: '129.00', network: 'YELLO' },
      { capacity: '40', mb: '40000', price: '166.00', network: 'YELLO' },
      { capacity: '50', mb: '50000', price: '207.00', network: 'YELLO' },
      { capacity: '100', mb: '100000', price: '407.00', network: 'YELLO' }
    ]);
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleManualEntryChange = (e) => {
    setManualEntry({
      ...manualEntry,
      [e.target.name]: e.target.value
    });
  };

  const processExcelFile = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      // Simulate file processing
      // In a real app, you'd process the Excel file here
      const simulatedOrders = [
        { phoneNumber: '0551234567', network: 'YELLO', capacity: 2, price: 9.20 },
        { phoneNumber: '0246783840', network: 'YELLO', capacity: 5, price: 23.50 }
      ];
      
      setOrders(simulatedOrders);
      setError(null);
    } catch (error) {
      console.error('Error processing file:', error);
      setError('Failed to process the Excel file. Please check the format.');
    }
  };

  const processManualEntry = () => {
    if (!manualEntry.phoneNumbers.trim()) {
      setError('Please enter at least one phone number');
      return;
    }
    
    const entries = manualEntry.phoneNumbers
      .split(/\n/)
      .filter(entry => entry.trim().length > 0);
    
    if (entries.length === 0) {
      setError('Please enter at least one valid entry');
      return;
    }
    
    const processedOrders = [];
    const errors = [];
    const seenPhoneNumbers = new Set();
    
    entries.forEach((entry, index) => {
      const parts = entry.trim().split(/\s+/);
      
      if (parts.length < 2) {
        errors.push(`Line ${index + 1}: Format should be "phone_number data_amount" (e.g., "0246783840 2")`);
        return;
      }
      
      const phoneNumber = parts[0].trim();
      const dataAmount = parts[1].trim();
      
      if (!/^\d{10,12}$/.test(phoneNumber.replace(/\D/g, ''))) {
        errors.push(`Line ${index + 1}: Invalid phone number format`);
        return;
      }
      
      const cleanedPhone = phoneNumber.replace(/\D/g, '');
      
      if (seenPhoneNumbers.has(cleanedPhone)) {
        errors.push(`Line ${index + 1}: Duplicate phone number (${cleanedPhone})`);
        return;
      }
      
      seenPhoneNumbers.add(cleanedPhone);
      
      const priceData = dataPrices.find(p => p.capacity === dataAmount);
      
      if (!priceData) {
        errors.push(`Line ${index + 1}: Invalid data amount (${dataAmount}GB)`);
        return;
      }
      
      processedOrders.push({
        phoneNumber: cleanedPhone,
        network: priceData.network,
        capacity: parseInt(priceData.capacity, 10),
        price: parseFloat(priceData.price)
      });
    });
    
    if (errors.length > 0) {
      setError(`Input contains errors:\n${errors.join('\n')}`);
      return;
    }
    
    setOrders(processedOrders);
    setError(null);
  };

  const submitBulkOrders = async () => {
    if (!userData || !userData.id) {
      setError('User not authenticated. Please log in again.');
      return;
    }
    
    if (orders.length === 0) {
      setError('No orders to process. Please add orders first.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Simulated API call
      setTimeout(() => {
        setResult({
          status: 'success',
          data: {
            totalOrders: orders.length,
            successfulOrders: orders.length,
            invalidOrders: [],
            newWalletBalance: 450.50
          }
        });
        setOrders([]);
        setFile(null);
        setManualEntry({ phoneNumbers: '', dataAmount: '1' });
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting bulk orders:', error);
      setError(error.message || 'Failed to process bulk orders');
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    // Simulated template download
    const templateContent = "PhoneNumber,DataAmount\n0551234567,1\n0246783840,2";
    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_data_template.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Bulk Data Purchase
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Process multiple data orders at once</p>
        </div>
        
        {/* Tab navigation */}
        <div className="flex mb-8 bg-white rounded-2xl p-2 shadow-md max-w-md mx-auto">
          <button 
            onClick={() => setActiveTab('file')} 
            className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-all ${
              activeTab === 'file' 
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold shadow-lg' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileUp className="w-5 h-5 mr-2" />
            Excel Upload
          </button>
          <button 
            onClick={() => setActiveTab('manual')} 
            className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-all ${
              activeTab === 'manual' 
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold shadow-lg' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5 mr-2" />
            Manual Entry
          </button>
        </div>
        
        {/* File upload section */}
        {activeTab === 'file' && (
          <div className="bg-white p-8 rounded-3xl shadow-xl mb-8 border-2 border-yellow-100">
            <div className="mb-8">
              <label className="block text-lg font-bold text-gray-800 mb-4">Upload Excel File with Orders</label>
              <div className="flex flex-col lg:flex-row items-start gap-6">
                <div className="flex-1 w-full">
                  <label className="flex flex-col items-center justify-center w-full h-48 px-6 transition-all bg-gradient-to-br from-yellow-50 to-amber-50 border-3 border-yellow-300 border-dashed rounded-2xl cursor-pointer hover:border-amber-400 hover:bg-amber-50">
                    <Upload className="w-12 h-12 text-amber-500 mb-3" />
                    <span className="font-bold text-gray-700 text-lg">
                      {file ? file.name : "Drop files or click to upload"}
                    </span>
                    <span className="text-sm text-gray-500 mt-2">Excel files only (.xlsx, .xls)</span>
                    <input 
                      type="file" 
                      accept=".xlsx,.xls" 
                      onChange={handleFileChange} 
                      className="hidden"
                    />
                  </label>
                </div>
                <button 
                  onClick={processExcelFile} 
                  className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-2xl hover:from-yellow-500 hover:to-amber-600 transition-all transform hover:scale-105 flex items-center font-bold text-lg shadow-xl"
                >
                  <FileText className="w-6 h-6 mr-3" />
                  Process File
                </button>
              </div>
            </div>
            
            <div className="pt-6 border-t-2 border-yellow-100">
              <p className="text-gray-600 mb-4 font-medium">Need a template? Download one below:</p>
              <button 
                onClick={downloadTemplate} 
                className="px-6 py-3 border-2 border-yellow-300 rounded-2xl text-gray-700 hover:bg-yellow-50 transition-all flex items-center font-bold"
              >
                <Download className="w-5 h-5 mr-2 text-amber-500" />
                Download Template
              </button>
            </div>
          </div>
        )}
        
        {/* Manual entry section */}
        {activeTab === 'manual' && (
          <div className="bg-white p-8 rounded-3xl shadow-xl mb-8 border-2 border-yellow-100">
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 mb-6 rounded-2xl border-2 border-yellow-200">
              <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Package className="w-6 h-6 mr-2 text-amber-500" />
                Available Data Packages
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {dataPrices.map((price) => (
                  <div key={price.capacity} className="bg-white p-4 rounded-xl border-2 border-yellow-300 hover:border-amber-400 transition-all hover:scale-105 cursor-pointer">
                    <p className="font-bold text-2xl text-gray-900">{price.capacity}GB</p>
                    <p className="text-amber-600 font-bold text-xl">GH₵{price.price}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-lg font-bold text-gray-800 mb-3">
                Phone Numbers with Data Amounts (one entry per line)
              </label>
              <textarea 
                name="phoneNumbers" 
                value={manualEntry.phoneNumbers} 
                onChange={handleManualEntryChange} 
                rows={8}
                placeholder="e.g. 0246783840 2&#10;0551234567 5&#10;0244555666 10"
                className="w-full p-4 border-2 border-gray-200 bg-gray-50 rounded-2xl focus:outline-none focus:ring-3 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 font-medium text-lg"
              />
              <p className="mt-2 text-sm text-gray-600 font-medium">Format: Phone Number [space] Data Amount (GB)</p>
            </div>
            
            <button 
              onClick={processManualEntry} 
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-2xl hover:from-yellow-500 hover:to-amber-600 transition-all transform hover:scale-105 flex items-center font-bold text-lg shadow-xl"
            >
              <Users className="w-6 h-6 mr-3" />
              Add to Order List
            </button>
          </div>
        )}
        
        {/* Order preview */}
        {orders.length > 0 && (
          <div className="bg-white p-8 rounded-3xl shadow-xl mb-8 border-2 border-yellow-100">
            <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
              <FileText className="w-7 h-7 mr-3 text-amber-500" />
              Orders Preview ({orders.length} orders)
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y-2 divide-yellow-100">
                <thead className="bg-gradient-to-r from-yellow-50 to-amber-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Phone Number</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Network</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Data (GB)</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Price (GH₵)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-yellow-50">
                  {orders.map((order, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-yellow-50/30'}>
                      <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">{order.phoneNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-bold">
                          {order.network}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-gray-900">{order.capacity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-amber-600">{order.price}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gradient-to-r from-yellow-100 to-amber-100">
                    <td colSpan="3" className="px-6 py-5 whitespace-nowrap text-lg font-bold text-gray-900">Total:</td>
                    <td className="px-6 py-5 whitespace-nowrap text-xl font-bold text-amber-600">
                      GH₵{orders.reduce((sum, order) => sum + order.price, 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button 
                onClick={submitBulkOrders} 
                disabled={isProcessing} 
                className={`px-10 py-4 rounded-2xl flex items-center font-bold text-lg shadow-xl transform transition-all ${
                  isProcessing 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 hover:scale-105'
                } text-white`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6 mr-3" />
                    Submit Bulk Order
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        {/* Error display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded-2xl shadow-md">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-base font-medium text-red-700 whitespace-pre-line">{error}</p>
            </div>
          </div>
        )}
        
        {/* Result display */}
        {result && (
          <div className="bg-white p-8 rounded-3xl shadow-xl mb-8 border-2 border-yellow-100">
            <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
              {result.status === 'success' ? (
                <CheckCircle className="w-7 h-7 mr-3 text-green-500" />
              ) : (
                <AlertCircle className="w-7 h-7 mr-3 text-red-500" />
              )}
              {result.status === 'success' ? 'Order Processing Results' : 'Order Processing Failed'}
            </h3>
            
            {result.status === 'success' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border-2 border-gray-200">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{result.data.totalOrders}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-200">
                  <p className="text-sm font-medium text-gray-600">Successful</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{result.data.successfulOrders}</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border-2 border-red-200">
                  <p className="text-sm font-medium text-gray-600">Invalid</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{result.data.invalidOrders.length}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-amber-100 p-6 rounded-2xl border-2 border-yellow-200">
                  <p className="text-sm font-medium text-gray-600">New Balance</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">GH₵{result.data.newWalletBalance.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkDataPurchase;