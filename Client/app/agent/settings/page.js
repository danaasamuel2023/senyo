'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home, Package, DollarSign, Wallet, Settings, Plus,
  ChevronRight, Store, Save, X, Moon, Sun,
  Home as HomeIcon, Phone, MessageCircle, Clock,
  Package as PackageIcon, Palette, FileText, Globe,
  ToggleLeft, ToggleRight, Upload, Eye, EyeOff
} from 'lucide-react';
import { getApiEndpoint } from '@/utils/apiConfig';

const AgentSettings = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [storeOpen, setStoreOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const [storeSettings, setStoreSettings] = useState({
    basic: {
      storeName: 'sam',
      storeDescription: 'helllo pls buy from me and get more discount',
      storeLogoUrl: 'https://example.com/logo.png',
      storeBannerUrl: 'https://example.com/banner.jpg'
    },
    contact: {
      phone: '+233 24 123 4567',
      email: 'sam@unlimiteddata.com',
      address: 'Accra, Ghana'
    },
    whatsapp: {
      enabled: true,
      number: '+233 24 123 4567',
      welcomeMessage: 'Hello! Welcome to my store. How can I help you today?'
    },
    hours: {
      monday: { open: '08:00', close: '18:00', isOpen: true },
      tuesday: { open: '08:00', close: '18:00', isOpen: true },
      wednesday: { open: '08:00', close: '18:00', isOpen: true },
      thursday: { open: '08:00', close: '18:00', isOpen: true },
      friday: { open: '08:00', close: '18:00', isOpen: true },
      saturday: { open: '09:00', close: '16:00', isOpen: true },
      sunday: { open: '10:00', close: '14:00', isOpen: false }
    },
    products: {
      autoApprove: true,
      showPrices: true,
      allowBackorders: false
    },
    theme: {
      primaryColor: '#FFCC08',
      secondaryColor: '#6366F1',
      accentColor: '#10B981'
    },
    policies: {
      returnPolicy: 'No returns accepted after 24 hours',
      privacyPolicy: 'We respect your privacy and protect your data',
      termsOfService: 'By using this store, you agree to our terms'
    },
    seo: {
      metaTitle: 'Sam\'s Data Store - Best Data Bundles in Ghana',
      metaDescription: 'Get the best data bundles for MTN, TELECEL, and AT networks at affordable prices',
      keywords: 'data bundles, MTN, TELECEL, AT, Ghana, mobile data'
    }
  });

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: HomeIcon },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'hours', label: 'Hours', icon: Clock },
    { id: 'products', label: 'Products', icon: PackageIcon },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'policies', label: 'Policies', icon: FileText },
    { id: 'seo', label: 'SEO', icon: Globe }
  ];

  useEffect(() => {
    loadStoreSettings();
  }, []);

  const loadStoreSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const API_URL = getApiEndpoint('');
      
      const response = await fetch(`${API_URL}/api/agent/store-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStoreSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to load store settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const API_URL = getApiEndpoint('');
      
      const response = await fetch(`${API_URL}/api/agent/store-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(storeSettings)
      });

      if (response.ok) {
        // Show success message
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  const updateSetting = (section, field, value) => {
    setStoreSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateHoursSetting = (day, field, value) => {
    setStoreSettings(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day],
          [field]: value
        }
      }
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Store Name
              </label>
              <input
                type="text"
                value={storeSettings.basic.storeName}
                onChange={(e) => updateSetting('basic', 'storeName', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Store Description
              </label>
              <textarea
                value={storeSettings.basic.storeDescription}
                onChange={(e) => updateSetting('basic', 'storeDescription', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Store Logo URL
              </label>
              <input
                type="url"
                value={storeSettings.basic.storeLogoUrl}
                onChange={(e) => updateSetting('basic', 'storeLogoUrl', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Store Banner URL
              </label>
              <input
                type="url"
                value={storeSettings.basic.storeBannerUrl}
                onChange={(e) => updateSetting('basic', 'storeBannerUrl', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={storeSettings.contact.phone}
                onChange={(e) => updateSetting('contact', 'phone', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={storeSettings.contact.email}
                onChange={(e) => updateSetting('contact', 'email', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Address
              </label>
              <input
                type="text"
                value={storeSettings.contact.address}
                onChange={(e) => updateSetting('contact', 'address', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'whatsapp':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">
                Enable WhatsApp Integration
              </label>
              <button
                onClick={() => updateSetting('whatsapp', 'enabled', !storeSettings.whatsapp.enabled)}
                className="flex items-center"
              >
                {storeSettings.whatsapp.enabled ? (
                  <ToggleRight className="w-8 h-8 text-blue-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-500" />
                )}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={storeSettings.whatsapp.number}
                onChange={(e) => updateSetting('whatsapp', 'number', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Welcome Message
              </label>
              <textarea
                value={storeSettings.whatsapp.welcomeMessage}
                onChange={(e) => updateSetting('whatsapp', 'welcomeMessage', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'hours':
        return (
          <div className="space-y-4">
            {Object.entries(storeSettings.hours).map(([day, hours]) => (
              <div key={day} className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
                <div className="w-20">
                  <span className="text-sm font-medium text-white capitalize">{day}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateHoursSetting(day, 'isOpen', !hours.isOpen)}
                    className="flex items-center"
                  >
                    {hours.isOpen ? (
                      <ToggleRight className="w-6 h-6 text-blue-500" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-500" />
                    )}
                  </button>
                </div>
                {hours.isOpen && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={hours.open}
                      onChange={(e) => updateHoursSetting(day, 'open', e.target.value)}
                      className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) => updateHoursSetting(day, 'close', e.target.value)}
                      className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                    />
                  </div>
                )}
                {!hours.isOpen && (
                  <span className="text-gray-500 text-sm">Closed</span>
                )}
              </div>
            ))}
          </div>
        );

      case 'products':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">
                Auto-approve orders
              </label>
              <button
                onClick={() => updateSetting('products', 'autoApprove', !storeSettings.products.autoApprove)}
                className="flex items-center"
              >
                {storeSettings.products.autoApprove ? (
                  <ToggleRight className="w-8 h-8 text-blue-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-500" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">
                Show prices publicly
              </label>
              <button
                onClick={() => updateSetting('products', 'showPrices', !storeSettings.products.showPrices)}
                className="flex items-center"
              >
                {storeSettings.products.showPrices ? (
                  <ToggleRight className="w-8 h-8 text-blue-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-500" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">
                Allow backorders
              </label>
              <button
                onClick={() => updateSetting('products', 'allowBackorders', !storeSettings.products.allowBackorders)}
                className="flex items-center"
              >
                {storeSettings.products.allowBackorders ? (
                  <ToggleRight className="w-8 h-8 text-blue-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        );

      case 'theme':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={storeSettings.theme.primaryColor}
                  onChange={(e) => updateSetting('theme', 'primaryColor', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-600"
                />
                <input
                  type="text"
                  value={storeSettings.theme.primaryColor}
                  onChange={(e) => updateSetting('theme', 'primaryColor', e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={storeSettings.theme.secondaryColor}
                  onChange={(e) => updateSetting('theme', 'secondaryColor', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-600"
                />
                <input
                  type="text"
                  value={storeSettings.theme.secondaryColor}
                  onChange={(e) => updateSetting('theme', 'secondaryColor', e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Accent Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={storeSettings.theme.accentColor}
                  onChange={(e) => updateSetting('theme', 'accentColor', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-600"
                />
                <input
                  type="text"
                  value={storeSettings.theme.accentColor}
                  onChange={(e) => updateSetting('theme', 'accentColor', e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 'policies':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Return Policy
              </label>
              <textarea
                value={storeSettings.policies.returnPolicy}
                onChange={(e) => updateSetting('policies', 'returnPolicy', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Privacy Policy
              </label>
              <textarea
                value={storeSettings.policies.privacyPolicy}
                onChange={(e) => updateSetting('policies', 'privacyPolicy', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Terms of Service
              </label>
              <textarea
                value={storeSettings.policies.termsOfService}
                onChange={(e) => updateSetting('policies', 'termsOfService', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'seo':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={storeSettings.seo.metaTitle}
                onChange={(e) => updateSetting('seo', 'metaTitle', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meta Description
              </label>
              <textarea
                value={storeSettings.seo.metaDescription}
                onChange={(e) => updateSetting('seo', 'metaDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Keywords
              </label>
              <input
                type="text"
                value={storeSettings.seo.keywords}
                onChange={(e) => updateSetting('seo', 'keywords', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="comma-separated keywords"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gray-800 transition-all duration-300 flex flex-col`}>
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-black" />
            </div>
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-yellow-400">UnlimitedData GH</h1>
            )}
          </div>
        </div>

        {/* Agent Store Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            {!sidebarCollapsed && (
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Agent Store</h2>
            )}
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4">
          <ul className="space-y-2">
            <li>
              <a
                href="/agent/dashboard"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <Home className="w-5 h-5" />
                {!sidebarCollapsed && <span>Dashboard</span>}
              </a>
            </li>
            <li>
              <a
                href="/agent/products"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <Package className="w-5 h-5" />
                {!sidebarCollapsed && <span>Products</span>}
              </a>
            </li>
            <li>
              <a
                href="/agent/transactions"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <DollarSign className="w-5 h-5" />
                {!sidebarCollapsed && <span>Transactions</span>}
              </a>
            </li>
            <li>
              <a
                href="/agent/withdrawals"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <Wallet className="w-5 h-5" />
                {!sidebarCollapsed && <span>Withdrawals</span>}
              </a>
            </li>
            <li>
              <a
                href="/agent/settings"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-yellow-600 text-black"
              >
                <Settings className="w-5 h-5" />
                {!sidebarCollapsed && <span>Settings</span>}
                {!sidebarCollapsed && <ChevronRight className="w-4 h-4 ml-auto" />}
              </a>
            </li>
          </ul>
        </nav>

        {/* Create Store Button */}
        <div className="p-4">
          <button className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-5 h-5" />
            {!sidebarCollapsed && <span>Create Store</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Open</span>
                <button
                  onClick={() => setStoreOpen(!storeOpen)}
                  className="flex items-center"
                >
                  {storeOpen ? (
                    <ToggleRight className="w-8 h-8 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-500" />
                  )}
                </button>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {darkMode ? <Moon className="w-5 h-5 text-gray-400" /> : <Sun className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Store Settings</h1>
            <p className="text-gray-400">Manage your store configuration</p>
          </div>

          {/* Status Bar */}
          <div className="flex items-center space-x-4 mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <span className="text-sm text-gray-400">Status:</span>
            <span className="px-3 py-1 bg-yellow-600 text-black text-sm rounded-full">ACTIVE</span>
            <span className="text-sm text-gray-400">Slug:</span>
            <span className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded">sam-1756835542914</span>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-700 mb-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-yellow-500 text-yellow-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            {renderTabContent()}
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleSaveSettings}
              className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AgentSettings;
