import React, { useEffect, useState } from 'react';

/**
 * Performance Monitor Component
 * Tracks and displays performance metrics
 */

export const PerformanceMonitor = ({ children }) => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    apiResponseTime: 0,
    memoryUsage: 0
  });

  useEffect(() => {
    // Track page load time
    const loadTime = performance.now();
    setMetrics(prev => ({ ...prev, loadTime }));

    // Track memory usage
    if ('memory' in performance) {
      const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
      setMetrics(prev => ({ ...prev, memoryUsage }));
    }

    // Track render time
    const renderStart = performance.now();
    requestAnimationFrame(() => {
      const renderTime = performance.now() - renderStart;
      setMetrics(prev => ({ ...prev, renderTime }));
    });

    // Log performance metrics
    console.log('🚀 Performance Metrics:', {
      loadTime: `${loadTime.toFixed(2)}ms`,
      memoryUsage: `${metrics.memoryUsage.toFixed(2)}MB`,
      renderTime: `${metrics.renderTime.toFixed(2)}ms`
    });

  }, []);

  return children;
};

export const ApiPerformanceTracker = () => {
  const [apiMetrics, setApiMetrics] = useState([]);

  const trackApiCall = (url, startTime, endTime, success) => {
    const responseTime = endTime - startTime;
    const metric = {
      url,
      responseTime,
      success,
      timestamp: new Date().toISOString()
    };

    setApiMetrics(prev => [...prev.slice(-9), metric]); // Keep last 10 metrics

    // Log API performance
    console.log(`🌐 API Call: ${url} - ${responseTime.toFixed(2)}ms - ${success ? '✅' : '❌'}`);
  };

  return { apiMetrics, trackApiCall };
};

export const UserInteractionTracker = () => {
  const [interactions, setInteractions] = useState([]);

  useEffect(() => {
    const trackInteraction = (event) => {
      const interaction = {
        type: event.type,
        target: event.target.tagName,
        timestamp: new Date().toISOString(),
        url: window.location.pathname
      };

      setInteractions(prev => [...prev.slice(-19), interaction]); // Keep last 20 interactions
    };

    // Track user interactions
    document.addEventListener('click', trackInteraction);
    document.addEventListener('keydown', trackInteraction);
    document.addEventListener('scroll', trackInteraction);

    return () => {
      document.removeEventListener('click', trackInteraction);
      document.removeEventListener('keydown', trackInteraction);
      document.removeEventListener('scroll', trackInteraction);
    };
  }, []);

  return interactions;
};

export const ErrorTracker = () => {
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const trackError = (error) => {
      const errorInfo = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        url: window.location.pathname,
        userAgent: navigator.userAgent
      };

      setErrors(prev => [...prev.slice(-9), errorInfo]); // Keep last 10 errors

      // Log error
      console.error('❌ Error Tracked:', errorInfo);
    };

    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      trackError(event.error);
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      trackError(new Error(event.reason));
    });

    return () => {
      window.removeEventListener('error', trackError);
      window.removeEventListener('unhandledrejection', trackError);
    };
  }, []);

  return errors;
};

export const PerformanceDashboard = ({ show = false }) => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    memoryUsage: 0,
    renderTime: 0
  });

  const { apiMetrics } = ApiPerformanceTracker();
  const interactions = UserInteractionTracker();
  const errors = ErrorTracker();

  useEffect(() => {
    // Update metrics periodically
    const interval = setInterval(() => {
      if ('memory' in performance) {
        const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
        setMetrics(prev => ({ ...prev, memoryUsage }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Performance Dashboard</h3>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Memory:</span>
          <span className="text-gray-900 dark:text-white">{metrics.memoryUsage.toFixed(2)}MB</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">API Calls:</span>
          <span className="text-gray-900 dark:text-white">{apiMetrics.length}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Interactions:</span>
          <span className="text-gray-900 dark:text-white">{interactions.length}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Errors:</span>
          <span className="text-red-600 dark:text-red-400">{errors.length}</span>
        </div>
      </div>
    </div>
  );
};

export default {
  PerformanceMonitor,
  ApiPerformanceTracker,
  UserInteractionTracker,
  ErrorTracker,
  PerformanceDashboard
};
