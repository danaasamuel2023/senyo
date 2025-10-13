const express = require('express');
// EMERGENCY REDEPLOY: 2025-10-11T09:57:37.823Z - CRITICAL: Load new routes immediately

// FORCE REDEPLOY: 2025-10-11T09:51:39.900Z - Loading new wallet and webhook routes

// Redeploy triggered: 2025-10-11T09:40:25.909Z

// ADMIN ROUTES DEPLOYMENT FIX: 2025-10-13T01:31:00.000Z - Fix 404 errors for admin endpoints

const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const compression = require('compression');
const ConnectDB = require('./DataBaseConnection/connection.js');
const { DataPurchase, Transaction, User } = require('./schema/schema');
// Either import just the router or destructure it from the object
const authRouter = require('./AuthRoutes/Auth.js').router || require('./AuthRoutes/Auth.js'); 
const dataOrderRoutes = require('./orderRou/order.js');
const Deposit = require('./DepositeRoutes/UserDeposite.js');
const Developer = require('./ResellerApi/resellerApi.js')
const HubnetAt = require('./HubnetInteraction/hubnet.js');
const AdminManagement = require('./admin-management/adminManagemet.js')
const passreset = require('./ResetPasword/reset.js')
const Report = require('./Reporting/reporting.js')
const DepositeMorle = require('./DepositeMoorle/moorle.js')
const approveuser = require('./adim-aprove/approve.js')
const registerFriend = require('./regsterFreinds/register.js')
const bulkUpload = require('./bulkPurchase/bulk.js')
const userStats = require('./userInfo/userInfo.js')
const adminOrder = require('./allOrders/allorders.js')
const waiting_orders_export = require('./waitingorders/waiting.js')
const phoneVerification = require('./PhoneVerifyRoutes/Verification.js')
const settingsRoutes = require('./settingsRoutes/settings.js')
const agentRoutes = require('./agentRoutes/agentManagement.js')
const agentStoreRoutes = require('./agentRoutes/agentStoreManagement.js')
const agentDashboardRoutes = require('./agentRoutes/agentDashboard.js')
const reviewRoutes = require('./reviewRoutes/reviews.js')
const paymentRoutes = require('./paymentRoutes/payments.js')
const adminAgentRoutes = require('./adminRoutes/agentManagement.js')
const bulkMessagingRoutes = require('./adminRoutes/bulkMessaging.js')
const packageManagementRoutes = require('./adminRoutes/packageManagement.js')
const priceManagementRoutes = require('./adminRoutes/priceManagement.js')
const notificationSystemRoutes = require('./adminRoutes/notificationSystem.js')
const storeRoutes = require('./storeRoutes/store.js')
const paystackWebhookRoutes = require('./routes/paystackWebhook');
const testDataMartRoutes = require('./test-datamart-endpoint.js');

// New feature routes
const walletRoutes = require('./walletRoutes/wallet.js')
const referralRoutes = require('./referralRoutes/referral.js')
const twoFactorRoutes = require('./AuthRoutes/twoFactor.js')
const promoRoutes = require('./promoRoutes/promo.js')

// Security middleware
const { 
  generalLimiter, 
  authLimiter,
  paymentLimiter,
  agentLimiter,
  adminLimiter,
  proxyLimiter,
  securityHeaders,
  sanitizeData 
} = require('./middleware/security.js');

// Error handling middleware
const { errorHandler, asyncHandler } = require('./middleware/errorHandler.js');

// Authentication middleware
const { authMiddleware, adminAuth, agentAuth, optionalAuth } = require('./middleware/auth.js');

dotenv.config();

// Validate environment variables
const { validateEnvironment } = require('./utils/envValidation.js');
validateEnvironment();

// Initialize Express app
const app = express();

// Enable response compression for better performance
app.use(compression({
  level: 6, // Compression level (1-9, 6 is good balance)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression for all other responses
    return compression.filter(req, res);
  }
}));

// CRITICAL: Define basic routes BEFORE any middleware
// Simple test route to verify routing works
app.get('/test', (req, res) => {
  res.json({ success: true, message: 'Test route working', timestamp: new Date().toISOString() });
});

// Another test route
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API test route working', timestamp: new Date().toISOString() });
});

