// Rate Limit Handler Utility
// Provides exponential backoff and retry logic for API requests

export class RateLimitHandler {
  constructor() {
    this.retryAttempts = new Map(); // Track retry attempts per endpoint
    this.maxRetries = 3;
    this.baseDelay = 1000; // 1 second base delay
  }

  // Get retry delay with exponential backoff
  getRetryDelay(attempt) {
    return this.baseDelay * Math.pow(2, attempt);
  }

  // Check if we should retry based on rate limit
  shouldRetry(endpoint, status, retryAfter) {
    const attempts = this.retryAttempts.get(endpoint) || 0;
    
    if (status === 429 && attempts < this.maxRetries) {
      return true;
    }
    
    return false;
  }

  // Record retry attempt
  recordAttempt(endpoint) {
    const attempts = this.retryAttempts.get(endpoint) || 0;
    this.retryAttempts.set(endpoint, attempts + 1);
  }

  // Reset retry attempts for an endpoint
  resetAttempts(endpoint) {
    this.retryAttempts.delete(endpoint);
  }

  // Get current retry count for an endpoint
  getRetryCount(endpoint) {
    return this.retryAttempts.get(endpoint) || 0;
  }

  // Wait for specified time
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Handle rate limit response
  async handleRateLimit(endpoint, response) {
    const retryAfter = response.headers.get('Retry-After');
    const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.getRetryDelay(this.getRetryCount(endpoint));
    
    console.warn(`Rate limited for ${endpoint}. Waiting ${delay/1000}s before retry...`);
    
    await this.wait(delay);
    this.recordAttempt(endpoint);
    
    return true;
  }

  // Make API request with rate limit handling
  async makeRequest(endpoint, requestFn) {
    let attempts = 0;
    
    while (attempts < this.maxRetries) {
      try {
        const response = await requestFn();
        
        if (response.status === 429) {
          if (await this.handleRateLimit(endpoint, response)) {
            attempts++;
            continue;
          }
        }
        
        // Success or non-rate-limit error
        if (response.ok || response.status !== 429) {
          this.resetAttempts(endpoint);
          return response;
        }
        
        // Other errors
        return response;
        
      } catch (error) {
        console.error(`Request failed for ${endpoint}:`, error);
        throw error;
      }
    }
    
    // Max retries exceeded
    throw new Error(`Rate limit exceeded for ${endpoint}. Please try again later.`);
  }
}

// Singleton instance
export const rateLimitHandler = new RateLimitHandler();

// Utility function for making rate-limited requests
export async function makeRateLimitedRequest(endpoint, requestFn) {
  return rateLimitHandler.makeRequest(endpoint, requestFn);
}

// Rate limit configuration
export const RATE_LIMIT_CONFIG = {
  LOGIN: {
    maxRetries: 3,
    baseDelay: 2000, // 2 seconds
    maxDelay: 30000  // 30 seconds
  },
  API: {
    maxRetries: 2,
    baseDelay: 1000, // 1 second
    maxDelay: 10000  // 10 seconds
  },
  PAYMENT: {
    maxRetries: 1,
    baseDelay: 3000, // 3 seconds
    maxDelay: 15000  // 15 seconds
  }
};

// Get rate limit config for specific endpoint type
export function getRateLimitConfig(endpoint) {
  if (endpoint.includes('login') || endpoint.includes('auth')) {
    return RATE_LIMIT_CONFIG.LOGIN;
  }
  if (endpoint.includes('payment') || endpoint.includes('purchase')) {
    return RATE_LIMIT_CONFIG.PAYMENT;
  }
  return RATE_LIMIT_CONFIG.API;
}

export default rateLimitHandler;
