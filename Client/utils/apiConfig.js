// API Configuration Utility
// Import from centralized config
import { getApiUrl as getCentralizedApiUrl } from './envConfig';

// Use centralized API URL configuration
export const getApiUrl = () => {
  return getCentralizedApiUrl();
};

export const getApiEndpoint = (endpoint) => {
  return `${getApiUrl()}${endpoint}`;
};

// Environment detection - use centralized config
import { isDevelopment as getIsDevelopment, isProduction as getIsProduction } from './envConfig';

export const isDevelopment = () => {
  return getIsDevelopment();
};

export const isProduction = () => {
  return getIsProduction();
};

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
