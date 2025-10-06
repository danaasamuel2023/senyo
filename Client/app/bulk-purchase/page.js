'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Plus, Trash2, Send, Download, AlertCircle, Check, X, 
  Users, FileText, Loader2, Copy, ClipboardPaste, Flame, 
  Zap, ChevronRight, Phone, Mail, MessageCircle, WifiOff,
  DollarSign, Package, TrendingUp, Database, Wifi, Signal,
  Shield, Activity, ArrowUpRight, Timer, AlertTriangle,
  CheckCircle, XCircle, RefreshCw, Info, Star
} from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:5001';
const API_ENDPOINTS = {
  NETWORKS: '/api/orders/networks',
  BULK_PURCHASE: '/api/orders/place-bulk'
};

// Constants
const MAX_RECIPIENTS = 50;
const DEFAULT_CAPACITY = 5;
const PHONE_REGEX = /^(?:\+233|233|0)?(20|23|24|25|26|27|28|29|30|31|32|50|53|54|55|56|57|58|59)\d{7}$/;

// MTN Logo Component
const MTNLogo = ({ className = "w-12 h-12", showText = true }) => (
  <div className={`${className} relative`}>
    <div className="w-full h-full bg-[#FFCC08] rounded-full flex items-center justify-center shadow-xl">
      {showText && (
        <span className="font-black text-black text-xl">MTN</span>
      )}
    </div>
  </div>
);

