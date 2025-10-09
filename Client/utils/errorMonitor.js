/**
 * Error Monitoring Utility
 * Helps track and report console errors in development and production
 */

class ErrorMonitor {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    this.isInitialized = true;
    
    // Capture console errors
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      this.logError('error', args);
      originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      this.logError('warning', args);
      originalWarn.apply(console, args);
    };
    
    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('unhandledrejection', [event.reason]);
    });
    
    // Capture global errors
    window.addEventListener('error', (event) => {
      this.logError('global', [event.error || event.message]);
    });
    
    // Log initialization
    console.log('🔍 Error Monitor initialized');
  }
  
  logError(type, args) {
    const error = {
      type,
      message: args.join(' '),
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    if (type === 'error') {
      this.errors.push(error);
    } else {
      this.warnings.push(error);
    }
    
    // Keep only last 50 errors/warnings
    if (this.errors.length > 50) this.errors.shift();
    if (this.warnings.length > 50) this.warnings.shift();
  }
  
  getErrors() {
    return {
      errors: this.errors,
      warnings: this.warnings,
      summary: {
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
        lastError: this.errors[this.errors.length - 1],
        lastWarning: this.warnings[this.warnings.length - 1]
      }
    };
  }
  
  clearErrors() {
    this.errors = [];
    this.warnings = [];
    console.log('🧹 Error logs cleared');
  }
  
  reportErrors() {
    const report = this.getErrors();
    console.group('📊 Error Report');
    console.log('Total Errors:', report.summary.totalErrors);
    console.log('Total Warnings:', report.summary.totalWarnings);
    
    if (report.errors.length > 0) {
      console.group('❌ Errors');
      report.errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.timestamp}] ${error.message}`);
      });
      console.groupEnd();
    }
    
    if (report.warnings.length > 0) {
      console.group('⚠️ Warnings');
      report.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. [${warning.timestamp}] ${warning.message}`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
    return report;
  }
}

// Create global instance
const errorMonitor = new ErrorMonitor();

// Auto-initialize in both development and production
if (typeof window !== 'undefined') {
  errorMonitor.init();
  
  // Add global methods for debugging (always available)
  window.errorMonitor = errorMonitor;
  window.getErrors = () => errorMonitor.getErrors();
  window.clearErrors = () => errorMonitor.clearErrors();
  window.reportErrors = () => errorMonitor.reportErrors();
  
  // Production error reporting
  if (process.env.NODE_ENV === 'production') {
    // Report critical errors to server
    const originalLogError = errorMonitor.logError;
    errorMonitor.logError = function(type, args) {
      originalLogError.call(this, type, args);
      
      // Report critical errors to server
      if (type === 'error' || type === 'unhandledrejection') {
        const error = {
          type,
          message: args.join(' '),
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          userId: localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).id : null
        };
        
        // Send to error reporting endpoint
        fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(error)
        }).catch(() => {
          // Silently fail if error reporting fails
        });
      }
    };
  }
}

export default errorMonitor;
