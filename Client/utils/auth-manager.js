// UNIFIED Authentication Manager
// Single source of truth for all authentication operations
// Replaces utils/auth.js to eliminate conflicts

// Constants
const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';
const REMEMBER_ME_KEY = 'rememberMe';
const SESSION_AUTH_KEY = 'isAuthenticated';
const REFRESH_TOKEN_KEY = 'refreshToken';

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
   * Save authentication data - UNIFIED METHOD
   * Handles both new format (token, user, expiresIn) and legacy format (data object)
   */
  saveAuth(tokenOrData, userOrRememberMe, expiresInOrUndefined, rememberMeOrUndefined) {
    let token, user, expiresIn, rememberMe;
    
    // Handle both new and legacy call formats
    if (typeof tokenOrData === 'object' && tokenOrData !== null) {
      // Legacy format: saveAuth(data, rememberMe)
      const data = tokenOrData;
      token = data.token;
      user = data.user;
      expiresIn = data.expiresIn || 7 * 24 * 60 * 60;
      rememberMe = userOrRememberMe || false;
    } else {
      // New format: saveAuth(token, user, expiresIn, rememberMe)
      token = tokenOrData;
      user = userOrRememberMe;
      expiresIn = expiresInOrUndefined || 7 * 24 * 60 * 60;
      rememberMe = rememberMeOrUndefined || false;
    }

    console.log('🔐 UNIFIED: Saving authentication data...', {
      hasToken: !!token,
      hasUser: !!user,
      expiresIn,
      rememberMe,
      format: typeof tokenOrData === 'object' ? 'legacy' : 'new'
    });

    try {
      // Normalize user data to ensure consistency
      if (user) {
        user = this.normalizeUserData(user);
        if (!user) {
          throw new Error('Failed to normalize user data');
        }
      }

      // Set cookie FIRST for immediate middleware access
      if (typeof document !== 'undefined' && token) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (expiresIn * 1000));
        
        const isHttps = window.location.protocol === 'https:';
        const secureFlag = (process.env.NODE_ENV === 'production' && isHttps) ? '; Secure' : '';
        
        // Use consistent cookie format
        document.cookie = `authToken=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secureFlag}`;
        console.log('✅ UNIFIED: Cookie set for middleware access');
      }

      // Store in localStorage with verification
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

      // Update auth state immediately
      this.authState = {
        isAuthenticated: true,
        user,
        token,
        loading: false
      };

      // Set session flag with delay to ensure it's set after other operations
      setTimeout(() => {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
          console.log('✅ UNIFIED: Session flag set');
        }
      }, 50);

      console.log('✅ UNIFIED: Authentication data saved successfully');
      
      // Final verification of saved data
      const finalToken = AuthStorage.getItem(AUTH_TOKEN_KEY);
      const finalUser = AuthStorage.getItem(USER_DATA_KEY);
      const finalExpiry = AuthStorage.getItem(TOKEN_EXPIRY_KEY);
      
      console.log('🔐 UNIFIED: Final verification of saved data:', {
        tokenSaved: !!finalToken,
        userSaved: !!finalUser,
        expirySaved: !!finalExpiry,
        tokenLength: finalToken ? finalToken.length : 0,
        userDataLength: finalUser ? finalUser.length : 0,
        expiryTime: finalExpiry,
        currentTime: Date.now(),
        isExpired: finalExpiry ? Date.now() > parseInt(finalExpiry) : true
      });
      
      return true;
    } catch (error) {
      console.error('❌ UNIFIED: Error saving authentication data:', error);
      return false;
    }
  }

  /**
   * Normalize user data to ensure both id and _id fields exist
   */
  normalizeUserData(userData) {
    if (!userData) {
      console.error('❌ UNIFIED: No user data provided');
      return null;
    }
    
    // Ensure we have a valid user ID
    const userId = userData._id || userData.id;
    if (!userId) {
      console.error('❌ UNIFIED: No valid user ID found', userData);
      return null;
    }
    
    const normalizedUser = {
      ...userData,
      id: userId, // Ensure id field exists
      _id: userId, // Keep original _id
      // Ensure required fields exist with defaults
      name: userData.name || 'User',
      email: userData.email || '',
      role: userData.role || 'buyer',
      walletBalance: userData.walletBalance || 0,
      referralCode: userData.referralCode || 'USER'
    };
    
    console.log('✅ UNIFIED: User data normalized:', {
      userId: normalizedUser.id,
      userRole: normalizedUser.role,
      userEmail: normalizedUser.email
    });
    
    return normalizedUser;
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
   * Check if user is authenticated - UNIFIED METHOD
   */
  isAuthenticated() {
    if (!this.isInitialized) {
      this.initialize();
    }
    
    const token = this.getToken();
    const user = this.getUser();
    const expiryTime = AuthStorage.getItem(TOKEN_EXPIRY_KEY);
    const sessionAuth = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(SESSION_AUTH_KEY) : null;
    
    // Check token expiry
    const isExpired = expiryTime ? Date.now() > parseInt(expiryTime) : true;
    
    // Enhanced validation: check if user has required fields
    const hasValidUser = user && (user.id || user._id) && user.email && user.role;
    
    // More lenient check - if we have token and user, consider authenticated
    // Don't require sessionAuth to be 'true' as it might not be set immediately
    const result = !!(token && hasValidUser && !isExpired);
    
    console.log('🔐 UNIFIED: Authentication check:', {
      hasToken: !!token,
      hasUser: !!user,
      hasValidUser,
      sessionAuth,
      isExpired,
      result,
      userRole: user?.role,
      userId: user?.id || user?._id,
      isInitialized: this.isInitialized,
      authStateLoading: this.authState.loading
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
   * Make authenticated API request - UNIFIED METHOD
   * Sends tokens in both formats for maximum compatibility
   */
  async authenticatedFetch(url, options = {}) {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    // Send token in both formats for maximum compatibility
    const headers = {
      'Content-Type': 'application/json',
      'x-auth-token': token, // For frontend middleware
      'Authorization': `Bearer ${token}`, // For backend API
      ...options.headers
    };

    console.log('🔐 UNIFIED: Making authenticated request to:', url);

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (response.status === 401) {
        console.log('❌ UNIFIED: Authentication failed, clearing auth');
        this.clearAuth();
        throw new Error('Authentication expired');
      }

      return response;
    } catch (error) {
      console.error('❌ UNIFIED: Authenticated request failed:', error);
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

  /**
   * Force refresh authentication state from storage
   */
  refreshAuthState() {
    console.log('🔐 UNIFIED: Refreshing auth state from storage...');
    
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
          
          console.log('✅ UNIFIED: Auth state refreshed successfully');
          return true;
        } catch (error) {
          console.error('❌ UNIFIED: Error parsing user data during refresh:', error);
          this.clearAuth();
          return false;
        }
      } else {
        console.log('⏰ UNIFIED: Token expired during refresh');
        this.clearAuth();
        return false;
      }
    } else {
      console.log('ℹ️ UNIFIED: No auth data found during refresh');
      this.authState = {
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false
      };
      return false;
    }
  }
}

// Create singleton instance
const authManager = new AuthManager();

// Expose AuthManager to window for debugging (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.authManager = authManager;
  console.log('🔐 AuthManager exposed to window for debugging');
}

