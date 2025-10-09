// utils/auth.js - Modern authentication utilities with enhanced security

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Constants
const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
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
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting localStorage for key ${key}:`, error);
    }
  }

  static removeItem(key) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key ${key}:`, error);
    }
  }

  static clear() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}

/**
 * Get the authentication token
 * @returns {string|null} The auth token or null
 */
export const getAuthToken = () => {
  return SecureStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Get the refresh token
 * @returns {string|null} The refresh token or null
 */
export const getRefreshToken = () => {
  return SecureStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Check if the current token is expired
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = () => {
  const expiry = SecureStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiry) return true;
  
  const expiryTime = parseInt(expiry);
  const currentTime = Date.now();
  
  return currentTime > expiryTime;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  
  const token = getAuthToken();
  const sessionAuth = sessionStorage.getItem(SESSION_AUTH_KEY);
  const tokenValid = !isTokenExpired();
  
  return !!token && sessionAuth === 'true' && tokenValid;
};

/**
 * Get the current user data
 * @returns {Object|null} User data object or null
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
 * Get user role
 * @returns {string|null} User role or null
 */
export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || null;
};

/**
 * Check if user has specific role
 * @param {string} role - Role to check
 * @returns {boolean} True if user has the role
 */
export const hasRole = (role) => {
  const userRole = getUserRole();
  return userRole === role;
};

/**
 * Save authentication data
 * @param {Object} data - Authentication data
 * @param {boolean} rememberMe - Whether to persist login
 */
export const saveAuthData = (data, rememberMe = false) => {
  const { token, refreshToken, user, expiresIn } = data;
  
  if (token) {
    SecureStorage.setItem(AUTH_TOKEN_KEY, token);
  }
  
  if (refreshToken) {
    SecureStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  
  if (user) {
    SecureStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  }
  
  if (expiresIn) {
    const expiryTime = Date.now() + (expiresIn * 1000);
    SecureStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  }
  
  SecureStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString());
  sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  // Clear specific auth keys
  const authKeys = [
    AUTH_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
    USER_DATA_KEY,
    TOKEN_EXPIRY_KEY,
    REMEMBER_ME_KEY,
    'data.user',
    'user',
    'token'
  ];
  
  authKeys.forEach(key => SecureStorage.removeItem(key));
  
  // Clear session storage
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_AUTH_KEY);
  }
};

/**
 * Logout user and redirect
 * @param {string} redirectUrl - URL to redirect after logout
 */
export const logout = (redirectUrl = '/SignIn') => {
  clearAuthData();
  
  if (typeof window !== 'undefined') {
    // Optional: Call logout API endpoint
    try {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'x-auth-token': getAuthToken()
        }
      }).catch(() => {
        // Silently fail - user is logging out anyway
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    
    // Redirect to login page
    window.location.href = redirectUrl;
  }
};

/**
 * Refresh authentication token
 * @returns {Promise<boolean>} True if refresh successful
 */
