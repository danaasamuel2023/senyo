'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Shield,
  Bell,
  Key,
  Smartphone,
  Globe,
  Palette,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Trash2,
  Plus,
  Copy,
  Check,
  AlertTriangle,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Mail,
  MessageSquare,
  Zap,
  CreditCard,
  DollarSign,
  Info,
  HelpCircle,
  LogOut,
  Edit,
  X,
  ChevronRight,
  Download,
  Upload,
  FileText,
  Clock,
  MapPin,
  Languages,
  Coins
} from 'lucide-react';

// Constants
const THEMES = [
  { id: 'light', name: 'Light', icon: Sun },
  { id: 'dark', name: 'Dark', icon: Moon },
  { id: 'auto', name: 'System', icon: Smartphone }
];

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'tw', name: 'Twi', flag: '🇬🇭' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' }
];

const CURRENCIES = [
  { code: 'GHS', name: 'Ghana Cedi', symbol: '₵' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' }
];

const NOTIFICATION_TYPES = [
  { id: 'purchases', name: 'Purchase Updates', description: 'Order confirmations and delivery status' },
  { id: 'deposits', name: 'Deposit Notifications', description: 'Wallet top-up confirmations' },
  { id: 'withdrawals', name: 'Withdrawal Updates', description: 'Withdrawal processing and completion' },
  { id: 'referrals', name: 'Referral Bonuses', description: 'Friend registration bonuses' },
  { id: 'security', name: 'Security Alerts', description: 'Login attempts and security changes' },
  { id: 'promotions', name: 'Promotions & Offers', description: 'Special deals and announcements' },
  { id: 'system', name: 'System Updates', description: 'Maintenance and system notifications' }
];

const SettingsPage = () => {
  const router = useRouter();
  
  // State management
  const [activeTab, setActiveTab] = useState('account');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [userData, setUserData] = useState(null);
  
  // Form states
  const [accountForm, setAccountForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    currency: 'GHS',
    timezone: 'Africa/Accra'
  });
  
  const [notifications, setNotifications] = useState({
    channels: {
      email: { enabled: true, frequency: 'instant' },
      sms: { enabled: false, onlyUrgent: true },
      push: { enabled: true, sound: true },
      inApp: { enabled: true }
    },
    categories: {},
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '07:00',
      timezone: 'Africa/Accra'
    }
  });
  
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginNotifications: true,
    deviceManagement: true
  });
  
  const [apiKeys, setApiKeys] = useState([]);
  const [showPasswords, setShowPasswords] = useState({});
  const [copiedStates, setCopiedStates] = useState({});

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/SignIn');
        return;
      }

      // Load user data from localStorage or API
      const storedUser = localStorage.getItem('userData');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserData(user);
        
        // Populate form with user data
        setAccountForm({
          name: user.name || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Set preferences
        if (user.preferences) {
          setPreferences(prev => ({
            ...prev,
            ...user.preferences
          }));
        }
        
        // Set notification preferences
        if (user.notificationPreferences) {
          setNotifications(prev => ({
            ...prev,
            ...user.notificationPreferences
          }));
        }
      }
      
      // Load API keys
      await loadApiKeys();
      
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadApiKeys = async () => {
    try {
      // Simulate API call - replace with actual API call
      setApiKeys([
        {
          id: '1',
          name: 'Production API',
          key: 'sk_live_xxxxxxxxxxxxxxxxxx',
          createdAt: new Date(),
          lastUsed: new Date(),
          isActive: true
        },
        {
          id: '2',
          name: 'Development API',
          key: 'sk_test_xxxxxxxxxxxxxxxxxx',
          createdAt: new Date(),
          lastUsed: null,
          isActive: false
        }
      ]);
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  };

  // Save functions
  const saveAccountSettings = async () => {
    setIsLoading(true);
    try {
      // Validate form
      if (accountForm.newPassword && accountForm.newPassword !== accountForm.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      if (accountForm.newPassword && accountForm.newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      
      // TODO: Implement API call to save account settings
      console.log('Saving account settings:', accountForm);
      
      // Update localStorage
      const updatedUser = {
        ...userData,
        name: accountForm.name,
        email: accountForm.email,
        phoneNumber: accountForm.phoneNumber
      };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      
      setSaveStatus('Account settings saved successfully!');
      
      // Clear password fields
      setAccountForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
    } catch (error) {
      setSaveStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const savePreferences = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to save preferences
      console.log('Saving preferences:', preferences);
      
      // Update localStorage
      const updatedUser = {
        ...userData,
        preferences
      };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      
      // Apply theme immediately
      document.documentElement.classList.toggle('dark', preferences.theme === 'dark');
      localStorage.setItem('app_theme', preferences.theme);
      
      setSaveStatus('Preferences saved successfully!');
    } catch (error) {
      setSaveStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const saveNotificationSettings = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to save notification settings
      console.log('Saving notification settings:', notifications);
      
      // Update localStorage
      const updatedUser = {
        ...userData,
        notificationPreferences: notifications
      };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      
      setSaveStatus('Notification settings saved successfully!');
    } catch (error) {
      setSaveStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const saveSecuritySettings = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to save security settings
      console.log('Saving security settings:', security);
      
      setSaveStatus('Security settings saved successfully!');
    } catch (error) {
      setSaveStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // API Key functions
  const generateApiKey = async () => {
    const name = prompt('Enter a name for this API key:');
    if (!name) return;
    
    try {
      // TODO: Implement API call to generate new key
      const newKey = {
        id: Date.now().toString(),
        name,
        key: `sk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`,
        createdAt: new Date(),
        lastUsed: null,
        isActive: true
      };
      
      setApiKeys(prev => [...prev, newKey]);
      setSaveStatus('API key generated successfully!');
    } catch (error) {
      setSaveStatus(`Error: ${error.message}`);
    }
  };

  const deleteApiKey = async (keyId) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }
    
    try {
      // TODO: Implement API call to delete key
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      setSaveStatus('API key deleted successfully!');
    } catch (error) {
      setSaveStatus(`Error: ${error.message}`);
    }
  };

  const toggleApiKey = async (keyId) => {
    try {
      // TODO: Implement API call to toggle key status
      setApiKeys(prev => prev.map(key => 
        key.id === keyId ? { ...key, isActive: !key.isActive } : key
      ));
      setSaveStatus('API key status updated!');
    } catch (error) {
      setSaveStatus(`Error: ${error.message}`);
    }
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'account', name: 'Account', icon: User, color: 'from-blue-500 to-blue-600' },
    { id: 'preferences', name: 'Preferences', icon: Palette, color: 'from-purple-500 to-purple-600' },
    { id: 'notifications', name: 'Notifications', icon: Bell, color: 'from-green-500 to-green-600' },
    { id: 'security', name: 'Security', icon: Shield, color: 'from-red-500 to-red-600' },
    { id: 'apikeys', name: 'API Keys', icon: Key, color: 'from-yellow-500 to-yellow-600' }
  ];

  // Component helpers
  const InputField = ({ label, type = 'text', value, onChange, placeholder, required = false, icon: Icon }) => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={18} />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent transition-all duration-300`}
        />
      </div>
    </div>
  );

  const SaveButton = ({ onClick, children }) => (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="px-6 py-3 bg-gradient-to-r from-[#FFCC08] to-yellow-500 text-black rounded-xl font-semibold hover:from-yellow-500 hover:to-[#FFCC08] transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      <span>{isLoading ? 'Saving...' : children}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-[#FFCC08] to-yellow-500 rounded-2xl">
              <SettingsIcon className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
            </div>
          </div>
          
          {/* Save Status */}
          {saveStatus && (
            <div className={`p-4 rounded-xl flex items-center space-x-2 ${
              saveStatus.startsWith('Error') 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            }`}>
              {saveStatus.startsWith('Error') ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              <span className="font-medium">{saveStatus}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#FFCC08]/10 to-yellow-500/10 text-[#FFCC08] border-l-4 border-[#FFCC08]'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-[#FFCC08]' : ''}`} />
                      <span className="font-medium">{tab.name}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto text-[#FFCC08]" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              {/* Account Settings */}
              {activeTab === 'account' && (
                <div className="p-6 space-y-6">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                      <User className="w-6 h-6 text-[#FFCC08]" />
                      <span>Account Information</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Update your personal information and password</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <InputField
                      label="Full Name"
                      value={accountForm.name}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                      required
                      icon={User}
                    />
                    
                    <InputField
                      label="Email Address"
                      type="email"
                      value={accountForm.email}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      required
                      icon={Mail}
                    />
                    
                    <InputField
                      label="Phone Number"
                      type="tel"
                      value={accountForm.phoneNumber}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="Enter your phone number"
                      required
                      icon={Smartphone}
                    />
                  </div>

                  {/* Password Change Section */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                      <Lock className="w-5 h-5 text-[#FFCC08]" />
                      <span>Change Password</span>
                    </h3>
                    
                    <div className="grid md:grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={accountForm.currentPassword}
                            onChange={(e) => setAccountForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            placeholder="Enter current password"
                            className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            New Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              value={accountForm.newPassword}
                              onChange={(e) => setAccountForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              placeholder="Enter new password"
                              className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              value={accountForm.confirmPassword}
                              onChange={(e) => setAccountForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              placeholder="Confirm new password"
                              className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <SaveButton onClick={saveAccountSettings}>
                      Save Account Settings
                    </SaveButton>
                  </div>
                </div>
              )}

              {/* Preferences */}
              {activeTab === 'preferences' && (
                <div className="p-6 space-y-6">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                      <Palette className="w-6 h-6 text-[#FFCC08]" />
                      <span>Preferences</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Customize your app experience</p>
                  </div>

                  <div className="space-y-6">
                    {/* Theme Selection */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                        <Palette className="w-5 h-5 text-[#FFCC08]" />
                        <span>Theme</span>
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {THEMES.map((theme) => {
                          const Icon = theme.icon;
                          const isSelected = preferences.theme === theme.id;
                          
                          return (
                            <button
                              key={theme.id}
                              onClick={() => setPreferences(prev => ({ ...prev, theme: theme.id }))}
                              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                isSelected
                                  ? 'border-[#FFCC08] bg-[#FFCC08]/10'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-[#FFCC08]/50'
                              }`}
                            >
                              <Icon className={`w-6 h-6 mx-auto mb-2 ${
                                isSelected ? 'text-[#FFCC08]' : 'text-gray-400'
                              }`} />
                              <span className={`text-sm font-medium ${
                                isSelected ? 'text-[#FFCC08]' : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {theme.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Language Selection */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                        <Languages className="w-5 h-5 text-[#FFCC08]" />
                        <span>Language</span>
                      </h3>
                      <div className="space-y-2">
                        {LANGUAGES.map((language) => (
                          <button
                            key={language.code}
                            onClick={() => setPreferences(prev => ({ ...prev, language: language.code }))}
                            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                              preferences.language === language.code
                                ? 'bg-[#FFCC08]/10 border-2 border-[#FFCC08]'
                                : 'bg-gray-50 dark:bg-gray-700 hover:bg-[#FFCC08]/5'
                            }`}
                          >
                            <span className="text-2xl">{language.flag}</span>
                            <span className="font-medium text-gray-900 dark:text-white">{language.name}</span>
                            {preferences.language === language.code && (
                              <Check className="w-5 h-5 text-[#FFCC08] ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Currency Selection */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                        <Coins className="w-5 h-5 text-[#FFCC08]" />
                        <span>Currency</span>
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {CURRENCIES.map((currency) => (
                          <button
                            key={currency.code}
                            onClick={() => setPreferences(prev => ({ ...prev, currency: currency.code }))}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                              preferences.currency === currency.code
                                ? 'border-[#FFCC08] bg-[#FFCC08]/10'
                                : 'border-gray-200 dark:border-gray-700 hover:border-[#FFCC08]/50'
                            }`}
                          >
                            <div className="text-center">
                              <div className={`text-2xl font-bold mb-1 ${
                                preferences.currency === currency.code ? 'text-[#FFCC08]' : 'text-gray-400'
                              }`}>
                                {currency.symbol}
                              </div>
                              <div className={`text-sm font-medium ${
                                preferences.currency === currency.code ? 'text-[#FFCC08]' : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {currency.name}
                              </div>
                              <div className={`text-xs ${
                                preferences.currency === currency.code ? 'text-[#FFCC08]/70' : 'text-gray-400'
                              }`}>
                                {currency.code}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Timezone */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-[#FFCC08]" />
                        <span>Timezone</span>
                      </h3>
                      <select
                        value={preferences.timezone}
                        onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
                      >
                        <option value="Africa/Accra">Ghana (GMT)</option>
                        <option value="Africa/Lagos">Nigeria (WAT)</option>
                        <option value="Europe/London">London (GMT/BST)</option>
                        <option value="America/New_York">New York (EST/EDT)</option>
                        <option value="Europe/Paris">Paris (CET/CEST)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <SaveButton onClick={savePreferences}>
                      Save Preferences
                    </SaveButton>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="p-6 space-y-6">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                      <Bell className="w-6 h-6 text-[#FFCC08]" />
                      <span>Notifications</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage how and when you receive notifications</p>
                  </div>

                  <div className="space-y-6">
                    {/* Notification Channels */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                        <MessageSquare className="w-5 h-5 text-[#FFCC08]" />
                        <span>Notification Channels</span>
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Email Notifications */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Mail className="w-5 h-5 text-[#FFCC08]" />
                              <span className="font-semibold text-gray-900 dark:text-white">Email Notifications</span>
                            </div>
                            <button
                              onClick={() => setNotifications(prev => ({
                                ...prev,
                                channels: {
                                  ...prev.channels,
                                  email: { ...prev.channels.email, enabled: !prev.channels.email.enabled }
                                }
                              }))}
                              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                                notifications.channels.email.enabled ? 'bg-[#FFCC08]' : 'bg-gray-300'
                              }`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                                notifications.channels.email.enabled ? 'translate-x-7' : 'translate-x-1'
                              }`} />
                            </button>
                          </div>
                          
                          {notifications.channels.email.enabled && (
                            <div className="ml-8">
                              <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Frequency</label>
                              <select
                                value={notifications.channels.email.frequency}
                                onChange={(e) => setNotifications(prev => ({
                                  ...prev,
                                  channels: {
                                    ...prev.channels,
                                    email: { ...prev.channels.email, frequency: e.target.value }
                                  }
                                }))}
                                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                              >
                                <option value="instant">Instant</option>
                                <option value="daily">Daily Digest</option>
                                <option value="weekly">Weekly Summary</option>
                              </select>
                            </div>
                          )}
                        </div>

                        {/* Push Notifications */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Smartphone className="w-5 h-5 text-[#FFCC08]" />
                              <span className="font-semibold text-gray-900 dark:text-white">Push Notifications</span>
                            </div>
                            <button
                              onClick={() => setNotifications(prev => ({
                                ...prev,
                                channels: {
                                  ...prev.channels,
                                  push: { ...prev.channels.push, enabled: !prev.channels.push.enabled }
                                }
                              }))}
                              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                                notifications.channels.push.enabled ? 'bg-[#FFCC08]' : 'bg-gray-300'
                              }`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                                notifications.channels.push.enabled ? 'translate-x-7' : 'translate-x-1'
                              }`} />
                            </button>
                          </div>
                          
                          {notifications.channels.push.enabled && (
                            <div className="ml-8 flex items-center space-x-4">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={notifications.channels.push.sound}
                                  onChange={(e) => setNotifications(prev => ({
                                    ...prev,
                                    channels: {
                                      ...prev.channels,
                                      push: { ...prev.channels.push, sound: e.target.checked }
                                    }
                                  }))}
                                  className="w-4 h-4 text-[#FFCC08] border-gray-300 rounded focus:ring-[#FFCC08]"
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Enable Sound</span>
                              </label>
                            </div>
                          )}
                        </div>

                        {/* SMS Notifications */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <MessageSquare className="w-5 h-5 text-[#FFCC08]" />
                              <span className="font-semibold text-gray-900 dark:text-white">SMS Notifications</span>
                            </div>
                            <button
                              onClick={() => setNotifications(prev => ({
                                ...prev,
                                channels: {
                                  ...prev.channels,
                                  sms: { ...prev.channels.sms, enabled: !prev.channels.sms.enabled }
                                }
                              }))}
                              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                                notifications.channels.sms.enabled ? 'bg-[#FFCC08]' : 'bg-gray-300'
                              }`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                                notifications.channels.sms.enabled ? 'translate-x-7' : 'translate-x-1'
                              }`} />
                            </button>
                          </div>
                          
                          {notifications.channels.sms.enabled && (
                            <div className="ml-8">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={notifications.channels.sms.onlyUrgent}
                                  onChange={(e) => setNotifications(prev => ({
                                    ...prev,
                                    channels: {
                                      ...prev.channels,
                                      sms: { ...prev.channels.sms, onlyUrgent: e.target.checked }
                                    }
                                  }))}
                                  className="w-4 h-4 text-[#FFCC08] border-gray-300 rounded focus:ring-[#FFCC08]"
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Only urgent notifications</span>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Notification Categories */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                        <Bell className="w-5 h-5 text-[#FFCC08]" />
                        <span>Notification Types</span>
                      </h3>
                      
                      <div className="space-y-3">
                        {NOTIFICATION_TYPES.map((type) => {
                          const isEnabled = notifications.categories[type.id] !== false;
                          
                          return (
                            <div key={type.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-white">{type.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{type.description}</p>
                              </div>
                              <button
                                onClick={() => setNotifications(prev => ({
                                  ...prev,
                                  categories: {
                                    ...prev.categories,
                                    [type.id]: !isEnabled
                                  }
                                }))}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                                  isEnabled ? 'bg-[#FFCC08]' : 'bg-gray-300'
                                }`}
                              >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                                  isEnabled ? 'translate-x-7' : 'translate-x-1'
                                }`} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quiet Hours */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-[#FFCC08]" />
                        <span>Quiet Hours</span>
                      </h3>
                      
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-medium text-gray-900 dark:text-white">Enable Quiet Hours</span>
                          <button
                            onClick={() => setNotifications(prev => ({
                              ...prev,
                              quietHours: { ...prev.quietHours, enabled: !prev.quietHours.enabled }
                            }))}
                            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                              notifications.quietHours.enabled ? 'bg-[#FFCC08]' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                              notifications.quietHours.enabled ? 'translate-x-7' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                        
                        {notifications.quietHours.enabled && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Time</label>
                              <input
                                type="time"
                                value={notifications.quietHours.startTime}
                                onChange={(e) => setNotifications(prev => ({
                                  ...prev,
                                  quietHours: { ...prev.quietHours, startTime: e.target.value }
                                }))}
                                className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Time</label>
                              <input
                                type="time"
                                value={notifications.quietHours.endTime}
                                onChange={(e) => setNotifications(prev => ({
                                  ...prev,
                                  quietHours: { ...prev.quietHours, endTime: e.target.value }
                                }))}
                                className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <SaveButton onClick={saveNotificationSettings}>
                      Save Notification Settings
                    </SaveButton>
                  </div>
                </div>
              )}

              {/* Security */}
              {activeTab === 'security' && (
                <div className="p-6 space-y-6">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                      <Shield className="w-6 h-6 text-[#FFCC08]" />
                      <span>Security</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account security settings</p>
                  </div>

                  <div className="space-y-6">
                    {/* Two-Factor Authentication */}
                    <div className="p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                            <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSecurity(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            security.twoFactorEnabled
                              ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
                              : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30'
                          }`}
                        >
                          {security.twoFactorEnabled ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                      
                      {security.twoFactorEnabled && (
                        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg">
                          <div className="flex items-center space-x-2 text-green-700 dark:text-green-400">
                            <Check className="w-5 h-5" />
                            <span className="font-medium">Two-Factor Authentication is enabled</span>
                          </div>
                          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                            Your account is protected with 2FA. You'll need to enter a verification code when signing in.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Session Settings */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-[#FFCC08]" />
                        <span>Session Management</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">Session Timeout</span>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically log out after inactivity</p>
                          </div>
                          <select
                            value={security.sessionTimeout}
                            onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg"
                          >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={240}>4 hours</option>
                            <option value={480}>8 hours</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">Login Notifications</span>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Get notified of new login attempts</p>
                          </div>
                          <button
                            onClick={() => setSecurity(prev => ({ ...prev, loginNotifications: !prev.loginNotifications }))}
                            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                              security.loginNotifications ? 'bg-[#FFCC08]' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                              security.loginNotifications ? 'translate-x-7' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Device Management */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                        <Smartphone className="w-5 h-5 text-[#FFCC08]" />
                        <span>Trusted Devices</span>
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                              <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">Current Device</span>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Chrome on Windows • Last used: Now</p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                            Active
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                              <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">iPhone 13</span>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Safari • Last used: 2 days ago</p>
                            </div>
                          </div>
                          <button className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors">
                            Revoke
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <SaveButton onClick={saveSecuritySettings}>
                      Save Security Settings
                    </SaveButton>
                  </div>
                </div>
              )}

              {/* API Keys */}
              {activeTab === 'apikeys' && (
                <div className="p-6 space-y-6">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                        <Key className="w-6 h-6 text-[#FFCC08]" />
                        <span>API Keys</span>
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your API keys for third-party integrations</p>
                    </div>
                    <button
                      onClick={generateApiKey}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#FFCC08] to-yellow-500 text-black rounded-xl font-medium hover:from-yellow-500 hover:to-[#FFCC08] transition-all duration-300"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Generate New Key</span>
                    </button>
                  </div>

                  {apiKeys.length === 0 ? (
                    <div className="text-center py-12">
                      <Key className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No API Keys</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first API key to get started with our API</p>
                      <button
                        onClick={generateApiKey}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#FFCC08] to-yellow-500 text-black rounded-xl font-medium hover:from-yellow-500 hover:to-[#FFCC08] transition-all duration-300"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Generate API Key</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {apiKeys.map((apiKey) => (
                        <div key={apiKey.id} className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{apiKey.name}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                                {apiKey.lastUsed && (
                                  <span>Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                apiKey.isActive 
                                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                  : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                              }`}>
                                {apiKey.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API Key</label>
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg font-mono text-sm">
                                  {showPasswords[apiKey.id] ? apiKey.key : '•'.repeat(40)}
                                </div>
                                <button
                                  onClick={() => setShowPasswords(prev => ({ ...prev, [apiKey.id]: !prev[apiKey.id] }))}
                                  className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                  title={showPasswords[apiKey.id] ? 'Hide' : 'Show'}
                                >
                                  {showPasswords[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => copyToClipboard(apiKey.key, `copy-${apiKey.id}`)}
                                  className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                  title="Copy to clipboard"
                                >
                                  {copiedStates[`copy-${apiKey.id}`] ? 
                                    <Check className="w-4 h-4 text-green-500" /> : 
                                    <Copy className="w-4 h-4" />
                                  }
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 pt-2">
                              <button
                                onClick={() => toggleApiKey(apiKey.id)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                  apiKey.isActive
                                    ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
                                    : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30'
                                }`}
                              >
                                {apiKey.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => deleteApiKey(apiKey.id)}
                                className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors flex items-center space-x-1"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* API Documentation Link */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                    <div className="flex items-start space-x-3">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">API Documentation</h3>
                        <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">
                          Learn how to integrate with our API and use your API keys effectively.
                        </p>
                        <button
                          onClick={() => router.push('/api-doc')}
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          <span>View Documentation</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
