'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import adminAPI from '../../../utils/adminApi';
import {
  Zap, Play, Pause, Settings, Plus, ArrowLeft, RefreshCw,
  Search, Filter, Eye, Edit, Trash2, TrendingUp, TrendingDown,
  BarChart3, Clock, CheckCircle, X, AlertCircle, Activity,
  Workflow, Trigger, Template, Bell, Target, Play as Execution
} from 'lucide-react';

const BusinessProcessAutomationPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('workflows');
  
  // Automation data state
  const [automationData, setAutomationData] = useState({
    workflows: [],
    triggers: [],
    executions: [],
    templates: [],
    analytics: [],
    stats: {
      totalWorkflows: 0,
      activeWorkflows: 0,
      totalExecutions: 0,
      successRate: 0
    }
  });

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  // Form data
  const [workflowForm, setWorkflowForm] = useState({
    name: '',
    description: '',
    trigger: '',
    steps: [],
    variables: []
  });

  const [triggerForm, setTriggerForm] = useState({
    name: '',
    type: '',
    event: '',
    condition: '',
    schedule: '',
    workflows: []
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    category: '',
    description: '',
    steps: [],
    variables: []
  });

  // Load automation data
  const loadAutomationData = useCallback(async () => {
    setLoading(true);
    try {
      const [workflowsResult, triggersResult, executionsResult, templatesResult, analyticsResult, statsResult] = await Promise.all([
        adminAPI.automation.getWorkflows(),
        adminAPI.automation.getTriggers(),
        adminAPI.automation.getExecutions(),
        adminAPI.automation.getTemplates(),
        adminAPI.automation.getAnalytics(),
        adminAPI.automation.getStats()
      ]);

      setAutomationData({
        workflows: workflowsResult.data || [],
        triggers: triggersResult.data || [],
        executions: executionsResult.data || [],
        templates: templatesResult.data || [],
        analytics: analyticsResult.data || [],
        stats: statsResult.data || {}
      });
    } catch (error) {
      console.error('Error loading automation data:', error);
      showNotification('Failed to load automation data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAutomationData();
  }, [loadAutomationData]);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle workflow creation
  const handleCreateWorkflow = async () => {
    try {
      const result = await adminAPI.automation.createWorkflow(workflowForm);
      if (result.success) {
        showNotification('Workflow created successfully');
        setShowWorkflowModal(false);
        resetWorkflowForm();
        loadAutomationData();
      } else {
        showNotification('Failed to create workflow', 'error');
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
      showNotification('Failed to create workflow', 'error');
    }
  };

  // Handle trigger creation
  const handleCreateTrigger = async () => {
    try {
      const result = await adminAPI.automation.createTrigger(triggerForm);
      if (result.success) {
        showNotification('Trigger created successfully');
        setShowTriggerModal(false);
        resetTriggerForm();
        loadAutomationData();
      } else {
        showNotification('Failed to create trigger', 'error');
      }
    } catch (error) {
      console.error('Error creating trigger:', error);
      showNotification('Failed to create trigger', 'error');
    }
  };

  // Handle template creation
  const handleCreateTemplate = async () => {
    try {
      const result = await adminAPI.automation.createTemplate(templateForm);
      if (result.success) {
        showNotification('Template created successfully');
        setShowTemplateModal(false);
        resetTemplateForm();
        loadAutomationData();
      } else {
        showNotification('Failed to create template', 'error');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      showNotification('Failed to create template', 'error');
    }
  };

  // Handle workflow execution
  const handleExecuteWorkflow = async (workflowId) => {
    try {
      const result = await adminAPI.automation.executeWorkflow(workflowId, { input: {} });
      if (result.success) {
        showNotification('Workflow execution started');
        loadAutomationData();
      } else {
        showNotification('Failed to execute workflow', 'error');
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
      showNotification('Failed to execute workflow', 'error');
    }
  };

  // Reset forms
  const resetWorkflowForm = () => {
    setWorkflowForm({
      name: '',
      description: '',
      trigger: '',
      steps: [],
      variables: []
    });
  };

  const resetTriggerForm = () => {
    setTriggerForm({
      name: '',
      type: '',
      event: '',
      condition: '',
      schedule: '',
      workflows: []
    });
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      category: '',
      description: '',
      steps: [],
      variables: []
    });
  };

  // Filter workflows
  const filteredWorkflows = automationData.workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredWorkflows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWorkflows = filteredWorkflows.slice(startIndex, startIndex + itemsPerPage);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
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
                <Zap className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Business Process Automation</h1>
                  <p className="text-sm text-gray-500">Automate business processes and workflows</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadAutomationData}
                disabled={loading}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowWorkflowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Workflow
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
              <Workflow className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Total Workflows</p>
                <p className="text-2xl font-bold text-gray-900">{automationData.stats.totalWorkflows}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Active Workflows</p>
                <p className="text-2xl font-bold text-gray-900">{automationData.stats.activeWorkflows}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{automationData.stats.successRate}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Execution className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Total Executions</p>
                <p className="text-2xl font-bold text-gray-900">{automationData.stats.totalExecutions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'workflows', name: 'Workflows', count: automationData.workflows.length },
                { id: 'triggers', name: 'Triggers', count: automationData.triggers.length },
                { id: 'executions', name: 'Executions', count: automationData.executions.length },
                { id: 'templates', name: 'Templates', count: automationData.templates.length }
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
            {activeTab === 'workflows' && (
              <div>
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input id="text-input" name="text-input" type="text"
                        placeholder="Search workflows..."
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
                    <option value="draft">Draft</option>
                  </select>
                </div>

                {/* Workflows Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workflow</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trigger</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Executions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedWorkflows.map((workflow) => (
                        <tr key={workflow.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{workflow.name}</div>
                              <div className="text-sm text-gray-500">{workflow.description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{workflow.trigger}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(workflow.status)}`}>
                              {workflow.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{workflow.executions}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{workflow.successRate}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleExecuteWorkflow(workflow.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                <Edit className="w-4 h-4" />
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
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredWorkflows.length)} of {filteredWorkflows.length} results
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

            {activeTab === 'triggers' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {automationData.triggers.map((trigger) => (
                    <div key={trigger.id} className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{trigger.name}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          trigger.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {trigger.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Type:</strong> {trigger.type}</p>
                        <p><strong>Description:</strong> {trigger.description}</p>
                        <p><strong>Total Triggers:</strong> {trigger.totalTriggers}</p>
                        <p><strong>Last Triggered:</strong> {new Date(trigger.lastTriggered).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'executions' && (
              <div>
                <div className="space-y-4">
                  {automationData.executions.map((execution) => (
                    <div key={execution.id} className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{execution.workflowName}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(execution.status)}`}>
                          {execution.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <p><strong>Started:</strong> {new Date(execution.startedAt).toLocaleString()}</p>
                        <p><strong>Duration:</strong> {execution.duration ? `${Math.round(execution.duration / 1000)}s` : 'N/A'}</p>
                        <p><strong>Steps:</strong> {execution.steps.length}</p>
                        <p><strong>Status:</strong> {execution.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'templates' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {automationData.templates.map((template) => (
                    <div key={template.id} className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {template.category}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Description:</strong> {template.description}</p>
                        <p><strong>Steps:</strong> {template.steps.length}</p>
                        <p><strong>Variables:</strong> {template.variables.length}</p>
                        <p><strong>Usage:</strong> {template.usage} times</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workflow Modal */}
      {showWorkflowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create New Workflow</h2>
              <button
                onClick={() => setShowWorkflowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Workflow Name</label>
                <input id="text-input" name="text-input" type="text"
                  value={workflowForm.name}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={workflowForm.description}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trigger</label>
                <select
                  value={workflowForm.trigger}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, trigger: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Trigger</option>
                  <option value="user_registration">User Registration</option>
                  <option value="low_stock">Low Stock Alert</option>
                  <option value="payment_failure">Payment Failure</option>
                  <option value="daily_report">Daily Report</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowWorkflowModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkflow}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessProcessAutomationPage;
