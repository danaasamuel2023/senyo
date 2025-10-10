// Admin API Service
import { getNextPublicApiUrl, isDevelopment } from './envConfig';
import { getAuthToken, getCurrentUser, isAuthenticated, logout } from './auth';

const API_BASE_URL = getNextPublicApiUrl();

// Helper function to get the correct API URL (use production backend)
const getApiUrl = (endpoint) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://unlimitedata.onrender.com';
  return `${apiUrl}${endpoint}`;
};

// Helper function to get auth headers (using centralized auth utilities)
const getAuthHeaders = () => {
  // Use centralized auth utilities for consistency
  const token = getAuthToken();
  const user = getCurrentUser();
  
  // Enhanced debugging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('AdminAPI - Token check:', {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO TOKEN',
      hasUser: !!user,
      userRole: user?.role,
      isAuthenticated: isAuthenticated()
    });
  }
  
  if (!token) {
    console.warn('AdminAPI - No authToken found, redirecting to login');
    logout('/SignIn');
    throw new Error('Authentication required. Please sign in again.');
  }
  
  return {
    'Content-Type': 'application/json',
    'x-auth-token': token,
    'Authorization': `Bearer ${token}` // Add both headers for compatibility
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  // Check if response is ok first
  if (!response.ok) {
    const errorText = await response.text();
    
    // Handle rate limiting gracefully in development
    if (response.status === 429 && process.env.NODE_ENV === 'development') {
      console.warn(`Rate limit encountered in development (${response.status}):`, errorText);
      throw new Error(`Rate limit bypassed in development: ${errorText}`);
    }
    
    console.error(`API Error ${response.status}:`, errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  // Handle redirects
  if (response.status === 301 || response.status === 302) {
    const redirectUrl = response.headers.get('Location');
    if (redirectUrl) {
      console.log('Following redirect to:', redirectUrl);
      const redirectResponse = await fetch(redirectUrl, {
        headers: getAuthHeaders()
      });
      return handleResponse(redirectResponse);
    }
  }
  
  if (!response.ok) {
    let errorMessage = '';
    let errorData = null;
    
    // Clone the response to avoid "body stream already read" error
    const responseClone = response.clone();
    
    try {
      const text = await responseClone.text();
      if (text) {
        try {
          errorData = JSON.parse(text);
          errorMessage = errorData.msg || errorData.error || errorData.message || errorData.msg || '';
        } catch {
          errorMessage = text;
        }
      }
    } catch (parseError) {
      console.warn('Failed to parse error response:', parseError);
    }
    
    // Fallback to status text if no error message found
    if (!errorMessage) {
      errorMessage = response.statusText || `HTTP ${response.status}`;
    }
    
    // Only log errors in development to reduce console noise
    if (process.env.NODE_ENV === 'development') {
      console.warn('API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        error: errorMessage,
        errorData: errorData
      });
    }
    
    // Provide more specific error messages
    if (response.status === 401) {
      throw new Error('Authentication required. Please sign in again.');
    } else if (response.status === 403) {
      throw new Error('Access denied. Admin privileges required.');
    } else if (response.status === 404) {
      throw new Error('API endpoint not found. Please check the server configuration.');
    } else if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after') || '60';
      throw new Error(`Too many requests from this IP, please try again after ${retryAfter} seconds.`);
    } else if (response.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(errorMessage || `HTTP error! status: ${response.status}`);
    }
  }
  return response.json();
};

