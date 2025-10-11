'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Settings, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Eye,
  Users,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Save,
  X,
  CheckCircle,
  Clock,
  Target,
  Zap
} from 'lucide-react';

const AdminNotifications = () => {
  const [activeTab, setActiveTab] = useState('announcements');
  const [systemSettings, setSystemSettings] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsRes, announcementsRes, analyticsRes] = await Promise.all([
        fetch('/api/backend?path=/api/v1/admin/notifications/settings', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        }),
        fetch('/api/backend?path=/api/v1/admin/notifications/announcements', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        }),
        fetch('/api/backend?path=/api/v1/admin/notifications/analytics', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        })
      ]);

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSystemSettings(settingsData.settings);
      }

      if (announcementsRes.ok) {
        const announcementsData = await announcementsRes.json();
        setAnnouncements(announcementsData.announcements);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData.analytics);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSystem = async () => {
    try {
      const response = await fetch('/api/backend?path=/api/v1/admin/notifications/toggle', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled: !systemSettings.isEnabled })
      });

      if (response.ok) {
        const data = await response.json();
        setSystemSettings(prev => ({ ...prev, isEnabled: data.isEnabled }));
      }
    } catch (error) {
      console.error('Failed to toggle system:', error);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const response = await fetch('/api/backend?path=/api/v1/admin/notifications/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
      });

      if (response.ok) {
        const data = await response.json();
        setSystemSettings(data.settings);
        alert('Settings updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert('Failed to update settings');
    }
  };

  const toggleAnnouncement = async (announcementId) => {
    try {
      const response = await fetch(`/api/backend?path=/api/v1/admin/notifications/announcements/${announcementId}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnnouncements(prev => prev.map(a => 
          a._id === announcementId ? { ...a, isActive: data.isActive } : a
        ));
      }
    } catch (error) {
      console.error('Failed to toggle announcement:', error);
    }
  };

  const deleteAnnouncement = async (announcementId) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const response = await fetch(`/api/backend?path=/api/v1/admin/notifications/announcements/${announcementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        setAnnouncements(prev => prev.filter(a => a._id !== announcementId));
        alert('Announcement deleted successfully!');
      }
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      alert('Failed to delete announcement');
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notification system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notification System</h1>
            <p className="text-gray-600">Manage announcements and system settings</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">System Status:</span>
              <button
                onClick={toggleSystem}
                className="flex items-center space-x-2"
              >
                {systemSettings?.isEnabled ? (
                  <ToggleRight className="w-8 h-8 text-green-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-400" />
                )}
                <span className={`text-sm font-medium ${
                  systemSettings?.isEnabled ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {systemSettings?.isEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'announcements', label: 'Announcements', icon: Bell },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'announcements' && (
        <AnnouncementsTab 
          announcements={announcements}
          onRefresh={loadData}
          onCreate={() => setShowCreateModal(true)}
          onEdit={setEditingAnnouncement}
          onToggle={toggleAnnouncement}
          onDelete={deleteAnnouncement}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsTab 
          settings={systemSettings}
          onUpdate={updateSettings}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsTab analytics={analytics} />
      )}

      {/* Create/Edit Announcement Modal */}
      {(showCreateModal || editingAnnouncement) && (
        <CreateAnnouncementModal
          announcement={editingAnnouncement}
          onClose={() => {
            setShowCreateModal(false);
            setEditingAnnouncement(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setEditingAnnouncement(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};

// Announcements Tab Component
const AnnouncementsTab = ({ announcements, onRefresh, onCreate, onEdit, onToggle, onDelete }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
        <div className="flex space-x-3">
          <button
            onClick={onRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={onCreate}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Create Announcement</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Analytics
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {announcements.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Bell className="w-12 h-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
                      <p className="text-gray-500 mb-4">Create your first announcement to get started</p>
                      <button
                        onClick={onCreate}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Create Announcement
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                announcements.map((announcement) => (
                  <tr key={announcement._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {announcement.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {announcement.message.substring(0, 50)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        announcement.type === 'urgent' ? 'bg-red-100 text-red-800' :
                        announcement.type === 'promotion' ? 'bg-green-100 text-green-800' :
                        announcement.type === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        announcement.type === 'system' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {announcement.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        announcement.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        announcement.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        announcement.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {announcement.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {announcement.targetAudience}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        announcement.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {announcement.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{announcement.analytics?.totalViews || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{announcement.analytics?.uniqueViews || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => onToggle(announcement._id)}
                          className={`p-1 rounded ${
                            announcement.isActive ? 'text-green-600 hover:text-green-900' : 'text-gray-600 hover:text-gray-900'
                          }`}
                          title={announcement.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {announcement.isActive ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => onEdit(announcement)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDelete(announcement._id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Settings Tab Component
const SettingsTab = ({ settings, onUpdate }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onUpdate(localSettings);
  };

  if (!localSettings) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Global Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localSettings.globalSettings?.showOnLogin || false}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  globalSettings: {
                    ...prev.globalSettings,
                    showOnLogin: e.target.checked
                  }
                }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Show on login</span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localSettings.globalSettings?.allowUserDismiss || false}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  globalSettings: {
                    ...prev.globalSettings,
                    allowUserDismiss: e.target.checked
                  }
                }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Allow user dismiss</span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto-dismiss delay (seconds)
            </label>
            <input
              type="number"
              value={(localSettings.globalSettings?.autoDismissDelay || 10000) / 1000}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                globalSettings: {
                  ...prev.globalSettings,
                  autoDismissDelay: parseInt(e.target.value) * 1000
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max announcements per user
            </label>
            <input
              type="number"
              value={localSettings.globalSettings?.maxAnnouncementsPerUser || 5}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                globalSettings: {
                  ...prev.globalSettings,
                  maxAnnouncementsPerUser: parseInt(e.target.value)
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position
            </label>
            <select
              value={localSettings.displaySettings?.position || 'top-right'}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                displaySettings: {
                  ...prev.displaySettings,
                  position: e.target.value
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
              <option value="top-center">Top Center</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-center">Bottom Center</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Style
            </label>
            <select
              value={localSettings.displaySettings?.style || 'toast'}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                displaySettings: {
                  ...prev.displaySettings,
                  style: e.target.value
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="toast">Toast</option>
              <option value="banner">Banner</option>
              <option value="modal">Modal</option>
              <option value="popup">Popup</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ analytics }) => {
  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Bell className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Announcements</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalAnnouncements}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Announcements</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.activeAnnouncements}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Interactions</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalInteractions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics.averageEngagementRate || '0.0'}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create/Edit Announcement Modal Component
const CreateAnnouncementModal = ({ announcement, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    priority: 'normal',
    targetAudience: 'all',
    displaySettings: {
      showOnLogin: true,
      dismissible: true,
      autoDismiss: true,
      autoDismissDelay: 10000,
      showIcon: true
    },
    expiresAt: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || '',
        message: announcement.message || '',
        type: announcement.type || 'general',
        priority: announcement.priority || 'normal',
        targetAudience: announcement.targetAudience || 'all',
        displaySettings: {
          showOnLogin: announcement.displaySettings?.showOnLogin !== false,
          dismissible: announcement.displaySettings?.dismissible !== false,
          autoDismiss: announcement.displaySettings?.autoDismiss !== false,
          autoDismissDelay: announcement.displaySettings?.autoDismissDelay || 10000,
          showIcon: announcement.displaySettings?.showIcon !== false
        },
        expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt).toISOString().slice(0, 16) : ''
      });
    }
  }, [announcement]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const url = announcement 
        ? `/api/backend?path=/api/v1/admin/notifications/announcements/${announcement._id}`
        : '/api/backend?path=/api/v1/admin/notifications/announcements';
      
      const method = announcement ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to save announcement');
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Failed to save announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {announcement ? 'Edit Announcement' : 'Create Announcement'}
          </h3>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter announcement title"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
              placeholder="Enter announcement message"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">General</option>
                <option value="promotion">Promotion</option>
                <option value="maintenance">Maintenance</option>
                <option value="urgent">Urgent</option>
                <option value="system">System</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience
            </label>
            <select
              value={formData.targetAudience}
              onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="buyer">Buyers Only</option>
              <option value="seller">Sellers Only</option>
              <option value="agent">Agents Only</option>
              <option value="dealer">Dealers Only</option>
              <option value="admin">Admins Only</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expires At (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.displaySettings.showOnLogin}
                onChange={(e) => setFormData({
                  ...formData,
                  displaySettings: {
                    ...formData.displaySettings,
                    showOnLogin: e.target.checked
                  }
                })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Show on login</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.displaySettings.dismissible}
                onChange={(e) => setFormData({
                  ...formData,
                  displaySettings: {
                    ...formData.displaySettings,
                    dismissible: e.target.checked
                  }
                })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Dismissible</span>
            </label>
          </div>
        </form>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.title || !formData.message}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <span>{loading ? 'Saving...' : (announcement ? 'Update' : 'Create')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
