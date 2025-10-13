'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import adminAPI, { userAPI } from '../../../utils/adminApi';
import {
  Users, UserCheck, UserX, Search, Filter, Plus, Edit, Trash2, Eye,
  ArrowLeft, RefreshCw, Download, Upload, Mail, Phone, Calendar,
  TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Clock,
  Shield, Star, AlertCircle, CheckCircle, X, Save, Settings,
  UserPlus, UserMinus, Wallet, CreditCard, Bell, MessageSquare
} from 'lucide-react';

const AdvancedUserManagementPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // User data state
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newToday: 0,
    vip: 0,
    regular: 0
  });

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // User behavior analytics
  const [userAnalytics, setUserAnalytics] = useState({
    loginPatterns: [],
    purchaseHistory: [],
    activityTimeline: [],
    segmentation: []
  });

  useEffect(() => {
    checkAuth();
    loadUsers();
    loadUserStats();
    loadUserAnalytics();
  }, [currentPage, itemsPerPage, sortBy, sortOrder]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole, filterStatus, filterDateRange]);

  const checkAuth = () => {
    const token = getAuthToken();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'admin') {
      router.push('/SignIn');
      return;
    }
  };

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUsers(currentPage, itemsPerPage, searchTerm);
      
      if (response.success) {
        setUsers(response.users || []);
        setTotalPages(response.totalPages || 1);
      } else {
        showNotification('Failed to load users', 'error');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      showNotification('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      // Mock user statistics
      const stats = {
        total: users.length,
        active: users.filter(u => u.isActive !== false).length,
        inactive: users.filter(u => u.isActive === false).length,
        newToday: users.filter(u => {
          const today = new Date();
          const userDate = new Date(u.createdAt);
          return userDate.toDateString() === today.toDateString();
        }).length,
        vip: users.filter(u => u.role === 'vip' || u.walletBalance > 1000).length,
        regular: users.filter(u => u.role === 'buyer' || u.role === 'seller').length
      };
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const loadUserAnalytics = async () => {
    try {
      // Mock user analytics data
      const analytics = {
        loginPatterns: [
          { hour: 0, logins: Math.floor(Math.random() * 10) },
          { hour: 6, logins: Math.floor(Math.random() * 20) },
          { hour: 12, logins: Math.floor(Math.random() * 50) },
          { hour: 18, logins: Math.floor(Math.random() * 40) },
          { hour: 24, logins: Math.floor(Math.random() * 15) }
        ],
        purchaseHistory: [
          { month: 'Jan', purchases: Math.floor(Math.random() * 100) },
          { month: 'Feb', purchases: Math.floor(Math.random() * 120) },
          { month: 'Mar', purchases: Math.floor(Math.random() * 90) },
          { month: 'Apr', purchases: Math.floor(Math.random() * 110) }
        ],
        activityTimeline: users.slice(0, 10).map(user => ({
          userId: user._id,
          name: user.name,
          action: 'Login',
          timestamp: new Date(),
          details: 'Logged in from mobile device'
        })),
        segmentation: [
          { segment: 'VIP Users', count: userStats.vip, color: 'bg-purple-500' },
          { segment: 'Regular Users', count: userStats.regular, color: 'bg-blue-500' },
          { segment: 'New Users', count: userStats.newToday, color: 'bg-green-500' },
          { segment: 'Inactive Users', count: userStats.inactive, color: 'bg-gray-500' }
        ]
      };
      setUserAnalytics(analytics);
    } catch (error) {
      console.error('Error loading user analytics:', error);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber?.includes(searchTerm)
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'active') {
        filtered = filtered.filter(user => user.isActive !== false);
      } else if (filterStatus === 'inactive') {
        filtered = filtered.filter(user => user.isActive === false);
      }
    }

    // Date range filter
    if (filterDateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filterDateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(user => new Date(user.createdAt) >= filterDate);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(user => new Date(user.createdAt) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(user => new Date(user.createdAt) >= filterDate);
          break;
      }
    }

    setFilteredUsers(filtered);
  };

  const handleUserAction = async (action, userId, data = {}) => {
    try {
      setLoading(true);
      let response;

      switch (action) {
        case 'toggle-status':
          response = await userAPI.toggleUserStatus(userId, data.disableReason);
          break;
        case 'add-money':
          response = await userAPI.addMoney(userId, data.amount, data.reason);
          break;
        case 'deduct-money':
          response = await userAPI.deductMoney(userId, data.amount, data.reason);
          break;
        case 'reset-password':
          response = await userAPI.resetPassword(userId, data.newPassword);
          break;
        case 'delete':
          response = await userAPI.deleteUser(userId);
          break;
        default:
          throw new Error('Invalid action');
      }

      if (response.success) {
        showNotification(`${action} completed successfully`);
        loadUsers();
      } else {
        showNotification(`Failed to ${action}`, 'error');
      }
    } catch (error) {
      console.error(`Error ${action}:`, error);
      showNotification(`Failed to ${action}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action, userIds, data = {}) => {
    try {
      setLoading(true);
      const promises = userIds.map(userId => handleUserAction(action, userId, data));
      await Promise.all(promises);
      showNotification(`Bulk ${action} completed`);
      setSelectedUsers([]);
    } catch (error) {
      console.error(`Bulk ${action} error:`, error);
      showNotification(`Bulk ${action} failed`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Role', 'Status', 'Wallet Balance', 'Created At'],
      ...filteredUsers.map(user => [
        user.name || '',
        user.email || '',
        user.phoneNumber || '',
        user.role || '',
        user.isActive !== false ? 'Active' : 'Inactive',
        user.walletBalance || 0,
        new Date(user.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Advanced User Management
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Comprehensive user management and analytics
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={exportUsers}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </button>
              
              <button
                onClick={loadUsers}
                disabled={loading}
                className="p-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'users', name: 'Users', icon: Users },
              { id: 'analytics', name: 'Analytics', icon: TrendingUp },
              { id: 'segmentation', name: 'Segmentation', icon: PieChart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+12% from last month</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.active}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+8% from last month</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">VIP Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.vip}</p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+15% from last month</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New Today</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.newToday}</p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <UserPlus className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+3 from yesterday</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowUserModal(true)}
                  className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Add User</span>
                </button>
                
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <Settings className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">Bulk Actions</span>
                </button>
                
                <button
                  onClick={exportUsers}
                  className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                  <Download className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Export Data</span>
                </button>
                
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                >
                  <Upload className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Import Users</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                  <option value="dealer">Dealer</option>
                  <option value="agent">Agent</option>
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                
                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Users ({filteredUsers.length})
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === filteredUsers.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(filteredUsers.map(u => u._id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Wallet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user._id]);
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {user.name?.charAt(0) || 'U'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.name || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'buyer' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'seller' ? 'bg-green-100 text-green-800' :
                            user.role === 'dealer' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(user.walletBalance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUserAction('delete', user._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Login Patterns */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Login Patterns</h3>
                <div className="space-y-3">
                  {userAnalytics.loginPatterns.map((pattern, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {pattern.hour}:00
                      </span>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(pattern.logins / 50) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {pattern.logins}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase History */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Purchase History</h3>
                <div className="space-y-3">
                  {userAnalytics.purchaseHistory.map((month, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {month.month}
                      </span>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(month.purchases / 120) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {month.purchases}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {userAnalytics.activityTimeline.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {activity.action} - {activity.details}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Segmentation Tab */}
        {activeTab === 'segmentation' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {userAnalytics.segmentation.map((segment, index) => (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {segment.segment}
                    </h3>
                    <div className={`w-3 h-3 rounded-full ${segment.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {segment.count}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {((segment.count / userStats.total) * 100).toFixed(1)}% of total users
                  </div>
                </div>
              ))}
            </div>

            {/* User Segmentation Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Segmentation</h3>
              <div className="h-64 flex items-end justify-center space-x-4">
                {userAnalytics.segmentation.map((segment, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className={`w-16 ${segment.color} rounded-t transition-all duration-300`}
                      style={{ height: `${(segment.count / Math.max(...userAnalytics.segmentation.map(s => s.count))) * 200}px` }}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                      {segment.segment}
                    </span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {segment.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`p-4 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500' : 
            notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          } text-white`}>
            <div className="flex items-center space-x-2">
              <span>{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-2 hover:bg-white/20 rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedUserManagementPage;
