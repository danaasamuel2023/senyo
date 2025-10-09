const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

// Rate limiter for general API requests - Bypassed in development
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Very high limit to effectively bypass
  message: {
    success: false,
    error: 'Rate limit exceeded',
    details: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip ALL rate limiting in development
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    
    // Skip rate limiting for health checks and admin endpoints
    if (req.path === '/api/health' || req.path.startsWith('/api/admin/')) {
      return true;
    }
    // Skip for frontend dashboard and user data requests
    if (req.path.startsWith('/api/v1/data/user-dashboard') || 
        req.path.startsWith('/api/v1/data/pricing') ||
        req.path.startsWith('/api/backend')) {
      return true;
    }
    // Skip for localhost in non-production
    if (process.env.NODE_ENV !== 'production' && 
        (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
      return true;
    }
    return false;
  }
});

// Rate limiter for authentication routes - Bypassed for development
const authLimiter = rateLimit({
  windowMs: 5 * 1000, // 5 seconds
  max: 1000, // Very high limit to effectively bypass
  message: {
    success: false,
    error: 'Rate limit exceeded',
    details: 'Too many authentication attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for ALL requests in development
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    
    // Skip rate limiting for admin login attempts
    const body = req.body;
    if (body && body.email) {
      const adminEmails = [
        'sunumanfred41@gmail.com',
        'testadmin@example.com',
        'admin@unlimiteddatagh.com'
      ];
      return adminEmails.includes(body.email);
    }
    
    // Skip for localhost in non-production
    if (process.env.NODE_ENV !== 'production' && 
        (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
      return true;
    }
    
    return false;
  }
});

// Rate limiter for payment/withdrawal routes - Bypassed in development
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10000, // Very high limit to effectively bypass
  message: 'Too many payment requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip ALL rate limiting in development
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    
    // Skip for frontend data requests
    if (req.path.startsWith('/api/v1/data/') && !req.path.includes('purchase')) {
      return true;
    }
    // Skip for localhost in non-production
    if (process.env.NODE_ENV !== 'production' && 
        (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
      return true;
    }
    return false;
  }
});

// Rate limiter for agent store creation - Bypassed in development
const agentLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10000, // Very high limit to effectively bypass
  message: 'Too many store modifications, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip ALL rate limiting in development
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    return false;
  }
});

// Very lenient rate limiter for admin routes - Bypassed in development
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Very high limit to effectively bypass
  message: {
    success: false,
    error: 'Admin rate limit exceeded',
    details: 'Too many admin requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip ALL rate limiting in development
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    
    // Skip for localhost in non-production
    if (process.env.NODE_ENV !== 'production' && 
        (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
      return true;
    }
    return false;
  }
});

// Ultra lenient rate limiter for backend proxy endpoint - Bypassed in development
const proxyLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10000, // Very high limit to effectively bypass
  message: {
    success: false,
    error: 'Proxy rate limit exceeded',
    details: 'Too many proxy requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip ALL rate limiting in development
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    return false;
  }
});

// Security headers configuration
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// MongoDB query injection prevention
const sanitizeData = mongoSanitize({
  replaceWith: '_',
});

module.exports = {
  generalLimiter,
  authLimiter,
  paymentLimiter,
  agentLimiter,
  adminLimiter,
  proxyLimiter,
  securityHeaders,
  sanitizeData,
};