// Environment check endpoint
app.get('/env-check', (req, res) => {
  res.json({
    success: true,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING',
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'MISSING',
      PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY ? 'SET' : 'MISSING',
      FRONTEND_URL: process.env.FRONTEND_URL || 'NOT_SET',
      EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'MISSING',
      EMAIL_PASS: process.env.EMAIL_PASS ? 'SET' : 'MISSING'
    },
    timestamp: new Date().toISOString()
  });
});

// Debug route to check if server is running latest code
app.get('/debug', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Debug route working', 
    timestamp: new Date().toISOString(),
    version: 'ca97e1b',
    routes: ['/test', '/api/test', '/api/health', '/api/admin/statistics'],
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING',
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'MISSING',
      PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY ? 'SET' : 'MISSING',
      FRONTEND_URL: process.env.FRONTEND_URL || 'NOT_SET'
    }
  });
});

// Security middleware (should be first)
app.use(securityHeaders);
app.use(sanitizeData);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS configuration - Enhanced for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://unlimitedata.onrender.com',
      'https://www.unlimitedata.onrender.com',
      'https://unlimiteddatagh.com',
      'https://www.unlimiteddatagh.com',
      'https://senyo-frontend-gr8zusaid-danaasamuel2023s-projects.vercel.app',
      'https://senyo-frontend.vercel.app',
      'https://vercel.app',
      'https://*.vercel.app'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // For now, allow all origins to fix CORS issues
      console.log('CORS: Allowing origin:', origin);
      callback(null, true);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'x-auth-token', 'X-Request-ID'],
  exposedHeaders: ['x-auth-token', 'x-ratelimit-limit', 'x-ratelimit-remaining'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Catch-all OPTIONS handler for all routes
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  console.log('Catch-all OPTIONS request for:', req.url, 'from origin:', origin);
  
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token, X-Request-ID, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Max-Age', '86400');
  res.header('Access-Control-Expose-Headers', 'x-auth-token, x-ratelimit-limit, x-ratelimit-remaining');
  
  res.status(204).send();
});

// Global CORS middleware to ensure headers are always set
app.use((req, res, next) => {
  // Set CORS headers for all responses
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://unlimitedata.onrender.com',
    'https://www.unlimitedata.onrender.com',
    'https://unlimiteddatagh.com',
    'https://www.unlimiteddatagh.com'
  ];
  
  // Allow the origin if it's in the allowed list, or allow all for now
  if (allowedOrigins.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token, X-Request-ID, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Max-Age', '86400');
  res.header('Access-Control-Expose-Headers', 'x-auth-token, x-ratelimit-limit, x-ratelimit-remaining');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('CORS Preflight request for:', req.url, 'from origin:', origin);
    res.status(204).send();
    return;
  }
  
  next();
});

// Specific CORS middleware for user dashboard endpoint (before rate limiting)
app.use('/api/v1/data/user-dashboard/:userId', (req, res, next) => {
  const origin = req.headers.origin;
  console.log('User Dashboard CORS middleware - Origin:', origin, 'URL:', req.url);
  
  // Set specific CORS headers for user dashboard
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token, X-Request-ID, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Max-Age', '86400');
  res.header('Access-Control-Expose-Headers', 'x-auth-token');
  
  // Handle preflight requests specifically
  if (req.method === 'OPTIONS') {
    console.log('User Dashboard OPTIONS request handled');
    res.status(204).send();
    return;
  }
  
  next();
});

// Connect to Database
// Initialize database connection
(async () => {
  try {
    await ConnectDB();
    console.log('✅ Database connection initialized');
  } catch (error) {
    console.error('❌ Failed to initialize database connection:', error);
    process.exit(1);
  }
})();

// CRITICAL: Define specific routes BEFORE any middleware that might intercept them
// MOVED TO TOP TO AVOID MIDDLEWARE INTERFERENCE

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

