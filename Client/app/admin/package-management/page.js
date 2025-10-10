'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, Plus, Edit, Save, X, Trash2, ToggleLeft, ToggleRight,
  RefreshCw, Search, Filter, Eye, EyeOff, DollarSign, Zap,
  CheckCircle, XCircle, AlertCircle, Settings, BarChart3,
  TrendingUp, TrendingDown, Clock, Users, ShoppingCart
} from 'lucide-react';

const AdminPackageManagement = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [userData, setUserData] = useState(null);
  
  // Package state
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  
  // New package form
  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    network: 'MTN',
    capacity: '',
    price: 0,
    agentPrice: 0,
    stock: 0,
    isActive: true,
    category: 'data',
    tags: [],
    images: []
  });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNetwork, setFilterNetwork] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Stats
  const [stats, setStats] = useState({
    totalPackages: 0,
    activePackages: 0,
    totalRevenue: 0,
    topSellingPackage: null,
    lowStockPackages: 0
  });

  // API Configuration - Use local API route for packages
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Networks
  const networks = ['MTN', 'AirtelTigo', 'Telecel', 'Vodafone'];
  
  // Categories
  const categories = ['data', 'voice', 'sms', 'bundle', 'promo'];

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

  // Load packages
  const loadPackages = useCallback(async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        showNotification('Authentication required. Please log in again.', 'error');
        router.push('/SignIn');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/packages`, {
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
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to load packages`);
      }

      const data = await response.json();
      setPackages(data.packages || []);
      setFilteredPackages(data.packages || []);
      
      // Update stats
      const activePackages = data.packages?.filter(p => p.isActive) || [];
      const lowStockPackages = data.packages?.filter(p => p.stock < 10) || [];
      const topSelling = data.packages?.length > 0 ? data.packages.reduce((prev, current) => 
        (prev.salesCount || 0) > (current.salesCount || 0) ? prev : current
      ) : null;
      
      setStats({
        totalPackages: data.packages?.length || 0,
        activePackages: activePackages.length,
        totalRevenue: data.packages?.reduce((sum, p) => sum + (p.revenue || 0), 0) || 0,
        topSellingPackage: topSelling?.name || 'N/A',
        lowStockPackages: lowStockPackages.length
      });
    } catch (error) {
      console.error('Error loading packages:', error);
      showNotification(error.message || 'Failed to load packages', 'error');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, router]);

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = packages;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(pkg => 
        pkg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.capacity?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Network filter
    if (filterNetwork !== 'all') {
      filtered = filtered.filter(pkg => pkg.network === filterNetwork);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(pkg => 
        filterStatus === 'active' ? pkg.isActive : !pkg.isActive
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(pkg => pkg.category === filterCategory);
    }

    setFilteredPackages(filtered);
  }, [packages, searchTerm, filterNetwork, filterStatus, filterCategory]);

  // Add new package
  const addPackage = async () => {
    if (!newPackage.name || !newPackage.capacity || !newPackage.price) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/packages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPackage)
      });

      if (!response.ok) throw new Error('Failed to add package');

      showNotification('Package added successfully', 'success');
      setShowAddModal(false);
      setNewPackage({
        name: '',
        description: '',
        network: 'MTN',
        capacity: '',
        price: 0,
        agentPrice: 0,
        stock: 0,
        isActive: true,
        category: 'data',
        tags: [],
        images: []
      });
      loadPackages();
    } catch (error) {
      console.error('Error adding package:', error);
      showNotification('Failed to add package', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update package
  const updatePackage = async (packageId, updates) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/packages/${packageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update package');

      showNotification('Package updated successfully', 'success');
      loadPackages();
    } catch (error) {
      console.error('Error updating package:', error);
      showNotification('Failed to update package', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete package
  const deletePackage = async (packageId) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/packages/${packageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete package');

      showNotification('Package deleted successfully', 'success');
      loadPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      showNotification('Failed to delete package', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Toggle package status
  const togglePackageStatus = (packageId, currentStatus) => {
    updatePackage(packageId, { isActive: !currentStatus });
  };

  // Bulk toggle packages
  const bulkTogglePackages = async (action) => {
    const selectedPackages = filteredPackages.filter(pkg => 
      action === 'activate' ? !pkg.isActive : pkg.isActive
    );
    
    if (selectedPackages.length === 0) {
      showNotification(`No packages to ${action}`, 'error');
      return;
    }

    if (!confirm(`Are you sure you want to ${action} ${selectedPackages.length} package(s)?`)) {
      return;
    }

    try {
      setLoading(true);
      
      const promises = selectedPackages.map(pkg => 
        updatePackage(pkg._id, { isActive: action === 'activate' })
      );
      
      await Promise.all(promises);
      showNotification(`${selectedPackages.length} package(s) ${action}d successfully`, 'success');
    } catch (error) {
      console.error('Error in bulk toggle:', error);
      showNotification('Failed to update packages', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    if (checkAuth()) {
      loadPackages();
    }
  }, [checkAuth, loadPackages]);

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
                  Package Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage data packages and pricing
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-[#FFCC08] text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Package</span>
              </button>
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
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Packages</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPackages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Packages</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activePackages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₵{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Seller</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{stats.topSellingPackage}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.lowStockPackages}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search packages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <select
                value={filterNetwork}
                onChange={(e) => setFilterNetwork(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Networks</option>
                {networks.map(network => (
                  <option key={network} value={network}>{network}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Packages Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Packages ({filteredPackages.length})
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => bulkTogglePackages('activate')}
                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 transition-colors text-sm font-medium"
                >
                  Activate All
                </button>
                <button
                  onClick={() => bulkTogglePackages('deactivate')}
                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
                >
                  Deactivate All
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-[#FFCC08] animate-spin" />
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No packages found</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Package
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Network
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPackages.map((pkg) => (
                    <tr key={pkg._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {pkg.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {pkg.capacity}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          {pkg.network}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          ₵{pkg.price}
                        </div>
                        {pkg.agentPrice && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Agent: ₵{pkg.agentPrice}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          pkg.stock < 10 
                            ? 'text-red-600 dark:text-red-400' 
                            : pkg.stock < 50 
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}>
                          {pkg.stock}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => togglePackageStatus(pkg._id, pkg.isActive)}
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all hover:scale-105 ${
                            pkg.isActive 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                          }`}
                        >
                          {pkg.isActive ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                          <span className="text-sm font-medium">
                            {pkg.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingPackage(pkg)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deletePackage(pkg._id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
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
          )}
        </div>
      </div>

      {/* Add Package Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add New Package
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    value={newPackage.name}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., MTN 5GB Bundle"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Network
                  </label>
                  <select
                    value={newPackage.network}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, network: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {networks.map(network => (
                      <option key={network} value={network}>{network}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Capacity *
                  </label>
                  <input
                    type="text"
                    value={newPackage.capacity}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, capacity: e.target.value }))}
                    placeholder="e.g., 5GB, 10GB"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newPackage.category}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (₵) *
                  </label>
                  <input
                    type="number"
                    value={newPackage.price}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Agent Price (₵)
                  </label>
                  <input
                    type="number"
                    value={newPackage.agentPrice}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, agentPrice: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={newPackage.stock}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={newPackage.isActive}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-[#FFCC08] focus:ring-[#FFCC08] border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Active Package
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newPackage.description}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Package description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addPackage}
                  disabled={loading}
                  className="px-4 py-2 bg-[#FFCC08] text-black font-semibold rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Add Package</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPackageManagement;