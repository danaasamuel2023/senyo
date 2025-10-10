'use client'
import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// Toast Context
const ToastContext = createContext();

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'success',
      duration: 5000,
      ...toast,
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (message, options = {}) => {
    addToast({ type: 'success', message, ...options });
  };

  const error = (message, options = {}) => {
    addToast({ type: 'error', message, duration: 7000, ...options });
  };

  const warning = (message, options = {}) => {
    addToast({ type: 'warning', message, ...options });
  };

  const info = (message, options = {}) => {
    addToast({ type: 'info', message, ...options });
  };

  return (
    <ToastContext.Provider value={{ success, error, warning, info, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] space-y-2 max-w-sm w-full px-4">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

// Individual Toast Component
const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getToastStyles = () => {
    const baseStyles = "relative flex items-start p-4 rounded-xl shadow-lg backdrop-blur-sm border transition-all duration-300 transform";
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-50/95 dark:bg-green-900/95 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200`;
      case 'error':
        return `${baseStyles} bg-red-50/95 dark:bg-red-900/95 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200`;
      case 'warning':
        return `${baseStyles} bg-yellow-50/95 dark:bg-yellow-900/95 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200`;
      case 'info':
        return `${baseStyles} bg-blue-50/95 dark:bg-blue-900/95 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200`;
      default:
        return `${baseStyles} bg-gray-50/95 dark:bg-gray-900/95 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200`;
    }
  };

  const getIcon = () => {
    const iconProps = { size: 20, className: "flex-shrink-0 mt-0.5" };
    
    switch (toast.type) {
      case 'success':
        return <CheckCircle {...iconProps} className={`${iconProps.className} text-green-600 dark:text-green-400`} />;
      case 'error':
        return <XCircle {...iconProps} className={`${iconProps.className} text-red-600 dark:text-red-400`} />;
      case 'warning':
        return <AlertCircle {...iconProps} className={`${iconProps.className} text-yellow-600 dark:text-yellow-400`} />;
      case 'info':
        return <Info {...iconProps} className={`${iconProps.className} text-blue-600 dark:text-blue-400`} />;
      default:
        return <Info {...iconProps} />;
    }
  };

  return (
    <div
      className={`${getToastStyles()} ${
        isVisible && !isLeaving 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-[-100%] opacity-0 scale-95'
      }`}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-current opacity-20 rounded-t-xl">
        <div 
          className="h-full bg-current opacity-60 rounded-t-xl animate-progress-shrink"
          style={{
            animationDuration: `${toast.duration}ms`,
            transformOrigin: 'left'
          }}
        />
      </div>

      {/* Icon */}
      {getIcon()}

      {/* Content */}
      <div className="ml-3 flex-1 min-w-0">
        <p className="text-sm font-medium leading-5 break-words">
          {toast.message}
        </p>
        {toast.description && (
          <p className="mt-1 text-xs opacity-80 leading-4 break-words">
            {toast.description}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleRemove}
        className="ml-3 flex-shrink-0 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="Close notification"
      >
        <X size={16} className="opacity-60 hover:opacity-100" />
      </button>

    </div>
  );
};

// Default export for the main toast system
export default ToastProvider;
