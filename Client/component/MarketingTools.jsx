'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone, Target, Gift, Percent, Calendar, Clock, Users,
  Mail, MessageCircle, Share2, QrCode, Download, Eye, Edit3,
  Trash2, Plus, Save, X, BarChart3, TrendingUp, Star,
  AlertCircle, CheckCircle, Loader2, Bell, Send, Copy
} from 'lucide-react';
import { getApiEndpoint } from '@/utils/apiConfig';

const MarketingTools = ({ agentId }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [notification, setNotification] = useState(null);

  // Campaign form state
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    type: 'email',
    targetAudience: 'all',
    startDate: '',
    endDate: '',
    isActive: true,
    content: '',
    subject: '',
    image: null
  });

  // Promotion form state
  const [promotionForm, setPromotionForm] = useState({
    name: '',
    description: '',
    type: 'percentage',
    value: 0,
    minOrderAmount: 0,
    maxDiscount: 0,
    usageLimit: 0,
    startDate: '',
    endDate: '',
    isActive: true,
    applicableProducts: [],
    customerGroups: []
  });

  useEffect(() => {
    loadMarketingData();
  }, [agentId]);

  const loadMarketingData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const API_URL = getApiEndpoint('');

      const [campaignsRes, promotionsRes] = await Promise.all([
        fetch(`${API_URL}/api/agent/campaigns`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_URL}/api/agent/promotions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (campaignsRes.ok) {
        const campaignsData = await campaignsRes.json();
        setCampaigns(campaignsData.campaigns || []);
      }

      if (promotionsRes.ok) {
        const promotionsData = await promotionsRes.json();
        setPromotions(promotionsData.promotions || []);
      }
    } catch (error) {
      console.error('Failed to load marketing data:', error);
      showNotification('Failed to load marketing data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSaveCampaign = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const API_URL = getApiEndpoint('');

      const campaignData = {
        ...campaignForm,
        agentId
      };

      const url = editingCampaign 
        ? `${API_URL}/api/agent/campaigns/${editingCampaign._id}`
        : `${API_URL}/api/agent/campaigns`;

      const method = editingCampaign ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaignData)
      });

      if (response.ok) {
        showNotification(
          editingCampaign ? 'Campaign updated successfully!' : 'Campaign created successfully!', 
          'success'
        );
        setShowCampaignModal(false);
        resetCampaignForm();
        loadMarketingData();
      } else {
        showNotification('Failed to save campaign', 'error');
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      showNotification('Error saving campaign', 'error');
    }
  };

  const handleSavePromotion = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const API_URL = getApiEndpoint('');

      const promotionData = {
        ...promotionForm,
        agentId
      };

      const url = editingPromotion 
        ? `${API_URL}/api/agent/promotions/${editingPromotion._id}`
        : `${API_URL}/api/agent/promotions`;

      const method = editingPromotion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(promotionData)
      });

      if (response.ok) {
        showNotification(
          editingPromotion ? 'Promotion updated successfully!' : 'Promotion created successfully!', 
          'success'
        );
        setShowPromotionModal(false);
        resetPromotionForm();
        loadMarketingData();
      } else {
        showNotification('Failed to save promotion', 'error');
      }
    } catch (error) {
      console.error('Error saving promotion:', error);
      showNotification('Error saving promotion', 'error');
    }
  };

  const resetCampaignForm = () => {
    setCampaignForm({
      name: '',
      description: '',
      type: 'email',
      targetAudience: 'all',
      startDate: '',
      endDate: '',
      isActive: true,
      content: '',
      subject: '',
      image: null
    });
    setEditingCampaign(null);
  };

  const resetPromotionForm = () => {
    setPromotionForm({
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      minOrderAmount: 0,
      maxDiscount: 0,
      usageLimit: 0,
      startDate: '',
      endDate: '',
      isActive: true,
      applicableProducts: [],
      customerGroups: []
    });
    setEditingPromotion(null);
  };

  const openCampaignModal = (campaign = null) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setCampaignForm({
        name: campaign.name || '',
        description: campaign.description || '',
        type: campaign.type || 'email',
        targetAudience: campaign.targetAudience || 'all',
        startDate: campaign.startDate || '',
        endDate: campaign.endDate || '',
        isActive: campaign.isActive !== undefined ? campaign.isActive : true,
        content: campaign.content || '',
        subject: campaign.subject || '',
        image: campaign.image || null
      });
    } else {
      resetCampaignForm();
    }
    setShowCampaignModal(true);
  };

  const openPromotionModal = (promotion = null) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setPromotionForm({
        name: promotion.name || '',
        description: promotion.description || '',
        type: promotion.type || 'percentage',
        value: promotion.value || 0,
        minOrderAmount: promotion.minOrderAmount || 0,
        maxDiscount: promotion.maxDiscount || 0,
        usageLimit: promotion.usageLimit || 0,
        startDate: promotion.startDate || '',
        endDate: promotion.endDate || '',
        isActive: promotion.isActive !== undefined ? promotion.isActive : true,
        applicableProducts: promotion.applicableProducts || [],
        customerGroups: promotion.customerGroups || []
      });
    } else {
      resetPromotionForm();
    }
    setShowPromotionModal(true);
  };

  const generateQRCode = (data) => {
    // This would integrate with a QR code generation service
    console.log('Generating QR code for:', data);
    showNotification('QR code generated!', 'success');
  };

  const shareStore = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out my store!',
        text: 'Amazing deals on data bundles',
        url: window.location.origin + `/agent-store/${agentId}`
      });
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.origin + `/agent-store/${agentId}`);
      showNotification('Store URL copied to clipboard!', 'success');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFCC08]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Marketing Tools</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create campaigns, promotions, and grow your customer base
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={shareStore}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Store</span>
          </button>
          <button
            onClick={() => generateQRCode(`agent-store/${agentId}`)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Generate QR</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-[#FFCC08] to-yellow-600 rounded-2xl p-[2px] shadow-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Campaigns</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {campaigns.filter(c => c.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFCC08] to-yellow-600 flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-black" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Promotions</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {promotions.filter(p => p.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Percent className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Reach</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {campaigns.reduce((sum, c) => sum + (c.reach || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Marketing Campaigns</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage your marketing campaigns</p>
            </div>
            <button
              onClick={() => openCampaignModal()}
              className="flex items-center space-x-2 px-4 py-2 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign</span>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((campaign) => (
              <div key={campaign._id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFCC08] to-yellow-500 flex items-center justify-center">
                      <Megaphone className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{campaign.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{campaign.type}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    campaign.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {campaign.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{campaign.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <span>Reach: {campaign.reach || 0}</span>
                  <span>Sent: {campaign.sent || 0}</span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => openCampaignModal(campaign)}
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-all text-sm font-medium"
                  >
                    <Edit3 className="w-4 h-4 inline mr-1" />
                    Edit
                  </button>
                  <button className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-sm font-medium">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {campaigns.length === 0 && (
            <div className="text-center py-8">
              <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No campaigns yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Promotions Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Promotions & Discounts</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Create special offers and discounts</p>
            </div>
            <button
              onClick={() => openPromotionModal()}
              className="flex items-center space-x-2 px-4 py-2 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Create Promotion</span>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promotions.map((promotion) => (
              <div key={promotion._id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                      <Percent className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{promotion.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {promotion.type === 'percentage' ? `${promotion.value}% off` : `₵${promotion.value} off`}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    promotion.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {promotion.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{promotion.description}</p>
                
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <div className="flex justify-between">
                    <span>Min Order:</span>
                    <span>₵{promotion.minOrderAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Usage Limit:</span>
                    <span>{promotion.usageLimit || 'Unlimited'}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => openPromotionModal(promotion)}
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-all text-sm font-medium"
                  >
                    <Edit3 className="w-4 h-4 inline mr-1" />
                    Edit
                  </button>
                  <button className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-sm font-medium">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {promotions.length === 0 && (
            <div className="text-center py-8">
              <Percent className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No promotions yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
                </h3>
                <button
                  onClick={() => setShowCampaignModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="e.g., Summer Sale Campaign"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Campaign Type *
                  </label>
                  <select
                    value={campaignForm.type}
                    onChange={(e) => setCampaignForm({...campaignForm, type: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                  >
                    <option value="email">Email Campaign</option>
                    <option value="sms">SMS Campaign</option>
                    <option value="social">Social Media</option>
                    <option value="push">Push Notification</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={campaignForm.startDate}
                    onChange={(e) => setCampaignForm({...campaignForm, startDate: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={campaignForm.endDate}
                    onChange={(e) => setCampaignForm({...campaignForm, endDate: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({...campaignForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Describe your campaign..."
                />
              </div>

              {campaignForm.type === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={campaignForm.subject}
                    onChange={(e) => setCampaignForm({...campaignForm, subject: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="Email subject line"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={campaignForm.content}
                  onChange={(e) => setCampaignForm({...campaignForm, content: e.target.value})}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Campaign content..."
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={campaignForm.isActive}
                  onChange={(e) => setCampaignForm({...campaignForm, isActive: e.target.checked})}
                  className="w-4 h-4 text-[#FFCC08] bg-gray-100 border-gray-300 rounded focus:ring-[#FFCC08] focus:ring-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Campaign is active
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCampaignModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCampaign}
                  className="flex-1 px-4 py-3 bg-[#FFCC08] text-black rounded-xl font-semibold hover:bg-yellow-500 transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingCampaign ? 'Update Campaign' : 'Create Campaign'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Promotion Modal */}
      {showPromotionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
                </h3>
                <button
                  onClick={() => setShowPromotionModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Promotion Name *
                  </label>
                  <input
                    type="text"
                    value={promotionForm.name}
                    onChange={(e) => setPromotionForm({...promotionForm, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="e.g., Summer Sale 20% Off"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Discount Type *
                  </label>
                  <select
                    value={promotionForm.type}
                    onChange={(e) => setPromotionForm({...promotionForm, type: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                  >
                    <option value="percentage">Percentage Off</option>
                    <option value="fixed">Fixed Amount Off</option>
                    <option value="buy_x_get_y">Buy X Get Y</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={promotionForm.value}
                    onChange={(e) => setPromotionForm({...promotionForm, value: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Order Amount (₵)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={promotionForm.minOrderAmount}
                    onChange={(e) => setPromotionForm({...promotionForm, minOrderAmount: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={promotionForm.startDate}
                    onChange={(e) => setPromotionForm({...promotionForm, startDate: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={promotionForm.endDate}
                    onChange={(e) => setPromotionForm({...promotionForm, endDate: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={promotionForm.description}
                  onChange={(e) => setPromotionForm({...promotionForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Describe your promotion..."
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={promotionForm.isActive}
                  onChange={(e) => setPromotionForm({...promotionForm, isActive: e.target.checked})}
                  className="w-4 h-4 text-[#FFCC08] bg-gray-100 border-gray-300 rounded focus:ring-[#FFCC08] focus:ring-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Promotion is active
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPromotionModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePromotion}
                  className="flex-1 px-4 py-3 bg-[#FFCC08] text-black rounded-xl font-semibold hover:bg-yellow-500 transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingPromotion ? 'Update Promotion' : 'Create Promotion'}</span>
                </button>
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

export default MarketingTools;
