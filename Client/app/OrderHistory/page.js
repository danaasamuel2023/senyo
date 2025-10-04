'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package, Search, Filter, Download, RefreshCw, ArrowLeft,
  CheckCircle, XCircle, Clock, AlertCircle, Eye, Calendar,
  Wifi, Phone, Hash, ChevronDown, TrendingUp, DollarSign,
  Activity, BarChart3, FileText, Copy, ExternalLink, Star
} from 'lucide-react';

const OrderHistoryPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterNetwork, setFilterNetwork] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notification, setNotification] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalSpent: 0,
    totalData: 0
  });

  useEffect(() => {
    checkAuth();
    loadOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, filterStatus, filterNetwork, dateRange]);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!token) {
      router.push('/SignIn');
      return false;
    }
    
    setUserData(user);
    return true;
  };

  const loadOrders = async () => {
    if (!checkAuth()) return;
    
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://unlimitedata.onrender.com';
      const userId = JSON.parse(localStorage.getItem('userData')).id;

      const response = await fetch(
        `${API_URL}/api/v1/data/purchase-history/${userId}?limit=1000`,
        {
          headers: {
            'x-auth-token': localStorage.getItem('authToken')
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const purchases = data.data.purchases || [];
        setOrders(purchases);
        calculateStats(purchases);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      showNotification('Failed to load order history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersList) => {
    const stats = {
      totalOrders: ordersList.length,
      completed: ordersList.filter(o => o.status === 'completed').length,
      pending: ordersList.filter(o => o.status === 'pending').length,
      failed: ordersList.filter(o => o.status === 'failed').length,
      totalSpent: ordersList.reduce((sum, o) => sum + (o.price || 0), 0),
      totalData: ordersList.reduce((sum, o) => sum + (o.capacity || 0), 0)
    };
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.phoneNumber?.includes(searchTerm) ||
        order.network?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.geonetReference?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    // Network filter
    if (filterNetwork !== 'all') {
      filtered = filtered.filter(order => order.network === filterNetwork);
    }

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(order => 
        new Date(order.createdAt) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(order =>
        new Date(order.createdAt) <= new Date(dateRange.end + 'T23:59:59')
      );
    }

    setFilteredOrders(filtered);
    calculateStats(filtered);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard', 'success');
  };

  const exportToCSV = () => {
    const csv = [
      ['Date', 'Reference', 'Network', 'Capacity', 'Phone', 'Price', 'Status'].join(','),
      ...filteredOrders.map(order => [
        new Date(order.createdAt).toLocaleDateString(),
        order.geonetReference,
        order.network,
        `${order.capacity}GB`,
        order.phoneNumber,
        order.price,
        order.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showNotification('Order history exported', 'success');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
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

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Order Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Order Reference</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="font-medium text-gray-900 dark:text-white font-mono text-sm">
                      {selectedOrder.geonetReference}
                    </p>
                    <button
                      onClick={() => copyToClipboard(selectedOrder.geonetReference)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusColor(selectedOrder.status)
                    }`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="ml-1 capitalize">{selectedOrder.status}</span>
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Network</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">{selectedOrder.network}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Data Capacity</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">{selectedOrder.capacity}GB</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.phoneNumber}</p>
                    <button
                      onClick={() => copyToClipboard(selectedOrder.phoneNumber)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Amount Paid</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">GHS {selectedOrder.price?.toFixed(2)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Gateway</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-1 capitalize">
                    {selectedOrder.gateway || 'Wallet'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order History</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">View all your data purchases</p>
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-colors font-medium flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export</span>
            </button>
            <button
              onClick={loadOrders}
              className="p-2 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Orders</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border-l-4 border-green-500">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border-l-4 border-yellow-500">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border-l-4 border-red-500">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Failed</div>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Spent</div>
            <div className="text-2xl font-bold text-purple-600">GHS {stats.totalSpent.toFixed(0)}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Data</div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalData}GB</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by phone or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={filterNetwork}
              onChange={(e) => setFilterNetwork(e.target.value)}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
            >
              <option value="all">All Networks</option>
              <option value="YELLO">MTN (YELLO)</option>
              <option value="TELECEL">Telecel</option>
              <option value="AT_PREMIUM">AirtelTigo Premium</option>
              <option value="at">AirtelTigo</option>
            </select>

            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
            />

            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 text-[#FFCC08] animate-spin" />
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Reference</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Network</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Capacity</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Phone</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Price</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-sm text-gray-900 dark:text-white">
                            {order.geonetReference?.slice(0, 15)}...
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Wifi className="w-4 h-4 text-[#FFCC08]" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{order.network}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                        {order.capacity}GB
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{order.phoneNumber}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                        GHS {order.price?.toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getStatusColor(order.status)
                        }`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Orders Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || filterStatus !== 'all' || filterNetwork !== 'all'
                  ? 'No orders match your filters'
                  : 'You haven\'t made any purchases yet'}
              </p>
              <button
                onClick={() => router.push('/mtnup2u')}
                className="px-6 py-3 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-colors font-bold"
              >
                Purchase Data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
