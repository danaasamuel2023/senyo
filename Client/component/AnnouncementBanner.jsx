'use client';

import React, { useState, useEffect } from 'react';
import { X, Bell, AlertTriangle, Info, Gift, Wrench, ChevronDown, ChevronUp } from 'lucide-react';

const AnnouncementBanner = ({ announcements, onDismiss, systemSettings }) => {
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [autoDismissTimer, setAutoDismissTimer] = useState(null);

  useEffect(() => {
    if (announcements && announcements.length > 0) {
      setCurrentAnnouncement(announcements[0]);
      setIsVisible(true);
    }
  }, [announcements]);

  const getIcon = (type) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-5 h-5" />;
      case 'promotion': return <Gift className="w-5 h-5" />;
      case 'maintenance': return <Wrench className="w-5 h-5" />;
      case 'system': return <Info className="w-5 h-5" />;
      case 'marketing': return <Gift className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getBannerStyle = (type, priority) => {
    const baseStyle = "w-full border-b-4 shadow-sm";
    
    if (priority === 'urgent') {
      return `${baseStyle} bg-red-50 border-red-500 text-red-800`;
    } else if (type === 'promotion') {
      return `${baseStyle} bg-green-50 border-green-500 text-green-800`;
    } else if (type === 'maintenance') {
      return `${baseStyle} bg-yellow-50 border-yellow-500 text-yellow-800`;
    } else if (type === 'system') {
      return `${baseStyle} bg-blue-50 border-blue-500 text-blue-800`;
    } else if (type === 'marketing') {
      return `${baseStyle} bg-purple-50 border-purple-500 text-purple-800`;
    } else {
      return `${baseStyle} bg-blue-50 border-blue-500 text-blue-800`;
    }
  };

  const handleDismiss = () => {
    if (autoDismissTimer) {
      clearTimeout(autoDismissTimer);
      setAutoDismissTimer(null);
    }
    
    onDismiss(currentAnnouncement._id);
    setIsVisible(false);
  };

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleAutoDismiss = () => {
    const dismissDelay = currentAnnouncement?.displaySettings?.autoDismissDelay || 
                        systemSettings?.globalSettings?.autoDismissDelay || 
                        10000;
    
    if (currentAnnouncement?.displaySettings?.autoDismiss !== false && 
        currentAnnouncement?.priority !== 'urgent') {
      const timer = setTimeout(() => {
        if (isVisible) {
          handleDismiss();
        }
      }, dismissDelay);
      
      setAutoDismissTimer(timer);
    }
  };

  const handleActionClick = () => {
    if (currentAnnouncement?.actionButton?.url) {
      window.open(currentAnnouncement.actionButton.url, '_blank');
    }
    
    // Track click interaction
    fetch('/api/backend?path=/api/v1/admin/notifications/user/interaction', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        announcementId: currentAnnouncement._id,
        action: 'clicked',
        metadata: { actionButton: true }
      })
    }).catch(console.error);
  };

  useEffect(() => {
    if (isVisible && currentAnnouncement) {
      handleAutoDismiss();
    }
    
    return () => {
      if (autoDismissTimer) {
        clearTimeout(autoDismissTimer);
      }
    };
  }, [isVisible, currentAnnouncement]);

  if (!isVisible || !currentAnnouncement) {
    return null;
  }

  return (
    <div className={`${getBannerStyle(currentAnnouncement.type, currentAnnouncement.priority)} transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {currentAnnouncement.displaySettings?.showIcon !== false && getIcon(currentAnnouncement.type)}
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">
                  {currentAnnouncement.title}
                </h3>
                {!isCollapsed && (
                  <div className="mt-1">
                    <p className="text-sm opacity-90 whitespace-pre-wrap">
                      {currentAnnouncement.message}
                    </p>
                    
                    {/* Action Button */}
                    {currentAnnouncement.actionButton?.text && (
                      <div className="mt-2">
                        <button
                          onClick={handleActionClick}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          {currentAnnouncement.actionButton.text}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Priority Badge */}
              {systemSettings?.globalSettings?.showPriorityBadges && 
               currentAnnouncement.priority !== 'normal' && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  currentAnnouncement.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  currentAnnouncement.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {currentAnnouncement.priority.toUpperCase()}
                </span>
              )}
              
              {/* Auto-dismiss indicator */}
              {currentAnnouncement.displaySettings?.autoDismiss !== false && 
               currentAnnouncement.priority !== 'urgent' && 
               autoDismissTimer && (
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full transition-all duration-100 ease-linear" 
                      style={{width: '100%'}}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {Math.round((currentAnnouncement.displaySettings?.autoDismissDelay || 10000) / 1000)}s
                  </span>
                </div>
              )}
              
              {/* Collapse/Expand Button */}
              <button
                onClick={handleCollapse}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title={isCollapsed ? 'Expand' : 'Collapse'}
              >
                {isCollapsed ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </button>
              
              {/* Dismiss Button */}
              {currentAnnouncement.displaySettings?.dismissible !== false && (
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Dismiss"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
