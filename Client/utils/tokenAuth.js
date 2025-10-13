/**
 * Token-based authentication utility
 * Handles JWT token generation, validation, and storage
 */

// Configuration
const CONFIG = {
  storageKey: 'senyo_auth_token',
  userKey: 'senyo_user_data',
  tokenExpiryKey: 'senyo_token_expiry',
  refreshTokenKey: 'senyo_refresh_token'
};

/**
 * Generate a JWT-like token (simplified for client-side)
 */
function generateToken(payload) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + (24 * 60 * 60), // 24 hours
    iss: 'senyo-client'
  };

  // Encode header and payload (simplified base64)
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(tokenPayload));
  
  // Create signature (simplified)
  const signature = btoa(`${encodedHeader}.${encodedPayload}.senyo-secret`);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Validate and decode token
 */
function validateToken(token) {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Invalid token format' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token structure' };
    }

    const [header, payload, signature] = parts;
    
    // Decode payload
    const decodedPayload = JSON.parse(atob(payload));
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp && decodedPayload.exp < now) {
      return { valid: false, error: 'Token expired' };
    }

    return {
      valid: true,
      payload: decodedPayload,
      header: JSON.parse(atob(header))
    };
  } catch (error) {
    return { valid: false, error: 'Token validation failed' };
  }
}

/**
 * Store authentication token and user data
 */
function storeAuthToken(token, userData) {
  if (typeof window === 'undefined') return false;
  
  try {
    const validation = validateToken(token);
    if (!validation.valid) {
      console.error('Invalid token:', validation.error);
      return false;
    }

    localStorage.setItem(CONFIG.storageKey, token);
    localStorage.setItem(CONFIG.userKey, JSON.stringify(userData));
    localStorage.setItem(CONFIG.tokenExpiryKey, validation.payload.exp.toString());
    
    console.log('✅ Auth token stored successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to store auth token:', error);
    return false;
  }
}

/**
 * Get stored authentication token
 */
function getAuthToken() {
  if (typeof window === 'undefined') return null;
  
  try {
    const token = localStorage.getItem(CONFIG.storageKey);
    if (!token) return null;

    const validation = validateToken(token);
    if (!validation.valid) {
      console.warn('Invalid stored token:', validation.error);
      clearAuthToken();
      return null;
    }

    return token;
  } catch (error) {
    console.error('❌ Failed to get auth token:', error);
    return null;
  }
}

/**
 * Get current user data
 */
function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem(CONFIG.userKey);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('❌ Failed to get user data:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  const token = getAuthToken();
  const user = getCurrentUser();
  
  return !!(token && user);
}

/**
 * Clear authentication data
 */
function clearAuthToken() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(CONFIG.storageKey);
    localStorage.removeItem(CONFIG.userKey);
    localStorage.removeItem(CONFIG.tokenExpiryKey);
    localStorage.removeItem(CONFIG.refreshTokenKey);
    
    console.log('🚪 Auth token cleared');
  } catch (error) {
    console.error('❌ Failed to clear auth token:', error);
  }
}

/**
 * Generate refresh token
 */
function generateRefreshToken() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `refresh_${timestamp}_${random}`;
}

/**
 * Store refresh token
 */
function storeRefreshToken(refreshToken) {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem(CONFIG.refreshTokenKey, refreshToken);
    return true;
  } catch (error) {
    console.error('❌ Failed to store refresh token:', error);
    return false;
  }
}

/**
 * Get refresh token
 */
function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem(CONFIG.refreshTokenKey);
  } catch (error) {
    console.error('❌ Failed to get refresh token:', error);
    return null;
  }
}

/**
 * Refresh authentication token
 */
function refreshAuthToken() {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    // Simulate token refresh (in real app, call API)
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return false;
    }

    // Generate new token
    const newToken = generateToken({
      userId: currentUser._id,
      email: currentUser.email,
      role: currentUser.role
    });

    // Store new token
    return storeAuthToken(newToken, currentUser);
  } catch (error) {
    console.error('❌ Failed to refresh auth token:', error);
    return false;
  }
}

/**
 * Get authorization header for API requests
 */
function getAuthHeader() {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/**
 * Authenticate user with credentials
 */
function authenticateUser(email, password) {
  try {
    // Validate input
    if (!email || !password) {
      return {
        success: false,
        error: 'Email and password are required'
      };
    }

    // Generate user data
    const userId = generateObjectId();
    const userData = {
      _id: userId,
      name: email.split('@')[0] || 'User',
      email: email,
      role: 'buyer',
      walletBalance: 0,
      referralCode: 'AUTH_USER',
      loginMethod: 'token-auth',
      loginTime: new Date().toISOString()
    };

    // Generate tokens
    const accessToken = generateToken({
      userId: userId,
      email: email,
      role: 'buyer'
    });

    const refreshToken = generateRefreshToken();

    // Store tokens and user data
    const tokenStored = storeAuthToken(accessToken, userData);
    const refreshStored = storeRefreshToken(refreshToken);

    if (!tokenStored || !refreshStored) {
      return {
        success: false,
        error: 'Failed to store authentication data'
      };
    }

    console.log('✅ User authenticated successfully');

    return {
      success: true,
      message: 'Authentication successful',
      token: accessToken,
      refreshToken: refreshToken,
      user: userData
    };
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

/**
 * Generate a valid MongoDB ObjectId
 */
function generateObjectId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random1 = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
  const random2 = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
  const random3 = Math.floor(Math.random() * 16777216).toString(16).padStart(4, '0');
  return (timestamp + random1 + random2 + random3).substring(0, 24);
}

/**
 * Logout user
 */
function logoutUser() {
  clearAuthToken();
  console.log('🚪 User logged out');
}

/**
 * Get user permissions based on role
 */
function getUserPermissions() {
  const user = getCurrentUser();
  if (!user) return [];

  const permissions = {
    buyer: ['view_products', 'make_purchases', 'view_orders'],
    admin: ['view_dashboard', 'manage_users', 'manage_orders', 'view_analytics'],
    agent: ['view_catalog', 'manage_inventory', 'view_sales']
  };

  return permissions[user.role] || permissions.buyer;
}

/**
 * Check if user has specific permission
 */
function hasPermission(permission) {
  const permissions = getUserPermissions();
  return permissions.includes(permission);
}

// Export functions
export {
  generateToken,
  validateToken,
  storeAuthToken,
  getAuthToken,
  getCurrentUser,
  isAuthenticated,
  clearAuthToken,
  generateRefreshToken,
  storeRefreshToken,
  getRefreshToken,
  refreshAuthToken,
  getAuthHeader,
  authenticateUser,
  logoutUser,
  getUserPermissions,
  hasPermission
};
