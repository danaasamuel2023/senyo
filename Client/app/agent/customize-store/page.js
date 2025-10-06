'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save, ArrowLeft, Eye, RefreshCw, CheckCircle, AlertCircle, X,
  Link as LinkIcon, Palette, Image, Type, MessageSquare, Settings,
  Globe, Phone, Mail, Facebook, Twitter, Instagram, MessageCircle,
  Upload, Copy, ExternalLink, Sparkles, Zap
} from 'lucide-react';

const CustomizeStorePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [userData, setUserData] = useState(null);

  const [customization, setCustomization] = useState({
    customSlug: '',
    storeName: '',
    storeDescription: '',
    brandColor: '#FFCC08',
    logoUrl: '',
    bannerUrl: '',
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

  useEffect(() => {
    checkAuth();
    loadCustomization();
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

  const loadCustomization = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5001'
        : 'https://unlimitedata.onrender.com';

      const response = await fetch(`${API_URL}/api/agent/catalog`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('authToken')
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Load existing customization from userData or API
        const user = JSON.parse(localStorage.getItem('userData') || '{}');
        if (user.agentMetadata) {
          setCustomization({
            customSlug: user.agentMetadata.customSlug || '',
            storeName: user.agentMetadata.storeCustomization?.storeName || '',
            storeDescription: user.agentMetadata.storeCustomization?.storeDescription || '',
            brandColor: user.agentMetadata.storeCustomization?.brandColor || '#FFCC08',
            logoUrl: user.agentMetadata.storeCustomization?.logoUrl || '',
            bannerUrl: user.agentMetadata.storeCustomization?.bannerUrl || '',
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
      console.error('Failed to load customization:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
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

      const data = await response.json();

      if (response.ok) {
        showNotification('Store customization saved successfully!', 'success');
        // Update localStorage with new data
        const user = JSON.parse(localStorage.getItem('userData') || '{}');
        user.agentMetadata = {
          ...user.agentMetadata,
          customSlug: data.customSlug,
          storeCustomization: data.customization
        };
        localStorage.setItem('userData', JSON.stringify(user));
      } else {
        showNotification(data.msg || 'Failed to save customization', 'error');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      showNotification('Failed to save customization', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('social.')) {
      const socialKey = name.split('.')[1];
      setCustomization(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value
        }
      }));
    } else {
      setCustomization(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const getStoreUrl = () => {
    const identifier = customization.customSlug || userData?.agentMetadata?.agentCode;
    return identifier ? `/agent-store/${identifier}` : '';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
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

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/agent/dashboard')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customize Your Store</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Make your store unique and professional</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.open(getStoreUrl(), '_blank')}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium flex items-center space-x-2"
            >
              <Eye className="w-5 h-5" />
              <span>Preview Store</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-colors font-bold flex items-center space-x-2 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Store URL Preview */}
        {getStoreUrl() && (
          <div className="bg-gradient-to-r from-[#FFCC08] to-yellow-500 rounded-2xl p-6 text-black">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-2">Your Store URL</h3>
                <div className="flex items-center space-x-2 bg-black/20 rounded-lg px-4 py-2">
                  <Globe className="w-5 h-5" />
                  <code className="text-sm font-mono font-bold">
                    {typeof window !== 'undefined' ? `${window.location.origin}${getStoreUrl()}` : ''}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}${getStoreUrl()}`);
                      showNotification('URL copied!', 'success');
                    }}
                    className="p-2 hover:bg-black/30 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <Sparkles className="w-12 h-12" />
            </div>
          </div>
        )}
      </div>

      {/* Customization Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
              <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Basic Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom URL Slug
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">.../agent-store/</span>
                <input
                  type="text"
                  name="customSlug"
                  value={customization.customSlug}
                  onChange={handleInputChange}
                  placeholder="my-store-name"
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Use letters, numbers, hyphens, and underscores only
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store Name
              </label>
              <input
                type="text"
                name="storeName"
                value={customization.storeName}
                onChange={handleInputChange}
                placeholder="e.g., John's Data Store"
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store Description
              </label>
              <textarea
                name="storeDescription"
                value={customization.storeDescription}
                onChange={handleInputChange}
                placeholder="Describe your store and services..."
                rows="3"
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Welcome Message
              </label>
              <textarea
                name="welcomeMessage"
                value={customization.welcomeMessage}
                onChange={handleInputChange}
                placeholder="Welcome to my store! Get the best data deals..."
                rows="2"
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
              />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/20">
              <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Branding</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brand Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  name="brandColor"
                  value={customization.brandColor}
                  onChange={handleInputChange}
                  className="w-16 h-12 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={customization.brandColor}
                  onChange={(e) => setCustomization(prev => ({ ...prev, brandColor: e.target.value }))}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Logo URL (Optional)
              </label>
              <input
                type="url"
                name="logoUrl"
                value={customization.logoUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Banner URL (Optional)
              </label>
              <input
                type="url"
                name="bannerUrl"
                value={customization.bannerUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/banner.jpg"
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="showAgentInfo"
                  checked={customization.showAgentInfo}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#FFCC08] focus:ring-[#FFCC08] rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show Agent Information</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="showContactButton"
                  checked={customization.showContactButton}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#FFCC08] focus:ring-[#FFCC08] rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show Contact Button</span>
              </label>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20">
              <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Social Media</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-green-600" />
                <span>WhatsApp Number</span>
              </label>
              <input
                type="tel"
                name="social.whatsapp"
                value={customization.socialLinks.whatsapp}
                onChange={handleInputChange}
                placeholder="+233501234567"
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                <Facebook className="w-4 h-4 text-blue-600" />
                <span>Facebook</span>
              </label>
              <input
                type="url"
                name="social.facebook"
                value={customization.socialLinks.facebook}
                onChange={handleInputChange}
                placeholder="https://facebook.com/yourpage"
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                <Twitter className="w-4 h-4 text-sky-600" />
                <span>Twitter</span>
              </label>
              <input
                type="url"
                name="social.twitter"
                value={customization.socialLinks.twitter}
                onChange={handleInputChange}
                placeholder="https://twitter.com/youraccount"
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>Instagram</span>
              </label>
              <input
                type="url"
                name="social.instagram"
                value={customization.socialLinks.instagram}
                onChange={handleInputChange}
                placeholder="https://instagram.com/youraccount"
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/20">
              <Sparkles className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Preview</h2>
          </div>

          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6" style={{ borderColor: customization.brandColor }}>
            {customization.bannerUrl && (
              <img 
                src={customization.bannerUrl} 
                alt="Banner" 
                className="w-full h-32 max-w-full object-cover rounded-lg mb-4"
                onError={(e) => e.target.style.display = 'none'}
                loading="lazy"
                decoding="async"
              />
            )}
            
            <div className="flex items-center space-x-4 mb-4">
              {customization.logoUrl ? (
                <img 
                  src={customization.logoUrl} 
                  alt="Logo" 
                  className="w-16 h-16 max-w-full rounded-full object-cover"
                  onError={(e) => e.target.src = ''}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                  style={{ backgroundColor: customization.brandColor }}
                >
                  {(customization.storeName || userData?.name || 'A').charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {customization.storeName || userData?.name || 'Your Store'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {customization.storeDescription || 'Your trusted data provider'}
                </p>
              </div>
            </div>

            {customization.welcomeMessage && (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-900 dark:text-white">
                  {customization.welcomeMessage}
                </p>
              </div>
            )}

            {/* Social Links Preview */}
            {Object.values(customization.socialLinks).some(link => link) && (
              <div className="flex items-center space-x-3 mt-4">
                {customization.socialLinks.whatsapp && (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                )}
                {customization.socialLinks.facebook && (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Facebook className="w-4 h-4 text-white" />
                  </div>
                )}
                {customization.socialLinks.twitter && (
                  <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center">
                    <Twitter className="w-4 h-4 text-white" />
                  </div>
                )}
                {customization.socialLinks.instagram && (
                  <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
                    <Instagram className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4 flex items-center space-x-2">
          <Zap className="w-5 h-5" />
          <span>Customization Tips</span>
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Choose a memorable custom URL that's easy to share</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Use your brand color consistently across all materials</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Add social media links to build trust with customers</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Write a warm welcome message to engage visitors</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Preview your store before saving to see how it looks</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CustomizeStorePage;