// Test User model endpoint
app.get('/api/test-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`[TEST] Looking for user with ID: ${userId}`);
    console.log(`[TEST] Database connection state:`, mongoose.connection.readyState);
    console.log(`[TEST] User model:`, typeof User);
    console.log(`[TEST] User model name:`, User.modelName);
    console.log(`[TEST] Database name:`, mongoose.connection.name);
    
    // Wait for database connection if not ready
    if (mongoose.connection.readyState !== 1) {
      console.log(`[TEST] Waiting for database connection...`);
      await new Promise((resolve) => {
        if (mongoose.connection.readyState === 1) {
          resolve();
        } else {
          mongoose.connection.once('connected', resolve);
        }
      });
    }
    
    // Test with different queries
    console.log(`[TEST] Testing User.findById...`);
    const user = await User.findById(userId);
    console.log(`[TEST] User found:`, !!user);
    
    if (!user) {
      console.log(`[TEST] User not found, testing User.find()...`);
      const allUsers = await User.find({});
      console.log(`[TEST] Total users found:`, allUsers.length);
      allUsers.forEach(u => console.log(`[TEST] - ${u.name} (${u.email}) (${u._id})`));
    }
    
    if (user) {
      res.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          phoneNumber: user.phoneNumber,
          role: user.role,
          walletBalance: user.walletBalance
        }
      });
    } else {
      res.json({
        success: false,
        error: 'User not found'
      });
    }
  } catch (error) {
    console.error('[TEST] Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Balance update check endpoint for real-time updates
app.get('/api/balance-update/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if there's a pending balance update for this user
    if (global.balanceUpdateEvents && global.balanceUpdateEvents.has(userId)) {
      const updateEvent = global.balanceUpdateEvents.get(userId);
      global.balanceUpdateEvents.delete(userId); // Remove after sending
      
      return res.json({
        success: true,
        hasUpdate: true,
        data: updateEvent
      });
    }
    
    return res.json({
      success: true,
      hasUpdate: false,
      message: 'No pending balance updates'
    });
  } catch (error) {
    console.error('Balance update check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check balance updates'
    });
  }
});

// Statistics endpoint
app.get('/api/admin/statistics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await DataPurchase.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await DataPurchase.countDocuments({
      createdAt: { $gte: today }
    });
    
    res.json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        todayOrders
      }
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

// Temporary direct inventory endpoint to fix 404 error
app.get('/api/v1/admin/inventory', async (req, res) => {
  try {
    // Ensure database connection is ready
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database not ready'
      });
    }
    
    const { DataInventory } = require('./schema/schema');
    const inventoryItems = await DataInventory.find({}).sort({ network: 1 });
    
    // Predefined networks
    const NETWORKS = ["YELLO", "TELECEL", "AT_PREMIUM", "airteltigo", "at"];
    
    // Create response with all networks (create missing ones with defaults)
    const inventory = NETWORKS.map(network => {
      const existingItem = inventoryItems.find(item => item.network === network);
      
      if (existingItem) {
        return {
          network: existingItem.network,
          inStock: existingItem.inStock,
          skipGeonettech: existingItem.skipGeonettech || false,
          updatedAt: existingItem.updatedAt
        };
      } else {
        return {
          network,
          inStock: true, // Default to in stock
          skipGeonettech: false, // Default to API enabled
          updatedAt: null
        };
      }
    });
    
    res.json({
      inventory,
      totalNetworks: NETWORKS.length,
      message: 'Inventory data retrieved successfully'
    });
  } catch (err) {
    console.error('Error fetching inventory:', err.message);
    res.status(500).json({
      error: 'Server Error',
      message: err.message
    });
  }
});

// Pricing endpoint
app.get('/api/v1/data/pricing', async (req, res) => {
  try {
    // Mock pricing data - replace with actual pricing logic
    const pricing = {
      MTN: [
        { size: '100MB', price: 5, validity: '1 day' },
        { size: '500MB', price: 15, validity: '7 days' },
        { size: '1GB', price: 25, validity: '30 days' }
      ],
      Airtel: [
        { size: '100MB', price: 4, validity: '1 day' },
        { size: '500MB', price: 12, validity: '7 days' },
        { size: '1GB', price: 20, validity: '30 days' }
      ],
      Glo: [
        { size: '100MB', price: 6, validity: '1 day' },
        { size: '500MB', price: 18, validity: '7 days' },
        { size: '1GB', price: 30, validity: '30 days' }
      ]
    };
    
    res.json({
      success: true,
      data: pricing
    });
  } catch (error) {
    console.error('Pricing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pricing'
    });
  }
});

