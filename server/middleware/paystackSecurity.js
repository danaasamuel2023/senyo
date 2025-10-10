const crypto = require('crypto');
const mongoose = require('mongoose');

// Rate limiting for payment endpoints
const paymentRateLimiter = {};
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = process.env.NODE_ENV === 'development' ? 50 : 5;

// Track suspicious activities
const suspiciousActivities = {};
const SUSPICIOUS_THRESHOLD = 10;
const BLOCK_DURATION = 3600000; // 1 hour

/**
 * Rate limiting middleware for payment endpoints
 */
const rateLimitPayments = (req, res, next) => {
  const identifier = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  // Skip rate limiting for localhost in development
  if (process.env.NODE_ENV === 'development' && 
      (identifier === '127.0.0.1' || identifier === '::1' || identifier === '::ffff:127.0.0.1')) {
    return next();
  }

  if (!paymentRateLimiter[identifier]) {
    paymentRateLimiter[identifier] = [];
  }

  // Clean old entries
  paymentRateLimiter[identifier] = paymentRateLimiter[identifier].filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW
  );

  // Check rate limit
  if (paymentRateLimiter[identifier].length >= MAX_REQUESTS_PER_WINDOW) {
    console.log(`[SECURITY] ⚠️ Rate limit exceeded for IP: ${identifier}`);
    trackSuspiciousActivity(identifier, 'rate_limit_exceeded');
    
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((RATE_LIMIT_WINDOW - (now - paymentRateLimiter[identifier][0])) / 1000)
    });
  }

  // Add current request
  paymentRateLimiter[identifier].push(now);
  next();
};

/**
 * Verify Paystack webhook signature
 */
const verifyPaystackSignature = (paystackSecretKey) => {
  return (req, res, next) => {
    const hash = crypto
      .createHmac('sha512', paystackSecretKey)
      .update(JSON.stringify(req.body))
      .digest('hex');

    const signature = req.headers['x-paystack-signature'];

    if (hash !== signature) {
      console.log('[SECURITY] ❌ Invalid Paystack webhook signature');
      console.log('[SECURITY] Expected:', hash.substring(0, 20) + '...');
      console.log('[SECURITY] Received:', signature?.substring(0, 20) + '...');
      
      trackSuspiciousActivity(req.ip, 'invalid_webhook_signature');
      
      return res.status(401).json({
        error: 'Invalid signature'
      });
    }

    console.log('[SECURITY] ✅ Paystack webhook signature verified');
    next();
  };
};

/**
 * Validate deposit amount to prevent fraud
 */
const validateDepositAmount = (req, res, next) => {
  const { amount, totalAmountWithFee } = req.body;
  
  console.log(`[SECURITY] validateDepositAmount called:`, { 
    amount, 
    totalAmountWithFee, 
    type: typeof amount,
    ip: req.ip 
  });

  // Minimum and maximum limits
  const MIN_DEPOSIT = 10;
  const MAX_DEPOSIT = 10000;

  if (!amount || amount < MIN_DEPOSIT) {
    console.log(`[SECURITY] ❌ Deposit amount too low: ${amount} (min: ${MIN_DEPOSIT})`);
    return res.status(400).json({
      success: false,
      error: `Minimum deposit is GHS ${MIN_DEPOSIT}`
    });
  }

  if (amount > MAX_DEPOSIT) {
    console.log(`[SECURITY] ⚠️ Large deposit attempt: ${amount} from IP: ${req.ip}`);
    trackSuspiciousActivity(req.ip, 'large_deposit_attempt', { amount });
    
    return res.status(400).json({
      success: false,
      error: `Maximum deposit is GHS ${MAX_DEPOSIT}`
    });
  }

  // Validate amount is a valid number
  if (isNaN(parseFloat(amount)) || !isFinite(amount)) {
    console.log(`[SECURITY] ❌ Invalid amount format: ${amount}`);
    return res.status(400).json({
      success: false,
      error: 'Invalid amount format'
    });
  }

  // Validate fee calculation
  if (totalAmountWithFee) {
    const expectedFee = amount * 0.02; // 2% fee
    const expectedTotal = amount + expectedFee;
    const tolerance = 0.5; // Allow 50 pesewas difference

    if (Math.abs(totalAmountWithFee - expectedTotal) > tolerance) {
      console.log(`[SECURITY] ⚠️ Fee manipulation attempt detected`);
      console.log(`[SECURITY] Expected: ${expectedTotal}, Received: ${totalAmountWithFee}`);
      
      trackSuspiciousActivity(req.ip, 'fee_manipulation', {
        expected: expectedTotal,
        received: totalAmountWithFee
      });
      
      return res.status(400).json({
        success: false,
        error: 'Invalid amount calculation'
      });
    }
  }

  console.log(`[SECURITY] ✅ Deposit amount validated: GHS ${amount}`);
  next();
};

/**
 * Prevent duplicate transactions
 */
const preventDuplicateDeposits = (Transaction) => {
  return async (req, res, next) => {
    const { userId } = req.body;
    
    // Validate userId is a valid ObjectId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      console.log(`[SECURITY] ❌ Invalid userId format: ${userId}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format'
      });
    }
    
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Check for recent pending deposits from this user
    const recentDeposit = await Transaction.findOne({
      userId,
      type: 'deposit',
      status: 'pending',
      createdAt: { $gte: fiveMinutesAgo }
    });

    if (recentDeposit) {
      console.log(`[SECURITY] ⚠️ Duplicate deposit attempt from user: ${userId}`);
      console.log(`[SECURITY] Existing pending transaction: ${recentDeposit.reference}`);
      
      return res.status(429).json({
        success: false,
        error: 'You have a pending deposit. Please wait 5 minutes before trying again.',
        existingReference: recentDeposit.reference
      });
    }

    next();
  };
};

