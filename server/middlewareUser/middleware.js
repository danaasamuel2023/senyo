// middleware/auth.js

const jwt = require('jsonwebtoken');
const { User } = require('../schema/schema');

/**
 * Middleware to verify JWT token and attach user to request
 * This should be used before the adminAuth middleware
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header - check both x-auth-token and Authorization header
    let token = req.header('x-auth-token');
    
    // If no x-auth-token, check Authorization header
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    // Check if no token
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Validate token format before attempting verification
    if (typeof token !== 'string' || token.trim() === '') {
      return res.status(401).json({ msg: 'Invalid token format' });
    }

    // Check if token has proper JWT structure (3 parts separated by dots)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.warn('Malformed JWT token detected:', {
        tokenLength: token.length,
        parts: tokenParts.length,
        tokenPreview: token.substring(0, 20) + '...'
      });
      return res.status(401).json({ msg: 'Invalid token structure' });
    }

    // Verify token with consistent secret
    const jwtSecret = process.env.JWT_SECRET || 'DatAmArt';
    const decoded = jwt.verify(token, jwtSecret);

    // Find user by id
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ msg: 'Token is valid but user not found' });
    }

    // Attach user object to request
    req.user = user;
    
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
      return res.status(401).json({ msg: 'Token is not valid' });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token has expired' });
    }
    
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = auth;