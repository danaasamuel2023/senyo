const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Rate limiter for general API requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // More lenient in development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost in development
    return isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1');
  }
});

// Stricter rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 5 * 1000, // 5 seconds (reduced from 1 minute)
  max: isDevelopment ? 50 : 10, // Increased from 5 to 10 for mobile users
  message: {
    success: false,
    error: 'Too many login attempts, please try again after 5 seconds.',
    details: 'Rate limit exceeded'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost in development
    return isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1');
  }
});

// Rate limiter for payment/withdrawal routes
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
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
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: isDevelopment ? 50 : 3, // More lenient in development
  message: 'Too many store modifications, please try again tomorrow.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost in development
    return isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1');
  }
});

// Very lenient rate limiter for admin routes
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 10000 : 1000, // Very lenient for admin operations
  message: 'Too many admin requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost in development
    return isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1');
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
  securityHeaders,
  sanitizeData,
};