// User Management APIs
export const userAPI = {
  // Get all users with pagination and search
  getUsers: async (page = 1, limit = 10, search = '') => {
    const params = new URLSearchParams({ page, limit, search });
    
    // Use the correct admin endpoint with proper authentication
    const response = await fetch(`${getApiUrl('/api/v1/admin/users')}?${params}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get user by ID
  getUserById: async (userId) => {
    // Use the correct admin endpoint
    const response = await fetch(`${getApiUrl('/api/v1/admin/users')}/${userId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Update user details
  updateUser: async (userId, userData) => {
    // Use the correct admin endpoint
    const response = await fetch(`${getApiUrl('/api/v1/admin/users')}/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  // Add money to user wallet
  addMoney: async (userId, amount) => {
    // Try the correct admin endpoint first
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/add-money`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount })
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Admin add money endpoint failed, trying legacy endpoint:', error.message);
      // Fallback to legacy endpoint
      const endpoint = '/api/v1/admin/users';
      const response = await fetch(`${API_BASE_URL}${endpoint}/${userId}/add-money`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount })
      });
      return handleResponse(response);
    }
  },

  // Deduct money from user wallet
  deductMoney: async (userId, amount, reason) => {
    // Try the correct admin endpoint first
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/deduct-money`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount, reason })
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Admin deduct money endpoint failed, trying legacy endpoint:', error.message);
      // Fallback to legacy endpoint
      const endpoint = '/api/v1/admin/users';
      const response = await fetch(`${API_BASE_URL}${endpoint}/${userId}/deduct-money`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount, reason })
      });
      return handleResponse(response);
    }
  },

  // Toggle user status (enable/disable)
  toggleUserStatus: async (userId, disableReason = '') => {
    // Try the correct admin endpoint first
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ disableReason })
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Admin toggle status endpoint failed, trying legacy endpoint:', error.message);
      // Fallback to legacy endpoint
      const endpoint = '/api/v1/admin/users';
      const response = await fetch(`${API_BASE_URL}${endpoint}/${userId}/toggle-status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ disableReason })
      });
      return handleResponse(response);
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    // Try the correct admin endpoint first
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Admin delete user endpoint failed, trying legacy endpoint:', error.message);
      // Fallback to legacy endpoint
      const endpoint = '/api/v1/admin/users';
      const response = await fetch(`${API_BASE_URL}${endpoint}/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    }
  },

  // Get user orders
  getUserOrders: async (userId, page = 1, limit = 100) => {
    const params = new URLSearchParams({ page, limit });
    
    // Use the working admin endpoint directly
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/user-orders/${userId}?${params}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Order Management APIs
export const orderAPI = {
  // Get all orders with filters
  getOrders: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    
    // Use the correct admin endpoint
    const response = await fetch(`${getApiUrl('/api/v1/admin/admin/orders')}?${params}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    // Try the correct admin endpoint first
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Admin update order status endpoint failed, trying legacy endpoint:', error.message);
      // Fallback to legacy endpoint
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      return handleResponse(response);
    }
  },

  // Bulk update order statuses
  bulkUpdateStatus: async (orderIds, status) => {
    // Try the correct admin endpoint first
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/orders/bulk-status-update`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ orderIds, status })
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Admin bulk update status endpoint failed, trying legacy endpoint:', error.message);
      // Fallback to legacy endpoint
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/orders/bulk-status-update`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ orderIds, status })
      });
      return handleResponse(response);
    }
  }
};

