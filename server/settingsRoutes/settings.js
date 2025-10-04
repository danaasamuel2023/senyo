const express = require('express');
const router = express.Router();
const { User } = require('../schema/schema');
const bcrypt = require('bcryptjs');

// Middleware to verify user authentication
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    // TODO: Implement proper JWT verification
    // For now, assuming userId is passed in headers
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User ID required' });
    }
    
    req.userId = userId;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

// Get user settings
router.get('/settings', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('name email phoneNumber preferences notificationPreferences securitySettings twoFactorEnabled')
      .lean();
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      data: {
        account: {
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber
        },
        preferences: user.preferences || {},
        notifications: user.notificationPreferences || {},
        security: {
          twoFactorEnabled: user.twoFactorEnabled || false,
          sessionTimeout: user.securitySettings?.sessionTimeout || 30,
          loginNotifications: user.securitySettings?.loginNotifications !== false,
          deviceManagement: user.securitySettings?.deviceManagementEnabled !== false
        }
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

// Update account information
router.put('/settings/account', authenticateUser, async (req, res) => {
  try {
    const { name, email, phoneNumber, currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update basic info
    if (name) user.name = name;
    if (email && email !== user.email) {
      // Check if email already exists
      const existingEmail = await User.findOne({ email, _id: { $ne: req.userId } });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      user.email = email;
      user.emailVerified = false; // Reset verification
    }
    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      // Check if phone already exists
      const existingPhone = await User.findOne({ phoneNumber, _id: { $ne: req.userId } });
      if (existingPhone) {
        return res.status(400).json({ success: false, message: 'Phone number already in use' });
      }
      user.phoneNumber = phoneNumber;
      user.phoneVerified = false; // Reset verification
    }
    
    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password required' });
      }
      
      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      
      // Validate new password
      if (newPassword.length < 8) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
      }
      
      // Hash and update password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.lastPasswordReset = new Date();
      
      // Log activity
      if (!user.activityLog) user.activityLog = [];
      user.activityLog.push({
        action: 'password_changed',
        details: 'Password updated via settings',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        timestamp: new Date()
      });
      
      // Keep only last 100 activities
      if (user.activityLog.length > 100) {
        user.activityLog = user.activityLog.slice(-100);
      }
    }
    
    await user.save();
    
    // Return updated user data (without password)
    const updatedUser = await User.findById(req.userId)
      .select('name email phoneNumber')
      .lean();
    
    res.json({
      success: true,
      message: 'Account settings updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating account settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update account settings' });
  }
});

// Update preferences
router.put('/settings/preferences', authenticateUser, async (req, res) => {
  try {
    const { theme, language, currency, timezone, dateFormat, numberFormat } = req.body;
    
    const updateData = {};
    if (theme) updateData['preferences.theme'] = theme;
    if (language) updateData['preferences.language'] = language;
    if (currency) updateData['preferences.currency'] = currency;
    if (timezone) updateData['preferences.timezone'] = timezone;
    if (dateFormat) updateData['preferences.dateFormat'] = dateFormat;
    if (numberFormat) updateData['preferences.numberFormat'] = numberFormat;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, select: 'preferences' }
    ).lean();
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.preferences
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ success: false, message: 'Failed to update preferences' });
  }
});

// Update notification settings
router.put('/settings/notifications', authenticateUser, async (req, res) => {
  try {
    const { channels, categories, quietHours } = req.body;
    
    const updateData = {};
    if (channels) {
      if (channels.email) updateData['notificationPreferences.channels.email'] = channels.email;
      if (channels.sms) updateData['notificationPreferences.channels.sms'] = channels.sms;
      if (channels.push) updateData['notificationPreferences.channels.push'] = channels.push;
      if (channels.inApp !== undefined) updateData['notificationPreferences.channels.inApp'] = channels.inApp;
    }
    
    if (categories) {
      Object.keys(categories).forEach(key => {
        updateData[`notificationPreferences.categories.${key}`] = categories[key];
      });
    }
    
    if (quietHours) {
      if (quietHours.enabled !== undefined) updateData['notificationPreferences.quietHours.enabled'] = quietHours.enabled;
      if (quietHours.startTime) updateData['notificationPreferences.quietHours.startTime'] = quietHours.startTime;
      if (quietHours.endTime) updateData['notificationPreferences.quietHours.endTime'] = quietHours.endTime;
      if (quietHours.timezone) updateData['notificationPreferences.quietHours.timezone'] = quietHours.timezone;
    }
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, select: 'notificationPreferences' }
    ).lean();
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: user.notificationPreferences
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification settings' });
  }
});

