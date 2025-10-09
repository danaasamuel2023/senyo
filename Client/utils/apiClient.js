// Comprehensive API Client with Authentication and CORS Handling
import { getAuthToken, logout, isTokenExpired, refreshAuthToken } from './auth.js';
import { getApiUrl } from './envConfig.js';

class ApiClient {
  constructor() {
    this.baseURL = getApiUrl();
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  // Get authentication headers
  getAuthHeaders() {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    if (token) {
      headers['x-auth-token'] = token;
    }

    return headers;
  }

  // Handle API response
  async handleResponse(response) {
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
        });
      }
      
      if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Retry request with new token
  async retryRequest(url, options) {
    const newHeaders = this.getAuthHeaders();
    const response = await fetch(url, {
      ...options,
      headers: newHeaders
    });
    return this.handleResponse(response);
  }

  // Make authenticated API request
  async request(endpoint, options = {}) {
    try {
      // Check if token is expired
      if (isTokenExpired()) {
        const refreshed = await refreshAuthToken();
        if (!refreshed) {
          logout();
          throw new Error('Authentication required');
        }
      }

      const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers
        }
      });

      return await this.handleResponse(response);
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
    return this.get('/api/v1/admin/statistics');
  }

  async getAdminDailySummary(date) {
    return this.get(`/api/v1/admin/dashboard/daily-summary/${date}`);
  }

  async getAdminBatchDailySummary(days = 7) {
    return this.get(`/api/v1/admin/daily-summary-batch?days=${days}`);
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
