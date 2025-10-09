/**
 * Rate Limiting Utilities
 * Provides functions to handle API rate limiting and request throttling
 */

// Rate limit state management
class RateLimitManager {
  constructor() {
    this.rateLimitState = new Map();
    this.requestHistory = new Map();
  }

  // Check if a user/IP is currently rate limited
  isRateLimited(identifier, windowMs = 60000, maxRequests = 10) {
    // Skip rate limiting in development
    if (process.env.NODE_ENV === 'development') {
      return false;
    }
    
    const now = Date.now();
    const key = `rate_limit_${identifier}`;
    
    if (!this.requestHistory.has(key)) {
      this.requestHistory.set(key, []);
    }
    
    const requests = this.requestHistory.get(key);
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
    this.requestHistory.set(key, validRequests);
    
    // Check if rate limited
    if (validRequests.length >= maxRequests) {
      this.rateLimitState.set(key, {
        blocked: true,
        resetTime: now + windowMs,
        remainingRequests: 0
      });
      return true;
    }
    
    // Update rate limit state
    this.rateLimitState.set(key, {
      blocked: false,
      resetTime: now + windowMs,
      remainingRequests: maxRequests - validRequests.length - 1
    });
    
    return false;
  }

  // Record a request
  recordRequest(identifier) {
    const now = Date.now();
    const key = `rate_limit_${identifier}`;
    
    if (!this.requestHistory.has(key)) {
      this.requestHistory.set(key, []);
    }
    
    const requests = this.requestHistory.get(key);
    requests.push(now);
    this.requestHistory.set(key, requests);
  }

  // Get rate limit info
  getRateLimitInfo(identifier) {
    const key = `rate_limit_${identifier}`;
    return this.rateLimitState.get(key) || {
      blocked: false,
      resetTime: Date.now() + 60000,
      remainingRequests: 10
    };
  }

  // Clear rate limit for identifier
  clearRateLimit(identifier) {
    const key = `rate_limit_${identifier}`;
    this.rateLimitState.delete(key);
    this.requestHistory.delete(key);
  }
}

// Global rate limit manager instance
const rateLimitManager = new RateLimitManager();

/**
 * Enhanced retry function with exponential backoff and rate limiting
 * @param {Function} requestFn - The function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} - The request result
 */
export const retryWithBackoff = async (requestFn, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 5000,
    maxDelay = 60000,
    backoffFactor = 2,
    retryCondition = (error) => error.response?.status === 429
  } = options;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (retryCondition(error) && attempt < maxRetries - 1) {
        // Check for retry-after header first
        const retryAfter = error.response?.headers?.['retry-after'];
        let delay = baseDelay * Math.pow(backoffFactor, attempt);
        
        if (retryAfter) {
          delay = parseInt(retryAfter) * 1000; // Convert to milliseconds
        }
        
        // Cap the delay
        delay = Math.min(delay, maxDelay);
        
        console.log(`Request failed, retrying in ${delay/1000}s... (attempt ${attempt + 1}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
};

/**
 * Request throttling decorator
 * @param {Function} fn - Function to throttle
 * @param {number} delay - Delay between requests in ms
 * @returns {Function} - Throttled function
 */
export const throttle = (fn, delay = 10000) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn(...args);
    } else {
      const remainingTime = Math.ceil((delay - (now - lastCall)) / 1000);
      throw new Error(`Please wait ${remainingTime} second${remainingTime > 1 ? 's' : ''} before making another request.`);
    }
  };
};

/**
 * Rate limit checker for API requests
 * @param {string} identifier - User identifier (email, IP, etc.)
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} maxRequests - Maximum requests per window
 * @returns {Object} - Rate limit status
 */
export const checkRateLimit = (identifier, windowMs = 60000, maxRequests = 10) => {
  const isLimited = rateLimitManager.isRateLimited(identifier, windowMs, maxRequests);
  const info = rateLimitManager.getRateLimitInfo(identifier);
  
  return {
    isLimited,
    remainingRequests: info.remainingRequests,
    resetTime: info.resetTime,
    resetIn: Math.max(0, info.resetTime - Date.now())
  };
};

/**
 * Record a request for rate limiting
 * @param {string} identifier - User identifier
 */
export const recordRequest = (identifier) => {
  rateLimitManager.recordRequest(identifier);
};

/**
 * Clear rate limit for identifier
 * @param {string} identifier - User identifier
 */
export const clearRateLimit = (identifier) => {
  rateLimitManager.clearRateLimit(identifier);
};

/**
 * Format time remaining for rate limit
 * @param {number} ms - Milliseconds remaining
 * @returns {string} - Formatted time string
 */
export const formatTimeRemaining = (ms) => {
  const seconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

export default {
  retryWithBackoff,
  throttle,
  checkRateLimit,
  recordRequest,
  clearRateLimit,
  formatTimeRemaining
};
