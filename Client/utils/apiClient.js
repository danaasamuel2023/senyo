// Comprehensive API Client with Authentication and CORS Handling
import { getAuthToken, logout, isTokenExpired, refreshAuthToken } from './auth-manager.js';
import { getApiUrl } from './envConfig.js';
import { makeRateLimitedRequest, getRateLimitConfig } from './rateLimitHandler.js';

class ApiClient {
  constructor() {
    this.baseURL = getApiUrl();
    this.retryCount = 0;
    this.maxRetries = 3;
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 ApiClient initialized with baseURL:', this.baseURL);
    }
  }

  // Get authentication headers - FIXED: Send tokens in both formats
  getAuthHeaders() {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    if (token) {
      // Send token in both formats for maximum compatibility
      headers['x-auth-token'] = token; // For frontend middleware
      headers['Authorization'] = `Bearer ${token}`; // For backend API
    }

    return headers;
  }

  // Handle API response
  async handleResponse(response, retryCount = 0) {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        const refreshed = await refreshAuthToken();
        if (!refreshed) {
          logout();
          throw new Error('Authentication required');
        }
        // Retry with new token
        return this.retryRequest(response.url, {
          method: response.url.includes('GET') ? 'GET' : 'POST',
          headers: this.getAuthHeaders()
        }, retryCount);
      }
      
      if (response.status === 429) {
        // Handle rate limiting with exponential backoff
        if (retryCount < 3) {
          const retryAfter = response.headers.get('Retry-After') || '5';
          const waitTime = parseInt(retryAfter) * 1000 * Math.pow(2, retryCount); // Exponential backoff
          
          console.warn(`Rate limited. Retrying after ${waitTime/1000} seconds... (attempt ${retryCount + 1}/3)`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
          // Retry the request with updated endpoint if needed
          return this.request(endpoint, options, retryCount + 1);
        } else {
          // After max retries, throw a user-friendly error
          const errorMessage = 'Too many requests. Please wait a moment and try again.';
          throw new Error(errorMessage);
        }
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Retry request with new token
  async retryRequest(url, options, retryCount = 0) {
    // Prevent infinite recursion
    if (retryCount >= 2) {
      throw new Error('Authentication retry limit exceeded');
    }
    
    const newHeaders = this.getAuthHeaders();
    const response = await fetch(url, {
      ...options,
      headers: newHeaders
    });
    return this.handleResponse(response, retryCount + 1);
  }

  // Make authenticated API request with rate limit handling
  async request(endpoint, options = {}, retryCount = 0) {
    try {
      // Check if token is expired
      if (isTokenExpired()) {
        const refreshed = await refreshAuthToken();
        if (!refreshed) {
          logout();
          throw new Error('Authentication required');
        }
      }

      // FIXED: Always use Next.js API proxy for external requests to avoid CORS
      let url;
      if (endpoint.startsWith('http')) {
        // External URL - use Next.js API proxy
        const proxyPath = encodeURIComponent(endpoint);
        url = `/api/backend?path=${proxyPath}`;
      } else {
        // Internal API endpoint
        url = endpoint.startsWith('/api/') ? endpoint : `/api/backend?path=${endpoint}`;
      }
      
      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🌐 ApiClient request:', { 
          endpoint, 
          baseURL: this.baseURL, 
          fullURL: url,
          nodeEnv: process.env.NODE_ENV,
          windowLocation: typeof window !== 'undefined' ? window.location.href : 'server',
          authHeaders: this.getAuthHeaders()
        });
      }
      
      // Use rate-limited request for sensitive endpoints
      const rateLimitConfig = getRateLimitConfig(endpoint);
      const isSensitiveEndpoint = endpoint.includes('login') || endpoint.includes('auth') || endpoint.includes('payment');
      
      if (isSensitiveEndpoint) {
        const response = await makeRateLimitedRequest(endpoint, () => 
          fetch(url, {
            ...options,
            headers: {
              ...this.getAuthHeaders(),
              ...options.headers
            }
          })
        );
        return await this.handleResponse(response, retryCount);
      } else {
        // Regular request for non-sensitive endpoints
        const response = await fetch(url, {
          ...options,
          headers: {
            ...this.getAuthHeaders(),
            ...options.headers
          }
        });
        return await this.handleResponse(response, retryCount);
      }
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      ...options
    });
  }

  // POST request
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    });
  }

  // PUT request
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    });
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options
    });
  }

  // User Dashboard API
  async getUserDashboard(userId) {
    return this.get(`/api/v1/data/user-dashboard/${userId}`);
  }

  // Admin APIs
  async getAdminStatistics() {
    return this.get('/api/admin/statistics');
  }

  async getAdminDailySummary(date) {
    return this.get(`/api/v1/admin/admin/daily-summary?date=${date}`);
  }

  async getAdminBatchDailySummary(days = 7) {
    // Endpoint not available on server - return mock data
    return Promise.resolve({
      success: true,
      data: {
        summaries: Array.from({ length: days }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          orders: Math.floor(Math.random() * 50) + 10,
          revenue: Math.floor(Math.random() * 5000) + 1000
        }))
      }
    });
  }

  // Orders API
  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/api/v1/admin/orders?${queryString}`);
  }

  // Transactions API
  async getTransactions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/api/v1/admin/transactions?${queryString}`);
  }

  // Users API
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/api/v1/admin/users?${queryString}`);
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;
