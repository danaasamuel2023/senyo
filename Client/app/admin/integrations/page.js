'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import adminAPI from '../../../utils/adminApi';
import {
  Plug, CheckCircle, XCircle, AlertTriangle, Plus, ArrowLeft, RefreshCw,
  Search, Filter, Eye, Edit, Trash2, TrendingUp, TrendingDown,
  BarChart3, Clock, Settings, Activity, Globe, Database, Server,
  Bell, Zap, Shield, ExternalLink, Copy, TestTube, Target
} from 'lucide-react';

const ThirdPartyIntegrationsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('integrations');
  
  // Integrations data state
  const [integrationsData, setIntegrationsData] = useState({
    integrations: [],
    webhooks: [],
    logs: [],
    health: [],
    analytics: [],
    stats: {
      totalIntegrations: 0,
      activeIntegrations: 0,
      totalApiCalls: 0,
      successRate: 0
    }
  });

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  // Form data
  const [integrationForm, setIntegrationForm] = useState({
    name: '',
    category: '',
    provider: '',
    description: '',
    apiKey: '',
    webhookUrl: '',
    features: []
  });

  const [webhookForm, setWebhookForm] = useState({
    name: '',
    url: '',
    integration: '',
    events: [],
    secret: ''
  });

  // Load integrations data
  const loadIntegrationsData = useCallback(async () => {
    setLoading(true);
    try {
      const [integrationsResult, webhooksResult, logsResult, healthResult, analyticsResult, statsResult] = await Promise.all([
        adminAPI.integrations.getIntegrations(),
        adminAPI.integrations.getWebhooks(),
        adminAPI.integrations.getLogs(),
        adminAPI.integrations.getHealth(),
        adminAPI.integrations.getAnalytics(),
        adminAPI.integrations.getStats()
      ]);

      setIntegrationsData({
        integrations: integrationsResult.data || [],
        webhooks: webhooksResult.data || [],
        logs: logsResult.data || [],
        health: healthResult.data || [],
        analytics: analyticsResult.data || [],
        stats: statsResult.data || {}
      });
    } catch (error) {
      console.error('Error loading integrations data:', error);
      showNotification('Failed to load integrations data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIntegrationsData();
  }, [loadIntegrationsData]);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle integration test
  const handleTestIntegration = async (integrationId) => {
    try {
      const result = await adminAPI.integrations.testIntegration(integrationId);
      if (result.success) {
        showNotification('Integration test completed successfully');
        loadIntegrationsData();
      } else {
        showNotification('Integration test failed', 'error');
      }
    } catch (error) {
      console.error('Error testing integration:', error);
      showNotification('Failed to test integration', 'error');
    }
  };

  // Handle integration sync
  const handleSyncIntegration = async (integrationId) => {
    try {
      const result = await adminAPI.integrations.syncIntegration(integrationId);
      if (result.success) {
        showNotification('Integration sync completed successfully');
        loadIntegrationsData();
      } else {
        showNotification('Integration sync failed', 'error');
      }
    } catch (error) {
      console.error('Error syncing integration:', error);
      showNotification('Failed to sync integration', 'error');
    }
  };

  // Handle webhook creation
  const handleCreateWebhook = async () => {
    try {
      const result = await adminAPI.integrations.createWebhook(webhookForm);
      if (result.success) {
        showNotification('Webhook created successfully');
        setShowWebhookModal(false);
        resetWebhookForm();
        loadIntegrationsData();
      } else {
        showNotification('Failed to create webhook', 'error');
      }
    } catch (error) {
      console.error('Error creating webhook:', error);
      showNotification('Failed to create webhook', 'error');
    }
  };

  // Reset forms
  const resetIntegrationForm = () => {
    setIntegrationForm({
      name: '',
      category: '',
      provider: '',
      description: '',
      apiKey: '',
      webhookUrl: '',
      features: []
    });
  };

  const resetWebhookForm = () => {
    setWebhookForm({
      name: '',
      url: '',
      integration: '',
      events: [],
      secret: ''
    });
  };

  // Filter integrations
  const filteredIntegrations = integrationsData.integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || integration.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || integration.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredIntegrations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIntegrations = filteredIntegrations.slice(startIndex, startIndex + itemsPerPage);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'unhealthy': return 'text-red-600 bg-red-100';
      case 'success': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get health status color
  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'unhealthy': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center">
                <Plug className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Third-party Integrations</h1>
                  <p className="text-sm text-gray-500">Manage external service integrations</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadIntegrationsData}
                disabled={loading}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowIntegrationModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Integration
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`p-4 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {notification.message}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Plug className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Total Integrations</p>
                <p className="text-2xl font-bold text-gray-900">{integrationsData.stats.totalIntegrations}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Active Integrations</p>
                <p className="text-2xl font-bold text-gray-900">{integrationsData.stats.activeIntegrations}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">API Calls</p>
                <p className="text-2xl font-bold text-gray-900">{integrationsData.stats.totalApiCalls?.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{integrationsData.stats.successRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Health Status */}
        {integrationsData.health.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Integration Health Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {integrationsData.health.map((health, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getHealthStatusColor(health.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{health.integration}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getHealthStatusColor(health.status)}`}>
                      {health.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Response Time: {health.responseTime}ms</p>
                    <p>Uptime: {health.uptime}%</p>
                    <p>Errors: {health.errors}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'integrations', name: 'Integrations', count: integrationsData.integrations.length },
                { id: 'webhooks', name: 'Webhooks', count: integrationsData.webhooks.length },
                { id: 'logs', name: 'Logs', count: integrationsData.logs.length },
                { id: 'analytics', name: 'Analytics', count: integrationsData.analytics.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'integrations' && (
              <div>
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input id="text-input" name="text-input" type="text"
                        placeholder="Search integrations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="payment">Payment</option>
                    <option value="communication">Communication</option>
                    <option value="analytics">Analytics</option>
                  </select>
                </div>

                {/* Integrations Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Integration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedIntegrations.map((integration) => (
                        <tr key={integration.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{integration.name}</div>
                              <div className="text-sm text-gray-500">{integration.description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{integration.provider}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{integration.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(integration.status)}`}>
                              {integration.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getHealthStatusColor(integration.health.status)}`}>
                              {integration.health.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleTestIntegration(integration.id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Test Integration"
                              >
                                <TestTube className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleSyncIntegration(integration.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Sync Integration"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                <Settings className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-700">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredIntegrations.length)} of {filteredIntegrations.length} results
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'webhooks' && (
              <div>
                <div className="space-y-4">
                  {integrationsData.webhooks.map((webhook) => (
                    <div key={webhook.id} className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{webhook.name}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          webhook.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {webhook.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <p><strong>URL:</strong> {webhook.url}</p>
                        <p><strong>Integration:</strong> {webhook.integration}</p>
                        <p><strong>Events:</strong> {webhook.events.join(', ')}</p>
                        <p><strong>Success Rate:</strong> {webhook.successRate}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div>
                <div className="space-y-4">
                  {integrationsData.logs.map((log) => (
                    <div key={log.id} className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{log.integration}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <p><strong>Method:</strong> {log.method}</p>
                        <p><strong>Endpoint:</strong> {log.endpoint}</p>
                        <p><strong>Status Code:</strong> {log.statusCode}</p>
                        <p><strong>Response Time:</strong> {log.responseTime}ms</p>
                      </div>
                      {log.error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600"><strong>Error:</strong> {log.error}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {integrationsData.analytics.map((metric, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">{metric.metric}</h3>
                        {metric.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {metric.value?.toLocaleString()}{metric.unit}
                      </p>
                      <p className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}% from last period
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Integration Modal */}
      {showIntegrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add New Integration</h2>
              <button
                onClick={() => setShowIntegrationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Integration Name</label>
                <input id="text-input" name="text-input" type="text"
                  value={integrationForm.name}
                  onChange={(e) => setIntegrationForm({ ...integrationForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={integrationForm.category}
                    onChange={(e) => setIntegrationForm({ ...integrationForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    <option value="payment">Payment</option>
                    <option value="communication">Communication</option>
                    <option value="analytics">Analytics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                  <input id="text-input" name="text-input" type="text"
                    value={integrationForm.provider}
                    onChange={(e) => setIntegrationForm({ ...integrationForm, provider: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={integrationForm.description}
                  onChange={(e) => setIntegrationForm({ ...integrationForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <input id="password" name="password" type="password"
                  value={integrationForm.apiKey}
                  onChange={(e) => setIntegrationForm({ ...integrationForm, apiKey: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowIntegrationModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowIntegrationModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Integration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThirdPartyIntegrationsPage;
