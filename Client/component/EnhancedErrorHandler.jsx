import React from 'react';
import { AlertCircle, XCircle, Info, CheckCircle, Loader2 } from 'lucide-react';

/**
 * Enhanced Error Handler Component
 * Provides user-friendly error messages and loading states
 */

export const ErrorMessage = ({ 
  error, 
  onDismiss, 
  type = 'error',
  showIcon = true,
  className = '' 
}) => {
  if (!error) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className={`flex items-start p-4 rounded-lg border ${getStyles()} ${className}`}>
      {showIcon && (
        <div className="flex-shrink-0 mr-3 mt-0.5">
          {getIcon()}
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm font-medium">{error}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export const LoadingSpinner = ({ 
  size = 'md', 
  message = 'Loading...', 
  className = '' 
}) => {
  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-6 h-6';
      case 'lg':
        return 'w-8 h-8';
      case 'xl':
        return 'w-12 h-12';
      default:
        return 'w-6 h-6';
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center space-x-3">
        <Loader2 className={`${getSize()} animate-spin text-[#FFCC08]`} />
        {message && (
          <span className="text-sm text-gray-600 dark:text-gray-400">{message}</span>
        )}
      </div>
    </div>
  );
};

export const LoadingOverlay = ({ 
  isLoading, 
  message = 'Processing...', 
  className = '' 
}) => {
  if (!isLoading) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-sm mx-4">
        <LoadingSpinner size="lg" message={message} />
      </div>
    </div>
  );
};

export const SuccessMessage = ({ 
  message, 
  onDismiss, 
  className = '' 
}) => {
  return (
    <ErrorMessage
      error={message}
      onDismiss={onDismiss}
      type="success"
      className={className}
    />
  );
};

export const WarningMessage = ({ 
  message, 
  onDismiss, 
  className = '' 
}) => {
  return (
    <ErrorMessage
      error={message}
      onDismiss={onDismiss}
      type="warning"
      className={className}
    />
  );
};

export const InfoMessage = ({ 
  message, 
  onDismiss, 
  className = '' 
}) => {
  return (
    <ErrorMessage
      error={message}
      onDismiss={onDismiss}
      type="info"
      className={className}
    />
  );
};

// Enhanced toast notification component
export const EnhancedToast = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300); // Wait for fade out
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'info':
        return 'bg-blue-500 text-white';
      case 'success':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${getStyles()} transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="flex items-center">
        {type === 'error' && <XCircle className="w-5 h-5 mr-2" />}
        {type === 'warning' && <AlertCircle className="w-5 h-5 mr-2" />}
        {type === 'info' && <Info className="w-5 h-5 mr-2" />}
        {type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

export default {
  ErrorMessage,
  LoadingSpinner,
  LoadingOverlay,
  SuccessMessage,
  WarningMessage,
  InfoMessage,
  EnhancedToast
};