// Update security settings
router.put('/settings/security', authenticateUser, async (req, res) => {
  try {
    const { 
      twoFactorEnabled, 
      sessionTimeout, 
      loginNotifications, 
      deviceManagement 
    } = req.body;
    
    const updateData = {};
    
    if (twoFactorEnabled !== undefined) {
      updateData.twoFactorEnabled = twoFactorEnabled;
      if (twoFactorEnabled === false) {
        // Disable 2FA
        updateData.twoFactorSecret = null;
        updateData.twoFactorBackupCodes = [];
      }
    }
    
    if (sessionTimeout !== undefined) {
      updateData['securitySettings.sessionTimeout'] = sessionTimeout;
    }
    
    if (loginNotifications !== undefined) {
      updateData['securitySettings.loginNotifications'] = loginNotifications;
    }
    
    if (deviceManagement !== undefined) {
      updateData['securitySettings.deviceManagementEnabled'] = deviceManagement;
    }
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, select: 'twoFactorEnabled securitySettings' }
    ).lean();
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Log security change
    await User.findByIdAndUpdate(req.userId, {
      $push: {
        activityLog: {
          $each: [{
            action: 'security_settings_changed',
            details: 'Security settings updated',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            timestamp: new Date()
          }],
          $slice: -100
        }
      }
    });
    
    res.json({
      success: true,
      message: 'Security settings updated successfully',
      data: {
        twoFactorEnabled: user.twoFactorEnabled,
        securitySettings: user.securitySettings
      }
    });
  } catch (error) {
    console.error('Error updating security settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update security settings' });
  }
});

// Get active sessions
router.get('/settings/sessions', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('activeSessions')
      .lean();
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      data: user.activeSessions || []
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
  }
});

// Revoke a session
router.delete('/settings/sessions/:sessionId', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $pull: {
          activeSessions: { sessionId }
        }
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (error) {
    console.error('Error revoking session:', error);
    res.status(500).json({ success: false, message: 'Failed to revoke session' });
  }
});

// Request data export
router.post('/settings/export-data', authenticateUser, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      'privacySettings.dataExportRequested': new Date()
    });
    
    // TODO: Implement actual data export logic (generate CSV/JSON)
    // This should be handled by a background job
    
    res.json({
      success: true,
      message: 'Data export requested. You will receive an email when ready.'
    });
  } catch (error) {
    console.error('Error requesting data export:', error);
    res.status(500).json({ success: false, message: 'Failed to request data export' });
  }
});

// Update privacy settings
router.put('/settings/privacy', authenticateUser, async (req, res) => {
  try {
    const {
      profileVisibility,
      showOnlineStatus,
      allowContactByEmail,
      allowContactBySMS
    } = req.body;
    
    const updateData = {};
    if (profileVisibility) updateData['privacySettings.profileVisibility'] = profileVisibility;
    if (showOnlineStatus !== undefined) updateData['privacySettings.showOnlineStatus'] = showOnlineStatus;
    if (allowContactByEmail !== undefined) updateData['privacySettings.allowContactByEmail'] = allowContactByEmail;
    if (allowContactBySMS !== undefined) updateData['privacySettings.allowContactBySMS'] = allowContactBySMS;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, select: 'privacySettings' }
    ).lean();
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'Privacy settings updated successfully',
      data: user.privacySettings
    });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update privacy settings' });
  }
});

// Delete account
router.delete('/settings/account', authenticateUser, async (req, res) => {
  try {
    const { password, confirmation } = req.body;
    
    if (confirmation !== 'DELETE MY ACCOUNT') {
      return res.status(400).json({ 
        success: false, 
        message: 'Please type "DELETE MY ACCOUNT" to confirm' 
      });
    }
    
    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Incorrect password' });
    }
    
    // TODO: Implement soft delete or anonymization instead of hard delete
    // For now, just disable the account
    user.isDisabled = true;
    user.disableReason = 'Account deleted by user';
    user.disabledAt = new Date();
    await user.save();
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
});

module.exports = router;

