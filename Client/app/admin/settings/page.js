'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import adminAPI from '../../../utils/adminApi';
import {
  Settings, Save, ArrowLeft, RefreshCw, CheckCircle, AlertCircle, X,
  DollarSign, Wallet, TrendingUp, TrendingDown, Package, Wifi,
  Database, Code, Globe, Shield, Bell, Mail, Key, Server,
  Plus, Trash2, Edit, Eye, EyeOff, Copy, Zap, Activity
} from 'lucide-react';

const AdminSettingsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeSection, setActiveSection] = useState('wallet');
  
  // Wallet Management State
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletReason, setWalletReason] = useState('');
  
  // API Management State
  const [inventory, setInventory] = useState([]);
  
  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    agentRegistrationEnabled: true,
    minimumDeposit: 5,
    maximumDeposit: 10000,
    referralBonus: 5
  });

  // Payment Gateway Settings State
  const [paymentGatewaySettings, setPaymentGatewaySettings] = useState({
    activeGateway: 'paystack', // 'paystack' or 'bulkclix'
    paystackEnabled: true,
    bulkclixEnabled: false,
    paystackPublicKey: '',
    paystackSecretKey: '',
    bulkclixApiKey: '',
    autoSwitch: false,
    fallbackGateway: 'paystack'
  });

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!token || user.role !== 'admin') {
      router.push('/SignIn');
      return false;
    }
    return true;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, inventoryData] = await Promise.all([
        adminAPI.user.getUsers(1, 1000),
        adminAPI.inventory.getInventory()
      ]);
      
      setUsers(usersData.users || []);
      setInventory(inventoryData.inventory || []);
      
      // Load payment gateway settings
      await loadPaymentGatewaySettings();
    } catch (error) {
      console.error('Failed to load data:', error);
      showNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentGatewaySettings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/admin/payment-gateway-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setPaymentGatewaySettings(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to load payment gateway settings:', error);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAddMoney = async () => {
    if (!selectedUserId || !walletAmount) {
      showNotification('Please select user and enter amount', 'error');
      return;
    }

    setSaving(true);
    try {
      await adminAPI.user.addMoney(selectedUserId, parseFloat(walletAmount));
      showNotification(`Successfully added GHS ${walletAmount}`, 'success');
      setWalletAmount('');
      setSelectedUserId('');
      loadData();
    } catch (error) {
      console.error('Failed to add money:', error);
      showNotification('Failed to add money', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeductMoney = async () => {
    if (!selectedUserId || !walletAmount || !walletReason) {
      showNotification('Please fill all fields', 'error');
      return;
    }

    if (!confirm(`Deduct GHS ${walletAmount} from user's wallet?`)) return;

    setSaving(true);
    try {
      await adminAPI.user.deductMoney(selectedUserId, parseFloat(walletAmount), walletReason);
      showNotification(`Successfully deducted GHS ${walletAmount}`, 'success');
      setWalletAmount('');
      setWalletReason('');
      setSelectedUserId('');
      loadData();
    } catch (error) {
      console.error('Failed to deduct money:', error);
      showNotification('Failed to deduct money', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStock = async (network) => {
    try {
      await adminAPI.inventory.toggleNetworkStock(network);
      showNotification(`${network} stock status updated`, 'success');
      loadData();
    } catch (error) {
      console.error('Failed to toggle stock:', error);
      showNotification('Failed to update stock', 'error');
    }
  };

  const handleToggleAPI = async (network) => {
    try {
      await adminAPI.inventory.toggleGeonettech(network);
      showNotification(`${network} API status updated`, 'success');
      loadData();
    } catch (error) {
      console.error('Failed to toggle API:', error);
      showNotification('Failed to update API', 'error');
    }
  };

  const sections = [
    { id: 'wallet', label: 'Wallet Management', icon: Wallet },
    { id: 'api', label: 'API Management', icon: Code },
    { id: 'inventory', label: 'Stock Management', icon: Package },
    { id: 'payment-gateway', label: 'Payment Gateway', icon: DollarSign },
    { id: 'system', label: 'System Settings', icon: Server }
  ];

  const renderWalletManagement = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet Management</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Money */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Funds</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select User
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Choose user...</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} - {user.email} (GHS {user.walletBalance})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (GHS)
              </label>
              <input
                type="number"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <button
              onClick={handleAddMoney}
              disabled={saving || !selectedUserId || !walletAmount}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <TrendingUp className="w-5 h-5" />
              <span>{saving ? 'Processing...' : 'Add Funds'}</span>
            </button>
          </div>
        </div>

        {/* Deduct Money */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-2 border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/20">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Deduct Funds</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select User
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Choose user...</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} - {user.email} (GHS {user.walletBalance})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (GHS)
              </label>
              <input
                type="number"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason
              </label>
              <input
                type="text"
                value={walletReason}
                onChange={(e) => setWalletReason(e.target.value)}
                placeholder="Reason for deduction"
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              onClick={handleDeductMoney}
              disabled={saving || !selectedUserId || !walletAmount || !walletReason}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-bold disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <TrendingDown className="w-5 h-5" />
              <span>{saving ? 'Processing...' : 'Deduct Funds'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAPIManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">API Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Control API integrations for each network</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map((item) => (
          <div key={item.network} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-2 border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{item.network}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Network Provider</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Stock Status</span>
                <button
                  onClick={() => handleToggleStock(item.network)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    item.inStock
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {item.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">API Integration</span>
                <button
                  onClick={() => handleToggleAPI(item.network)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    !item.skipGeonettech
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-500 text-white hover:bg-gray-600'
                  }`}
                >
                  {!item.skipGeonettech ? 'API ACTIVE' : 'API DISABLED'}
                </button>
              </div>

              <div className="pt-2 text-xs text-gray-500 dark:text-gray-400">
                {item.updatedAt && `Last updated: ${new Date(item.updatedAt).toLocaleString()}`}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">API Integration Info</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              • <strong>API Active</strong>: Orders are processed automatically through the API
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              • <strong>API Disabled</strong>: Orders are marked as pending for manual processing
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              • <strong>Out of Stock</strong>: Customers cannot place orders for this network
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInventoryManagement = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Stock Management</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Network</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Stock Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">API Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Last Updated</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.network} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Wifi className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{item.network}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      item.inStock
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {item.inStock ? '● IN STOCK' : '● OUT OF STOCK'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      !item.skipGeonettech
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {!item.skipGeonettech ? '● API ACTIVE' : '● API DISABLED'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                    {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'Never'}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleStock(item.network)}
                        className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 rounded-lg text-xs font-medium transition-colors"
                      >
                        Toggle Stock
                      </button>
                      <button
                        onClick={() => handleToggleAPI(item.network)}
                        className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg text-xs font-medium transition-colors"
                      >
                        Toggle API
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h3>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-xl cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Maintenance Mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Disable customer access temporarily</p>
              </div>
              <input
                type="checkbox"
                checked={systemSettings.maintenanceMode}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                className="w-5 h-5 text-[#FFCC08] focus:ring-[#FFCC08] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-xl cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">User Registration</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Allow new user signups</p>
              </div>
              <input
                type="checkbox"
                checked={systemSettings.registrationEnabled}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, registrationEnabled: e.target.checked }))}
                className="w-5 h-5 text-[#FFCC08] focus:ring-[#FFCC08] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-xl cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Agent Registration</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Allow new agent applications</p>
              </div>
              <input
                type="checkbox"
                checked={systemSettings.agentRegistrationEnabled}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, agentRegistrationEnabled: e.target.checked }))}
                className="w-5 h-5 text-[#FFCC08] focus:ring-[#FFCC08] rounded"
              />
            </label>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Limits</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Deposit (GHS)
              </label>
              <input
                type="number"
                value={systemSettings.minimumDeposit}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, minimumDeposit: parseFloat(e.target.value) }))}
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum Deposit (GHS)
              </label>
              <input
                type="number"
                value={systemSettings.maximumDeposit}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, maximumDeposit: parseFloat(e.target.value) }))}
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Referral Bonus (GHS)
              </label>
              <input
                type="number"
                value={systemSettings.referralBonus}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, referralBonus: parseFloat(e.target.value) }))}
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
              />
            </div>

            <button
              onClick={() => {
                showNotification('System settings saved', 'success');
              }}
              className="w-full px-6 py-3 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-colors font-bold flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentGatewaySettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Gateway Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Gateway Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Gateway</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Paystack</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Card payments, Mobile Money</p>
                </div>
              </div>
              <input
                type="radio"
                name="activeGateway"
                value="paystack"
                checked={paymentGatewaySettings.activeGateway === 'paystack'}
                onChange={(e) => setPaymentGatewaySettings(prev => ({ ...prev, activeGateway: e.target.value }))}
                className="w-5 h-5 text-[#FFCC08] focus:ring-[#FFCC08]"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">BulkClix</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Bank transfers, Mobile Money</p>
                </div>
              </div>
              <input
                type="radio"
                name="activeGateway"
                value="bulkclix"
                checked={paymentGatewaySettings.activeGateway === 'bulkclix'}
                onChange={(e) => setPaymentGatewaySettings(prev => ({ ...prev, activeGateway: e.target.value }))}
                className="w-5 h-5 text-[#FFCC08] focus:ring-[#FFCC08]"
              />
            </div>
          </div>

          {/* Gateway Status */}
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Status:</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  paymentGatewaySettings.activeGateway === 'paystack' ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>
                <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                  {paymentGatewaySettings.activeGateway}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gateway Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gateway Configuration</h3>
          
          <div className="space-y-4">
            {/* Paystack Settings */}
            <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-xl">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Paystack Settings</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Public Key
                  </label>
                  <input
                    type="text"
                    value={paymentGatewaySettings.paystackPublicKey}
                    onChange={(e) => setPaymentGatewaySettings(prev => ({ ...prev, paystackPublicKey: e.target.value }))}
                    placeholder="pk_live_..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Secret Key
                  </label>
                  <input
                    type="password"
                    value={paymentGatewaySettings.paystackSecretKey}
                    onChange={(e) => setPaymentGatewaySettings(prev => ({ ...prev, paystackSecretKey: e.target.value }))}
                    placeholder="sk_live_..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* BulkClix Settings */}
            <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-xl">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">BulkClix Settings</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={paymentGatewaySettings.bulkclixApiKey}
                    onChange={(e) => setPaymentGatewaySettings(prev => ({ ...prev, bulkclixApiKey: e.target.value }))}
                    placeholder="OUxANRH1feWp232T70JyJZpO1PXldZouNqQT8iJa"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Advanced Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-xl cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Auto Switch</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Automatically switch to fallback gateway on failure</p>
              </div>
              <input
                type="checkbox"
                checked={paymentGatewaySettings.autoSwitch}
                onChange={(e) => setPaymentGatewaySettings(prev => ({ ...prev, autoSwitch: e.target.checked }))}
                className="w-5 h-5 text-[#FFCC08] focus:ring-[#FFCC08] rounded"
              />
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fallback Gateway
              </label>
              <select
                value={paymentGatewaySettings.fallbackGateway}
                onChange={(e) => setPaymentGatewaySettings(prev => ({ ...prev, fallbackGateway: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="paystack">Paystack</option>
                <option value="bulkclix">BulkClix</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-xl cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Paystack Enabled</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enable Paystack gateway</p>
              </div>
              <input
                type="checkbox"
                checked={paymentGatewaySettings.paystackEnabled}
                onChange={(e) => setPaymentGatewaySettings(prev => ({ ...prev, paystackEnabled: e.target.checked }))}
                className="w-5 h-5 text-[#FFCC08] focus:ring-[#FFCC08] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-xl cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">BulkClix Enabled</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enable BulkClix gateway</p>
              </div>
              <input
                type="checkbox"
                checked={paymentGatewaySettings.bulkclixEnabled}
                onChange={(e) => setPaymentGatewaySettings(prev => ({ ...prev, bulkclixEnabled: e.target.checked }))}
                className="w-5 h-5 text-[#FFCC08] focus:ring-[#FFCC08] rounded"
              />
            </label>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={async () => {
              setSaving(true);
              try {
                const token = localStorage.getItem('authToken');
                const response = await fetch('/api/v1/admin/payment-gateway-settings', {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(paymentGatewaySettings)
                });

                if (response.ok) {
                  const result = await response.json();
                  if (result.success) {
                    showNotification('Payment gateway settings saved', 'success');
                    setPaymentGatewaySettings(result.data);
                  } else {
                    showNotification(result.error || 'Failed to save settings', 'error');
                  }
                } else {
                  showNotification('Failed to save settings', 'error');
                }
              } catch (error) {
                console.error('Save payment gateway settings error:', error);
                showNotification('Failed to save settings', 'error');
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
            className="w-full px-6 py-3 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-colors font-bold flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Gateway Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );

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
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage system configuration and controls</p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-[#FFCC08] text-black font-bold'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div>
        {activeSection === 'wallet' && renderWalletManagement()}
        {activeSection === 'api' && renderAPIManagement()}
        {activeSection === 'inventory' && renderInventoryManagement()}
        {activeSection === 'payment-gateway' && renderPaymentGatewaySettings()}
        {activeSection === 'system' && renderSystemSettings()}
      </div>
    </div>
  );
};

export default AdminSettingsPage;