/**
 * Track suspicious activities
 */
function trackSuspiciousActivity(identifier, type, details = {}) {
  if (!suspiciousActivities[identifier]) {
    suspiciousActivities[identifier] = {
      count: 0,
      activities: [],
      blockedUntil: null
    };
  }

  const activity = suspiciousActivities[identifier];
  activity.count++;
  activity.activities.push({
    type,
    details,
    timestamp: new Date()
  });

  console.log(`[SECURITY] Suspicious activity tracked: ${type} from ${identifier} (Count: ${activity.count})`);

  // Block if threshold exceeded
  if (activity.count >= SUSPICIOUS_THRESHOLD) {
    activity.blockedUntil = Date.now() + BLOCK_DURATION;
    console.log(`[SECURITY] ⛔ IP ${identifier} BLOCKED for ${BLOCK_DURATION / 60000} minutes`);
  }

  // Clean old activities (keep last 24 hours)
  const oneDayAgo = Date.now() - 86400000;
  activity.activities = activity.activities.filter(
    a => new Date(a.timestamp).getTime() > oneDayAgo
  );
}

/**
 * Check if IP is blocked
 */
const checkBlocked = (req, res, next) => {
  const identifier = req.ip || req.connection.remoteAddress;
  
  // Allow localhost for development/testing
  if (identifier === '127.0.0.1' || identifier === '::1' || identifier === '::ffff:127.0.0.1' || identifier === 'localhost') {
    return next();
  }
  
  const activity = suspiciousActivities[identifier];

  if (activity && activity.blockedUntil && Date.now() < activity.blockedUntil) {
    const remainingMinutes = Math.ceil((activity.blockedUntil - Date.now()) / 60000);
    
    console.log(`[SECURITY] ⛔ Blocked IP attempted access: ${identifier}`);
    
    return res.status(403).json({
      success: false,
      error: 'Your IP has been temporarily blocked due to suspicious activity',
      blockedFor: `${remainingMinutes} minutes`,
      contact: 'support@www.unlimiteddatagh.com'
    });
  }

  next();
};

/**
 * Validate transaction reference format
 */
const validateReference = (req, res, next) => {
  let reference = req.query.reference || req.body.reference || req.params.reference;

  if (!reference) {
    return res.status(400).json({
      success: false,
      error: 'Transaction reference is required'
    });
  }

  // Fix duplicate reference issue - take only the first one if comma-separated
  if (reference && reference.includes(',')) {
    const originalReference = reference;
    reference = reference.split(',')[0].trim();
    console.log(`[SECURITY] 🔧 Fixed duplicate reference: ${originalReference} → ${reference}`);
    
    // Update the request with the cleaned reference
    if (req.query.reference) req.query.reference = reference;
    if (req.body.reference) req.body.reference = reference;
    if (req.params.reference) req.params.reference = reference;
  }

  // Validate reference format (should start with DEP-, MOMO-, TRX-, PAY-, or REF-)
  // More flexible regex to handle different reference lengths
  const validFormats = /^(DEP|MOMO|TRX|PAY|REF)-[a-f0-9]+-\d+$/;
  
  if (!validFormats.test(reference)) {
    console.log(`[SECURITY] ⚠️ Invalid reference format: ${reference}`);
    
    // Only track suspicious activity for non-localhost IPs in production
    if (process.env.NODE_ENV === 'production' && req.ip !== '127.0.0.1' && req.ip !== '::1') {
      trackSuspiciousActivity(req.ip, 'invalid_reference_format', { reference });
    }
    
    return res.status(400).json({
      success: false,
      error: 'Invalid transaction reference format',
      message: 'Please ensure the payment reference is valid and try again'
    });
  }

  next();
};

/**
 * Sanitize input to prevent injection attacks
 */
const sanitizeInput = (req, res, next) => {
  // Check for common attack patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /\$\{/,
    /`/,
    /%3Cscript/i
  ];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      for (const pattern of dangerousPatterns) {
        if (pattern.test(value)) {
          return true;
        }
      }
    }
    return false;
  };

  // Check all request parameters
  const allParams = { ...req.body, ...req.query, ...req.params };
  
  for (const [key, value] of Object.entries(allParams)) {
    if (checkValue(value)) {
      console.log(`[SECURITY] ❌ Dangerous input detected in ${key}: ${value}`);
      trackSuspiciousActivity(req.ip, 'injection_attempt', { key, value });
      
      return res.status(400).json({
        success: false,
        error: 'Invalid input detected'
      });
    }
  }

  next();
};

/**
 * Log all payment activities for audit trail
 */
const auditLog = (action) => {
  return (req, res, next) => {
    const logData = {
      timestamp: new Date().toISOString(),
      action,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.body.userId || req.user?.id,
      reference: req.query.reference || req.body.reference
    };

    console.log(`[AUDIT] ${action}:`, JSON.stringify(logData, null, 2));
    next();
  };
};

module.exports = {
  rateLimitPayments,
  verifyPaystackSignature,
  validateDepositAmount,
  preventDuplicateDeposits,
  checkBlocked,
  validateReference,
  sanitizeInput,
  auditLog,
  trackSuspiciousActivity
};
