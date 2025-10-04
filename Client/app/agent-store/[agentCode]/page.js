'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ShoppingCart, Zap, Wifi, Phone, ArrowRight, CheckCircle,
  AlertCircle, X, Loader2, Star, Award, Shield, Home,
  Package, User, Mail, ChevronRight, MessageCircle,
  Facebook, Twitter, Instagram, TrendingUp, Sparkles,
  Heart, Share2, MapPin, Clock, BadgeCheck
} from 'lucide-react';
import { getApiEndpoint } from '@/utils/apiConfig';

const AgentStorePage = () => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [agentInfo, setAgentInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('all');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    loadAgentStore();
    checkLoginStatus();
  }, [params.agentCode]);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  };

  const loadAgentStore = async () => {
    setLoading(true);
    try {
      const API_URL = getApiEndpoint('');
      
      const response = await fetch(`${API_URL}/api/public/agent-store/${params.agentCode}`);
      const data = await response.json();
      
      if (data.success) {
        setAgentInfo(data.agent);
        
        // Use new products array if available, fallback to legacy items
        const storeProducts = data.catalog || [];
        
        // Transform legacy items to new format if needed
        const transformedProducts = storeProducts.map(product => {
          if (product.capacity && typeof product.capacity === 'number') {
            // Legacy format - transform to new format
            return {
              id: product.id || product._id,
              name: product.title || `${product.network} ${product.capacity}GB`,
              description: product.description || `${product.capacity}GB ${product.network} data bundle`,
              network: product.network,
              capacity: `${product.capacity}GB`,
              price: product.price,
              enabled: product.enabled,
              isActive: product.enabled,
              category: 'data'
            };
          } else {
            // New format - use as is
            return {
              id: product._id || product.id,
              name: product.name,
              description: product.description,
              network: product.network,
              capacity: product.capacity,
              price: product.agentPrice || product.basePrice || product.price,
              enabled: product.isActive !== false,
              isActive: product.isActive !== false,
              category: product.category || 'data',
              stock: product.stock || 0,
              tags: product.tags || []
            };
          }
        });
        
        setProducts(transformedProducts);
        
        if (data.agent.storeCustomization?.brandColor) {
          document.documentElement.style.setProperty('--agent-brand-color', data.agent.storeCustomization.brandColor);
        }
      } else {
        showNotification('Agent store not found', 'error');
      }
    } catch (error) {
      console.error('Failed to load agent store:', error);
      showNotification('Failed to load store', 'error');
    } finally {
      setLoading(false);
    }
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

  const handleCheckout = () => {
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
    
    setShowCheckout(true);
  };

  const filteredProducts = selectedNetwork === 'all' 
    ? products 
    : products.filter(p => p.network.toLowerCase() === selectedNetwork.toLowerCase());

  const networks = ['all', ...new Set(products.map(p => p.network))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#FFCC08] mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading store...</p>
        </div>
      </div>
    );
  }

  if (!agentInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Store Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">This agent store doesn't exist or has been disabled.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-[#FFCC08] text-black rounded-xl font-semibold hover:bg-yellow-500 transition-all"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const brandColor = agentInfo.storeCustomization?.brandColor || '#FFCC08';
  const storeName = agentInfo.storeCustomization?.storeName || `${agentInfo.name}'s Store`;
  const welcomeMessage = agentInfo.storeCustomization?.welcomeMessage || 'Welcome to our store!';
  const storeDescription = agentInfo.storeCustomization?.storeDescription || 'Your trusted data provider';

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

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black py-16 sm:py-20">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFCC08] via-yellow-400 to-[#FFCC08] animate-pulse"></div>
        </div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            {/* Logo/Badge */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FFCC08] to-yellow-500 shadow-2xl shadow-yellow-500/50 mb-6 transform rotate-3 hover:rotate-6 transition-transform">
              <Wifi className="w-10 h-10 text-black" strokeWidth={2.5} />
            </div>
            
            <div className="flex items-center justify-center space-x-2 mb-3">
              <h1 className="text-4xl sm:text-5xl font-black text-white">
                {storeName}
              </h1>
              <BadgeCheck className="w-8 h-8 text-[#FFCC08]" />
            </div>
            
            {/* Star Rating */}
            <div className="flex items-center justify-center space-x-1 mb-4">
              <Star className="w-5 h-5 text-[#FFCC08] fill-current" />
              <Star className="w-5 h-5 text-[#FFCC08] fill-current" />
              <Star className="w-5 h-5 text-[#FFCC08] fill-current" />
              <Star className="w-5 h-5 text-[#FFCC08] fill-current" />
              <Star className="w-5 h-5 text-[#FFCC08] fill-current" />
              <span className="text-white font-semibold ml-2">5.0 (127 reviews)</span>
            </div>
            
            <p className="text-xl text-gray-300 font-medium mb-4">{welcomeMessage}</p>
            <p className="text-gray-400 max-w-2xl mx-auto">{storeDescription}</p>

            {/* Agent Info Badge */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <MapPin className="w-4 h-4 text-[#FFCC08]" />
                <span className="text-white text-sm font-medium">{agentInfo.territory}</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <Award className="w-4 h-4 text-[#FFCC08]" />
                <span className="text-white text-sm font-medium capitalize">{agentInfo.agentLevel} Agent</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <Star className="w-4 h-4 text-[#FFCC08]" />
                <span className="text-white text-sm font-medium">Verified Seller</span>
              </div>
            </div>
          </div>

          {/* Contact Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            {agentInfo.storeCustomization?.socialLinks?.whatsapp && (
              <a
                href={`https://wa.me/${agentInfo.storeCustomization.socialLinks.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chat on WhatsApp</span>
              </a>
            )}
            <a
              href={`tel:${agentInfo.phoneNumber}`}
              className="flex items-center space-x-2 px-8 py-4 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm border border-white/30"
            >
              <Phone className="w-5 h-5" />
              <span>Call Now</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Network Filter */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Data Bundles</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Choose from our wide selection of affordable data bundles</p>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setShowCheckout(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-[#FFCC08] text-black rounded-xl font-semibold hover:bg-yellow-500 transition-all relative shadow-lg hover:shadow-xl"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Cart ({cart.length})</span>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {cart.length}
                </span>
              </button>
            )}
          </div>

          {/* Network Tabs */}
          <div className="flex flex-wrap gap-3">
            {networks.map((network) => (
              <button
                key={network}
                onClick={() => setSelectedNetwork(network)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  selectedNetwork === network
                    ? 'bg-[#FFCC08] text-black shadow-lg'
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
            <p className="text-xl text-gray-600 dark:text-gray-400">No bundles available</p>
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
                    product.network === 'AT' ? 'bg-blue-500' :
                    'bg-purple-500'
                  }`}>
                    {product.network}
                  </span>
                </div>

                {/* Card Header */}
                <div className="p-6 bg-gradient-to-br from-[#FFCC08]/10 to-yellow-500/5">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFCC08] to-yellow-500 shadow-lg mx-auto mb-4">
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
                  <div className="flex items-baseline justify-center mb-6">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">₵</span>
                    <span className="text-4xl font-black text-gray-900 dark:text-white">{product.price.toFixed(2)}</span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => addToCart(product)}
                    disabled={!product.enabled}
                    className={`w-full py-3 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2 ${
                      product.enabled
                        ? 'bg-[#FFCC08] hover:bg-yellow-500 text-black shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>{product.enabled ? 'Add to Cart' : 'Unavailable'}</span>
                  </button>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#FFCC08]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
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
            <div className="sticky top-0 bg-gradient-to-r from-[#FFCC08]/10 to-yellow-500/5 border-b border-gray-200 dark:border-gray-700 p-6 z-10 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFCC08] flex items-center justify-center">
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
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#FFCC08] to-yellow-500 rounded-lg flex items-center justify-center">
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
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500"
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
                  className="flex-1 py-3 px-6 bg-[#FFCC08] hover:bg-yellow-500 text-black rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Links Footer */}
      {agentInfo.storeCustomization?.socialLinks && (
        <div className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4 font-medium">Connect with us</p>
              <div className="flex items-center justify-center space-x-4">
                {agentInfo.storeCustomization.socialLinks.facebook && (
                  <a
                    href={agentInfo.storeCustomization.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-110"
                  >
                    <Facebook className="w-6 h-6" />
                  </a>
                )}
                {agentInfo.storeCustomization.socialLinks.twitter && (
                  <a
                    href={agentInfo.storeCustomization.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-110"
                  >
                    <Twitter className="w-6 h-6" />
                  </a>
                )}
                {agentInfo.storeCustomization.socialLinks.instagram && (
                  <a
                    href={agentInfo.storeCustomization.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-110"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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

export default AgentStorePage;