// UNIFIED EXPORTS - Backward compatibility with utils/auth.js
export const saveAuthData = (data, rememberMe = false) => {
  return authManager.saveAuth(data, rememberMe);
};

export const setAuthToken = (token, user, expiresIn, rememberMe = false) => {
  return authManager.saveAuth(token, user, expiresIn, rememberMe);
};

export const getAuthToken = () => authManager.getToken();
export const getCurrentUser = () => authManager.getUser();
export const getUserRole = () => {
  const user = authManager.getUser();
  return user?.role || null;
};
export const getUserId = () => {
  const user = authManager.getUser();
  return user ? (user.id || user._id) : null;
};
export const hasRole = (role) => {
  const userRole = getUserRole();
  return userRole === role;
};
export const isAuthenticated = () => authManager.isAuthenticated();
export const clearAuthData = () => authManager.clearAuth();
export const authenticatedFetch = (url, options) => authManager.authenticatedFetch(url, options);
export const normalizeUserData = (userData) => authManager.normalizeUserData(userData);

// Additional exports for backward compatibility
export const getRefreshToken = () => {
  console.warn('⚠️ getRefreshToken is not implemented in unified auth system');
  return null;
};

export const isTokenExpired = () => {
  const token = authManager.getToken();
  const expiryTime = AuthStorage.getItem(TOKEN_EXPIRY_KEY);
  return expiryTime ? Date.now() > parseInt(expiryTime) : true;
};

export const refreshAuthToken = async () => {
  console.warn('⚠️ refreshAuthToken is not implemented in unified auth system');
  return false;
};

// Higher-Order Component for route protection
export const withAuth = (Component, options = {}) => {
  console.warn('⚠️ withAuth is deprecated. Use ProtectedRoute component instead.');
  return Component;
};

// Hook for role-based access control
export const useRoleAccess = (allowedRoles) => {
  console.warn('⚠️ useRoleAccess is deprecated. Use hasRole function instead.');
  const userRole = getUserRole();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return {
    hasAccess: userRole && roles.includes(userRole),
    userRole: userRole || null
  };
};

// Session timeout manager
export class SessionManager {
  static timeoutId = null;
  static warningTimeoutId = null;
  
  static startSession(timeoutMinutes = 30, warningMinutes = 5) {
    console.warn('⚠️ SessionManager is deprecated in unified auth system');
    this.clearSession();
  }
  
  static refreshSession() {
    console.warn('⚠️ SessionManager is deprecated in unified auth system');
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

// Verify authentication state after login
export const verifyAuthState = async () => {
  return new Promise((resolve) => {
    const checkAuthState = () => {
      const result = authManager.isAuthenticated();
      console.log('🔐 UNIFIED: Auth verification result:', result);
      resolve(result);
    };
    
    // Check immediately
    checkAuthState();
  });
};

// Logout function with redirect
export const logout = (redirectUrl = '/SignIn') => {
  authManager.clearAuth();
  
  if (typeof window !== 'undefined') {
    // Optional: Call logout API endpoint
    try {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'x-auth-token': authManager.getToken()
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