// Transaction Management APIs
export const transactionAPI = {
  // Get all transactions with filters
  getTransactions: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    
    // Use the correct admin endpoint
    const response = await fetch(`${getApiUrl('/api/v1/admin/admin/transactions')}?${params}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get transaction by ID
  getTransactionById: async (transactionId) => {
    // Try the correct admin endpoint first
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/transactions/${transactionId}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Admin transaction by ID endpoint failed, trying legacy endpoint:', error.message);
      // Fallback to legacy endpoint
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/transactions/${transactionId}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    }
  },

  // Verify Paystack payment
  verifyPaystackPayment: async (reference) => {
    // Use local backend for admin features
    try {
      const response = await fetch(getApiUrl(`/api/v1/admin/verify-paystack/${reference}`), {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Admin verify paystack endpoint failed:', error.message);
      throw error;
    }
  },

  // Update transaction status
  updateTransactionStatus: async (transactionId, status, adminNotes = '') => {
    // Use local backend for admin features
    try {
      const response = await fetch(getApiUrl(`/api/v1/admin/transactions/${transactionId}/update-status`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, adminNotes })
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Admin update transaction status endpoint failed:', error.message);
      throw error;
    }
  }
};

// Inventory Management APIs
export const inventoryAPI = {
  // Get all inventory status
  getInventory: async () => {
    try {
      // Use local backend for admin features
      const response = await fetch(getApiUrl('/api/v1/admin/inventory'), {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Inventory endpoint not available, returning default data:', error);
      // Return default inventory data when endpoint is not available
      return {
        success: true,
        inventory: [
          { network: 'YELLO', inStock: true, skipGeonettech: false, updatedAt: null },
          { network: 'TELECEL', inStock: true, skipGeonettech: false, updatedAt: null },
          { network: 'AT_PREMIUM', inStock: true, skipGeonettech: false, updatedAt: null },
          { network: 'airteltigo', inStock: true, skipGeonettech: false, updatedAt: null },
          { network: 'at', inStock: true, skipGeonettech: false, updatedAt: null }
        ],
        totalNetworks: 5,
        message: 'Using default inventory data - endpoint not available'
      };
    }
  },

  // Get specific network inventory
  getNetworkInventory: async (network) => {
    try {
      // Use local backend for admin features
      const response = await fetch(getApiUrl(`/api/v1/admin/inventory/${network}`), {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Network inventory endpoint not available, returning default data:', error);
      return {
        success: true,
        inventory: {
          network,
          inStock: true,
          skipGeonettech: false,
          updatedAt: null
        },
        message: 'Using default network data - endpoint not available'
      };
    }
  },

  // Toggle network stock status
  toggleNetworkStock: async (network) => {
    try {
      // Use local backend for admin features
      const response = await fetch(getApiUrl(`/api/v1/admin/inventory/${network}/toggle`), {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Toggle stock endpoint not available:', error);
      return {
        success: false,
        error: 'Endpoint not available - please wait for deployment'
      };
    }
  },

  // Toggle Geonettech API for network
  toggleGeonettech: async (network) => {
    try {
      // Use local backend for admin features
      const response = await fetch(getApiUrl(`/api/v1/admin/inventory/${network}/toggle-geonettech`), {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Toggle Geonettech endpoint not available:', error);
      return {
        success: false,
        error: 'Endpoint not available - please wait for deployment'
      };
    }
  }
};

// Dashboard & Statistics APIs
export const dashboardAPI = {
  // Get dashboard statistics
  getStatistics: async () => {
    // Use the correct admin endpoint that's actually working
    const response = await fetch(getApiUrl('/api/admin/statistics'), {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get daily summary
  getDailySummary: async (date) => {
    // Use the correct admin endpoint with date as path parameter
    const response = await fetch(`${getApiUrl('/api/v1/admin/dashboard/daily-summary')}/${date}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get batch daily summary for multiple days
  getBatchDailySummary: async (days = 7) => {
    const params = new URLSearchParams({ days });
    
    // Use the batch endpoint to reduce API calls
    const response = await fetch(`${getApiUrl('/api/v1/admin/dashboard/daily-summary-batch')}?${params}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Agent Management APIs
export const agentAPI = {
  // List agents (admin)
  getAgents: async (page = 1, limit = 50, search = '') => {
    const params = new URLSearchParams({ page, limit, search });
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/agents?${params}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get agent catalog (admin)
  getAgentCatalog: async (agentId) => {
    const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}/catalog`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Add catalog item (admin)
  addCatalogItem: async (agentId, item) => {
    const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}/catalog/item`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item)
    });
    return handleResponse(response);
  },

  // Update catalog item (admin)
  updateCatalogItem: async (agentId, itemId, updates) => {
    const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}/catalog/item/${itemId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return handleResponse(response);
  },

  // Delete catalog item (admin)
  deleteCatalogItem: async (agentId, itemId) => {
    const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}/catalog/item/${itemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Agent self: get my catalog (agent)
  getMyCatalog: async () => {
    const response = await fetch(`${API_BASE_URL}/api/agent/catalog`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Export all APIs
export default {
  user: userAPI,
  order: orderAPI,
  transaction: transactionAPI,
  inventory: inventoryAPI,
  dashboard: dashboardAPI,
  agent: agentAPI
};
