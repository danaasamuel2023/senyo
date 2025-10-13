'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import adminAPI from '../../../utils/adminApi';
import {
  MessageSquare, Users, Clock, CheckCircle, AlertCircle, X, Plus,
  ArrowLeft, RefreshCw, Search, Filter, Eye, Edit, Trash2, Send,
  Mail, Phone, Calendar, Tag, Star, ThumbsUp, ThumbsDown, FileText,
  Download, Upload, Settings, Bell, Activity, TrendingUp, TrendingDown, BarChart3,
  UserCheck, UserX, Zap, Shield, Globe, Database, Server, HelpCircle
} from 'lucide-react';

const CustomerSupportPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('tickets');
  
  // Support data state
  const [supportData, setSupportData] = useState({
    tickets: [],
    liveChat: [],
    knowledgeBase: [],
    faqs: [],
    stats: {
      totalTickets: 0,
      openTickets: 0,
      resolvedTickets: 0,
      avgResponseTime: 0,
      customerSatisfaction: 0,
      activeChats: 0
    }
  });

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);

  // Live chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    checkAuth();
    loadSupportData();
  }, [currentPage, itemsPerPage]);

  const checkAuth = () => {
    const token = getAuthToken();
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

  const loadSupportData = async () => {
    try {
      setLoading(true);
      
      // Mock support data
      const mockData = {
        tickets: [
          {
            id: 'TKT-001',
            title: 'Unable to purchase data bundle',
            description: 'Customer is having trouble purchasing MTN 1GB data bundle',
            customer: 'john.doe@example.com',
            status: 'open',
            priority: 'high',
            category: 'technical',
            assignedTo: 'Admin',
            createdAt: new Date(Date.now() - 2 * 86400000),
            updatedAt: new Date(Date.now() - 1 * 86400000),
            responseTime: 2.5,
            satisfaction: null
          },
          {
            id: 'TKT-002',
            title: 'Account verification issue',
            description: 'Customer cannot verify their account',
            customer: 'jane.smith@example.com',
            status: 'in_progress',
            priority: 'medium',
            category: 'account',
            assignedTo: 'Support Agent',
            createdAt: new Date(Date.now() - 1 * 86400000),
            updatedAt: new Date(Date.now() - 6 * 3600000),
            responseTime: 1.2,
            satisfaction: 4
          },
          {
            id: 'TKT-003',
            title: 'Refund request',
            description: 'Customer requesting refund for failed transaction',
            customer: 'bob.wilson@example.com',
            status: 'resolved',
            priority: 'low',
            category: 'billing',
            assignedTo: 'Admin',
            createdAt: new Date(Date.now() - 3 * 86400000),
            updatedAt: new Date(Date.now() - 12 * 3600000),
            responseTime: 0.8,
            satisfaction: 5
          }
        ],
        liveChat: [
          {
            id: 'CHAT-001',
            customer: 'alice.brown@example.com',
            status: 'active',
            lastMessage: 'Hello, I need help with my order',
            lastActivity: new Date(Date.now() - 5 * 60 * 1000),
            messages: 12,
            agent: 'Support Agent'
          },
          {
            id: 'CHAT-002',
            customer: 'charlie.davis@example.com',
            status: 'waiting',
            lastMessage: 'How do I check my balance?',
            lastActivity: new Date(Date.now() - 15 * 60 * 1000),
            messages: 3,
            agent: null
          }
        ],
        knowledgeBase: [
          {
            id: 'KB-001',
            title: 'How to purchase data bundles',
            content: 'Step-by-step guide for purchasing data bundles...',
            category: 'technical',
            views: 1250,
            helpful: 89,
            createdAt: new Date(Date.now() - 30 * 86400000),
            updatedAt: new Date(Date.now() - 7 * 86400000)
          },
          {
            id: 'KB-002',
            title: 'Account verification process',
            content: 'Complete guide for verifying your account...',
            category: 'account',
            views: 890,
            helpful: 76,
            createdAt: new Date(Date.now() - 25 * 86400000),
            updatedAt: new Date(Date.now() - 5 * 86400000)
          }
        ],
        faqs: [
          {
            id: 'FAQ-001',
            question: 'How long does it take to receive data after purchase?',
            answer: 'Data is usually delivered within 5-10 minutes after successful payment.',
            category: 'delivery',
            views: 2100,
            helpful: 95
          },
          {
            id: 'FAQ-002',
            question: 'What payment methods do you accept?',
            answer: 'We accept mobile money, bank transfers, and credit cards.',
            category: 'payment',
            views: 1800,
            helpful: 88
          }
        ],
        stats: {
          totalTickets: 156,
          openTickets: 23,
          resolvedTickets: 133,
          avgResponseTime: 2.1,
          customerSatisfaction: 4.2,
          activeChats: 8
        }
      };

      setSupportData(mockData);
      
    } catch (error) {
      console.error('Error loading support data:', error);
      showNotification('Failed to load support data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketAction = async (action, ticketId, data = {}) => {
    try {
      setLoading(true);
      
      // In real implementation, this would call the API
      showNotification(`Ticket ${action} completed successfully`);
      loadSupportData();
      
    } catch (error) {
      console.error(`Error ${action} ticket:`, error);
      showNotification(`Failed to ${action} ticket`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async (chatId, message) => {
    try {
      setLoading(true);
      
      // In real implementation, this would send the message via API
      const newMsg = {
        id: Date.now(),
        sender: 'admin',
        message: message,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      showNotification('Message sent successfully');
      
    } catch (error) {
      console.error('Error sending message:', error);
      showNotification('Failed to send message', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Customer Support
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Comprehensive customer support management
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowTicketModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Ticket</span>
              </button>
              
              <button
                onClick={loadSupportData}
                disabled={loading}
                className="p-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'tickets', name: 'Tickets', icon: MessageSquare },
              { id: 'chat', name: 'Live Chat', icon: Users },
              { id: 'knowledge', name: 'Knowledge Base', icon: FileText },
              { id: 'faq', name: 'FAQ', icon: HelpCircle },
              { id: 'analytics', name: 'Analytics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tickets</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{supportData.stats.totalTickets}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+12% from last week</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Tickets</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{supportData.stats.openTickets}</p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingDown className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">-8% from last week</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{supportData.stats.avgResponseTime}h</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingDown className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">-15% from last week</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Satisfaction</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{supportData.stats.customerSatisfaction}/5</p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+0.3 from last week</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Tickets Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Support Tickets ({supportData.tickets.length})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Ticket ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Assigned To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {supportData.tickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {ticket.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {ticket.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {ticket.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {ticket.assignedTo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(ticket.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setShowTicketModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleTicketAction('assign', ticket.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleTicketAction('resolve', ticket.id)}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Live Chat Tab */}
        {activeTab === 'chat' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Chat Sessions</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Active Chats:</span>
                <span className="text-sm font-medium text-green-600">{supportData.stats.activeChats}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supportData.liveChat.map((chat) => (
                <div key={chat.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {chat.customer}
                    </h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(chat.status)}`}>
                      {chat.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Last Message:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{chat.lastMessage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Messages:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{chat.messages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Last Activity:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(chat.lastActivity)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Agent:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{chat.agent || 'Unassigned'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedChat(chat);
                        setShowChatModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Join Chat
                    </button>
                    <button className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors">
                      <UserCheck className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Knowledge Base Tab */}
        {activeTab === 'knowledge' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Knowledge Base</h3>
              <button
                onClick={() => setShowFaqModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Article</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supportData.knowledgeBase.map((article) => (
                <div key={article.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {article.title}
                    </h4>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {article.category}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Views:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{article.views}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Helpful:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{article.helpful}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Updated:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(article.updatedAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                      View
                    </button>
                    <button className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Frequently Asked Questions</h3>
              <button
                onClick={() => setShowFaqModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add FAQ</span>
              </button>
            </div>

            <div className="space-y-4">
              {supportData.faqs.map((faq) => (
                <div key={faq.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {faq.question}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {faq.answer}
                      </p>
                    </div>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 ml-4">
                      {faq.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{faq.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{faq.helpful}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                        Edit
                      </button>
                      <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Support Metrics */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Support Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Ticket Resolution Rate</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">First Response Time</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">2.1h</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }} />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Customer Satisfaction</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">4.2/5</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '84%' }} />
                  </div>
                </div>
              </div>

              {/* Top Categories */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Categories</h3>
                <div className="space-y-3">
                  {[
                    { category: 'Technical Issues', count: 45, percentage: 35 },
                    { category: 'Account Problems', count: 32, percentage: 25 },
                    { category: 'Billing Questions', count: 28, percentage: 22 },
                    { category: 'General Support', count: 23, percentage: 18 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.category}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Response Time Trends */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Response Time Trends</h3>
              <div className="h-64 flex items-end justify-center space-x-2">
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className="w-8 bg-blue-600 rounded-t transition-all duration-300"
                      style={{ height: `${Math.random() * 200 + 50}px` }}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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

export default CustomerSupportPage;
