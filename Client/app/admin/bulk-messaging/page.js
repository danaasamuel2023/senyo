'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail, MessageSquare, Users, Send, Filter, Search, 
  CheckCircle, XCircle, AlertCircle, RefreshCw, 
  UserCheck, UserX, Clock, BarChart3, Eye, Trash2,
  Plus, Edit, Save, X, Download, Upload, Settings,
  Bell, Phone, AtSign, Calendar, Target, Zap
} from 'lucide-react';

const AdminBulkMessaging = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [userData, setUserData] = useState(null);
  
  // Message state
  const [messageType, setMessageType] = useState('sms'); // 'sms' or 'email'
  const [messageContent, setMessageContent] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  
  // Campaign state
  const [campaigns, setCampaigns] = useState([]);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSmsSent: 0,
    totalEmailsSent: 0,
    successRate: 0
  });

  // API Configuration
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  // Check authentication
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('authToken');
    const userDataStr = localStorage.getItem('userData');
    
    if (!token) {
      router.push('/SignIn');
      return false;
    }
    
    try {
      const user = JSON.parse(userDataStr || '{}');
      
      if (user.role !== 'admin') {
        showNotification('Access denied. Admin privileges required.', 'error');
        router.push('/SignIn');
        return false;
      }
      
      setUserData(user);
      return true;
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/SignIn');
      return false;
    }
  }, [router]);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        showNotification('Authentication required. Please log in again.', 'error');
        router.push('/SignIn');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          showNotification('Authentication expired. Please log in again.', 'error');
          router.push('/SignIn');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to load users`);
      }

      const data = await response.json();
      setAllUsers(data.users || []);
      setFilteredUsers(data.users || []);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalUsers: data.users?.length || 0,
        activeUsers: data.users?.filter(u => u.status === 'active')?.length || 0
      }));
    } catch (error) {
      console.error('Error loading users:', error);
      showNotification(error.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, router]);

  // Load campaigns
  const loadCampaigns = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/campaigns`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to load campaigns');

      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  }, [API_BASE_URL]);

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = allUsers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    // Date range filter
    if (filterDateRange !== 'all') {
      const now = new Date();
      const daysAgo = parseInt(filterDateRange);
      const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      
      filtered = filtered.filter(user => 
        new Date(user.createdAt) >= cutoffDate
      );
    }

    setFilteredUsers(filtered);
  }, [allUsers, searchTerm, filterRole, filterStatus, filterDateRange]);

  // Send bulk message
  const sendBulkMessage = async () => {
    if (!messageContent.trim()) {
      showNotification('Please enter message content', 'error');
      return;
    }

    if (selectedUsers.length === 0) {
      showNotification('Please select at least one user', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        type: messageType,
        content: messageContent,
        subject: messageSubject,
        userIds: selectedUsers.map(u => u._id),
        metadata: {
          sentBy: userData._id,
          timestamp: new Date().toISOString()
        }
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/bulk-message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to send messages');

      const data = await response.json();
      
      showNotification(`Successfully sent ${data.sentCount} ${messageType.toUpperCase()} messages`, 'success');
      
      // Reset form
      setMessageContent('');
      setMessageSubject('');
      setSelectedUsers([]);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        [`total${messageType === 'sms' ? 'Sms' : 'Emails'}Sent`]: prev[`total${messageType === 'sms' ? 'Sms' : 'Emails'}Sent`] + data.sentCount
      }));
      
    } catch (error) {
      console.error('Error sending bulk message:', error);
      showNotification('Failed to send messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Select all users
  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers);
    }
  };

  // Toggle user selection
  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => 
      prev.find(u => u._id === user._id)
        ? prev.filter(u => u._id !== user._id)
        : [...prev, user]
    );
  };

  // Initialize
  useEffect(() => {
    if (checkAuth()) {
      loadUsers();
      loadCampaigns();
    }
  }, [checkAuth, loadUsers, loadCampaigns]);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg flex items-center space-x-3 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span className="font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-4">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Bulk Messaging
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Send SMS and email campaigns to users
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <MessageSquare className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">SMS Sent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSmsSent}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Emails Sent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEmailsSent}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-[#FFCC08]/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-[#FFCC08]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.successRate}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Message Composer */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Compose Message</h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Message Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Message Type
                  </label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setMessageType('sms')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        messageType === 'sms'
                          ? 'bg-[#FFCC08] text-black'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>SMS</span>
                    </button>
                    <button
                      onClick={() => setMessageType('email')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        messageType === 'email'
                          ? 'bg-[#FFCC08] text-black'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </button>
                  </div>
                </div>

                {/* Subject (for email) */}
                {messageType === 'email' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                      placeholder="Enter email subject..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}

                {/* Message Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message Content
                  </label>
                  <textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder={`Enter your ${messageType} message...`}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {messageContent.length} characters
                    {messageType === 'sms' && ` (${Math.ceil(messageContent.length / 160)} SMS)`}
                  </p>
                </div>

                {/* Selected Users Count */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Selected Recipients
                    </span>
                    <span className="text-sm font-bold text-[#FFCC08]">
                      {selectedUsers.length}
                    </span>
                  </div>
                </div>

                {/* Send Button */}
                <button
                  onClick={sendBulkMessage}
                  disabled={loading || !messageContent.trim() || selectedUsers.length === 0}
                  className="w-full bg-[#FFCC08] text-black font-semibold py-3 px-4 rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  <span>
                    Send {messageType.toUpperCase()} ({selectedUsers.length} recipients)
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* User Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Select Recipients
                  </h2>
                  <button
                    onClick={selectAllUsers}
                    className="text-sm text-[#FFCC08] hover:text-yellow-500 font-medium"
                  >
                    {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Roles</option>
                    <option value="user">Users</option>
                    <option value="agent">Agents</option>
                    <option value="admin">Admins</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>

                  <select
                    value={filterDateRange}
                    onChange={(e) => setFilterDateRange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Time</option>
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                  </select>
                </div>
              </div>

              {/* Users List */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 text-[#FFCC08] animate-spin" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No users found</p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map((user) => {
                      const isSelected = selectedUsers.find(u => u._id === user._id);
                      
                      return (
                        <div
                          key={user._id}
                          onClick={() => toggleUserSelection(user)}
                          className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                            isSelected ? 'bg-[#FFCC08]/10' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              isSelected 
                                ? 'bg-[#FFCC08] border-[#FFCC08]' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {isSelected && <CheckCircle className="w-3 h-3 text-black" />}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                  {user.name || 'No Name'}
                                </h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  user.role === 'admin' 
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                    : user.role === 'agent'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                }`}>
                                  {user.role}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  user.status === 'active'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                }`}>
                                  {user.status}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 mt-1">
                                {user.email && (
                                  <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                                    <Mail className="w-3 h-3" />
                                    <span>{user.email}</span>
                                  </div>
                                )}
                                {user.phone && (
                                  <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                                    <Phone className="w-3 h-3" />
                                    <span>{user.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBulkMessaging;