// DEPRECATED: utils/auth.js - Use utils/auth-manager.js instead
// This file is kept for backward compatibility but redirects to the unified auth system

console.warn('⚠️ DEPRECATED: utils/auth.js is deprecated. Use utils/auth-manager.js instead.');

// Import all functions from the unified auth manager
import {
  getAuthToken,
  getRefreshToken,
  isTokenExpired,
  isAuthenticated,
  getCurrentUser,
  getUserRole,
  normalizeUserData,
  getUserId,
  hasRole,
  saveAuthData,
  setAuthToken,
  clearAuthData,
  logout,
  refreshAuthToken,
  authenticatedFetch,
  useAuth,
  withAuth,
  useRoleAccess,
  SessionManager,
  verifyAuthState
} from './auth-manager.js';

// Re-export all functions for backward compatibility
export {
  getAuthToken,
  getRefreshToken,
  isTokenExpired,
  isAuthenticated,
  getCurrentUser,
  getUserRole,
  normalizeUserData,
  getUserId,
  hasRole,
  saveAuthData,
  setAuthToken,
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

// Default export for backward compatibility
export default {
  getAuthToken,
  getRefreshToken,
  isTokenExpired,
  isAuthenticated,
  getCurrentUser,
  getUserRole,
  normalizeUserData,
  getUserId,
  hasRole,
  saveAuthData,
  setAuthToken,
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