// Direct daily-summary endpoint handler
app.get('/api/admin/daily-summary/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    // Get daily orders
    const dailyOrders = await DataPurchase.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Get daily revenue
    const dailyRevenueData = await DataPurchase.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);
    
    const dailyRevenue = dailyRevenueData.length > 0 ? dailyRevenueData[0].totalRevenue : 0;
    
    // Get daily deposits
    const dailyDeposits = await Transaction.countDocuments({
      type: 'deposit',
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Get network breakdown (mock data for now)
    const networkBreakdown = [
      { network: 'MTN', orders: Math.floor(dailyOrders * 0.4), revenue: Math.floor(dailyRevenue * 0.4) },
      { network: 'Airtel', orders: Math.floor(dailyOrders * 0.3), revenue: Math.floor(dailyRevenue * 0.3) },
      { network: 'Glo', orders: Math.floor(dailyOrders * 0.2), revenue: Math.floor(dailyRevenue * 0.2) },
      { network: '9mobile', orders: Math.floor(dailyOrders * 0.1), revenue: Math.floor(dailyRevenue * 0.1) }
    ];
    
    res.json({
      success: true,
      data: {
        summary: {
          totalOrders: dailyOrders,
          totalRevenue: dailyRevenue,
          totalDeposits: dailyDeposits
        },
        networkBreakdown
      }
    });
  } catch (error) {
    console.error('Daily summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily summary'
    });
  }
});

// Handle daily-summary endpoint without date parameter (default to today)
app.get('/api/admin/daily-summary', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  req.params = { date: today };
  // Redirect to the parameterized version
  return app._router.handle(req, res, () => {});
});

// Apply general rate limiting to all routes - DISABLED IN DEVELOPMENT
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
if (process.env.NODE_ENV !== 'development') {
  console.log('🚫 Rate limiting ENABLED');
  app.use(generalLimiter);
} else {
  console.log('✅ Rate limiting DISABLED for development');
}

// Routes with specific rate limiters - DISABLED IN DEVELOPMENT
// Auth routes with stricter rate limiting
if (process.env.NODE_ENV !== 'development') {
  console.log('🚫 Auth rate limiting ENABLED');
  app.use('/api/v1', authLimiter, authRouter); // Use the router property
} else {
  console.log('✅ Auth rate limiting DISABLED for development');
  app.use('/api/v1', authRouter); // No rate limiting in development
}

// Payment-related routes with payment limiter - DISABLED IN DEVELOPMENT
if (process.env.NODE_ENV !== 'development') {
  app.use('/api/v1/data', paymentLimiter, dataOrderRoutes);
  app.use('/api/v1', paymentLimiter, Deposit);
} else {
  app.use('/api/v1/data', dataOrderRoutes);
  app.use('/api/v1', Deposit);
}

// Specific CORS handler for user dashboard endpoint
app.options('/api/v1/data/user-dashboard/:userId', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token, X-Request-ID');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  res.status(204).send();
});

// CORS middleware for user dashboard GET requests
app.use('/api/v1/data/user-dashboard/:userId', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token, X-Request-ID');
  next();
});

// Direct route handler for user dashboard to ensure it's accessible
app.get('/api/v1/data/user-dashboard/:userId', (req, res, next) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token, X-Request-ID');
  
  // Forward to the actual route handler
  next();
});
// DISABLED RATE LIMITING IN DEVELOPMENT
if (process.env.NODE_ENV !== 'development') {
  app.use('/api/v1', paymentLimiter, DepositeMorle);
} else {
  app.use('/api/v1', DepositeMorle);
}

// Mobile Money Deposit routes
const MobileMoneyDeposit = require('./DepositeRoutes/MobileMoneyDeposit');
if (process.env.NODE_ENV !== 'development') {
  app.use('/api/v1', paymentLimiter, MobileMoneyDeposit);
} else {
  app.use('/api/v1', MobileMoneyDeposit);
}

// Other routes
app.use('/api/developer', Developer)
// Consolidated API routes to prevent conflicts
app.use('/api/v1', HubnetAt);
app.use('/api/v1', passreset);
app.use('/api/v1', userStats);
app.use('/api/v1', paystackWebhookRoutes);

// Create a consolidated admin router to avoid conflicts
const adminRouter = express.Router();

// Import paymentGatewaySettingsRoutes here to avoid circular dependency
const paymentGatewaySettingsRoutes = require('./adminRoutes/paymentGatewaySettings.js');
const performanceMonitoringRoutes = require('./adminRoutes/performanceMonitoring.js');
const customerSupportRoutes = require('./adminRoutes/customerSupport.js');
const marketingToolsRoutes = require('./adminRoutes/marketingTools.js');
const contentManagementRoutes = require('./adminRoutes/contentManagement.js');
const inventoryManagementRoutes = require('./adminRoutes/inventoryManagement.js');
const businessProcessAutomationRoutes = require('./adminRoutes/businessProcessAutomation.js');
const thirdPartyIntegrationsRoutes = require('./adminRoutes/thirdPartyIntegrations.js');
const mobileAdminAppRoutes = require('./adminRoutes/mobileAdminApp.js');
const adminV1Routes = require('./adminRoutes/adminV1Routes');

