'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Store, Package, TrendingUp, Users, ShoppingCart, Settings,
  Palette, Upload, Eye, Edit3, Trash2, Plus, Save, X,
  BarChart3, DollarSign, Calendar, MapPin, Clock,
  Star, MessageCircle, Share2, QrCode, Globe, Smartphone,
  AlertCircle, CheckCircle, Loader2, ChevronRight,
  Palette as ColorPalette, Image as ImageIcon, Type,
  Bell, Mail, Phone, Facebook, Twitter, Instagram,
  Zap, Wifi, Shield, Award, Target, PieChart, Megaphone
} from 'lucide-react';
import { getApiEndpoint } from '@/utils/apiConfig';
import ProductManager from '@/component/ProductManager';
import OrderManager from '@/component/OrderManager';
import AnalyticsDashboard from '@/component/AnalyticsDashboard';
import MarketingTools from '@/component/MarketingTools';

const AgentStoreManagement = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [agentData, setAgentData] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [notification, setNotification] = useState(null);

  // Store customization states
  const [storeCustomization, setStoreCustomization] = useState({
    storeName: '',
    welcomeMessage: '',
    storeDescription: '',
    brandColor: '#FFCC08',
    logo: null,
    socialLinks: {
      whatsapp: '',
      facebook: '',
      twitter: '',
      instagram: ''
    },
    businessHours: {
      monday: { open: '08:00', close: '18:00', isOpen: true },
      tuesday: { open: '08:00', close: '18:00', isOpen: true },
      wednesday: { open: '08:00', close: '18:00', isOpen: true },
      thursday: { open: '08:00', close: '18:00', isOpen: true },
      friday: { open: '08:00', close: '18:00', isOpen: true },
      saturday: { open: '09:00', close: '16:00', isOpen: true },
      sunday: { open: '10:00', close: '14:00', isOpen: false }
    }
  });

  // Product management states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    network: 'MTN',
    capacity: '',
    basePrice: 0,
    agentPrice: 0,
    stock: 0,
    isActive: true,
    category: 'data',
    tags: []
  });

  useEffect(() => {
    loadAgentData();
  }, []);

  const loadAgentData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/SignIn');
        return;
      }

      const API_URL = getApiEndpoint('');

      const response = await fetch(`${API_URL}/api/agent/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAgentData(data.agent);
        setStoreData(data.store);
        setProducts(data.products || []);
        setOrders(data.orders || []);
        setAnalytics(data.analytics || {});
        
        if (data.agent.storeCustomization) {
          setStoreCustomization(data.agent.storeCustomization);
        }
      }
    } catch (error) {
      console.error('Failed to load agent data:', error);
      showNotification('Failed to load store data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSaveCustomization = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const API_URL = getApiEndpoint('');

      const response = await fetch(`${API_URL}/api/agent/store-customization`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(storeCustomization)
      });

      if (response.ok) {
        showNotification('Store customization saved successfully!', 'success');
        loadAgentData(); // Reload data
      } else {
        showNotification('Failed to save customization', 'error');
      }
    } catch (error) {
      console.error('Error saving customization:', error);
      showNotification('Error saving customization', 'error');
    }
  };

  const handleSaveProduct = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const API_URL = getApiEndpoint('');

      const productData = {
        ...newProduct,
        agentId: agentData._id
      };

      const url = editingProduct 
        ? `${API_URL}/api/agent/products/${editingProduct._id}`
        : `${API_URL}/api/agent/products`;

      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        showNotification(
          editingProduct ? 'Product updated successfully!' : 'Product added successfully!', 
          'success'
        );
        setShowProductModal(false);
        setEditingProduct(null);
        setNewProduct({
          name: '',
          description: '',
          network: 'MTN',
          capacity: '',
          basePrice: 0,
          agentPrice: 0,
          stock: 0,
          isActive: true,
          category: 'data',
          tags: []
        });
        loadAgentData();
      } else {
        showNotification('Failed to save product', 'error');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      showNotification('Error saving product', 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const API_URL = getApiEndpoint('');

      const response = await fetch(`${API_URL}/api/agent/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showNotification('Product deleted successfully!', 'success');
        loadAgentData();
      } else {
        showNotification('Failed to delete product', 'error');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification('Error deleting product', 'error');
    }
  };

  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setNewProduct({
        name: product.name,
        description: product.description,
        network: product.network,
        capacity: product.capacity,
        basePrice: product.basePrice,
        agentPrice: product.agentPrice,
        stock: product.stock,
        isActive: product.isActive,
        category: product.category,
        tags: product.tags || []
      });
    } else {
      setEditingProduct(null);
      setNewProduct({
        name: '',
        description: '',
        network: 'MTN',
        capacity: '',
        basePrice: 0,
        agentPrice: 0,
        stock: 0,
        isActive: true,
        category: 'data',
        tags: []
      });
    }
    setShowProductModal(true);
  };

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Transactions', icon: ShoppingCart },
    { id: 'withdrawals', label: 'Withdrawals', icon: DollarSign },
    { id: 'customize', label: 'Customize', icon: Palette },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#FFCC08] mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading store management...</p>
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
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFCC08] to-yellow-500 flex items-center justify-center shadow-lg">
                <Store className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Store Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your store, products, and orders
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>Preview Store</span>
              </button>
              <button
                onClick={() => router.push(`/store?agent=${agentData?.agentCode}`)}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-xl transition-all shadow-lg"
              >
                <Globe className="w-4 h-4" />
                <span>View Public Store</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Store Sharing Section */}
      {agentData?.agentCode && (
        <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border-b border-yellow-200 dark:border-yellow-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your Store is Live!</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Share your unique store link with customers</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                {/* Store URL */}
                <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    {window.location.origin}/store?agent={agentData.agentCode}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/store?agent=${agentData.agentCode}`);
                      setNotification({ message: 'Store link copied!', type: 'success' });
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Share2 className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                
                {/* Share Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/store?agent=${agentData.agentCode}`;
                      const text = `Check out my data store: ${storeCustomization.storeName || 'UnlimitedData Store'}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/store?agent=${agentData.agentCode}`;
                      const text = `Check out my data store: ${storeCustomization.storeName || 'UnlimitedData Store'}`;
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                    <span>Facebook</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/store?agent=${agentData.agentCode}`;
                      const text = `Check out my data store: ${storeCustomization.storeName || 'UnlimitedData Store'}`;
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                    <span>Twitter</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'border-[#FFCC08] text-[#FFCC08]'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-[#FFCC08] to-yellow-600 rounded-2xl p-[2px] shadow-2xl">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Revenue</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        ₵{analytics?.totalRevenue?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-black" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {analytics?.totalOrders || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Products</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {products?.filter(p => p.isActive).length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Customers</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {analytics?.customerCount || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
              </div>
              <div className="p-6">
                {orders?.slice(0, 5).map((order, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFCC08] to-yellow-500 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Order #{order.id}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{order.product}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">₵{order.amount?.toFixed(2)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{order.status}</p>
                    </div>
                  </div>
                ))}
                {(!orders || orders.length === 0) && (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">No orders yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <ProductManager 
            agentId={agentData?._id} 
            onProductUpdate={loadAgentData}
          />
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <OrderManager
            agentId={agentData?._id}
            onOrderUpdate={loadAgentData}
          />
        )}

        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Withdrawal Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">Available Balance</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">₵{agentData?.wallet?.balance?.toFixed(2) || '0.00'}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Pending Withdrawals</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">₵0.00</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Withdrawn</p>
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">₵0.00</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Request Withdrawal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
                    <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white">
                      <option>Mobile Money</option>
                      <option>Bank Transfer</option>
                    </select>
                  </div>
                </div>
                <button className="w-full py-3 bg-[#FFCC08] text-black rounded-xl font-semibold hover:bg-yellow-500 transition-all shadow-lg hover:shadow-xl">
                  Request Withdrawal
                </button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Withdrawal History</h4>
              <div className="text-center py-8">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No withdrawal requests yet</p>
              </div>
            </div>
          </div>
        )}

        {/* Customize Tab */}
        {activeTab === 'customize' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Store Customization</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Customize your store appearance and branding</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Store Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={storeCustomization.storeName}
                    onChange={(e) => setStoreCustomization({...storeCustomization, storeName: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="Enter your store name"
                  />
                </div>

                {/* Welcome Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Welcome Message
                  </label>
                  <input
                    type="text"
                    value={storeCustomization.welcomeMessage}
                    onChange={(e) => setStoreCustomization({...storeCustomization, welcomeMessage: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="Welcome to our store!"
                  />
                </div>

                {/* Store Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Store Description
                  </label>
                  <textarea
                    value={storeCustomization.storeDescription}
                    onChange={(e) => setStoreCustomization({...storeCustomization, storeDescription: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="Describe your store and services"
                  />
                </div>

                {/* Brand Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Brand Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={storeCustomization.brandColor}
                      onChange={(e) => setStoreCustomization({...storeCustomization, brandColor: e.target.value})}
                      className="w-12 h-12 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={storeCustomization.brandColor}
                      onChange={(e) => setStoreCustomization({...storeCustomization, brandColor: e.target.value})}
                      className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                      placeholder="#FFCC08"
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Social Media Links
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="w-5 h-5 text-green-500" />
                      <input
                        type="text"
                        value={storeCustomization.socialLinks.whatsapp}
                        onChange={(e) => setStoreCustomization({
                          ...storeCustomization, 
                          socialLinks: {...storeCustomization.socialLinks, whatsapp: e.target.value}
                        })}
                        className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="WhatsApp number (e.g., +233123456789)"
                      />
                    </div>
                    <div className="flex items-center space-x-3">
                      <Facebook className="w-5 h-5 text-blue-600" />
                      <input
                        type="text"
                        value={storeCustomization.socialLinks.facebook}
                        onChange={(e) => setStoreCustomization({
                          ...storeCustomization, 
                          socialLinks: {...storeCustomization.socialLinks, facebook: e.target.value}
                        })}
                        className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="Facebook page URL"
                      />
                    </div>
                    <div className="flex items-center space-x-3">
                      <Twitter className="w-5 h-5 text-sky-500" />
                      <input
                        type="text"
                        value={storeCustomization.socialLinks.twitter}
                        onChange={(e) => setStoreCustomization({
                          ...storeCustomization, 
                          socialLinks: {...storeCustomization.socialLinks, twitter: e.target.value}
                        })}
                        className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="Twitter profile URL"
                      />
                    </div>
                    <div className="flex items-center space-x-3">
                      <Instagram className="w-5 h-5 text-pink-500" />
                      <input
                        type="text"
                        value={storeCustomization.socialLinks.instagram}
                        onChange={(e) => setStoreCustomization({
                          ...storeCustomization, 
                          socialLinks: {...storeCustomization.socialLinks, instagram: e.target.value}
                        })}
                        className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="Instagram profile URL"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSaveCustomization}
                    className="w-full px-6 py-3 bg-[#FFCC08] text-black rounded-xl font-semibold hover:bg-yellow-500 transition-all shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>Save Customization</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Marketing Tab */}
        {activeTab === 'marketing' && (
          <MarketingTools agentId={agentData?._id} />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard agentId={agentData?._id} />
        )}
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="e.g., MTN Data Bundle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Network
                  </label>
                  <select
                    value={newProduct.network}
                    onChange={(e) => setNewProduct({...newProduct, network: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                  >
                    <option value="MTN">MTN</option>
                    <option value="AT">AT (AirtelTigo)</option>
                    <option value="Telecel">Telecel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Capacity (GB)
                  </label>
                  <input
                    type="number"
                    value={newProduct.capacity}
                    onChange={(e) => setNewProduct({...newProduct, capacity: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="e.g., 5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Base Price (₵)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.basePrice}
                    onChange={(e) => setNewProduct({...newProduct, basePrice: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Price (₵)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.agentPrice}
                    onChange={(e) => setNewProduct({...newProduct, agentPrice: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="0 (0 = unlimited)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Describe this product..."
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newProduct.isActive}
                  onChange={(e) => setNewProduct({...newProduct, isActive: e.target.checked})}
                  className="w-4 h-4 text-[#FFCC08] bg-gray-100 border-gray-300 rounded focus:ring-[#FFCC08] focus:ring-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Product is active and visible to customers
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProduct}
                  className="flex-1 px-4 py-3 bg-[#FFCC08] text-black rounded-xl font-semibold hover:bg-yellow-500 transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProduct ? 'Update Product' : 'Add Product'}</span>
                </button>
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

      {/* Store Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border-b border-gray-200 dark:border-gray-700 p-6 z-10 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-600 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Store Preview</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Preview your store as customers will see it</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="p-6">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 mb-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Store className="w-8 h-8 text-black" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {storeCustomization.storeName || `${agentData?.name}'s Data Store`}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {storeCustomization.welcomeMessage || 'Welcome to my data store!'}
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{agentData?.agentMetadata?.territory || 'Ghana'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{storeCustomization.businessHours?.monday?.open || '8AM'} - {storeCustomization.businessHours?.monday?.close || '9PM'}</span>
                    </div>
                  </div>
                </div>

                {/* Store URL Display */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Your Store URL</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                          {typeof window !== 'undefined' ? `${window.location.origin}/store?agent=${agentData?.agentCode}` : 'Loading...'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          navigator.clipboard.writeText(`${window.location.origin}/store?agent=${agentData?.agentCode}`);
                          setNotification({ message: 'Store URL copied!', type: 'success' });
                        }
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Copy Link</span>
                    </button>
                  </div>
                </div>

                {/* Social Links Preview */}
                {(storeCustomization.socialLinks?.whatsapp || storeCustomization.socialLinks?.facebook || storeCustomization.socialLinks?.twitter || storeCustomization.socialLinks?.instagram) && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Contact & Social</h4>
                    <div className="flex flex-wrap gap-3">
                      {storeCustomization.socialLinks?.whatsapp && (
                        <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <MessageCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">WhatsApp</span>
                        </div>
                      )}
                      {storeCustomization.socialLinks?.facebook && (
                        <div className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Facebook className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Facebook</span>
                        </div>
                      )}
                      {storeCustomization.socialLinks?.twitter && (
                        <div className="flex items-center space-x-2 px-3 py-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                          <Twitter className="w-4 h-4 text-sky-600" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Twitter</span>
                        </div>
                      )}
                      {storeCustomization.socialLinks?.instagram && (
                        <div className="flex items-center space-x-2 px-3 py-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                          <Instagram className="w-4 h-4 text-pink-600" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Instagram</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.open(`/store?agent=${agentData?.agentCode}`, '_blank');
                      }
                    }}
                    className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-black rounded-xl font-semibold transition-all"
                  >
                    <Globe className="w-5 h-5" />
                    <span>Open Store</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        const url = `${window.location.origin}/store?agent=${agentData?.agentCode}`;
                        const text = `Check out my data store: ${storeCustomization.storeName || 'UnlimitedData Store'}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                      }
                    }}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Share on WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentStoreManagement;