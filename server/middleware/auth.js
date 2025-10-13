// Enhanced Authentication Middleware
const jwt = require('jsonwebtoken');
const User = require('../schema/schema').User;

// JWT Secret - use environment variable for security
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
 */
const auth = async (req, res, next) => {
  let token = null;
  
  try {
    // Get token from header or cookies
    token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
    
    // If no token in header, check cookies (for frontend requests)
    if (!token && req.cookies && req.cookies.authToken) {
      token = req.cookies.authToken;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied',
        error: 'Authentication required'
      });
    }

    // Validate token format before attempting verification
    if (typeof token !== 'string' || token.trim() === '') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format',
        error: 'Malformed token'
      });
    }

    // Check if token has proper JWT structure (3 parts separated by dots)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.warn('Malformed JWT token detected:', {
        tokenLength: token.length,
        parts: tokenParts.length,
        tokenPreview: token.substring(0, 20) + '...'
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid token structure',
        error: 'Malformed JWT token'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid - user not found',
        error: 'Invalid token'
      });
    }

    // Add user to request object
    req.user = user;
    req.userId = decoded.userId;
    req.userRole = decoded.role || user.role;
    
    next();
  } catch (error) {
    // Only log non-JWT errors to reduce console spam
    if (error.name !== 'JsonWebTokenError' && error.name !== 'TokenExpiredError') {
      console.error('Auth middleware error:', error);
    }
    
    if (error.name === 'JsonWebTokenError') {
      console.warn('JWT verification failed:', {
        error: error.message,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'no token'
      });
      return res.status(401).json({
        success: false,
        message: 'Token is not valid',
        error: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        error: 'Token expired'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: error.message
    });
  }
};

/**
 * Admin authorization middleware
 */
const adminAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: 'Not authenticated'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
      error: 'Insufficient permissions'
    });
  }
  
  next();
};

/**
 * Agent authorization middleware
 */
const agentAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: 'Not authenticated'
    });
  }
  
  if (!['admin', 'agent'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Agent or Admin privileges required.',
      error: 'Insufficient permissions'
    });
  }
  
  next();
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
    
    if (token && typeof token === 'string' && token.trim() !== '') {
      // Check if token has proper JWT structure
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user) {
          req.user = user;
          req.userId = decoded.userId;
          req.userRole = decoded.role;
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  auth,
  adminAuth,
  agentAuth,
  authorize,
  optionalAuth,
  userSpecificAuth,
  createErrorResponse
};