// Mount all admin routes on the consolidated router
adminRouter.use('/', AdminManagement);
adminRouter.use('/bulk-messaging', bulkMessagingRoutes);
adminRouter.use('/', packageManagementRoutes);
adminRouter.use('/', priceManagementRoutes);
adminRouter.use('/notifications', notificationSystemRoutes);
adminRouter.use('/', paymentGatewaySettingsRoutes);
adminRouter.use('/performance', performanceMonitoringRoutes);
adminRouter.use('/support', customerSupportRoutes);
adminRouter.use('/marketing', marketingToolsRoutes);
adminRouter.use('/content', contentManagementRoutes);
adminRouter.use('/advanced-inventory', inventoryManagementRoutes);
adminRouter.use('/automation', businessProcessAutomationRoutes);
adminRouter.use('/integrations', thirdPartyIntegrationsRoutes);
adminRouter.use('/mobile', mobileAdminAppRoutes);
adminRouter.use('/', adminV1Routes);

// DISABLED ADMIN RATE LIMITING IN DEVELOPMENT
if (process.env.NODE_ENV !== 'development') {
  app.use('/api/v1/admin', adminLimiter, adminRouter);
} else {
  app.use('/api/v1/admin', adminRouter);
}

app.use('/api/reports', Report);
app.use('/api', approveuser);
app.use('/api', registerFriend);
app.use('/api', bulkUpload);
app.use('/api', adminOrder);
app.use('/api/orders', waiting_orders_export);
app.use('/api/verifications', phoneVerification);
app.use('/api/user', settingsRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/agent', agentStoreRoutes);
app.use('/api/agent', agentDashboardRoutes);
const agentWithdrawalRoutes = require('./agentRoutes/withdrawals');
app.use('/api/agent', agentWithdrawalRoutes);
app.use('/api/public', agentRoutes);

// New feature routes
app.use('/api/wallet', walletRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/2fa', twoFactorRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
const agentPaymentRoutes = require('./paymentRoutes/agentPayments');
app.use('/api/agent/payments', agentPaymentRoutes);
// DISABLED ALL ADMIN RATE LIMITING IN DEVELOPMENT
// Note: These routes are now handled by AdminManagement router to avoid conflicts

const agentApprovalRoutes = require('./adminRoutes/agentApproval');
const productAssignmentRoutes = require('./adminRoutes/productAssignment');
const adminDashboardRoutes = require('./adminRoutes/dashboard');

// Note: Admin routes are now consolidated to avoid conflicts
// Individual admin routes should be registered within AdminManagement router
app.use('/api/store', storeRoutes);
app.use('/api/test-datamart', testDataMartRoutes);

// BulkClix withdrawal and deposit routes
const withdrawalRoutes = require('./walletRoutes/withdrawals');
const mobileMoneyDepositRoutes = require('./walletRoutes/mobileMoneyDeposits');
app.use('/api/wallet', withdrawalRoutes);
app.use('/api/wallet', mobileMoneyDepositRoutes);

// Direct admin API endpoints - proxy to v1 endpoints
// Note: Removed proxy middleware to prevent circular redirects


// Legacy endpoint handlers - redirect to v1 admin endpoints
app.get('/api/transactions', (req, res) => {
  res.redirect(301, '/api/v1/admin/transactions');
});

app.get('/api/transactions/:id', (req, res) => {
  res.redirect(301, `/api/v1/admin/transactions/${req.params.id}`);
});

app.put('/api/transactions/:id/update-status', (req, res) => {
  res.redirect(301, `/api/v1/admin/transactions/${req.params.id}/update-status`);
});

// Legacy orders endpoints
app.get('/api/orders', (req, res) => {
  res.redirect(301, '/api/v1/admin/orders');
});

app.put('/api/orders/:id/status', (req, res) => {
  res.redirect(301, `/api/v1/admin/orders/${req.params.id}/status`);
});

// Legacy users endpoints
app.get('/api/users', (req, res) => {
  res.redirect(301, '/api/v1/admin/users');
});

app.get('/api/users/:id', (req, res) => {
  res.redirect(301, `/api/v1/admin/users/${req.params.id}`);
});

// Legacy dashboard endpoints
app.get('/api/dashboard/statistics', (req, res) => {
  res.redirect(301, '/api/v1/admin/dashboard/statistics');
});

app.get('/api/dashboard/daily-summary', (req, res) => {
  res.redirect(301, '/api/v1/admin/daily-summary');
});

// Legacy daily-summary endpoint (direct)
app.get('/api/daily-summary', (req, res) => {
  res.redirect(301, '/api/v1/admin/daily-summary');
});

// Legacy inventory endpoints
app.get('/api/inventory', (req, res) => {
  res.redirect(301, '/api/v1/admin/inventory');
});

app.get('/api/inventory/:network', (req, res) => {
  res.redirect(301, `/api/v1/admin/inventory/${req.params.network}`);
});

app.put('/api/inventory/:network/toggle', (req, res) => {
  res.redirect(301, `/api/v1/admin/inventory/${req.params.network}/toggle`);
});

app.put('/api/inventory/:network/toggle-geonettech', (req, res) => {
  res.redirect(301, `/api/v1/admin/inventory/${req.params.network}/toggle-geonettech`);
});

// Additional legacy endpoints that might be called
app.get('/api/user-orders/:userId', (req, res) => {
  res.redirect(301, `/api/v1/admin/user-orders/${req.params.userId}`);
});

app.get('/api/verify-paystack/:reference', (req, res) => {
  res.redirect(301, `/api/v1/admin/verify-paystack/${req.params.reference}`);
});

app.post('/api/orders/bulk-status-update', (req, res) => {
  res.redirect(301, '/api/v1/admin/orders/bulk-status-update');
});

// Backend proxy endpoint handler - MOVED TO END TO AVOID CONFLICTS

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Enhanced Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'connected', // Will be updated with actual DB health check
        redis: 'disconnected', // Will be updated with actual Redis health check
        externalAPIs: 'unknown' // Will be updated with actual API health checks
      },
      performance: {
        responseTime: Date.now() - req.startTime || 0,
        activeConnections: process._getActiveHandles().length,
        activeRequests: process._getActiveRequests().length
      }
    };

    // Check database health
    try {
      await mongoose.connection.db.admin().ping();
      health.services.database = 'connected';
    } catch (error) {
      health.services.database = 'disconnected';
      health.status = 'degraded';
    }

    // Check Redis health (if available)
    try {
      const redisService = require('./services/redisService');
      if (redisService.isConnected) {
        health.services.redis = 'connected';
      }
    } catch (error) {
      health.services.redis = 'disconnected';
    }

    // Check external APIs
    try {
      // Test DataMart API
      const axios = require('axios');
      await axios.get('https://api.datamartgh.shop/', { timeout: 5000 });
      health.services.externalAPIs = 'connected';
    } catch (error) {
      health.services.externalAPIs = 'disconnected';
      health.status = 'degraded';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Default Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Backend proxy endpoint handler - DISABLED RATE LIMITING IN DEVELOPMENT
app.get('/api/backend', (req, res, next) => {
  const { path } = req.query;
  if (!path) {
    return res.status(400).json({ 
      success: false,
      error: 'Path parameter is required' 
    });
  }
  
  try {
    // Decode the path and forward the request
    const decodedPath = decodeURIComponent(path);
    console.log('Backend proxy request:', decodedPath);
    
    // Add CORS headers for proxy requests
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Forward to the actual endpoint
    req.url = decodedPath;
    app._router.handle(req, res);
  } catch (error) {
    console.error('Backend proxy error:', error);
    res.status(500).json({
      success: false,
      error: 'Proxy request failed',
      message: error.message
    });
  }
});

// 404 handler (should be last)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Trigger redeploy - fix pricing validation
// Force redeploy - Sun Oct 12 03:29:10 GMT 2025
// Final deployment trigger - Sun Oct 12 03:32:16 GMT 2025
// Force redeploy - Sun Oct 12 03:32:59 GMT 2025
// Clean redeploy - Sun Oct 12 03:34:58 GMT 2025
// Emergency redeploy - Sun Oct 12 03:35:30 GMT 2025
// Clean redeploy - Sun Oct 12 03:39:22 GMT 2025
