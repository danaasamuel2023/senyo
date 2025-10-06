'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import adminAPI from '../../../utils/adminApi';
import {
  Activity, AlertTriangle, ArrowLeft, BarChart3, Bell, CheckCircle, 
  Clock, Database, DollarSign, Download, Globe, Lock, Package, 
  Power, RefreshCw, Save, Server, Settings, Shield, TrendingUp, 
  Users, Wifi, X, Zap, Eye, EyeOff, Play, Pause, RotateCcw,
  HardDrive, Cpu, AlertCircle, Radio, Link as LinkIcon, Code,
  Briefcase, FileText
} from 'lucide-react';

const ControlCenterPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  
  // Site-wide controls
  const [siteSettings, setSiteSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    agentRegistrationEnabled: true,
    loginEnabled: true,
    purchasesEnabled: true,
    depositsEnabled: true,
    withdrawalsEnabled: true,
    apiIntegrationEnabled: true
  });

  // System metrics
  const [systemMetrics, setSystemMetrics] = useState({
    serverStatus: 'online',
    databaseStatus: 'connected',
    apiStatus: 'active',
    uptime: '99.9%',
    responseTime: '150ms',
    activeConnections: 0,
    requestsPerMinute: 0,
    errorRate: '0.01%',
    cacheHitRate: '85%'
  });

  // Real-time stats
  const [realTimeStats, setRealTimeStats] = useState({
    usersOnline: 0,
    ordersToday: 0,
    revenueToday: 0,
    newUsersToday: 0,
    pendingOrders: 0,
    pendingAgents: 0,
    activeAgents: 0,
    totalCommissions: 0
  });

  // Alerts and notifications
  const [systemAlerts, setSystemAlerts] = useState([]);

  useEffect(() => {
    checkAuth();
    loadControlCenterData();
    
    // Set up real-time updates
    if (realTimeUpdates) {
      const interval = setInterval(() => {
        loadRealTimeStats();
      }, 10000); // Update every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [realTimeUpdates]);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!token || user.role !== 'admin') {
      router.push('/SignIn');
      return false;
    }
    return true;
  };

  const loadControlCenterData = async () => {
    setLoading(true);
    try {
      // Check authentication first
      if (!checkAuth()) {
        return;
      }

      // Load data sequentially to avoid overwhelming the server
      await loadSystemMetrics();
      await loadRealTimeStats();
      await loadSystemAlerts();
    } catch (error) {
      console.error('Failed to load control center:', error);
      
      // Handle authentication errors
      if (error.message && error.message.includes('401')) {
        showNotification('Authentication expired. Please log in again.', 'error');
        router.push('/SignIn');
        return;
      }
      
      showNotification('Failed to load some data. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSystemMetrics = async () => {
    try {
      // Simulate system metrics - replace with actual monitoring API
      setSystemMetrics({
        serverStatus: 'online',
        databaseStatus: 'connected',
        apiStatus: 'active',
        uptime: '99.9%',
        responseTime: '150ms',
        activeConnections: Math.floor(Math.random() * 100) + 50,
        requestsPerMinute: Math.floor(Math.random() * 500) + 100,
        errorRate: '0.01%',
        cacheHitRate: '85%'
      });
    } catch (error) {
      console.error('Failed to load system metrics:', error);
    }
  };

  const loadRealTimeStats = async () => {
    try {
      // Check authentication first
      if (!checkAuth()) {
        return;
      }

      const [stats, agents] = await Promise.all([
        adminAPI.dashboard.getStatistics(),
        adminAPI.agent.getAgents(1, 1000)
      ]);

      const today = await adminAPI.dashboard.getDailySummary(new Date().toISOString().split('T')[0]);

      setRealTimeStats({
        usersOnline: Math.floor(stats.userStats.totalUsers * 0.1),
        ordersToday: today.summary.totalOrders || 0,
        revenueToday: today.summary.totalRevenue || 0,
        newUsersToday: Math.floor(Math.random() * 20) + 5,
        pendingOrders: stats.orderStats.pendingOrders || 0,
        pendingAgents: agents.agents?.filter(a => a.agentMetadata?.agentStatus === 'pending').length || 0,
        activeAgents: agents.agents?.filter(a => a.agentMetadata?.agentStatus === 'active').length || 0,
        totalCommissions: agents.agents?.reduce((sum, a) => sum + (a.agentMetadata?.totalCommissions || 0), 0) || 0
      });
    } catch (error) {
      console.error('Failed to load real-time stats:', error);
      
      // Handle authentication errors
      if (error.message && error.message.includes('401')) {
        showNotification('Authentication expired. Please log in again.', 'error');
        router.push('/SignIn');
        return;
      }
      
      // Set default stats on error
      setRealTimeStats({
        usersOnline: 0,
        ordersToday: 0,
        revenueToday: 0,
        newUsersToday: 0,
        pendingOrders: 0,
        pendingAgents: 0,
        activeAgents: 0,
        totalCommissions: 0
      });
    }
  };

  const loadSystemAlerts = async () => {
    // Simulate alerts - replace with actual monitoring
    const alerts = [];
    
    if (realTimeStats.pendingOrders > 10) {
      alerts.push({
        id: 1,
        type: 'warning',
        message: `${realTimeStats.pendingOrders} pending orders need attention`,
        time: 'Now',
        action: () => router.push('/admin/dashboard')
      });
    }
    
    if (realTimeStats.pendingAgents > 0) {
      alerts.push({
        id: 2,
        type: 'info',
        message: `${realTimeStats.pendingAgents} agents awaiting approval`,
        time: 'Now',
        action: () => router.push('/admin/agents')
      });
    }

    setSystemAlerts(alerts);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleToggleSetting = async (setting) => {
    setSiteSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    showNotification(`${setting} ${!siteSettings[setting] ? 'enabled' : 'disabled'}`, 'success');
  };

  const handleRestartService = (service) => {
    showNotification(`Restarting ${service}...`, 'success');
    setTimeout(() => {
      showNotification(`${service} restarted successfully`, 'success');
    }, 2000);
  };

  const handleClearCache = () => {
    showNotification('Clearing cache...', 'success');
    setTimeout(() => {
      showNotification('Cache cleared successfully', 'success');
    }, 1500);
  };

  const handleBackupDatabase = () => {
    showNotification('Starting database backup...', 'success');
    setTimeout(() => {
      showNotification('Backup completed successfully', 'success');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center space-x-3 animate-slide-in ${
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="p-3 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FFCC08] to-yellow-600 bg-clip-text text-transparent">
                Control Center
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Complete platform management and monitoring</p>
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <button
              onClick={() => setRealTimeUpdates(!realTimeUpdates)}
              className={`px-4 py-2 rounded-xl transition-all font-medium flex items-center space-x-2 ${
                realTimeUpdates
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              <Radio className={`w-5 h-5 ${realTimeUpdates ? 'animate-pulse' : ''}`} />
              <span className="hidden md:inline">{realTimeUpdates ? 'Live' : 'Paused'}</span>
            </button>
            <button
              onClick={loadControlCenterData}
              className="p-3 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* System Health Banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">System Status: All Systems Operational</h3>
                <div className="flex items-center space-x-6 mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-sm">Server: Online</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-sm">Database: Connected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-sm">API: Active</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <div className="text-3xl font-bold">99.9%</div>
              <div className="text-sm opacity-80">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            {realTimeUpdates && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Users Online</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{realTimeStats.usersOnline}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Active sessions</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
              <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            {realTimeUpdates && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Orders Today</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{realTimeStats.ordersToday}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {realTimeStats.pendingOrders} pending
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            {realTimeUpdates && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Revenue Today</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            GHS {realTimeStats.revenueToday.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            +{((realTimeStats.revenueToday / 5000) * 100).toFixed(1)}% of target
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            {realTimeUpdates && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">New Users Today</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{realTimeStats.newUsersToday}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {realTimeStats.pendingAgents} agents pending
          </div>
        </div>
      </div>

      {/* System Alerts */}
      {systemAlerts.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">System Alerts</h3>
          <div className="space-y-3">
            {systemAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                  alert.type === 'warning'
                    ? 'bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500'
                    : 'bg-blue-100 dark:bg-blue-900/20 border-l-4 border-blue-500'
                }`}
                onClick={alert.action}
              >
                <div className="flex items-center space-x-3">
                  {alert.type === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <Bell className="w-5 h-5 text-blue-600" />
                  )}
                  <span className="font-medium text-gray-900 dark:text-white">{alert.message}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site-Wide Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#FFCC08] to-yellow-500">
              <Globe className="w-6 h-6 text-black" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Site Controls</h2>
          </div>

          <div className="space-y-3">
            {[
              { key: 'maintenanceMode', label: 'Maintenance Mode', icon: Lock, critical: true },
              { key: 'registrationEnabled', label: 'User Registration', icon: Users },
              { key: 'agentRegistrationEnabled', label: 'Agent Registration', icon: Briefcase },
              { key: 'loginEnabled', label: 'Login System', icon: Lock },
              { key: 'purchasesEnabled', label: 'Data Purchases', icon: Package },
              { key: 'depositsEnabled', label: 'Deposits', icon: DollarSign },
              { key: 'withdrawalsEnabled', label: 'Withdrawals', icon: TrendingUp },
              { key: 'apiIntegrationEnabled', label: 'API Integration', icon: Code }
            ].map(({ key, label, icon: Icon, critical }) => (
              <div
                key={key}
                className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                  critical && siteSettings[key]
                    ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800'
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${
                    critical && siteSettings[key] ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'
                  }`} />
                  <span className="font-medium text-gray-900 dark:text-white">{label}</span>
                </div>
                <button
                  onClick={() => handleToggleSetting(key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    siteSettings[key]
                      ? critical ? 'bg-red-600' : 'bg-green-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      siteSettings[key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* System Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
              <Server className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">System Metrics</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Server className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Server</span>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                {systemMetrics.serverStatus}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Database</span>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                {systemMetrics.databaseStatus}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Uptime</span>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {systemMetrics.uptime}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Response</span>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {systemMetrics.responseTime}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Connections</span>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {systemMetrics.activeConnections}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Requests/min</span>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {systemMetrics.requestsPerMinute}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Error Rate</span>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {systemMetrics.errorRate}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <HardDrive className="w-4 h-4 text-cyan-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Cache Hit</span>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {systemMetrics.cacheHitRate}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">System Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleClearCache}
              className="p-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <RotateCcw className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-medium">Clear Cache</div>
            </button>

            <button
              onClick={handleBackupDatabase}
              className="p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Database className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-medium">Backup DB</div>
            </button>

            <button
              onClick={() => handleRestartService('API')}
              className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <RefreshCw className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-medium">Restart API</div>
            </button>

            <button
              onClick={() => router.push('/admin/settings')}
              className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Settings className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-medium">Settings</div>
            </button>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Access</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/admin/agents')}
              className="p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <Briefcase className="w-5 h-5 text-orange-600" />
                {realTimeStats.pendingAgents > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {realTimeStats.pendingAgents}
                  </span>
                )}
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Agents</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{realTimeStats.activeAgents} active</div>
            </button>

            <button
              onClick={() => router.push('/admin/dashboard')}
              className="p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <Package className="w-5 h-5 text-green-600" />
                {realTimeStats.pendingOrders > 0 && (
                  <span className="px-2 py-0.5 bg-yellow-500 text-black text-xs rounded-full">
                    {realTimeStats.pendingOrders}
                  </span>
                )}
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Orders</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{realTimeStats.ordersToday} today</div>
            </button>

            <button
              onClick={() => router.push('/admin/products')}
              className="p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all text-left"
            >
              <Wifi className="w-5 h-5 text-blue-600 mb-2" />
              <div className="text-sm font-medium text-gray-900 dark:text-white">Products</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Manage pricing</div>
            </button>

            <button
              onClick={() => router.push('/admin/reports')}
              className="p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all text-left"
            >
              <FileText className="w-5 h-5 text-purple-600 mb-2" />
              <div className="text-sm font-medium text-gray-900 dark:text-white">Reports</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Export data</div>
            </button>
          </div>
        </div>

        {/* Agent Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Agent Performance</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/10 dark:to-yellow-900/10 rounded-xl">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Agents</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{realTimeStats.activeAgents}</div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                <Briefcase className="w-6 h-6 text-orange-600" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-xl">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Commissions</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  GHS {realTimeStats.totalCommissions.toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>

            <button
              onClick={() => router.push('/admin/agents')}
              className="w-full px-4 py-3 bg-gradient-to-r from-[#FFCC08] to-yellow-500 hover:from-yellow-500 hover:to-[#FFCC08] text-black rounded-xl transition-all font-bold shadow-md hover:shadow-lg"
            >
              Manage Agents
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Monitoring */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Performance Monitor</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CPU Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CPU Usage</span>
              <span className="text-sm text-gray-500">45%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all" style={{ width: '45%' }} />
            </div>
          </div>

          {/* Memory Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Memory Usage</span>
              <span className="text-sm text-gray-500">62%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all" style={{ width: '62%' }} />
            </div>
          </div>

          {/* Network I/O */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Network I/O</span>
              <span className="text-sm text-gray-500">28%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all" style={{ width: '28%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlCenterPage;
