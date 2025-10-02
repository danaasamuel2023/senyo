'use client';

import React, { useState, useEffect } from 'react';
import { User, BarChart3, Package, Clock, CreditCard, FileText, Settings, Search, Calendar, DollarSign, Users, TrendingUp, LogOut, Sun, Moon, Menu, X, ChevronRight, AlertCircle, CheckCircle, RefreshCw, Plus, Filter, Download, Upload, Edit, Trash2, Eye, Database, Shield, Activity, PieChart, ArrowUp, ArrowDown, Bell, HelpCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [currentDate, setCurrentDate] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  // API Base URL
  const API_BASE_URL = 'https://unlimitedata.onrender.com';

  useEffect(() => {
    const date = new Date().toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric' 
    });
    setCurrentDate(date);
    
    // Load actual balance from your API
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/balance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data && data.balance !== undefined) {
        setBalance(data.balance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const navigationItems = [
    { id: 'users', label: 'User Management', icon: User },
    { id: 'analytics', label: 'Business Analytics', icon: BarChart3 },
    { id: 'orders', label: 'All Orders', icon: Package },
    { id: 'order-mgmt', label: 'Order Management', icon: Clock },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'inventory', label: 'Inventory', icon: Database },
    { id: 'transfers', label: 'Transfers', icon: CreditCard }
  ];

  // User Management Component
  const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
      fetchUsers();
    }, []);

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data && Array.isArray(data)) {
          setUsers(data);
        } else if (data && data.users) {
          setUsers(data.users);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            User Management
          </h2>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            <Plus size={18} />
            <span>Add User</span>
          </button>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
              <Download size={18} />
              <span>Export</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>User ID</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Name</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Role</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8">
                        <Users className="mx-auto mb-4 opacity-50" size={48} />
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                          No users found. Add your first user to get started.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        {/* User data rows */}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Business Analytics Component
  const BusinessAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState({
      revenue: 0,
      orders: 0,
      customers: 0,
      growth: 0
    });

    useEffect(() => {
      fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/analytics`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data) {
          setAnalyticsData({
            revenue: data.revenue || 0,
            orders: data.orders || 0,
            customers: data.customers || 0,
            growth: data.growth || 0
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Business Analytics
          </h2>
          <div className="flex space-x-2">
            <select className={`px-4 py-2 rounded-lg ${
              darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
            }`}>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
              <option>Last year</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total Revenue</span>
              <DollarSign className="text-green-500" size={24} />
            </div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              GHS {analyticsData.revenue.toFixed(2)}
            </div>
            <div className="flex items-center mt-2 text-green-500 text-sm">
              <ArrowUp size={16} />
              <span>12% from last month</span>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total Orders</span>
              <Package className="text-blue-500" size={24} />
            </div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {analyticsData.orders}
            </div>
            <div className="flex items-center mt-2 text-blue-500 text-sm">
              <ArrowUp size={16} />
              <span>8% from last month</span>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Customers</span>
              <Users className="text-purple-500" size={24} />
            </div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {analyticsData.customers}
            </div>
            <div className="flex items-center mt-2 text-purple-500 text-sm">
              <ArrowUp size={16} />
              <span>5% from last month</span>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Growth Rate</span>
              <TrendingUp className="text-orange-500" size={24} />
            </div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {analyticsData.growth}%
            </div>
            <div className="flex items-center mt-2 text-orange-500 text-sm">
              <ArrowUp size={16} />
              <span>Positive trend</span>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Revenue Chart
          </h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
            <div className="text-center">
              <PieChart className="mx-auto mb-4 opacity-50" size={48} />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Connect your analytics API to display charts
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // All Orders Component
  const AllOrders = () => {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
      fetchOrders();
    }, []);

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data && Array.isArray(data)) {
          setOrders(data);
        } else if (data && data.orders) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            All Orders
          </h2>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            <Plus size={18} />
            <span>New Order</span>
          </button>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search orders by ID, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading orders...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Order ID</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Customer</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Amount</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8">
                        <Package className="mx-auto mb-4 opacity-50" size={48} />
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                          No orders found. Orders will appear here once created.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        {/* Order data rows */}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Order Management Component
  const OrderManagement = () => {
    const [activeOrders, setActiveOrders] = useState([]);
    const [processingStats, setProcessingStats] = useState({
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0
    });

    useEffect(() => {
      fetchActiveOrders();
    }, []);

    const fetchActiveOrders = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/active`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data) {
          if (Array.isArray(data)) {
            setActiveOrders(data);
          } else if (data.orders) {
            setActiveOrders(data.orders);
          }
          if (data.stats) {
            setProcessingStats(data.stats);
          }
        }
      } catch (error) {
        console.error('Error fetching active orders:', error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Order Management
          </h2>
          <div className="flex space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
              <Upload size={18} />
              <span>Bulk Update</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className={`${darkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-2">
              <span className={darkMode ? 'text-yellow-400' : 'text-yellow-700'}>Pending</span>
              <Clock className="text-yellow-500" size={20} />
            </div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
              {processingStats.pending}
            </div>
          </div>

          <div className={`${darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-2">
              <span className={darkMode ? 'text-blue-400' : 'text-blue-700'}>Processing</span>
              <RefreshCw className="text-blue-500" size={20} />
            </div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
              {processingStats.processing}
            </div>
          </div>

          <div className={`${darkMode ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200'} border rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-2">
              <span className={darkMode ? 'text-purple-400' : 'text-purple-700'}>Shipped</span>
              <Package className="text-purple-500" size={20} />
            </div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>
              {processingStats.shipped}
            </div>
          </div>

          <div className={`${darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'} border rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-2">
              <span className={darkMode ? 'text-green-400' : 'text-green-700'}>Delivered</span>
              <CheckCircle className="text-green-500" size={20} />
            </div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
              {processingStats.delivered}
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Order Processing Queue
          </h3>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading orders...</p>
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto mb-4 opacity-50" size={48} />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                No orders in queue. All orders are processed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active orders list */}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Reports Component
  const Reports = () => {
    const [reportType, setReportType] = useState('sales');
    const [dateRange, setDateRange] = useState('month');

    const generateReport = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/reports/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ 
            type: reportType, 
            range: dateRange 
          })
        });
        const data = await response.json();
        
        // Handle report download if API returns a URL or blob
        if (data.downloadUrl) {
          window.open(data.downloadUrl, '_blank');
        } else if (data.reportData) {
          // Process report data
          console.log('Report generated:', data.reportData);
        }
      } catch (error) {
        console.error('Error generating report:', error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Reports
          </h2>
          <button 
            onClick={generateReport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Download size={18} />
            <span>Generate Report</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Report Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg ${
                    darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <option value="sales">Sales Report</option>
                  <option value="inventory">Inventory Report</option>
                  <option value="customers">Customer Report</option>
                  <option value="financial">Financial Report</option>
                  <option value="transfers">Transfer Report</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg ${
                    darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              {dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      className={`w-full px-4 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      End Date
                    </label>
                    <input
                      type="date"
                      className={`w-full px-4 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Recent Reports
            </h3>
            <div className="space-y-3">
              <div className="text-center py-8">
                <FileText className="mx-auto mb-4 opacity-50" size={48} />
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Generated reports will appear here
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Quick Stats
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Activity className="mx-auto mb-2 text-blue-500" size={32} />
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>0</p>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Reports Today</p>
            </div>
            <div className="text-center">
              <Calendar className="mx-auto mb-2 text-green-500" size={32} />
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>0</p>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>This Week</p>
            </div>
            <div className="text-center">
              <FileText className="mx-auto mb-2 text-purple-500" size={32} />
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>0</p>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>This Month</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Inventory Component
  const Inventory = () => {
    const [inventory, setInventory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('all');

    useEffect(() => {
      fetchInventory();
    }, []);

    const fetchInventory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/inventory`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data && Array.isArray(data)) {
          setInventory(data);
        } else if (data && data.inventory) {
          setInventory(data.inventory);
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Inventory Management
          </h2>
          <div className="flex space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <Plus size={18} />
              <span>Add Product</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
              <Upload size={18} />
              <span>Import</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-2">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total Products</span>
              <Package className="text-blue-500" size={20} />
            </div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>0</div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-2">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>In Stock</span>
              <CheckCircle className="text-green-500" size={20} />
            </div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>0</div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-2">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Low Stock</span>
              <AlertCircle className="text-yellow-500" size={20} />
            </div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>0</div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-2">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Out of Stock</span>
              <X className="text-red-500" size={20} />
            </div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>0</div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`px-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
              }`}
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="food">Food</option>
              <option value="other">Other</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading inventory...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Product ID</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Name</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Category</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Stock</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Price</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8">
                        <Database className="mx-auto mb-4 opacity-50" size={48} />
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                          No products in inventory. Add your first product to get started.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    inventory.map((item) => (
                      <tr key={item.id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        {/* Inventory data rows */}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Transfers Component
  const Transfers = () => {
    const [transfers, setTransfers] = useState([]);
    const [todayStats, setTodayStats] = useState({
      total: 0,
      amount: 0,
      workers: 0
    });
    const [activeSection, setActiveSection] = useState('today');

    useEffect(() => {
      fetchTransfers();
    }, []);

    const fetchTransfers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/transfers`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data) {
          if (Array.isArray(data)) {
            setTransfers(data);
          } else if (data.transfers) {
            setTransfers(data.transfers);
          }
          if (data.stats) {
            setTodayStats({
              total: data.stats.total || 0,
              amount: data.stats.amount || 0,
              workers: data.stats.workers || 0
            });
          }
        }
      } catch (error) {
        console.error('Error fetching transfers:', error);
      } finally {
        setLoading(false);
      }
    };

    const transferSections = [
      { id: 'process', label: 'Process Payment', icon: DollarSign },
      { id: 'today', label: "Today's Transfers", icon: Calendar },
      { id: 'search', label: 'Search', icon: Search },
      { id: 'reports', label: 'Reports', icon: FileText }
    ];

    return (
      <div className="flex">
        {/* Transfer Sidebar */}
        <aside className={`w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} h-full`}>
          <div className="p-6">
            <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Transfer Management
            </h2>
            <div className="space-y-2">
              {transferSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-500 text-white'
                        : darkMode
                          ? 'hover:bg-gray-700 text-gray-300'
                          : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{section.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Transfer Main Content */}
        <div className="flex-1 p-6">
          {activeSection === 'today' && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Today's Transfers - {currentDate}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-500 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-blue-100">Total Transfers</span>
                    <TrendingUp className="text-blue-200" size={24} />
                  </div>
                  <div className="text-4xl font-bold">{todayStats.total}</div>
                </div>

                <div className="bg-green-500 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-green-100">Total Amount</span>
                    <TrendingUp className="text-green-200" size={24} />
                  </div>
                  <div className="text-4xl font-bold">GHS {todayStats.amount.toFixed(2)}</div>
                </div>

                <div className="bg-purple-500 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-purple-100">Active Workers</span>
                    <Users className="text-purple-200" size={24} />
                  </div>
                  <div className="text-4xl font-bold">{todayStats.workers}</div>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Performance by Worker
                </h3>
                <div className="text-center py-8">
                  <Users className="mx-auto mb-4 opacity-50" size={48} />
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Worker performance data will appear here
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'process' && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Process Payment
              </h2>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
                <form className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      className={`w-full px-4 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter recipient name"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Amount (GHS)
                    </label>
                    <input
                      type="number"
                      className={`w-full px-4 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Payment Method
                    </label>
                    <select className={`w-full px-4 py-2 rounded-lg ${
                      darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                    }`}>
                      <option>Mobile Money</option>
                      <option>Bank Transfer</option>
                      <option>Cash</option>
                    </select>
                  </div>
                  <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-medium">
                    Process Payment
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeSection === 'search' && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Search Transfers
              </h2>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
                <div className="flex gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Search by ID, name, or amount..."
                    className={`flex-1 px-4 py-2 rounded-lg ${
                      darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Search
                  </button>
                </div>
                <div className="text-center py-12">
                  <Search className="mx-auto mb-4 opacity-50" size={48} />
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Enter search criteria to find transfers
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'reports' && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Transfer Reports
              </h2>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
                <div className="text-center py-12">
                  <FileText className="mx-auto mb-4 opacity-50" size={48} />
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Transfer reports will be available here
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Component Rendering based on active tab
  const renderContent = () => {
    switch(activeTab) {
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <BusinessAnalytics />;
      case 'orders':
        return <AllOrders />;
      case 'order-mgmt':
        return <OrderManagement />;
      case 'reports':
        return <Reports />;
      case 'inventory':
        return <Inventory />;
      case 'transfers':
        return <Transfers />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <div>
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Admin Dashboard
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  UnlimitedData GH
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
              Balance: GHS {balance.toFixed(2)}
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-700 text-gray-300 relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`px-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex space-x-1 overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-3 whitespace-nowrap transition-colors ${
                    activeTab === item.id
                      ? 'bg-green-500 text-white'
                      : darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } rounded-t-lg`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={activeTab === 'transfers' ? '' : 'p-6'}>
        {renderContent()}
      </main>
    </div>
  );
}