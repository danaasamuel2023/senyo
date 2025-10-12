'use client';

import React, { useState } from 'react';
import MTNStyleNotification from '../../component/MTNStyleNotification';

const TestMTNNotification = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('info');
  const [customMessage, setCustomMessage] = useState(`🟡 MTN Yellow Portal Update
The MTN Yellow portal is facing new restrictions after recent downtime, causing delays of up to 4 hours. You can still place your orders, but please don't promise customers fast delivery. We're working hard to restore normal speed soon. Thanks for your patience and support.`);

  const handleDismiss = () => {
    setShowNotification(false);
    console.log('Notification dismissed');
  };

  const showTestNotification = () => {
    setShowNotification(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">MTN Style Notification Test</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Controls</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Type
              </label>
              <select
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Message
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="6"
                placeholder="Enter your notification message..."
              />
            </div>
            
            <button
              onClick={showTestNotification}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Show MTN Style Notification
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✅ Gold popup design matching MTN style</li>
            <li>✅ Information icon in rounded container</li>
            <li>✅ Dismiss button (X) in top right</li>
            <li>✅ Warning triangle with acknowledgment text</li>
            <li>✅ Dismiss button: "I've Read This - Dismiss Forever"</li>
            <li>✅ Smooth animations</li>
            <li>✅ Auto-dismiss functionality</li>
            <li>✅ Responsive design</li>
            <li>✅ Different types: info, warning, urgent</li>
            <li>✅ Centered dismiss button</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Integration</h2>
          <p className="text-gray-700 mb-4">
            This notification system is integrated with your existing notification backend:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>• Admin can create MTN-style notifications via `/admin/notifications`</li>
            <li>• Select "MTN Style Popup" as display style</li>
            <li>• Configure MTN-specific settings (dismiss text, auto-dismiss)</li>
            <li>• Notifications are stored in MongoDB and displayed to users</li>
            <li>• User interactions are tracked for analytics</li>
          </ul>
        </div>
      </div>

      {showNotification && (
        <MTNStyleNotification
          title="Information"
          message={customMessage}
          type={notificationType}
          onDismiss={handleDismiss}
          dismissText="I've Read This - Dismiss Forever"
          autoDismiss={false}
        />
      )}
    </div>
  );
};

export default TestMTNNotification;
