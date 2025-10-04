'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ShoppingCart, Zap, Wifi, Phone, ArrowRight, CheckCircle,
  AlertCircle, X, Loader2, Star, Award, Shield, Home,
  Package, User, Mail, Lock, Eye, EyeOff, MessageCircle,
  Facebook, Twitter, Instagram
} from 'lucide-react';

const AgentStorePage = () => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [agentInfo, setAgentInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
      const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000'
        : 'https://unlimitedata.onrender.com';
      
      // Fetch agent info and catalog
      const response = await fetch(`${API_URL}/api/public/agent-store/${params.agentCode}`);
      const data = await response.json();
      
      if (data.success) {
        setAgentInfo(data.agent);
        setProducts(data.catalog || []);
        // Apply custom brand color if set
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
    setCart([...cart, { ...product, quantity: 1 }]);
    showNotification('Added to cart', 'success');
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
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
    
    setShowCheckout(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg flex items-center space-x-3 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Cart */}
      {cart.length > 0 && (
        <button
          onClick={handleCheckout}
          className="fixed bottom-6 right-6 z-40 bg-[#FFCC08] text-black px-6 py-4 rounded-full shadow-2xl hover:bg-yellow-500 transition-all transform hover:scale-105 flex items-center space-x-3 font-bold"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
          <span className="bg-black text-[#FFCC08] px-3 py-1 rounded-full text-sm">
            GHS {getTotalAmount().toFixed(2)}
          </span>
        </button>
      )}

      {/* Header */}
      <header className="bg-black/40 backdrop-blur-xl border-b border-[#FFCC08]/30 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Home className="w-5 h-5 text-white" />
              </button>
              {agentInfo && (
                <div>
                  <h1 className="text-xl font-bold text-white">{agentInfo.name}'s Store</h1>
                  <p className="text-sm text-gray-400 flex items-center space-x-2">
                    <Award className="w-4 h-4 text-[#FFCC08]" />
                    <span className="capitalize">{agentInfo.agentMetadata?.agentLevel || 'Agent'} Level</span>
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {!isLoggedIn ? (
                <>
                  <button
                    onClick={() => router.push('/SignIn')}
                    className="px-4 py-2 text-white hover:text-[#FFCC08] transition-colors font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push('/SignUp')}
                    className="px-4 py-2 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-colors font-medium"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-colors font-medium"
                >
                  Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 text-[#FFCC08] animate-spin" />
          </div>
        ) : (
          <>
            {/* Agent Info Banner */}
            {agentInfo && (
              <div 
                className="rounded-2xl p-8 mb-12 text-black"
                style={{ 
                  background: `linear-gradient(to right, ${agentInfo.storeCustomization?.brandColor || '#FFCC08'}, ${agentInfo.storeCustomization?.brandColor || '#FFCC08'}dd)` 
                }}
              >
                {/* Custom Banner Image */}
                {agentInfo.storeCustomization?.bannerUrl && (
                  <img
                    src={agentInfo.storeCustomization.bannerUrl}
                    alt="Store Banner"
                    className="w-full h-48 object-cover rounded-xl mb-6"
                  />
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      {agentInfo.storeCustomization?.storeName || `${agentInfo.name}'s Store`}
                    </h2>
                    <p className="text-black/80 mb-4">
                      {agentInfo.storeCustomization?.storeDescription || 'Your trusted data bundle provider'}
                    </p>
                    
                    {/* Welcome Message */}
                    {agentInfo.storeCustomization?.welcomeMessage && (
                      <div className="bg-black/20 rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium">
                          {agentInfo.storeCustomization.welcomeMessage}
                        </p>
                      </div>
                    )}
                    
                    {/* Agent Info */}
                    {agentInfo.storeCustomization?.showAgentInfo !== false && (
                      <div className="flex items-center space-x-6">
                        {agentInfo.phoneNumber && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span className="font-medium">{agentInfo.phoneNumber}</span>
                          </div>
                        )}
                        {agentInfo.territory && (
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span className="font-medium">{agentInfo.territory}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Social Links */}
                    {agentInfo.storeCustomization?.socialLinks && (
                      <div className="flex items-center space-x-3 mt-4">
                        {agentInfo.storeCustomization.socialLinks.whatsapp && (
                          <a
                            href={`https://wa.me/${agentInfo.storeCustomization.socialLinks.whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
                          >
                            <MessageCircle className="w-5 h-5 text-white" />
                          </a>
                        )}
                        {agentInfo.storeCustomization.socialLinks.facebook && (
                          <a
                            href={agentInfo.storeCustomization.socialLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                          >
                            <Facebook className="w-5 h-5 text-white" />
                          </a>
                        )}
                        {agentInfo.storeCustomization.socialLinks.twitter && (
                          <a
                            href={agentInfo.storeCustomization.socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-sky-500 hover:bg-sky-600 rounded-full flex items-center justify-center transition-colors"
                          >
                            <Twitter className="w-5 h-5 text-white" />
                          </a>
                        )}
                        {agentInfo.storeCustomization.socialLinks.instagram && (
                          <a
                            href={agentInfo.storeCustomization.socialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-pink-600 hover:bg-pink-700 rounded-full flex items-center justify-center transition-colors"
                          >
                            <Instagram className="w-5 h-5 text-white" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Custom Logo or Default */}
                  {agentInfo.storeCustomization?.logoUrl ? (
                    <img
                      src={agentInfo.storeCustomization.logoUrl}
                      alt="Store Logo"
                      className="w-24 h-24 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-black rounded-2xl flex items-center justify-center">
                      <Zap className="w-12 h-12 text-[#FFCC08]" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Products Grid */}
            {products.length > 0 ? (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Available Products</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.filter(p => p.enabled).map((product) => (
                    <div 
                      key={product.id} 
                      className="bg-white/10 backdrop-blur-xl border border-[#FFCC08]/30 rounded-2xl p-6 hover:border-[#FFCC08] transition-all transform hover:scale-105"
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-[#FFCC08] to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <Wifi className="w-8 h-8 text-black" />
                        </div>
                        <h4 className="font-bold text-white text-lg mb-2">{product.network}</h4>
                        <p className="text-4xl font-bold text-[#FFCC08] mb-2">{product.capacity}GB</p>
                        <p className="text-2xl font-bold text-white mb-4">
                          GHS {product.price}
                        </p>
                        {product.description && (
                          <p className="text-sm text-gray-400 mb-4">{product.description}</p>
                        )}
                        <button
                          onClick={() => addToCart(product)}
                          className="w-full bg-[#FFCC08] text-black py-3 rounded-xl hover:bg-yellow-500 transition-colors font-bold flex items-center justify-center space-x-2"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-xl border border-[#FFCC08]/30 rounded-2xl p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Products Available</h3>
                <p className="text-gray-400">
                  This agent store doesn't have any products yet.
                </p>
              </div>
            )}

            {/* Trust Badges */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
                <Shield className="w-12 h-12 text-[#FFCC08] mx-auto mb-3" />
                <h4 className="font-bold text-white mb-2">Secure Payment</h4>
                <p className="text-sm text-gray-400">Your payment is safe and secure</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
                <Zap className="w-12 h-12 text-[#FFCC08] mx-auto mb-3" />
                <h4 className="font-bold text-white mb-2">Instant Delivery</h4>
                <p className="text-sm text-gray-400">Get your data within minutes</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
                <Star className="w-12 h-12 text-[#FFCC08] mx-auto mb-3" />
                <h4 className="font-bold text-white mb-2">Trusted Agent</h4>
                <p className="text-sm text-gray-400">Verified and certified agent</p>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-[#FFCC08]/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Checkout</h3>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Cart Items */}
              <div>
                <h4 className="font-semibold text-white mb-4">Order Summary</h4>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-800 rounded-xl p-4">
                      <div>
                        <p className="font-medium text-white">{item.network} {item.capacity}GB</p>
                        <p className="text-sm text-gray-400">GHS {item.price}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-white">Total Amount</span>
                  <span className="text-2xl font-bold text-[#FFCC08]">
                    GHS {getTotalAmount().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Phone Number Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recipient Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-[#FFCC08]" />
                  </div>
                  <input
                    type="tel"
                    id="recipientPhone"
                    placeholder="0501234567"
                    className="pl-10 pr-4 py-3 block w-full rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => {
                    showNotification('Order placed successfully!', 'success');
                    setShowCheckout(false);
                    setCart([]);
                  }}
                  className="flex-1 px-6 py-3 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-colors font-bold flex items-center justify-center space-x-2"
                >
                  <span>Place Order</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentStorePage;
