// middleware/auth.js

const jwt = require('jsonwebtoken');
const { User } = require('../schema/schema');

/**
 * Middleware to verify JWT token and attach user to request
 * This should be used before the adminAuth middleware
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token with environment secret
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ msg: 'Server JWT misconfiguration' });
    }
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
    console.error('Auth middleware error:', err.message);
    
    if (err.name === 'JsonWebTokenError') {
      if (err.message === 'jwt malformed') {
        return res.status(401).json({ msg: 'Invalid token format' });
      }
      return res.status(401).json({ msg: 'Token is not valid' });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token has expired' });
    }
    
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = auth;