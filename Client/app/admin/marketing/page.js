'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import adminAPI from '../../../utils/adminApi';
import {
  Megaphone, Target, Users, TrendingUp, BarChart3, Calendar, Plus,
  ArrowLeft, RefreshCw, Search, Filter, Eye, Edit, Trash2, Send,
  Mail, Phone, MessageSquare, Gift, Star, Zap, Globe, Share2,
  Download, Upload, Settings, Bell, Activity, Clock, Tag, DollarSign,
  CheckCircle, X, Save, Copy, ExternalLink, AlertCircle, ThumbsUp, Pause
} from 'lucide-react';

const MarketingToolsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('campaigns');
  
  // Marketing data state
  const [marketingData, setMarketingData] = useState({
    campaigns: [],
    promotions: [],
    newsletters: [],
    analytics: [],
    stats: {
      totalCampaigns: 0,
      activeCampaigns: 0,
      totalReach: 0,
      conversionRate: 0,
      revenue: 0,
      subscribers: 0
    }
  });

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    checkAuth();
    loadMarketingData();
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

  const loadMarketingData = async () => {
    try {
      setLoading(true);
      
      // Mock marketing data
      const mockData = {
        campaigns: [
          {
            id: 'CAMP-001',
            name: 'Summer Data Sale',
            type: 'email',
            status: 'active',
            target: 'all_users',
            startDate: new Date(Date.now() - 5 * 86400000),
            endDate: new Date(Date.now() + 25 * 86400000),
            budget: 5000,
            spent: 3200,
            reach: 15000,
            clicks: 1250,
            conversions: 89,
            revenue: 4500,
            roi: 140.6
          },
          {
            id: 'CAMP-002',
            name: 'New User Welcome',
            type: 'sms',
            status: 'completed',
            target: 'new_users',
            startDate: new Date(Date.now() - 30 * 86400000),
            endDate: new Date(Date.now() - 5 * 86400000),
            budget: 2000,
            spent: 1850,
            reach: 8500,
            clicks: 680,
            conversions: 45,
            revenue: 2200,
            roi: 118.9
          },
          {
            id: 'CAMP-003',
            name: 'VIP Customer Exclusive',
            type: 'push',
            status: 'draft',
            target: 'vip_users',
            startDate: new Date(Date.now() + 2 * 86400000),
            endDate: new Date(Date.now() + 32 * 86400000),
            budget: 3000,
            spent: 0,
            reach: 0,
            clicks: 0,
            conversions: 0,
            revenue: 0,
            roi: 0
          }
        ],
        promotions: [
          {
            id: 'PROMO-001',
            title: '20% Off MTN Bundles',
            description: 'Get 20% discount on all MTN data bundles',
            type: 'discount',
            value: 20,
            code: 'MTN20',
            status: 'active',
            startDate: new Date(Date.now() - 3 * 86400000),
            endDate: new Date(Date.now() + 27 * 86400000),
            usage: 1250,
            limit: 5000,
            revenue: 8500
          },
          {
            id: 'PROMO-002',
            title: 'Buy 2 Get 1 Free',
            description: 'Buy any 2 data bundles and get 1 free',
            type: 'bogo',
            value: 1,
            code: 'BOGO2',
            status: 'active',
            startDate: new Date(Date.now() - 7 * 86400000),
            endDate: new Date(Date.now() + 23 * 86400000),
            usage: 890,
            limit: 2000,
            revenue: 6200
          }
        ],
        newsletters: [
          {
            id: 'NEWS-001',
            subject: 'Weekly Data Deals',
            status: 'sent',
            recipients: 15000,
            opens: 8750,
            clicks: 2100,
            unsubscribes: 45,
            sentDate: new Date(Date.now() - 2 * 86400000),
            openRate: 58.3,
            clickRate: 24.0
          },
          {
            id: 'NEWS-002',
            subject: 'New Features Announcement',
            status: 'scheduled',
            recipients: 0,
            opens: 0,
            clicks: 0,
            unsubscribes: 0,
            sentDate: new Date(Date.now() + 1 * 86400000),
            openRate: 0,
            clickRate: 0
          }
        ],
        analytics: [
          {
            metric: 'Email Open Rate',
            value: 58.3,
            change: 5.2,
            trend: 'up'
          },
          {
            metric: 'SMS Delivery Rate',
            value: 98.7,
            change: 1.1,
            trend: 'up'
          },
          {
            metric: 'Push Notification CTR',
            value: 12.4,
            change: -2.3,
            trend: 'down'
          },
          {
            metric: 'Campaign ROI',
            value: 145.6,
            change: 8.9,
            trend: 'up'
          }
        ],
        stats: {
          totalCampaigns: 15,
          activeCampaigns: 8,
          totalReach: 125000,
          conversionRate: 12.5,
          revenue: 45000,
          subscribers: 25000
        }
      };

      setMarketingData(mockData);
      
    } catch (error) {
      console.error('Error loading marketing data:', error);
      showNotification('Failed to load marketing data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignAction = async (action, campaignId, data = {}) => {
    try {
      setLoading(true);
      
      // In real implementation, this would call the API
      showNotification(`Campaign ${action} completed successfully`);
      loadMarketingData();
      
    } catch (error) {
      console.error(`Error ${action} campaign:`, error);
      showNotification(`Failed to ${action} campaign`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const sendNewsletter = async (newsletterId) => {
    try {
      setLoading(true);
      
      // In real implementation, this would send the newsletter
      showNotification('Newsletter sent successfully');
      loadMarketingData();
      
    } catch (error) {
      console.error('Error sending newsletter:', error);
      showNotification('Failed to send newsletter', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'push': return <Bell className="w-4 h-4" />;
      case 'discount': return <DollarSign className="w-4 h-4" />;
      case 'bogo': return <Gift className="w-4 h-4" />;
      default: return <Megaphone className="w-4 h-4" />;
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
                <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Marketing Tools
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Comprehensive marketing campaign management
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCampaignModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Campaign</span>
              </button>
              
              <button
                onClick={loadMarketingData}
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
              { id: 'campaigns', name: 'Campaigns', icon: Target },
              { id: 'promotions', name: 'Promotions', icon: Gift },
              { id: 'newsletters', name: 'Newsletters', icon: Mail },
              { id: 'analytics', name: 'Analytics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-pink-500 text-pink-600'
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
        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Campaigns</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{marketingData.stats.totalCampaigns}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+3 from last month</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Campaigns</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{marketingData.stats.activeCampaigns}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+2 from last week</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reach</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{marketingData.stats.totalReach.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+15% from last month</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{marketingData.stats.conversionRate}%</p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+2.1% from last month</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input id="text-input" name="text-input" type="text"
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="draft">Draft</option>
                  <option value="paused">Paused</option>
                </select>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="push">Push</option>
                </select>
              </div>
            </div>

            {/* Campaigns Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Marketing Campaigns ({marketingData.campaigns.length})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Campaign
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Budget
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Reach
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        ROI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {marketingData.campaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                                {getTypeIcon(campaign.type)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {campaign.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {campaign.type.toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {campaign.reach.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {campaign.roi}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedItem(campaign);
                                setShowCampaignModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCampaignAction('pause', campaign.id)}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCampaignAction('duplicate', campaign.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Copy className="w-4 h-4" />
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

        {/* Promotions Tab */}
        {activeTab === 'promotions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Promotional Offers</h3>
              <button
                onClick={() => setShowPromotionModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Promotion</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketingData.promotions.map((promotion) => (
                <div key={promotion.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {promotion.title}
                    </h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(promotion.status)}`}>
                      {promotion.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {promotion.description}
                    </p>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Code:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{promotion.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Usage:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {promotion.usage} / {promotion.limit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Revenue:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(promotion.revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Valid Until:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(promotion.endDate)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                      Edit
                    </button>
                    <button className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Newsletters Tab */}
        {activeTab === 'newsletters' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Newsletters</h3>
              <button
                onClick={() => setShowNewsletterModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Newsletter</span>
              </button>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Recipients
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Open Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Click Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Sent Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {marketingData.newsletters.map((newsletter) => (
                      <tr key={newsletter.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {newsletter.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(newsletter.status)}`}>
                            {newsletter.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {newsletter.recipients.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {newsletter.openRate}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {newsletter.clickRate}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(newsletter.sentDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedItem(newsletter);
                                setShowNewsletterModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {newsletter.status === 'scheduled' && (
                              <button
                                onClick={() => sendNewsletter(newsletter.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            )}
                            <button className="text-purple-600 hover:text-purple-900">
                              <Copy className="w-4 h-4" />
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

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Key Metrics */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Metrics</h3>
                <div className="space-y-4">
                  {marketingData.analytics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{metric.metric}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {metric.value}{metric.metric.includes('Rate') ? '%' : ''}
                        </span>
                        <div className={`flex items-center space-x-1 ${
                          metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <TrendingUp className={`w-3 h-3 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                          <span className="text-xs">{metric.change}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Campaign Performance */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Campaign Performance</h3>
                <div className="space-y-3">
                  {marketingData.campaigns.slice(0, 5).map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{campaign.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-pink-600 h-2 rounded-full"
                            style={{ width: `${Math.min(campaign.roi, 200)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{campaign.roi}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue Trends */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trends</h3>
              <div className="h-64 flex items-end justify-center space-x-2">
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className="w-8 bg-pink-600 rounded-t transition-all duration-300"
                      style={{ height: `${Math.random() * 200 + 50}px` }}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(2024, i).toLocaleDateString('en-US', { month: 'short' })}
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

export default MarketingToolsPage;
