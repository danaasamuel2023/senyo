'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShoppingCart, Zap, Wifi, Phone, ArrowRight, CheckCircle,
  AlertCircle, X, Loader2, Star, Award, Shield, Home,
  Package, User, Mail, ChevronRight, MessageCircle,
  Facebook, Twitter, Instagram, TrendingUp, Sparkles,
  Heart, Share2, MapPin, Clock, BadgeCheck, Globe,
  Smartphone, CreditCard, Lock, Truck, Headphones
} from 'lucide-react';
import { getApiEndpoint } from '@/utils/apiConfig';

const StorePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [agentCode, setAgentCode] = useState(null);
  const [agentData, setAgentData] = useState(null);

  // Store configuration - will be fetched from backend
  const [storeConfig, setStoreConfig] = useState({
    name: 'DATAMART',
    tagline: 'Your one-stop shop for affordable data bundles',
    description: 'Powered by SamTech',
    brandColor: '#EAB308',
    contact: {
      phone: '+233 24 123 4567',
      email: 'datamartghana@gmail.com',
      address: 'SamTech Building, Digital Street, Accra',
      hours: 'Mon-Sun: 8AM - 9PM'
    },
    socialLinks: {
      whatsapp: '+233241234567',
      facebook: 'https://facebook.com/datamartgh',
      twitter: 'https://twitter.com/datamartgh',
      instagram: 'https://instagram.com/datamartgh'
    }
  });

  // No dummy data - all data will come from backend

  useEffect(() => {
    // Get agent code from URL parameters
    const agentCodeParam = searchParams.get('agent');
    if (agentCodeParam) {
      setAgentCode(agentCodeParam);
      loadAgentStoreData(agentCodeParam);
    } else {
      // Default store if no agent specified
      loadStoreData();
    }
    checkLoginStatus();
  }, [searchParams]);

  const loadAgentStoreData = async (agentCode) => {
    setLoading(true);
    try {
      const API_URL = getApiEndpoint('');
      
      // Load agent data and store configuration
      const [agentResponse, productsResponse] = await Promise.all([
        fetch(`${API_URL}/api/agent/store/${agentCode}`),
        fetch(`${API_URL}/api/agent/store/${agentCode}/products`)
      ]);

      if (agentResponse.ok && productsResponse.ok) {
        const agentData = await agentResponse.json();
        const productsData = await productsResponse.json();
        
        setAgentData(agentData);
        setProducts(productsData.products || []);
        
        // Update store config with agent's customization
        setStoreConfig({
          name: agentData.storeCustomization?.storeName || `${agentData.name}'s Store`,
          tagline: agentData.storeCustomization?.welcomeMessage || 'Welcome to my data store!',
          description: agentData.storeCustomization?.storeDescription || 'Your trusted data partner',
          brandColor: agentData.storeCustomization?.brandColor || '#EAB308',
          contact: {
            phone: agentData.phoneNumber || '+233 24 123 4567',
            email: agentData.email || 'agent@unlimitedata.com',
            address: agentData.agentMetadata?.territory || 'Ghana',
            hours: `${agentData.storeCustomization?.businessHours?.monday?.open || '8AM'} - ${agentData.storeCustomization?.businessHours?.monday?.close || '9PM'}`
          },
          socialLinks: {
            whatsapp: agentData.storeCustomization?.socialLinks?.whatsapp || agentData.phoneNumber || '',
            facebook: agentData.storeCustomization?.socialLinks?.facebook || '',
            twitter: agentData.storeCustomization?.socialLinks?.twitter || '',
            instagram: agentData.storeCustomization?.socialLinks?.instagram || ''
          }
        });
      } else {
        throw new Error('Failed to load agent store data');
      }
    } catch (error) {
      console.error('Error loading agent store data:', error);
      setNotification({
        message: 'Failed to load store data. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStoreData = async () => {
    setLoading(true);
    try {
      const API_URL = getApiEndpoint('');
      
      // Load store configuration from API
      const configResponse = await fetch(`${API_URL}/api/store/config`);
      const configData = await configResponse.json();
      
      if (configData.success) {
        setStoreConfig(configData.config);
      }
      
      // Load products from API
      const productsResponse = await fetch(`${API_URL}/api/store/products`);
      const productsData = await productsResponse.json();
      
      if (productsData.success) {
        setProducts(productsData.products);
      } else {
        console.error('Failed to load products:', productsData.message);
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to load store data:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const checkLoginStatus = () => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      showNotification('Product already in cart', 'info');
      return;
    }
    setCart([...cart, { ...product, quantity: 1, phoneNumber: '' }]);
    showNotification('✓ Added to cart', 'success');
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
    showNotification('Removed from cart', 'info');
  };

  const updatePhoneNumber = (productId, phone) => {
    setCart(cart.map(item => 
      item.id === productId ? { ...item, phoneNumber: phone } : item
    ));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      showNotification('Please login to purchase', 'error');
      router.push('/SignIn');
      return;
    }
    
    if (cart.length === 0) {
      showNotification('Your cart is empty', 'error');
      return;
    }

    const missingPhone = cart.some(item => !item.phoneNumber);
    if (missingPhone) {
      showNotification('Please enter phone number for all items', 'error');
      return;
    }
    
    try {
      const API_URL = getApiEndpoint('');
      const token = localStorage.getItem('authToken');
      
      // Create order via API - different endpoint for agent stores
      const orderEndpoint = agentCode 
        ? `${API_URL}/api/agent/store/${agentCode}/order`
        : `${API_URL}/api/store/order`;
        
      const orderResponse = await fetch(orderEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          totalAmount: getTotalAmount(),
          customerInfo: {
            name: localStorage.getItem('userName') || '',
            email: localStorage.getItem('userEmail') || '',
            phone: localStorage.getItem('userPhone') || ''
          },
          agentCode: agentCode // Include agent code for agent orders
        })
      });
      
      const orderData = await orderResponse.json();
      
      if (orderData.success) {
        showNotification('Order created successfully!', 'success');
        // Redirect to payment page with order ID
        router.push(`/payment?orderId=${orderData.order.id}&source=store`);
      } else {
        showNotification(orderData.message || 'Failed to create order', 'error');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showNotification('Failed to process order', 'error');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesNetwork = selectedNetwork === 'all' || product.network.toLowerCase() === selectedNetwork.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.network.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.capacity.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesNetwork && matchesSearch && product.isActive;
  });

  const networks = ['all', ...new Set(products.map(p => p.network))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border ${
            notification.type === 'success' ? 'bg-green-500/90 border-green-400' :
            notification.type === 'error' ? 'bg-red-500/90 border-red-400' :
            'bg-blue-500/90 border-blue-400'
          } text-white flex items-center space-x-3`}>
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {notification.type === 'info' && <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Agent Store Header */}
      {agentCode && agentData && (
        <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border-b border-yellow-200 dark:border-yellow-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: storeConfig.brandColor }}
                >
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {storeConfig.name}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    by {agentData.name} • Agent Code: {agentCode}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{agentData.agentMetadata?.territory || 'Ghana'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{storeConfig.contact.hours}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black py-16 sm:py-20">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 animate-pulse"></div>
        </div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            {/* Logo/Badge */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-2xl shadow-yellow-500/50 mb-6 transform rotate-3 hover:rotate-6 transition-transform">
              <Wifi className="w-10 h-10 text-black" strokeWidth={2.5} />
            </div>
            
            <div className="flex items-center justify-center space-x-2 mb-3">
              <h1 className="text-4xl sm:text-5xl font-black text-white">
                {storeConfig.name}
              </h1>
              <BadgeCheck className="w-8 h-8 text-yellow-500" />
            </div>
            
            {/* Star Rating */}
            <div className="flex items-center justify-center space-x-1 mb-4">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="text-white font-semibold ml-2">5.0 (127 reviews)</span>
            </div>
            
            <p className="text-xl text-gray-300 font-medium mb-4">{storeConfig.tagline}</p>
            <p className="text-gray-400 max-w-2xl mx-auto">{storeConfig.description}</p>

            {/* Store Info Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <MapPin className="w-4 h-4 text-yellow-500" />
                <span className="text-white text-sm font-medium">{storeConfig.contact.address}</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-white text-sm font-medium">{storeConfig.contact.hours}</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-white text-sm font-medium">Verified Store</span>
              </div>
            </div>
          </div>

          {/* Contact Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <a
              href={`https://wa.me/${storeConfig.socialLinks.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat on WhatsApp</span>
            </a>
            <a
              href={`tel:${storeConfig.contact.phone}`}
              className="flex items-center space-x-2 px-8 py-4 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm border border-white/30"
            >
              <Phone className="w-5 h-5" />
              <span>Call Now</span>
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Instant Delivery</h3>
              <p className="text-gray-600 dark:text-gray-400">Get your data bundles instantly after payment</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Secure Payment</h3>
              <p className="text-gray-600 dark:text-gray-400">Safe and secure payment processing</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">24/7 Support</h3>
              <p className="text-gray-600 dark:text-gray-400">Round-the-clock customer support</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Best Prices</h3>
              <p className="text-gray-600 dark:text-gray-400">Competitive prices for all networks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Data Bundles</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Choose from our wide selection of affordable data bundles</p>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setShowCheckout(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 text-black rounded-xl font-semibold hover:bg-yellow-700 transition-all relative shadow-lg hover:shadow-xl mt-4 lg:mt-0"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Cart ({cart.length})</span>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {cart.length}
                </span>
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search bundles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Package className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Network Tabs */}
          <div className="flex flex-wrap gap-3">
            {networks.map((network) => (
              <button
                key={network}
                onClick={() => setSelectedNetwork(network)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  selectedNetwork === network
                    ? 'bg-yellow-600 text-black shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {network === 'all' ? 'All Networks' : network}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-400">No bundles found</p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:scale-105"
              >
                {/* Network Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                    product.network === 'MTN' ? 'bg-yellow-500' :
                    product.network === 'TELECEL' ? 'bg-blue-500' :
                    'bg-purple-500'
                  }`}>
                    {product.network}
                  </span>
                </div>

                {/* Card Header */}
                <div className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg mx-auto mb-4">
                    <Zap className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white text-center mb-1">
                    {product.capacity}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    {product.description}
                  </p>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">₵</span>
                    <span className="text-4xl font-black text-gray-900 dark:text-white">{product.price.toFixed(2)}</span>
                  </div>
                  
                  <div className="text-center mb-6">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Valid for {product.validity}</span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full py-3 rounded-xl font-semibold transition-all transform hover:scale-105 bg-yellow-600 hover:bg-yellow-700 text-black shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shopping Cart Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border-b border-gray-200 dark:border-gray-700 p-6 z-10 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-600 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Shopping Cart</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{cart.length} items</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="p-6 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-black" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          {item.network} {item.capacity}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">₵{item.price.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Phone Number Input */}
                    <div className="mb-2">
                      <input
                        type="tel"
                        placeholder="Enter phone number"
                        value={item.phoneNumber}
                        onChange={(e) => updatePhoneNumber(item.id, e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500"
                      />
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-sm text-red-500 hover:text-red-600 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Footer */}
            <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 rounded-b-3xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Amount</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Including all fees</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-gray-900 dark:text-white">
                    ₵{getTotalAmount().toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 py-3 px-6 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || cart.some(item => !item.phoneNumber)}
                  className="flex-1 py-3 px-6 bg-yellow-600 hover:bg-yellow-700 text-black rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Section */}
      <div className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Get in Touch</h3>
            <p className="text-gray-600 dark:text-gray-400">We're here to help you with all your data needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-black" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Phone</h4>
              <p className="text-gray-600 dark:text-gray-400">{storeConfig.contact.phone}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-black" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email</h4>
              <p className="text-gray-600 dark:text-gray-400">{storeConfig.contact.email}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-black" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Address</h4>
              <p className="text-gray-600 dark:text-gray-400">{storeConfig.contact.address}</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4 font-medium">Connect with us</p>
            <div className="flex items-center justify-center space-x-4">
              <a
                href={storeConfig.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-110"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href={storeConfig.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-110"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a
                href={storeConfig.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-110"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href={`https://wa.me/${storeConfig.socialLinks.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-110"
              >
                <MessageCircle className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Wrapper component with Suspense boundary
const StorePageWithSuspense = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-yellow-400 font-medium">Loading store...</p>
        </div>
      </div>
    }>
      <StorePage />
    </Suspense>
  );
};

export default StorePageWithSuspense;
