'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  User, Users, Search, Check, X, AlertCircle, RefreshCw, ChevronLeft, 
  ChevronRight, ChevronsLeft, ChevronsRight, UserCheck, UserX,
  Clock, Mail, Phone, Calendar, Shield, Filter, Download,
  CheckSquare, Square, Activity
} from 'lucide-react';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login?redirect=/admin/users';
    }
    return Promise.reject(error);
  }
);

const AdminUsers = () => {
  const router = useRouter();
  
  // State Management
  const [state, setState] = useState({
    activeTab: 'all',
    loading: false,
    refreshing: false,
    error: null,
    users: [],
    pendingUsers: [],
    selectedPendingUsers: [],
    searchTerm: '',
    filterRole: 'all',
    filterStatus: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalUsers: 0,
      pageSize: 10
    }
  });

  // Modal States
  const [modals, setModals] = useState({
    userAction: false,
    bulkAction: false,
    userDetails: false
  });

  // Selected User State
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  // Debounce timer for search
  const [searchDebounce, setSearchDebounce] = useState(null);

  // Initial data fetch
  useEffect(() => {
    checkAuth();
    fetchUsers(1);
    fetchPendingUsers();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    
    const timer = setTimeout(() => {
      if (state.searchTerm !== '') {
        fetchUsers(1);
      }
    }, 500);
    
    setSearchDebounce(timer);
    
    return () => clearTimeout(timer);
  }, [state.searchTerm]);

  // Authentication check
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Please login to continue');
      router.push('/login?redirect=/admin/users');
      return false;
    }
    return true;
  }, [router]);

  // Update state helper
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Fetch all users with filters and pagination
  const fetchUsers = useCallback(async (page = state.pagination.currentPage) => {
    try {
      updateState({ loading: true, error: null });
      
      const params = new URLSearchParams({
        page,
        pageSize: state.pagination.pageSize,
        search: state.searchTerm,
        role: state.filterRole,
        status: state.filterStatus,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder
      });

      const response = await api.get(`/api/users?${params}`);
      
      updateState({
        users: response.data.users || [],
        pagination: {
          currentPage: response.data.currentPage || page,
          totalPages: response.data.totalPages || 1,
          totalUsers: response.data.totalUsers || 0,
          pageSize: response.data.pageSize || 10
        },
        loading: false
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      updateState({ 
        error: error.response?.data?.message || 'Failed to load users',
        loading: false 
      });
      toast.error('Failed to load users');
    }
  }, [state.pagination.currentPage, state.pagination.pageSize, state.searchTerm, 
      state.filterRole, state.filterStatus, state.sortBy, state.sortOrder]);

  // Fetch pending users
  const fetchPendingUsers = useCallback(async () => {
    try {
      updateState({ refreshing: true });
      const response = await api.get('/api/admin/users/pending');
      
      updateState({
        pendingUsers: response.data.data || [],
        selectedPendingUsers: [],
        refreshing: false
      });
    } catch (error) {
      console.error('Error fetching pending users:', error);
      toast.error('Failed to load pending users');
      updateState({ refreshing: false });
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    updateState({ refreshing: true });
    await Promise.all([
      fetchUsers(state.pagination.currentPage),
      fetchPendingUsers()
    ]);
    updateState({ refreshing: false });
    toast.success('Data refreshed successfully');
  }, [state.pagination.currentPage]);

  // Handle user status toggle (enable/disable)
  const handleToggleUserStatus = useCallback(async () => {
    if (!selectedUser) return;
    
    try {
      setProcessingAction(true);
      
      const response = await api.put(`/api/users/${selectedUser._id}/toggle-status`, {
        disableReason: actionReason || 'Administrative action'
      });
      
      // Optimistic update
      updateState({
        users: state.users.map(user => 
          user._id === selectedUser._id 
            ? { ...user, isDisabled: response.data.user.isDisabled } 
            : user
        )
      });
      
      const action = response.data.user.isDisabled ? 'disabled' : 'enabled';
      toast.success(`User ${selectedUser.name} has been ${action}`);
      
      // Close modal and reset
      setModals(prev => ({ ...prev, userAction: false }));
      setSelectedUser(null);
      setActionReason('');
      
      // Refresh data
      fetchUsers(state.pagination.currentPage);
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error(error.response?.data?.message || 'Failed to update user status');
    } finally {
      setProcessingAction(false);
    }
  }, [selectedUser, actionReason, state.users, state.pagination.currentPage]);

  // Handle single user approval
  const handleApproveUser = useCallback(async (userId, userName) => {
    try {
      setProcessingAction(true);
      
      await api.put(`/api/admin/users/${userId}/approve`);
      
      // Optimistic update
      updateState({
        pendingUsers: state.pendingUsers.filter(user => user._id !== userId)
      });
      
      toast.success(`${userName} approved successfully`);
      
      // Refresh both lists
      fetchUsers(state.pagination.currentPage);
      fetchPendingUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error(error.response?.data?.message || 'Failed to approve user');
      // Revert optimistic update on error
      fetchPendingUsers();
    } finally {
      setProcessingAction(false);
    }
  }, [state.pendingUsers, state.pagination.currentPage]);

  // Handle bulk user approval
  const handleBulkApproval = useCallback(async () => {
    if (state.selectedPendingUsers.length === 0) {
      toast.warning('Please select users to approve');
      return;
    }

    const confirmMessage = `Are you sure you want to approve ${state.selectedPendingUsers.length} user(s)?`;
    if (!confirm(confirmMessage)) return;

    try {
      setProcessingAction(true);
      
      // Process approvals in parallel with error handling
      const results = await Promise.allSettled(
        state.selectedPendingUsers.map(userId =>
          api.put(`/api/admin/users/${userId}/approve`)
        )
      );
      
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      // Update UI
      if (succeeded > 0) {
        const approvedIds = state.selectedPendingUsers.filter((_, index) => 
          results[index].status === 'fulfilled'
        );
        
        updateState({
          pendingUsers: state.pendingUsers.filter(user => 
            !approvedIds.includes(user._id)
          ),
          selectedPendingUsers: []
        });
      }
      
      // Show results
      if (succeeded > 0 && failed === 0) {
        toast.success(`All ${succeeded} user(s) approved successfully`);
      } else if (succeeded > 0 && failed > 0) {
        toast.warning(`${succeeded} approved, ${failed} failed`);
      } else {
        toast.error('Failed to approve selected users');
      }
      
      // Refresh data
      fetchUsers(state.pagination.currentPage);
      fetchPendingUsers();
    } catch (error) {
      console.error('Bulk approval error:', error);
      toast.error('An error occurred during bulk approval');
    } finally {
      setProcessingAction(false);
    }
  }, [state.selectedPendingUsers, state.pendingUsers, state.pagination.currentPage]);

  // Handle pending user selection
  const handleSelectPendingUser = useCallback((userId) => {
    updateState({
      selectedPendingUsers: state.selectedPendingUsers.includes(userId)
        ? state.selectedPendingUsers.filter(id => id !== userId)
        : [...state.selectedPendingUsers, userId]
    });
  }, [state.selectedPendingUsers]);

  // Handle select all pending users
  const handleSelectAllPending = useCallback(() => {
    updateState({
      selectedPendingUsers: state.selectedPendingUsers.length === state.pendingUsers.length
        ? []
        : state.pendingUsers.map(user => user._id)
    });
  }, [state.selectedPendingUsers, state.pendingUsers]);

  // Export users to CSV
  const handleExportUsers = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/users/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Users exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export users');
    }
  }, []);

  // Format date helper
  const formatDate = useCallback((dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  }, []);

  // Computed values
  const isAllPendingSelected = useMemo(() => 
    state.pendingUsers.length > 0 && 
    state.selectedPendingUsers.length === state.pendingUsers.length,
    [state.pendingUsers, state.selectedPendingUsers]
  );

  const filteredUsers = useMemo(() => {
    let filtered = [...state.users];
    
    if (state.filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === state.filterRole);
    }
    
    if (state.filterStatus !== 'all') {
      filtered = filtered.filter(user => 
        state.filterStatus === 'active' ? !user.isDisabled : user.isDisabled
      );
    }
    
    return filtered;
  }, [state.users, state.filterRole, state.filterStatus]);

  // Render pagination controls
  const renderPagination = () => {
    const { currentPage, totalPages } = state.pagination;
    
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Showing page {currentPage} of {totalPages} ({state.pagination.totalUsers} total users)
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => fetchUsers(1)}
            disabled={currentPage === 1 || state.loading}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="First page"
          >
            <ChevronsLeft size={20} />
          </button>
          
          <button
            onClick={() => fetchUsers(currentPage - 1)}
            disabled={currentPage === 1 || state.loading}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous page"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => fetchUsers(pageNum)}
                  disabled={state.loading}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === pageNum
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => fetchUsers(currentPage + 1)}
            disabled={currentPage === totalPages || state.loading}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next page"
          >
            <ChevronRight size={20} />
          </button>
          
          <button
            onClick={() => fetchUsers(totalPages)}
            disabled={currentPage === totalPages || state.loading}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Last page"
          >
            <ChevronsRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Admin - User Management | UnlimitedData GH</title>
        <meta name="description" content="Manage users and pending approvals" />
      </Head>
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/admin/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <ChevronLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-600 mt-1">Manage users and pending approvals</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshData}
                disabled={state.refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                <RefreshCw size={18} className={state.refreshing ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
              
              <button
                onClick={handleExportUsers}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Download size={18} />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => updateState({ activeTab: 'all' })}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                state.activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users size={18} />
                <span>All Users</span>
                <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                  {state.pagination.totalUsers}
                </span>
              </div>
            </button>
            
            <button
              onClick={() => updateState({ activeTab: 'pending' })}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                state.activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Clock size={18} />
                <span>Pending Approval</span>
                {state.pendingUsers.length > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full animate-pulse">
                    {state.pendingUsers.length}
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Error Alert */}
        {state.error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-3" size={20} />
              <p className="text-red-700">{state.error}</p>
            </div>
          </div>
        )}

        {/* All Users Tab */}
        {state.activeTab === 'all' && (
          <div className="bg-white rounded-lg shadow-sm">
            {/* Filters and Search */}
            <div className="p-6 border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={state.searchTerm}
                      onChange={(e) => updateState({ searchTerm: e.target.value })}
                      placeholder="Search by name, email, or phone..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <select
                    value={state.filterRole}
                    onChange={(e) => updateState({ filterRole: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                  
                  <select
                    value={state.filterStatus}
                    onChange={(e) => updateState({ filterStatus: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                  
                  <select
                    value={`${state.sortBy}_${state.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('_');
                      updateState({ sortBy, sortOrder });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="createdAt_desc">Newest First</option>
                    <option value="createdAt_asc">Oldest First</option>
                    <option value="name_asc">Name (A-Z)</option>
                    <option value="name_desc">Name (Z-A)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              {state.loading ? (
                <div className="flex justify-center items-center h-64">
                  <RefreshCw className="animate-spin text-blue-500" size={32} />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500">No users found</p>
                  {state.searchTerm && (
                    <button
                      onClick={() => updateState({ searchTerm: '' })}
                      className="mt-3 text-blue-500 hover:underline"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {user.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">ID: {user._id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <Mail size={14} className="mr-1 text-gray-400" />
                            {user.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Phone size={14} className="mr-1 text-gray-400" />
                            {user.phoneNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : user.role === 'seller' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            <Shield size={12} className="mr-1" />
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isDisabled 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.isDisabled ? (
                              <>
                                <X size={12} className="mr-1" />
                                Disabled
                              </>
                            ) : (
                              <>
                                <Check size={12} className="mr-1" />
                                Active
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1 text-gray-400" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setActionReason(user.disableReason || '');
                              setModals(prev => ({ ...prev, userAction: true }));
                            }}
                            className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                              user.isDisabled
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            {user.isDisabled ? (
                              <>
                                <UserCheck size={14} className="mr-1" />
                                Enable
                              </>
                            ) : (
                              <>
                                <UserX size={14} className="mr-1" />
                                Disable
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!state.loading && filteredUsers.length > 0 && (
              <div className="px-6 py-4 border-t">
                {renderPagination()}
              </div>
            )}
          </div>
        )}

        {/* Pending Users Tab */}
        {state.activeTab === 'pending' && (
          <div className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Pending Approvals</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Review and approve new user registrations
                  </p>
                </div>
                
                {state.pendingUsers.length > 0 && (
                  <button
                    onClick={handleBulkApproval}
                    disabled={state.selectedPendingUsers.length === 0 || processingAction}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      state.selectedPendingUsers.length === 0 || processingAction
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    <UserCheck size={18} />
                    <span>
                      {processingAction 
                        ? 'Processing...' 
                        : `Approve Selected (${state.selectedPendingUsers.length})`}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Pending Users Table */}
            <div className="overflow-x-auto">
              {state.refreshing ? (
                <div className="flex justify-center items-center h-64">
                  <RefreshCw className="animate-spin text-blue-500" size={32} />
                </div>
              ) : state.pendingUsers.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="mx-auto text-green-400 mb-4" size={48} />
                  <p className="text-gray-500">No pending approvals</p>
                  <p className="text-sm text-gray-400 mt-2">All users are approved!</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={isAllPendingSelected}
                          onChange={handleSelectAllPending}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Referred By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registered
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {state.pendingUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={state.selectedPendingUsers.includes(user._id)}
                            onChange={() => handleSelectPendingUser(user._id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {user.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">ID: {user._id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.referredBy || (
                              <span className="text-gray-400 italic">None</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleApproveUser(user._id, user.name)}
                            disabled={processingAction}
                            className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
                          >
                            <Check size={14} className="mr-1" />
                            Approve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Action Modal */}
      {modals.userAction && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedUser.isDisabled ? 'Enable User Account' : 'Disable User Account'}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {selectedUser.isDisabled 
                  ? `Are you sure you want to enable ${selectedUser.name}'s account? They will be able to log in and use the platform.` 
                  : `Are you sure you want to disable ${selectedUser.name}'s account? They will not be able to access the platform.`}
              </p>
            </div>
            
            {!selectedUser.isDisabled && (
              <div className="mb-6">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for disabling (optional)
                </label>
                <input
                  id="reason"
                  type="text"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Violation of terms, Suspicious activity"
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setModals(prev => ({ ...prev, userAction: false }));
                  setSelectedUser(null);
                  setActionReason('');
                }}
                disabled={processingAction}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleUserStatus}
                disabled={processingAction}
                className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  selectedUser.isDisabled
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {processingAction ? (
                  <span className="flex items-center">
                    <RefreshCw className="animate-spin mr-2" size={16} />
                    Processing...
                  </span>
                ) : (
                  selectedUser.isDisabled ? 'Enable Account' : 'Disable Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;