
// Production Monitoring Middleware
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log rotation utility
function rotateLogFile(logFile, maxSize = '10MB') {
  try {
    const stats = fs.statSync(logFile);
    const maxSizeBytes = parseInt(maxSize) * 1024 * 1024; // Convert MB to bytes
    
    if (stats.size > maxSizeBytes) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedFile = `${logFile}.${timestamp}`;
      fs.renameSync(logFile, rotatedFile);
      console.log(`Log rotated: ${logFile} -> ${rotatedFile}`);
    }
  } catch (error) {
    console.error('Log rotation error:', error.message);
  }
}

// Authentication event logger
function logAuthEvent(event, data) {
  try {
    const logFile = path.join(logsDir, 'auth-events.log');
    rotateLogFile(logFile, '10MB');
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      data,
      level: 'INFO'
    };
    
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    console.error('Auth event logging error:', error.message);
  }
}

// Performance logger
function logPerformance(operation, duration, data = {}) {
  try {
    const logFile = path.join(logsDir, 'performance.log');
    rotateLogFile(logFile, '10MB');
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      operation,
      duration,
      data,
      level: 'PERF'
    };
    
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    console.error('Performance logging error:', error.message);
  }
}

// Error logger
function logError(error, context = {}) {
  try {
    const logFile = path.join(logsDir, 'errors.log');
    rotateLogFile(logFile, '5MB');
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context,
      level: 'ERROR'
    };
    
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  } catch (logError) {
    console.error('Error logging failed:', logError.message);
  }
}

// Security event logger
function logSecurityEvent(event, data) {
  try {
    const logFile = path.join(logsDir, 'security.log');
    rotateLogFile(logFile, '5MB');
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      data,
      level: 'SECURITY'
    };
    
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    console.error('Security event logging error:', error.message);
  }
}

// Middleware performance monitor
function performanceMonitor(req, res, next) {
  const startTime = Date.now();
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    
    logPerformance('request', duration, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    });
    
    originalEnd.apply(this, args);
  };
  
  next();
}

// Authentication monitoring middleware
function authMonitor(req, res, next) {
  // Log authentication attempts
  if (req.url.includes('/login') || req.url.includes('/auth')) {
    logAuthEvent('auth_attempt', {
      url: req.url,
      method: req.method,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });
  }
  
  // Log token validation
  const token = req.header('x-auth-token') || req.header('Authorization');
  if (token) {
    logAuthEvent('token_validation', {
      url: req.url,
      method: req.method,
      hasToken: !!token,
      tokenLength: token.length
    });
  }
  
  next();
}

// Security monitoring middleware
function securityMonitor(req, res, next) {
  // Monitor for suspicious activity
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  
  // Check for common attack patterns
  const suspiciousPatterns = [
    /script/i,
    /javascript/i,
    /<script/i,
    /union.*select/i,
    /drop.*table/i,
    /insert.*into/i
  ];
  
  const url = req.url.toLowerCase();
  const body = JSON.stringify(req.body || {}).toLowerCase();
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(body)) {
      logSecurityEvent('suspicious_activity', {
        pattern: pattern.toString(),
        url: req.url,
        method: req.method,
        ip,
        userAgent,
        body: req.body
      });
      break;
    }
  }
  
  // Monitor rate limiting
  if (res.statusCode === 429) {
    logSecurityEvent('rate_limit_exceeded', {
      url: req.url,
      method: req.method,
      ip,
      userAgent
    });
  }
  
  next();
}

module.exports = {
  logAuthEvent,
  logPerformance,
  logError,
  logSecurityEvent,
  performanceMonitor,
  authMonitor,
  securityMonitor
};
