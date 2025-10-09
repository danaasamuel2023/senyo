// Environment Configuration
// Import from centralized API URLs
import { API_URLS } from './apiUrls';

export const ENV_CONFIG = API_URLS;

// Get current environment
export const getCurrentEnv = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' ? 'DEVELOPMENT' : 'PRODUCTION';
  }
  return 'DEVELOPMENT'; // Default fallback
};

// Get API URL for current environment
export const getApiUrl = () => {
  // Check for environment variable first
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  const env = getCurrentEnv();
  return ENV_CONFIG[env].BASE;
};

// Get Frontend URL for current environment
export const getFrontendUrl = () => {
  const env = getCurrentEnv();
  return ENV_CONFIG[env].FRONTEND;
};

// Get NEXT_PUBLIC_API_URL for current environment
export const getNextPublicApiUrl = () => {
  // Check for environment variable first
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  const env = getCurrentEnv();
  return ENV_CONFIG[env].NEXT_PUBLIC;
};

// Environment checks
export const isDevelopment = () => getCurrentEnv() === 'DEVELOPMENT';
export const isProduction = () => getCurrentEnv() === 'PRODUCTION';

// API endpoint builder
export const getApiEndpoint = (endpoint) => {
  const baseUrl = getApiUrl();
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

// CORS configuration for backend
export const getCorsOrigins = () => {
  return [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://unlimitedata.onrender.com',
    'https://www.unlimitedata.onrender.com',
    'https://unlimiteddatagh.com',
    'https://www.unlimiteddatagh.com'
  ];
};

// Logging configuration
export const getLogLevel = () => {
  return isDevelopment() ? 'debug' : 'error';
};

// Rate limiting configuration
export const getRateLimits = () => {
  return {
    general: isDevelopment() ? 1000 : 100,
    auth: isDevelopment() ? 50 : 5,
    payment: isDevelopment() ? 50 : 5
  };
};

// Database configuration
export const getDbConfig = () => {
  return {
    useNewUrlParser: false, // Deprecated option
    useUnifiedTopology: false, // Deprecated option
    maxPoolSize: isDevelopment() ? 10 : 5,
    serverSelectionTimeoutMS: isDevelopment() ? 5000 : 30000
  };
};

// Export all configurations
export default {
  getCurrentEnv,
  getApiUrl,
  getFrontendUrl,
  getNextPublicApiUrl,
  isDevelopment,
  isProduction,
  getApiEndpoint,
  getCorsOrigins,
  getLogLevel,
  getRateLimits,
  getDbConfig,
  ENV_CONFIG
};
