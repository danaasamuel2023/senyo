'use client'
import React from 'react';
import { useToast } from '@/component/ToastNotification';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

const ToastTestPage = () => {
  const { success, error, warning, info: showInfo } = useToast();

  const handleSuccess = () => {
    success('Operation completed successfully!', {
      description: 'Your data has been saved and processed.',
      duration: 4000
    });
  };

  const handleError = () => {
    error('Something went wrong!', {
      description: 'Please check your connection and try again.',
      duration: 6000
    });
  };

  const handleWarning = () => {
    warning('Please review your input', {
      description: 'Some fields may need attention before proceeding.',
      duration: 5000
    });
  };

  const handleInfo = () => {
    showInfo('New feature available!', {
      description: 'Check out our latest updates in the settings.',
      duration: 5000
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Toast Notification Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Test the new toast notification system that appears above the navbar.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleSuccess}
              className="flex items-center justify-center space-x-2 p-4 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
            >
              <CheckCircle size={20} />
              <span>Success Toast</span>
            </button>

            <button
              onClick={handleError}
              className="flex items-center justify-center space-x-2 p-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
            >
              <XCircle size={20} />
              <span>Error Toast</span>
            </button>

            <button
              onClick={handleWarning}
              className="flex items-center justify-center space-x-2 p-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl transition-colors"
            >
              <AlertCircle size={20} />
              <span>Warning Toast</span>
            </button>

            <button
              onClick={handleInfo}
              className="flex items-center justify-center space-x-2 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
            >
              <Info size={20} />
              <span>Info Toast</span>
            </button>
          </div>

          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Features:
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Appears above the navbar (z-index: 60)</li>
              <li>• Auto-dismisses after specified duration</li>
              <li>• Progress bar shows remaining time</li>
              <li>• Smooth animations and transitions</li>
              <li>• Dark mode support</li>
              <li>• Mobile responsive</li>
              <li>• Manual dismiss with close button</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastTestPage;
