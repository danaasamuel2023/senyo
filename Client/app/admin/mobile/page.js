'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import adminAPI from '../../../utils/adminApi';
import {
  Smartphone, Bell, Users, ShoppingCart, Package, DollarSign, TrendingUp, TrendingDown,
  ArrowLeft, RefreshCw, Search, Filter, Eye, Edit, Settings, Activity, BarChart3,
  CheckCircle, XCircle, AlertTriangle, Clock, Target, Zap, Shield, Globe, Database
} from 'lucide-react';

const MobileAdminAppPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Mobile app data state
  const [mobileData, setMobileData] = useState({
    dashboard: {
      stats: {},
      recentActivity: [],
      quickActions: [],
      charts: {}
    },
    notifications: [],
    users: [],
    orders: [],
    inventory: [],
    transactions: [],
    analytics: {},
    settings: {},
    version: {}
  });

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Form data
  const [settingsForm, setSettingsForm] = useState({
    notifications: {
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      lowStockAlerts: true,
      paymentAlerts: true,
      userRegistrationAlerts: false
    },
    display: {
      theme: 'light',
      language: 'en',
      currency: 'GHS',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h'
    },
    security: {
      biometricAuth: true,
      autoLock: true,
      lockTimeout: 300,
      twoFactorAuth: false
    }
  });

  // Load mobile data
  const loadMobileData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboardResult, notificationsResult, usersResult, ordersResult, inventoryResult, transactionsResult, analyticsResult, settingsResult, versionResult] = await Promise.all([
        adminAPI.mobile.getDashboard(),
        adminAPI.mobile.getNotifications(),
        adminAPI.mobile.getUsers(),
        adminAPI.mobile.getOrders(),
        adminAPI.mobile.getInventory(),
        adminAPI.mobile.getTransactions(),
        adminAPI.mobile.getAnalytics(),
        adminAPI.mobile.getSettings(),
        adminAPI.mobile.getVersion()
      ]);

      setMobileData({
        dashboard: dashboardResult.data || {},
        notifications: notificationsResult.data || [],
        users: usersResult.data || [],
        orders: ordersResult.data || [],
        inventory: inventoryResult.data || [],
        transactions: transactionsResult.data || [],
        analytics: analyticsResult.data || {},
        settings: settingsResult.data || {},
        version: versionResult.data || {}
      });
    } catch (error) {
      console.error('Error loading mobile data:', error);
      showNotification('Failed to load mobile data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMobileData();
  }, [loadMobileData]);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle mark notification as read
  const handleMarkNotificationRead = async (notificationId) => {
    try {
      const result = await adminAPI.mobile.markNotificationRead(notificationId);
      if (result.success) {
        showNotification('Notification marked as read');
        loadMobileData();
      } else {
        showNotification('Failed to mark notification as read', 'error');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showNotification('Failed to mark notification as read', 'error');
    }
  };

  // Handle update settings
  const handleUpdateSettings = async () => {
    try {
      const result = await adminAPI.mobile.updateSettings(settingsForm);
      if (result.success) {
        showNotification('Settings updated successfully');
        setShowSettingsModal(false);
        loadMobileData();
      } else {
        showNotification('Failed to update settings', 'error');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      showNotification('Failed to update settings', 'error');
    }
  };

  // Handle sync data
  const handleSyncData = async () => {
    try {
      const result = await adminAPI.mobile.syncData({ data: 'mobile_sync' });
      if (result.success) {
        showNotification('Data sync completed successfully');
        loadMobileData();
      } else {
        showNotification('Data sync failed', 'error');
      }
    } catch (error) {
      console.error('Error syncing data:', error);
      showNotification('Failed to sync data', 'error');
    }
  };

  // Filter data based on active tab
  const getFilteredData = () => {
    const data = mobileData[activeTab] || [];
    if (!Array.isArray(data)) return [];
    
    return data.filter(item => {
      const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  };

  // Pagination
  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'success': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center">
                <Smartphone className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mobile Admin App</h1>
                  <p className="text-sm text-gray-500">Manage your business on the go</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSyncData}
                disabled={loading}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`p-4 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {notification.message}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile App Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{mobileData.dashboard.stats.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-900">GHS {mobileData.dashboard.stats.todayRevenue}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <ShoppingCart className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{mobileData.dashboard.stats.pendingOrders}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{mobileData.dashboard.stats.lowStockItems}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {mobileData.dashboard.quickActions && mobileData.dashboard.quickActions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mobileData.dashboard.quickActions.map((action) => (
                <button
                  key={action.id}
                  className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  <div className="text-2xl mb-2">📱</div>
                  <div className="text-sm font-medium text-gray-900">{action.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'dashboard', name: 'Dashboard', count: mobileData.dashboard.recentActivity?.length || 0 },
                { id: 'notifications', name: 'Notifications', count: mobileData.notifications.length },
                { id: 'users', name: 'Users', count: mobileData.users.length },
                { id: 'orders', name: 'Orders', count: mobileData.orders.length },
                { id: 'inventory', name: 'Inventory', count: mobileData.inventory.length },
                { id: 'transactions', name: 'Transactions', count: mobileData.transactions.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'dashboard' && (
              <div>
                {/* Recent Activity */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    {mobileData.dashboard.recentActivity?.map((activity) => (
                      <div key={activity.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                            <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(activity.priority)}`}>
                            {activity.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Charts */}
                {mobileData.dashboard.charts && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        📊 Chart placeholder - Revenue data
                      </div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        📈 Chart placeholder - User data
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input id="text-input" name="text-input" type="text"
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="read">Read</option>
                    <option value="unread">Unread</option>
                  </select>
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                  {paginatedData.map((notification) => (
                    <div key={notification.id} className={`p-4 rounded-lg border ${
                      notification.read ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{notification.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkNotificationRead(notification.id)}
                              className="text-blue-600 hover:text-blue-900 text-sm"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500">{new Date(notification.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-700">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} results
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="space-y-4">
                  {paginatedData.map((user) => (
                    <div key={user.id} className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Phone:</strong> {user.phone}</p>
                        <p><strong>Wallet:</strong> GHS {user.walletBalance}</p>
                        <p><strong>Orders:</strong> {user.totalOrders}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <div className="space-y-4">
                  {paginatedData.map((order) => (
                    <div key={order.id} className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">#{order.id}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <p><strong>Customer:</strong> {order.userName}</p>
                        <p><strong>Amount:</strong> GHS {order.totalAmount}</p>
                        <p><strong>Payment:</strong> {order.paymentMethod}</p>
                        <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div>
                <div className="space-y-4">
                  {paginatedData.map((product) => (
                    <div key={product.id} className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                          {product.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <p><strong>Provider:</strong> {product.provider}</p>
                        <p><strong>Stock:</strong> {product.stock}</p>
                        <p><strong>Price:</strong> GHS {product.price}</p>
                        <p><strong>Alert:</strong> {product.lowStockAlert ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div>
                <div className="space-y-4">
                  {paginatedData.map((transaction) => (
                    <div key={transaction.id} className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">#{transaction.id}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <p><strong>User:</strong> {transaction.userName}</p>
                        <p><strong>Amount:</strong> GHS {transaction.amount}</p>
                        <p><strong>Method:</strong> {transaction.method}</p>
                        <p><strong>Date:</strong> {new Date(transaction.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Mobile App Settings</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-6">
              {/* Notifications */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Notifications</h3>
                <div className="space-y-2">
                  {Object.entries(settingsForm.notifications).map(([key, value]) => (
                    <label key={key} className="flex items-center">
                      <input id="input" name="input" type="checkbox"
                        checked={value}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          notifications: { ...settingsForm.notifications, [key]: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Display */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Display</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                    <select
                      value={settingsForm.display.theme}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        display: { ...settingsForm.display, theme: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                    <select
                      value={settingsForm.display.language}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        display: { ...settingsForm.display, language: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Security</h3>
                <div className="space-y-2">
                  {Object.entries(settingsForm.security).map(([key, value]) => (
                    <label key={key} className="flex items-center">
                      <input id="input" name="input" type="checkbox"
                        checked={value}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          security: { ...settingsForm.security, [key]: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileAdminAppPage;
