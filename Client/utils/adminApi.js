// Admin API Service
import { getNextPublicApiUrl, isDevelopment } from './envConfig';
import { getAuthToken, getCurrentUser, isAuthenticated, logout } from './auth';
import { makeRateLimitedRequest } from './rateLimitHandler.js';

const API_BASE_URL = getNextPublicApiUrl();

// Helper function to get the correct API URL (use environment config) - Hot reload test
const getApiUrl = (endpoint) => {
  const apiUrl = getNextPublicApiUrl();
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
    
    // Handle rate limiting with user-friendly message
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const message = retryAfter 
        ? `Too many requests. Please try again in ${retryAfter} seconds.`
        : 'Too many requests. Please wait a moment and try again.';
      
      console.warn('Rate limit exceeded:', message);
      throw new Error(`HTTP ${response.status}: ${message}`);
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
  addMoney: async (userId, amount, reason) => {
    // Try the correct admin endpoint first
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/add-money`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount, reason })
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Admin add money endpoint failed, trying legacy endpoint:', error.message);
      // Fallback to legacy endpoint
      const endpoint = '/api/v1/admin/users';
      const response = await fetch(`${API_BASE_URL}${endpoint}/${userId}/add-money`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount, reason })
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
  },

  // Update user details
  updateUser: async (userId, userData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });

    return handleResponse(response);
  },

  // Add money to user wallet
  addMoney: async (userId, amount, reason) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/add-money`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, reason })
    });

    return handleResponse(response);
  },

  // Deduct money from user wallet
  deductMoney: async (userId, amount, reason) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/deduct-money`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, reason })
    });

    return handleResponse(response);
  },

  // Reset user password
  resetPassword: async (userId, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/reset-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newPassword })
    });

    return handleResponse(response);
  },

  // Toggle user status (enable/disable)
  toggleUserStatus: async (userId, reason) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/toggle-status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });

    return handleResponse(response);
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}`, {
      method: 'DELETE',
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
    const endpoint = `${getApiUrl('/api/v1/admin/orders')}?${params}`;
    
    // Use rate-limited request
    const response = await makeRateLimitedRequest(endpoint, () => 
      fetch(endpoint, {
        headers: getAuthHeaders()
      })
    );
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
    const endpoint = `${getApiUrl('/api/v1/admin/transactions')}?${params}`;
    
    // Use rate-limited request
    const response = await makeRateLimitedRequest(endpoint, () => 
      fetch(endpoint, {
        headers: getAuthHeaders()
      })
    );
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
      const response = await fetch(getApiUrl(`/api/v1/admin/advanced-inventory/${network}`), {
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
      const response = await fetch(getApiUrl(`/api/v1/admin/advanced-inventory/${network}/toggle`), {
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
      const response = await fetch(getApiUrl(`/api/v1/admin/advanced-inventory/${network}/toggle-geonettech`), {
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

// Performance Monitoring APIs
export const performanceAPI = {
  // Get performance metrics
  getMetrics: async () => {
    const response = await fetch(`${getApiUrl('/api/v1/admin/performance/metrics')}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get system health
  getHealth: async () => {
    const response = await fetch(`${getApiUrl('/api/v1/admin/performance/health')}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get performance alerts
  getAlerts: async () => {
    const response = await fetch(`${getApiUrl('/api/v1/admin/performance/alerts')}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get API endpoint performance
  getEndpoints: async () => {
    const response = await fetch(`${getApiUrl('/api/v1/admin/performance/endpoints')}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Customer Support APIs
export const supportAPI = {
  // Get support tickets
  getTickets: async () => {
    const response = await fetch(`${getApiUrl('/api/v1/admin/support/tickets')}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get live chat sessions
  getChatSessions: async () => {
    const response = await fetch(`${getApiUrl('/api/v1/admin/support/chat')}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get knowledge base articles
  getKnowledgeBase: async () => {
    const response = await fetch(`${getApiUrl('/api/v1/admin/support/knowledge-base')}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get FAQs
  getFAQs: async () => {
    const response = await fetch(`${getApiUrl('/api/v1/admin/support/faq')}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get support statistics
  getStats: async () => {
    const response = await fetch(`${getApiUrl('/api/v1/admin/support/stats')}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Create new ticket
  createTicket: async (ticketData) => {
    const response = await fetch(`${getApiUrl('/api/v1/admin/support/tickets')}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(ticketData)
    });
    return handleResponse(response);
  },

  // Update ticket
  updateTicket: async (ticketId, updateData) => {
    const response = await fetch(`${getApiUrl(`/api/v1/admin/support/tickets/${ticketId}`)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    return handleResponse(response);
  },

  // Send chat message
  sendChatMessage: async (chatId, message) => {
    const response = await fetch(`${getApiUrl(`/api/v1/admin/support/chat/${chatId}/message`)}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message })
    });
    return handleResponse(response);
  },

  // Create FAQ
  createFAQ: async (faqData) => {
    const response = await fetch(`${getApiUrl('/api/v1/admin/support/faq')}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(faqData)
    });
    return handleResponse(response);
  },

  // Create knowledge base article
  createArticle: async (articleData) => {
    const response = await fetch(`${getApiUrl('/api/v1/admin/support/knowledge-base')}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(articleData)
    });
    return handleResponse(response);
  }
};

// Marketing Tools API
export const marketingAPI = {
  getCampaigns: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/marketing/campaigns`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },

  getPromotions: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/marketing/promotions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching promotions:', error);
      throw error;
    }
  },

  getNewsletters: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/marketing/newsletters`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      throw error;
    }
  },

  getAnalytics: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/marketing/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching marketing analytics:', error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/marketing/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching marketing stats:', error);
      throw error;
    }
  },

  createCampaign: async (campaignData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/marketing/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(campaignData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  updateCampaign: async (campaignId, updateData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/marketing/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(updateData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  },

  createPromotion: async (promotionData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/marketing/promotions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(promotionData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating promotion:', error);
      throw error;
    }
  },

  sendNewsletter: async (newsletterId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/marketing/newsletters/${newsletterId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error sending newsletter:', error);
      throw error;
    }
  },

  createNewsletter: async (newsletterData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/marketing/newsletters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(newsletterData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating newsletter:', error);
      throw error;
    }
  }
};

// Content Management API
export const contentAPI = {
  getPages: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/content/pages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching pages:', error);
      throw error;
    }
  },

  getBlogPosts: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/content/blog`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      throw error;
    }
  },

  getMedia: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/content/media`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching media:', error);
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/content/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  getAnalytics: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/content/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching content analytics:', error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/content/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching content stats:', error);
      throw error;
    }
  },

  createPage: async (pageData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/content/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(pageData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating page:', error);
      throw error;
    }
  },

  updatePage: async (pageId, updateData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/content/pages/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(updateData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating page:', error);
      throw error;
    }
  },

  createBlogPost: async (postData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/content/blog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(postData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  },

  updateBlogPost: async (postId, updateData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/content/blog/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(updateData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating blog post:', error);
      throw error;
    }
  },

  createCategory: async (categoryData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/content/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(categoryData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  uploadMedia: async (mediaData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/content/media/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(mediaData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  }
};

// Advanced Inventory Management API
export const advancedInventoryAPI = {
  getProducts: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/advanced-inventory/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  getSuppliers: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/advanced-inventory/suppliers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  },

  getOrders: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/advanced-inventory/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  getAnalytics: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/advanced-inventory/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching inventory analytics:', error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/advanced-inventory/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      throw error;
    }
  },

  getAlerts: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/advanced-inventory/alerts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching inventory alerts:', error);
      throw error;
    }
  },

  createProduct: async (productData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/advanced-inventory/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(productData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (productId, updateData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/advanced-inventory/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(updateData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  createOrder: async (orderData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/advanced-inventory/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(orderData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  restockProduct: async (productId, restockData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/advanced-inventory/products/${productId}/restock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(restockData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error restocking product:', error);
      throw error;
    }
  },

  acknowledgeAlert: async (alertId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/advanced-inventory/alerts/${alertId}/acknowledge`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  }
};

// Business Process Automation API
export const automationAPI = {
  getWorkflows: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/automation/workflows`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching workflows:', error);
      throw error;
    }
  },

  getTriggers: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/automation/triggers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching triggers:', error);
      throw error;
    }
  },

  getExecutions: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/automation/executions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching executions:', error);
      throw error;
    }
  },

  getTemplates: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/automation/templates`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  getAnalytics: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/automation/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching automation analytics:', error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/automation/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching automation stats:', error);
      throw error;
    }
  },

  createWorkflow: async (workflowData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/automation/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(workflowData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  },

  updateWorkflow: async (workflowId, updateData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/automation/workflows/${workflowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(updateData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  },

  executeWorkflow: async (workflowId, input) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/automation/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(input)
      });
      return await response.json();
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    }
  },

  createTrigger: async (triggerData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/automation/triggers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(triggerData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating trigger:', error);
      throw error;
    }
  },

  createTemplate: async (templateData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/automation/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(templateData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }
};

// Third-party Integrations API
export const integrationsAPI = {
  getIntegrations: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/integrations/integrations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching integrations:', error);
      throw error;
    }
  },

  getWebhooks: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/integrations/webhooks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      throw error;
    }
  },

  getLogs: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/integrations/logs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching integration logs:', error);
      throw error;
    }
  },

  getHealth: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/integrations/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching integration health:', error);
      throw error;
    }
  },

  getAnalytics: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/integrations/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching integration analytics:', error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/integrations/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching integration stats:', error);
      throw error;
    }
  },

  testIntegration: async (integrationId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/integrations/integrations/${integrationId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error testing integration:', error);
      throw error;
    }
  },

  updateIntegrationConfig: async (integrationId, config) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/integrations/integrations/${integrationId}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(config)
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating integration config:', error);
      throw error;
    }
  },

  createWebhook: async (webhookData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/integrations/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(webhookData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating webhook:', error);
      throw error;
    }
  },

  syncIntegration: async (integrationId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/integrations/integrations/${integrationId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error syncing integration:', error);
      throw error;
    }
  }
};

// Mobile Admin App API
export const mobileAPI = {
  getDashboard: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/mobile/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching mobile dashboard:', error);
      throw error;
    }
  },

  getNotifications: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/mobile/notifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching mobile notifications:', error);
      throw error;
    }
  },

  getUsers: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/mobile/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching mobile users:', error);
      throw error;
    }
  },

  getOrders: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/mobile/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching mobile orders:', error);
      throw error;
    }
  },

  getInventory: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/mobile/inventory`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching mobile inventory:', error);
      throw error;
    }
  },

  getTransactions: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/mobile/transactions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching mobile transactions:', error);
      throw error;
    }
  },

  getAnalytics: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/mobile/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching mobile analytics:', error);
      throw error;
    }
  },

  getSettings: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/mobile/settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching mobile settings:', error);
      throw error;
    }
  },

  getVersion: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/mobile/version`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching mobile version:', error);
      throw error;
    }
  },

  markNotificationRead: async (notificationId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/mobile/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  updateSettings: async (settings) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/mobile/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(settings)
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating mobile settings:', error);
      throw error;
    }
  },

  syncData: async (data) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/mobile/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error syncing mobile data:', error);
      throw error;
    }
  }
};

// Export all APIs
export default {
  user: userAPI,
  order: orderAPI,
  transaction: transactionAPI,
  inventory: inventoryAPI,
  dashboard: dashboardAPI,
  agent: agentAPI,
  performance: performanceAPI,
  support: supportAPI,
  marketing: marketingAPI,
  content: contentAPI,
  advancedInventory: advancedInventoryAPI,
  automation: automationAPI,
  integrations: integrationsAPI,
  mobile: mobileAPI
};