// Animated Background Elements
const FloatingElement = ({ delay, duration, children }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ 
      y: [-20, 20, -20],
      rotate: [0, 10, -10, 0]
    }}
    transition={{
      duration: duration || 6,
      delay: delay || 0,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute pointer-events-none"
  >
    {children}
  </motion.div>
);

export default function BulkPurchase() {
  // State Management
  const [orders, setOrders] = useState([{ recipient: '', capacity: DEFAULT_CAPACITY }]);
  const [networks, setNetworks] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [defaultCapacity, setDefaultCapacity] = useState(DEFAULT_CAPACITY);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [bulkMethod, setBulkMethod] = useState('paste');
  const [csvContent, setCsvContent] = useState('');
  const [bulkTextInput, setBulkTextInput] = useState('');
  const [parseError, setParseError] = useState('');

  // Initialize networks on mount
  useEffect(() => {
    fetchNetworks();
  }, []);

  // Fetch networks from API
  const fetchNetworks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('Token');
      
      if (!token) {
        console.error('No auth token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.NETWORKS}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setNetworks(data.data || []);
        if (data.data?.length > 0) {
          setSelectedNetwork(data.data[0].networkKey);
        }
      }
    } catch (error) {
      console.error('Failed to fetch networks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Phone number validation
  const validatePhoneNumber = useCallback((phone) => {
    return PHONE_REGEX.test(phone);
  }, []);

  // Phone number formatting
  const formatPhoneNumber = useCallback((phone) => {
    phone = phone.replace(/[\s-]/g, '');
    
    if (phone.startsWith('+233')) {
      phone = '0' + phone.slice(4);
    } else if (phone.startsWith('233')) {
      phone = '0' + phone.slice(3);
    } else if (!phone.startsWith('0')) {
      phone = '0' + phone;
    }
    
    return phone;
  }, []);

  // Handle order management
  const handleAddOrder = useCallback(() => {
    if (orders.length >= MAX_RECIPIENTS) {
      alert(`Maximum ${MAX_RECIPIENTS} recipients allowed`);
      return;
    }
    setOrders([...orders, { recipient: '', capacity: defaultCapacity }]);
  }, [orders, defaultCapacity]);

  const handleRemoveOrder = useCallback((index) => {
    const newOrders = orders.filter((_, i) => i !== index);
    setOrders(newOrders.length > 0 ? newOrders : [{ recipient: '', capacity: defaultCapacity }]);
  }, [orders, defaultCapacity]);

  const handleOrderChange = useCallback((index, field, value) => {
    const newOrders = [...orders];
    
    if (field === 'recipient') {
      value = formatPhoneNumber(value);
      
      if (!validatePhoneNumber(value) && value.length > 0) {
        setValidationErrors(prev => ({
          ...prev,
          [`order-${index}`]: 'Invalid phone number format'
        }));
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`order-${index}`];
          return newErrors;
        });
      }
    }
    
    if (field === 'capacity') {
      value = parseFloat(value) || defaultCapacity;
    }
    
    newOrders[index][field] = value;
    setOrders(newOrders);
  }, [orders, defaultCapacity, formatPhoneNumber, validatePhoneNumber]);

  // Parse bulk text input
  const parseBulkText = useCallback((text) => {
    setParseError('');
    const lines = text.split('\n').filter(line => line.trim());
    const parsedOrders = [];
    const errors = [];
    
    for (let i = 0; i < lines.length; i++) {
      if (parsedOrders.length >= MAX_RECIPIENTS) break;
      
      const line = lines[i].trim();
      if (!line) continue;
      
      let recipient = '';
      let capacity = defaultCapacity;
      
      // Parse line (supports comma or space separator)
      if (line.includes(',')) {
        const parts = line.split(',').map(p => p.trim());
        recipient = parts[0];
        if (parts[1] && !isNaN(parseFloat(parts[1]))) {
          capacity = parseFloat(parts[1]);
        }
      } else {
        const parts = line.split(/\s+/);
        recipient = parts[0];
        if (parts[1] && !isNaN(parseFloat(parts[1]))) {
          capacity = parseFloat(parts[1]);
        }
      }
      
      recipient = formatPhoneNumber(recipient);
      
      if (validatePhoneNumber(recipient)) {
        parsedOrders.push({ recipient, capacity });
      } else {
        errors.push(`Line ${i + 1}: Invalid phone number "${line}"`);
      }
    }
    
    if (parsedOrders.length > 0) {
      setOrders(parsedOrders);
      if (errors.length > 0) {
        setParseError(`Parsed ${parsedOrders.length} valid numbers. ${errors.length} errors found.`);
      } else {
        setParseError('');
      }
    } else {
      setParseError('No valid phone numbers found. Please check the format.');
      setOrders([{ recipient: '', capacity: defaultCapacity }]);
    }
  }, [defaultCapacity, formatPhoneNumber, validatePhoneNumber]);

  const handleBulkTextChange = useCallback((text) => {
    setBulkTextInput(text);
    if (text.trim()) {
      parseBulkText(text);
    } else {
      setOrders([{ recipient: '', capacity: defaultCapacity }]);
      setParseError('');
    }
  }, [parseBulkText, defaultCapacity]);

  // CSV handling
  const handleCSVUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        setCsvContent(text);
        parseCSV(text);
      };
      reader.readAsText(file);
    }
  }, []);

  const parseCSV = useCallback((text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const parsedOrders = [];
    
    for (let i = 0; i < lines.length && parsedOrders.length < MAX_RECIPIENTS; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Skip header if present
      if (i === 0 && line.toLowerCase().includes('recipient')) continue;
      
      const parts = line.split(',').map(p => p.trim());
      const recipient = formatPhoneNumber(parts[0]);
      const capacity = parts[1] ? parseFloat(parts[1]) : defaultCapacity;
      
      if (validatePhoneNumber(recipient)) {
        parsedOrders.push({ recipient, capacity });
      }
    }
    
    if (parsedOrders.length > 0) {
      setOrders(parsedOrders);
      setBulkMethod('csv');
    } else {
      alert('No valid phone numbers found in CSV');
    }
  }, [defaultCapacity, formatPhoneNumber, validatePhoneNumber]);

  // Calculate total cost
  const calculateTotalCost = useMemo(() => {
    const network = networks.find(n => n.networkKey === selectedNetwork);
    if (!network) return 0;
    
    return orders.reduce((total, order) => {
      const bundle = network.bundles?.find(b => b.capacity === order.capacity);
      return total + (bundle ? bundle.price : 0);
    }, 0);
  }, [networks, selectedNetwork, orders]);

  // Handle bulk purchase
  const handleBulkPurchase = async () => {
    const validOrders = orders.filter(o => validatePhoneNumber(o.recipient));
    
    if (validOrders.length === 0) {
      alert('No valid phone numbers to process');
      return;
    }

    if (!selectedNetwork) {
      alert('Please select a network');
      return;
    }

    setProcessing(true);
    setShowResults(false);

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('Token');
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BULK_PURCHASE}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orders: validOrders.map(o => ({
            recipient: formatPhoneNumber(o.recipient),
            capacity: o.capacity
          })),
          networkKey: selectedNetwork
        })
      });

      const data = await response.json();
      setResults(data);
      setShowResults(true);

      if (data.success && data.data?.summary?.failed === 0) {
        setOrders([{ recipient: '', capacity: defaultCapacity }]);
        setBulkTextInput('');
      }
    } catch (error) {
      console.error('Bulk purchase error:', error);
      alert('Failed to process bulk orders. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Download functions
  const downloadTemplate = () => {
    const csvContent = 'recipient,capacity\n0241234567,5\n0551234567,10\n0201234567,3';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mtn_bulk_order_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadResults = () => {
    if (!results) return;
    
    const csvContent = [
      'Recipient,Status,Reference,Price',
      ...(results.data?.successfulOrders || []).map(o => 
        `${o.recipient},Success,${o.reference},${o.price}`
      ),
      ...(results.data?.failedOrders || []).map(o => 
        `${o.recipient},Failed,"${o.error}",0`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mtn_bulk_results_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get network bundles
  const getNetworkBundles = useMemo(() => {
    const network = networks.find(n => n.networkKey === selectedNetwork);
    return network ? (network.bundles || []).filter(b => b.isActive) : [];
  }, [networks, selectedNetwork]);

  // Valid orders count
  const validOrdersCount = useMemo(() => 
    orders.filter(o => validatePhoneNumber(o.recipient)).length,
    [orders, validatePhoneNumber]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[#FFCC08]/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FFCC08] animate-spin"></div>
          </div>
          <h1 className="text-2xl font-black text-[#FFCC08]">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingElement delay={0} duration={8}>
          <div className="absolute top-20 left-20 w-32 h-32 bg-[#FFCC08]/10 rounded-full blur-3xl" />
        </FloatingElement>
        <FloatingElement delay={2} duration={10}>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-[#FFCC08]/10 rounded-full blur-3xl" />
        </FloatingElement>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-2xl shadow-2xl p-6 mb-6 border border-[#FFCC08]/30"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <MTNLogo className="w-14 h-14" />
              <div>
                <h1 className="text-3xl font-black text-white flex items-center gap-2">
                  MTN Bulk Purchase
                </h1>
                <p className="text-gray-400 mt-1">
                  Process up to {MAX_RECIPIENTS} recipients at once
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadTemplate}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl flex items-center gap-2 transition-all shadow-lg border border-gray-700"
            >
              <Download className="w-5 h-5" />
              Template
            </motion.button>
          </div>

          {/* Method Selection */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { id: 'paste', icon: ClipboardPaste, label: 'Paste List' },
              { id: 'manual', icon: Plus, label: 'Manual Entry' },
              { id: 'csv', icon: Upload, label: 'CSV Upload' }
            ].map((method) => (
              <motion.button
                key={method.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setBulkMethod(method.id)}
                className={`py-3 px-4 rounded-xl font-medium transition-all shadow-lg ${
                  bulkMethod === method.id
                    ? 'bg-[#FFCC08] text-black'
                    : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <method.icon className="w-5 h-5" />
                  {method.label}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Network and Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Network Provider
              </label>
              <select
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white focus:border-[#FFCC08] transition-colors"
              >
                <option value="">Select Network</option>
                {networks.map(network => (
                  <option key={network.networkKey} value={network.networkKey}>
                    {network.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Default Bundle (GB)
              </label>
              <select
                value={defaultCapacity}
                onChange={(e) => setDefaultCapacity(parseFloat(e.target.value))}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white focus:border-[#FFCC08] transition-colors"
              >
                {getNetworkBundles.map(bundle => (
                  <option key={bundle.capacity} value={bundle.capacity}>
                    {bundle.capacity}GB - GHS {bundle.price}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Valid Recipients
              </label>
              <div className="px-4 py-3 bg-[#FFCC08]/10 rounded-xl border border-[#FFCC08]/50">
                <span className="text-3xl font-black text-[#FFCC08]">
                  {validOrdersCount}
                </span>
                <span className="text-gray-500 text-sm ml-2">/ {MAX_RECIPIENTS}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Order Entry Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-2xl shadow-2xl p-6 mb-6 border border-[#FFCC08]/30"
        >
          {bulkMethod === 'paste' ? (
            <>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <ClipboardPaste className="w-6 h-6 mr-2 text-[#FFCC08]" />
                Paste Recipients List
              </h2>
              
              <div className="mb-4 p-4 bg-[#FFCC08]/10 border border-[#FFCC08]/50 rounded-xl">
                <p className="text-sm font-bold text-[#FFCC08] mb-2">Format Examples:</p>
                <div className="text-xs text-gray-400 space-y-1 font-mono">
                  <div>0241234567, 5</div>
                  <div>0551234567 10</div>
                  <div>0201234567</div>
                </div>
              </div>

              <textarea
                value={bulkTextInput}
                onChange={(e) => handleBulkTextChange(e.target.value)}
                placeholder="Paste phone numbers here...&#10;One per line"
                className="w-full h-64 px-4 py-3 bg-black border border-gray-700 rounded-xl text-white font-mono text-sm resize-y focus:border-[#FFCC08] transition-colors"
              />

              {parseError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`mt-2 text-sm flex items-center ${
                    parseError.includes('valid') ? 'text-yellow-500' : 'text-red-500'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {parseError}
                </motion.div>
              )}
            </>
          ) : bulkMethod === 'manual' ? (
            <>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Plus className="w-6 h-6 mr-2 text-[#FFCC08]" />
                Add Recipients Manually
              </h2>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {orders.map((order, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 items-start"
                  >
                    <span className="text-sm font-bold text-gray-500 mt-3">
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Phone number (e.g., 0241234567)"
                        value={order.recipient}
                        onChange={(e) => handleOrderChange(index, 'recipient', e.target.value)}
                        className={`w-full px-4 py-3 bg-black border rounded-xl text-white transition-all ${
                          validationErrors[`order-${index}`]
                            ? 'border-red-500'
                            : 'border-gray-700 focus:border-[#FFCC08]'
                        }`}
                      />
                      {validationErrors[`order-${index}`] && (
                        <p className="text-xs text-red-500 mt-1">
                          {validationErrors[`order-${index}`]}
                        </p>
                      )}
                    </div>
                    <select
                      value={order.capacity}
                      onChange={(e) => handleOrderChange(index, 'capacity', e.target.value)}
                      className="px-4 py-3 bg-black border border-gray-700 rounded-xl text-white focus:border-[#FFCC08]"
                    >
                      {getNetworkBundles.map(bundle => (
                        <option key={bundle.capacity} value={bundle.capacity}>
                          {bundle.capacity}GB
                        </option>
                      ))}
                    </select>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemoveOrder(index)}
                      className="p-3 text-red-500 hover:bg-red-950/20 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddOrder}
                disabled={orders.length >= MAX_RECIPIENTS}
                className="mt-4 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl flex items-center gap-2 transition-all shadow-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                Add Recipient
              </motion.button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Upload className="w-6 h-6 mr-2 text-[#FFCC08]" />
                Upload CSV File
              </h2>

              <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center bg-black/50">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 mb-4">
                  Drop your CSV file here or click to browse
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="px-6 py-3 bg-[#FFCC08] hover:bg-yellow-500 text-black rounded-xl cursor-pointer inline-block transition-all shadow-lg font-bold"
                >
                  Choose File
                </label>
              </div>
            </>
          )}
        </motion.div>

        {/* Cost Summary & Submit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-2xl shadow-2xl p-6 mb-6 border border-[#FFCC08]/30"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <DollarSign className="w-6 h-6 mr-2 text-[#FFCC08]" />
            Order Summary
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-black rounded-xl border border-gray-700">
              <p className="text-sm font-medium text-gray-400">Valid Recipients</p>
              <p className="text-2xl font-black text-white">
                {validOrdersCount}
              </p>
            </div>
            
            <div className="p-4 bg-black rounded-xl border border-gray-700">
              <p className="text-sm font-medium text-gray-400">Total Cost</p>
              <p className="text-2xl font-black text-[#FFCC08]">
                GHS {calculateTotalCost.toFixed(2)}
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBulkPurchase}
            disabled={processing || validOrdersCount === 0 || !selectedNetwork}
            className="w-full py-4 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-xl font-bold text-lg"
          >
            {processing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Processing {validOrdersCount} orders...
              </>
            ) : (
              <>
                <Send className="w-6 h-6" />
                Process Bulk Order
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Results Modal */}
        <AnimatePresence>
          {showResults && results && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowResults(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto p-6 shadow-2xl border border-[#FFCC08]/30"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-black text-white flex items-center gap-2">
                    <MTNLogo className="w-10 h-10" showText={false} />
                    Bulk Order Results
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowResults(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-950/30 p-4 rounded-xl border border-green-900/50">
                    <p className="text-green-400 text-sm font-medium">Successful</p>
                    <p className="text-3xl font-black text-green-500">
                      {results.data?.summary?.successful || 0}
                    </p>
                  </div>
                  <div className="bg-red-950/30 p-4 rounded-xl border border-red-900/50">
                    <p className="text-red-400 text-sm font-medium">Failed</p>
                    <p className="text-3xl font-black text-red-500">
                      {results.data?.summary?.failed || 0}
                    </p>
                  </div>
                  <div className="bg-[#FFCC08]/10 p-4 rounded-xl border border-[#FFCC08]/50">
                    <p className="text-gray-400 text-sm font-medium">Total Cost</p>
                    <p className="text-2xl font-black text-[#FFCC08]">
                      GHS {(results.data?.summary?.totalCost || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Details */}
                {results.data?.successfulOrders?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold text-white mb-2">Successful Orders</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto bg-black rounded-xl p-4">
                      {results.data.successfulOrders.map((order, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-300">{order.recipient}</span>
                          <span className="text-gray-600">-</span>
                          <span className="text-gray-500 font-mono text-xs">{order.reference}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.data?.failedOrders?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold text-white mb-2">Failed Orders</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto bg-black rounded-xl p-4">
                      {results.data.failedOrders.map((order, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-gray-300">{order.recipient}</span>
                          <span className="text-red-400 text-xs">- {order.error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadResults}
                  className="w-full py-3 bg-[#FFCC08] hover:bg-yellow-500 text-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg font-bold"
                >
                  <Download className="w-5 h-5" />
                  Download Results
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Export for Next.js
export { BulkPurchase };