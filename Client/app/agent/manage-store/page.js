'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save, ArrowLeft, Eye, RefreshCw, CheckCircle, AlertCircle, X,
  Link as LinkIcon, Palette, Package, Plus, Edit, Trash2, Settings,
  Globe, Phone, Mail, Facebook, Twitter, Instagram, MessageCircle,
  Copy, ExternalLink, Sparkles, Zap, ShoppingBag, DollarSign, ToggleLeft,
  ToggleRight, Search, Filter, ChevronDown, ChevronUp
} from 'lucide-react';

const ManageStorePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('store'); // 'store' or 'packages'
  const [userData, setUserData] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNetwork, setFilterNetwork] = useState('all');

  const [customization, setCustomization] = useState({
    customSlug: '',
    storeName: '',
    storeDescription: '',
    brandColor: '#FFCC08',
    welcomeMessage: '',
    showAgentInfo: true,
    showContactButton: true,
    socialLinks: {
      whatsapp: '',
      facebook: '',
      twitter: '',
      instagram: ''
    }
  });

  const [newProduct, setNewProduct] = useState({
    network: 'MTN',
    capacity: '',
    price: '',
    enabled: true,
    description: ''
  });

  useEffect(() => {
    checkAuth();
    loadStoreData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!token || user.role !== 'agent') {
      router.push('/SignIn');
      return false;
    }
    
    setUserData(user);
    return true;
  };

  const loadStoreData = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5001'
        : 'https://unlimitedata.onrender.com';

      const token = localStorage.getItem('authToken');
      
      // Load customization and catalog
      const response = await fetch(`${API_URL}/api/agent/catalog`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCatalog(data.catalog?.items || []);
        
        // Load customization from userData
        const user = JSON.parse(localStorage.getItem('userData') || '{}');
        if (user.agentMetadata) {
          setCustomization({
            customSlug: user.agentMetadata.customSlug || '',
            storeName: user.agentMetadata.storeCustomization?.storeName || '',
            storeDescription: user.agentMetadata.storeCustomization?.storeDescription || '',
            brandColor: user.agentMetadata.storeCustomization?.brandColor || '#FFCC08',
            welcomeMessage: user.agentMetadata.storeCustomization?.welcomeMessage || '',
            showAgentInfo: user.agentMetadata.storeCustomization?.showAgentInfo !== false,
            showContactButton: user.agentMetadata.storeCustomization?.showContactButton !== false,
            socialLinks: user.agentMetadata.storeCustomization?.socialLinks || {
              whatsapp: '',
              facebook: '',
              twitter: '',
              instagram: ''
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to load store data:', error);
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
    setSaving(true);
    try {
      const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5001'
        : 'https://unlimitedata.onrender.com';

      const response = await fetch(`${API_URL}/api/agent/customize-store`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('authToken')
        },
        body: JSON.stringify(customization)
      });

      if (response.ok) {
        showNotification('Store customization saved successfully!', 'success');
        
        // Update localStorage
        const user = JSON.parse(localStorage.getItem('userData') || '{}');
        user.agentMetadata = {
          ...user.agentMetadata,
          ...customization,
          storeCustomization: {
            storeName: customization.storeName,
            storeDescription: customization.storeDescription,
            brandColor: customization.brandColor,
            welcomeMessage: customization.welcomeMessage,
            showAgentInfo: customization.showAgentInfo,
            showContactButton: customization.showContactButton,
            socialLinks: customization.socialLinks
          }
        };
        localStorage.setItem('userData', JSON.stringify(user));
      } else {
        showNotification('Failed to save customization', 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      showNotification('Error saving customization', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.capacity || !newProduct.price) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    const product = {
      ...newProduct,
      capacity: parseInt(newProduct.capacity),
      price: parseFloat(newProduct.price),
      description: newProduct.description || `${newProduct.network} ${newProduct.capacity}GB Data Bundle`
    };

    const updatedCatalog = [...catalog, product];
    saveCatalog(updatedCatalog);
    
    setNewProduct({
      network: 'MTN',
      capacity: '',
      price: '',
      enabled: true,
      description: ''
    });
    setShowAddProduct(false);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      network: product.network,
      capacity: product.capacity.toString(),
      price: product.price.toString(),
      enabled: product.enabled,
      description: product.description
    });
    setShowAddProduct(true);
  };

  const handleUpdateProduct = () => {
    const updatedCatalog = catalog.map(item => 
      item.id === editingProduct.id 
        ? {
            ...item,
            network: newProduct.network,
            capacity: parseInt(newProduct.capacity),
            price: parseFloat(newProduct.price),
            enabled: newProduct.enabled,
            description: newProduct.description
          }
        : item
    );
    
    saveCatalog(updatedCatalog);
    setEditingProduct(null);
    setShowAddProduct(false);
    setNewProduct({
      network: 'MTN',
      capacity: '',
      price: '',
      enabled: true,
      description: ''
    });
  };

  const handleDeleteProduct = (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const updatedCatalog = catalog.filter(item => item.id !== productId);
    saveCatalog(updatedCatalog);
  };

  const toggleProductStatus = (productId) => {
    const updatedCatalog = catalog.map(item => 
      item.id === productId ? { ...item, enabled: !item.enabled } : item
    );
    saveCatalog(updatedCatalog);
  };

  const saveCatalog = async (updatedCatalog) => {
    setSaving(true);
    try {
      const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5001'
        : 'https://unlimitedata.onrender.com';

      const response = await fetch(`${API_URL}/api/agent/catalog`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('authToken')
        },
        body: JSON.stringify({ items: updatedCatalog })
      });

      if (response.ok) {
        const data = await response.json();
        setCatalog(data.catalog?.items || updatedCatalog);
        showNotification('Catalog updated successfully!', 'success');
      } else {
        showNotification('Failed to update catalog', 'error');
      }
    } catch (error) {
      console.error('Save catalog error:', error);
      showNotification('Error updating catalog', 'error');
    } finally {
      setSaving(false);
    }
  };

  const copyStoreLink = () => {
    const storeUrl = `${window.location.origin}/agent-store/${customization.customSlug || userData?.agentCode}`;
    navigator.clipboard.writeText(storeUrl);
    showNotification('Store link copied to clipboard!', 'success');
  };

  const filteredCatalog = catalog.filter(product => {
    const matchesSearch = product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.network.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterNetwork === 'all' || product.network === filterNetwork;
    return matchesSearch && matchesFilter;
  });

  const networks = ['all', ...new Set(catalog.map(p => p.network))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-[#FFCC08] mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading store data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
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
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/agent/dashboard')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Store</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Customize your store and manage packages</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={copyStoreLink}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy Link</span>
              </button>
              
              <a
                href={`/agent-store/${customization.customSlug || userData?.agentCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-all font-semibold"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Preview Store</span>
              </a>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mt-4">
            <button
              onClick={() => setActiveTab('store')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'store'
                  ? 'bg-[#FFCC08] text-black'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Store Settings</span>
            </button>
            
            <button
              onClick={() => setActiveTab('packages')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'packages'
                  ? 'bg-[#FFCC08] text-black'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Package className="w-5 h-5" />
              <span>Packages</span>
              <span className="px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-black text-xs rounded-full font-bold">
                {catalog.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'store' ? (
          /* Store Settings Tab */
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                <Globe className="w-6 h-6 text-[#FFCC08]" />
                <span>Basic Information</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    value={customization.storeName}
                    onChange={(e) => setCustomization({ ...customization, storeName: e.target.value })}
                    placeholder="e.g., DataHub Store"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Custom URL Slug *
                  </label>
                  <input
                    type="text"
                    value={customization.customSlug}
                    onChange={(e) => setCustomization({ ...customization, customSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="my-store"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Your store will be accessible at: /agent-store/{customization.customSlug || 'your-slug'}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Welcome Message
                  </label>
                  <input
                    type="text"
                    value={customization.welcomeMessage}
                    onChange={(e) => setCustomization({ ...customization, welcomeMessage: e.target.value })}
                    placeholder="Welcome to our store!"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Store Description
                  </label>
                  <textarea
                    value={customization.storeDescription}
                    onChange={(e) => setCustomization({ ...customization, storeDescription: e.target.value })}
                    placeholder="Describe your store..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Brand Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={customization.brandColor}
                      onChange={(e) => setCustomization({ ...customization, brandColor: e.target.value })}
                      className="w-16 h-12 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customization.brandColor}
                      onChange={(e) => setCustomization({ ...customization, brandColor: e.target.value })}
                      className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                <MessageCircle className="w-6 h-6 text-[#FFCC08]" />
                <span>Social Links</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Number</span>
                  </label>
                  <input
                    type="tel"
                    value={customization.socialLinks.whatsapp}
                    onChange={(e) => setCustomization({
                      ...customization,
                      socialLinks: { ...customization.socialLinks, whatsapp: e.target.value }
                    })}
                    placeholder="+233XXXXXXXXX"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                    <Facebook className="w-4 h-4" />
                    <span>Facebook Page</span>
                  </label>
                  <input
                    type="url"
                    value={customization.socialLinks.facebook}
                    onChange={(e) => setCustomization({
                      ...customization,
                      socialLinks: { ...customization.socialLinks, facebook: e.target.value }
                    })}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                    <Twitter className="w-4 h-4" />
                    <span>Twitter Handle</span>
                  </label>
                  <input
                    type="text"
                    value={customization.socialLinks.twitter}
                    onChange={(e) => setCustomization({
                      ...customization,
                      socialLinks: { ...customization.socialLinks, twitter: e.target.value }
                    })}
                    placeholder="https://twitter.com/yourhandle"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                    <Instagram className="w-4 h-4" />
                    <span>Instagram Profile</span>
                  </label>
                  <input
                    type="text"
                    value={customization.socialLinks.instagram}
                    onChange={(e) => setCustomization({
                      ...customization,
                      socialLinks: { ...customization.socialLinks, instagram: e.target.value }
                    })}
                    placeholder="https://instagram.com/yourprofile"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveCustomization}
                disabled={saving}
                className="flex items-center space-x-2 px-8 py-4 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Store Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Packages Tab */
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search packages..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <select
                    value={filterNetwork}
                    onChange={(e) => setFilterNetwork(e.target.value)}
                    className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                  >
                    {networks.map(network => (
                      <option key={network} value={network}>
                        {network === 'all' ? 'All Networks' : network}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      setShowAddProduct(true);
                      setEditingProduct(null);
                    }}
                    className="flex items-center space-x-2 px-6 py-3 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-all font-semibold shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Package</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCatalog.map((product) => (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#FFCC08] to-yellow-500 rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {product.network} {product.capacity}GB
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ₵{product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleProductStatus(product.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {product.enabled ? (
                        <ToggleRight className="w-6 h-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {product.description}
                  </p>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex items-center justify-center p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredCatalog.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No packages found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm || filterNetwork !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Get started by adding your first package'}
                </p>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-all font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Package</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingProduct ? 'Edit Package' : 'Add New Package'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                    setNewProduct({
                      network: 'MTN',
                      capacity: '',
                      price: '',
                      enabled: true,
                      description: ''
                    });
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Network *
                </label>
                <select
                  value={newProduct.network}
                  onChange={(e) => setNewProduct({ ...newProduct, network: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                >
                  <option value="MTN">MTN</option>
                  <option value="AT">AirtelTigo</option>
                  <option value="Telecel">Telecel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Capacity (GB) *
                </label>
                <input
                  type="number"
                  value={newProduct.capacity}
                  onChange={(e) => setNewProduct({ ...newProduct, capacity: e.target.value })}
                  placeholder="e.g., 1, 5, 10"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Price (₵) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="e.g., 4.20, 8.40"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Package description..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={newProduct.enabled}
                  onChange={(e) => setNewProduct({ ...newProduct, enabled: e.target.checked })}
                  className="w-5 h-5 text-[#FFCC08] border-gray-300 rounded focus:ring-[#FFCC08]"
                />
                <label htmlFor="enabled" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Enable this package
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex space-x-3">
              <button
                onClick={() => {
                  setShowAddProduct(false);
                  setEditingProduct(null);
                  setNewProduct({
                    network: 'MTN',
                    capacity: '',
                    price: '',
                    enabled: true,
                    description: ''
                  });
                }}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-semibold"
              >
                Cancel
              </button>
              
              <button
                onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                disabled={saving}
                className="flex-1 py-3 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : editingProduct ? 'Update Package' : 'Add Package'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ManageStorePage;

