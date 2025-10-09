const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const ConnectDB = require('./DataBaseConnection/connection.js');
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
const storeRoutes = require('./storeRoutes/store.js')

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

dotenv.config();

// Initialize Express app
const app = express();

// Security middleware (should be first)
app.use(securityHeaders);
app.use(sanitizeData);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration - Enhanced for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://unlimitedata.onrender.com',
      'https://www.unlimitedata.onrender.com',
      'https://unlimiteddatagh.com',
      'https://www.unlimiteddatagh.com'
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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'x-auth-token'],
  exposedHeaders: ['x-auth-token', 'x-ratelimit-limit', 'x-ratelimit-remaining'],
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Connect to Database
ConnectDB();

// Routes with specific rate limiters
// Auth routes with stricter rate limiting
app.use('/api/v1', authLimiter, authRouter); // Use the router property

// Payment-related routes with payment limiter
app.use('/api/v1/data', paymentLimiter, dataOrderRoutes);
app.use('/api/v1', paymentLimiter, Deposit);
app.use('/api/v1', paymentLimiter, DepositeMorle);

// Mobile Money Deposit routes
const MobileMoneyDeposit = require('./DepositeRoutes/MobileMoneyDeposit');
app.use('/api/v1', paymentLimiter, MobileMoneyDeposit);

// Other routes
app.use('/api/developer', Developer)
app.use('/api/v1', HubnetAt);
// app.use('/api',AdminManagement) // Commented out to avoid conflicts
app.use('/api/v1/admin', adminLimiter, AdminManagement)
app.use('/api/v1', passreset);
app.use('/api/reports', Report);
app.use('/api', approveuser)
app.use('/api', registerFriend);
app.use('/api', bulkUpload);
app.use('/api/v1', userStats);
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
app.use('/api/v1/admin', adminLimiter, adminAgentRoutes);
app.use('/api/v1/admin', adminLimiter, bulkMessagingRoutes);
app.use('/api/v1/admin', adminLimiter, packageManagementRoutes);
const agentApprovalRoutes = require('./adminRoutes/agentApproval');
app.use('/api/admin/agents', adminLimiter, agentApprovalRoutes);
const productAssignmentRoutes = require('./adminRoutes/productAssignment');
app.use('/api/admin/products', adminLimiter, productAssignmentRoutes);
const adminDashboardRoutes = require('./adminRoutes/dashboard');
const adminV1Routes = require('./adminRoutes/adminV1Routes');
const paymentGatewaySettingsRoutes = require('./adminRoutes/paymentGatewaySettings');
app.use('/api/v1/admin', adminLimiter, adminDashboardRoutes);
app.use('/api/v1/admin', adminLimiter, adminV1Routes);
app.use('/api/v1/admin', adminLimiter, paymentGatewaySettingsRoutes);
app.use('/api/store', storeRoutes);

// BulkClix withdrawal and deposit routes
const withdrawalRoutes = require('./walletRoutes/withdrawals');
const mobileMoneyDepositRoutes = require('./walletRoutes/mobileMoneyDeposits');
app.use('/api/wallet', withdrawalRoutes);
app.use('/api/wallet', mobileMoneyDepositRoutes);

// Direct admin API endpoints - proxy to v1 endpoints
app.use('/api/admin/orders', (req, res, next) => {
  req.url = req.url.replace('/api/admin/orders', '/api/v1/admin/orders');
  next();
});

app.use('/api/admin/transactions', (req, res, next) => {
  req.url = req.url.replace('/api/admin/transactions', '/api/v1/admin/transactions');
  next();
});

app.use('/api/admin/statistics', (req, res, next) => {
  req.url = req.url.replace('/api/admin/statistics', '/api/v1/admin/dashboard/statistics');
  next();
});

app.use('/api/admin/daily-summary', (req, res, next) => {
  req.url = req.url.replace('/api/admin/daily-summary', '/api/v1/admin/dashboard/daily-summary');
  next();
});

// Legacy endpoint handlers - redirect to admin endpoints
app.get('/api/transactions', (req, res) => {
  res.redirect(301, '/api/admin/transactions');
});

app.get('/api/transactions/:id', (req, res) => {
  res.redirect(301, `/api/admin/transactions/${req.params.id}`);
});

app.put('/api/transactions/:id/update-status', (req, res) => {
  res.redirect(301, `/api/admin/transactions/${req.params.id}/update-status`);
});

// Legacy orders endpoints
app.get('/api/orders', (req, res) => {
  res.redirect(301, '/api/admin/orders');
});

app.put('/api/orders/:id/status', (req, res) => {
  res.redirect(301, `/api/admin/orders/${req.params.id}/status`);
});

// Legacy users endpoints
app.get('/api/users', (req, res) => {
  res.redirect(301, '/api/admin/users');
});

app.get('/api/users/:id', (req, res) => {
  res.redirect(301, `/api/admin/users/${req.params.id}`);
});

// Legacy dashboard endpoints
app.get('/api/dashboard/statistics', (req, res) => {
  res.redirect(301, '/api/admin/dashboard/statistics');
});

app.get('/api/dashboard/daily-summary', (req, res) => {
  res.redirect(301, '/api/admin/daily-summary');
});

// Legacy daily-summary endpoint (direct)
app.get('/api/daily-summary', (req, res) => {
  res.redirect(301, '/api/admin/daily-summary');
});

// Legacy inventory endpoints
app.get('/api/inventory', (req, res) => {
  res.redirect(301, '/api/admin/inventory');
});

app.get('/api/inventory/:network', (req, res) => {
  res.redirect(301, `/api/admin/inventory/${req.params.network}`);
});

app.put('/api/inventory/:network/toggle', (req, res) => {
  res.redirect(301, `/api/admin/inventory/${req.params.network}/toggle`);
});

app.put('/api/inventory/:network/toggle-geonettech', (req, res) => {
  res.redirect(301, `/api/admin/inventory/${req.params.network}/toggle-geonettech`);
});

// Additional legacy endpoints that might be called
app.get('/api/user-orders/:userId', (req, res) => {
  res.redirect(301, `/api/admin/user-orders/${req.params.userId}`);
});

app.get('/api/verify-paystack/:reference', (req, res) => {
  res.redirect(301, `/api/admin/verify-paystack/${req.params.reference}`);
});

app.post('/api/orders/bulk-status-update', (req, res) => {
  res.redirect(301, '/api/admin/orders/bulk-status-update');
});

// Backend proxy endpoint handler - Enhanced with proper error handling
app.get('/api/backend', proxyLimiter, (req, res, next) => {
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Default Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});