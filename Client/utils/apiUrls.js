/**
 * Centralized API URL Configuration
 * 
 * This file provides a single source of truth for all API URLs
 * across the entire application. Use this instead of hardcoding URLs.
 */

// Environment detection
const isDevelopment = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost';
  }
  return process.env.NODE_ENV === 'development';
};

const isProduction = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname !== 'localhost';
  }
  return process.env.NODE_ENV === 'production';
};

// API URL Configuration
export const API_URLS = {
  DEVELOPMENT: {
    BASE: 'http://localhost:5001',
    FRONTEND: 'http://localhost:3001',
    NEXT_PUBLIC: 'http://localhost:5001'
  },
  PRODUCTION: {
    BASE: 'https://unlimitedata.onrender.com',
    FRONTEND: 'https://www.unlimiteddatagh.com',
    NEXT_PUBLIC: 'https://unlimitedata.onrender.com'
  }
};

// Get current environment
export const getCurrentEnvironment = () => {
  return isDevelopment() ? 'DEVELOPMENT' : 'PRODUCTION';
};

// Get API base URL
export const getApiBaseUrl = () => {
  // Check for environment variable first
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  const env = getCurrentEnvironment();
  return API_URLS[env].BASE;
};

// Get frontend URL
export const getFrontendUrl = () => {
  const env = getCurrentEnvironment();
  return API_URLS[env].FRONTEND;
};

// Get NEXT_PUBLIC_API_URL
export const getNextPublicApiUrl = () => {
  // Check for environment variable first
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  const env = getCurrentEnvironment();
  return API_URLS[env].NEXT_PUBLIC;
};

// Build API endpoint
export const buildApiEndpoint = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/v1/login',
  REGISTER: '/api/v1/register',
  REFRESH_TOKEN: '/api/v1/auth/refresh-token',
  
  // Admin
  ADMIN_DASHBOARD: '/api/v1/admin/statistics',
  ADMIN_USERS: '/api/v1/admin/users',
  ADMIN_ORDERS: '/api/v1/admin/orders',
  ADMIN_TRANSACTIONS: '/api/v1/admin/transactions',
  ADMIN_INVENTORY: '/api/v1/admin/inventory',
  PAYMENT_GATEWAY_SETTINGS: '/api/v1/admin/payment-gateway-settings',
  PAYMENT_GATEWAY_ACTIVE: '/api/v1/admin/payment-gateway-settings/active',
  
  // User
  USER_DASHBOARD: '/api/v1/data/user-dashboard',
  USER_PROFILE: '/api/v1/user/profile',
  USER_ORDERS: '/api/v1/user/orders',
  
  // Payments
  PAYMENT_CALLBACK: '/api/v1/payment/callback',
  MOBILE_MONEY_DEPOSIT: '/api/v1/deposit/mobile-money',
  
  // Data
  DATA_ORDERS: '/api/v1/data/orders',
  DATA_PRICING: '/api/v1/data/pricing',
  
  // Reports
  DAILY_SUMMARY: '/api/v1/admin/dashboard/daily-summary',
  REPORTS: '/api/v1/reports'
};

// Helper function to get full API URL for an endpoint
export const getApiUrl = (endpoint) => {
  if (typeof endpoint === 'string') {
    return buildApiEndpoint(endpoint);
  }
  
  // If it's an endpoint key, get the actual endpoint
  if (API_ENDPOINTS[endpoint]) {
    return buildApiEndpoint(API_ENDPOINTS[endpoint]);
  }
  
  throw new Error(`Unknown API endpoint: ${endpoint}`);
};

// CORS origins for backend configuration
export const getCorsOrigins = () => {
  return [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://unlimitedata.onrender.com',
    'https://www.unlimitedata.onrender.com',
    'https://unlimiteddatagh.com',
    'https://www.unlimiteddatagh.com'
  ];
};

// Environment checks
export { isDevelopment, isProduction };

// Default export
export default {
  getApiBaseUrl,
  getFrontendUrl,
  getNextPublicApiUrl,
  buildApiEndpoint,
  getApiUrl,
  getCorsOrigins,
  getCurrentEnvironment,
  isDevelopment,
  isProduction,
  API_URLS,
  API_ENDPOINTS
};
