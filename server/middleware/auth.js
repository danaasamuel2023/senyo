// Enhanced Authentication Middleware
const jwt = require('jsonwebtoken');
const User = require('../schema/schema').User;

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'DatAmArt';

/**
 * Enhanced authentication middleware with comprehensive error handling
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied',
        error: 'Authentication required'
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
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
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
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user) {
        req.user = user;
        req.userId = decoded.userId;
        req.userRole = decoded.role;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authMiddleware,
  adminAuth,
  agentAuth,
  optionalAuth
};
