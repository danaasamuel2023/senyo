// API Configuration Utility
export const getApiUrl = () => {
  // Check if we're running on localhost (development)
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5001';
  }
  
  // Production URL
  return 'https://unlimitedata.onrender.com';
};

export const getApiEndpoint = (endpoint) => {
  return `${getApiUrl()}${endpoint}`;
};

// Environment detection
export const isDevelopment = () => {
  return typeof window !== 'undefined' && window.location.hostname === 'localhost';
};

export const isProduction = () => {
  return typeof window !== 'undefined' && window.location.hostname !== 'localhost';
};

// API Health Check
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${getApiUrl()}/api/admin/dashboard/statistics`, {
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
