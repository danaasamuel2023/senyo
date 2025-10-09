// API Endpoints Configuration
// Centralized endpoint definitions to ensure consistency across the application

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
  },

  // Payment & Transactions
  PAYMENT: {
    VERIFY: '/api/v1/verify-payment',
    CALLBACK: '/api/v1/payment/callback',
    DEPOSIT: '/api/v1/deposit',
    MOBILE_MONEY_DEPOSIT: '/api/v1/deposit/mobile-money',
    WEBHOOK: '/api/v1/paystack/webhook',
  },

  // User Management
  USER: {
    PROFILE: '/api/v1/user/profile',
    ORDERS: '/api/v1/user/orders',
    WALLET: '/api/v1/wallet/balance',
    STATS: '/api/v1/user-stats',
  },

  // Admin APIs
  ADMIN: {
    USERS: '/api/v1/admin/users',
    ORDERS: '/api/v1/admin/orders',
    TRANSACTIONS: '/api/v1/admin/transactions',
    DASHBOARD: '/api/v1/admin/dashboard/statistics',
    DAILY_SUMMARY: '/api/v1/admin/dashboard/daily-summary',
    INVENTORY: '/api/v1/admin/inventory',
    VERIFY_PAYSTACK: '/api/v1/admin/verify-paystack',
  },

  // Orders & Data
  ORDERS: {
    CREATE: '/api/v1/orders',
    BULK_PURCHASE: '/api/v1/orders/bulk-purchase',
    NETWORKS: '/api/v1/orders/networks',
    HISTORY: '/api/v1/orders/history',
    UPDATE_STATUS: '/api/v1/orders/update-status',
  },

  // Verification
  VERIFICATION: {
    VERIFY: '/api/v1/verification',
    HISTORY: '/api/v1/verifications/history',
  },

  // Agent Management
  AGENT: {
    LIST: '/api/v1/admin/agents',
    CATALOG: '/api/agents',
    MY_CATALOG: '/api/agent/catalog',
  },
};

// Helper function to get endpoint with parameters
export const getEndpoint = (endpoint, params = {}) => {
  let url = endpoint;
  
  // Replace path parameters
  Object.keys(params).forEach(key => {
    if (url.includes(`:${key}`)) {
      url = url.replace(`:${key}`, encodeURIComponent(params[key]));
    }
  });
  
  return url;
};

// Helper function to build query string
export const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      searchParams.append(key, params[key]);
    }
  });
  
  return searchParams.toString();
};

// Helper function to get full URL with query parameters
export const getFullEndpoint = (endpoint, params = {}, queryParams = {}) => {
  let url = getEndpoint(endpoint, params);
  
  const queryString = buildQueryString(queryParams);
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return url;
};

export default API_ENDPOINTS;
