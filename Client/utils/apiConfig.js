// API Configuration Utility - Simplified to avoid circular dependencies

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
const API_URLS = {
  DEVELOPMENT: {
    BASE: 'https://unlimitedata.onrender.com',
    FRONTEND: 'http://localhost:3000',
    NEXT_PUBLIC: 'https://unlimitedata.onrender.com'
  },
  PRODUCTION: {
    BASE: 'https://unlimitedata.onrender.com',
    FRONTEND: 'https://unlimitedatagh.com',
    NEXT_PUBLIC: 'https://unlimitedata.onrender.com'
  }
};

// Get current environment
const getCurrentEnvironment = () => {
  return isDevelopment() ? 'DEVELOPMENT' : 'PRODUCTION';
};

// Get API URL for current environment
export const getApiUrl = () => {
  // Check for environment variable first
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Use environment-based URL
  const env = getCurrentEnvironment();
  return API_URLS[env].NEXT_PUBLIC;
};

export const getApiEndpoint = (endpoint) => {
  const baseUrl = getApiUrl();
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

// Export environment checks
export { isDevelopment, isProduction };

// API Health Check
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${getApiUrl()}/api/v1/admin/dashboard/statistics`, {
      method: 'HEAD',
      headers: {
        'x-auth-token': localStorage.getItem('authToken') || 'test'
      }
    });
    return response.ok;
  } catch (error) {
    console.warn('API health check failed:', error.message);
    return false;
  }
};
