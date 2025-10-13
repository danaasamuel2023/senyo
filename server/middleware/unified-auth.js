// Unified Authentication Middleware
const jwt = require('jsonwebtoken');
const { User } = require('../schema/schema');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'DatAmArt';

/**
 * Standardized error response format
 */
const createErrorResponse = (status, message, error = null) => {
  const response = {
    success: false,
    message,
    error: error || message.toLowerCase().replace(/\s+/g, '_')
  };
  return { status, response };
};

/**
 * Enhanced authentication middleware with comprehensive error handling
 * Standardizes error responses and adds req.userId and req.userRole
 */
const authMiddleware = async (req, res, next) => {
  let token = null;
  
  try {
    // Get token from header - check both x-auth-token and Authorization header
    token = req.header('x-auth-token');
    
    // If no x-auth-token, check Authorization header
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }
    
    // If no token in header, check cookies (for frontend requests)
    if (!token && req.cookies && req.cookies.authToken) {
      token = req.cookies.authToken;
    }

    // Check if no token
    if (!token) {
      const { status, response } = createErrorResponse(401, 'No token provided, authorization denied', 'authentication_required');
      return res.status(status).json(response);
    }

    // Validate token format before attempting verification
    if (typeof token !== 'string' || token.trim() === '') {
      const { status, response } = createErrorResponse(401, 'Invalid token format', 'malformed_token');
      return res.status(status).json(response);
    }

    // Check if token has proper JWT structure (3 parts separated by dots)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.warn('Malformed JWT token detected:', {
        tokenLength: token.length,
        parts: tokenParts.length,
        tokenPreview: token.substring(0, 20) + '...'
      });
      const { status, response } = createErrorResponse(401, 'Invalid token structure', 'malformed_jwt_token');
      return res.status(status).json(response);
    }

    // Verify token with consistent secret
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find user by id
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      const { status, response } = createErrorResponse(401, 'Token is valid but user not found', 'invalid_token');
      return res.status(status).json(response);
    }

    // Attach user object and additional properties to request
    req.user = user;
    req.userId = decoded.userId;
    req.userRole = decoded.role || user.role;
    
    // Proceed to next middleware
    next();
  } catch (err) {
    // Only log non-JWT errors to reduce console spam
    if (err.name !== 'JsonWebTokenError' && err.name !== 'TokenExpiredError') {
      console.error('Auth middleware error:', err.message);
    }
    
    if (err.name === 'JsonWebTokenError') {
      console.warn('JWT verification failed:', {
        error: err.message,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'no token'
      });
      const { status, response } = createErrorResponse(401, 'Token is not valid', 'invalid_token');
      return res.status(status).json(response);
    }
    
    if (err.name === 'TokenExpiredError') {
      const { status, response } = createErrorResponse(401, 'Token has expired', 'token_expired');
      return res.status(status).json(response);
    }
    
    const { status, response } = createErrorResponse(500, 'Server error during authentication', 'server_error');
    res.status(status).json(response);
  }
};

/**
 * Admin authorization middleware
 * Must be used after authMiddleware
 */
const adminAuth = (req, res, next) => {
  if (!req.user) {
    const { status, response } = createErrorResponse(401, 'Authentication required', 'not_authenticated');
    return res.status(status).json(response);
  }
  
  if (req.user.role !== 'admin') {
    const { status, response } = createErrorResponse(403, 'Access denied. Admin privileges required.', 'insufficient_permissions');
    return res.status(status).json(response);
  }
  
  next();
};

/**
 * Agent authorization middleware
 * Must be used after authMiddleware
 */
const agentAuth = (req, res, next) => {
  if (!req.user) {
    const { status, response } = createErrorResponse(401, 'Authentication required', 'not_authenticated');
    return res.status(status).json(response);
  }
  
  if (!['admin', 'agent'].includes(req.user.role)) {
    const { status, response } = createErrorResponse(403, 'Access denied. Agent or Admin privileges required.', 'insufficient_permissions');
    return res.status(status).json(response);
  }
  
  next();
};

/**
 * Role-based authorization middleware
 * Must be used after authMiddleware
 * @param {string[]} allowedRoles - Array of allowed roles
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      const { status, response } = createErrorResponse(401, 'Authentication required', 'not_authenticated');
      return res.status(status).json(response);
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      const { status, response } = createErrorResponse(403, `Access denied. Required roles: ${allowedRoles.join(', ')}`, 'insufficient_permissions');
      return res.status(status).json(response);
    }
    
    next();
  };
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 * Useful for endpoints that work with or without authentication
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.header('x-auth-token');
    
    // If no x-auth-token, check Authorization header
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }
    
    if (token && typeof token === 'string' && token.trim() !== '') {
      // Check if token has proper JWT structure
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user) {
          req.user = user;
          req.userId = decoded.userId;
          req.userRole = decoded.role || user.role;
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

/**
 * User-specific authorization middleware
 * Ensures user can only access their own resources
 * Must be used after authMiddleware
 * @param {string} userIdParam - Name of the user ID parameter in the route (default: 'userId')
 */
const userSpecificAuth = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      const { status, response } = createErrorResponse(401, 'Authentication required', 'not_authenticated');
      return res.status(status).json(response);
    }
    
    const requestedUserId = req.params[userIdParam] || req.body[userIdParam] || req.query[userIdParam];
    
    // Admin can access any user's resources
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Users can only access their own resources
    if (req.userId !== requestedUserId) {
      const { status, response } = createErrorResponse(403, 'Access denied. You can only access your own resources.', 'insufficient_permissions');
      return res.status(status).json(response);
    }
    
    next();
  };
};

module.exports = {
  authMiddleware,
  adminAuth,
  agentAuth,
  authorize,
  optionalAuth,
  userSpecificAuth,
  createErrorResponse
};
