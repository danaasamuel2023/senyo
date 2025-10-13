const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Test authentication endpoint
router.get('/test-auth', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication successful',
    user: {
      id: req.userId,
      role: req.userRole,
      name: req.user?.name,
      email: req.user?.email
    },
    timestamp: new Date().toISOString()
  });
});

// Test protected route
router.get('/user/profile', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Profile access granted',
    user: {
      id: req.userId,
      role: req.userRole,
      name: req.user?.name,
      email: req.user?.email,
      walletBalance: req.user?.walletBalance
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
