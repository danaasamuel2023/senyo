// utils/auth.js - Modern authentication utilities with enhanced security

// Note: React imports removed for Node.js compatibility
// React hooks and components are only used in browser environment

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
      console.log(`🔐 SecureStorage.setItem: Setting ${key} = ${value ? value.substring(0, 50) + '...' : 'null'}`);
      localStorage.setItem(key, value);
      
      // Verify the value was actually set
      const retrieved = localStorage.getItem(key);
      if (retrieved !== value) {
        console.error(`🔐 SecureStorage.setItem: Verification failed for ${key}. Expected: ${value}, Got: ${retrieved}`);
      } else {
        console.log(`🔐 SecureStorage.setItem: Successfully set ${key}`);
      }
      
      // Cookie setting is handled by setAuthToken/saveAuthData to avoid duplication
      // Removed duplicate cookie setting here to prevent conflicts
    } catch (error) {
      console.error(`🔐 SecureStorage.setItem: Error setting localStorage for key ${key}:`, error);
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
      console.log('🔐 SecureStorage.clear: Clearing all storage');
      localStorage.clear();
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      
      // Also clear auth cookies
      document.cookie = `authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      console.log('🔐 SecureStorage.clear: Storage cleared successfully');
    } catch (error) {
      console.error('🔐 SecureStorage.clear: Error clearing storage:', error);
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
  if (typeof window === 'undefined') return true;
  
  try {
    const token = getAuthToken();
    if (!token) return true;
    
    // Check JWT token expiration first
    if (token.includes('.')) {
      const parts = token.split('.');
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.exp && payload.exp < Date.now() / 1000) {
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error parsing JWT token:', error);
          return true;
        }
      }
    }
    
    // Fallback to stored expiry time for bypass tokens
    const expiry = SecureStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    
    const expiryTime = parseInt(expiry);
    const currentTime = Date.now();
    
    return currentTime > expiryTime;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  
  const token = getAuthToken();
  const user = getCurrentUser();
  const sessionAuth = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(SESSION_AUTH_KEY) : null;
  const tokenValid = !isTokenExpired();
  
  // More lenient check - if we have token and user, consider authenticated
  // Don't require sessionAuth to be 'true' as it might not be set immediately after login
  const result = !!token && !!user && tokenValid;
  
  // Debug logging for authentication issues
  console.log('🔐 isAuthenticated check:', { 
    hasToken: !!token, 
    hasUser: !!user,
    sessionAuth, 
    tokenValid, 
    result,
    timestamp: new Date().toISOString()
  });
  
  return result;
};

/**
 * Get the current user data
 * @returns {Object|null} User data object or null
 */
export const getCurrentUser = () => {
  const userData = SecureStorage.getItem(USER_DATA_KEY);
  
  if (!userData) {
    console.log('🔐 getCurrentUser: No user data found');
    return null;
  }
  
  try {
    const parsed = JSON.parse(userData);
    console.log('🔐 getCurrentUser: Parsed user data:', { 
      hasId: !!(parsed.id || parsed._id),
      id: parsed.id,
      _id: parsed._id,
      keys: Object.keys(parsed),
      timestamp: new Date().toISOString()
    });
    return parsed;
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
 * Normalize user data to ensure both id and _id fields exist
 * @param {Object} userData - Raw user data from backend
 * @returns {Object} Normalized user data
 */
export const normalizeUserData = (userData) => {
  console.log('🔐 normalizeUserData: Starting normalization:', userData);
  
  if (!userData) {
    console.error('🔐 normalizeUserData: No user data provided');
    return null;
  }
  
  // Ensure we have a valid user ID
  const userId = userData._id || userData.id;
  if (!userId) {
    console.error('🔐 normalizeUserData: No valid user ID found', userData);
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
  
  console.log('🔐 normalizeUserData: Normalization successful:', {
    userId: normalizedUser.id,
    userRole: normalizedUser.role,
    userEmail: normalizedUser.email,
    hasName: !!normalizedUser.name,
    walletBalance: normalizedUser.walletBalance
  });
  
  return normalizedUser;
};

/**
 * Get user ID from localStorage (handles both id and _id)
 * @returns {string|null} The user ID or null
 */
export const getUserId = () => {
  const userData = getCurrentUser();
  return userData ? (userData.id || userData._id) : null;
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
  
  console.log('🔐 saveAuthData: Saving authentication data:', {
    hasToken: !!token,
    hasRefreshToken: !!refreshToken,
    hasUser: !!user,
    expiresIn,
    rememberMe,
    timestamp: new Date().toISOString()
  });
  
  try {
    if (token) {
      // Set cookie FIRST for immediate middleware access
      if (typeof document !== 'undefined') {
        const expires = new Date();
        expires.setTime(expires.getTime() + (expiresIn * 1000));
        
        // FIX 2: Better cookie setting for production
        const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
        const secureFlag = (process.env.NODE_ENV === 'production' && isHttps) ? '; Secure' : '';
        
        // Simplified cookie setting to avoid domain issues
        document.cookie = `authToken=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secureFlag}`;
        console.log('🔐 saveAuthData: Cookie set immediately for middleware access');
      }
      
      // Then save to localStorage
      SecureStorage.setItem(AUTH_TOKEN_KEY, token);
      console.log('🔐 saveAuthData: Token saved to localStorage');
    }
    
    if (refreshToken) {
      SecureStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      console.log('🔐 saveAuthData: Refresh token saved to localStorage');
    }
    
    if (user) {
      // Ensure user data is properly normalized before storing
      console.log('🔐 saveAuthData: Normalizing user data:', user);
      const normalizedUser = normalizeUserData(user);
      if (normalizedUser) {
        const userDataString = JSON.stringify(normalizedUser);
        SecureStorage.setItem(USER_DATA_KEY, userDataString);
        console.log('🔐 saveAuthData: User data saved to localStorage:', {
          userDataLength: userDataString.length,
          userId: normalizedUser.id,
          userRole: normalizedUser.role
        });
      } else {
        console.error('🔐 saveAuthData: Failed to normalize user data');
        return false;
      }
    }
    
    if (expiresIn) {
      const expiryTime = Date.now() + (expiresIn * 1000);
      SecureStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
      console.log('🔐 saveAuthData: Token expiry saved to localStorage');
    }
    
    SecureStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString());
    console.log('🔐 saveAuthData: Remember me flag saved to localStorage');
    
    // Set session auth flag with a small delay to ensure it's set after other operations
    setTimeout(() => {
      if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
        try {
          sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
          console.log('🔐 Session auth flag set successfully');
        } catch (error) {
          console.warn('🔐 Session storage not available:', error.message);
        }
      }
    }, 100);
    
    // Final verification
    if (typeof window !== 'undefined') {
      const finalToken = localStorage.getItem(AUTH_TOKEN_KEY);
      const finalUser = localStorage.getItem(USER_DATA_KEY);
      console.log('🔐 saveAuthData: Final verification:', {
        hasToken: !!finalToken,
        hasUser: !!finalUser,
        tokenLength: finalToken ? finalToken.length : 0,
        userDataLength: finalUser ? finalUser.length : 0
      });
    }
    
    return true;
    
  } catch (error) {
    console.error('🔐 saveAuthData: Error saving authentication data:', error);
    return false;
  }
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
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
    }
    
    // Clear cookie for middleware access
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
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
    // Use appropriate header based on URL
    if (url.includes('/auth/') || url.includes('/api/backend/')) {
      // Backend API calls use Authorization Bearer
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // Frontend middleware uses x-auth-token
      headers['x-auth-token'] = token;
    }
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle authentication errors
    if (response.status === 401) {
      const data = await response.json().catch(() => ({}));
      
      if (data.message === 'Token expired' || data.message === 'TokenExpiredError') {
        // Try to refresh token
        const refreshed = await refreshAuthToken();
        
        if (refreshed) {
          // Retry the original request with new token
          const newToken = getAuthToken();
          if (url.includes('/auth/') || url.includes('/api/backend/')) {
            headers['Authorization'] = `Bearer ${newToken}`;
          } else {
            headers['x-auth-token'] = newToken;
          }
          
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
 * Only works in browser environment with React
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
      
      setAuth(prevAuth => {
        // Only update if the state has actually changed
        if (prevAuth.isAuthenticated === authenticated && 
            prevAuth.user === user && 
            !prevAuth.loading) {
          return prevAuth;
        }
        
        return {
          isAuthenticated: authenticated,
          user,
          loading: false
        };
      });
    };
    
    // Initial check with a small delay to ensure localStorage is ready
    setTimeout(checkAuth, 50);
    
    // Listen for storage changes (logout from another tab)
    const handleStorageChange = (e) => {
      if (e.key === AUTH_TOKEN_KEY || e.key === USER_DATA_KEY || e.key === SESSION_AUTH_KEY) {
        setTimeout(checkAuth, 10); // Small delay to ensure storage is updated
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
 * Moved to separate component file to avoid JSX parsing issues
 */
const LoadingSpinner = () => {
  // Return null for server-side rendering compatibility
  if (typeof window === 'undefined') return null;
  
  // Create DOM elements programmatically to avoid JSX
  const container = document.createElement('div');
  container.className = 'min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900';
  
  const spinnerContainer = document.createElement('div');
  spinnerContainer.className = 'relative';
  
  const outerCircle = document.createElement('div');
  outerCircle.className = 'w-20 h-20 rounded-full border-4 border-gray-200 dark:border-gray-700';
  
  const innerCircle = document.createElement('div');
  innerCircle.className = 'absolute top-0 left-0 w-20 h-20 rounded-full border-4 border-red-500 border-t-transparent animate-spin';
  
  const centerDot = document.createElement('div');
  centerDot.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
  
  const dot = document.createElement('div');
  dot.className = 'w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg animate-pulse shadow-lg shadow-red-500/25';
  
  const text = document.createElement('div');
  text.className = 'ml-4 text-gray-700 dark:text-gray-300 font-semibold';
  text.textContent = 'Authenticating...';
  
  centerDot.appendChild(dot);
  spinnerContainer.appendChild(outerCircle);
  spinnerContainer.appendChild(innerCircle);
  spinnerContainer.appendChild(centerDot);
  container.appendChild(spinnerContainer);
  container.appendChild(text);
  
  return container;
};

/**
 * Higher-Order Component for route protection
 * @param {React.Component} Component - Component to protect
 * @param {Object} options - Protection options
 * @returns {React.Component} Protected component
 */
export const withAuth = (Component, options = {}) => {
  // Check if we're in a browser environment with React
  if (typeof window === 'undefined' || typeof React === 'undefined') {
    return Component; // Return component as-is in non-React environments
  }
  
  const { 
    redirectTo = '/SignIn',
    requiredRole = null,
    fallback = LoadingSpinner 
  } = options;
  
  return function ProtectedComponent(props) {
    const { useState, useEffect } = React;
    
    // Mock router for non-Next.js environments
    const router = typeof useRouter === 'function' ? useRouter() : {
      replace: (url) => {
        if (typeof window !== 'undefined') {
          window.location.href = url;
        }
      }
    };
    
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
      return React.createElement(FallbackComponent);
    }
    
    if (!authorized) {
      return null;
    }
    
    return React.createElement(Component, { ...props, user });
  };
};

/**
 * Hook for role-based access control
 * @param {string|string[]} allowedRoles - Allowed roles
 */
export const useRoleAccess = (allowedRoles) => {
  // Check if we're in a browser environment with React
  if (typeof window === 'undefined' || typeof React === 'undefined') {
    return {
      hasAccess: false,
      userRole: null
    };
  }
  
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
  console.log('🔐 setAuthToken: Setting authentication token:', {
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
      
      // FIX 2: Better cookie setting for production
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const secureFlag = (process.env.NODE_ENV === 'production' && isHttps) ? '; Secure' : '';
      
      // Simplified cookie setting to avoid domain issues
      document.cookie = `authToken=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secureFlag}`;
      console.log('🔐 setAuthToken: Cookie set immediately for middleware access');
    }
    
    // Then save to localStorage
    const saveResult = saveAuthData({
      token,
      user,
      expiresIn
    }, rememberMe);
    
    console.log('🔐 setAuthToken: saveAuthData result:', saveResult);
    
    // Verify storage immediately
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_DATA_KEY);
      
      console.log('🔐 setAuthToken: Storage verification:', {
        hasStoredToken: !!storedToken,
        hasStoredUser: !!storedUser,
        tokenLength: storedToken ? storedToken.length : 0,
        userDataLength: storedUser ? storedUser.length : 0,
        allKeys: Object.keys(localStorage)
      });
      
      if (!storedToken || !storedUser) {
        console.error('🔐 setAuthToken: Storage verification failed');
        throw new Error('Failed to store authentication data');
      }
    }
    
    console.log('🔐 setAuthToken: Authentication data saved successfully');
    return true;
    
  } catch (error) {
    console.error('🔐 setAuthToken: Error saving authentication data:', error);
    throw error;
  }
};

/**
 * Verify authentication state after login
 * @returns {Promise<boolean>} True if authentication is properly set up
 */
export const verifyAuthState = async () => {
  if (typeof window === 'undefined') return false;
  
  return new Promise((resolve) => {
    // Check multiple times with increasing delays to ensure auth is properly set
    const checkAuthState = (attempt = 1) => {
      const token = getAuthToken();
      const user = getCurrentUser();
      const sessionAuth = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(SESSION_AUTH_KEY) : null;
      const tokenValid = !isTokenExpired();
      
      // Enhanced validation: check if user has required fields
      const hasValidUser = user && (user.id || user._id) && user.email && user.role;
      
      const isAuth = !!token && hasValidUser && tokenValid;
      
      console.log(`🔐 Auth verification attempt ${attempt}:`, {
        hasToken: !!token,
        hasUser: !!user,
        hasValidUser,
        sessionAuth,
        tokenValid,
        isAuth,
        userRole: user?.role,
        userId: user?.id || user?._id,
        timestamp: new Date().toISOString()
      });
      
      if (isAuth) {
        resolve(true);
        return;
      }
      
      // If not authenticated and we haven't exceeded max attempts, try again
      if (attempt < 5) {
        setTimeout(() => checkAuthState(attempt + 1), 100 * attempt);
      } else {
        console.warn('🔐 Auth verification failed after 5 attempts');
        resolve(false);
      }
    };
    
    checkAuthState();
  });
};

export default {
  getAuthToken,
  getRefreshToken,
  isAuthenticated,
  getCurrentUser,
  getUserRole,
  hasRole,
  normalizeUserData,
  saveAuthData,
  setAuthToken, // Add backward compatibility alias
  clearAuthData,
  logout,
  refreshAuthToken,
  authenticatedFetch,
  useAuth,
  withAuth,
  useRoleAccess,
  SessionManager,
  verifyAuthState
};