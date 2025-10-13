// Enhanced Authentication Manager
// Ensures tokens are properly saved, sent with requests, and persist after refresh

// Constants
const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';
const REMEMBER_ME_KEY = 'rememberMe';
const SESSION_AUTH_KEY = 'isAuthenticated';

/**
 * Enhanced Storage Manager with better error handling and verification
 */
class AuthStorage {
  static setItem(key, value) {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.setItem(key, value);
      
      // Verify storage
      const retrieved = localStorage.getItem(key);
      if (retrieved !== value) {
        console.error(`❌ Storage verification failed for ${key}`);
        return false;
      }
      
      console.log(`✅ Successfully stored ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Error storing ${key}:`, error);
      return false;
    }
  }

  static getItem(key) {
    if (typeof window === 'undefined') return null;
    
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`❌ Error retrieving ${key}:`, error);
      return null;
    }
  }

  static removeItem(key) {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(key);
      console.log(`✅ Removed ${key}`);
    } catch (error) {
      console.error(`❌ Error removing ${key}:`, error);
    }
  }

  static clear() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.clear();
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      console.log('✅ Storage cleared');
    } catch (error) {
      console.error('❌ Error clearing storage:', error);
    }
  }
}

/**
 * Enhanced Authentication Manager
 */
class AuthManager {
  constructor() {
    this.isInitialized = false;
    this.authState = {
      isAuthenticated: false,
      user: null,
      token: null,
      loading: true
    };
    
    // Initialize on creation
    this.initialize();
  }

  /**
   * Initialize authentication state
   */
  initialize() {
    if (typeof window === 'undefined') return;
    
    console.log('🔐 Initializing AuthManager...');
    
    // Check for existing authentication
    const token = AuthStorage.getItem(AUTH_TOKEN_KEY);
    const userData = AuthStorage.getItem(USER_DATA_KEY);
    const expiryTime = AuthStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (token && userData && expiryTime) {
      const isExpired = Date.now() > parseInt(expiryTime);
      
      if (!isExpired) {
        try {
          const user = JSON.parse(userData);
          this.authState = {
            isAuthenticated: true,
            user,
            token,
            loading: false
          };
          
          // Set session flag
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
          }
          
          console.log('✅ AuthManager initialized with existing session');
        } catch (error) {
          console.error('❌ Error parsing user data:', error);
          this.clearAuth();
        }
      } else {
        console.log('⏰ Token expired, clearing auth');
        this.clearAuth();
      }
    } else {
      this.authState.loading = false;
      console.log('ℹ️ No existing session found');
    }
    
    this.isInitialized = true;
  }

  /**
   * Save authentication data
   */
  saveAuth(token, user, expiresIn = 7 * 24 * 60 * 60, rememberMe = false) {
    console.log('🔐 Saving authentication data...', {
      hasToken: !!token,
      hasUser: !!user,
      expiresIn,
      rememberMe
    });

    try {
      // Set cookie for middleware access
      if (typeof document !== 'undefined' && token) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (expiresIn * 1000));
        
        const isHttps = window.location.protocol === 'https:';
        const secureFlag = (process.env.NODE_ENV === 'production' && isHttps) ? '; Secure' : '';
        
        document.cookie = `authToken=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secureFlag}`;
        console.log('✅ Cookie set for middleware access');
      }

      // Store in localStorage
      if (!AuthStorage.setItem(AUTH_TOKEN_KEY, token)) {
        throw new Error('Failed to store token');
      }

      if (!AuthStorage.setItem(USER_DATA_KEY, JSON.stringify(user))) {
        throw new Error('Failed to store user data');
      }

      const expiryTime = Date.now() + (expiresIn * 1000);
      if (!AuthStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())) {
        throw new Error('Failed to store expiry time');
      }

      if (!AuthStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString())) {
        throw new Error('Failed to store remember me flag');
      }

      // Update auth state
      this.authState = {
        isAuthenticated: true,
        user,
        token,
        loading: false
      };

      // Set session flag
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
      }

      console.log('✅ Authentication data saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Error saving authentication data:', error);
      return false;
    }
  }

  /**
   * Get current authentication token
   */
  getToken() {
    return this.authState.token || AuthStorage.getItem(AUTH_TOKEN_KEY);
  }

  /**
   * Get current user
   */
  getUser() {
    return this.authState.user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    if (!this.isInitialized) {
      this.initialize();
    }
    
    const token = this.getToken();
    const user = this.getUser();
    const expiryTime = AuthStorage.getItem(TOKEN_EXPIRY_KEY);
    
    const isExpired = expiryTime ? Date.now() > parseInt(expiryTime) : true;
    const result = !!(token && user && !isExpired);
    
    console.log('🔐 Authentication check:', {
      hasToken: !!token,
      hasUser: !!user,
      isExpired,
      result
    });
    
    return result;
  }

  /**
   * Clear authentication data
   */
  clearAuth() {
    console.log('🔐 Clearing authentication data...');
    
    AuthStorage.removeItem(AUTH_TOKEN_KEY);
    AuthStorage.removeItem(USER_DATA_KEY);
    AuthStorage.removeItem(TOKEN_EXPIRY_KEY);
    AuthStorage.removeItem(REMEMBER_ME_KEY);
    
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
    }
    
    // Clear cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    
    // Reset auth state
    this.authState = {
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false
    };
    
    console.log('✅ Authentication data cleared');
  }

  /**
   * Make authenticated API request
   */
  async authenticatedFetch(url, options = {}) {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const headers = {
      'Content-Type': 'application/json',
      'x-auth-token': token,
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    console.log('🔐 Making authenticated request to:', url);

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (response.status === 401) {
        console.log('❌ Authentication failed, clearing auth');
        this.clearAuth();
        throw new Error('Authentication expired');
      }

      return response;
    } catch (error) {
      console.error('❌ Authenticated request failed:', error);
      throw error;
    }
  }

  /**
   * Get authentication state for React components
   */
  getAuthState() {
    if (!this.isInitialized) {
      this.initialize();
    }
    return this.authState;
  }
}

// Create singleton instance
const authManager = new AuthManager();

// Export functions for backward compatibility
export const saveAuthData = (data, rememberMe = false) => {
  return authManager.saveAuth(data.token, data.user, data.expiresIn, rememberMe);
};

export const getAuthToken = () => authManager.getToken();
export const getCurrentUser = () => authManager.getUser();
export const isAuthenticated = () => authManager.isAuthenticated();
export const clearAuthData = () => authManager.clearAuth();
export const authenticatedFetch = (url, options) => authManager.authenticatedFetch(url, options);

// Export the manager instance for advanced usage
export { authManager };

// React hook for authentication state
export const useAuth = () => {
  if (typeof window === 'undefined' || typeof React === 'undefined') {
    return {
      isAuthenticated: false,
      user: null,
      loading: false
    };
  }

  const { useState, useEffect } = React;
  const [auth, setAuth] = useState(authManager.getAuthState());

  useEffect(() => {
    const updateAuth = () => {
      setAuth(authManager.getAuthState());
    };

    // Initial update
    updateAuth();

    // Listen for storage changes (logout from another tab)
    const handleStorageChange = (e) => {
      if (e.key === AUTH_TOKEN_KEY || e.key === USER_DATA_KEY) {
        setTimeout(updateAuth, 10);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return auth;
};
