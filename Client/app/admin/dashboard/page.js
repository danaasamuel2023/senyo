'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, BarChart3, Package, Clock, CreditCard, FileText, Settings, Search, Calendar, DollarSign, Users, TrendingUp, LogOut, Sun, Moon, Menu, X, ChevronRight, AlertCircle, CheckCircle, RefreshCw, Plus, Filter, Download, Upload, Edit, Trash2, Eye, Database, Shield, Activity, PieChart, ArrowUp, ArrowDown, Bell, HelpCircle, Save, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  // Global States
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [currentDate, setCurrentDate] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [authToken, setAuthToken] = useState('');

  // API Configuration
  const API_BASE_URL = 'https://unlimitedata.onrender.com';

  // Initialize component
  useEffect(() => {
    const date = new Date().toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric' 
    });
    setCurrentDate(date);
    
    // Get auth token from localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    }
    
    fetchBalance();
  }, []);

  // Notification System
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // API Helper Functions
  const apiRequest = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : '',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return { success: false, error: error.message };
    }
  };

  // Fetch Balance
  const fetchBalance = async () => {
    const result = await apiRequest('/api/balance');
    if (result.success && result.data) {
      setBalance(result.data.balance || 0);
    }
  };

  // Navigation Items
  const navigationItems = [
    { id: 'users', label: 'User Management', icon: User },
    { id: 'analytics', label: 'Business Analytics', icon: BarChart3 },
    { id: 'orders', label: 'All Orders', icon: Package },
    { id: 'order-mgmt', label: 'Order Management', icon: Clock },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'inventory', label: 'Inventory', icon: Database },
    { id: 'transfers', label: 'Transfers', icon: CreditCard }
  ];

  // User Management Component
  const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      role: 'user',
      status: 'active'
    });

    useEffect(() => {
      fetchUsers();
    }, []);

    const fetchUsers = async () => {
      setLoading(true);
      const result = await apiRequest('/api/users');
      if (result.success) {
        setUsers(Array.isArray(result.data) ? result.data : result.data.users || []);
      } else {
        showNotification('Failed to fetch users', 'error');
      }
      setLoading(false);
    };

    const handleAddUser = async (e) => {
      e.preventDefault();
      setLoading(true);
      const result = await apiRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      if (result.success) {
        showNotification('User added successfully');
        fetchUsers();
        setShowAddModal(false);
        setFormData({ name: '', email: '', role: 'user', status: 'active' });
      } else {
        showNotification('Failed to add user', 'error');
      }
      setLoading(false);
    };

    const handleUpdateUser = async (e) => {
      e.preventDefault();
      setLoading(true);
      const result = await apiRequest(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      
      if (result.success) {
        showNotification('User updated successfully');
        fetchUsers();
        setShowEditModal(false);
        setSelectedUser(null);
      } else {
        showNotification('Failed to update user', 'error');
      }
      setLoading(false);
    };

    const handleDeleteUser = async (userId) => {
      if (!confirm('Are you sure you want to delete this user?')) return;
      
      setLoading(true);
      const result = await apiRequest(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (result.success) {
        showNotification('User deleted successfully');
        fetchUsers();
      } else {
        showNotification('Failed to delete user', 'error');
      }
      setLoading(false);
    };

    const filteredUsers = users.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            User Management
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus size={18} />
            <span>Add User</span>
          </button>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <button
              onClick={fetchUsers}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ID</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Name</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Role</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8">
                        <Users className="mx-auto mb-4 opacity-50" size={48} />
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                          No users found. Add your first user to get started.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <td className={`py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {user.id}
                        </td>
                        <td className={`py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {user.name}
                        </td>
                        <td className={`py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {user.email}
                        </td>
                        <td className={`py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {user.role}
                          </span>
                        </td>
                        <td className={`py-3 px-4`}>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : user.status === 'inactive'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setFormData(user);
                                setShowEditModal(true);
                              }}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Edit size={16} className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Add New User
              </h3>
              <form onSubmit={handleAddUser}>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    {loading ? 'Adding...' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Edit User
              </h3>
              <form onSubmit={handleUpdateUser}>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    {loading ? 'Updating...' : 'Update User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Business Analytics Component
  const BusinessAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState({
      revenue: 0,
      orders: 0,
      customers: 0,
      growth: 0
    });
    const [period, setPeriod] = useState('7days');

    useEffect(() => {
      fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
      setLoading(true);
      const result = await apiRequest(`/api/analytics?period=${period}`);
      if (result.success) {
        setAnalyticsData({
          revenue: result.data.revenue || 0,
          orders: result.data.orders || 0,
          customers: result.data.customers || 0,
          growth: result.data.growth || 0
        });
      }
      setLoading(false);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Business Analytics
          </h2>
          <div className="flex space-x-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className={`px-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
              }`}
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="3months">Last 3 months</option>
              <option value="year">Last year</option>
            </select>
            <button
              onClick={fetchAnalytics}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading analytics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
              <div className="flex items-center justify-between mb-4">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total Revenue</span>
                <DollarSign className="text-green-500" size={24} />
              </div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                GHS {analyticsData.revenue.toFixed(2)}
              </div>
              <div className="flex items-center mt-2 text-green-500 text-sm">
                <ArrowUp size={16} />
                <span>12% from last period</span>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
              <div className="flex items-center justify-between mb-4">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total Orders</span>
                <Package className="text-blue-500" size={24} />
              </div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {analyticsData.orders}
              </div>
              <div className="flex items-center mt-2 text-blue-500 text-sm">
                <ArrowUp size={16} />
                <span>8% from last period</span>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
              <div className="flex items-center justify-between mb-4">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Customers</span>
                <Users className="text-purple-500" size={24} />
              </div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {analyticsData.customers}
              </div>
              <div className="flex items-center mt-2 text-purple-500 text-sm">
                <ArrowUp size={16} />
                <span>5% from last period</span>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
              <div className="flex items-center justify-between mb-4">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Growth Rate</span>
                <TrendingUp className="text-orange-500" size={24} />
              </div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {analyticsData.growth}%
              </div>
              <div className="flex items-center mt-2 text-orange-500 text-sm">
                <ArrowUp size={16} />
                <span>Positive trend</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // All Orders Component  
  const AllOrders = () => {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderForm, setOrderForm] = useState({
      customer: '',
      amount: '',
      status: 'pending',
      items: []
    });

    useEffect(() => {
      fetchOrders();
    }, []);

    const fetchOrders = async () => {
      setLoading(true);
      const result = await apiRequest('/api/orders');
      if (result.success) {
        setOrders(Array.isArray(result.data) ? result.data : result.data.orders || []);
      } else {
        showNotification('Failed to fetch orders', 'error');
      }
      setLoading(false);
    };

    const handleCreateOrder = async (e) => {
      e.preventDefault();
      setLoading(true);
      const result = await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderForm)
      });
      
      if (result.success) {
        showNotification('Order created successfully');
        fetchOrders();
        setShowOrderModal(false);
        setOrderForm({ customer: '', amount: '', status: 'pending', items: [] });
      } else {
        showNotification('Failed to create order', 'error');
      }
      setLoading(false);
    };

    const handleUpdateOrderStatus = async (orderId, status) => {
      setLoading(true);
      const result = await apiRequest(`/api/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      
      if (result.success) {
        showNotification('Order status updated successfully');
        fetchOrders();
      } else {
        showNotification('Failed to update order status', 'error');
      }
      setLoading(false);
    };

    const handleDeleteOrder = async (orderId) => {
      if (!confirm('Are you sure you want to delete this order?')) return;
      
      setLoading(true);
      const result = await apiRequest(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });
      
      if (result.success) {
        showNotification('Order deleted successfully');
        fetchOrders();
      } else {
        showNotification('Failed to delete order', 'error');
      }
      setLoading(false);
    };

    const filteredOrders = orders.filter(order => {
      const matchesSearch = order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.id?.toString().includes(searchTerm);
      const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            All Orders
          </h2>
          <button
            onClick={() => setShowOrderModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus size={18} />
            <span>New Order</span>
          </button>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search orders by ID, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={fetchOrders}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading orders...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Order ID</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Customer</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Amount</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8">
                        <Package className="mx-auto mb-4 opacity-50" size={48} />
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                          No orders found. Create your first order to get started.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <td className={`py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          #{order.id}
                        </td>
                        <td className={`py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {order.customer}
                        </td>
                        <td className={`py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className={`py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          GHS {order.amount?.toFixed(2)}
                        </td>
                        <td className={`py-3 px-4`}>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className={`px-2 py-1 rounded text-xs ${
                              order.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'processing'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                // View order details
                              }}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Eye size={16} className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Order Modal */}
        {showOrderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Create New Order
              </h3>
              <form onSubmit={handleCreateOrder}>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Customer Name
                    </label>
                    <input
                      type="text"
                      required
                      value={orderForm.customer}
                      onChange={(e) => setOrderForm({...orderForm, customer: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Amount (GHS)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={orderForm.amount}
                      onChange={(e) => setOrderForm({...orderForm, amount: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </label>
                    <select
                      value={orderForm.status}
                      onChange={(e) => setOrderForm({...orderForm, status: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    {loading ? 'Creating...' : 'Create Order'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Transfers Component with full functionality
  const Transfers = () => {
    const [transfers, setTransfers] = useState([]);
    const [todayStats, setTodayStats] = useState({
      total: 0,
      amount: 0,
      workers: 0
    });
    const [activeSection, setActiveSection] = useState('today');
    const [paymentForm, setPaymentForm] = useState({
      recipient: '',
      amount: '',
      method: 'mobile_money',
      description: ''
    });

    useEffect(() => {
      fetchTransfers();
    }, []);

    const fetchTransfers = async () => {
      setLoading(true);
      const result = await apiRequest('/api/transfers');
      if (result.success) {
        if (Array.isArray(result.data)) {
          setTransfers(result.data);
        } else {
          setTransfers(result.data.transfers || []);
          if (result.data.stats) {
            setTodayStats({
              total: result.data.stats.total || 0,
              amount: result.data.stats.amount || 0,
              workers: result.data.stats.workers || 0
            });
          }
        }
      }
      setLoading(false);
    };

    const handleProcessPayment = async (e) => {
      e.preventDefault();
      setLoading(true);
      
      const result = await apiRequest('/api/transfers', {
        method: 'POST',
        body: JSON.stringify(paymentForm)
      });
      
      if (result.success) {
        showNotification('Payment processed successfully');
        setPaymentForm({ recipient: '', amount: '', method: 'mobile_money', description: '' });
        fetchTransfers();
        fetchBalance(); // Update balance after payment
      } else {
        showNotification('Failed to process payment', 'error');
      }
      setLoading(false);
    };

    const transferSections = [
      { id: 'process', label: 'Process Payment', icon: DollarSign },
      { id: 'today', label: "Today's Transfers", icon: Calendar },
      { id: 'search', label: 'Search', icon: Search },
      { id: 'reports', label: 'Reports', icon: FileText }
    ];

    return (
      <div className="flex">
        <aside className={`w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} h-full`}>
          <div className="p-6">
            <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Transfer Management
            </h2>
            <div className="space-y-2">
              {transferSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-500 text-white'
                        : darkMode
                          ? 'hover:bg-gray-700 text-gray-300'
                          : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{section.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="flex-1 p-6">
          {activeSection === 'today' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Today's Transfers - {currentDate}
                </h2>
                <button
                  onClick={fetchTransfers}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <RefreshCw size={18} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-500 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-blue-100">Total Transfers</span>
                    <TrendingUp className="text-blue-200" size={24} />
                  </div>
                  <div className="text-4xl font-bold">{todayStats.total}</div>
                </div>

                <div className="bg-green-500 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-green-100">Total Amount</span>
                    <TrendingUp className="text-green-200" size={24} />
                  </div>
                  <div className="text-4xl font-bold">GHS {todayStats.amount.toFixed(2)}</div>
                </div>

                <div className="bg-purple-500 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-purple-100">Active Workers</span>
                    <Users className="text-purple-200" size={24} />
                  </div>
                  <div className="text-4xl font-bold">{todayStats.workers}</div>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Recent Transfers
                </h3>
                {loading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading transfers...</p>
                  </div>
                ) : transfers.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="mx-auto mb-4 opacity-50" size={48} />
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      No transfers yet today
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <th className={`text-left py-2 px-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ID</th>
                          <th className={`text-left py-2 px-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Recipient</th>
                          <th className={`text-left py-2 px-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Amount</th>
                          <th className={`text-left py-2 px-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Method</th>
                          <th className={`text-left py-2 px-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                          <th className={`text-left py-2 px-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transfers.slice(0, 10).map((transfer) => (
                          <tr key={transfer.id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                            <td className={`py-2 px-3 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              #{transfer.id}
                            </td>
                            <td className={`py-2 px-3 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              {transfer.recipient}
                            </td>
                            <td className={`py-2 px-3 ${darkMode ? 'text-gray-300' : 'text-gray-900'} font-medium`}>
                              GHS {transfer.amount?.toFixed(2)}
                            </td>
                            <td className={`py-2 px-3 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              {transfer.method}
                            </td>
                            <td className={`py-2 px-3`}>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                transfer.status === 'completed' 
                                  ? 'bg-green-100 text-green-800'
                                  : transfer.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {transfer.status}
                              </span>
                            </td>
                            <td className={`py-2 px-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                              {new Date(transfer.createdAt).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'process' && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Process Payment
              </h2>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
                <form onSubmit={handleProcessPayment} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentForm.recipient}
                      onChange={(e) => setPaymentForm({...paymentForm, recipient: e.target.value})}
                      className={`w-full px-4 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter recipient name"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Amount (GHS)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                      className={`w-full px-4 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Payment Method
                    </label>
                    <select
                      value={paymentForm.method}
                      onChange={(e) => setPaymentForm({...paymentForm, method: e.target.value})}
                      className={`w-full px-4 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <option value="mobile_money">Mobile Money</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Description (Optional)
                    </label>
                    <textarea
                      value={paymentForm.description}
                      onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
                      className={`w-full px-4 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      rows="3"
                      placeholder="Payment description..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-medium"
                  >
                    {loading ? 'Processing...' : 'Process Payment'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Component Rendering
  const renderContent = () => {
    switch(activeTab) {
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <BusinessAnalytics />;
      case 'orders':
        return <AllOrders />;
      case 'transfers':
        return <Transfers />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <div>
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Admin Dashboard
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  UnlimitedData GH
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
              Balance: GHS {balance.toFixed(2)}
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`px-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex space-x-1 overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-3 whitespace-nowrap transition-colors ${
                    activeTab === item.id
                      ? 'bg-green-500 text-white'
                      : darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } rounded-t-lg`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={activeTab === 'transfers' ? '' : 'p-6'}>
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;