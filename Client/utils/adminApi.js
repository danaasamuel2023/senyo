// Admin API Service
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'x-auth-token': token
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// User Management APIs
export const userAPI = {
  // Get all users with pagination and search
  getUsers: async (page = 1, limit = 10, search = '') => {
    const params = new URLSearchParams({ page, limit, search });
    const response = await fetch(`${API_BASE_URL}/api/users?${params}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Update user details
  updateUser: async (userId, userData) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  // Add money to user wallet
  addMoney: async (userId, amount) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/add-money`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount })
    });
    return handleResponse(response);
  },

  // Deduct money from user wallet
  deductMoney: async (userId, amount, reason) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/deduct-money`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, reason })
    });
    return handleResponse(response);
  },

  // Toggle user status (enable/disable)
  toggleUserStatus: async (userId, disableReason = '') => {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/toggle-status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ disableReason })
    });
    return handleResponse(response);
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get user orders
  getUserOrders: async (userId, page = 1, limit = 100) => {
    const params = new URLSearchParams({ page, limit });
    const response = await fetch(`${API_BASE_URL}/api/user-orders/${userId}?${params}`, {
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
    const response = await fetch(`${API_BASE_URL}/api/orders?${params}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  // Bulk update order statuses
  bulkUpdateStatus: async (orderIds, status) => {
    const response = await fetch(`${API_BASE_URL}/api/orders/bulk-status-update`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ orderIds, status })
    });
    return handleResponse(response);
  }
};

// Transaction Management APIs
export const transactionAPI = {
  // Get all transactions with filters
  getTransactions: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/api/transactions?${params}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get transaction by ID
  getTransactionById: async (transactionId) => {
    const response = await fetch(`${API_BASE_URL}/api/transactions/${transactionId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Verify Paystack payment
  verifyPaystackPayment: async (reference) => {
    const response = await fetch(`${API_BASE_URL}/api/verify-paystack/${reference}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Update transaction status
  updateTransactionStatus: async (transactionId, status, adminNotes = '') => {
    const response = await fetch(`${API_BASE_URL}/api/transactions/${transactionId}/update-status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, adminNotes })
    });
    return handleResponse(response);
  }
};

// Inventory Management APIs
export const inventoryAPI = {
  // Get all inventory status
  getInventory: async () => {
    const response = await fetch(`${API_BASE_URL}/api/inventory`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get specific network inventory
  getNetworkInventory: async (network) => {
    const response = await fetch(`${API_BASE_URL}/api/inventory/${network}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Toggle network stock status
  toggleNetworkStock: async (network) => {
    const response = await fetch(`${API_BASE_URL}/api/inventory/${network}/toggle`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Toggle Geonettech API for network
  toggleGeonettech: async (network) => {
    const response = await fetch(`${API_BASE_URL}/api/inventory/${network}/toggle-geonettech`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Dashboard & Statistics APIs
export const dashboardAPI = {
  // Get dashboard statistics
  getStatistics: async () => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/statistics`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get daily summary
  getDailySummary: async (date) => {
    const params = new URLSearchParams({ date });
    const response = await fetch(`${API_BASE_URL}/api/daily-summary?${params}`, {
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
    const response = await fetch(`${API_BASE_URL}/api/agents?${params}`, {
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
