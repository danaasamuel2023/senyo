const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

// Rate limiter for general API requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Rate limit exceeded',
    details: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and admin endpoints
    if (req.path === '/api/health' || req.path.startsWith('/api/admin/')) {
      return true;
    }
    // Skip for localhost in development
    if (process.env.NODE_ENV !== 'production' && 
        (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
      return true;
    }
    return false;
  }
});

// Rate limiter for authentication routes - Skip for admin users
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 auth requests per windowMs (increased for testing)
  message: {
    success: false,
    error: 'Rate limit exceeded',
    details: 'Too many authentication attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
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
    // Skip for localhost in development
    if (process.env.NODE_ENV !== 'production' && 
        (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
      return true;
    }
    return false;
  }
});

// Rate limiter for payment/withdrawal routes
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 payment requests per windowMs
  message: 'Too many payment requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip for localhost in development
    if (process.env.NODE_ENV !== 'production' && 
        (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
      return true;
    }
    return false;
  }
});

// Rate limiter for agent store creation
const agentLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // limit each IP to 3 store modifications per windowMs
  message: 'Too many store modifications, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Very lenient rate limiter for admin routes
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 admin requests per windowMs
  message: {
    success: false,
    error: 'Admin rate limit exceeded',
    details: 'Too many admin requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip for localhost in development
    if (process.env.NODE_ENV !== 'production' && 
        (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
      return true;
    }
    return false;
  }
});

// Ultra lenient rate limiter for backend proxy endpoint
const proxyLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 proxy requests per windowMs
  message: {
    success: false,
    error: 'Proxy rate limit exceeded',
    details: 'Too many proxy requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
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