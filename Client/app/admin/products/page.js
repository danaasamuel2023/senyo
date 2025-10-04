'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import adminAPI from '../../../utils/adminApi';
import {
  Package2, Plus, Edit, Trash2, Search, Filter, Download, Upload,
  ArrowLeft, Save, X, AlertCircle, CheckCircle, RefreshCw, Eye,
  DollarSign, TrendingUp, BarChart3, ShoppingCart, Zap, Wifi
} from 'lucide-react';

const ProductsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [globalProducts, setGlobalProducts] = useState([]);

  // Network configurations
  const NETWORKS = [
    { id: 'MTN', name: 'MTN', color: 'bg-yellow-500' },
    { id: 'VODAFONE', name: 'Vodafone', color: 'bg-red-500' },
    { id: 'TELECEL', name: 'Telecel', color: 'bg-blue-500' },
    { id: 'AT_PREMIUM', name: 'AirtelTigo Premium', color: 'bg-purple-500' },
    { id: 'airteltigo', name: 'AirtelTigo', color: 'bg-purple-400' },
    { id: 'at', name: 'AT', color: 'bg-purple-300' }
  ];

  // Data packages
  const DATA_PACKAGES = [
    { capacity: 1, price: 5 },
    { capacity: 2, price: 9 },
    { capacity: 3, price: 13 },
    { capacity: 5, price: 20 },
    { capacity: 10, price: 38 },
    { capacity: 20, price: 75 },
    { capacity: 30, price: 110 },
    { capacity: 50, price: 180 },
    { capacity: 100, price: 350 },
    { capacity: 200, price: 680 }
  ];

  useEffect(() => {
    checkAuth();
    loadInventory();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!token || user.role !== 'admin') {
      router.push('/SignIn');
      return false;
    }
    return true;
  };

  const loadInventory = async () => {
    if (!checkAuth()) return;
    
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const [inventoryResp, productsResp] = await Promise.all([
        adminAPI.inventory.getInventory(),
        fetch(`${API_URL}/api/products`, {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('authToken')
          }
        }).then(r => r.json())
      ]);
      
      setInventory(inventoryResp.inventory);
      setGlobalProducts(productsResp.products || []);
      
      // Create products from inventory and global pricing
      const productsList = [];
      inventoryResp.inventory.forEach(inv => {
        DATA_PACKAGES.forEach(pkg => {
          // Check if there's a global price override
          const globalPrice = productsResp.products?.find(
            p => p.network === inv.network && p.capacity === pkg.capacity
          );
          
          productsList.push({
            id: `${inv.network}_${pkg.capacity}GB`,
            network: inv.network,
            capacity: pkg.capacity,
            price: globalPrice?.price || pkg.price,
            inStock: inv.inStock,
            skipGeonettech: inv.skipGeonettech,
            updatedAt: inv.updatedAt,
            hasCustomPrice: !!globalPrice,
            globalPriceId: globalPrice?._id
          });
        });
      });
      setProducts(productsList);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      showNotification('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleToggleStock = async (network) => {
    try {
      await adminAPI.inventory.toggleNetworkStock(network);
      showNotification(`${network} stock status updated`, 'success');
      loadInventory();
    } catch (error) {
      console.error('Failed to toggle stock:', error);
      showNotification('Failed to update stock status', 'error');
    }
  };

  const handleToggleAPI = async (network) => {
    try {
      await adminAPI.inventory.toggleGeonettech(network);
      showNotification(`${network} API status updated`, 'success');
      loadInventory();
    } catch (error) {
      console.error('Failed to toggle API:', error);
      showNotification('Failed to update API status', 'error');
    }
  };

  const handleUpdatePrice = async (product) => {
    const newPrice = prompt(`Update price for ${product.network} ${product.capacity}GB\nCurrent: GHS ${product.price}`, product.price);
    
    if (newPrice && !isNaN(newPrice) && parseFloat(newPrice) > 0) {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
        if (product.globalPriceId) {
          await fetch(`${API_URL}/api/products/${product.globalPriceId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': localStorage.getItem('authToken')
            },
            body: JSON.stringify({ price: parseFloat(newPrice) })
          });
        } else {
          await fetch(`${API_URL}/api/products`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': localStorage.getItem('authToken')
            },
            body: JSON.stringify({
              network: product.network,
              capacity: product.capacity,
              price: parseFloat(newPrice),
              enabled: true
            })
          });
        }
        
        showNotification('Price updated successfully', 'success');
        loadInventory();
      } catch (error) {
        console.error('Failed to update price:', error);
        showNotification('Failed to update price', 'error');
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.network.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.capacity.toString().includes(searchTerm)
  );

  // Group products by network
  const groupedProducts = NETWORKS.map(network => ({
    ...network,
    products: filteredProducts.filter(p => p.network === network.id),
    inventoryData: inventory.find(inv => inv.network === network.id)
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg flex items-center space-x-3 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage data packages and inventory</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
                <Package2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Total Products</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{products.length}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">In Stock</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {products.filter(p => p.inStock).length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600">
                <Wifi className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Networks</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{NETWORKS.length}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">API Active</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {inventory.filter(i => !i.skipGeonettech).length}
            </p>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by network or capacity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08] transition-all"
              />
            </div>
          </div>
          <button
            onClick={loadInventory}
            className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Products by Network */}
      <div className="space-y-6">
        {groupedProducts.map((networkGroup) => (
          <div key={networkGroup.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            {/* Network Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${networkGroup.color} rounded-xl flex items-center justify-center`}>
                    <Wifi className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{networkGroup.name}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`text-sm ${networkGroup.inventoryData?.inStock ? 'text-green-600' : 'text-red-600'}`}>
                        {networkGroup.inventoryData?.inStock ? '● In Stock' : '● Out of Stock'}
                      </span>
                      <span className={`text-sm ${networkGroup.inventoryData?.skipGeonettech ? 'text-yellow-600' : 'text-blue-600'}`}>
                        {networkGroup.inventoryData?.skipGeonettech ? '● API Disabled' : '● API Active'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleStock(networkGroup.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      networkGroup.inventoryData?.inStock
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                    }`}
                  >
                    Toggle Stock
                  </button>
                  <button
                    onClick={() => handleToggleAPI(networkGroup.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      networkGroup.inventoryData?.skipGeonettech
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}
                  >
                    Toggle API
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {networkGroup.products.length > 0 ? (
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {DATA_PACKAGES.map((pkg) => {
                    const product = networkGroup.products.find(p => p.capacity === pkg.capacity);
                    const isAvailable = product && product.inStock;
                    
                    return (
                      <div
                        key={pkg.capacity}
                        className={`p-4 rounded-xl border-2 transition-all group ${
                          isAvailable
                            ? 'border-gray-200 dark:border-gray-600 hover:border-[#FFCC08] dark:hover:border-[#FFCC08]'
                            : 'border-gray-100 dark:border-gray-700 opacity-50'
                        }`}
                      >
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {pkg.capacity}GB
                          </p>
                          <p className="text-lg font-medium text-[#FFCC08] mt-1">
                            GHS {product?.price || pkg.price}
                          </p>
                          {product?.hasCustomPrice && (
                            <p className="text-xs text-blue-600 dark:text-blue-400">Custom Price</p>
                          )}
                          <div className={`mt-2 text-xs font-medium ${
                            isAvailable ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isAvailable ? 'Available' : 'Unavailable'}
                          </div>
                          <button
                            onClick={() => handleUpdatePrice(product || {network: networkGroup.id, capacity: pkg.capacity, price: pkg.price})}
                            className="mt-2 w-full px-2 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Edit Price
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No products found for this network
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
