'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import adminAPI from '../../../utils/adminApi';
import {
  Activity, Server, Database, Cpu, HardDrive, Wifi, AlertTriangle,
  CheckCircle, Clock, TrendingUp, TrendingDown, RefreshCw, ArrowLeft,
  BarChart3, Zap, Shield, Eye, Settings, Bell, AlertCircle, X,
  Monitor, MemoryStick, HardDrive as DiskIcon, Network, Gauge
} from 'lucide-react';

const PerformanceMonitoringPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  
  // Performance metrics state
  const [metrics, setMetrics] = useState({
    server: {
      cpu: { usage: 0, cores: 0, load: [] },
      memory: { used: 0, total: 0, percentage: 0 },
      disk: { used: 0, total: 0, percentage: 0 },
      uptime: 0,
      processes: 0
    },
    database: {
      connections: { active: 0, total: 0 },
      queries: { perSecond: 0, avgTime: 0 },
      size: { used: 0, total: 0 },
      operations: { reads: 0, writes: 0 }
    },
    api: {
      responseTime: { avg: 0, p95: 0, p99: 0 },
      requests: { perSecond: 0, total: 0 },
      errors: { rate: 0, count: 0 },
      endpoints: []
    },
    system: {
      alerts: [],
      health: 'healthy',
      lastUpdate: new Date()
    }
  });

  const [alerts, setAlerts] = useState([]);
  const [systemHealth, setSystemHealth] = useState('healthy');

  useEffect(() => {
    checkAuth();
    loadPerformanceMetrics();
    
    // Set up auto-refresh
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadPerformanceMetrics();
      }, refreshInterval * 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'admin') {
      router.push('/SignIn');
      return;
    }
  };

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const loadPerformanceMetrics = async () => {
    try {
      setLoading(true);
      
      // Simulate performance metrics (in real implementation, this would come from your monitoring system)
      const mockMetrics = {
        server: {
          cpu: { 
            usage: Math.random() * 100, 
            cores: 8, 
            load: Array.from({ length: 10 }, () => Math.random() * 100) 
          },
          memory: { 
            used: Math.random() * 8, 
            total: 16, 
            percentage: Math.random() * 100 
          },
          disk: { 
            used: Math.random() * 500, 
            total: 1000, 
            percentage: Math.random() * 100 
          },
          uptime: Math.floor(Math.random() * 86400 * 30), // Random uptime up to 30 days
          processes: Math.floor(Math.random() * 200) + 50
        },
        database: {
          connections: { 
            active: Math.floor(Math.random() * 50) + 10, 
            total: 100 
          },
          queries: { 
            perSecond: Math.floor(Math.random() * 1000) + 100, 
            avgTime: Math.random() * 50 + 10 
          },
          size: { 
            used: Math.random() * 100, 
            total: 500 
          },
          operations: { 
            reads: Math.floor(Math.random() * 10000), 
            writes: Math.floor(Math.random() * 1000) 
          }
        },
        api: {
          responseTime: { 
            avg: Math.random() * 200 + 50, 
            p95: Math.random() * 500 + 100, 
            p99: Math.random() * 1000 + 200 
          },
          requests: { 
            perSecond: Math.floor(Math.random() * 1000) + 100, 
            total: Math.floor(Math.random() * 1000000) 
          },
          errors: { 
            rate: Math.random() * 5, 
            count: Math.floor(Math.random() * 100) 
          },
          endpoints: [
            { name: '/api/v1/login', avgTime: Math.random() * 100 + 50, requests: Math.floor(Math.random() * 1000) },
            { name: '/api/v1/admin/users', avgTime: Math.random() * 200 + 100, requests: Math.floor(Math.random() * 500) },
            { name: '/api/v1/admin/transactions', avgTime: Math.random() * 150 + 75, requests: Math.floor(Math.random() * 800) },
            { name: '/api/v1/admin/orders', avgTime: Math.random() * 300 + 150, requests: Math.floor(Math.random() * 300) }
          ]
        },
        system: {
          alerts: [],
          health: 'healthy',
          lastUpdate: new Date()
        }
      };

      // Generate alerts based on metrics
      const newAlerts = [];
      if (mockMetrics.server.cpu.usage > 80) {
        newAlerts.push({
          id: Date.now(),
          type: 'warning',
          message: `High CPU usage: ${mockMetrics.server.cpu.usage.toFixed(1)}%`,
          timestamp: new Date()
        });
      }
      if (mockMetrics.server.memory.percentage > 85) {
        newAlerts.push({
          id: Date.now() + 1,
          type: 'critical',
          message: `High memory usage: ${mockMetrics.server.memory.percentage.toFixed(1)}%`,
          timestamp: new Date()
        });
      }
      if (mockMetrics.api.errors.rate > 2) {
        newAlerts.push({
          id: Date.now() + 2,
          type: 'error',
          message: `High error rate: ${mockMetrics.api.errors.rate.toFixed(2)}%`,
          timestamp: new Date()
        });
      }

      mockMetrics.system.alerts = newAlerts;
      mockMetrics.system.health = newAlerts.length > 0 ? 'warning' : 'healthy';
      
      setMetrics(mockMetrics);
      setAlerts(newAlerts);
      setSystemHealth(mockMetrics.system.health);
      
    } catch (error) {
      console.error('Error loading performance metrics:', error);
      showNotification('Failed to load performance metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthIcon = (health) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Performance Monitoring
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Real-time system performance metrics
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Auto-refresh:</label>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoRefresh ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoRefresh ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                disabled={!autoRefresh}
              >
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
                <option value={300}>5m</option>
              </select>
              
              <button
                onClick={loadPerformanceMetrics}
                disabled={loading}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Health Alert */}
      {systemHealth !== 'healthy' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                System health: {systemHealth} - {alerts.length} active alerts
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Server Health */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Server Health</h3>
              </div>
              {getHealthIcon(systemHealth)}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {metrics.server.cpu.usage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.server.cpu.usage}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Memory</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {metrics.server.memory.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.server.memory.percentage}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatUptime(metrics.server.uptime)}
                </span>
              </div>
            </div>
          </div>

          {/* Database Performance */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Database className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Database</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Connections</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {metrics.database.connections.active}/{metrics.database.connections.total}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Queries/sec</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {metrics.database.queries.perSecond}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Query Time</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {metrics.database.queries.avgTime.toFixed(1)}ms
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Size</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatBytes(metrics.database.size.used * 1024 * 1024 * 1024)}
                </span>
              </div>
            </div>
          </div>

          {/* API Performance */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">API Performance</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Response</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {metrics.api.responseTime.avg.toFixed(0)}ms
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Requests/sec</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {metrics.api.requests.perSecond}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Error Rate</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {metrics.api.errors.rate.toFixed(2)}%
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Requests</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {metrics.api.requests.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* System Resources */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Monitor className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Resources</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">CPU Cores</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {metrics.server.cpu.cores}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Memory</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatBytes(metrics.server.memory.used * 1024 * 1024 * 1024)} / {formatBytes(metrics.server.memory.total * 1024 * 1024 * 1024)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Disk</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatBytes(metrics.server.disk.used * 1024 * 1024 * 1024)} / {formatBytes(metrics.server.disk.total * 1024 * 1024 * 1024)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Processes</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {metrics.server.processes}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* API Endpoints Performance */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">API Endpoints</h3>
            </div>
            <div className="space-y-3">
              {metrics.api.endpoints.map((endpoint, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {endpoint.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {endpoint.requests} requests
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {endpoint.avgTime.toFixed(0)}ms
                    </div>
                    <div className={`text-xs ${
                      endpoint.avgTime < 100 ? 'text-green-600' : 
                      endpoint.avgTime < 300 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {endpoint.avgTime < 100 ? 'Fast' : 
                       endpoint.avgTime < 300 ? 'Moderate' : 'Slow'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Bell className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Recent Alerts</h3>
            </div>
            <div className="space-y-3">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-red-800 dark:text-red-200">
                        {alert.message}
                      </div>
                      <div className="text-xs text-red-600 dark:text-red-400">
                        {alert.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No active alerts</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Charts */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Performance Trends</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CPU Usage Chart */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">CPU Usage</h4>
              <div className="h-32 flex items-end space-x-1">
                {metrics.server.cpu.load.map((value, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-blue-600 rounded-t transition-all duration-300"
                    style={{ height: `${value}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Memory Usage Chart */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Memory Usage</h4>
              <div className="h-32 flex items-end space-x-1">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-green-600 rounded-t transition-all duration-300"
                    style={{ height: `${Math.random() * 100}%` }}
                  />
                ))}
              </div>
            </div>

            {/* API Response Time Chart */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">API Response Time</h4>
              <div className="h-32 flex items-end space-x-1">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-purple-600 rounded-t transition-all duration-300"
                    style={{ height: `${Math.random() * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`p-4 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500' : 
            notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          } text-white`}>
            <div className="flex items-center space-x-2">
              <span>{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-2 hover:bg-white/20 rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitoringPage;
