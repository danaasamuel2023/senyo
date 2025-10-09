'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Users, 
  UserPlus, 
  Trash2, 
  Eye, 
  Wallet, 
  Mail, 
  Phone, 
  Calendar,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import adminAPI from '../../../utils/adminApi';
import apiClient from '../../../utils/apiClient.js';

const AdminUsersPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [notification, setNotification] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  // API Configuration
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  // Check authentication
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('authToken');
    const userDataStr = localStorage.getItem('userData');
    
    if (!token) {
      console.log('No token found, redirecting to login');
      router.push('/SignIn');
      return false;
    }
    
    try {
      const user = JSON.parse(userDataStr || '{}');
      
      if (user.role !== 'admin') {
        console.log('User is not admin, role:', user.role);
        showNotification('Access denied. Admin privileges required.', 'error');
        router.push('/SignIn');
        return false;
      }
      
      setUserData(user);
      return true;
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/SignIn');
      return false;
    }
  }, [router]);

  // Show notification
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // Load users
  const loadUsers = useCallback(async (page = 1, search = '', role = 'all') => {
    try {
      setLoading(true);
      console.log('Loading users with params:', { page, search, role });
      
      const response = await apiClient.getUsers({ page, limit: 20, search });
      console.log('Users API response:', response);
      
      setUsers(response.users || []);
      setTotalPages(response.totalPages || 1);
      setTotalUsers(response.totalUsers || 0);
      setCurrentPage(page);
      
      console.log('Users loaded successfully:', response.users?.length || 0);
    } catch (error) {
      console.error('Failed to load users:', error);
      showNotification(`Failed to load users: ${error.message}`, 'error');
      
      // For development/testing - show mock data when API fails
      const mockUsers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+233123456789',
          role: 'user',
          isDisabled: false,
          walletBalance: 150.50,
          joinDate: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+233987654321',
          role: 'agent',
          isDisabled: false,
          walletBalance: 75.25,
          joinDate: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Admin User',
          email: 'admin@example.com',
          phone: '+233555666777',
          role: 'admin',
          isDisabled: false,
          walletBalance: 500.00,
          joinDate: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      ];
      
      setUsers(mockUsers);
      setTotalPages(1);
      setTotalUsers(mockUsers.length);
      setCurrentPage(page);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Filter users
  useEffect(() => {
    let filtered = users;

    // Filter by role
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => {
        if (filterStatus === 'active') return !user.isDisabled;
        if (filterStatus === 'inactive') return user.isDisabled;
        return true;
      });
    }

    setFilteredUsers(filtered);
  }, [users, filterRole, filterStatus]);

  // Search users
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    if (term.length > 2 || term.length === 0) {
      loadUsers(1, term, filterRole);
    }
  }, [loadUsers, filterRole]);

  // Toggle user status
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      setActionLoading(true);
      await adminAPI.user.toggleUserStatus(userId, currentStatus ? '' : 'Disabled by admin');
      showNotification(`User ${currentStatus ? 'disabled' : 'enabled'} successfully`);
      loadUsers(currentPage, searchTerm, filterRole);
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      showNotification('Failed to update user status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      await adminAPI.user.deleteUser(userId);
      showNotification('User deleted successfully');
      loadUsers(currentPage, searchTerm, filterRole);
    } catch (error) {
      console.error('Failed to delete user:', error);
      showNotification('Failed to delete user', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Add money to user wallet
  const addMoney = async (userId, amount) => {
    try {
      setActionLoading(true);
      await adminAPI.user.addMoney(userId, parseFloat(amount));
      showNotification(`Successfully added GHS ${amount} to user wallet`);
      loadUsers(currentPage, searchTerm, filterRole);
    } catch (error) {
      console.error('Failed to add money:', error);
      showNotification('Failed to add money to wallet', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    const init = async () => {
      setAuthLoading(true);
      try {
        // Check authentication
        const token = localStorage.getItem('authToken');
        const userDataStr = localStorage.getItem('userData');
        
        // Auth check completed
        
        if (!token) {
          // No token found, continuing for development
          // For development - continue without token
          await loadUsers();
          return;
        }
        
        try {
          const user = JSON.parse(userDataStr || '{}');
          // User data loaded
          
          if (user.role !== 'admin') {
            // User is not admin, role: ${user.role}
            // For development - allow access but show warning
            // Non-admin user accessing admin panel
            showNotification('Warning: Admin privileges recommended for this page.', 'error');
          }
          
          setUserData(user);
          // Authentication successful, loading users...
          await loadUsers();
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          // For development - continue without strict auth
          // Continuing without strict authentication for development
          await loadUsers();
        }
      } catch (error) {
        console.error('Initialization error:', error);
        showNotification('Failed to initialize page', 'error');
      } finally {
        setAuthLoading(false);
      }
    };
    
    init();
  }, [router, loadUsers, showNotification]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (user) => {
    if (user.isDisabled) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Inactive
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </span>
    );
  };

  // Get role badge
  const getRoleBadge = (role) => {
    const roleColors = {
      admin: 'bg-purple-100 text-purple-800',
      agent: 'bg-blue-100 text-blue-800',
      user: 'bg-gray-100 text-gray-800',
      dealer: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[role] || roleColors.user}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  // Show loading state during authentication check
  if (authLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg mb-6 animate-pulse">
            <Users className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Loading Admin Panel
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your access...
          </p>
        </div>
      </div>
    );
  }

  // Show loading state during data fetch
  if (loading && users.length === 0) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 p-6 rounded-lg h-24"></div>
            ))}
          </div>
          <div className="bg-gray-200 p-6 rounded-lg h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Debug Info:</h4>
          <p className="text-sm text-yellow-700">
            Users: {users.length} | Filtered: {filteredUsers.length} | Loading: {loading.toString()} | Auth: {authLoading.toString()}
          </p>
          <p className="text-sm text-yellow-700">
            Search: "{searchTerm}" | Role: {filterRole} | Status: {filterStatus}
          </p>
        </div>
      )}
      
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage all registered users, their accounts, and permissions
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadUsers(currentPage, searchTerm, filterRole)}
            disabled={loading}
            className="flex items-center space-x-2 py-2 px-4 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors duration-200"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm text-gray-500 font-medium">Total Users</h3>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm text-gray-500 font-medium">Active Users</h3>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {users.filter(u => !u.isDisabled).length}
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm text-gray-500 font-medium">Inactive Users</h3>
            <XCircle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {users.filter(u => u.isDisabled).length}
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm text-gray-500 font-medium">Agents</h3>
            <UserPlus className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {users.filter(u => u.role === 'agent').length}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Role Filter */}
          <div className="md:w-48">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="agent">Agent</option>
              <option value="user">User</option>
              <option value="dealer">Dealer</option>
            </select>
          </div>
          
          {/* Status Filter */}
          <div className="md:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wallet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="w-12 h-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
                          ? 'Try adjusting your search or filters' 
                          : 'No users have been registered yet'}
                      </p>
                      {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setFilterRole('all');
                            setFilterStatus('all');
                            loadUsers(1, '', 'all');
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Wallet className="w-4 h-4 mr-1 text-green-500" />
                      {formatCurrency(user.walletBalance || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(user.joinDate || user.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user.id, user.isDisabled)}
                        disabled={actionLoading}
                        className={`p-1 ${user.isDisabled ? 'text-green-600 hover:text-green-900' : 'text-yellow-600 hover:text-yellow-900'}`}
                        title={user.isDisabled ? 'Enable User' : 'Disable User'}
                      >
                        {user.isDisabled ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        disabled={actionLoading}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => loadUsers(currentPage - 1, searchTerm, filterRole)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => loadUsers(currentPage + 1, searchTerm, filterRole)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * 20, totalUsers)}
                  </span> of{' '}
                  <span className="font-medium">{totalUsers}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => loadUsers(currentPage - 1, searchTerm, filterRole)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => loadUsers(i + 1, searchTerm, filterRole)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === i + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => loadUsers(currentPage + 1, searchTerm, filterRole)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          <div className="flex items-center">
            {notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5 mr-2" />
            ) : (
              <CheckCircle className="w-5 h-5 mr-2" />
            )}
            {notification.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;