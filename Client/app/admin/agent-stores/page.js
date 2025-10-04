'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Store, Users, Package, DollarSign, TrendingUp, Search, Filter,
  Eye, Edit, Trash2, CheckCircle, XCircle, Clock, AlertCircle,
  RefreshCw, Download, Upload, Plus, MoreVertical, Star, MapPin,
  Phone, Mail, Calendar, BarChart3, PieChart, Activity, Zap, ArrowLeft, ExternalLink
} from 'lucide-react';
import { getApiEndpoint } from '@/utils/apiConfig';

const AdminAgentStores = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [agentStores, setAgentStores] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    checkAuth();
    loadAgentStores();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const userDataStr = localStorage.getItem('userData');
    
    if (!token) {
      router.push('/SignIn');
      return false;
    }
    
    try {
      const user = JSON.parse(userDataStr || '{}');
      if (user.role !== 'admin') {
        showNotification('Access denied. Admin privileges required.', 'error');
        router.push('/SignIn');
        return false;
      }
    } catch (error) {
      router.push('/SignIn');
      return false;
    }
    return true;
  };

  const loadAgentStores = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const API_URL = getApiEndpoint('');

      const response = await fetch(`${API_URL}/api/admin/agents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAgentStores(data.agents || []);
      } else {
        showNotification('Failed to load agent stores', 'error');
      }
    } catch (error) {
      console.error('Error loading agent stores:', error);
      showNotification('Error loading agent stores', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const updateAgentStatus = async (agentId, status) => {
    try {
      const token = localStorage.getItem('authToken');
      const API_URL = getApiEndpoint('');

      const response = await fetch(`${API_URL}/api/admin/agents/${agentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        showNotification('Agent status updated successfully!', 'success');
        loadAgentStores();
      } else {
        showNotification('Failed to update agent status', 'error');
      }
    } catch (error) {
      console.error('Error updating agent status:', error);
      showNotification('Error updating agent status', 'error');
    }
  };

  const updateAgentLevel = async (agentId, level) => {
    try {
      const token = localStorage.getItem('authToken');
      const API_URL = getApiEndpoint('');

      const response = await fetch(`${API_URL}/api/admin/agents/${agentId}/level`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ level })
      });

      if (response.ok) {
        showNotification('Agent level updated successfully!', 'success');
        loadAgentStores();
      } else {
        showNotification('Failed to update agent level', 'error');
      }
    } catch (error) {
      console.error('Error updating agent level:', error);
      showNotification('Error updating agent level', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'bronze': return 'bg-orange-100 text-orange-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'platinum': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const openAgentModal = (agent) => {
    setSelectedAgent(agent);
    setShowAgentModal(true);
  };

  // Filter agent stores
  const filteredStores = agentStores.filter(agent => {
    const matchesSearch = 
      agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.agentMetadata?.agentCode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || agent.agentMetadata?.agentStatus === filterStatus;
    const matchesLevel = filterLevel === 'all' || agent.agentMetadata?.agentLevel === filterLevel;
    
    return matchesSearch && matchesStatus && matchesLevel;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-[#FFCC08] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Stores</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage agent stores and their performance</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={loadAgentStores}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
            
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
            >
              <option value="all">All Levels</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </select>
            
            <button className="px-4 py-3 bg-[#FFCC08] text-black rounded-xl font-semibold hover:bg-yellow-500 transition-all">
              Export Data
            </button>
          </div>
        </div>

        {/* Agent Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((agent) => (
            <div
              key={agent._id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              {/* Store Header */}
              <div className="bg-gradient-to-r from-[#FFCC08]/10 to-yellow-500/5 p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFCC08] to-yellow-500 flex items-center justify-center">
                      <Store className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {agent.storeCustomization?.storeName || agent.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {agent.agentMetadata?.agentCode || 'No Code'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.agentMetadata?.agentStatus)}`}>
                      {agent.agentMetadata?.agentStatus || 'Unknown'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(agent.agentMetadata?.agentLevel)}`}>
                      {agent.agentMetadata?.agentLevel || 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Store Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {agent.storeCustomization?.storeDescription || 'No description available'}
                </p>

                {/* Contact Info */}
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>{agent.email}</span>
                  </div>
                  {agent.phoneNumber && (
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{agent.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Store Stats */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {agent.stats?.totalOrders || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#FFCC08]">
                      {formatCurrency(agent.stats?.totalRevenue || 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
                  </div>
                </div>

                {/* Products Count */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Products</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {agent.store?.products?.length || 0} items
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openAgentModal(agent)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                  
                  <button
                    onClick={() => router.push(`/agent-store/${agent.agentMetadata?.agentCode}`)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Visit Store</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStores.length === 0 && (
          <div className="text-center py-16">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm || filterStatus !== 'all' || filterLevel !== 'all' ? 'No agent stores found' : 'No Agent Stores Yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || filterStatus !== 'all' || filterLevel !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Agent stores will appear here when agents create their stores'
              }
            </p>
          </div>
        )}
      </div>

      {/* Agent Details Modal */}
      {showAgentModal && selectedAgent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Agent Store Details
                </h3>
                <button
                  onClick={() => setShowAgentModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Agent Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Agent Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Name:</span>
                      <span className="font-medium">{selectedAgent.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Email:</span>
                      <span className="font-medium">{selectedAgent.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                      <span className="font-medium">{selectedAgent.phoneNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Agent Code:</span>
                      <span className="font-medium">{selectedAgent.agentMetadata?.agentCode || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAgent.agentMetadata?.agentStatus)}`}>
                        {selectedAgent.agentMetadata?.agentStatus || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Level:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(selectedAgent.agentMetadata?.agentLevel)}`}>
                        {selectedAgent.agentMetadata?.agentLevel || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Store Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Orders:</span>
                      <span className="font-semibold text-[#FFCC08]">{selectedAgent.stats?.totalOrders || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Revenue:</span>
                      <span className="font-semibold text-[#FFCC08]">{formatCurrency(selectedAgent.stats?.totalRevenue || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Completed Orders:</span>
                      <span className="font-semibold text-green-600">{selectedAgent.stats?.completedOrders || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Products:</span>
                      <span className="font-semibold">{selectedAgent.store?.products?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Store Customization */}
              {selectedAgent.storeCustomization && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Store Customization</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Store Name</p>
                        <p className="font-medium">{selectedAgent.storeCustomization.storeName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Welcome Message</p>
                        <p className="font-medium">{selectedAgent.storeCustomization.welcomeMessage || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      updateAgentStatus(selectedAgent._id, 'active');
                      setShowAgentModal(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Activate</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      updateAgentStatus(selectedAgent._id, 'suspended');
                      setShowAgentModal(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Suspend</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      updateAgentLevel(selectedAgent._id, 'gold');
                      setShowAgentModal(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-all"
                  >
                    <Star className="w-4 h-4" />
                    <span>Upgrade to Gold</span>
                  </button>
                  
                  <button
                    onClick={() => router.push(`/agent-store/${selectedAgent.agentMetadata?.agentCode}`)}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#FFCC08] text-black rounded-lg hover:bg-yellow-500 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Visit Store</span>
                  </button>
                </div>
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

export default AdminAgentStores;
