/**
 * Simple Analytics and Error Tracking System
 * Tracks user behavior and errors for improvement
 */

class Analytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.events = [];
    this.errors = [];
    this.maxEvents = 100;
    this.maxErrors = 50;
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track user event
   */
  track(event, properties = {}) {
    const eventData = {
      event,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        url: window.location.pathname,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    };

    this.events.push(eventData);
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', eventData);
    }

    // Send to analytics endpoint (if configured)
    this.sendToAnalytics(eventData);
  }

  /**
   * Track error
   */
  trackError(error, context = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context: {
        ...context,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        url: window.location.pathname,
        userAgent: navigator.userAgent
      }
    };

    this.errors.push(errorData);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Error Tracked:', errorData);
    }

    // Send to error tracking endpoint (if configured)
    this.sendToErrorTracking(errorData);
  }

  /**
   * Track page view
   */
  trackPageView(page) {
    this.track('page_view', {
      page,
      referrer: document.referrer,
      loadTime: Date.now() - this.startTime
    });
  }

  /**
   * Track user interaction
   */
  trackInteraction(action, element, value = null) {
    this.track('user_interaction', {
      action,
      element,
      value,
      timestamp: Date.now()
    });
  }

  /**
   * Track API call
   */
  trackApiCall(url, method, status, responseTime) {
    this.track('api_call', {
      url,
      method,
      status,
      responseTime,
      success: status >= 200 && status < 300
    });
  }

  /**
   * Track payment event
   */
  trackPayment(action, amount, currency = 'GHS', status = null) {
    this.track('payment', {
      action,
      amount,
      currency,
      status,
      timestamp: Date.now()
    });
  }

  /**
   * Track deposit flow
   */
  trackDepositFlow(step, amount = null, error = null) {
    this.track('deposit_flow', {
      step,
      amount,
      error,
      timestamp: Date.now()
    });
  }

  /**
   * Send analytics data to server
   */
  async sendToAnalytics(eventData) {
    try {
      // Only send in production or if explicitly enabled
      if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true') {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventData)
        });
      }
    } catch (error) {
      console.warn('Failed to send analytics data:', error);
    }
  }

  /**
   * Send error data to server
   */
  async sendToErrorTracking(errorData) {
    try {
      // Only send in production or if explicitly enabled
      if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ERROR_TRACKING_ENABLED === 'true') {
        await fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(errorData)
        });
      }
    } catch (error) {
      console.warn('Failed to send error data:', error);
    }
  }

  /**
   * Get analytics summary
   */
  getSummary() {
    const sessionDuration = Date.now() - this.startTime;
    const pageViews = this.events.filter(e => e.event === 'page_view').length;
    const interactions = this.events.filter(e => e.event === 'user_interaction').length;
    const apiCalls = this.events.filter(e => e.event === 'api_call').length;
    const payments = this.events.filter(e => e.event === 'payment').length;
    const errors = this.errors.length;

    return {
      sessionId: this.sessionId,
      sessionDuration,
      pageViews,
      interactions,
      apiCalls,
      payments,
      errors,
      totalEvents: this.events.length
    };
  }

  /**
   * Export analytics data
   */
  exportData() {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      events: this.events,
      errors: this.errors,
      summary: this.getSummary()
    };
  }
}

// Create singleton instance
const analytics = new Analytics();

// Initialize error tracking
if (typeof window !== 'undefined') {
  // Track JavaScript errors
  window.addEventListener('error', (event) => {
    analytics.trackError(event.error, {
      type: 'javascript_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    analytics.trackError(new Error(event.reason), {
      type: 'unhandled_promise_rejection'
    });
  });

  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    analytics.track('visibility_change', {
      hidden: document.hidden,
      visibilityState: document.visibilityState
    });
  });

  // Track online/offline status
  window.addEventListener('online', () => {
    analytics.track('connection_change', { status: 'online' });
  });

  window.addEventListener('offline', () => {
    analytics.track('connection_change', { status: 'offline' });
  });
}

export default analytics;
