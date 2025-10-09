'use client';

import React, { useState, useEffect } from 'react';
import {
  Package, Plus, Edit3, Trash2, Eye, EyeOff, Star, Tag,
  Zap, Wifi, Shield, Award, Target, PieChart, BarChart3,
  TrendingUp, DollarSign, Users, ShoppingCart, Calendar,
  AlertCircle, CheckCircle, Loader2, Search, Filter,
  ChevronDown, ChevronUp, Image as ImageIcon, Upload,
  Save, X, Copy, Share2, QrCode, Globe, Smartphone
} from 'lucide-react';
import { getApiEndpoint } from '../utils/apiConfig';

const ProductManager = ({ agentId, onProductUpdate }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNetwork, setFilterNetwork] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [notification, setNotification] = useState(null);

  // Enhanced product form with more fields
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    network: 'MTN',
    capacity: '',
    validity: '30',
    basePrice: 0,
    agentPrice: 0,
    retailPrice: 0,
    stock: 0,
    isActive: true,
    category: 'data',
    tags: [],
    images: [],
    features: [],
    bulkDiscounts: [],
    requiresApproval: false,
    featured: false,
    seoTitle: '',
    seoDescription: '',
    metaKeywords: []
  });

  useEffect(() => {
    loadProducts();
  }, [agentId]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const API_URL = getApiEndpoint('');

      const response = await fetch(`${API_URL}/api/agent/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      showNotification('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSaveProduct = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const API_URL = getApiEndpoint('');

      const productData = {
        ...productForm,
        agentId,
        tags: productForm.tags.filter(tag => tag.trim() !== ''),
        metaKeywords: productForm.metaKeywords.filter(keyword => keyword.trim() !== '')
      };

      const url = editingProduct 
        ? `${API_URL}/api/agent/products/${editingProduct._id}`
        : `${API_URL}/api/agent/products`;

      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        showNotification(
          editingProduct ? 'Product updated successfully!' : 'Product added successfully!', 
          'success'
        );
        setShowModal(false);
        resetForm();
        loadProducts();
        if (onProductUpdate) onProductUpdate();
      } else {
        showNotification('Failed to save product', 'error');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      showNotification('Error saving product', 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const API_URL = getApiEndpoint('');

      const response = await fetch(`${API_URL}/api/agent/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showNotification('Product deleted successfully!', 'success');
        loadProducts();
        if (onProductUpdate) onProductUpdate();
      } else {
        showNotification('Failed to delete product', 'error');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification('Error deleting product', 'error');
    }
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      network: 'MTN',
      capacity: '',
      validity: '30',
      basePrice: 0,
      agentPrice: 0,
      retailPrice: 0,
      stock: 0,
      isActive: true,
      category: 'data',
      tags: [],
      images: [],
      features: [],
      bulkDiscounts: [],
      requiresApproval: false,
      featured: false,
      seoTitle: '',
      seoDescription: '',
      metaKeywords: []
    });
    setEditingProduct(null);
  };

  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name || '',
        description: product.description || '',
        network: product.network || 'MTN',
        capacity: product.capacity || '',
        validity: product.validity || '30',
        basePrice: product.basePrice || 0,
        agentPrice: product.agentPrice || 0,
        retailPrice: product.retailPrice || 0,
        stock: product.stock || 0,
        isActive: product.isActive !== undefined ? product.isActive : true,
        category: product.category || 'data',
        tags: product.tags || [],
        images: product.images || [],
        features: product.features || [],
        bulkDiscounts: product.bulkDiscounts || [],
        requiresApproval: product.requiresApproval || false,
        featured: product.featured || false,
        seoTitle: product.seoTitle || '',
        seoDescription: product.seoDescription || '',
        metaKeywords: product.metaKeywords || []
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const addTag = () => {
    setProductForm({
      ...productForm,
      tags: [...productForm.tags, '']
    });
  };

  const updateTag = (index, value) => {
    const newTags = [...productForm.tags];
    newTags[index] = value;
    setProductForm({ ...productForm, tags: newTags });
  };

  const removeTag = (index) => {
    const newTags = productForm.tags.filter((_, i) => i !== index);
    setProductForm({ ...productForm, tags: newTags });
  };

  const addKeyword = () => {
    setProductForm({
      ...productForm,
      metaKeywords: [...productForm.metaKeywords, '']
    });
  };

  const updateKeyword = (index, value) => {
    const newKeywords = [...productForm.metaKeywords];
    newKeywords[index] = value;
    setProductForm({ ...productForm, metaKeywords: newKeywords });
  };

  const removeKeyword = (index) => {
    const newKeywords = productForm.metaKeywords.filter((_, i) => i !== index);
    setProductForm({ ...productForm, metaKeywords: newKeywords });
  };

  const addBulkDiscount = () => {
    setProductForm({
      ...productForm,
      bulkDiscounts: [...productForm.bulkDiscounts, { minQty: 0, discount: 0 }]
    });
  };

  const updateBulkDiscount = (index, field, value) => {
    const newDiscounts = [...productForm.bulkDiscounts];
    newDiscounts[index][field] = parseFloat(value) || 0;
    setProductForm({ ...productForm, bulkDiscounts: newDiscounts });
  };

  const removeBulkDiscount = (index) => {
    const newDiscounts = productForm.bulkDiscounts.filter((_, i) => i !== index);
    setProductForm({ ...productForm, bulkDiscounts: newDiscounts });
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesNetwork = filterNetwork === 'all' || product.network === filterNetwork;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && product.isActive) ||
                           (filterStatus === 'inactive' && !product.isActive);
      
      return matchesSearch && matchesNetwork && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFCC08]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border ${
            notification.type === 'success' ? 'bg-green-500/90 border-green-400' :
            notification.type === 'error' ? 'bg-red-500/90 border-red-400' :
            'bg-blue-500/90 border-blue-400'
          } text-white flex items-center space-x-3`}>
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your product catalog and inventory
          </p>
        </div>
        <button
          onClick={() => openProductModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
          
          <select
            value={filterNetwork}
            onChange={(e) => setFilterNetwork(e.target.value)}
            className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
          >
            <option value="all">All Networks</option>
            <option value="MTN">MTN</option>
            <option value="AT">AirtelTigo</option>
            <option value="Telecel">Telecel</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="agentPrice-asc">Price (Low-High)</option>
            <option value="agentPrice-desc">Price (High-Low)</option>
            <option value="stock-asc">Stock (Low-High)</option>
            <option value="stock-desc">Stock (High-Low)</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFCC08] to-yellow-500 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{product.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {product.network} {product.capacity}GB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {product.featured && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      Featured
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Base Price:</span>
                  <span className="font-medium">₵{product.basePrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Your Price:</span>
                  <span className="font-semibold text-[#FFCC08]">₵{product.agentPrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Retail Price:</span>
                  <span className="font-medium">₵{product.retailPrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Stock:</span>
                  <span className="font-medium">{product.stock || 'Unlimited'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Validity:</span>
                  <span className="font-medium">{product.validity} days</span>
                </div>
              </div>

              {product.tags && product.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {product.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                    {product.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                        +{product.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => openProductModal(product)}
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm font-medium"
                >
                  <Edit3 className="w-4 h-4 inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProduct(product._id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm || filterNetwork !== 'all' || filterStatus !== 'all' ? 'No products found' : 'No Products Yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || filterNetwork !== 'all' || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Start by adding your first product to your store'
            }
          </p>
          {(!searchTerm && filterNetwork === 'all' && filterStatus === 'all') && (
            <button
              onClick={() => openProductModal()}
              className="px-6 py-3 bg-[#FFCC08] text-black rounded-xl font-semibold hover:bg-yellow-500 transition-all shadow-lg"
            >
              Add Your First Product
            </button>
          )}
        </div>
      )}

      {/* Enhanced Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="e.g., MTN Data Bundle"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Network *
                  </label>
                  <select
                    value={productForm.network}
                    onChange={(e) => setProductForm({...productForm, network: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                  >
                    <option value="MTN">MTN</option>
                    <option value="AT">AirtelTigo</option>
                    <option value="Telecel">Telecel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Capacity (GB) *
                  </label>
                  <input
                    type="number"
                    value={productForm.capacity}
                    onChange={(e) => setProductForm({...productForm, capacity: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="e.g., 5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Validity (Days) *
                  </label>
                  <input
                    type="number"
                    value={productForm.validity}
                    onChange={(e) => setProductForm({...productForm, validity: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="30"
                    required
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Base Price (₵) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.basePrice}
                    onChange={(e) => setProductForm({...productForm, basePrice: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Price (₵) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.agentPrice}
                    onChange={(e) => setProductForm({...productForm, agentPrice: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Retail Price (₵)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.retailPrice}
                    onChange={(e) => setProductForm({...productForm, retailPrice: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Stock and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="0 (0 = unlimited)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                  >
                    <option value="data">Data Bundles</option>
                    <option value="airtime">Airtime</option>
                    <option value="services">Services</option>
                    <option value="utilities">Utilities</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Describe this product..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="space-y-2">
                  {productForm.tags.map((tag, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => updateTag(index, e.target.value)}
                        className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="Enter tag"
                      />
                      <button
                        onClick={() => removeTag(index)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addTag}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Tag</span>
                  </button>
                </div>
              </div>

              {/* Bulk Discounts */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bulk Discounts
                </label>
                <div className="space-y-2">
                  {productForm.bulkDiscounts.map((discount, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 items-center">
                      <input
                        type="number"
                        value={discount.minQty}
                        onChange={(e) => updateBulkDiscount(index, 'minQty', e.target.value)}
                        className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="Min Qty"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={discount.discount}
                        onChange={(e) => updateBulkDiscount(index, 'discount', e.target.value)}
                        className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="Discount %"
                      />
                      <button
                        onClick={() => removeBulkDiscount(index)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addBulkDiscount}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Bulk Discount</span>
                  </button>
                </div>
              </div>

              {/* SEO Fields */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">SEO Settings</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={productForm.seoTitle}
                    onChange={(e) => setProductForm({...productForm, seoTitle: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="SEO optimized title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SEO Description
                  </label>
                  <textarea
                    value={productForm.seoDescription}
                    onChange={(e) => setProductForm({...productForm, seoDescription: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="SEO optimized description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Keywords
                  </label>
                  <div className="space-y-2">
                    {productForm.metaKeywords.map((keyword, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={keyword}
                          onChange={(e) => updateKeyword(index, e.target.value)}
                          className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                          placeholder="Enter keyword"
                        />
                        <button
                          onClick={() => removeKeyword(index)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addKeyword}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Keyword</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Options */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Product Options</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={productForm.isActive}
                      onChange={(e) => setProductForm({...productForm, isActive: e.target.checked})}
                      className="w-4 h-4 text-[#FFCC08] bg-gray-100 border-gray-300 rounded focus:ring-[#FFCC08] focus:ring-2"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Product is active and visible to customers
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={productForm.featured}
                      onChange={(e) => setProductForm({...productForm, featured: e.target.checked})}
                      className="w-4 h-4 text-[#FFCC08] bg-gray-100 border-gray-300 rounded focus:ring-[#FFCC08] focus:ring-2"
                    />
                    <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Featured product (shows prominently)
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="requiresApproval"
                      checked={productForm.requiresApproval}
                      onChange={(e) => setProductForm({...productForm, requiresApproval: e.target.checked})}
                      className="w-4 h-4 text-[#FFCC08] bg-gray-100 border-gray-300 rounded focus:ring-[#FFCC08] focus:ring-2"
                    />
                    <label htmlFor="requiresApproval" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Requires manual approval for orders
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProduct}
                  className="flex-1 px-4 py-3 bg-[#FFCC08] text-black rounded-xl font-semibold hover:bg-yellow-500 transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProduct ? 'Update Product' : 'Add Product'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProductManager;
