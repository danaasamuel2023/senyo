// Environment Configuration
export const ENV_CONFIG = {
  // API URLs
  DEVELOPMENT: {
    API_URL: 'http://localhost:5001',
    FRONTEND_URL: 'http://localhost:3004'
  },
  PRODUCTION: {
    API_URL: 'https://unlimitedata.onrender.com',
    FRONTEND_URL: 'https://unlimitedata.onrender.com'
  }
};

// Get current environment
export const getCurrentEnv = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' ? 'DEVELOPMENT' : 'PRODUCTION';
  }
  return 'DEVELOPMENT'; // Default fallback
};

// Get API URL for current environment
export const getApiUrl = () => {
  const env = getCurrentEnv();
  return ENV_CONFIG[env].API_URL;
};

// Get Frontend URL for current environment
export const getFrontendUrl = () => {
  const env = getCurrentEnv();
  return ENV_CONFIG[env].FRONTEND_URL;
};

// Environment checks
export const isDevelopment = () => getCurrentEnv() === 'DEVELOPMENT';
export const isProduction = () => getCurrentEnv() === 'PRODUCTION';

// API endpoint builder
export const getApiEndpoint = (endpoint) => {
  return `${getApiUrl()}${endpoint}`;
};

// CORS configuration for backend
export const getCorsOrigins = () => {
  return [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3004',
    'https://unlimitedata.onrender.com'
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
  isDevelopment,
  isProduction,
  getApiEndpoint,
  getCorsOrigins,
  getLogLevel,
  getRateLimits,
  getDbConfig,
  ENV_CONFIG
};
