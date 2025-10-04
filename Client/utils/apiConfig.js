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
