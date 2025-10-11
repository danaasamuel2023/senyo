const express = require('express');
const router = express.Router();
const { authMiddleware, adminAuth } = require('../middleware/auth');
const User = require('../schema/schema').User;
const Announcement = require('../schema/schema').Announcement;
const NotificationSystem = require('../schema/schema').NotificationSystem;
const UserAnnouncementInteraction = require('../schema/schema').UserAnnouncementInteraction;

// ==================== SYSTEM SETTINGS ====================

// Get notification system settings
router.get('/settings', authMiddleware, adminAuth, async (req, res) => {
  try {
    let settings = await NotificationSystem.findOne().sort({ createdAt: -1 });
    
    if (!settings) {
      // Create default settings
      settings = new NotificationSystem({
        lastUpdatedBy: req.userId
      });
      await settings.save();
    }
    
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update notification system settings
router.put('/settings', authMiddleware, adminAuth, async (req, res) => {
  try {
    const {
      isEnabled,
      globalSettings,
      displaySettings,
      targetingSettings,
      analyticsSettings
    } = req.body;
    
    const updateData = {
      lastUpdatedBy: req.userId,
      lastUpdatedAt: new Date()
    };
    
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled;
    if (globalSettings) updateData.globalSettings = globalSettings;
    if (displaySettings) updateData.displaySettings = displaySettings;
    if (targetingSettings) updateData.targetingSettings = targetingSettings;
    if (analyticsSettings) updateData.analyticsSettings = analyticsSettings;
    
    const settings = await NotificationSystem.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true }
    );
    
    res.json({ success: true, settings, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle notification system
router.post('/toggle', authMiddleware, adminAuth, async (req, res) => {
  try {
    const { enabled } = req.body;
    
    const settings = await NotificationSystem.findOneAndUpdate(
      {},
      { 
        $set: { 
          isEnabled: enabled,
          lastUpdatedBy: req.userId,
          lastUpdatedAt: new Date()
        }
      },
      { new: true, upsert: true }
    );
    
    res.json({ 
      success: true, 
      isEnabled: settings.isEnabled,
      message: `Notification system ${enabled ? 'enabled' : 'disabled'}`
    });
  } catch (error) {
    console.error('Error toggling notification system:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ANNOUNCEMENTS ====================

// Create announcement
router.post('/announcements', authMiddleware, adminAuth, async (req, res) => {
  try {
    const announcementData = {
      ...req.body,
      sentBy: req.userId
    };
    
    const announcement = new Announcement(announcementData);
    await announcement.save();
    
    res.json({ success: true, announcement });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all announcements with analytics
router.get('/announcements', authMiddleware, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type, priority } = req.query;
    
    let query = {};
    if (status) query.isActive = status === 'active';
    if (type) query.type = type;
    if (priority) query.priority = priority;
    
    const announcements = await Announcement.find(query)
      .populate('sentBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Announcement.countDocuments(query);
    
    res.json({ 
      success: true, 
      announcements, 
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single announcement
router.get('/announcements/:id', authMiddleware, adminAuth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('sentBy', 'name email');
    
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    
    res.json({ success: true, announcement });
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update announcement
router.put('/announcements/:id', authMiddleware, adminAuth, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    
    res.json({ success: true, announcement });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete announcement
router.delete('/announcements/:id', authMiddleware, adminAuth, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    await UserAnnouncementInteraction.deleteMany({ announcementId: req.params.id });
    
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle announcement status
router.post('/announcements/:id/toggle', authMiddleware, adminAuth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    
    announcement.isActive = !announcement.isActive;
    await announcement.save();
    
    res.json({ 
      success: true, 
      isActive: announcement.isActive,
      message: `Announcement ${announcement.isActive ? 'activated' : 'deactivated'}`
    });
  } catch (error) {
    console.error('Error toggling announcement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ANALYTICS ====================

// Get announcement analytics
router.get('/analytics/:announcementId', authMiddleware, adminAuth, async (req, res) => {
  try {
    const { announcementId } = req.params;
    const { startDate, endDate } = req.query;
    
    let query = { announcementId };
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const interactions = await UserAnnouncementInteraction.find(query);
    
    const analytics = {
      totalViews: interactions.filter(i => i.action === 'viewed').length,
      totalDismissals: interactions.filter(i => i.action === 'dismissed').length,
      totalClicks: interactions.filter(i => i.action === 'clicked').length,
      uniqueUsers: new Set(interactions.map(i => i.userId.toString())).size,
      interactionsByDay: {},
      interactionsByAction: {}
    };
    
    // Group by day
    interactions.forEach(interaction => {
      const day = interaction.timestamp.toISOString().split('T')[0];
      if (!analytics.interactionsByDay[day]) {
        analytics.interactionsByDay[day] = 0;
      }
      analytics.interactionsByDay[day]++;
    });
    
    // Group by action
    interactions.forEach(interaction => {
      if (!analytics.interactionsByAction[interaction.action]) {
        analytics.interactionsByAction[interaction.action] = 0;
      }
      analytics.interactionsByAction[interaction.action]++;
    });
    
    res.json({ success: true, analytics });
  } catch (error) {
    console.error('Error fetching announcement analytics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get system-wide analytics
router.get('/analytics', authMiddleware, adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const totalAnnouncements = await Announcement.countDocuments();
    const activeAnnouncements = await Announcement.countDocuments({ isActive: true });
    const totalInteractions = await UserAnnouncementInteraction.countDocuments(query);
    
    // Get top performing announcements
    const topAnnouncements = await Announcement.find({ isActive: true })
      .sort({ 'analytics.totalViews': -1 })
      .limit(5)
      .select('title analytics.totalViews analytics.totalClicks');
    
    // Get recent activity
    const recentInteractions = await UserAnnouncementInteraction.find(query)
      .populate('announcementId', 'title')
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(10);
    
    const systemAnalytics = {
      totalAnnouncements,
      activeAnnouncements,
      totalInteractions,
      averageEngagementRate: totalAnnouncements > 0 ? (totalInteractions / totalAnnouncements * 100).toFixed(2) : 0,
      topPerformingAnnouncements: topAnnouncements,
      recentActivity: recentInteractions
    };
    
    res.json({ success: true, analytics: systemAnalytics });
  } catch (error) {
    console.error('Error fetching system analytics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== USER ENDPOINTS ====================

// Get active announcements for user
router.get('/user/announcements/:userId', authMiddleware, async (req, res) => {
  try {
    // Check if notification system is enabled
    const systemSettings = await NotificationSystem.findOne().sort({ createdAt: -1 });
    if (!systemSettings || !systemSettings.isEnabled) {
      return res.json({ success: true, announcements: [], systemSettings: null });
    }
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Get user's interaction history
    const userInteractions = await UserAnnouncementInteraction.find({ 
      userId: req.params.userId,
      action: 'dismissed'
    }).select('announcementId');
    
    const dismissedIds = userInteractions.map(i => i.announcementId);
    
    // Build query
    let query = {
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    };
    
    // Target audience filtering
    if (systemSettings.targetingSettings.enableRoleTargeting) {
      query.$or = [
        { targetAudience: 'all' },
        { targetAudience: user.role }
      ];
    }
    
    // Exclude dismissed announcements
    if (dismissedIds.length > 0) {
      query._id = { $nin: dismissedIds };
    }
    
    const announcements = await Announcement.find(query)
      .populate('sentBy', 'name')
      .sort({ priority: -1, createdAt: -1 })
      .limit(systemSettings.globalSettings.maxAnnouncementsPerUser || 5);
    
    res.json({ success: true, announcements, systemSettings });
  } catch (error) {
    console.error('Error fetching user announcements:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Track user interaction
router.post('/user/interaction', authMiddleware, async (req, res) => {
  try {
    const { announcementId, action, metadata } = req.body;
    
    // Check if interaction already exists for this user and announcement
    const existingInteraction = await UserAnnouncementInteraction.findOne({
      userId: req.userId,
      announcementId,
      action
    });
    
    if (existingInteraction) {
      return res.json({ success: true, message: 'Interaction already tracked' });
    }
    
    const interaction = new UserAnnouncementInteraction({
      userId: req.userId,
      announcementId,
      action,
      metadata,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    });
    
    await interaction.save();
    
    // Update announcement analytics
    const updateField = `analytics.total${action.charAt(0).toUpperCase() + action.slice(1)}s`;
    await Announcement.findByIdAndUpdate(announcementId, {
      $inc: { [updateField]: 1 }
    });
    
    res.json({ success: true, message: 'Interaction tracked' });
  } catch (error) {
    console.error('Error tracking user interaction:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Dismiss announcement for user
router.post('/user/dismiss/:announcementId', authMiddleware, async (req, res) => {
  try {
    const announcementId = req.params.announcementId;
    
    // Track dismissal
    const interaction = new UserAnnouncementInteraction({
      userId: req.userId,
      announcementId,
      action: 'dismissed',
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    });
    
    await interaction.save();
    
    // Update announcement analytics
    await Announcement.findByIdAndUpdate(announcementId, {
      $inc: { 'analytics.totalDismissals': 1 }
    });
    
    res.json({ success: true, message: 'Announcement dismissed' });
  } catch (error) {
    console.error('Error dismissing announcement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
