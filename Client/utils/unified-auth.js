// Unified Authentication System
// This file consolidates all authentication logic into a single, consistent system

// Constants
const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';
const SESSION_AUTH_KEY = 'isAuthenticated';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';
const REMEMBER_ME_KEY = 'rememberMe';

/**
 * Storage wrapper for better error handling
 */
class SecureStorage {
  static getItem(key) {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error accessing localStorage for key ${key}:`, error);
      return null;
    }
  }

  static setItem(key, value) {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem(key, value);
      
      // Verify the value was actually set
      const retrieved = localStorage.getItem(key);
      if (retrieved !== value) {
        console.error(`Storage verification failed for ${key}`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error setting localStorage for key ${key}:`, error);
      return false;
    }
  }

  static removeItem(key) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
      
      // Also remove cookie for middleware access
      if (key === AUTH_TOKEN_KEY) {
        document.cookie = `authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    } catch (error) {
      console.error(`Error removing localStorage key ${key}:`, error);
    }
  }

  static clear() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.clear();
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      
      // Also clear auth cookies
      document.cookie = `authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}

/**
 * Get the authentication token
 */
export const getAuthToken = () => {
  return SecureStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Get the current user data
 */
export const getCurrentUser = () => {
  const userData = SecureStorage.getItem(USER_DATA_KEY);
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Check if the current token is expired
 */
export const isTokenExpired = () => {
  const expiryTime = SecureStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiryTime) return true;
  
  try {
    const expiry = parseInt(expiryTime);
    return Date.now() > expiry;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  
  const token = getAuthToken();
  const user = getCurrentUser();
  const tokenValid = !isTokenExpired();
  
  const result = !!token && !!user && tokenValid;
  
  console.log('🔐 Authentication check:', { 
    hasToken: !!token, 
    hasUser: !!user,
    tokenValid, 
    result,
    timestamp: new Date().toISOString()
  });
  
  return result;
};

/**
 * Store authentication data
 */
export const saveAuthData = (data, rememberMe = false) => {
  const { token, user, expiresIn } = data;
  
  console.log('🔐 Saving authentication data:', {
    hasToken: !!token,
    hasUser: !!user,
    expiresIn,
    rememberMe,
    timestamp: new Date().toISOString()
  });
  
  try {
    // Set cookie FIRST for immediate middleware access
    if (typeof document !== 'undefined' && token) {
      const expires = new Date();
      expires.setTime(expires.getTime() + (expiresIn * 1000));
      
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const secureFlag = (process.env.NODE_ENV === 'production' && isHttps) ? '; Secure' : '';
      
      document.cookie = `authToken=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secureFlag}`;
      console.log('🔐 Cookie set for middleware access');
    }
    
    // Store in localStorage
    if (token && !SecureStorage.setItem(AUTH_TOKEN_KEY, token)) {
      throw new Error('Failed to store token');
    }
    
    if (user && !SecureStorage.setItem(USER_DATA_KEY, JSON.stringify(user))) {
      throw new Error('Failed to store user data');
    }
    
    if (expiresIn) {
      const expiryTime = Date.now() + (expiresIn * 1000);
      SecureStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    }
    
    SecureStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString());
    
    // Set session auth flag
    setTimeout(() => {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
      }
    }, 100);
    
    console.log('🔐 Authentication data saved successfully');
    return true;
  } catch (error) {
    console.error('🔐 Error saving authentication data:', error);
    return false;
  }
};

/**
 * Clear authentication data
 */
export const clearAuthData = () => {
  console.log('🔐 Clearing authentication data');
  
  SecureStorage.removeItem(AUTH_TOKEN_KEY);
  SecureStorage.removeItem(USER_DATA_KEY);
  SecureStorage.removeItem(TOKEN_EXPIRY_KEY);
  SecureStorage.removeItem(REMEMBER_ME_KEY);
  
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(SESSION_AUTH_KEY);
  }
  
  console.log('🔐 Authentication data cleared');
};

/**
 * Make authenticated API requests
 */
export const authenticatedFetch = async (url, options = {}) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token available');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'x-auth-token': token,
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (response.status === 401) {
    // Token expired or invalid
    clearAuthData();
    throw new Error('Authentication expired');
  }
  
  return response;
};

/**
 * React hook for authentication state
 */
export const useAuth = () => {
  // Check if we're in a browser environment with React
  if (typeof window === 'undefined' || typeof React === 'undefined') {
    return {
      isAuthenticated: false,
      user: null,
      loading: false
    };
  }
  
  const { useState, useEffect } = React;
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    loading: true
  });
  
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const user = authenticated ? getCurrentUser() : null;
      
      setAuth({
        isAuthenticated: authenticated,
        user,
        loading: false
      });
    };
    
    // Initial check with a small delay
    setTimeout(checkAuth, 50);
    
    // Listen for storage changes (logout from another tab)
    const handleStorageChange = (e) => {
      if (e.key === AUTH_TOKEN_KEY || e.key === USER_DATA_KEY) {
        setTimeout(checkAuth, 10);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  return auth;
};

// Export for backward compatibility
export const setAuthToken = (token, user, expiresIn, rememberMe = false) => {
  return saveAuthData({ token, user, expiresIn }, rememberMe);
};

export const getAuthToken as getToken = getAuthToken;
export const isAuthenticated as isLoggedIn = isAuthenticated;
