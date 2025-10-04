'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import adminAPI from '../../../utils/adminApi';
import {
  Users, Search, Filter, Download, RefreshCw, ArrowLeft, Plus,
  CheckCircle, XCircle, Clock, AlertCircle, DollarSign, Eye,
  TrendingUp, Award, Target, UserCheck, UserX, Edit, Mail,
  Phone, MapPin, Calendar, MoreVertical, Shield, Star, X,
  CreditCard, Building, Hash, Copy, ExternalLink, Package, Trash2
} from 'lucide-react';

const AgentManagementPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogItems, setCatalogItems] = useState([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    pendingApproval: 0,
    totalCommissions: 0
  });

  useEffect(() => {
    checkAuth();
    loadAgents();
  }, [filterStatus, filterLevel]);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!token || user.role !== 'admin') {
      router.push('/SignIn');
      return false;
    }
    return true;
  };

  const loadAgents = async () => {
    if (!checkAuth()) return;
    
    setLoading(true);
    try {
      // Load agents using the dedicated agent API
      const response = await adminAPI.agent.getAgents(1, 1000, searchTerm);
      let filteredAgents = response.agents || [];
      
      // Apply additional filters
      if (filterStatus !== 'all') {
        filteredAgents = filteredAgents.filter(agent => 
          agent.agentMetadata?.agentStatus === filterStatus
        );
      }
      if (filterLevel !== 'all') {
        filteredAgents = filteredAgents.filter(agent => 
          agent.agentMetadata?.agentLevel === filterLevel
        );
      }
      
      setAgents(filteredAgents);
      
      // Calculate stats
      const allAgents = response.agents || [];
      const stats = {
        totalAgents: allAgents.length,
        activeAgents: allAgents.filter(a => a.agentMetadata?.agentStatus === 'active').length,
        pendingApproval: allAgents.filter(a => a.agentMetadata?.agentStatus === 'pending').length,
        totalCommissions: allAgents.reduce((sum, a) => sum + (a.agentMetadata?.totalCommissions || 0), 0)
      };
      setStats(stats);
    } catch (error) {
      console.error('Failed to load agents:', error);
      showNotification('Failed to load agents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleApproveAgent = async (agentId) => {
    try {
      // Update agent status to active
      await adminAPI.user.updateUser(agentId, {
        'agentMetadata.agentStatus': 'active',
        'agentMetadata.documents.idVerified': true,
        'agentMetadata.documents.idVerifiedAt': new Date(),
        approvalStatus: 'approved'
      });
      
      showNotification('Agent approved successfully', 'success');
      loadAgents();
      setShowApprovalModal(false);
    } catch (error) {
      console.error('Failed to approve agent:', error);
      showNotification('Failed to approve agent', 'error');
    }
  };

  const handleRejectAgent = async (agentId) => {
    try {
      await adminAPI.user.updateUser(agentId, {
        'agentMetadata.agentStatus': 'terminated'
      });
      
      showNotification('Agent application rejected', 'success');
      loadAgents();
      setShowApprovalModal(false);
    } catch (error) {
      console.error('Failed to reject agent:', error);
      showNotification('Failed to reject agent', 'error');
    }
  };

  const handleUpdateCommissionRate = async (agentId, newRate) => {
    try {
      await adminAPI.user.updateUser(agentId, {
        'agentMetadata.commissionRate': newRate
      });
      
      showNotification('Commission rate updated', 'success');
      loadAgents();
    } catch (error) {
      console.error('Failed to update commission rate:', error);
      showNotification('Failed to update commission rate', 'error');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard', 'success');
  };

  const loadAgentCatalog = async (agentId) => {
    try {
      const response = await adminAPI.agent.getAgentCatalog(agentId);
      setCatalogItems(response.items || []);
    } catch (error) {
      console.error('Failed to load catalog:', error);
      showNotification('Failed to load agent catalog', 'error');
    }
  };

  const handleManageCatalog = async (agent) => {
    setSelectedAgent(agent);
    await loadAgentCatalog(agent._id);
    setShowCatalogModal(true);
  };

  const handleAddProduct = async (network, capacity, price) => {
    if (!selectedAgent) return;
    
    try {
      await adminAPI.agent.addCatalogItem(selectedAgent._id, {
        network,
        capacity,
        price,
        title: `${network} ${capacity}GB`,
        enabled: true
      });
      showNotification('Product added to agent catalog', 'success');
      await loadAgentCatalog(selectedAgent._id);
      setShowAddProductModal(false);
    } catch (error) {
      console.error('Failed to add product:', error);
      showNotification('Failed to add product', 'error');
    }
  };

  const handleUpdateProduct = async (itemId, updates) => {
    if (!selectedAgent) return;
    
    try {
      await adminAPI.agent.updateCatalogItem(selectedAgent._id, itemId, updates);
      showNotification('Product updated', 'success');
      await loadAgentCatalog(selectedAgent._id);
    } catch (error) {
      console.error('Failed to update product:', error);
      showNotification('Failed to update product', 'error');
    }
  };

  const handleDeleteProduct = async (itemId) => {
    if (!selectedAgent || !confirm('Are you sure you want to remove this product?')) return;
    
    try {
      await adminAPI.agent.deleteCatalogItem(selectedAgent._id, itemId);
      showNotification('Product removed', 'success');
      await loadAgentCatalog(selectedAgent._id);
    } catch (error) {
      console.error('Failed to delete product:', error);
      showNotification('Failed to delete product', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'suspended':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'terminated':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'bronze':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'silver':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'platinum':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

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

      {/* Agent Details Modal */}
      {showDetailsModal && selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Agent Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Agent Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedAgent.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 dark:text-white">{selectedAgent.email}</p>
                        <button onClick={() => copyToClipboard(selectedAgent.email)}>
                          <Copy className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 dark:text-white">{selectedAgent.phoneNumber}</p>
                        <button onClick={() => copyToClipboard(selectedAgent.phoneNumber)}>
                          <Copy className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Territory</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedAgent.agentMetadata?.territory || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Agent Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Agent Code</p>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedAgent.agentMetadata?.agentCode || 'N/A'}
                        </p>
                        {selectedAgent.agentMetadata?.agentCode && (
                          <button onClick={() => copyToClipboard(selectedAgent.agentMetadata.agentCode)}>
                            <Copy className="w-3 h-3 text-gray-400" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getStatusColor(selectedAgent.agentMetadata?.agentStatus || 'pending')
                      }`}>
                        {selectedAgent.agentMetadata?.agentStatus || 'pending'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Level</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getLevelColor(selectedAgent.agentMetadata?.agentLevel || 'bronze')
                      }`}>
                        <Star className="w-3 h-3 mr-1" />
                        {selectedAgent.agentMetadata?.agentLevel || 'bronze'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Commission Rate</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedAgent.agentMetadata?.commissionRate || 5}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedAgent.agentMetadata?.customerBase || 0}
                    </p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Customers</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedAgent.agentMetadata?.activeCustomers || 0}
                    </p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Commission</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      GHS {selectedAgent.agentMetadata?.totalCommissions?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending Commission</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      GHS {selectedAgent.agentMetadata?.pendingCommissions?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              {selectedAgent.agentMetadata?.documents && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documents</h4>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ID Type</p>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {selectedAgent.agentMetadata.documents.idType?.replace('_', ' ') || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ID Number</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedAgent.agentMetadata.documents.idNumber || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Verification Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedAgent.agentMetadata.documents.idVerified
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                          {selectedAgent.agentMetadata.documents.idVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Details */}
              {selectedAgent.agentMetadata?.bankDetails && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bank Details</h4>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Bank Name</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedAgent.agentMetadata.bankDetails.bankName || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Account Name</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedAgent.agentMetadata.bankDetails.accountName || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Account Number</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedAgent.agentMetadata.bankDetails.accountNumber || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Mobile Money</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedAgent.agentMetadata.bankDetails.momoNumber || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 flex items-center justify-end space-x-4">
                {selectedAgent.agentMetadata?.agentStatus === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setShowApprovalModal(true);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                    >
                      Approve Agent
                    </button>
                    <button
                      onClick={() => handleRejectAgent(selectedAgent._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                    >
                      Reject
                    </button>
                  </>
                )}
                {selectedAgent.agentMetadata?.agentStatus === 'active' && (
                  <button
                    onClick={() => {
                      const newRate = prompt('Enter new commission rate (%):', selectedAgent.agentMetadata.commissionRate);
                      if (newRate && !isNaN(newRate)) {
                        handleUpdateCommissionRate(selectedAgent._id, parseFloat(newRate));
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    Update Commission Rate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Management Modal */}
      {showCatalogModal && selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Manage Catalog</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedAgent.name}'s Store Products
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="px-4 py-2 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-colors font-medium flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
                  <button
                    onClick={() => setShowCatalogModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {catalogItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catalogItems.map((item) => (
                    <div key={item.id} className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{item.network}</h4>
                          <p className="text-2xl font-bold text-[#FFCC08]">{item.capacity}GB</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleUpdateProduct(item.id, { enabled: !item.enabled })}
                            className={`p-1.5 rounded-lg transition-colors ${
                              item.enabled 
                                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                            }`}
                          >
                            {item.enabled ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(item.id)}
                            className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">GHS {item.price}</p>
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-300">{item.description}</p>
                        )}
                        <button
                          onClick={() => {
                            const newPrice = prompt('Enter new price:', item.price);
                            if (newPrice && !isNaN(newPrice)) {
                              handleUpdateProduct(item.id, { price: parseFloat(newPrice) });
                            }
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Update Price
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No products in catalog yet</p>
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="mt-4 px-4 py-2 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-colors font-medium"
                  >
                    Add First Product
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Product</h3>
                <button
                  onClick={() => setShowAddProductModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleAddProduct(
                  formData.get('network'),
                  parseInt(formData.get('capacity')),
                  parseFloat(formData.get('price'))
                );
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Network *
                    </label>
                    <select
                      name="network"
                      required
                      className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
                    >
                      <option value="">Select Network</option>
                      <option value="YELLO">MTN (YELLO)</option>
                      <option value="TELECEL">Telecel</option>
                      <option value="AT_PREMIUM">AirtelTigo Premium</option>
                      <option value="at">AirtelTigo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Capacity (GB) *
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      required
                      min="1"
                      placeholder="e.g., 50"
                      className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price (GHS) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      step="0.01"
                      placeholder="e.g., 45.00"
                      className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddProductModal(false)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-colors font-medium"
                    >
                      Add Product
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Approve Agent</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to approve {selectedAgent.name} as an agent? This will give them access to the agent portal and enable commission tracking.
              </p>
              
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApproveAgent(selectedAgent._id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                >
                  Approve Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agent Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your agent network</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Total Agents</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalAgents}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Active Agents</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.activeAgents}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Pending Approval</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.pendingApproval}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Total Commissions</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              GHS {stats.totalCommissions.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search agents by name, email, or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && loadAgents()}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08] transition-all"
                />
              </div>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="terminated">Terminated</option>
            </select>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
            >
              <option value="all">All Levels</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </select>

            <button
              onClick={loadAgents}
              className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Agent</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Contact</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Territory</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Level</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Customers</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Commission</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FFCC08] to-yellow-500 flex items-center justify-center text-black font-bold">
                        {agent.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{agent.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {agent.agentMetadata?.agentCode || 'No code'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <Mail className="w-3 h-3" />
                        <span className="text-sm">{agent.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <Phone className="w-3 h-3" />
                        <span className="text-sm">{agent.phoneNumber}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{agent.agentMetadata?.territory || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusColor(agent.agentMetadata?.agentStatus || 'pending')
                    }`}>
                      {agent.agentMetadata?.agentStatus || 'pending'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getLevelColor(agent.agentMetadata?.agentLevel || 'bronze')
                    }`}>
                      <Star className="w-3 h-3 mr-1" />
                      {agent.agentMetadata?.agentLevel || 'bronze'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {agent.agentMetadata?.customerBase || 0}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {agent.agentMetadata?.activeCustomers || 0} active
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {agent.agentMetadata?.commissionRate || 5}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        GHS {agent.agentMetadata?.totalCommissions?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedAgent(agent);
                          setShowDetailsModal(true);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleManageCatalog(agent)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Manage Catalog"
                      >
                        <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </button>
                      {agent.agentMetadata?.agentStatus === 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedAgent(agent);
                            setShowApprovalModal(true);
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Approve Agent"
                        >
                          <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {agents.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No agents found
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentManagementPage;
