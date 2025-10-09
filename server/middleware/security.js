const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === undefined;

// Debug logging
console.log('🔧 Environment Debug:', {
  NODE_ENV: process.env.NODE_ENV,
  isDevelopment,
  isProduction
});

// Rate limiter for general API requests - COMPLETELY DISABLED FOR PRODUCTION
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: isDevelopment ? 1000 : 1000000, // Extremely high limit for production
  message: {
    success: false,
    error: 'Rate limit exceeded',
    details: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // COMPLETELY DISABLE RATE LIMITING FOR PRODUCTION
    if (isProduction) {
      console.log('🔧 General rate limiting DISABLED for production');
      return true;
    }
    // Skip rate limiting for localhost in development
    if (isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
      return true;
    }
    return false;
  }
});

// Rate limiter for authentication routes - DISABLED FOR PRODUCTION
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: isDevelopment ? 10 : 100000, // Very high limit for production
  message: {
    success: false,
    error: 'Rate limit exceeded',
    details: 'Too many authentication attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // COMPLETELY DISABLE rate limiting for production authentication
    if (isProduction) {
      console.log('🔧 Auth rate limiting DISABLED for production');
      return true;
    }
    // Skip rate limiting for localhost in development
    if (isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
      return true;
    }
    return false;
  }
});

// Rate limiter for payment/withdrawal routes
const paymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: isDevelopment ? 100 : 20, // More lenient in development
  message: 'Too many payment requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost in development
    return isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1');
  }
});

// Rate limiter for agent store creation
const agentLimiter = rateLimit({
  windowMs: 1* 60 * 1000, // 1 minutes
  max: isDevelopment ? 50 : 3, // More lenient in development
  message: 'Too many store modifications, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost in development
    return isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1');
  }
});

// Very lenient rate limiter for admin routes - DISABLED FOR PRODUCTION
const adminLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: isDevelopment ? 10000 : 100000, // Extremely high limit for production admin operations
  message: {
    success: false,
    error: 'Admin rate limit exceeded',
    details: 'Too many admin requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost in development
    if (isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
      return true;
    }
    // COMPLETELY DISABLE rate limiting for production admin operations
    if (isProduction) {
      console.log('🔧 Admin rate limiting DISABLED for production');
      return true;
    }
    return false;
  }
});

// Ultra lenient rate limiter for backend proxy endpoint
const proxyLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: isDevelopment ? 1000 : 500, // Very high limit for proxy requests
  message: {
    success: false,
    error: 'Proxy rate limit exceeded',
    details: 'Too many proxy requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost in development
    if (isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
      return true;
    }
    // Skip rate limiting for production
    if (isProduction) {
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

