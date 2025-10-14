'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import adminAPI from '../../../utils/adminApi';
import { withAuth } from '../../../utils/auth';
import {
  FileText, Image, Video, Music, Upload, Download, Plus, Edit, Trash2,
  ArrowLeft, RefreshCw, Search, Filter, Eye, Save, X, Settings, Bell,
  Calendar, Tag, Star, ThumbsUp, ThumbsDown, BarChart3, TrendingUp,
  Globe, Lock, Unlock, Copy, Share2, ExternalLink, Folder, File,
  AlertCircle, CheckCircle, Clock, Users, Activity
} from 'lucide-react';

const ContentManagementPage = ({ user }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Content data state
  const [contentData, setContentData] = useState({
    pages: [],
    blog: [],
    media: [],
    banners: [],
    settings: [],
    stats: {
      totalPages: 0,
      publishedPages: 0,
      draftPages: 0,
      totalMedia: 0,
      totalSize: 0,
      lastUpdated: new Date()
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
  const [showPageModal, setShowPageModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Content editing
  const [editingContent, setEditingContent] = useState(null);
  const [contentTitle, setContentTitle] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [contentStatus, setContentStatus] = useState('draft');

  useEffect(() => {
    loadContentData();
  }, [currentPage, itemsPerPage]);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const loadContentData = async () => {
    try {
      setLoading(true);
      
      // Mock content data
      const mockData = {
        pages: [
          {
            id: 'PAGE-001',
            title: 'Homepage',
            slug: 'home',
            status: 'published',
            type: 'page',
            author: 'Admin',
            createdAt: new Date(Date.now() - 30 * 86400000),
            updatedAt: new Date(Date.now() - 7 * 86400000),
            views: 12500,
            seoTitle: 'UnlimitedData GH - Buy Data Bundles Online',
            seoDescription: 'Purchase MTN, Vodafone, and AirtelTigo data bundles online'
          },
          {
            id: 'PAGE-002',
            title: 'About Us',
            slug: 'about',
            status: 'published',
            type: 'page',
            author: 'Admin',
            createdAt: new Date(Date.now() - 25 * 86400000),
            updatedAt: new Date(Date.now() - 5 * 86400000),
            views: 3200,
            seoTitle: 'About UnlimitedData GH',
            seoDescription: 'Learn more about our data bundle services'
          },
          {
            id: 'PAGE-003',
            title: 'New Feature Announcement',
            slug: 'new-feature-announcement',
            status: 'draft',
            type: 'blog',
            author: 'Admin',
            createdAt: new Date(Date.now() - 2 * 86400000),
            updatedAt: new Date(Date.now() - 1 * 86400000),
            views: 0,
            seoTitle: 'New Feature Announcement',
            seoDescription: 'Exciting new features coming to our platform'
          }
        ],
        blog: [
          {
            id: 'BLOG-001',
            title: 'How to Choose the Right Data Bundle',
            slug: 'how-to-choose-right-data-bundle',
            status: 'published',
            type: 'blog',
            author: 'Admin',
            createdAt: new Date(Date.now() - 15 * 86400000),
            updatedAt: new Date(Date.now() - 3 * 86400000),
            views: 8500,
            category: 'guides',
            tags: ['data', 'bundles', 'guide'],
            featured: true
          },
          {
            id: 'BLOG-002',
            title: 'Network Coverage Update',
            slug: 'network-coverage-update',
            status: 'published',
            type: 'blog',
            author: 'Admin',
            createdAt: new Date(Date.now() - 10 * 86400000),
            updatedAt: new Date(Date.now() - 2 * 86400000),
            views: 4200,
            category: 'news',
            tags: ['network', 'coverage', 'update'],
            featured: false
          }
        ],
        media: [
          {
            id: 'MEDIA-001',
            name: 'hero-banner.jpg',
            type: 'image',
            size: 245760,
            url: '/images/hero-banner.jpg',
            uploadedAt: new Date(Date.now() - 20 * 86400000),
            uploadedBy: 'Admin',
            alt: 'Hero banner for homepage'
          },
          {
            id: 'MEDIA-002',
            name: 'product-demo.mp4',
            type: 'video',
            size: 15728640,
            url: '/videos/product-demo.mp4',
            uploadedAt: new Date(Date.now() - 12 * 86400000),
            uploadedBy: 'Admin',
            alt: 'Product demonstration video'
          }
        ],
        banners: [
          {
            id: 'BANNER-001',
            title: 'Summer Sale Banner',
            image: '/images/summer-sale.jpg',
            link: '/promotions/summer-sale',
            position: 'top',
            status: 'active',
            startDate: new Date(Date.now() - 5 * 86400000),
            endDate: new Date(Date.now() + 25 * 86400000),
            clicks: 1250,
            impressions: 15000
          },
          {
            id: 'BANNER-002',
            title: 'New User Welcome',
            image: '/images/welcome-banner.jpg',
            link: '/register',
            position: 'sidebar',
            status: 'active',
            startDate: new Date(Date.now() - 30 * 86400000),
            endDate: new Date(Date.now() + 30 * 86400000),
            clicks: 890,
            impressions: 12000
          }
        ],
        settings: {
          siteTitle: 'UnlimitedData GH',
          siteDescription: 'Buy data bundles online',
          siteKeywords: 'data, bundles, MTN, Vodafone, AirtelTigo',
          maintenanceMode: false,
          allowRegistration: true,
          allowComments: true,
          defaultLanguage: 'en',
          timezone: 'GMT'
        },
        stats: {
          totalPages: 12,
          publishedPages: 10,
          draftPages: 2,
          totalMedia: 45,
          totalSize: 125000000, // bytes
          lastUpdated: new Date()
        }
      };

      setContentData(mockData);
      
    } catch (error) {
      console.error('Error loading content data:', error);
      showNotification('Failed to load content data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleContentAction = async (action, contentId, data = {}) => {
    try {
      setLoading(true);
      
      // In real implementation, this would call the API
      showNotification(`Content ${action} completed successfully`);
      loadContentData();
      
    } catch (error) {
      console.error(`Error ${action} content:`, error);
      showNotification(`Failed to ${action} content`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    try {
      setLoading(true);
      
      // In real implementation, this would save to the database
      showNotification('Content saved successfully');
      setEditingContent(null);
      setContentTitle('');
      setContentBody('');
      setContentStatus('draft');
      loadContentData();
      
    } catch (error) {
      console.error('Error saving content:', error);
      showNotification('Failed to save content', 'error');
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'page': return <FileText className="w-4 h-4" />;
      case 'blog': return <FileText className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
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
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Content Management
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage website content, media, and pages
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPageModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Content</span>
              </button>
              
              <button
                onClick={loadContentData}
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
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'pages', name: 'Pages', icon: FileText },
              { id: 'blog', name: 'Blog', icon: FileText },
              { id: 'media', name: 'Media', icon: Image },
              { id: 'banners', name: 'Banners', icon: Globe },
              { id: 'settings', name: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
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
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pages</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{contentData.stats.totalPages}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{contentData.stats.publishedPages}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+1 from last week</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Media Files</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{contentData.stats.totalMedia}</p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Image className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+5 from last week</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Size</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatFileSize(contentData.stats.totalSize)}</p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Folder className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+2.5MB from last week</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {contentData.pages.slice(0, 5).map((page) => (
                  <div key={page.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getTypeIcon(page.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {page.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(page.updatedAt)} • {page.views} views
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(page.status)}`}>
                        {page.status}
                      </span>
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pages Tab */}
        {activeTab === 'pages' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input id="text-input" name="text-input" type="text"
                      placeholder="Search pages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="page">Page</option>
                  <option value="blog">Blog</option>
                </select>
              </div>
            </div>

            {/* Pages Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pages ({contentData.pages.length})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {contentData.pages.map((page) => (
                      <tr key={page.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {getTypeIcon(page.type)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {page.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                /{page.slug}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {page.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(page.status)}`}>
                            {page.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {page.author}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {page.views.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(page.updatedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingContent(page);
                                setContentTitle(page.title);
                                setContentBody(page.content || '');
                                setContentStatus(page.status);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-purple-600 hover:text-purple-900">
                              <Copy className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="w-4 h-4" />
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

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Media Library</h3>
              <button
                onClick={() => setShowMediaModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Media</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {contentData.media.map((media) => (
                <div key={media.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                    {getTypeIcon(media.type)}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {media.name}
                    </h4>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(media.size)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(media.uploadedAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4">
                    <button className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                      View
                    </button>
                    <button className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors">
                      <Edit className="w-3 h-3" />
                    </button>
                    <button className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Banners Tab */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Promotional Banners</h3>
              <button
                onClick={() => setShowBannerModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Banner</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contentData.banners.map((banner) => (
                <div key={banner.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {banner.title}
                    </h4>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Position:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{banner.position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Clicks:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{banner.clicks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Impressions:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{banner.impressions}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(banner.status)}`}>
                      {banner.status}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                        Edit
                      </button>
                      <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Site Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Site Title
                    </label>
                    <input id="text-input" name="text-input" type="text"
                      defaultValue={contentData.settings.siteTitle}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Site Description
                    </label>
                    <textarea
                      rows={3}
                      defaultValue={contentData.settings.siteDescription}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Site Keywords
                    </label>
                    <input id="text-input" name="text-input" type="text"
                      defaultValue={contentData.settings.siteKeywords}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Maintenance Mode</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Registration</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-600 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Comments</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-600 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default Language
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Editor Modal */}
      {editingContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-4xl h-5/6 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Content</h3>
              <button
                onClick={() => setEditingContent(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input id="text-input" name="text-input" type="text"
                    value={contentTitle}
                    onChange={(e) => setContentTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    rows={20}
                    value={contentBody}
                    onChange={(e) => setContentBody(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your content here..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={contentStatus}
                    onChange={(e) => setContentStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setEditingContent(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveContent}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {loading ? 'Saving...' : 'Save Content'}
              </button>
            </div>
          </div>
        </div>
      )}

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

// Export with authentication protection
export default withAuth(ContentManagementPage, {
  redirectTo: '/SignIn?redirect=/admin/content',
  requiredRole: 'admin',
  fallback: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Authenticating...</h2>
        <p className="text-gray-500 dark:text-gray-400">Please wait while we verify your admin access.</p>
      </div>
    </div>
  )
});
