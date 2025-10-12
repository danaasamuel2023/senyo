'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Info, AlertTriangle } from 'lucide-react';

const MTNStyleNotification = ({ 
  title = "Information",
  message,
  type = "info", // info, warning, urgent
  onDismiss,
  dismissText = "I've Read This - Dismiss Forever",
  autoDismiss = false,
  autoDismissDelay = 15000
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300);
  }, [onDismiss]);

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      case 'urgent':
        return <AlertTriangle className="w-8 h-8 text-red-500" />;
      default:
        return <Info className="w-8 h-8 text-gray-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-500';
      case 'urgent':
        return 'bg-red-500';
      default:
        return 'bg-yellow-400';
    }
  };


  // Auto dismiss functionality
  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismissDelay);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, autoDismissDelay, handleDismiss]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className={`${getBackgroundColor()} rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ${
        isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 rounded-lg p-2 mr-3">
              {getIcon()}
            </div>
            <h2 className="text-white text-lg font-semibold">{title}</h2>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-4">
          <div className="text-white text-sm leading-relaxed whitespace-pre-wrap">
            {message}
          </div>
        </div>

        {/* Warning Message */}
        <div className="px-6 pb-4">
          <div className="flex items-start">
            <AlertTriangle className="w-4 h-4 text-yellow-300 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-white text-xs opacity-90">
              Please read this announcement carefully. You must acknowledge this information before it can be dismissed for new announcements to appear.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="px-6 pb-6 flex justify-center">
          <button
            onClick={handleDismiss}
            className="bg-yellow-300 hover:bg-yellow-200 text-gray-800 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {dismissText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MTNStyleNotification;
