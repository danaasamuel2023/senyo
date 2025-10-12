'use client';

import React, { useState, useEffect, useCallback } from 'react';
import LoginAnnouncement from './LoginAnnouncement';
import AnnouncementBanner from './AnnouncementBanner';
import MTNStyleNotification from './MTNStyleNotification';

// Error boundary for notification components
class NotificationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Notification system error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null; // Fail silently for notifications
    }

    return this.props.children;
  }
}

const NotificationManager = ({ userId, onAnnouncementsLoaded }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [systemSettings, setSystemSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Don't render if there's an error - let ErrorBoundary handle it
  if (error) {
    console.error('NotificationManager error:', error);
    return null;
  }

  const loadAnnouncements = useCallback(async () => {
    if (!userId) return;
    
    // Validate userId format (should be 24-character MongoDB ObjectId)
    if (!userId || userId.length !== 24 || !/^[a-f0-9]{24}$/i.test(userId)) {
      console.error('❌ Invalid userId format:', {
        userId,
        length: userId?.length,
        isValidFormat: userId && /^[a-f0-9]{24}$/i.test(userId)
      });
      setError('Invalid user ID format');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔔 Loading announcements for userId:', userId);
      
      const response = await fetch(`/api/backend?path=/api/v1/admin/notifications/user/announcements/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
        setSystemSettings(data.systemSettings);
        
        // Track view interactions for each announcement
        if (data.announcements && data.announcements.length > 0) {
          data.announcements.forEach(announcement => {
            trackInteraction(announcement._id, 'viewed');
          });
        }
        
        // Notify parent component
        if (onAnnouncementsLoaded) {
          onAnnouncementsLoaded(data.announcements, data.systemSettings);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to load announcements');
      }
    } catch (err) {
      console.error('Error loading announcements:', err);
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const trackInteraction = async (announcementId, action, metadata = {}) => {
    try {
      await fetch('/api/backend?path=/api/v1/admin/notifications/user/interaction', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          announcementId,
          action,
          metadata
        })
      });
    } catch (err) {
      console.error('Error tracking interaction:', err);
    }
  };

  const handleDismiss = async (announcementId) => {
    try {
      // Track dismissal
      await trackInteraction(announcementId, 'dismissed');
      
      // Remove from local state
      setAnnouncements(prev => prev.filter(a => a._id !== announcementId));
      
      // Also call the backend dismiss endpoint
      await fetch(`/api/backend?path=/api/v1/admin/notifications/user/dismiss/${announcementId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
    } catch (err) {
      console.error('Error dismissing announcement:', err);
    }
  };

  const handleSkip = () => {
    // Dismiss all announcements
    announcements.forEach(announcement => {
      handleDismiss(announcement._id);
    });
  };

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  // Don't render anything if system is disabled or no announcements
  if (!systemSettings || !systemSettings.isEnabled || announcements.length === 0) {
    return null;
  }

  const displayStyle = systemSettings.displaySettings?.style || 'toast';

  return (
    <>
      {displayStyle === 'toast' && (
        <LoginAnnouncement
          announcements={announcements}
          onDismiss={handleDismiss}
          systemSettings={systemSettings}
        />
      )}
      
      {displayStyle === 'banner' && (
        <AnnouncementBanner
          announcements={announcements}
          onDismiss={handleDismiss}
          systemSettings={systemSettings}
        />
      )}
      
      {/* MTN Style Notification */}
      {displayStyle === 'mtn-popup' && announcements.length > 0 && (
        <MTNStyleNotification
          title={announcements[0].title}
          message={announcements[0].message}
          type={announcements[0].type === 'urgent' ? 'urgent' : announcements[0].type === 'maintenance' ? 'warning' : 'info'}
          onDismiss={() => handleDismiss(announcements[0]._id)}
          dismissText={announcements[0].actionButton?.text || "I've Read This - Dismiss Forever"}
          autoDismiss={announcements[0].displaySettings?.autoDismiss || false}
          autoDismissDelay={announcements[0].displaySettings?.autoDismissDelay || 15000}
        />
      )}
      
      {/* Add other display styles here as needed */}
      {displayStyle === 'modal' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {announcements[0]?.title}
            </h3>
            <p className="text-gray-700 mb-6">
              {announcements[0]?.message}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                Skip All
              </button>
              <button
                onClick={() => handleDismiss(announcements[0]._id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Wrap NotificationManager with error boundary
const NotificationManagerWithErrorBoundary = (props) => {
  return (
    <NotificationErrorBoundary>
      <NotificationManager {...props} />
    </NotificationErrorBoundary>
  );
};

export default NotificationManagerWithErrorBoundary;
