'use client';

import React, { useState, useEffect } from 'react';
import { X, Bell, AlertTriangle, Info, Gift, Wrench, CheckCircle } from 'lucide-react';

const LoginAnnouncement = ({ announcements, onDismiss, systemSettings }) => {
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoDismissTimer, setAutoDismissTimer] = useState(null);

  useEffect(() => {
    if (announcements && announcements.length > 0) {
      setCurrentAnnouncement(announcements[0]);
      setIsVisible(true);
    }
  }, [announcements]);

  const getIcon = (type) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'promotion': return <Gift className="w-5 h-5 text-green-500" />;
      case 'maintenance': return <Wrench className="w-5 h-5 text-yellow-500" />;
      case 'system': return <Info className="w-5 h-5 text-blue-500" />;
      case 'marketing': return <Gift className="w-5 h-5 text-purple-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationStyle = (type, priority, position = 'top-right') => {
    const baseStyle = "fixed z-50 max-w-md w-full mx-4 shadow-lg rounded-lg border-l-4 transform transition-all duration-300 ease-in-out";
    
    // Position styles
    const positionStyles = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };
    
    const positionClass = positionStyles[position] || positionStyles['top-right'];
    
    // Color styles based on type and priority
    if (priority === 'urgent') {
      return `${baseStyle} ${positionClass} bg-red-50 border-red-500 text-red-800`;
    } else if (type === 'promotion') {
      return `${baseStyle} ${positionClass} bg-green-50 border-green-500 text-green-800`;
    } else if (type === 'maintenance') {
      return `${baseStyle} ${positionClass} bg-yellow-50 border-yellow-500 text-yellow-800`;
    } else if (type === 'system') {
      return `${baseStyle} ${positionClass} bg-blue-50 border-blue-500 text-blue-800`;
    } else if (type === 'marketing') {
      return `${baseStyle} ${positionClass} bg-purple-50 border-purple-500 text-purple-800`;
    } else {
      return `${baseStyle} ${positionClass} bg-blue-50 border-blue-500 text-blue-800`;
    }
  };

  const handleDismiss = () => {
    setIsAnimating(true);
    if (autoDismissTimer) {
      clearTimeout(autoDismissTimer);
      setAutoDismissTimer(null);
    }
    
    setTimeout(() => {
      onDismiss(currentAnnouncement._id);
      setIsVisible(false);
      setIsAnimating(false);
    }, 300);
  };

  const handleAutoDismiss = () => {
    // Auto-dismiss based on system settings and announcement settings
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

  const position = systemSettings?.displaySettings?.position || 'top-right';
  const animation = systemSettings?.displaySettings?.animation || 'slide';

  return (
    <div className={`${getNotificationStyle(currentAnnouncement.type, currentAnnouncement.priority, position)} ${
      isAnimating ? 
        (animation === 'slide' ? 'translate-x-full opacity-0' : 
         animation === 'fade' ? 'opacity-0' : 
         animation === 'bounce' ? 'scale-0' : 'opacity-0') : 
        'translate-x-0 opacity-100'
    }`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {currentAnnouncement.displaySettings?.showIcon !== false && getIcon(currentAnnouncement.type)}
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">
                {currentAnnouncement.title}
              </h3>
              {currentAnnouncement.displaySettings?.dismissible !== false && (
                <button
                  onClick={handleDismiss}
                  className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="mt-1">
              <p className="text-sm opacity-90 whitespace-pre-wrap">
                {currentAnnouncement.message}
              </p>
            </div>
            
            {/* Priority Badge */}
            {systemSettings?.globalSettings?.showPriorityBadges && 
             currentAnnouncement.priority !== 'normal' && (
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  currentAnnouncement.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  currentAnnouncement.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {currentAnnouncement.priority.toUpperCase()}
                </span>
              </div>
            )}
            
            {/* Action Button */}
            {currentAnnouncement.actionButton?.text && (
              <div className="mt-3">
                <button
                  onClick={handleActionClick}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  {currentAnnouncement.actionButton.text}
                </button>
              </div>
            )}
            
            {/* Auto-dismiss indicator */}
            {currentAnnouncement.displaySettings?.autoDismiss !== false && 
             currentAnnouncement.priority !== 'urgent' && 
             autoDismissTimer && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all duration-100 ease-linear" 
                    style={{width: '100%'}}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Auto-dismisses in {Math.round((currentAnnouncement.displaySettings?.autoDismissDelay || 10000) / 1000)} seconds
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAnnouncement;