export const refreshAuthToken = async () => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    return false;
  }
  
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken })
    });
    
    if (response.ok) {
      const data = await response.json();
      saveAuthData(data, SecureStorage.getItem(REMEMBER_ME_KEY) === 'true');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

/**
 * Enhanced fetch with authentication and auto-refresh
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export const authenticatedFetch = async (url, options = {}) => {
  // Check if token is expired and try to refresh
  if (isTokenExpired()) {
    const refreshed = await refreshAuthToken();
    if (!refreshed) {
      logout();
      throw new Error('Authentication required');
    }
  }
  
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['x-auth-token'] = token;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle authentication errors
    if (response.status === 401) {
      const data = await response.json().catch(() => ({}));
      
      if (data.message === 'Token expired') {
        // Try to refresh token
        const refreshed = await refreshAuthToken();
        
        if (refreshed) {
        // Retry the original request with new token
        const newToken = getAuthToken();
        headers['x-auth-token'] = newToken;
          
          return fetch(url, {
            ...options,
            headers,
          });
        }
      }
      
      // If refresh failed or other 401 error, logout
      logout();
      throw new Error('Authentication failed');
    }
    
    return response;
  } catch (error) {
    console.error('Authenticated fetch error:', error);
    throw error;
  }
};

/**
 * Hook for authentication state
 */
export const useAuth = () => {
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
    
    checkAuth();
    
    // Listen for storage changes (logout from another tab)
    const handleStorageChange = (e) => {
      if (e.key === AUTH_TOKEN_KEY || e.key === USER_DATA_KEY) {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  return auth;
};

/**
 * Modern loading spinner component with red theme
 */
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="relative">
      <div className="w-20 h-20 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
      <div className="absolute top-0 left-0 w-20 h-20 rounded-full border-4 border-red-500 border-t-transparent animate-spin"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg animate-pulse shadow-lg shadow-red-500/25"></div>
      </div>
    </div>
    <div className="ml-4 text-gray-700 dark:text-gray-300 font-semibold">
      Authenticating...
    </div>
  </div>
);

/**
 * Higher-Order Component for route protection
 * @param {React.Component} Component - Component to protect
 * @param {Object} options - Protection options
 * @returns {React.Component} Protected component
 */
export const withAuth = (Component, options = {}) => {
  const { 
    redirectTo = '/SignIn',
    requiredRole = null,
    fallback = LoadingSpinner 
  } = options;
  
  return function ProtectedComponent(props) {
    const router = useRouter();
    const { isAuthenticated: isAuth, user, loading } = useAuth();
    const [authorized, setAuthorized] = useState(false);
    
    useEffect(() => {
      if (!loading) {
        if (!isAuth) {
          router.replace(redirectTo);
        } else if (requiredRole && user?.role !== requiredRole) {
          router.replace('/unauthorized');
        } else {
          setAuthorized(true);
        }
      }
    }, [loading, isAuth, user, router]);
    
    if (loading) {
      const FallbackComponent = fallback;
      return <FallbackComponent />;
    }
    
    if (!authorized) {
      return null;
    }
    
    return <Component {...props} user={user} />;
  };
};

/**
 * Hook for role-based access control
 * @param {string|string[]} allowedRoles - Allowed roles
 */
export const useRoleAccess = (allowedRoles) => {
  const { user } = useAuth();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return {
    hasAccess: user && roles.includes(user.role),
    userRole: user?.role || null
  };
};

/**
 * Session timeout manager
 */
export class SessionManager {
  static timeoutId = null;
  static warningTimeoutId = null;
  
  static startSession(timeoutMinutes = 30, warningMinutes = 5) {
    this.clearSession();
    
    const timeout = timeoutMinutes * 60 * 1000;
    const warning = (timeoutMinutes - warningMinutes) * 60 * 1000;
    
    // Set warning timeout
    this.warningTimeoutId = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('sessionWarning', { 
          detail: { minutesRemaining: warningMinutes } 
        });
        window.dispatchEvent(event);
      }
    }, warning);
    
    // Set session timeout
    this.timeoutId = setTimeout(() => {
      logout('/SignIn?reason=timeout');
    }, timeout);
  }
  
  static refreshSession() {
    const rememberMe = SecureStorage.getItem(REMEMBER_ME_KEY) === 'true';
    
    if (!rememberMe) {
      this.startSession();
    }
  }
  
  static clearSession() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
      this.warningTimeoutId = null;
    }
  }
}

// Export setAuthToken as an alias for saveAuthData for backward compatibility
export const setAuthToken = (token, user, expiresIn, rememberMe = false) => {
  saveAuthData({
    token,
    user,
    expiresIn
  }, rememberMe);
};

export default {
  getAuthToken,
  getRefreshToken,
  isAuthenticated,
  getCurrentUser,
  getUserRole,
  hasRole,
  saveAuthData,
  setAuthToken, // Add backward compatibility alias
  clearAuthData,
  logout,
  refreshAuthToken,
  authenticatedFetch,
  useAuth,
  withAuth,
  useRoleAccess,
  SessionManager
};