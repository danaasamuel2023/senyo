'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Package,
  TrendingUp,
  Sync,
  Eye,
  EyeOff
} from 'lucide-react';

const PriceManagementPage = () => {
  const router = useRouter();
  const [prices, setPrices] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  
  // Filters and search
  const [filters, setFilters] = useState({
    network: '',
    enabled: '',
    search: ''
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedPrices, setSelectedPrices] = useState([]);
  
  // Form data
  const [newPrice, setNewPrice] = useState({
    network: '',
    capacity: '',
    price: '',
    description: '',
    enabled: true
  });
  
  // Bulk operations
  const [bulkUpdates, setBulkUpdates] = useState([]);
  
  // Statistics
  const [stats, setStats] = useState({
    totalPrices: 0,
    totalEnabled: 0,
    totalDisabled: 0,
    avgPrice: 0,
    byNetwork: []
  });

  // Networks
  const networks = [
    { value: 'MTN', label: 'MTN' },
    { value: 'YELLO', label: 'YELLO' },
    { value: 'VODAFONE', label: 'VODAFONE' },
    { value: 'TELECEL', label: 'TELECEL' },
    { value: 'AT_PREMIUM', label: 'AT PREMIUM' },
    { value: 'airteltigo', label: 'AirtelTigo' },
    { value: 'at', label: 'AT' }
  ];

  // API Base URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  // Notification system
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Load prices
  const loadPrices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await fetch(`${API_URL}/api/v1/admin/prices?${params}`, {
        headers: {
          'x-auth-token': localStorage.getItem('authToken')
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }

      const data = await response.json();
      setPrices(data.data || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('Error loading prices:', error);
      setError(error.message);
      showNotification('Failed to load prices', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load inventory
  const loadInventory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/inventory`, {
        headers: {
          'x-auth-token': localStorage.getItem('authToken')
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInventory(data.data || []);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/prices/stats`, {
        headers: {
          'x-auth-token': localStorage.getItem('authToken')
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data.totals || stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Create price
  const handleCreatePrice = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('authToken')
        },
        body: JSON.stringify(newPrice)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create price');
      }

      showNotification('Price created successfully', 'success');
      setShowCreateModal(false);
      setNewPrice({ network: '', capacity: '', price: '', description: '', enabled: true });
      loadPrices();
      loadStats();
    } catch (error) {
      console.error('Error creating price:', error);
      showNotification(error.message, 'error');
    }
  };

  // Update price
  const handleUpdatePrice = async (priceId, updates) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/prices/${priceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('authToken')
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update price');
      }

      showNotification('Price updated successfully', 'success');
      loadPrices();
      loadStats();
    } catch (error) {
      console.error('Error updating price:', error);
      showNotification(error.message, 'error');
    }
  };

  // Delete price
  const handleDeletePrice = async (priceId) => {
    if (!confirm('Are you sure you want to delete this price?')) return;

    try {
      const response = await fetch(`${API_URL}/api/v1/admin/prices/${priceId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': localStorage.getItem('authToken')
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete price');
      }

      showNotification('Price deleted successfully', 'success');
      loadPrices();
      loadStats();
    } catch (error) {
      console.error('Error deleting price:', error);
      showNotification(error.message, 'error');
    }
  };

  // Toggle price enabled/disabled
  const handleTogglePrice = async (priceId) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/prices/${priceId}/toggle`, {
        method: 'PATCH',
        headers: {
          'x-auth-token': localStorage.getItem('authToken')
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle price');
      }

      showNotification('Price status updated', 'success');
      loadPrices();
      loadStats();
    } catch (error) {
      console.error('Error toggling price:', error);
      showNotification(error.message, 'error');
    }
  };

  // Toggle inventory status
  const handleToggleInventory = async (network) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/inventory/${network}/toggle`, {
        method: 'PATCH',
        headers: {
          'x-auth-token': localStorage.getItem('authToken')
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle inventory');
      }

      showNotification('Inventory status updated', 'success');
      loadInventory();
    } catch (error) {
      console.error('Error toggling inventory:', error);
      showNotification(error.message, 'error');
    }
  };

  // Bulk update prices
  const handleBulkUpdate = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/prices/bulk`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('authToken')
        },
        body: JSON.stringify({ updates: bulkUpdates })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to bulk update prices');
      }

      const data = await response.json();
      showNotification(data.message, 'success');
      setShowBulkModal(false);
      setBulkUpdates([]);
      setSelectedPrices([]);
      loadPrices();
      loadStats();
    } catch (error) {
      console.error('Error bulk updating prices:', error);
      showNotification(error.message, 'error');
    }
  };

  // Sync with DataMart
  const handleSyncDataMart = async (network = null) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/sync-datamart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('authToken')
        },
        body: JSON.stringify({ network })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sync with DataMart');
      }

      const data = await response.json();
      showNotification(data.message, 'success');
      setShowSyncModal(false);
      loadPrices();
      loadStats();
    } catch (error) {
      console.error('Error syncing with DataMart:', error);
      showNotification(error.message, 'error');
    }
  };

  // Handle selection
  const handleSelectPrice = (priceId) => {
    setSelectedPrices(prev => 
      prev.includes(priceId) 
        ? prev.filter(id => id !== priceId)
        : [...prev, priceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPrices.length === prices.length) {
      setSelectedPrices([]);
    } else {
      setSelectedPrices(prices.map(p => p._id));
    }
  };

  // Initialize
  useEffect(() => {
    loadPrices();
    loadInventory();
    loadStats();
  }, [pagination.page, filters]);

  // Get network color
  const getNetworkColor = (network) => {
    const colors = {
      'MTN': 'bg-yellow-100 text-yellow-800',
      'YELLO': 'bg-yellow-100 text-yellow-800',
      'VODAFONE': 'bg-red-100 text-red-800',
      'TELECEL': 'bg-purple-100 text-purple-800',
      'AT_PREMIUM': 'bg-blue-100 text-blue-800',
      'airteltigo': 'bg-green-100 text-green-800',
      'at': 'bg-blue-100 text-blue-800'
    };
    return colors[network] || 'bg-gray-100 text-gray-800';
  };

  // Get inventory status
  const getInventoryStatus = (network) => {
    const inv = inventory.find(i => i.network === network);
    return inv || { inStock: true, skipGeonettech: false };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Settings className="w-8 h-8 text-[#FFCC08]" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Price Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage databundle prices and inventory
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSyncModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Sync className="w-4 h-4 mr-2" />
                Sync DataMart
              </button>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-[#FFCC08] hover:bg-[#FFD700] text-black rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Price
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Prices</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPrices}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Enabled</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEnabled}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Disabled</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDisabled}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Price</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₵{stats.avgPrice?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Network
              </label>
              <select
                value={filters.network}
                onChange={(e) => setFilters(prev => ({ ...prev, network: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Networks</option>
                {networks.map(network => (
                  <option key={network.value} value={network.value}>
                    {network.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.enabled}
                onChange={(e) => setFilters(prev => ({ ...prev, enabled: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Search prices..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={loadPrices}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2 inline" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedPrices.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {selectedPrices.length} price(s) selected
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                  Bulk Edit
                </button>
                <button
                  onClick={() => setSelectedPrices([])}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Prices Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedPrices.length === prices.length && prices.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-[#FFCC08] focus:ring-[#FFCC08]"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Network
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Inventory
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mr-2" />
                        <span className="text-gray-500 dark:text-gray-400">Loading prices...</span>
                      </div>
                    </td>
                  </tr>
                ) : prices.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No prices found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  prices.map((price) => {
                    const invStatus = getInventoryStatus(price.network);
                    return (
                      <tr key={price._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedPrices.includes(price._id)}
                            onChange={() => handleSelectPrice(price._id)}
                            className="rounded border-gray-300 text-[#FFCC08] focus:ring-[#FFCC08]"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getNetworkColor(price.network)}`}>
                            {price.network}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {price.capacity}GB
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          ₵{price.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleTogglePrice(price._id)}
                            className={`flex items-center px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                              price.enabled
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {price.enabled ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Enabled
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Disabled
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleInventory(price.network)}
                            className={`flex items-center px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                              invStatus.inStock
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {invStatus.inStock ? (
                              <>
                                <Eye className="w-3 h-3 mr-1" />
                                In Stock
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3 mr-1" />
                                Out of Stock
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(price.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedPrice(price);
                                setShowEditModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePrice(price._id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing{' '}
                    <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                    {' '}to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>
                    {' '}of{' '}
                    <span className="font-medium">{pagination.total}</span>
                    {' '}results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pagination.page === pageNum
                              ? 'z-10 bg-[#FFCC08] border-[#FFCC08] text-black'
                              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Price Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Price
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Network *
                </label>
                <select
                  value={newPrice.network}
                  onChange={(e) => setNewPrice(prev => ({ ...prev, network: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Network</option>
                  {networks.map(network => (
                    <option key={network.value} value={network.value}>
                      {network.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Capacity (GB) *
                </label>
                <input
                  type="number"
                  value={newPrice.capacity}
                  onChange={(e) => setNewPrice(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="e.g., 5"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price (₵) *
                </label>
                <input
                  type="number"
                  value={newPrice.price}
                  onChange={(e) => setNewPrice(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="e.g., 25.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newPrice.description}
                  onChange={(e) => setNewPrice(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={newPrice.enabled}
                  onChange={(e) => setNewPrice(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded border-gray-300 text-[#FFCC08] focus:ring-[#FFCC08]"
                />
                <label htmlFor="enabled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Enable this price
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePrice}
                disabled={!newPrice.network || !newPrice.capacity || !newPrice.price}
                className="px-4 py-2 bg-[#FFCC08] hover:bg-[#FFD700] text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Price
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Price Modal */}
      {showEditModal && selectedPrice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Edit Price
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Network
                </label>
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                  {selectedPrice.network} - {selectedPrice.capacity}GB
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price (₵) *
                </label>
                <input
                  type="number"
                  value={selectedPrice.price}
                  onChange={(e) => setSelectedPrice(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  placeholder="e.g., 25.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={selectedPrice.description || ''}
                  onChange={(e) => setSelectedPrice(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editEnabled"
                  checked={selectedPrice.enabled}
                  onChange={(e) => setSelectedPrice(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded border-gray-300 text-[#FFCC08] focus:ring-[#FFCC08]"
                />
                <label htmlFor="editEnabled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Enable this price
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleUpdatePrice(selectedPrice._id, {
                    price: selectedPrice.price,
                    description: selectedPrice.description,
                    enabled: selectedPrice.enabled
                  });
                  setShowEditModal(false);
                }}
                className="px-4 py-2 bg-[#FFCC08] hover:bg-[#FFD700] text-black rounded-lg transition-colors"
              >
                Update Price
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Bulk Edit Prices
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price Adjustment (₵)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 2.50 (add) or -1.00 (subtract)"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  onChange={(e) => {
                    const adjustment = parseFloat(e.target.value) || 0;
                    const updates = selectedPrices.map(id => {
                      const price = prices.find(p => p._id === id);
                      return {
                        id,
                        price: price ? price.price + adjustment : 0
                      };
                    });
                    setBulkUpdates(updates);
                  }}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="bulkEnabled"
                  className="rounded border-gray-300 text-[#FFCC08] focus:ring-[#FFCC08]"
                  onChange={(e) => {
                    const updates = selectedPrices.map(id => ({ id, enabled: e.target.checked }));
                    setBulkUpdates(prev => [...prev, ...updates]);
                  }}
                />
                <label htmlFor="bulkEnabled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Enable all selected prices
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpdate}
                className="px-4 py-2 bg-[#FFCC08] hover:bg-[#FFD700] text-black rounded-lg transition-colors"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync DataMart Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sync with DataMart API
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Network (Optional)
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleSyncDataMart(e.target.value);
                    }
                  }}
                >
                  <option value="">Sync All Networks</option>
                  {networks.map(network => (
                    <option key={network.value} value={network.value}>
                      {network.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  This will fetch the latest prices from DataMart API and update your local prices. 
                  Existing prices will be updated, new prices will be created.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSyncModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSyncDataMart()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Sync All Networks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            {notification.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceManagementPage;
