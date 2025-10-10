/**
 * Performance Monitoring Utility
 * Tracks Core Web Vitals and performance metrics
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    this.isInitialized = true;
    
    // Track Core Web Vitals
    this.trackCoreWebVitals();
    
    // Track page load performance
    this.trackPageLoad();
    
    // Track API response times
    this.trackAPIResponses();
    
    console.log('📊 Performance Monitor initialized');
  }

  trackCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
        this.reportMetric('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
          this.reportMetric('fid', this.metrics.fid);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cls = clsValue;
        this.reportMetric('cls', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  trackPageLoad() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          this.metrics.pageLoad = {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            totalTime: navigation.loadEventEnd - navigation.fetchStart
          };
          this.reportMetric('pageLoad', this.metrics.pageLoad);
        }
      }, 0);
    });
  }

  trackAPIResponses() {
    // Override fetch to track API response times
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.reportMetric('apiResponse', {
          url: args[0],
          duration,
          status: response.status,
          timestamp: new Date().toISOString()
        });
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.reportMetric('apiError', {
          url: args[0],
          duration,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        throw error;
      }
    };
  }

  reportMetric(type, data) {
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${type.toUpperCase()}:`, data);
    }

    // Report to server in production
    if (process.env.NODE_ENV === 'production') {
      const metric = {
        type,
        data,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: localStorage.getItem('userData') ? (JSON.parse(localStorage.getItem('userData')).id || JSON.parse(localStorage.getItem('userData'))._id) : null
      };

      // Send to performance reporting endpoint
      fetch('/api/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric)
      }).catch(() => {
        // Silently fail if performance reporting fails
      });
    }
  }

  getMetrics() {
    return this.metrics;
  }

  getPerformanceScore() {
    const scores = {
      lcp: this.getLCPScore(this.metrics.lcp),
      fid: this.getFIDScore(this.metrics.fid),
      cls: this.getCLSScore(this.metrics.cls)
    };

    const overallScore = Math.round((scores.lcp + scores.fid + scores.cls) / 3);
    
    return {
      overall: overallScore,
      breakdown: scores,
      metrics: this.metrics
    };
  }

  getLCPScore(lcp) {
    if (!lcp) return 0;
    if (lcp <= 2500) return 100;
    if (lcp <= 4000) return 75;
    return 25;
  }

  getFIDScore(fid) {
    if (!fid) return 0;
    if (fid <= 100) return 100;
    if (fid <= 300) return 75;
    return 25;
  }

  getCLSScore(cls) {
    if (!cls) return 0;
    if (cls <= 0.1) return 100;
    if (cls <= 0.25) return 75;
    return 25;
  }
}

// Create global instance
const performanceMonitor = new PerformanceMonitor();

// Auto-initialize
if (typeof window !== 'undefined') {
  performanceMonitor.init();
  
  // Add global methods
  window.performanceMonitor = performanceMonitor;
  window.getPerformanceMetrics = () => performanceMonitor.getMetrics();
  window.getPerformanceScore = () => performanceMonitor.getPerformanceScore();
}

export default performanceMonitor;
