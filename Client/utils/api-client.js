// Enhanced API Client that automatically handles authentication
// Sends tokens with every protected request and handles authentication errors

import { authManager } from './auth-manager.js';

/**
 * Enhanced API Client with automatic token handling
 */
class ApiClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  /**
   * Add authentication headers to request
   */
  addAuthHeaders(headers = {}) {
    const token = authManager.getToken();
    
    if (token) {
      return {
        ...headers,
        'x-auth-token': token,
        'Authorization': `Bearer ${token}`
      };
    }
    
    return headers;
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(response) {
    if (response.status === 401) {
      console.log('❌ Authentication failed, clearing auth');
      authManager.clearAuth();
      
      // Redirect to login if we're not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/SignIn')) {
        window.location.href = '/SignIn';
      }
    }
  }

  /**
   * Make authenticated request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = this.addAuthHeaders({
      ...this.defaultHeaders,
      ...options.headers
    });

    console.log('🔐 Making API request:', {
      url,
      method: options.method || 'GET',
      hasAuth: !!headers['x-auth-token']
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Handle authentication errors
      this.handleAuthError(response);

      return response;
    } catch (error) {
      console.error('❌ API request failed:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  /**
   * Upload file with authentication
   */
  async upload(endpoint, formData, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = this.addAuthHeaders({
      // Don't set Content-Type for FormData, let browser set it
      ...options.headers
    });

    // Remove Content-Type for FormData
    delete headers['Content-Type'];

    console.log('🔐 Making file upload request:', {
      url,
      hasAuth: !!headers['x-auth-token']
    });

    try {
      const response = await fetch(url, {
        ...options,
        method: 'POST',
        headers,
        body: formData
      });

      this.handleAuthError(response);
      return response;
    } catch (error) {
      console.error('❌ File upload failed:', error);
      throw error;
    }
  }
}

// Create default API client instance
const apiClient = new ApiClient('/api');

// Export the client and class
export { ApiClient, apiClient };

// Export convenience methods
export const api = {
  get: (endpoint, options) => apiClient.get(endpoint, options),
  post: (endpoint, data, options) => apiClient.post(endpoint, data, options),
  put: (endpoint, data, options) => apiClient.put(endpoint, data, options),
  delete: (endpoint, options) => apiClient.delete(endpoint, options),
  patch: (endpoint, data, options) => apiClient.patch(endpoint, data, options),
  upload: (endpoint, formData, options) => apiClient.upload(endpoint, formData, options)
};

// Export for backward compatibility
export default apiClient;
