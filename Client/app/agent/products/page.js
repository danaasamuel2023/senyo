'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home, Package, DollarSign, Wallet, Settings, Plus,
  Edit3, Trash2, Eye, Filter, Search, RefreshCw,
  ChevronRight, Store, ShoppingCart, TrendingUp,
  CheckCircle, XCircle, AlertCircle, MoreHorizontal
} from 'lucide-react';
import { getApiEndpoint } from '../../../utils/apiConfig';

const AgentProducts = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const networks = ['all', 'MTN', 'TELECEL', 'AT_PREMIUM', 'airteltigo'];

  useEffect(() => {
    loadProducts();
  }, [selectedNetwork]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const API_URL = getApiEndpoint('');
      
      const response = await fetch(`${API_URL}/api/agent/catalog`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        console.error('Failed to load products:', response.statusText);
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedNetwork === 'all' 
    ? products 
    : products.filter(p => p.network.toLowerCase() === selectedNetwork.toLowerCase());

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleDeleteProduct = (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      // Delete product logic
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const getNetworkColor = (network) => {
    const colors = {
      'MTN': 'bg-yellow-500',
      'TELECEL': 'bg-blue-500',
      'AT_PREMIUM': 'bg-purple-500',
      'airteltigo': 'bg-red-500'
    };
    return colors[network] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gray-800 transition-all duration-300 flex flex-col`}>
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-black" />
            </div>
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-yellow-400">UnlimitedData GH</h1>
            )}
          </div>
        </div>

        {/* Agent Store Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            {!sidebarCollapsed && (
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Agent Store</h2>
            )}
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4">
          <ul className="space-y-2">
            <li>
              <a
                href="/agent/dashboard"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <Home className="w-5 h-5" />
                {!sidebarCollapsed && <span>Dashboard</span>}
              </a>
            </li>
            <li>
              <a
                href="/agent/products"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-yellow-600 text-black"
              >
                <Package className="w-5 h-5" />
                {!sidebarCollapsed && <span>Products</span>}
                {!sidebarCollapsed && <ChevronRight className="w-4 h-4 ml-auto" />}
              </a>
            </li>
            <li>
              <a
                href="/agent/transactions"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <DollarSign className="w-5 h-5" />
                {!sidebarCollapsed && <span>Transactions</span>}
              </a>
            </li>
            <li>
              <a
                href="/agent/withdrawals"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <Wallet className="w-5 h-5" />
                {!sidebarCollapsed && <span>Withdrawals</span>}
              </a>
            </li>
            <li>
              <a
                href="/agent/settings"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-5 h-5" />
                {!sidebarCollapsed && <span>Settings</span>}
              </a>
            </li>
          </ul>
        </nav>

        {/* Create Store Button */}
        <div className="p-4">
          <button className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-5 h-5" />
            {!sidebarCollapsed && <span>Create Store</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              <div className="text-sm text-gray-400">
                Store: sam | Total Products: {products.length}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
                <RefreshCw className="w-5 h-5 text-gray-400" />
              </button>
              <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
            <p className="text-gray-400">Manage your product catalog and pricing</p>
          </div>

          {/* Network Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {networks.map((network) => (
              <button
                key={network}
                onClick={() => setSelectedNetwork(network)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedNetwork === network
                    ? 'bg-yellow-600 text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {network === 'all' ? 'All Networks' : network}
              </button>
            ))}
          </div>

          {/* Add Product Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                  {/* Network Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getNetworkColor(product.network)}`}>
                      {product.network}
                    </span>
                    <div className="flex items-center space-x-2">
                      {product.isActive ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-1">{product.capacity}</h3>
                    <p className="text-gray-400 text-sm">{product.name}</p>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Base Price:</span>
                      <span className="text-white font-medium">{formatCurrency(product.basePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Your Price:</span>
                      <span className="text-white font-medium">{formatCurrency(product.agentPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Profit:</span>
                      <span className="text-green-400 font-medium">
                        {formatCurrency(product.profit)} ({product.profitPercentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Sales Info */}
                  <div className="mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Sold:</span>
                      <span className="text-white font-medium">{product.sold}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Products Found</h3>
              <p className="text-gray-400 mb-6">
                {selectedNetwork === 'all' 
                  ? "You haven't added any products yet." 
                  : `No products found for ${selectedNetwork} network.`}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg transition-colors"
              >
                Add Your First Product
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  defaultValue={editingProduct?.name || ''}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., MTN 1GB Bundle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Network
                </label>
                <select
                  defaultValue={editingProduct?.network || 'MTN'}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="MTN">MTN</option>
                  <option value="TELECEL">TELECEL</option>
                  <option value="AT_PREMIUM">AT Premium</option>
                  <option value="airteltigo">AirtelTigo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Capacity
                </label>
                <input
                  type="text"
                  defaultValue={editingProduct?.capacity || ''}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 1GB"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Base Price (₵)
                </label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={editingProduct?.basePrice || ''}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Price (₵)
                </label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={editingProduct?.agentPrice || ''}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg transition-colors"
                >
                  {editingProduct ? 'Update' : 'Add'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentProducts;
