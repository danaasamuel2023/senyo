'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, DollarSign, TrendingUp, Package, UserPlus, Activity,
  Calendar, Download, Eye, Plus, Search, Filter, ChevronRight,
  Home, ShoppingCart, Wallet, BarChart3, Settings, LogOut, Menu,
  X, Bell, RefreshCw, CheckCircle, AlertCircle, Clock, Star,
  Phone, Mail, MapPin, Copy, ExternalLink, ArrowUp, ArrowDown,
  CreditCard, Shield, Zap, Award, Target
} from 'lucide-react';

const AgentDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notification, setNotification] = useState(null);
  const [userData, setUserData] = useState(null);

  // Agent data
  const [agentStats, setAgentStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalCommission: 0,
    pendingCommission: 0,
    monthlyTarget: 5000,
    monthlyAchievement: 0,
    conversionRate: 0,
    agentLevel: 'bronze'
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [commissionHistory, setCommissionHistory] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!token || user.role !== 'agent') {
      router.push('/SignIn');
      return false;
    }
    
    setUserData(user);
    return true;
  };

  const loadDashboardData = async () => {
    if (!checkAuth()) return;
    
    setLoading(true);
    try {
      // Load agent-specific data
      await Promise.all([
        loadAgentStats(),
        loadRecentActivities(),
        loadCustomers(),
        loadCommissionHistory(),
        loadCatalog()
      ]);
    } catch (error) {
      showNotification('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAgentStats = async () => {
    // Simulate loading agent stats - replace with API call
    setAgentStats({
      totalCustomers: 45,
      activeCustomers: 32,
      totalCommission: 2340.50,
      pendingCommission: 450.00,
      monthlyTarget: 5000,
      monthlyAchievement: 3200,
      conversionRate: 68.5,
      agentLevel: 'silver'
    });
  };

  const loadRecentActivities = async () => {
    setRecentActivities([
      { id: 1, type: 'customer', message: 'New customer registered', time: '2 hours ago', icon: UserPlus },
      { id: 2, type: 'sale', message: 'Customer purchased 50GB MTN', time: '4 hours ago', icon: ShoppingCart },
      { id: 3, type: 'commission', message: 'Commission earned: GHS 25', time: '1 day ago', icon: DollarSign },
      { id: 4, type: 'achievement', message: 'Weekly target achieved!', time: '2 days ago', icon: Award }
    ]);
  };

  const loadCustomers = async () => {
    setCustomers([
      { id: 1, name: 'John Doe', phone: '+233501234567', totalPurchases: 5, lastPurchase: '2 days ago', status: 'active' },
      { id: 2, name: 'Jane Smith', phone: '+233501234568', totalPurchases: 3, lastPurchase: '1 week ago', status: 'active' },
      { id: 3, name: 'Bob Johnson', phone: '+233501234569', totalPurchases: 1, lastPurchase: '2 weeks ago', status: 'inactive' }
    ]);
  };

  const loadCommissionHistory = async () => {
    setCommissionHistory([
      { id: 1, date: '2024-03-01', amount: 450.00, status: 'paid', orders: 15 },
      { id: 2, date: '2024-02-01', amount: 380.00, status: 'paid', orders: 12 },
      { id: 3, date: '2024-01-01', amount: 520.00, status: 'paid', orders: 18 }
    ]);
  };

  const loadCatalog = async () => {
    try {
      const response = await adminAPI.agent.getMyCatalog();
      setCatalogProducts(response.items || []);
    } catch (error) {
      console.error('Failed to load catalog:', error);
      // Set empty catalog on error
      setCatalogProducts([]);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    router.push('/SignIn');
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'store', label: 'My Store', icon: ShoppingCart, badge: catalogProducts.length },
    { id: 'customize', label: 'Customize Store', icon: Zap },
    { id: 'customers', label: 'My Customers', icon: Users, badge: customers.length },
    { id: 'commissions', label: 'Commissions', icon: DollarSign },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'resources', label: 'Resources', icon: Package },
    { id: 'profile', label: 'Profile', icon: Settings }
  ];

  const StatCard = ({ title, value, change, icon: Icon, color, subtitle }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-sm font-medium ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
  );

  const renderOverview = () => {
    // Get agent code from correct path in userData or from localStorage
    const storedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userData') || '{}') : {};
    const agentCode = userData?.agentMetadata?.agentCode || storedUser?.agentMetadata?.agentCode;
    
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#FFCC08] to-yellow-500 rounded-2xl p-6 text-black">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {userData?.name || 'Agent'}!</h2>
          <p className="text-black/80">
            You're doing great! Keep up the excellent work.
          </p>
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span className="font-medium capitalize">{agentStats.agentLevel} Level</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span className="font-medium">
                {((agentStats.monthlyAchievement / agentStats.monthlyTarget) * 100).toFixed(0)}% of target
              </span>
            </div>
          </div>
        </div>

        {/* Store Link Section */}
        {agentCode && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Store Link</h3>
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3">
              <code className="text-sm font-mono text-gray-900 dark:text-white flex-1 overflow-x-auto">
                {typeof window !== 'undefined' ? `${window.location.origin}/agent-store/${agentCode}` : ''}
              </code>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    navigator.clipboard.writeText(`${window.location.origin}/agent-store/${agentCode}`);
                    showNotification('Store link copied!', 'success');
                  }
                }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.open(`/agent-store/${agentCode}`, '_blank');
                  }
                }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Share this link with your customers to sell products
            </p>
          </div>
        )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Customers"
          value={agentStats.totalCustomers}
          change={12.5}
          icon={Users}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Active Customers"
          value={agentStats.activeCustomers}
          icon={Activity}
          color="from-green-500 to-green-600"
          subtitle={`${((agentStats.activeCustomers / agentStats.totalCustomers) * 100).toFixed(0)}% active rate`}
        />
        <StatCard
          title="Total Commission"
          value={`GHS ${agentStats.totalCommission.toLocaleString()}`}
          change={8.3}
          icon={DollarSign}
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Pending Commission"
          value={`GHS ${agentStats.pendingCommission.toLocaleString()}`}
          icon={Clock}
          color="from-yellow-500 to-yellow-600"
        />
      </div>

      {/* Performance Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Monthly Performance</h3>
        <div className="relative">
          <div className="flex items-end justify-between h-48 space-x-2">
            {[65, 78, 82, 91, 87, 94, agentStats.conversionRate].map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-[#FFCC08] rounded-t-lg transition-all duration-500"
                  style={{ height: `${value}%` }}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 dark:text-gray-400">
                    {value}%
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activities
          </h3>
          <div className="space-y-3">
            {recentActivities.map(activity => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'customer' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'sale' ? 'bg-green-100 text-green-600' :
                    activity.type === 'commission' ? 'bg-purple-100 text-purple-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setActiveTab('customers')}
              className="p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all text-center"
            >
              <UserPlus className="w-6 h-6 text-gray-700 dark:text-gray-300 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Customer</span>
            </button>
            <button className="p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all text-center">
              <Eye className="w-6 h-6 text-gray-700 dark:text-gray-300 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View Sales</span>
            </button>
            <button className="p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all text-center">
              <Download className="w-6 h-6 text-gray-700 dark:text-gray-300 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Download Report</span>
            </button>
            <button className="p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all text-center">
              <Phone className="w-6 h-6 text-gray-700 dark:text-gray-300 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Support</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    );
  };

  const renderCustomers = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Customers</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your customer base</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-colors font-medium">
          <Plus className="w-5 h-5" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08] transition-all"
              />
            </div>
          </div>
          <button className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Customer</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Contact</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Purchases</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Last Purchase</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FFCC08] to-yellow-500 flex items-center justify-center text-black font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{customer.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{customer.phone}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {customer.totalPurchases}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                    {customer.lastPurchase}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStore = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Store</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Products available in your store</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadCatalog}
            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {catalogProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {catalogProducts.filter(p => p.enabled).map((product) => (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-2 border-gray-200 dark:border-gray-600 hover:border-[#FFCC08] dark:hover:border-[#FFCC08] transition-all">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#FFCC08] to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-black" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{product.network}</h3>
                <p className="text-3xl font-bold text-[#FFCC08] my-2">{product.capacity}GB</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  GHS {product.price}
                </p>
                {product.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{product.description}</p>
                )}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Share this product with your customers
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Products Yet</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Contact your administrator to add products to your store catalog.
          </p>
        </div>
      )}
    </div>
  );

  const renderCommissions = () => (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Commission History</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track your earnings</p>
      </div>

      {/* Commission Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-l-4 border-green-500">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm">Total Earned</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            GHS {agentStats.totalCommission.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-l-4 border-yellow-500">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm">Pending</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            GHS {agentStats.pendingCommission.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-l-4 border-blue-500">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm">This Month</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            GHS {(agentStats.monthlyAchievement * 0.05).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Commission History */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Period</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Orders</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Commission</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {commissionHistory.map((commission) => (
                <tr key={commission.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(commission.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                    {commission.orders}
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                    GHS {commission.amount.toFixed(2)}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      commission.status === 'paid' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {commission.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'store':
        return renderStore();
      case 'customize':
        router.push('/agent/customize-store');
        return null;
      case 'customers':
        return renderCustomers();
      case 'commissions':
        return renderCommissions();
      case 'performance':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Coming soon...</p>
            </div>
          </div>
        );
      case 'resources':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Agent Resources</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Coming soon...</p>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Settings</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Coming soon...</p>
            </div>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 z-40 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#FFCC08] to-yellow-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg text-gray-900 dark:text-white">Agent Portal</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">UnlimitedData GH</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all mb-2 ${
                  isActive
                    ? 'bg-[#FFCC08] text-black'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-auto px-2 py-0.5 text-xs rounded-full ${
                        isActive ? 'bg-black text-[#FFCC08]' : 'bg-[#FFCC08] text-black'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          {sidebarOpen ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#FFCC08] to-yellow-500 rounded-full flex items-center justify-center text-black font-bold">
                {userData?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {userData?.name || 'Agent'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {agentStats.agentLevel} Agent
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors flex justify-center"
            >
              <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                {activeTab === 'overview' ? 'Agent Dashboard' : activeTab}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button
                onClick={loadDashboardData}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 text-[#FFCC08] animate-spin" />
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </main>
    </div>
  );
};

export default AgentDashboard;
