// auth.js - Enhanced authentication routes
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { User, ReferralBonus, AgentCatalog } = require("../schema/schema");
const authMonitor = require("../monitoring/auth-monitor");
const { auth, authorize: authorizeMiddleware } = require("../middleware/auth");

dotenv.config();
const router = express.Router();

// Generate Unique Referral Code
const generateReferralCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// REGISTER ROUTE
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phoneNumber, referredBy, role, agentMetadata } = req.body;
    
    // Input validation
    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    
    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    // Check if email already exists (only email needs to be unique)
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password with stronger salt
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate Referral Code
    const referralCode = generateReferralCode();

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      referralCode,
      referredBy,
      role: role || "buyer", // Use provided role or default to buyer
      approvalStatus: role === "agent" ? "pending" : "approved", // Agents need approval
      ...(role === "agent" && agentMetadata ? { 
        agentMetadata: {
          ...agentMetadata,
          agentCode: generateReferralCode() + '-AG', // Generate unique agent code
          joinedAsAgent: new Date()
        }
      } : {})
    });

    await newUser.save();

    // Auto-create an empty agent catalog on signup to enable store setup
    if (newUser.role === 'agent') {
      try {
        await AgentCatalog.create({ agentId: newUser._id, items: [] });
      } catch (e) {
        console.error('Agent catalog creation error:', e.message);
      }
    }

    // Handle Referral Bonus
    if (referredBy) {
      const referrer = await User.findOne({ referralCode: referredBy });
      if (referrer) {
        await ReferralBonus.create({
          userId: referrer._id,
          referredUserId: newUser._id,
          amount: 5, // Set referral bonus amount
          status: "pending"
        });
      }
    }

    // Generate initial token for auto-login after registration
    const jwtSecret = process.env.JWT_SECRET || 'DatAmArt';
    if (!process.env.JWT_SECRET) {
      console.warn('WARNING: JWT_SECRET environment variable is not set, using fallback');
    }
    const token = jwt.sign(
      { userId: newUser._id },
      jwtSecret,
      { expiresIn: "7d" }
    );

    res.status(201).json({ 
      message: "User registered successfully",
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  }  catch (error) {
    if (error.code === 11000) {
      // Extract the duplicate field from the error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field === 'email' ? 'Email' : 'Field'} already registered` 
      });
    }
    // Handle other errors
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Log login attempt
    authMonitor.logAuthEvent('login_attempt', { email, ip: req.ip, userAgent: req.get('User-Agent') });

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      authMonitor.logAuthEvent('login_failure', { email, reason: 'user_not_found', ip: req.ip });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      authMonitor.logAuthEvent('login_failure', { email, reason: 'invalid_password', ip: req.ip });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT Token with user role for authorization
    const jwtSecret = process.env.JWT_SECRET || 'DatAmArt';
    if (!process.env.JWT_SECRET) {
      console.warn('WARNING: JWT_SECRET environment variable is not set, using fallback');
    }
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role 
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    // Return user info (excluding password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      walletBalance: user.walletBalance,
      referralCode: user.referralCode,
      ...(user.role === 'agent' ? { agentMetadata: user.agentMetadata } : {})
    };

    // Log successful login with enhanced details
    authMonitor.logAuthEvent('login_success', { 
      email, 
      userId: user._id, 
      role: user.role, 
      ip: req.ip,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      tokenGenerated: !!token,
      tokenLength: token ? token.length : 0
    });

    console.log('✅ Login successful:', {
      email,
      userId: user._id,
      role: user.role,
      ip: req.ip,
      timestamp: new Date().toISOString(),
      tokenGenerated: !!token
    });

    res.json({ 
      message: "Login successful", 
      token,
      user: userResponse,
      success: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Authentication middleware
const authMiddleware = (req, res, next) => {
  try {
    // Get token from header (check both x-auth-token and Authorization)
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      authMonitor.logAuthEvent('unauthorized_access', { 
        reason: 'no_token', 
        ip: req.ip, 
        path: req.path 
      });
      return res.status(401).json({ message: 'Authorization denied' });
    }
    
    // Log token validation attempt
    authMonitor.logAuthEvent('token_validation', { 
      ip: req.ip, 
      path: req.path 
    });
    
    // Verify token
    const jwtSecret = process.env.JWT_SECRET || 'DatAmArt';
    if (!process.env.JWT_SECRET) {
      console.warn('WARNING: JWT_SECRET environment variable is not set, using fallback');
    }
    const decoded = jwt.verify(token, jwtSecret);
    
    // Add user data to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    
    // Log successful token validation
    authMonitor.logAuthEvent('token_validation_success', { 
      userId: decoded.userId, 
      role: decoded.role, 
      ip: req.ip, 
      path: req.path 
    });
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'TokenExpiredError') {
      authMonitor.logAuthEvent('token_expiration', { 
        ip: req.ip, 
        path: req.path 
      });
      return res.status(401).json({ message: 'Token expired' });
    }
    
    authMonitor.logAuthEvent('token_validation_failure', { 
      reason: error.name, 
      ip: req.ip, 
      path: req.path 
    });
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Role-based authorization middleware
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  
  return (req, res, next) => {
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

// Auth check route
router.get('/me', auth, async (req, res) => {
  try {
    console.log('Debug - req.userId:', req.userId);
    console.log('Debug - req.user:', req.user);
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found', debug: { userId: req.userId } });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = { router, authMiddleware, authorize };